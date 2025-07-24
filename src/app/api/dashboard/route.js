// src/app/api/dashboard/route.js

import { connectToDB } from "../../../utils/db";
import Rider from "../../../models/Rider";
import Bike from "../../../models/Bike";
import Assignment from "../../../models/Assignment";
import Payment from "../../../models/Payment";
import Maintenance from "../../../models/Maintenance";

// Cache configuration
const CACHE_TTL = {
  dashboard: 300, // 5 minutes
  realtime: 60,   // 1 minute
  static: 3600    // 1 hour
};

// Simple in-memory cache as fallback
const simpleCache = new Map();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const includeRealtime = searchParams.get('realtime') === 'true';
    
    // Simple cache key
    const cacheKey = `dashboard_${period}_${includeRealtime}`;
    
    // Try to get from simple cache first
    const cached = simpleCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return Response.json({
        ...cached.data,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    await connectToDB();
    
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

    // Parallel aggregation queries for better performance
    const [
      totalRiders,
      activeRiders,
      totalBikes,
      bikeStats,
      totalAssignments,
      assignmentStats,
      totalPayments,
      paymentStats,
      totalMaintenance,
      maintenanceStats
    ] = await Promise.all([
      Rider.countDocuments(),
      Rider.countDocuments({ status: 'active' }),
      Bike.countDocuments({ isActive: true }),
      Bike.aggregate([
        { $match: { isActive: true } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        }}
      ]),
      Assignment.countDocuments({ isActive: true }),
      Assignment.aggregate([
        { $match: { isActive: true } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        }}
      ]),
      Payment.countDocuments({ isActive: true }),
      Payment.aggregate([
        { $match: { isActive: true, createdAt: { $gte: startDate } } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }}
      ]),
      Maintenance.countDocuments({ isActive: true }),
      Maintenance.aggregate([
        { $match: { isActive: true } },
        { $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        }}
      ])
    ]);

    // Process bike statistics
    const availableBikes = bikeStats.find(stat => stat._id === 'available')?.count || 0;
    const assignedBikes = bikeStats.find(stat => stat._id === 'assigned')?.count || 0;
    const maintenanceBikes = bikeStats.find(stat => stat._id === 'maintenance')?.count || 0;

    // Process assignment statistics
    const activeAssignments = assignmentStats.find(stat => stat._id === 'active')?.count || 0;
    const completedAssignments = assignmentStats.find(stat => stat._id === 'completed')?.count || 0;
    const pendingAssignments = assignmentStats.find(stat => stat._id === 'pending')?.count || 0;

    // Process payment statistics
    const pendingPayments = paymentStats.find(stat => stat._id === 'pending')?.count || 0;
    const completedPayments = paymentStats.find(stat => stat._id === 'completed')?.count || 0;
    const totalRevenue = paymentStats.reduce((sum, stat) => sum + (stat.total || 0), 0);

    // Process maintenance statistics
    const pendingMaintenance = maintenanceStats.find(stat => stat._id === 'pending')?.count || 0;
    const inProgressMaintenance = maintenanceStats.find(stat => stat._id === 'in-progress')?.count || 0;
    const completedMaintenance = maintenanceStats.find(stat => stat._id === 'completed')?.count || 0;

    // Calculate utilization rate
    const utilizationRate = totalBikes > 0 ? Math.round((assignedBikes / totalBikes) * 100) : 0;

    const dashboardData = {
      summary: {
        totalRiders,
        activeRiders,
        totalBikes,
        availableBikes,
        assignedBikes,
        maintenanceBikes,
        totalAssignments,
        activeAssignments,
        completedAssignments,
        pendingAssignments,
        totalPayments,
        pendingPayments,
        completedPayments,
        totalRevenue,
        totalMaintenance,
        pendingMaintenance,
        inProgressMaintenance,
        completedMaintenance,
        overduePayments: 0, // Placeholder - would need additional logic
        utilizationRate
      },
      trends: {
        revenueGrowth: 12, // Placeholder - would need historical data comparison
        assignmentGrowth: 8 // Placeholder - would need historical data comparison
      },
      analytics: {
        topRiders: [] // Placeholder - would need additional query
      },
      recentActivity: {
        assignments: [], // Placeholder - would need additional query
        payments: [], // Placeholder - would need additional query
        maintenance: [] // Placeholder - would need additional query
      },
      period,
      lastUpdated: new Date().toISOString(),
      cached: false
    };

    // Cache the result with simple cache
    const ttl = includeRealtime ? CACHE_TTL.realtime : CACHE_TTL.dashboard;
    simpleCache.set(cacheKey, {
      data: dashboardData,
      expiry: Date.now() + (ttl * 1000)
    });

    return Response.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return Response.json(
      { error: "Failed to fetch dashboard data", details: error.message },
      { status: 500 }
    );
  }
}