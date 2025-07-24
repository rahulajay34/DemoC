import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    default: function() {
      return 'PAY' + Date.now().toString(36).toUpperCase();
    }
  },
  assignment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Assignment",
    required: true
  },
  rider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Rider",
    required: true
  },
  type: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'pending'
  },
  transactionDetails: {
    transactionId: { type: String, trim: true },
    referenceNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    upiId: { type: String, trim: true },
    cardLast4: { type: String, trim: true },
    chequeNumber: { type: String, trim: true }
  },
  gateway: {
    provider: { type: String, trim: true }, // razorpay, payu, etc.
    gatewayTransactionId: { type: String, trim: true },
    gatewayFee: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  installments: {
    isInstallment: { type: Boolean, default: false },
    installmentNumber: { type: Number },
    totalInstallments: { type: Number },
    installmentAmount: { type: Number }
  },
  lateFee: {
    amount: { type: Number, default: 0 },
    daysLate: { type: Number, default: 0 },
    feePerDay: { type: Number, default: 0 }
  },
  discount: {
    amount: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    reason: { type: String, trim: true },
    approvedBy: { type: String, trim: true }
  },
  tax: {
    gst: { type: Number, default: 0 },
    otherTax: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 }
  },
  receipt: {
    receiptNumber: { type: String, trim: true },
    receiptUrl: { type: String, trim: true },
    generatedAt: Date
  },
  reconciliation: {
    isReconciled: { type: Boolean, default: false },
    reconciledAt: Date,
    reconciledBy: String,
    bankStatementRef: String
  },
  refund: {
    isRefundable: { type: Boolean, default: false },
    refundAmount: { type: Number },
    refundReason: String,
    refundDate: Date,
    refundTransactionId: String,
    refundStatus: {
      type: String
    }
  },
  reminder: {
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
    lastReminderDate: Date,
    reminderCount: { type: Number, default: 0 }
  },
  notes: { type: String, trim: true },
  attachments: [String],
  processedBy: {
    employeeName: String,
    employeeId: String,
    role: String
  },
  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for final amount after discount and tax
PaymentSchema.virtual('finalAmount').get(function() {
  const baseAmount = this.amount || 0;
  const discountAmount = this.discount.amount || 0;
  const taxAmount = this.tax.taxAmount || 0;
  const lateFeeAmount = this.lateFee.amount || 0;
  
  return baseAmount - discountAmount + taxAmount + lateFeeAmount;
});

// Virtual for days overdue
PaymentSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue' && this.dueDate) {
    return Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for is overdue
PaymentSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.dueDate && new Date() > this.dueDate;
});

// Pre-save middleware to update status and calculate late fees
PaymentSchema.pre('save', function(next) {
  // Update status based on due date
  if (this.status === 'pending' && this.dueDate && new Date() > this.dueDate) {
    this.status = 'overdue';
    
    // Calculate late fee if not already calculated
    if (!this.lateFee.amount && this.lateFee.feePerDay) {
      const daysLate = Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
      this.lateFee.daysLate = daysLate;
      this.lateFee.amount = daysLate * this.lateFee.feePerDay;
    }
  }
  
  // Calculate tax amount if percentage is provided
  if (this.tax.gst && !this.tax.taxAmount) {
    this.tax.taxAmount = (this.amount * this.tax.gst) / 100;
  }
  
  // Generate receipt number if payment is successful
  if (this.status === 'paid' && !this.receipt.receiptNumber) {
    this.receipt.receiptNumber = 'RCP' + Date.now().toString(36).toUpperCase();
    this.receipt.generatedAt = new Date();
  }
  
  next();
});

// Indexes
PaymentSchema.index({ assignment: 1 });
PaymentSchema.index({ rider: 1 });
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ type: 1 });
PaymentSchema.index({ dueDate: 1 });
PaymentSchema.index({ paidDate: -1 });
PaymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
