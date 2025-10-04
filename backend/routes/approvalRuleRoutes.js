const express = require('express');
const {
  createApprovalRule,
  getApprovalRules,
  updateApprovalRule,
  deleteApprovalRule
} = require('../controllers/approvalRuleController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('admin'), createApprovalRule);
router.get('/', auth, getApprovalRules);
router.put('/:ruleId', auth, authorize('admin'), updateApprovalRule);
router.delete('/:ruleId', auth, authorize('admin'), deleteApprovalRule);

module.exports = router;
