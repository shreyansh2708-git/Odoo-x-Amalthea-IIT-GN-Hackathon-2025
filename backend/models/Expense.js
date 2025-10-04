const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    length: [3, 'Currency must be 3 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Travel', 'Food', 'Supplies', 'Accommodation', 'Entertainment', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  expenseDate: {
    type: Date,
    required: [true, 'Expense date is required']
  },
  paidBy: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'personal-card', 'company-card', 'bank-transfer']
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'processing'],
    default: 'draft'
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  approvalHistory: [{
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['approved', 'rejected', 'requested_changes']
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  currentApproverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectionComment: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  submittedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
expenseSchema.index({ employeeId: 1 });
expenseSchema.index({ companyId: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ currentApproverId: 1 });

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Method to add approval action
expenseSchema.methods.addApprovalAction = function(approverId, action, comment = '') {
  this.approvalHistory.push({
    approverId,
    action,
    comment,
    timestamp: new Date()
  });
  
  if (action === 'approved') {
    this.status = 'approved';
    this.approvedAt = new Date();
  } else if (action === 'rejected') {
    this.status = 'rejected';
    this.rejectedAt = new Date();
    this.rejectionComment = comment;
  }
  
  return this.save();
};

module.exports = mongoose.model('Expense', expenseSchema);

