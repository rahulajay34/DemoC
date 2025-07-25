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
  FaWrench,
  FaChartLine,
  FaPieChart
} from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function AnalyticsPage() {
  const { theme, getCardStyles, getThemeClasses } = useTheme();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [period, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await fetch(`/api/analytics?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalyticsData(data);
      } else {
        toast.error("❌ Failed to load analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("❌ Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      params.append('format', 'csv');
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await fetch(`/api/analytics/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("📊 Report exported successfully!");
      } else {
        toast.error("❌ Failed to export report");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("❌ Export failed");
    }
  };

  const getKPICards = () => {
    if (!analyticsData) return [];
    
    return [
      {
        title: "Total Revenue",
        value: `₹${(analyticsData.totalRevenue || 0).toLocaleString()}`,
        change: `${analyticsData.revenueGrowth > 0 ? '+' : ''}${(analyticsData.revenueGrowth || 0).toFixed(1)}%`,
        trend: analyticsData.revenueGrowth >= 0 ? 'up' : 'down',
        icon: <FaCreditCard className={getThemeClasses("text-emerald-600", "text-green-400")} size={20} />,
        color: "green"
      },
      {
        title: "Active Riders",
        value: analyticsData.activeRiders || 0,
        change: `${analyticsData.riderGrowth > 0 ? '+' : ''}${(analyticsData.riderGrowth || 0).toFixed(1)}%`,
        trend: analyticsData.riderGrowth >= 0 ? 'up' : 'down',
        icon: <FaUsers className={getThemeClasses("text-blue-600", "text-blue-400")} size={20} />,
        color: "blue"
      },
      {
        title: "Fleet Utilization",
        value: `${(analyticsData.utilizationRate || 0).toFixed(1)}%`,
        change: `${analyticsData.utilizationGrowth > 0 ? '+' : ''}${(analyticsData.utilizationGrowth || 0).toFixed(1)}%`,
        trend: analyticsData.utilizationGrowth >= 0 ? 'up' : 'down',
        icon: <FaBicycle className={getThemeClasses("text-purple-600", "text-purple-400")} size={20} />,
        color: "purple"
      },
      {
        title: "Avg Revenue/Rider",
        value: `₹${(analyticsData.avgRevenuePerRider || 0).toLocaleString()}`,
        change: `${analyticsData.revenuePerRiderGrowth > 0 ? '+' : ''}${(analyticsData.revenuePerRiderGrowth || 0).toFixed(1)}%`,
        trend: analyticsData.revenuePerRiderGrowth >= 0 ? 'up' : 'down',
        icon: <FaChartLine className={getThemeClasses("text-orange-600", "text-orange-400")} size={20} />,
        color: "orange"
      }
    ];
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme.colors.textPrimary} flex items-center`}>
            <FaChartBar className={`mr-3 ${getThemeClasses("text-blue-600", "text-blue-400")}`} />
            Analytics Dashboard
          </h1>
          <p className={`${theme.colors.textMuted} mt-1`}>Comprehensive insights into your fleet performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Period Selector */}
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className={`${theme.colors.input} px-4 py-2 rounded-lg ${getThemeClasses("border border-slate-300", "border border-gray-600")}`}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
              className={`${theme.colors.input} px-4 py-2 rounded-lg ${getThemeClasses("border border-slate-300", "border border-gray-600")} text-sm`}
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
              className={`${theme.colors.input} px-4 py-2 rounded-lg ${getThemeClasses("border border-slate-300", "border border-gray-600")} text-sm`}
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportReport}
            className="cheetah-gradient-btn px-4 py-2 font-semibold flex items-center"
          >
            <FaDownload className="mr-2" size={14} />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonTable columns={4} rows={8} />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getKPICards().map((card, index) => (
              <motion.div
                key={card.title}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className={`${getCardStyles()} p-6 rounded-2xl glass-card`}
              >
                <div className="flex items-center justify-between mb-4">
                  {card.icon}
                  <div className={`flex items-center gap-1 text-sm ${
                    card.trend === 'up' ? getThemeClasses('text-emerald-600', 'text-green-400') : getThemeClasses('text-red-600', 'text-red-400')
                  }`}>
                    {card.trend === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                    {card.change}
                  </div>
                </div>
                <h3 className={`${theme.colors.textMuted} text-sm mb-1`}>{card.title}</h3>
                <p className={`text-2xl font-bold ${theme.colors.textPrimary}`}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className={`${getCardStyles()} p-6 rounded-2xl glass-card`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${theme.colors.textPrimary}`}>Revenue Trend</h3>
                <FaChartLine className={getThemeClasses('text-emerald-600', 'text-green-400')} size={20} />
              </div>
              <div className="h-64 flex items-center justify-center">
                {analyticsData?.revenueByPeriod?.length > 0 ? (
                  <div className="w-full">
                    <div className="grid grid-cols-7 gap-2 h-48">
                      {analyticsData.revenueByPeriod.slice(-7).map((data, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t"
                            style={{ 
                              height: `${Math.max((data.revenue / Math.max(...analyticsData.revenueByPeriod.map(d => d.revenue))) * 100, 5)}%`
                            }}
                          />
                          <span className={`text-xs ${theme.colors.textMuted} mt-2`}>
                            {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={`${theme.colors.textMuted}`}>No revenue data available for selected period</p>
                )}
              </div>
            </motion.div>

            {/* Top Performers */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
              className={`${getCardStyles()} p-6 rounded-2xl glass-card`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${theme.colors.textPrimary}`}>Top Performing Riders</h3>
                <FaUsers className={getThemeClasses('text-blue-600', 'text-blue-400')} size={20} />
              </div>
              <div className="space-y-4">
                {analyticsData?.topRiders?.slice(0, 5).map((rider, index) => (
                  <div key={rider._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className={`${theme.colors.textPrimary} text-sm font-medium`}>{rider.name}</p>
                        <p className={`${theme.colors.textMuted} text-xs`}>{rider.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`${getThemeClasses('text-emerald-600', 'text-green-400')} text-sm font-medium`}>₹{(rider.totalRevenue || 0).toLocaleString()}</p>
                      <p className={`${theme.colors.textMuted} text-xs`}>{rider.totalAssignments || 0} rides</p>
                    </div>
                  </div>
                )) || (
                  <p className={`${theme.colors.textMuted} text-center`}>No rider data available</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Detailed Analytics */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
            className={`${getCardStyles()} p-6 rounded-2xl glass-card`}
          >
            <h3 className={`text-lg font-semibold ${theme.colors.textPrimary} mb-6`}>Fleet Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <h4 className={`${theme.colors.textMuted} text-sm mb-2`}>Average Trip Duration</h4>
                <p className={`text-2xl font-bold ${theme.colors.textPrimary}`}>{analyticsData?.avgTripDuration || 0} hrs</p>
              </div>
              <div className="text-center">
                <h4 className={`${theme.colors.textMuted} text-sm mb-2`}>Total Distance Covered</h4>
                <p className={`text-2xl font-bold ${theme.colors.textPrimary}`}>{(analyticsData?.totalDistance || 0).toLocaleString()} km</p>
              </div>
              <div className="text-center">
                <h4 className={`${theme.colors.textMuted} text-sm mb-2`}>Maintenance Cost</h4>
                <p className={`text-2xl font-bold ${theme.colors.textPrimary}`}>₹{(analyticsData?.maintenanceCost || 0).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <h4 className={`${theme.colors.textMuted} text-sm mb-2`}>Customer Satisfaction</h4>
                <p className={`text-2xl font-bold ${theme.colors.textPrimary}`}>{(analyticsData?.avgRating || 0).toFixed(1)}/5.0</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Analytics Summary */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
            className={`${getCardStyles()} p-6 rounded-2xl glass-card`}
          >
            <h3 className={`text-lg font-semibold ${theme.colors.textPrimary} mb-6`}>Period Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className={`${theme.colors.textMuted} text-sm mb-3`}>Revenue Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`${theme.colors.textSecondary}`}>Monthly Rent</span>
                    <span className={getThemeClasses('text-emerald-600', 'text-green-400')}>₹{(analyticsData?.revenueBreakdown?.monthlyRent || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme.colors.textSecondary}`}>Deposits</span>
                    <span className={getThemeClasses('text-blue-600', 'text-blue-400')}>₹{(analyticsData?.revenueBreakdown?.deposits || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme.colors.textSecondary}`}>Late Fees</span>
                    <span className={getThemeClasses('text-orange-600', 'text-orange-400')}>₹{(analyticsData?.revenueBreakdown?.lateFees || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className={`${theme.colors.textMuted} text-sm mb-3`}>Bike Categories</h4>
                <div className="space-y-2">
                  {analyticsData?.bikeCategories?.map((category) => (
                    <div key={category.category} className="flex justify-between">
                      <span className={`${theme.colors.textSecondary} capitalize`}>{category.category}</span>
                      <span className={getThemeClasses('text-blue-600', 'text-blue-400')}>{category.count} bikes</span>
                    </div>
                  )) || (
                    <p className={`${theme.colors.textMuted} text-sm`}>No category data</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className={`${theme.colors.textMuted} text-sm mb-3`}>Payment Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`${theme.colors.textSecondary}`}>Paid</span>
                    <span className={getThemeClasses('text-emerald-600', 'text-green-400')}>{analyticsData?.paymentStatus?.paid || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme.colors.textSecondary}`}>Pending</span>
                    <span className={getThemeClasses('text-amber-600', 'text-yellow-400')}>{analyticsData?.paymentStatus?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme.colors.textSecondary}`}>Overdue</span>
                    <span className={getThemeClasses('text-red-600', 'text-red-400')}>{analyticsData?.paymentStatus?.overdue || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
