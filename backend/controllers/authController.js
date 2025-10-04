const jwt = require('jsonwebtoken');
const { User, Company } = require('../models');
const axios = require('axios');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Get currency for the selected country
    let currency = 'USD';
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countryData = response.data.find(c =>
        c.name.common.toLowerCase() === country.toLowerCase() ||
        c.name.official.toLowerCase() === country.toLowerCase()
      );

      if (countryData && countryData.currencies) {
        currency = Object.keys(countryData.currencies)[0];
      }
    } catch (error) {
      console.error('Error fetching country currency:', error.message);
    }

    // Create company
    const company = await Company.create({
      name: companyName,
      currency: currency,
      country: country
    });

    // Create admin user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      companyId: company.id,
      isActive: true
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId
      },
      company: {
        id: company.id,
        name: company.name,
        currency: company.currency,
        country: company.country
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Company, as: 'company' }]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Company, as: 'company' },
        { model: User, as: 'manager', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      attributes: { exclude: ['password'] }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

module.exports = { signup, login, getProfile };
