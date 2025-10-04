const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApprovalRule = sequelize.define('ApprovalRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ruleType: {
    type: DataTypes.ENUM('percentage', 'specific_approver', 'hybrid', 'sequential'),
    allowNull: false,
    defaultValue: 'sequential'
  },
  percentageRequired: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'For percentage rule - e.g., 60 means 60%'
  },
  specificApproverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'For specific approver rule'
  },
  isManagerApprover: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether manager approval is required first'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Higher priority rules are evaluated first'
  }
}, {
  timestamps: true,
  tableName: 'approval_rules'
});

module.exports = ApprovalRule;
