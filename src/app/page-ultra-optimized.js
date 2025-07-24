// Example optimized page using all the new performance features
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOptimizedFetch, useParallelFetch } from "@/hooks/useOptimizedFetch";
import { PageTransition, staggerContainer, staggerItem, hoverLift } from "@/components/PageTransition";
import { preloadCriticalData } from "@/utils/apiHelper";
import Enhanced3DHero from "@/components/Enhanced3DHero";
import { 
  FaUserFriends, 
  FaBicycle, 
  FaClipboardList, 
  FaWrench,
  FaCreditCard,
  FaChartLine
} from "react-icons/fa";

export default function OptimizedDashboard() {
  const [period, setPeriod] = useState('monthly');

  // Use optimized fetch with React Query strategy
  const { data: dashboardData, isLoading, error, refresh, performanceMetrics } = useOptimizedFetch(
    `/api/dashboard?period=${period}`, 
    { 
      strategy: 'hybrid', // Use both SWR and React Query
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      dedupingInterval: 5000
    }
  );

  // Parallel fetch for multiple endpoints
  const { results: parallelData, isLoading: parallelLoading } = useParallelFetch([
    { key: 'recentRiders', url: '/api/riders?limit=5&sort=createdAt' },
    { key: 'alerts', url: '/api/maintenance?status=pending&limit=3' },
    { key: 'revenue', url: '/api/payments?status=completed&limit=5' }
  ], {
    strategy: 'cache-first',
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  // Preload critical pages when component mounts
  useEffect(() => {
    const criticalUrls = [
      '/api/riders?limit=10',
      '/api/bikes?limit=10', 
      '/api/assignments?limit=10',
      '/api/analytics?period=weekly'
    ];
    preloadCriticalData(criticalUrls, {
      strategy: 'cache-first',
      priority: 'high'
    });
  }, []);

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: hoverLift
  };

  if (error) {
    return (
      <PageTransition variant="fade">
        <div className="p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-red-800 text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
            <p className="text-red-600 text-sm mb-4">{error.message}</p>
            <button 
              onClick={refresh}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="dashboard">
      <div className="p-4 sm:p-8 space-y-6">
        {/* Header with 3D Hero */}
        <motion.div 
          variants={staggerItem}
          className="text-center space-y-4"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Cheetah Admin Dashboard
          </motion.h1>
          
          {/* Enhanced 3D Hero with fallback */}
          <Enhanced3DHero height={200} showControls={false} />
        </motion.div>

        {/* Performance metrics in development */}
        {process.env.NODE_ENV === 'development' && performanceMetrics && (
          <motion.div 
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            variants={staggerItem}
          >
            <h3 className="text-blue-800 font-semibold mb-2">Performance Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>Cache Hits: {performanceMetrics.cacheHits}</div>
              <div>Network Requests: {performanceMetrics.networkRequests}</div>
              <div>Average Response: {performanceMetrics.averageResponseTime}ms</div>
              <div>Errors: {performanceMetrics.errors}</div>
            </div>
          </motion.div>
        )}

        {/* Period Selector */}
        <motion.div 
          className="flex justify-center space-x-2"
          variants={staggerItem}
        >
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                period === p
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Dashboard Stats */}
        {isLoading ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div 
                key={i}
                className="bg-white rounded-lg p-6 shadow-md animate-pulse"
                variants={staggerItem}
              >
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { icon: FaUserFriends, label: "Total Riders", value: dashboardData?.overview?.totalRiders || 0, color: "blue" },
              { icon: FaBicycle, label: "Available Bikes", value: dashboardData?.overview?.availableBikes || 0, color: "green" },
              { icon: FaClipboardList, label: "Active Assignments", value: dashboardData?.overview?.activeAssignments || 0, color: "orange" },
              { icon: FaWrench, label: "Pending Maintenance", value: dashboardData?.overview?.pendingMaintenance || 0, color: "red" },
              { icon: FaCreditCard, label: "Pending Payments", value: dashboardData?.overview?.pendingPayments || 0, color: "purple" },
              { icon: FaChartLine, label: "Total Revenue", value: `$${(dashboardData?.overview?.totalRevenue || 0).toLocaleString()}`, color: "emerald" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-lg p-6 shadow-md border border-gray-100 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
                
                {/* Cache indicator */}
                {dashboardData?.cached && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    From Cache
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Additional Data from Parallel Fetch */}
        {!parallelLoading && parallelData && (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Recent Riders */}
            <motion.div 
              className="bg-white rounded-lg p-6 shadow-md"
              variants={staggerItem}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Riders</h3>
              <div className="space-y-3">
                {parallelData.recentRiders?.data?.slice(0, 3).map((rider, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <FaUserFriends className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rider.name}</p>
                      <p className="text-xs text-gray-500">{rider.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Maintenance Alerts */}
            <motion.div 
              className="bg-white rounded-lg p-6 shadow-md"
              variants={staggerItem}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Alerts</h3>
              <div className="space-y-3">
                {parallelData.alerts?.data?.slice(0, 3).map((alert, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <FaWrench className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alert.type}</p>
                      <p className="text-xs text-gray-500">{alert.priority} priority</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Revenue */}
            <motion.div 
              className="bg-white rounded-lg p-6 shadow-md"
              variants={staggerItem}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Revenue</h3>
              <div className="space-y-3">
                {parallelData.revenue?.data?.slice(0, 3).map((payment, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCreditCard className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">${payment.amount}</p>
                        <p className="text-xs text-gray-500">{payment.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Cache Status Footer */}
        <motion.div 
          className="text-center text-sm text-gray-500"
          variants={staggerItem}
        >
          <p>
            Data loaded {dashboardData?.cached ? 'from cache' : 'from server'} • 
            Last updated: {dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleTimeString() : 'N/A'}
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
