const express = require('express');
const { body, validationResult } = require('express-validator');
const Workflow = require('../models/Workflow');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/workflows
// @desc    Get company workflow
// @access  Private (Admin, Manager)
router.get('/', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    let workflow = await Workflow.findOne({ 
      companyId: req.user.companyId 
    }).populate('approvalSequence.approverId', 'name email');

    if (!workflow) {
      // If no workflow exists, create a default one and return it
      workflow = new Workflow({
        companyId: req.user.companyId,
        isManagerApprover: true,
        approvalSequence: [],
      });
      await workflow.save();
    }

    res.json({ workflow });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      message: 'Server error while fetching workflow'
    });
  }
});

// @route   POST /api/workflows
// @desc    Create or update company workflow
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      isManagerApprover,
      approvalSequence,
      conditionalRules,
    } = req.body;

    // Validate approval sequence if provided
    if (approvalSequence && approvalSequence.length > 0) {
      for (const step of approvalSequence) {
        if (step.approverId) {
          const userExists = await User.findOne({
            _id: step.approverId,
            companyId: req.user.companyId,
            role: { $in: ['admin', 'manager'] }
          });
          if (!userExists) {
            return res.status(400).json({
              message: `Invalid approver ID found in sequence: ${step.approverId}`
            });
          }
        }
      }
    }

    // Find and update workflow, or create if it doesn't exist
    let workflow = await Workflow.findOneAndUpdate(
      { companyId: req.user.companyId },
      {
        $set: {
          isManagerApprover: isManagerApprover,
          approvalSequence: approvalSequence,
          conditionalRules: conditionalRules,
        }
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('approvalSequence.approverId', 'name email');

    res.json({
      message: 'Workflow saved successfully',
      workflow
    });
  } catch (error) {
    console.error('Save workflow error:', error);
    res.status(500).json({
      message: 'Server error while saving workflow'
    });
  }
});

module.exports = router;