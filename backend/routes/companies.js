const express = require('express');
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const Workflow = require('../models/Workflow');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/companies/:id
// @desc    Get company details
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    // Check if user belongs to this company
    if (company._id.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      message: 'Server error while fetching company'
    });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company settings
// @access  Private (Admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, currency, settings } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    // Check if user belongs to this company
    if (company._id.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Update company
    if (name) company.name = name;
    if (currency) company.currency = currency.toUpperCase();
    if (settings) company.settings = { ...company.settings, ...settings };

    await company.save();

    res.json({
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      message: 'Server error while updating company'
    });
  }
});

module.exports = router;
