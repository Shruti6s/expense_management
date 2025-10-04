const express = require('express');
const { createUser, getAllUsers, updateUser, getManagers } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('admin'), createUser);
router.get('/', auth, getAllUsers);
router.put('/:userId', auth, authorize('admin'), updateUser);
router.get('/managers', auth, getManagers);

module.exports = router;
