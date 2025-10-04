const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, authorize, authorizeCompany } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
  body('managerId').optional().isMongoId().withMessage('Invalid manager ID')
];

const updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('role').optional().isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
  body('managerId').optional().isMongoId().withMessage('Invalid manager ID'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
];

// @route   GET /api/users
// @desc    Get all users in company
// @access  Private (Admin, Manager)
router.get('/', authenticate, authorize('admin', 'manager'), authorizeCompany, async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;
    
    const query = { companyId: req.user.companyId };
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const users = await User.find(query)
      .populate('managerId', 'name email')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin, Manager, Self)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user can access this user's data
    const canAccess = 
      req.user._id.toString() === id ||
      req.user.role === 'admin' ||
      req.user.role === 'manager';
    
    if (!canAccess) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }
    
    const user = await User.findById(id)
      .populate('managerId', 'name email')
      .populate('companyId', 'name currency')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Check if user belongs to same company
    if (user.companyId._id.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error while fetching user'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), authorizeCompany, createUserValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, managerId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await User.findOne({ 
        _id: managerId, 
        companyId: req.user.companyId,
        role: 'manager'
      });
      if (!manager) {
        return res.status(400).json({
          message: 'Invalid manager selected'
        });
      }
    }

    const user = new User({
      name,
      email,
      password,
      role,
      companyId: req.user.companyId,
      managerId: managerId || null
    });

    await user.save();
    await user.populate('managerId', 'name email');

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        companyId: user.companyId,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      message: 'Server error while creating user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin, Self for limited fields)
router.put('/:id', authenticate, updateUserValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;
    
    // Check if user can update this user
    const canUpdate = 
      req.user._id.toString() === id ||
      req.user.role === 'admin';
    
    if (!canUpdate) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if user belongs to same company
    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // If not admin, limit what can be updated
    if (req.user.role !== 'admin') {
      const allowedFields = ['name', 'email'];
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      Object.assign(user, filteredUpdates);
    } else {
      // Admin can update all fields
      Object.assign(user, updates);
    }

    await user.save();
    await user.populate('managerId', 'name email');

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Server error while updating user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if user belongs to same company
    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Server error while deleting user'
    });
  }
});

// @route   GET /api/users/company/managers
// @desc    Get all managers in company
// @access  Private (Admin, Manager)
router.get('/company/managers', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const managers = await User.find({
      companyId: req.user.companyId,
      role: 'manager',
      isActive: true
    }).select('name email');

    res.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({
      message: 'Server error while fetching managers'
    });
  }
});

// @route   GET /api/users/company/employees
// @desc    Get all employees under a manager
// @access  Private (Manager)
router.get('/company/employees', authenticate, authorize('manager'), async (req, res) => {
  try {
    const employees = await User.find({
      companyId: req.user.companyId,
      managerId: req.user._id,
      isActive: true
    }).select('name email role');

    res.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      message: 'Server error while fetching employees'
    });
  }
});

module.exports = router;
