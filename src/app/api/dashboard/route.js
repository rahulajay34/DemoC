// src/app/api/dashboard/route.js

import { connectToDB } from "../../../utils/db";
import Rider from "../../../models/Rider";
import Bike from "../../../models/Bike";
import Assignment from "../../../models/Assignment";
import Payment from "../../../models/Payment";
import Maintenance from "../../../models/Maintenance";

export async function GET(request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly, yearly
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'daily':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7 * 12);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 12);
        break;
      case 'yearly':
        startDate.setFullYear(now.getFullYear() - 5);
        break;
      default:
        startDate.setMonth(now.getMonth() - 12);
    }
    
    // Get overall statistics
    const [
      totalRiders,
      activeRiders,
      totalBikes,
      availableBikes,
      assignedBikes,
      maintenanceBikes,
      totalAssignments,
      activeAssignments,
      pendingPayments,
      overduePayments,
      totalRevenue,
      pendingMaintenance
    ] = await Promise.all([
      Rider.countDocuments({ isActive: true }),
      Rider.countDocuments({ status: 'active' }),
      Bike.countDocuments({ isActive: true }),
      Bike.countDocuments({ status: 'available' }),
      Bike.countDocuments({ status: 'assigned' }),
      Bike.countDocuments({ status: 'maintenance' }),
      Assignment.countDocuments({ isActive: true }),
      Assignment.countDocuments({ status: 'active' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'overdue' }),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Maintenance.countDocuments({ status: { $in: ['scheduled', 'in_progress'] } })
    ]);
    
    // Get revenue trends
    const revenueTrends = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paidDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' },
            day: period === 'daily' ? { $dayOfMonth: '$paidDate' } : null
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get assignment trends
    const assignmentTrends = await Assignment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: period === 'daily' ? { $dayOfMonth: '$createdAt' } : null
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get top performing riders
    const topRiders = await Rider.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $lookup: {
          from: 'assignments',
          localField: '_id',
          foreignField: 'rider',
          as: 'assignments'
        }
      },
      {
        $addFields: {
          totalRevenue: {
            $sum: '$assignments.totalAmount'
          },
          activeAssignments: {
            $size: {
              $filter: {
                input: '$assignments',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          email: 1,
          rating: 1,
          totalRevenue: 1,
          activeAssignments: 1,
          totalAssignments: 1
        }
      }
    ]);
    
    // Get maintenance costs by category
    const maintenanceCosts = await Maintenance.aggregate([
      {
        $match: {
          status: 'completed',
          completedDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalCost: { $sum: '$cost.total' },
          count: { $sum: 1 },
          avgCost: { $avg: '$cost.total' }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);
    
    // Get bike utilization
    const bikeUtilization = await Bike.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          percentage: {
            $multiply: [
              { $divide: ['$count', totalBikes] },
              100
            ]
          }
        }
      }
    ]);
    
    // Get payment method distribution
    const paymentMethods = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paidDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    // Get recent activities (last 10)
    const recentActivities = await Promise.all([
      Assignment.find({ isActive: true })
        .populate('rider', 'name')
        .populate('bike', 'make model number')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('rider bike startDate status createdAt'),
      Payment.find({ isActive: true })
        .populate('rider', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('rider amount type status createdAt'),
      Maintenance.find({ isActive: true })
        .populate('bike', 'make model number')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('bike type status priority createdAt')
    ]);
    
    const [recentAssignments, recentPayments, recentMaintenance] = recentActivities;
    
    // Calculate growth rates (compared to previous period)
    const previousPeriodStart = new Date(startDate);
    const periodDiff = now.getTime() - startDate.getTime();
    previousPeriodStart.setTime(startDate.getTime() - periodDiff);
    
    const [previousRevenue, previousAssignments] = await Promise.all([
      Payment.aggregate([
        {
          $match: {
            status: 'paid',
            paidDate: { $gte: previousPeriodStart, $lt: startDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Assignment.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lt: startDate }
      })
    ]);
    
    const currentRevenue = totalRevenue[0]?.total || 0;
    const prevRevenue = previousRevenue[0]?.total || 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100) : 0;
    
    const currentAssignments = await Assignment.countDocuments({
      createdAt: { $gte: startDate }
    });
    const assignmentGrowth = previousAssignments > 0 ? ((currentAssignments - previousAssignments) / previousAssignments * 100) : 0;
    
    return new Response(JSON.stringify({
      summary: {
        totalRiders,
        activeRiders,
        totalBikes,
        availableBikes,
        assignedBikes,
        maintenanceBikes,
        totalAssignments,
        activeAssignments,
        pendingPayments,
        overduePayments,
        totalRevenue: currentRevenue,
        pendingMaintenance,
        utilizationRate: totalBikes > 0 ? (assignedBikes / totalBikes * 100).toFixed(2) : 0
      },
      trends: {
        revenue: revenueTrends,
        assignments: assignmentTrends,
        revenueGrowth: revenueGrowth.toFixed(2),
        assignmentGrowth: assignmentGrowth.toFixed(2)
      },
      analytics: {
        topRiders,
        maintenanceCosts,
        bikeUtilization,
        paymentMethods
      },
      recentActivity: {
        assignments: recentAssignments,
        payments: recentPayments,
        maintenance: recentMaintenance
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch dashboard data",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
