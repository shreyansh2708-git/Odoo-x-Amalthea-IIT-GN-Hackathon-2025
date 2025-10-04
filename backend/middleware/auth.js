const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).populate('companyId');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'Invalid token or user not found.' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired.' 
      });
    }
    res.status(500).json({ 
      message: 'Token verification failed.' 
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

// Check if user can access company data
const authorizeCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }
  
  const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  if (companyId && req.user.companyId.toString() !== companyId.toString()) {
    return res.status(403).json({ 
      message: 'Access denied. You can only access your company data.' 
    });
  }
  
  next();
};

// Check if user can access expense
const authorizeExpense = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }
    
    const expenseId = req.params.expenseId || req.params.id;
    const Expense = require('../models/Expense');
    const expense = await Expense.findById(expenseId);
    
    if (!expense) {
      return res.status(404).json({ 
        message: 'Expense not found.' 
      });
    }
    
    // Check if user can access this expense
    const canAccess = 
      expense.employeeId.toString() === req.user._id.toString() || // Owner
      expense.currentApproverId.toString() === req.user._id.toString() || // Current approver
      req.user.role === 'admin' || // Admin
      (req.user.role === 'manager' && expense.employeeId.toString() === req.user.managerId?.toString()); // Manager of employee
    
    if (!canAccess) {
      return res.status(403).json({ 
        message: 'Access denied. You cannot access this expense.' 
      });
    }
    
    req.expense = expense;
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Authorization check failed.' 
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  authorizeCompany,
  authorizeExpense
};
