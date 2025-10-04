const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  isManagerApprover: {
    type: Boolean,
    default: true
  },
  approvalSequence: [{
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    order: Number
  }],
  conditionalRules: {
    usePercentageRule: {
      type: Boolean,
      default: false
    },
    percentageThreshold: {
      type: Number,
      min: 1,
      max: 100,
      default: 60
    },
    useSpecificApprover: {
      type: Boolean,
      default: false
    },
    specificApproverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    useHybridRule: {
      type: Boolean,
      default: false
    },
    hybridLogic: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'OR'
    }
  },
}, {
  timestamps: true
});

// Index for better query performance
workflowSchema.index({ companyId: 1 });

// Method to get next approver in the sequence
workflowSchema.methods.getNextApprover = function(currentApproverId) {
  const currentApprover = this.approvalSequence.find(
    (step) => step.approverId.toString() === currentApproverId.toString()
  );

  if (!currentApprover) {
    // This might be the first approval (e.g., by a manager not in the sequence)
    // or an admin override. Start from the beginning of the sequence.
    return this.approvalSequence.find(step => step.order === 1);
  }
  
  // Find the next person in the defined order
  return this.approvalSequence.find(step => step.order === currentApprover.order + 1);
};


// Method to check if conditional approval rules are met
workflowSchema.methods.checkConditionalApproval = function(expense) {
  const { conditionalRules } = this;
  const approvalHistory = expense.approvalHistory;

  let percentageMet = false;
  if (conditionalRules.usePercentageRule) {
    const totalApprovers = this.approvalSequence.length;
    if (totalApprovers > 0) {
      const approvedCount = approvalHistory.filter(a => a.action === 'approved').length;
      const approvalPercentage = (approvedCount / totalApprovers) * 100;
      if (approvalPercentage >= conditionalRules.percentageThreshold) {
        percentageMet = true;
      }
    }
  }

  let specificMet = false;
  if (conditionalRules.useSpecificApprover && conditionalRules.specificApproverId) {
    if (approvalHistory.some(a => a.action === 'approved' && a.approverId.toString() === conditionalRules.specificApproverId.toString())) {
      specificMet = true;
    }
  }

  if (conditionalRules.useHybridRule) {
    if (conditionalRules.hybridLogic === 'AND') {
      return percentageMet && specificMet;
    }
    // Default to OR logic
    return percentageMet || specificMet;
  }
  
  // If not using hybrid, check individual rules
  if (conditionalRules.usePercentageRule && percentageMet) return true;
  if (conditionalRules.useSpecificApprover && specificMet) return true;
  
  return false;
};


module.exports = mongoose.model('Workflow', workflowSchema);