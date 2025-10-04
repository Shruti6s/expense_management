const { ApprovalRule, ApprovalWorkflow, User } = require('../models');

const createApprovalRule = async (req, res) => {
  try {
    const {
      name,
      ruleType,
      percentageRequired,
      specificApproverId,
      isManagerApprover,
      workflows,
      priority
    } = req.body;

    // Only admin can create approval rules
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create approval rules' });
    }

    const rule = await ApprovalRule.create({
      companyId: req.user.companyId,
      name,
      ruleType,
      percentageRequired: ruleType === 'percentage' || ruleType === 'hybrid' ? percentageRequired : null,
      specificApproverId: ruleType === 'specific_approver' || ruleType === 'hybrid' ? specificApproverId : null,
      isManagerApprover: isManagerApprover !== undefined ? isManagerApprover : true,
      isActive: true,
      priority: priority || 0
    });

    // Create workflows if provided
    if (workflows && workflows.length > 0) {
      for (const workflow of workflows) {
        await ApprovalWorkflow.create({
          approvalRuleId: rule.id,
          approverId: workflow.approverId,
          stepNumber: workflow.stepNumber,
          isRequired: workflow.isRequired !== undefined ? workflow.isRequired : true
        });
      }
    }

    const ruleWithWorkflows = await ApprovalRule.findByPk(rule.id, {
      include: [
        {
          model: ApprovalWorkflow,
          as: 'workflows',
          include: [{ model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email'] }]
        },
        { model: User, as: 'specificApprover', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    res.status(201).json({
      message: 'Approval rule created successfully',
      rule: ruleWithWorkflows
    });
  } catch (error) {
    console.error('Create approval rule error:', error);
    res.status(500).json({ error: 'Error creating approval rule', details: error.message });
  }
};

const getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.findAll({
      where: { companyId: req.user.companyId },
      include: [
        {
          model: ApprovalWorkflow,
          as: 'workflows',
          include: [{ model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email'] }]
        },
        { model: User, as: 'specificApprover', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({ rules });
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ error: 'Error fetching approval rules' });
  }
};

const updateApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const { isActive, priority, workflows } = req.body;

    // Only admin can update approval rules
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update approval rules' });
    }

    const rule = await ApprovalRule.findByPk(ruleId);
    if (!rule || rule.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'Approval rule not found' });
    }

    if (isActive !== undefined) rule.isActive = isActive;
    if (priority !== undefined) rule.priority = priority;

    await rule.save();

    // Update workflows if provided
    if (workflows) {
      // Delete existing workflows
      await ApprovalWorkflow.destroy({ where: { approvalRuleId: rule.id } });

      // Create new workflows
      for (const workflow of workflows) {
        await ApprovalWorkflow.create({
          approvalRuleId: rule.id,
          approverId: workflow.approverId,
          stepNumber: workflow.stepNumber,
          isRequired: workflow.isRequired !== undefined ? workflow.isRequired : true
        });
      }
    }

    const updatedRule = await ApprovalRule.findByPk(rule.id, {
      include: [
        {
          model: ApprovalWorkflow,
          as: 'workflows',
          include: [{ model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName', 'email'] }]
        }
      ]
    });

    res.json({
      message: 'Approval rule updated successfully',
      rule: updatedRule
    });
  } catch (error) {
    console.error('Update approval rule error:', error);
    res.status(500).json({ error: 'Error updating approval rule' });
  }
};

const deleteApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;

    // Only admin can delete approval rules
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete approval rules' });
    }

    const rule = await ApprovalRule.findByPk(ruleId);
    if (!rule || rule.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'Approval rule not found' });
    }

    // Delete associated workflows
    await ApprovalWorkflow.destroy({ where: { approvalRuleId: rule.id } });

    // Delete rule
    await rule.destroy();

    res.json({ message: 'Approval rule deleted successfully' });
  } catch (error) {
    console.error('Delete approval rule error:', error);
    res.status(500).json({ error: 'Error deleting approval rule' });
  }
};

module.exports = {
  createApprovalRule,
  getApprovalRules,
  updateApprovalRule,
  deleteApprovalRule
};
