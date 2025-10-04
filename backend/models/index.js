const { sequelize } = require('../config/database');
const Company = require('./Company');
const User = require('./User');
const Expense = require('./Expense');
const ApprovalRule = require('./ApprovalRule');
const ApprovalWorkflow = require('./ApprovalWorkflow');
const Approval = require('./Approval');

// Define associations
Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

User.hasMany(User, { foreignKey: 'managerId', as: 'subordinates' });
User.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

Company.hasMany(Expense, { foreignKey: 'companyId', as: 'expenses' });
Expense.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

User.hasMany(Expense, { foreignKey: 'employeeId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

Company.hasMany(ApprovalRule, { foreignKey: 'companyId', as: 'approvalRules' });
ApprovalRule.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

ApprovalRule.belongsTo(User, { foreignKey: 'specificApproverId', as: 'specificApprover' });

ApprovalRule.hasMany(ApprovalWorkflow, { foreignKey: 'approvalRuleId', as: 'workflows' });
ApprovalWorkflow.belongsTo(ApprovalRule, { foreignKey: 'approvalRuleId', as: 'approvalRule' });

User.hasMany(ApprovalWorkflow, { foreignKey: 'approverId', as: 'approvalWorkflows' });
ApprovalWorkflow.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });

Expense.hasMany(Approval, { foreignKey: 'expenseId', as: 'approvals' });
Approval.belongsTo(Expense, { foreignKey: 'expenseId', as: 'expense' });

User.hasMany(Approval, { foreignKey: 'approverId', as: 'approvals' });
Approval.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });

module.exports = {
  sequelize,
  Company,
  User,
  Expense,
  ApprovalRule,
  ApprovalWorkflow,
  Approval
};
