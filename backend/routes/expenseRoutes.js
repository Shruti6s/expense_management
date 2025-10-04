const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createExpense,
  uploadReceipt,
  getMyExpenses,
  getPendingApprovals,
  approveOrRejectExpense,
  getAllExpenses
} = require('../controllers/expenseController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only Images (JPG, PNG), PDF, and Excel files are allowed!');
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', auth, createExpense);
router.post('/upload-receipt', auth, upload.single('receipt'), uploadReceipt);
router.get('/my-expenses', auth, getMyExpenses);
router.get('/pending-approvals', auth, authorize('manager', 'admin'), getPendingApprovals);
router.put('/approvals/:approvalId', auth, authorize('manager', 'admin'), approveOrRejectExpense);
router.get('/all', auth, authorize('admin'), getAllExpenses);

module.exports = router;
