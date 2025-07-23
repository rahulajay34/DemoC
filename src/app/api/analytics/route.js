// src/app/api/analytics/route.js

import { connectToDB } from "../../../utils/db";
import Analytics from "../../../models/Analytics";
import Rider from "../../../models/Rider";
import Bike from "../../../models/Bike";
import Assignment from "../../../models/Assignment";
import Payment from "../../../models/Payment";
import Maintenance from "../../../models/Maintenance";

export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = { period };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const analytics = await Analytics.find(query)
      .sort({ date: -1 })
      .limit(50);
    
    return new Response(JSON.stringify({
      analytics,
      total: analytics.length
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch analytics",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  try {
    await connectToDB();
    
    const { period = 'daily' } = await request.json();
    
    // Calculate analytics for current period
    const now = new Date();
    
    // Get all counts
    const [
      totalRiders,
      activeRiders,
      inactiveRiders,
      suspendedRiders,
      totalBikes,
      availableBikes,
      assignedBikes,
      maintenanceBikes,
      retiredBikes,
      totalAssignments,
      activeAssignments,
      completedAssignments,
      terminatedAssignments
    ] = await Promise.all([
      Rider.countDocuments(),
      Rider.countDocuments({ status: 'active' }),
      Rider.countDocuments({ status: 'inactive' }),
      Rider.countDocuments({ status: 'suspended' }),
      Bike.countDocuments({ isActive: true }),
      Bike.countDocuments({ status: 'available' }),
      Bike.countDocuments({ status: 'assigned' }),
      Bike.countDocuments({ status: 'maintenance' }),
      Bike.countDocuments({ status: 'retired' }),
      Assignment.countDocuments({ isActive: true }),
      Assignment.countDocuments({ status: 'active' }),
      Assignment.countDocuments({ status: 'completed' }),
      Assignment.countDocuments({ status: 'terminated' })
    ]);
    
    // Get new registrations for the period
    let periodStart = new Date();
    switch (period) {
      case 'daily':
        periodStart.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'yearly':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const [
      newRiders,
      newAssignments
    ] = await Promise.all([
      Rider.countDocuments({ createdAt: { $gte: periodStart } }),
      Assignment.countDocuments({ createdAt: { $gte: periodStart } })
    ]);
    
    // Get revenue data
    const revenueData = await Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const revenue = {
      totalRevenue: 0,
      monthlyRent: 0,
      securityDeposits: 0,
      maintenanceCharges: 0,
      lateFees: 0,
      otherCharges: 0
    };
    
    revenueData.forEach(item => {
      revenue.totalRevenue += item.total;
      switch (item._id) {
        case 'monthly_rent':
          revenue.monthlyRent = item.total;
          break;
        case 'security_deposit':
          revenue.securityDeposits = item.total;
          break;
        case 'maintenance_charge':
          revenue.maintenanceCharges = item.total;
          break;
        case 'late_fee':
          revenue.lateFees = item.total;
          break;
        default:
          revenue.otherCharges += item.total;
      }
    });
    
    // Get payment analytics
    const [
      totalPayments,
      pendingPayments,
      overduePayments,
      refunds
    ] = await Promise.all([
      Payment.countDocuments({ status: 'paid' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'overdue' }),
      Payment.countDocuments({ status: 'refunded' })
    ]);
    
    // Get maintenance analytics
    const maintenanceData = await Maintenance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost.total' },
          avgDuration: { $avg: '$actualDuration' }
        }
      }
    ]);
    
    const maintenance = {
      totalMaintenanceJobs: 0,
      completedJobs: 0,
      pendingJobs: 0,
      totalMaintenanceCost: 0,
      averageJobDuration: 0
    };
    
    maintenanceData.forEach(item => {
      maintenance.totalMaintenanceJobs += item.count;
      maintenance.totalMaintenanceCost += item.totalCost || 0;
      
      if (item._id === 'completed') {
        maintenance.completedJobs = item.count;
        maintenance.averageJobDuration = item.avgDuration || 0;
      } else if (item._id === 'scheduled' || item._id === 'in_progress') {
        maintenance.pendingJobs += item.count;
      }
    });
    
    // Calculate performance metrics
    const utilizationRate = totalBikes > 0 ? (assignedBikes / totalBikes * 100) : 0;
    const customerSatisfactionScore = await Rider.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    // Create analytics record
    const analyticsData = {
      date: now,
      period,
      riders: {
        total: totalRiders,
        active: activeRiders,
        inactive: inactiveRiders,
        newRegistrations: newRiders,
        suspended: suspendedRiders
      },
      bikes: {
        total: totalBikes,
        available: availableBikes,
        assigned: assignedBikes,
        inMaintenance: maintenanceBikes,
        retired: retiredBikes
      },
      assignments: {
        total: totalAssignments,
        active: activeAssignments,
        completed: completedAssignments,
        terminated: terminatedAssignments,
        newAssignments: newAssignments
      },
      revenue,
      payments: {
        totalPayments,
        pendingPayments,
        overduePayments,
        refunds,
        averagePaymentTime: 0 // This would need more complex calculation
      },
      maintenance,
      performance: {
        utilizationRate,
        averageAssignmentDuration: 0, // This would need calculation
        customerSatisfactionScore: customerSatisfactionScore[0]?.avgRating || 0,
        onTimePaymentRate: 0, // This would need calculation
        maintenanceEfficiency: maintenance.completedJobs / (maintenance.totalMaintenanceJobs || 1) * 100
      },
      trends: {
        revenueGrowth: 0, // Would need comparison with previous period
        customerGrowth: 0, // Would need comparison with previous period
        bikeUtilization: utilizationRate,
        maintenanceCostTrend: 0 // Would need comparison with previous period
      }
    };
    
    const analytics = await Analytics.create(analyticsData);
    
    return new Response(JSON.stringify({
      message: "Analytics created successfully",
      analytics
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("POST /api/analytics error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to create analytics",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
