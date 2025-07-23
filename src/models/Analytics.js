import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  riders: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    inactive: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 },
    suspended: { type: Number, default: 0 }
  },
  bikes: {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    assigned: { type: Number, default: 0 },
    inMaintenance: { type: Number, default: 0 },
    retired: { type: Number, default: 0 }
  },
  assignments: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    terminated: { type: Number, default: 0 },
    newAssignments: { type: Number, default: 0 }
  },
  revenue: {
    totalRevenue: { type: Number, default: 0 },
    monthlyRent: { type: Number, default: 0 },
    securityDeposits: { type: Number, default: 0 },
    maintenanceCharges: { type: Number, default: 0 },
    lateFees: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 }
  },
  payments: {
    totalPayments: { type: Number, default: 0 },
    pendingPayments: { type: Number, default: 0 },
    overduePayments: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 },
    averagePaymentTime: { type: Number, default: 0 } // in days
  },
  maintenance: {
    totalMaintenanceJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    pendingJobs: { type: Number, default: 0 },
    totalMaintenanceCost: { type: Number, default: 0 },
    averageJobDuration: { type: Number, default: 0 } // in hours
  },
  performance: {
    utilizationRate: { type: Number, default: 0 }, // percentage of bikes in use
    averageAssignmentDuration: { type: Number, default: 0 }, // in days
    customerSatisfactionScore: { type: Number, default: 0 },
    onTimePaymentRate: { type: Number, default: 0 },
    maintenanceEfficiency: { type: Number, default: 0 }
  },
  trends: {
    revenueGrowth: { type: Number, default: 0 },
    customerGrowth: { type: Number, default: 0 },
    bikeUtilization: { type: Number, default: 0 },
    maintenanceCostTrend: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
AnalyticsSchema.index({ date: -1, period: 1 });
AnalyticsSchema.index({ period: 1, createdAt: -1 });

export default mongoose.models.Analytics || mongoose.model("Analytics", AnalyticsSchema);
