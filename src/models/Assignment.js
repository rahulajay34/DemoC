import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
  rider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Rider",
    required: [true, 'Rider is required']
  },
  bike: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Bike",
    required: [true, 'Bike is required']
  },
  assignmentId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'ASG' + Date.now().toString(36).toUpperCase();
    }
  },
  startDate: { 
    type: Date, 
    required: [true, 'Start date is required'],
    default: Date.now 
  },
  endDate: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  tenureMonths: { 
    type: Number,
    required: [true, 'Tenure in months is required'],
    min: [1, 'Tenure must be at least 1 month'],
    max: [60, 'Tenure cannot exceed 60 months']
  },
  monthlyCharge: { 
    type: Number,
    required: [true, 'Monthly charge is required'],
    min: [0, 'Monthly charge cannot be negative']
  },
  securityDeposit: {
    type: Number,
    required: [true, 'Security deposit is required'],
    min: [0, 'Security deposit cannot be negative']
  },
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Pending amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'terminated', 'suspended', 'pending'],
      message: '{VALUE} is not a valid assignment status'
    },
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['paid', 'partial', 'pending', 'overdue'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque'],
    default: 'cash'
  },
  deliveryDetails: {
    deliveredAt: Date,
    deliveredBy: String,
    deliveryLocation: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    deliveryNotes: String,
    customerSignature: String,
    deliveryImages: [String]
  },
  returnDetails: {
    returnedAt: Date,
    returnedBy: String,
    returnLocation: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'damaged']
    },
    damageReport: String,
    returnImages: [String],
    fuelLevel: {
      type: String,
      enum: ['full', 'three_quarter', 'half', 'quarter', 'empty']
    },
    mileageAtReturn: Number
  },
  terms: {
    kmLimit: { 
      type: Number, 
      default: 3000 // per month
    },
    extraKmCharge: { 
      type: Number, 
      default: 2 // per km
    },
    lateFee: { 
      type: Number, 
      default: 100 // per day
    },
    damagePolicy: String,
    insuranceCovered: { type: Boolean, default: false }
  },
  usage: {
    totalKm: { type: Number, default: 0 },
    averageKmPerDay: { type: Number, default: 0 },
    lastUpdated: Date
  },
  payments: [{
    paymentId: String,
    amount: Number,
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque']
    },
    transactionId: String,
    dueDate: Date,
    isLate: { type: Boolean, default: false },
    lateFee: { type: Number, default: 0 },
    notes: String,
    receipt: String
  }],
  maintenanceCharges: [{
    date: Date,
    description: String,
    amount: Number,
    approvedBy: String,
    receipt: String
  }],
  documents: {
    agreement: String,
    identityProof: String,
    addressProof: String,
    photos: [String]
  },
  notifications: {
    paymentReminders: { type: Boolean, default: true },
    maintenanceAlerts: { type: Boolean, default: true },
    expiryAlerts: { type: Boolean, default: true }
  },
  rating: {
    riderRating: { type: Number, min: 0, max: 5 },
    bikeRating: { type: Number, min: 0, max: 5 },
    serviceRating: { type: Number, min: 0, max: 5 }
  },
  feedback: {
    riderFeedback: String,
    serviceFeedback: String,
    suggestions: String
  },
  notes: String,
  createdBy: String,
  updatedBy: String,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for assignment duration in days
AssignmentSchema.virtual('durationInDays').get(function() {
  const end = this.endDate || new Date();
  return Math.ceil((end - this.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for remaining amount
AssignmentSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, (this.totalAmount || 0) - (this.paidAmount || 0));
});

// Virtual for is overdue
AssignmentSchema.virtual('isOverdue').get(function() {
  if (this.endDate && this.status === 'active') {
    return new Date() > this.endDate;
  }
  return false;
});

// Pre-save middleware to calculate totals
AssignmentSchema.pre('save', function(next) {
  // Calculate total amount if not set
  if (!this.totalAmount) {
    this.totalAmount = (this.monthlyCharge * this.tenureMonths) + (this.securityDeposit || 0);
  }
  
  // Calculate pending amount
  this.pendingAmount = Math.max(0, (this.totalAmount || 0) - (this.paidAmount || 0));
  
  // Set end date if not provided
  if (!this.endDate && this.tenureMonths) {
    this.endDate = new Date(this.startDate);
    this.endDate.setMonth(this.endDate.getMonth() + this.tenureMonths);
  }
  
  next();
});

// Pre-save middleware to update payment status
AssignmentSchema.pre('save', function(next) {
  const totalPaid = this.paidAmount || 0;
  const totalAmount = this.totalAmount || 0;
  
  if (totalPaid === 0) {
    this.paymentStatus = 'pending';
  } else if (totalPaid >= totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  
  // Check for overdue
  if (this.endDate && new Date() > this.endDate && this.paymentStatus !== 'paid') {
    this.paymentStatus = 'overdue';
  }
  
  next();
});

// Indexes for better performance
AssignmentSchema.index({ rider: 1, bike: 1 });
AssignmentSchema.index({ assignmentId: 1 });
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ paymentStatus: 1 });
AssignmentSchema.index({ startDate: -1 });
AssignmentSchema.index({ endDate: 1 });
AssignmentSchema.index({ createdAt: -1 });

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
