"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartBar,
  FaDownload,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaBicycle,
  FaCreditCard,
  FaWrench
} from "react-icons/fa";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period, dateRange]);

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await fetch(`/api/analytics?${params}`);
      const data = await response.json();
      setAnalyticsData(data.analytics || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Revenue",
      value: "₹2,45,000",
      change: "+12.5%",
      trend: "up",
      icon: <FaCreditCard className="text-green-500" size={24} />,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      title: "Active Riders",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: <FaUsers className="text-blue-500" size={24} />,
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      title: "Fleet Utilization",
      value: "78.5%",
      change: "-2.1%",
      trend: "down",
      icon: <FaBicycle className="text-purple-500" size={24} />,
      color: "from-purple-500/20 to-purple-600/20"
    },
    {
      title: "Maintenance Cost",
      value: "₹45,600",
      change: "+15.3%",
      trend: "up",
      icon: <FaWrench className="text-orange-500" size={24} />,
      color: "from-orange-500/20 to-orange-600/20"
    }
  ];

  const chartData = {
    revenue: [
      { month: 'Jan', value: 185000 },
      { month: 'Feb', value: 192000 },
      { month: 'Mar', value: 201000 },
      { month: 'Apr', value: 218000 },
      { month: 'May', value: 235000 },
      { month: 'Jun', value: 245000 }
    ],
    assignments: [
      { month: 'Jan', value: 45 },
      { month: 'Feb', value: 52 },
      { month: 'Mar', value: 48 },
      { month: 'Apr', value: 61 },
      { month: 'May', value: 55 },
      { month: 'Jun', value: 67 }
    ]
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaChartBar className="text-blue-500" />
            Analytics & Reports
          </h1>
          <p className="text-gray-400 mt-1">Comprehensive insights into your fleet performance</p>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaDownload /> Export Report
          </motion.button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${kpi.color} p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm`}
          >
            <div className="flex justify-between items-start mb-4">
              {kpi.icon}
              <div className="flex items-center gap-1">
                {kpi.trend === "up" ? (
                  <FaArrowUp className="text-green-400" size={14} />
                ) : (
                  <FaArrowDown className="text-red-400" size={14} />
                )}
                <span className={`text-sm font-medium ${
                  kpi.trend === "up" ? "text-green-400" : "text-red-400"
                }`}>
                  {kpi.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm">{kpi.title}</p>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Revenue Trends</h3>
            <FaCalendarAlt className="text-green-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.revenue.map((item, index) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-700 ease-out"
                  style={{ 
                    height: `${(item.value / Math.max(...chartData.revenue.map(d => d.value))) * 200}px` 
                  }}
                />
                <p className="text-gray-400 text-xs mt-2">{item.month}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Assignments Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">New Assignments</h3>
            <FaUsers className="text-blue-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.assignments.map((item, index) => (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-700 ease-out"
                  style={{ 
                    height: `${(item.value / Math.max(...chartData.assignments.map(d => d.value))) * 200}px` 
                  }}
                />
                <p className="text-gray-400 text-xs mt-2">{item.month}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Bikes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Top Performing Bikes</h3>
          <div className="space-y-4">
            {[
              { bike: "Honda Activa 125", utilization: "95%", revenue: "₹15,600" },
              { bike: "TVS Jupiter", utilization: "92%", revenue: "₹14,800" },
              { bike: "Hero Maestro", utilization: "88%", revenue: "₹13,200" },
              { bike: "Suzuki Access", utilization: "85%", revenue: "₹12,900" },
              { bike: "Yamaha Ray ZR", utilization: "82%", revenue: "₹11,500" }
            ].map((bike, index) => (
              <div key={bike.bike} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{bike.bike}</p>
                    <p className="text-gray-400 text-sm">{bike.utilization} utilization</p>
                  </div>
                </div>
                <p className="text-green-400 font-semibold">{bike.revenue}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Methods Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Payment Methods</h3>
          <div className="space-y-4">
            {[
              { method: "UPI", percentage: 45, amount: "₹1,10,250" },
              { method: "Bank Transfer", percentage: 30, amount: "₹73,500" },
              { method: "Cash", percentage: 15, amount: "₹36,750" },
              { method: "Card", percentage: 8, amount: "₹19,600" },
              { method: "Cheque", percentage: 2, amount: "₹4,900" }
            ].map((method, index) => (
              <div key={method.method} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{method.method}</span>
                  <div className="text-right">
                    <p className="text-white">{method.percentage}%</p>
                    <p className="text-gray-400 text-sm">{method.amount}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
