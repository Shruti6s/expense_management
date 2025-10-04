const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApprovalWorkflow = sequelize.define('ApprovalWorkflow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  approvalRuleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'approval_rules',
      key: 'id'
    }
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Sequence order of approval'
  },
  isRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'approval_workflows',
  indexes: [
    {
      unique: true,
      fields: ['approvalRuleId', 'stepNumber']
    }
  ]
});

module.exports = ApprovalWorkflow;
