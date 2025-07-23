"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaCog,
  FaFilter,
  FaSearch,
  FaClock,
  FaCalendarAlt
} from "react-icons/fa";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAlerts, setSelectedAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // Simulated alerts data
      const simulatedAlerts = [
        {
          _id: "alert1",
          title: "Overdue Payment Alert",
          message: "Assignment ASN001 payment is 5 days overdue. Amount: ₹1,200",
          type: "warning",
          priority: "high",
          status: "unread",
          category: "payment",
          relatedId: "ASN001",
          relatedType: "assignment",
          createdAt: new Date("2024-01-15T10:30:00"),
          readAt: null,
          data: {
            assignmentId: "ASN001",
            riderName: "Rahul Sharma",
            amount: 1200,
            daysOverdue: 5
          }
        },
        {
          _id: "alert2",
          title: "Maintenance Due",
          message: "Bike BK023 (Honda Activa 125) requires scheduled maintenance",
          type: "info",
          priority: "medium",
          status: "unread",
          category: "maintenance",
          relatedId: "BK023",
          relatedType: "bike",
          createdAt: new Date("2024-01-15T09:15:00"),
          readAt: null,
          data: {
            bikeId: "BK023",
            bikeName: "Honda Activa 125",
            maintenanceType: "Scheduled Service",
            dueDate: new Date("2024-01-20T00:00:00")
          }
        },
        {
          _id: "alert3",
          title: "Low Battery Warning",
          message: "Bike BK045 GPS tracker battery is critically low (8%)",
          type: "error",
          priority: "high",
          status: "read",
          category: "technical",
          relatedId: "BK045",
          relatedType: "bike",
          createdAt: new Date("2024-01-14T16:45:00"),
          readAt: new Date("2024-01-14T17:00:00"),
          data: {
            bikeId: "BK045",
            bikeName: "TVS Jupiter",
            batteryLevel: 8,
            lastLocation: "Connaught Place, New Delhi"
          }
        },
        {
          _id: "alert4",
          title: "New Rider Registration",
          message: "New rider Priya Singh has completed registration and verification",
          type: "success",
          priority: "low",
          status: "read",
          category: "user",
          relatedId: "RD156",
          relatedType: "rider",
          createdAt: new Date("2024-01-14T14:20:00"),
          readAt: new Date("2024-01-14T15:30:00"),
          data: {
            riderId: "RD156",
            riderName: "Priya Singh",
            phone: "+91 98765 43210",
            location: "Noida, UP"
          }
        },
        {
          _id: "alert5",
          title: "Fleet Utilization Alert",
          message: "Fleet utilization has dropped below 70% threshold (current: 65%)",
          type: "warning",
          priority: "medium",
          status: "unread",
          category: "operational",
          relatedId: null,
          relatedType: "system",
          createdAt: new Date("2024-01-14T12:00:00"),
          readAt: null,
          data: {
            currentUtilization: 65,
            threshold: 70,
            totalBikes: 125,
            activeBikes: 81
          }
        }
      ];
      setAlerts(simulatedAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "error": return <FaExclamationTriangle className="text-red-400" />;
      case "warning": return <FaExclamationTriangle className="text-yellow-400" />;
      case "info": return <FaInfoCircle className="text-blue-400" />;
      case "success": return <FaCheckCircle className="text-green-400" />;
      default: return <FaBell className="text-gray-400" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "error": return "from-red-500/5 to-red-600/5 border-red-500/10";
      case "warning": return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case "info": return "from-blue-500/20 to-blue-600/20 border-blue-500/30";
      case "success": return "from-green-500/20 to-green-600/20 border-green-500/30";
      default: return "from-gray-500/20 to-gray-600/20 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-500/10 text-red-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const markAsRead = async (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert._id === alertId 
        ? { ...alert, status: "read", readAt: new Date() }
        : alert
    ));
  };

  const markAsUnread = async (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert._id === alertId 
        ? { ...alert, status: "unread", readAt: null }
        : alert
    ));
  };

  const deleteAlert = async (alertId) => {
    setAlerts(prev => prev.filter(alert => alert._id !== alertId));
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = alerts.filter(alert => alert.status === "unread").length;

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 flex-wrap">
            <FaBell className="text-yellow-500" />
            <span>Alerts & Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-500/80 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Monitor and manage system alerts and notifications</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
          >
            <FaCog className="text-sm sm:text-base" /> 
            <span className="hidden sm:inline">Settings</span>
          </motion.button>
        </div>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card bg-gradient-to-br from-red-500/5 to-red-600/5 p-4 sm:p-6 rounded-2xl border border-red-500/10"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaExclamationTriangle className="text-red-400 text-sm sm:text-base" size={16} />
            <span className="text-gray-400 text-xs sm:text-sm">Critical</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {alerts.filter(a => a.type === "error").length}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 sm:p-6 rounded-2xl border border-yellow-500/30"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaExclamationTriangle className="text-yellow-400 text-sm sm:text-base" size={16} />
            <span className="text-gray-400 text-xs sm:text-sm">Warnings</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {alerts.filter(a => a.type === "warning").length}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 sm:p-6 rounded-2xl border border-blue-500/30"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaInfoCircle className="text-blue-400 text-sm sm:text-base" size={16} />
            <span className="text-gray-400 text-xs sm:text-sm">Info</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">
            {alerts.filter(a => a.type === "info").length}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 sm:p-6 rounded-2xl border border-green-500/30"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FaEyeSlash className="text-green-400 text-sm sm:text-base" size={16} />
            <span className="text-gray-400 text-xs sm:text-sm">Unread</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white">{unreadCount}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="glass-card bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-3 sm:p-4 lg:p-6 rounded-2xl border border-gray-700/50 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="w-full">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-800/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none backdrop-blur-sm transition-all duration-300 text-sm sm:text-base placeholder-gray-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-gray-800/50 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none backdrop-blur-sm transition-all duration-300 text-sm sm:text-base dark-theme-select"
            >
              <option value="all">All Types</option>
              <option value="error">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-800/50 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none backdrop-blur-sm transition-all duration-300 text-sm sm:text-base dark-theme-select"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card bg-gradient-to-br ${getAlertColor(alert.type)} p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border backdrop-blur-sm transition-all duration-300
                ${alert.status === "unread" ? "shadow-lg ring-1 ring-white/10 hover:shadow-xl" : "opacity-75 hover:opacity-90"}`}
            >
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-800/50 flex items-center justify-center flex-shrink-0 border border-gray-700/50">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2">{alert.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)} flex-shrink-0`}>
                          {alert.priority}
                        </span>
                        {alert.status === "unread" && (
                          <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 animate-pulse"></span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3 text-sm sm:text-base leading-relaxed line-clamp-3">{alert.message}</p>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm text-gray-400">
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <FaClock size={10} />
                        <span className="truncate">{alert.createdAt.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <FaCalendarAlt size={10} />
                        <span>{alert.category}</span>
                      </div>
                      {alert.readAt && (
                        <div className="text-green-400 truncate flex-shrink-0">
                          Read at {alert.readAt.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 flex-shrink-0 border-t border-gray-700/30 pt-3">
                  {alert.status === "unread" ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markAsRead(alert._id)}
                      className="p-2.5 sm:p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200 min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
                      title="Mark as read"
                    >
                      <FaEye size={14} className="sm:w-3 sm:h-3" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => markAsUnread(alert._id)}
                      className="p-2.5 sm:p-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-all duration-200 min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
                      title="Mark as unread"
                    >
                      <FaEyeSlash size={14} className="sm:w-3 sm:h-3" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteAlert(alert._id)}
                    className="p-2.5 sm:p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all duration-200 min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center"
                    title="Delete alert"
                  >
                    <FaTrash size={14} className="sm:w-3 sm:h-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <FaBell className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No alerts found</h3>
          <p className="text-gray-500">No alerts match your current filters</p>
        </motion.div>
      )}
    </div>
  );
}
