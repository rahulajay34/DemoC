"use client";
import { useEffect, useState } from "react";
import SkeletonCardGrid from "@/components/SkeletonCardGrid";
import Image from "next/image";
import scooty from "../../public/scooty.gif";
import { motion } from "framer-motion";
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

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch(`/api/dashboard?period=${period}`);
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [period]);

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

  if (loading) {
    return <SkeletonCardGrid />;
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
      subtitle: `${summary?.maintenanceBikes || 0} In Progress`,
      icon: <FaWrench className="text-orange-400" size={24} />,
      href: "/maintenance",
      trend: "neutral",
      trendValue: "--"
    },
    {
      title: "Overdue Payments",
      value: summary?.overduePayments || 0,
      subtitle: `${summary?.pendingPayments || 0} Pending`,
      icon: <FaExclamationTriangle className="text-red-400" size={24} />,
      href: "/payments?status=overdue",
      trend: "down",
      trendValue: "5%"
    }
  ];

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's what's happening with your fleet.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 cursor-pointer card-hover-effect"
          >
            <Link href={card.href} className="block">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {card.icon}
                    <h3 className="text-sm font-medium text-gray-400">{card.title}</h3>
                  </div>
                  <div className="mb-2">
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {card.trend === "up" && <FaArrowUp className="text-green-400" size={12} />}
                    {card.trend === "down" && <FaArrowDown className="text-red-400" size={12} />}
                    {card.trend === "neutral" && <div className="w-3 h-3 rounded-full bg-gray-400" />}
                    <span className={`text-xs ${
                      card.trend === "up" ? "text-green-400" : 
                      card.trend === "down" ? "text-red-400" : "text-gray-400"
                    }`}>
                      {card.trendValue}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
            <FaChartLine className="text-green-400" size={20} />
          </div>
          <div className="h-48 flex items-center justify-center text-gray-400">
            <p>Revenue chart visualization would go here</p>
          </div>
        </motion.div>

        {/* Top Riders */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Performing Riders</h3>
          <div className="space-y-3">
            {analytics?.topRiders?.slice(0, 5).map((rider, index) => (
              <div key={rider._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{rider.name}</p>
                    <p className="text-gray-400 text-xs">{rider.activeAssignments} assignments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm font-medium">₹{rider.totalRevenue?.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${
                          i < (rider.rating || 0) ? 'bg-yellow-400' : 'bg-gray-600'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-400 text-center">No rider data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Assignments */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Latest Assignments</h4>
            <div className="space-y-2">
              {recentActivity?.assignments?.map((assignment) => (
                <div key={assignment._id} className="text-xs">
                  <p className="text-white">{assignment.rider?.name}</p>
                  <p className="text-gray-400">{assignment.bike?.make} {assignment.bike?.model}</p>
                </div>
              )) || (
                <p className="text-gray-500 text-xs">No recent assignments</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Latest Payments</h4>
            <div className="space-y-2">
              {recentActivity?.payments?.map((payment) => (
                <div key={payment._id} className="text-xs">
                  <p className="text-white">{payment.rider?.name}</p>
                  <p className="text-green-400">₹{payment.amount}</p>
                </div>
              )) || (
                <p className="text-gray-500 text-xs">No recent payments</p>
              )}
            </div>
          </div>

          {/* Recent Maintenance */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Maintenance</h4>
            <div className="space-y-2">
              {recentActivity?.maintenance?.map((maintenance) => (
                <div key={maintenance._id} className="text-xs">
                  <p className="text-white">{maintenance.bike?.make} {maintenance.bike?.model}</p>
                  <p className="text-orange-400">{maintenance.type}</p>
                </div>
              )) || (
                <p className="text-gray-500 text-xs">No recent maintenance</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fun illustration */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.9 }}
        className="text-center py-8"
      >
        <Image
          src={scooty}
          alt="Scooty animation"
          width={200}
          height={150}
          className="mx-auto opacity-80"
        />
        <p className="text-gray-400 mt-4">Your fleet management system is running smoothly!</p>
      </motion.div>
    </div>
  );
}


  return (
    <section>
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

      {loading ? (
        <SkeletonCardGrid count={3} />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {["riders", "bikes", "assignments"].map((type) => (
            <Link href={`/${type}`} key={type} className="group">
              <motion.div
                className="glass-card h-48 flex items-center justify-center"
                variants={cardVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                onMouseMove={handleMouseMove} // Activate the spotlight effect on mouse move
              >
                <div className="card-content text-center">
                  {/* ✨ Default State Content - Fades out on hover ✨ */}
                  <div className="transition-opacity duration-300 group-hover:opacity-0">
                    <div className="text-6xl font-extrabold text-white drop-shadow-lg">
                      {counts[type]}
                    </div>
                    <div className="mt-2 text-lg text-white/80 font-medium capitalize">
                      {type}
                    </div>
                  </div>

                  {/* ✨ Hover State Content - Fades in on hover ✨ */}
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <p className="text-white text-2xl font-bold">View {type}</p>
                  </div>

                  {/* Scooty animation remains in the background */}
                  {type === "riders" && (
                    <div className="absolute bottom-3 right-3 opacity-50 group-hover:opacity-80 transition-opacity duration-300 animate-scooty-glide">
                      <Image
                        src={scooty}
                        alt="Scooty"
                        width={40}
                        height={40}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </section>
  );
}