import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true }
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'License expiry date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'License expiry date must be in the future'
    }
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(v) {
        const age = (new Date() - v) / (365.25 * 24 * 60 * 60 * 1000);
        return age >= 18;
      },
      message: 'Rider must be at least 18 years old'
    }
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true }
  },
  status: { 
    type: String, 
    enum: {
      values: ['active', 'inactive', 'suspended', 'pending'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active' 
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  totalAssignments: { type: Number, default: 0 },
  currentAssignments: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  profileImage: { type: String, default: null },
  documents: {
    license: { type: String, default: null },
    aadhaar: { type: String, default: null },
    photo: { type: String, default: null }
  },
  bankDetails: {
    accountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true },
    accountHolderName: { type: String, trim: true }
  },
  preferences: {
    preferredBikeType: { 
      type: String, 
      enum: ['scooter', 'motorcycle', 'electric', 'any'],
      default: 'any'
    },
    maxDistance: { type: Number, default: 50 }, // in km
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rider's age
RiderSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for full address
RiderSchema.virtual('fullAddress').get(function() {
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Pre-save middleware to update lastActive
RiderSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastActive = new Date();
  }
  next();
});

// Indexes for better performance
RiderSchema.index({ email: 1 });
RiderSchema.index({ phone: 1 });
RiderSchema.index({ licenseNumber: 1 });
RiderSchema.index({ status: 1 });
RiderSchema.index({ 'address.city': 1 });
RiderSchema.index({ createdAt: -1 });

export default mongoose.models.Rider || mongoose.model("Rider", RiderSchema);
