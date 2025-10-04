const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    length: [3, 'Currency must be 3 characters'],
    default: 'USD'
  },
  settings: {
    allowMultiCurrency: {
      type: Boolean,
      default: true
    },
    requireReceipts: {
      type: Boolean,
      default: true
    },
    maxExpenseAmount: {
      type: Number,
      default: 10000
    },
    autoApprovalLimit: {
      type: Number,
      default: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
companySchema.index({ name: 1 });

module.exports = mongoose.model('Company', companySchema);
