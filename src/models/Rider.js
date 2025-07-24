import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  phone: { 
    type: String, 
    required: true,
    trim: true
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
    required: true,
    trim: true,
    uppercase: true
  },
  licenseExpiry: {
    type: Date,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true }
  },
  status: { 
    type: String, 
    default: 'active' 
  },
  rating: {
    type: Number,
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
