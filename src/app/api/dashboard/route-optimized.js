// src/app/api/dashboard/route.js

import { connectToDB } from "../../../utils/db";
import Rider from "../../../models/Rider";
import Bike from "../../../models/Bike";
import Assignment from "../../../models/Assignment";
import Payment from "../../../models/Payment";
import Maintenance from "../../../models/Maintenance";
import RedisCache, { generateCacheKey, setCachedData, getCachedData } from "../../../utils/redisCache";

// Cache configuration
const CACHE_TTL = {
  dashboard: 300, // 5 minutes
  realtime: 60,   // 1 minute
  static: 3600    // 1 hour
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const includeRealtime = searchParams.get('realtime') === 'true';
    
    // Generate cache key
    const cacheKey = generateCacheKey('/api/dashboard', { period, includeRealtime });
    
    // Try to get from cache first
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return Response.json({
        ...cachedData,
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

    const dashboardData = {
      overview: {
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
        completedMaintenance
      },
      period,
      lastUpdated: new Date().toISOString(),
      cached: false
    };

    // Cache the result
    const ttl = includeRealtime ? CACHE_TTL.realtime : CACHE_TTL.dashboard;
    await setCachedData(cacheKey, dashboardData, ttl);

    return Response.json(dashboardData);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return Response.json(
      { error: "Failed to fetch dashboard data", details: error.message },
      { status: 500 }
    );
  }
}
