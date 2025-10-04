const { Expense, User, Company, Approval, ApprovalRule, ApprovalWorkflow } = require('../models');
const { convertCurrency } = require('../utils/currencyConverter');
const { extractReceiptData } = require('../utils/ocrProcessor');
const path = require('path');

const createExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, expenseDate } = req.body;

    // Get company currency
    const company = await Company.findByPk(req.user.companyId);

    // Convert amount to company currency if different
    let convertedAmount = amount;
    if (currency !== company.currency) {
      convertedAmount = await convertCurrency(amount, currency, company.currency);
    }

    const expense = await Expense.create({
      employeeId: req.user.id,
      companyId: req.user.companyId,
      amount,
      currency,
      convertedAmount,
      category,
      description,
      expenseDate: expenseDate || new Date(),
      status: 'pending'
    });

    // Initialize approval workflow
    await initializeApprovalWorkflow(expense, req.user);

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Error creating expense', details: error.message });
  }
};

const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    // Validate file type
    const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.xlsx', '.xls'];
    if (!validExtensions.includes(fileExt)) {
      return res.status(400).json({
        error: 'Invalid file type. Only PDF, Images (JPG, PNG), and Excel files are allowed.'
      });
    }

    let fileType = 'image';
    if (fileExt === '.pdf') fileType = 'PDF';
    else if (fileExt === '.xlsx' || fileExt === '.xls') fileType = 'Excel';

    // Process with AI
    const extractedData = await extractReceiptData(filePath, fileType);

    // Get company currency for conversion
    const company = await Company.findByPk(req.user.companyId);

    const createdExpenses = [];

    // Create expenses from AI extracted data
    for (const expenseData of extractedData.expenses) {
      const amount = expenseData.amount || 0;
      const currency = expenseData.currency || 'USD';

      let convertedAmount = amount;
      if (currency !== company.currency) {
        try {
          convertedAmount = await convertCurrency(amount, currency, company.currency);
        } catch (convErr) {
          console.error('Currency conversion failed:', convErr);
          convertedAmount = amount;
        }
      }

      const expense = await Expense.create({
        employeeId: req.user.id,
        companyId: req.user.companyId,
        amount,
        currency,
        convertedAmount,
        category: expenseData.category || 'General',
        description: expenseData.description || 'AI extracted expense',
        expenseDate: expenseData.date || new Date(),
        receiptUrl: filePath,
        merchantName: expenseData.merchantName || 'Unknown Merchant',
        expenseType: expenseData.expenseType,
        createdBy: 'AI',
        status: 'pending'
      });

      // Initialize approval workflow for each expense
      await initializeApprovalWorkflow(expense, req.user);

      createdExpenses.push(expense);
    }

    res.status(201).json({
      message: `✅ Successfully created ${createdExpenses.length} expense(s) from ${fileType} using AI`,
      count: createdExpenses.length,
      expenses: createdExpenses,
      source: 'AI'
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({ error: 'Error processing receipt', details: error.message });
  }
};

const initializeApprovalWorkflow = async (expense, employee) => {
  try {
    // Get active approval rules for the company
    const rules = await ApprovalRule.findAll({
      where: { companyId: employee.companyId, isActive: true },
      order: [['priority', 'DESC']],
      include: [{ model: ApprovalWorkflow, as: 'workflows', include: [{ model: User, as: 'approver' }] }]
    });

    if (rules.length === 0) {
      // No rules, check if manager approval is needed
      if (employee.managerId) {
        await Approval.create({
          expenseId: expense.id,
          approverId: employee.managerId,
          status: 'pending',
          stepNumber: 1
        });
        expense.currentApproverStep = 1;
        expense.status = 'in_review';
        await expense.save();
      }
      return;
    }

    // Use the highest priority rule
    const rule = rules[0];

    if (rule.isManagerApprover && employee.managerId) {
      // Manager approval first
      await Approval.create({
        expenseId: expense.id,
        approverId: employee.managerId,
        status: 'pending',
        stepNumber: 0
      });
      expense.currentApproverStep = 0;
    }

    // Create approvals based on workflows
    if (rule.workflows && rule.workflows.length > 0) {
      for (const workflow of rule.workflows) {
        await Approval.create({
          expenseId: expense.id,
          approverId: workflow.approverId,
          status: 'pending',
          stepNumber: workflow.stepNumber
        });
      }
    }

    expense.status = 'in_review';
    await expense.save();
  } catch (error) {
    console.error('Initialize approval workflow error:', error);
    throw error;
  }
};

const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { employeeId: req.user.id },
      include: [
        { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Approval, as: 'approvals', include: [{ model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ expenses });
  } catch (error) {
    console.error('Get my expenses error:', error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const approvals = await Approval.findAll({
      where: { approverId: req.user.id, status: 'pending' },
      include: [
        {
          model: Expense,
          as: 'expense',
          include: [
            { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ approvals });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Error fetching approvals' });
  }
};

const approveOrRejectExpense = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { status, comments } = req.body;

    const approval = await Approval.findByPk(approvalId, {
      include: [{ model: Expense, as: 'expense' }]
    });

    if (!approval || approval.approverId !== req.user.id) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({ error: 'Approval already processed' });
    }

    approval.status = status;
    approval.comments = comments;
    approval.approvedAt = new Date();
    await approval.save();

    const expense = approval.expense;

    if (status === 'rejected') {
      expense.status = 'rejected';
      await expense.save();
    } else if (status === 'approved') {
      // Check if this is the last approval needed
      const allApprovals = await Approval.findAll({ where: { expenseId: expense.id } });
      const nextPendingApproval = allApprovals.find(
        a => a.stepNumber > approval.stepNumber && a.status === 'pending'
      );

      if (!nextPendingApproval) {
        expense.status = 'approved';
      } else {
        expense.currentApproverStep = nextPendingApproval.stepNumber;
      }
      await expense.save();
    }

    res.json({
      message: `Expense ${status} successfully`,
      approval,
      expense
    });
  } catch (error) {
    console.error('Approve/Reject expense error:', error);
    res.status(500).json({ error: 'Error processing approval' });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { companyId: req.user.companyId },
      include: [
        { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Approval, as: 'approvals', include: [{ model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ expenses });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ error: 'Error fetching expenses' });
  }
};

module.exports = {
  createExpense,
  uploadReceipt,
  getMyExpenses,
  getPendingApprovals,
  approveOrRejectExpense,
  getAllExpenses
};
