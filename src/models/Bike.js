import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
  make: { 
    type: String, 
    required: [true, 'Make is required'],
    trim: true,
    maxlength: [50, 'Make cannot be more than 50 characters']
  },
  model: { 
    type: String, 
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [50, 'Model cannot be more than 50 characters']
  },
  number: { 
    type: String, 
    required: [true, 'Bike number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, 'Please enter a valid bike number format']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  chassisNumber: {
    type: String,
    required: [true, 'Chassis number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  engineNumber: {
    type: String,
    required: [true, 'Engine number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  year: {
    type: Number,
    required: [true, 'Manufacturing year is required'],
    min: [1990, 'Year cannot be less than 1990'],
    max: [new Date().getFullYear() + 1, 'Year cannot be more than next year']
  },
  type: {
    type: String,
    required: [true, 'Bike type is required'],
    enum: {
      values: ['scooter', 'motorcycle', 'electric', 'sports', 'cruiser', 'touring'],
      message: '{VALUE} is not a valid bike type'
    }
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: {
      values: ['petrol', 'diesel', 'electric', 'hybrid'],
      message: '{VALUE} is not a valid fuel type'
    }
  },
  engineCapacity: {
    type: Number,
    required: function() { 
      return this.fuelType !== 'electric'; 
    },
    min: [50, 'Engine capacity cannot be less than 50cc']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  status: { 
    type: String, 
    enum: {
      values: ['available', 'assigned', 'maintenance', 'retired', 'damaged'],
      message: '{VALUE} is not a valid status'
    },
    default: 'available' 
  },
  condition: {
    type: String,
    enum: {
      values: ['excellent', 'good', 'fair', 'poor'],
      message: '{VALUE} is not a valid condition'
    },
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
    required: [true, 'Purchase date is required']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Purchase price cannot be negative']
  },
  currentValue: {
    type: Number,
    min: [0, 'Current value cannot be negative']
  },
  insurance: {
    provider: { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    expiryDate: { type: Date },
    premium: { type: Number, min: 0 }
  },
  maintenance: {
    lastServiceDate: { type: Date },
    nextServiceDate: { type: Date },
    lastServiceKm: { type: Number, min: 0 },
    nextServiceKm: { type: Number, min: 0 },
    serviceHistory: [{
      date: Date,
      type: String,
      description: String,
      cost: { type: Number, min: 0 },
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
    current: { type: Number, default: 0, min: 0 },
    average: { type: Number, default: 0, min: 0 }
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
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
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
