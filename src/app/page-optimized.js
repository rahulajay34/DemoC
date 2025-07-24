// Current data fetching in Dashboard is slow, querying MongoDB on every load. This optimized version uses SWR caching, parallel fetching, and preloading for faster performance.
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SkeletonCardGrid from "@/components/SkeletonCardGrid";
import Image from "next/image";
import scooty from "../../public/scooty.gif";
import Link from "next/link";
import { 
  FaUserFriends, 
  FaBicycle, 
  FaClipboardList, 
  FaWrench,
  FaCreditCard,
  FaExclamationTriangle,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";

// Import optimized data fetching hooks
import { useOptimizedFetch } from "@/hooks/useOptimizedFetch";
import { PageTransition, staggerContainer, staggerItem, hoverLift } from "@/components/PageTransition";
import { preloadCriticalData } from "@/utils/apiHelper";

export default function Dashboard() {
  const [period, setPeriod] = useState('monthly');

  // Optimized dashboard data fetching with intelligent caching
  const { data: dashboardData, isLoading, error, refresh } = useOptimizedFetch(
    `/api/dashboard?period=${period}`, 
    { 
      refreshInterval: 60000, // Refresh every minute for real-time data
      revalidateOnFocus: true, // Refresh when user returns to tab
      dedupingInterval: 5000   // Prevent duplicate requests for 5 seconds
    }
  );

  // Preload critical pages for faster navigation when user clicks
  useEffect(() => {
    const criticalUrls = [
      '/api/riders?limit=5',
      '/api/bikes?limit=5', 
      '/api/assignments?limit=5',
      '/api/payments?status=pending&limit=5',
      '/api/maintenance?status=pending&limit=5'
    ];
    preloadCriticalData(criticalUrls);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  
  // ✨ This function tracks the mouse position and updates the CSS variables ✨
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  if (isLoading) {
    return (
      <PageTransition variant="fade">
        <SkeletonCardGrid />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition variant="fade">
        <div className="p-8 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-red-400 text-lg font-semibold mb-2">Failed to load dashboard</h3>
            <p className="text-red-300 text-sm mb-4">There was an error loading the dashboard data</p>
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

  const { summary, trends, analytics, recentActivity } = dashboardData || {};

  const statCards = [
    {
      title: "Total Riders",
      value: summary?.totalRiders || 0,
      subtitle: `${summary?.activeRiders || 0} Active`,
      icon: <FaUserFriends className="text-blue-400" size={24} />,
      href: "/riders",
      trend: trends?.revenueGrowth > 0 ? "up" : "down",
      trendValue: "12%"
    },
    {
      title: "Total Bikes",
      value: summary?.totalBikes || 0,
      subtitle: `${summary?.availableBikes || 0} Available`,
      icon: <FaBicycle className="text-green-400" size={24} />,
      href: "/bikes",
      trend: "up",
      trendValue: "8%"
    },
    {
      title: "Active Assignments",
      value: summary?.activeAssignments || 0,
      subtitle: `${summary?.utilizationRate || 0}% Utilization`,
      icon: <FaClipboardList className="text-purple-400" size={24} />,
      href: "/assignments",
      trend: trends?.assignmentGrowth > 0 ? "up" : "down",
      trendValue: Math.abs(trends?.assignmentGrowth || 0).toFixed(1) + "%"
    },
    {
      title: "Total Revenue",
      value: `₹${(summary?.totalRevenue || 0).toLocaleString()}`,
      subtitle: "This Month",
      icon: <FaCreditCard className="text-yellow-400" size={24} />,
      href: "/payments",
      trend: trends?.revenueGrowth > 0 ? "up" : "down",
      trendValue: Math.abs(trends?.revenueGrowth || 0).toFixed(1) + "%"
    },
    {
      title: "Pending Maintenance",
      value: summary?.pendingMaintenance || 0,
      subtitle: `${summary?.maintenanceBikes || 0} Bikes`,
      icon: <FaWrench className="text-orange-400" size={24} />,
      href: "/maintenance",
      trend: "neutral",
      trendValue: ""
    },
    {
      title: "Overdue Payments",
      value: summary?.overduePayments || 0,
      subtitle: `₹${(summary?.pendingPayments || 0).toLocaleString()}`,
      icon: <FaExclamationTriangle className="text-red-400" size={24} />,
      href: "/payments",
      trend: "down",
      trendValue: "5%"
    }
  ];

  return (
    <PageTransition variant="dashboard">
      <div className="p-4 sm:p-8 space-y-8">
        {/* Header with smooth entrance animation */}
        <motion.div 
          variants={staggerItem}
          initial="initial"
          animate="animate"
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center"
        >
          <div className="mb-4 lg:mb-0">
            <motion.h1 
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Dashboard
            </motion.h1>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Monitor your bike rental operations in real-time
            </motion.p>
          </div>
          
          {/* Period selector with enhanced hover effects */}
          <motion.div 
            className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
              <motion.button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md capitalize transition-all duration-200 text-sm font-medium ${
                  period === p 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {p}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats Cards Grid with staggered animations */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={staggerItem}
              whileHover={hoverLift}
              className="group"
            >
              <Link href={card.href}>
                <div 
                  className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
                  onMouseMove={handleMouseMove}
                  style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                      rgba(255, 165, 0, 0.05), transparent 40%)`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-gray-50 group-hover:bg-orange-50 transition-colors">
                      {card.icon}
                    </div>
                    {card.trend && card.trend !== "neutral" && (
                      <motion.div 
                        className="flex items-center space-x-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {card.trend === "up" ? (
                          <FaArrowUp className="text-green-500 text-sm" />
                        ) : (
                          <FaArrowDown className="text-red-500 text-sm" />
                        )}
                        <span className={`text-sm font-medium ${
                          card.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}>
                          {card.trendValue}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  
                  <div>
                    <motion.p 
                      className="text-3xl font-bold text-gray-900 mb-1"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {card.value}
                    </motion.p>
                    <p className="text-gray-600 text-sm">{card.subtitle}</p>
                    <p className="text-gray-500 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {card.title}
                    </p>
                  </div>
                  
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity Section with enhanced animations */}
        {recentActivity && (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Recent Assignments */}
            <motion.div 
              variants={staggerItem}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaClipboardList className="text-purple-500 mr-2" />
                  Recent Assignments
                </h3>
                <Link 
                  href="/assignments" 
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {(recentActivity.assignments || []).slice(0, 3).map((assignment, index) => (
                  <motion.div
                    key={assignment._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {assignment.rider?.name || 'Unknown Rider'}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {assignment.bike?.registrationNumber || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      assignment.status === 'active' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Payments */}
            <motion.div 
              variants={staggerItem}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaCreditCard className="text-green-500 mr-2" />
                  Recent Payments
                </h3>
                <Link 
                  href="/payments" 
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {(recentActivity.payments || []).slice(0, 3).map((payment, index) => (
                  <motion.div
                    key={payment._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        ₹{payment.amount?.toLocaleString() || '0'}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {payment.rider?.name || 'Unknown Rider'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Performance indicator */}
        <motion.div 
          className="text-center text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Dashboard optimized with intelligent caching • Last updated: {new Date().toLocaleTimeString()}
        </motion.div>
      </div>
    </PageTransition>
  );
}
