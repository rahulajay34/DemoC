import mongoose from "mongoose";

const MaintenanceSchema = new mongoose.Schema({
  maintenanceId: {
    type: String,
    required: true,
    default: function() {
      return 'MNT' + Date.now().toString(36).toUpperCase();
    }
  },
  bike: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Bike",
    required: true
  },
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    default: 'medium'
  },
  status: {
    type: String,
    default: 'scheduled'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: Date,
  estimatedDuration: {
    type: Number // in hours
  },
  actualDuration: {
    type: Number // in hours
  },
  serviceCenter: {
    name: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    rating: { type: Number }
  },
  assignedTechnician: {
    name: { type: String, trim: true },
    employeeId: { type: String, trim: true },
    phone: { type: String, trim: true },
    specialization: { type: String, trim: true }
  },
  cost: {
    labor: { type: Number, default: 0 },
    parts: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  parts: [{
    name: { type: String, required: true, trim: true },
    partNumber: { type: String, trim: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    supplier: { type: String, trim: true },
    warranty: { type: String, trim: true } // warranty period
  }],
  workPerformed: [{
    task: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    timeSpent: { type: Number }, // in hours
    technicianNotes: { type: String, trim: true }
  }],
  beforeImages: [String],
  afterImages: [String],
  documents: {
    invoice: String,
    warranty: String,
    receipt: String,
    report: String
  },
  mileageAtService: {
    type: Number
  },
  nextServiceDue: {
    date: Date,
    mileage: Number,
    type: String
  },
  warrantyInfo: {
    isUnderWarranty: { type: Boolean, default: false },
    warrantyProvider: String,
    warrantyExpiry: Date,
    claimNumber: String
  },
  qualityCheck: {
    checked: { type: Boolean, default: false },
    checkedBy: String,
    checkedDate: Date,
    rating: { type: Number },
    issues: [String],
    approved: { type: Boolean, default: false }
  },
  customerSatisfaction: {
    rating: { type: Number, min: 0, max: 5 },
    feedback: String,
    wouldRecommend: Boolean
  },
  followUp: {
    required: { type: Boolean, default: false },
    scheduledDate: Date,
    notes: String,
    completed: { type: Boolean, default: false }
  },
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: { 
      type: String, 
      enum: ['weekly', 'monthly', 'quarterly', 'half_yearly', 'yearly']
    },
    nextDueDate: Date
  },
  notes: String,
  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total cost calculation
MaintenanceSchema.virtual('totalCost').get(function() {
  return (this.cost.labor || 0) + (this.cost.parts || 0) + (this.cost.other || 0);
});

// Virtual for maintenance duration
MaintenanceSchema.virtual('actualDurationInDays').get(function() {
  if (this.completedDate && this.scheduledDate) {
    return Math.ceil((this.completedDate - this.scheduledDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for is overdue
MaintenanceSchema.virtual('isOverdue').get(function() {
  if (this.status === 'scheduled' && this.scheduledDate) {
    return new Date() > this.scheduledDate;
  }
  return false;
});

// Pre-save middleware to calculate total cost
MaintenanceSchema.pre('save', function(next) {
  this.cost.total = (this.cost.labor || 0) + (this.cost.parts || 0) + (this.cost.other || 0);
  
  // Calculate parts total if parts array exists
  if (this.parts && this.parts.length > 0) {
    this.cost.parts = this.parts.reduce((total, part) => total + (part.totalPrice || 0), 0);
  }
  
  next();
});

// Indexes
MaintenanceSchema.index({ bike: 1 });
MaintenanceSchema.index({ maintenanceId: 1 });
MaintenanceSchema.index({ status: 1 });
MaintenanceSchema.index({ type: 1 });
MaintenanceSchema.index({ priority: 1 });
MaintenanceSchema.index({ scheduledDate: 1 });
MaintenanceSchema.index({ createdAt: -1 });

export default mongoose.models.Maintenance || mongoose.model("Maintenance", MaintenanceSchema);
