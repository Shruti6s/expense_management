const { User, Company } = require('../models');

const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, managerId } = req.body;

    // Only admin can create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // If manager is assigned, verify manager exists
    if (managerId) {
      const manager = await User.findByPk(managerId);
      if (!manager || manager.role !== 'manager') {
        return res.status(400).json({ error: 'Invalid manager ID' });
      }
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee',
      companyId: req.user.companyId,
      managerId: managerId || null
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        managerId: user.managerId
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { companyId: req.user.companyId },
      include: [
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, managerId, isActive } = req.body;

    // Only admin can update users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update users' });
    }

    const user = await User.findByPk(userId);
    if (!user || user.companyId !== req.user.companyId) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (role) user.role = role;
    if (managerId !== undefined) user.managerId = managerId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        managerId: user.managerId,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
};

const getManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      where: {
        companyId: req.user.companyId,
        role: 'manager',
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email']
    });

    res.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Error fetching managers' });
  }
};

module.exports = { createUser, getAllUsers, updateUser, getManagers };
