const express = require('express');
const Expense = require('../models/Expense');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics based on user role
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let baseQuery = {
      companyId: req.user.companyId,
      expenseDate: { $gte: startDate, $lte: now }
    };

    // Role-specific filtering
    if (req.user.role === 'employee') {
      baseQuery.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      // Get team members
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId 
      }).select('_id');
      
      baseQuery.$or = [
        { employeeId: req.user._id },
        { employeeId: { $in: teamMembers.map(member => member._id) } }
      ];
    }

    // Get expense statistics
    const [
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      rejectedExpenses,
      totalAmount,
      avgApprovalTime
    ] = await Promise.all([
      Expense.countDocuments({ ...baseQuery }),
      Expense.countDocuments({ ...baseQuery, status: 'pending' }),
      Expense.countDocuments({ ...baseQuery, status: 'approved' }),
      Expense.countDocuments({ ...baseQuery, status: 'rejected' }),
      Expense.aggregate([
        { $match: baseQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      calculateAverageApprovalTime(baseQuery)
    ]);

    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;

    // Get previous period for comparison
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousQuery = {
      ...baseQuery,
      expenseDate: { $gte: previousStartDate, $lt: startDate }
    };

    const [
      previousTotalExpenses,
      previousTotalAmount
    ] = await Promise.all([
      Expense.countDocuments(previousQuery),
      Expense.aggregate([
        { $match: previousQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const previousTotalAmountValue = previousTotalAmount.length > 0 ? previousTotalAmount[0].total : 0;

    // Calculate percentage changes
    const expenseCountChange = previousTotalExpenses > 0 
      ? ((totalExpenses - previousTotalExpenses) / previousTotalExpenses * 100).toFixed(1)
      : 0;
    
    const amountChange = previousTotalAmountValue > 0 
      ? ((totalAmountValue - previousTotalAmountValue) / previousTotalAmountValue * 100).toFixed(1)
      : 0;

    // Get company currency
    const company = await User.findById(req.user._id).populate('companyId');
    const currency = company.companyId.currency;

    res.json({
      stats: {
        totalExpenses,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        totalAmount: totalAmountValue,
        avgApprovalTime: avgApprovalTime || 0,
        currency,
        period,
        changes: {
          expenseCount: parseFloat(expenseCountChange),
          amount: parseFloat(amountChange)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// @route   GET /api/dashboard/recent-expenses
// @desc    Get recent expenses for dashboard
// @access  Private
router.get('/recent-expenses', authenticate, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    let query = { companyId: req.user.companyId };

    // Role-specific filtering
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      // Get team members
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId 
      }).select('_id');
      
      query.$or = [
        { employeeId: req.user._id },
        { employeeId: { $in: teamMembers.map(member => member._id) } }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ expenses });
  } catch (error) {
    console.error('Get recent expenses error:', error);
    res.status(500).json({
      message: 'Server error while fetching recent expenses'
    });
  }
});

// @route   GET /api/dashboard/category-breakdown
// @desc    Get expense breakdown by category
// @access  Private
router.get('/category-breakdown', authenticate, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let baseQuery = {
      companyId: req.user.companyId,
      expenseDate: { $gte: startDate, $lte: now },
      status: 'approved'
    };

    // Role-specific filtering
    if (req.user.role === 'employee') {
      baseQuery.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId 
      }).select('_id');
      
      baseQuery.$or = [
        { employeeId: req.user._id },
        { employeeId: { $in: teamMembers.map(member => member._id) } }
      ];
    }

    const categoryBreakdown = await Expense.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({ categoryBreakdown });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({
      message: 'Server error while fetching category breakdown'
    });
  }
});

// @route   GET /api/dashboard/monthly-trends
// @desc    Get monthly expense trends
// @access  Private
router.get('/monthly-trends', authenticate, async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    let query = { 
      companyId: req.user.companyId,
      status: 'approved'
    };

    // Role-specific filtering
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId 
      }).select('_id');
      
      query.$or = [
        { employeeId: req.user._id },
        { employeeId: { $in: teamMembers.map(member => member._id) } }
      ];
    }

    const monthlyTrends = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: parseInt(months) }
    ]);

    res.json({ monthlyTrends });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({
      message: 'Server error while fetching monthly trends'
    });
  }
});

// @route   GET /api/dashboard/pending-approvals
// @desc    Get pending approvals for managers/admins
// @access  Private (Manager, Admin)
router.get('/pending-approvals', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    let query = {
      companyId: req.user.companyId,
      status: 'pending'
    };

    if (req.user.role === 'manager') {
      query.currentApproverId = req.user._id;
    }
    // Admin can see all pending approvals

    const pendingApprovals = await Expense.find(query)
      .populate('employeeId', 'name email')
      .populate('currentApproverId', 'name email')
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit));

    res.json({ pendingApprovals });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      message: 'Server error while fetching pending approvals'
    });
  }
});

// Helper function to calculate average approval time
async function calculateAverageApprovalTime(baseQuery) {
  try {
    const result = await Expense.aggregate([
      { $match: { ...baseQuery, status: 'approved', approvedAt: { $exists: true } } },
      {
        $project: {
          approvalTime: {
            $divide: [
              { $subtract: ['$approvedAt', '$submittedAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$approvalTime' }
        }
      }
    ]);

    return result.length > 0 ? result[0].avgTime : 0;
  } catch (error) {
    console.error('Calculate average approval time error:', error);
    return 0;
  }
}

module.exports = router;
