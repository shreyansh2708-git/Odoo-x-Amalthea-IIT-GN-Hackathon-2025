const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
  body('companyName').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role')
];

// @route   POST /api/auth/register
// @desc    Register a new user and create company
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, companyName, currency } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    const company = new Company({
      name: companyName,
      currency: currency.toUpperCase()
    });
    await company.save();

    const user = new User({
      name,
      email,
      password,
      role,
      companyId: company._id
    });
    await user.save();

    const token = generateToken(user._id);
    await user.populate('companyId');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId._id,
        company: {
          id: user.companyId._id,
          name: user.companyId.name,
          currency: user.companyId.currency
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('companyId');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or account deactivated' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: 'Invalid role for this account' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId._id,
        company: {
          id: user.companyId._id,
          name: user.companyId.name,
          currency: user.companyId.currency
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('companyId');
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId._id,
        managerId: user.managerId,
        company: {
          id: user.companyId._id,
          name: user.companyId.name,
          currency: user.companyId.currency
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private (requires a valid or recently expired token)
router.post('/refresh', authenticate, async (req, res) => {
  try {
    // The `authenticate` middleware has already verified the user.
    // We just need to issue a new token.
    const token = generateToken(req.user._id);
    
    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      message: 'Server error during token refresh'
    });
  }
});


// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router;
