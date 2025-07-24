import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
  make: { 
    type: String, 
    required: true,
    trim: true
  },
  model: { 
    type: String, 
    required: true,
    trim: true
  },
  number: { 
    type: String, 
    required: true,
    trim: true,
    uppercase: true
  },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  chassisNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  engineNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  year: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  fuelType: {
    type: String,
    required: true
  },
  engineCapacity: {
    type: Number
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  status: { 
    type: String, 
    default: 'available' 
  },
  condition: {
    type: String,
    default: 'good'
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Rider", 
    default: null 
  },
  assignedAt: { type: Date, default: null },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number
  },
  insurance: {
    provider: { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    expiryDate: { type: Date },
    premium: { type: Number }
  },
  maintenance: {
    lastServiceDate: { type: Date },
    nextServiceDate: { type: Date },
    lastServiceKm: { type: Number },
    nextServiceKm: { type: Number },
    serviceHistory: [{
      date: Date,
      type: String,
      description: String,
      cost: { type: Number },
      serviceCenter: String
    }]
  },
  documents: {
    rc: { type: String, default: null },
    insurance: { type: String, default: null },
    permit: { type: String, default: null },
    fitness: { type: String, default: null }
  },
  mileage: {
    current: { type: Number, default: 0 },
    average: { type: Number, default: 0 }
  },
  features: {
    gps: { type: Boolean, default: false },
    alarm: { type: Boolean, default: false },
    abs: { type: Boolean, default: false },
    bluetooth: { type: Boolean, default: false },
    usb: { type: Boolean, default: false }
  },
  location: {
    garage: { type: String, trim: true },
    zone: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  totalAssignments: { type: Number, default: 0 },
  totalDistance: { type: Number, default: 0 },
  lastAssignmentDate: { type: Date, default: null },
  images: [{
    url: String,
    description: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  notes: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for bike age
BikeSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for full bike name
BikeSchema.virtual('fullName').get(function() {
  return `${this.make} ${this.model} (${this.year})`;
});

// Virtual for depreciation
BikeSchema.virtual('depreciation').get(function() {
  if (this.currentValue && this.purchasePrice) {
    return ((this.purchasePrice - this.currentValue) / this.purchasePrice * 100).toFixed(2);
  }
  return 0;
});

// Pre-save middleware to calculate current value based on depreciation
BikeSchema.pre('save', function(next) {
  if (this.isNew && !this.currentValue) {
    const age = new Date().getFullYear() - this.year;
    const depreciationRate = 0.15; // 15% per year
    this.currentValue = this.purchasePrice * Math.pow(1 - depreciationRate, age);
  }
  next();
});

// Indexes for better performance
BikeSchema.index({ number: 1 });
BikeSchema.index({ registrationNumber: 1 });
BikeSchema.index({ status: 1 });
BikeSchema.index({ type: 1 });
BikeSchema.index({ assignedTo: 1 });
BikeSchema.index({ createdAt: -1 });
BikeSchema.index({ 'location.zone': 1 });

export default mongoose.models.Bike || mongoose.model("Bike", BikeSchema);
