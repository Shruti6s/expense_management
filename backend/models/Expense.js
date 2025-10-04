const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  convertedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Amount converted to company currency'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  expenseDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'in_review'),
    defaultValue: 'pending'
  },
  currentApproverStep: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Current step in approval workflow'
  },
  merchantName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Extracted from OCR'
  },
  createdBy: {
    type: DataTypes.ENUM('Manual', 'AI'),
    defaultValue: 'Manual',
    comment: 'How the expense was created'
  },
  expenseType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Type of expense (Meal, Flight, Hotel, etc.)'
  }
}, {
  timestamps: true,
  tableName: 'expenses'
});

module.exports = Expense;
