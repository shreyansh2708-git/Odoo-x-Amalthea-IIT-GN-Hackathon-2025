const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const { authenticate, authorize, authorizeExpense } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createExpenseValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('category').isIn(['Travel', 'Food', 'Supplies', 'Accommodation', 'Entertainment', 'Other']).withMessage('Invalid category'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('expenseDate').isISO8601().withMessage('Invalid expense date'),
  body('paidBy').isIn(['cash', 'personal-card', 'company-card', 'bank-transfer']).withMessage('Invalid payment method'),
  body('remarks').optional().trim().isLength({ max: 1000 }).withMessage('Remarks cannot exceed 1000 characters')
];

const updateExpenseValidation = [
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('category').optional().isIn(['Travel', 'Food', 'Supplies', 'Accommodation', 'Entertainment', 'Other']).withMessage('Invalid category'),
  body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),
  body('expenseDate').optional().isISO8601().withMessage('Invalid expense date'),
  body('paidBy').optional().isIn(['cash', 'personal-card', 'company-card', 'bank-transfer']).withMessage('Invalid payment method'),
  body('remarks').optional().trim().isLength({ max: 1000 }).withMessage('Remarks cannot exceed 1000 characters')
];

// @route   GET /api/expenses
// @desc    Get expenses. Now correctly filters for "My Expenses" for all roles.
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      status, 
      category, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10,
      sortBy = 'expenseDate',
      sortOrder = 'desc'
    } = req.query;

    // THIS IS THE FIX: This query now *always* starts by filtering for the logged-in user's own expenses.
    let query = { 
      companyId: req.user.companyId,
      employeeId: req.user._id 
    };

    // Additional filters from the frontend can still be applied
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email')
      .populate('currentApproverId', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      message: 'Server error while fetching expenses'
    });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get expense by ID
// @access  Private
router.get('/:id', authenticate, authorizeExpense, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name email')
      .populate('currentApproverId', 'name email')
      .populate('approvalHistory.approverId', 'name email');

    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      message: 'Server error while fetching expense'
    });
  }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/', authenticate, createExpenseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const expenseData = {
      ...req.body,
      employeeId: req.user._id,
      companyId: req.user.companyId,
      status: 'draft'
    };

    const expense = new Expense(expenseData);
    await expense.save();
    await expense.populate('employeeId', 'name email');

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      message: 'Server error while creating expense'
    });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', authenticate, authorizeExpense, updateExpenseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (req.expense.status !== 'draft') {
      return res.status(400).json({
        message: 'Cannot update expense that has been submitted'
      });
    }

    Object.assign(req.expense, req.body);
    await req.expense.save();
    await req.expense.populate('employeeId', 'name email');

    res.json({
      message: 'Expense updated successfully',
      expense: req.expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      message: 'Server error while updating expense'
    });
  }
});

// @route   POST /api/expenses/:id/submit
// @desc    Submit expense for approval with correct hierarchy
// @access  Private
router.post('/:id/submit', authenticate, authorizeExpense, async (req, res) => {
  try {
    const { expense, user } = req;

    if (expense.status !== 'draft') {
      return res.status(400).json({ message: 'Expense has already been submitted' });
    }

    const workflow = await Workflow.findOne({ companyId: user.companyId });
    if (!workflow) {
      return res.status(400).json({ message: 'No approval workflow configured' });
    }
    
    let nextApproverId = null;

    // THIS IS THE FIX: Correctly implements the approval hierarchy
    if (user.role === 'admin') {
      // Admin's expenses are auto-approved
      expense.status = 'approved';
      expense.approvedAt = new Date();
      expense.approvalHistory.push({
        approverId: user._id,
        action: 'approved',
        comment: 'Auto-approved by admin.',
        timestamp: new Date()
      });
    } else if (user.role === 'manager') {
      // Manager's expenses go to an admin
      const admin = await User.findOne({ companyId: user.companyId, role: 'admin' });
      if (!admin) {
        return res.status(400).json({ message: 'No admin found to approve this expense.' });
      }
      nextApproverId = admin._id;
    } else { // Employee
      // Employee's expenses go to their manager first, if enabled and exists
      if (workflow.isManagerApprover && user.managerId) {
        nextApproverId = user.managerId;
      } else if (workflow.approvalSequence && workflow.approvalSequence.length > 0) {
        // Otherwise, go to the first person in the sequence
        const firstInSequence = workflow.approvalSequence.find(step => step.order === 1);
        if (firstInSequence) {
          nextApproverId = firstInSequence.approverId;
        }
      }
    }

    if (nextApproverId) {
      expense.status = 'pending';
      expense.currentApproverId = nextApproverId;
    } else if (user.role !== 'admin') {
      // If we are here and it's not an admin, we couldn't find an approver
      return res.status(400).json({ message: 'Could not determine an approver for this expense.' });
    }

    expense.submittedAt = new Date();
    await expense.save();

    await expense.populate('employeeId', 'name email');
    if (expense.currentApproverId) {
      await expense.populate('currentApproverId', 'name email');
    }

    res.json({
      message: 'Expense submitted successfully.',
      expense
    });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ message: 'Server error while submitting expense' });
  }
});


// @route   POST /api/expenses/:id/approve
// @desc    Approve expense
// @access  Private (Manager, Admin)
router.post('/:id/approve', authenticate, authorize('manager', 'admin'), authorizeExpense, async (req, res) => {
  try {
    const { comment = '' } = req.body;
    const { expense, user } = req;

    if (expense.status !== 'pending') {
      return res.status(400).json({
        message: 'Expense is not pending approval'
      });
    }

    if (user.role !== 'admin' && expense.currentApproverId?.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: 'You are not the current approver for this expense.'
      });
    }

    expense.approvalHistory.push({
      approverId: user._id,
      action: 'approved',
      comment,
      timestamp: new Date()
    });

    const workflow = await Workflow.findOne({ companyId: user.companyId });

    if (workflow.checkConditionalApproval(expense)) {
      expense.status = 'approved';
      expense.approvedAt = new Date();
      expense.currentApproverId = null;
    } else {
      const nextApprover = workflow.getNextApprover(user._id);
      if (nextApprover) {
        expense.currentApproverId = nextApprover.approverId;
      } else {
        expense.status = 'approved';
        expense.approvedAt = new Date();
        expense.currentApproverId = null;
      }
    }
    
    await expense.save();
    await expense.populate('employeeId', 'name email');
    await expense.populate('currentApproverId', 'name email');

    res.json({
      message: 'Expense approved successfully',
      expense
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({
      message: 'Server error while approving expense'
    });
  }
});

// @route   POST /api/expenses/:id/reject
// @desc    Reject expense
// @access  Private (Manager, Admin)
router.post('/:id/reject', authenticate, authorize('manager', 'admin'), authorizeExpense, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Rejection comment is required' });
    }

    const { expense, user } = req;

    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Expense is not pending approval' });
    }

    if (user.role !== 'admin' && expense.currentApproverId?.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You are not the current approver.' });
    }

    expense.approvalHistory.push({
      approverId: user._id,
      action: 'rejected',
      comment,
      timestamp: new Date()
    });
    expense.status = 'rejected';
    expense.rejectedAt = new Date();
    expense.rejectionComment = comment;
    expense.currentApproverId = null;
    
    await expense.save();
    await expense.populate('employeeId', 'name email');

    res.json({
      message: 'Expense rejected successfully',
      expense
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Server error while rejecting expense' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', authenticate, authorizeExpense, async (req, res) => {
  try {
    if (req.expense.status !== 'draft') {
      return res.status(400).json({
        message: 'Cannot delete expense that has been submitted'
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      message: 'Server error while deleting expense'
    });
  }
});

// @route   GET /api/expenses/pending/approvals
// @desc    Get pending approvals for current user
// @access  Private (Manager, Admin)
router.get('/pending/approvals', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    let query = {
      companyId: req.user.companyId,
      status: 'pending'
    };
    
    if (req.user.role === 'manager') {
      query.currentApproverId = req.user._id;
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      message: 'Server error while fetching pending approvals'
    });
  }
});

module.exports = router;