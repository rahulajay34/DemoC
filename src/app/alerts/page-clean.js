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
  FaCalendarAlt,
  FaPlus,
  FaBicycle,
  FaUser,
  FaCreditCard,
  FaWrench
} from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function AlertsPage() {
  const { theme, getThemeClasses } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const { toast } = useToast();

  // Theme helper functions
  const getCardStyles = () => {
    return getThemeClasses(
      'bg-white/80 border-gray-200/50',
      'bg-gray-900/50 border-gray-700/50'
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return getThemeClasses('bg-red-200/80 text-red-800 border-red-300', 'bg-red-500/20 text-red-300 border-red-400/50');
      case 'medium': return getThemeClasses('bg-amber-200/80 text-amber-800 border-amber-300', 'bg-amber-500/20 text-amber-300 border-amber-400/50');
      case 'low': return getThemeClasses('bg-emerald-200/80 text-emerald-800 border-emerald-300', 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50');
      default: return getThemeClasses('bg-gray-200/80 text-gray-700 border-gray-300', 'bg-gray-500/20 text-gray-300 border-gray-400/50');
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'payment': return <FaCreditCard className={getThemeClasses('text-emerald-600', 'text-green-400')} size={16} />;
      case 'maintenance': return <FaWrench className={getThemeClasses('text-orange-600', 'text-orange-400')} size={16} />;
      case 'assignment': return <FaUser className={getThemeClasses('text-blue-600', 'text-blue-400')} size={16} />;
      case 'fleet': return <FaBicycle className={getThemeClasses('text-purple-600', 'text-purple-400')} size={16} />;
      default: return <FaInfoCircle className={getThemeClasses('text-gray-500', 'text-gray-400')} size={16} />;
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 120000);
    return () => clearInterval(interval);
  }, [typeFilter, statusFilter, priorityFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
        setFilteredAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = alerts;

    if (searchQuery.trim()) {
      filtered = filtered.filter(alert =>
        alert.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(alert => alert.read === (statusFilter === "read"));
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(alert => alert.priority === priorityFilter);
    }

    setFilteredAlerts(filtered);
  }, [searchQuery, alerts, typeFilter, statusFilter, priorityFilter]);

  const handleMarkAsRead = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert =>
          alert._id === alertId ? { ...alert, read: true } : alert
        ));
        toast.success('Alert marked as read');
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedAlerts.length === 0) {
      toast.warning('Please select alerts first');
      return;
    }

    if (action === 'read') {
      setAlerts(prev => prev.map(alert =>
        selectedAlerts.includes(alert._id) ? { ...alert, read: true } : alert
      ));
      toast.success(`✅ ${selectedAlerts.length} alerts marked as read`);
    } else if (action === 'delete') {
      setAlerts(prev => prev.filter(alert => !selectedAlerts.includes(alert._id)));
      setFilteredAlerts(prev => prev.filter(alert => !selectedAlerts.includes(alert._id)));
      toast.success(`🗑️ ${selectedAlerts.length} alerts deleted`);
    }
    
    setSelectedAlerts([]);
  };

  return (
    <div className={`min-h-screen p-6 space-y-8 ${theme.colors.background}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className={`text-3xl font-bold ${theme.colors.textPrimary} flex items-center`}>
              <FaBell className={`mr-3 ${getThemeClasses('text-orange-600', 'text-orange-400')}`} />
              Alerts & Notifications
            </h1>
            <p className={`${theme.colors.textMuted} mt-1`}>Stay updated with system notifications and alerts</p>
          </div>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className={`${theme.colors.textPrimary} hover:opacity-80 text-lg p-2 lg:hidden`}
          >
            <FaSearch />
          </button>
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${getCardStyles()} border rounded-lg px-4 py-2 pr-10 ${theme.colors.textPrimary} backdrop-blur-sm`}
            />
            <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.colors.textMuted}`} />
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {searchActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${getCardStyles()} border rounded-lg px-4 py-2 pr-10 ${theme.colors.textPrimary} backdrop-blur-sm`}
            />
            <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.colors.textMuted}`} />
          </div>
        </motion.div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
          >
            <option value="all">All Types</option>
            <option value="payment">Payment</option>
            <option value="maintenance">Maintenance</option>
            <option value="assignment">Assignment</option>
            <option value="fleet">Fleet</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedAlerts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('read')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              <FaEye size={14} />
              Mark Read ({selectedAlerts.length})
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <FaTrash size={14} />
              Delete ({selectedAlerts.length})
            </button>
          </div>
        )}
      </div>

      {/* Alerts List */}
      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className={`${getCardStyles()} rounded-xl p-8 text-center backdrop-blur-lg border glass-card`}>
              <FaBell className={`mx-auto ${theme.colors.textMuted} mb-4`} size={48} />
              <p className={`${theme.colors.textPrimary} text-lg mb-2`}>No alerts found</p>
              <p className={`${theme.colors.textMuted}`}>
                {searchQuery || typeFilter !== "all" || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "All caught up! No new alerts at the moment"}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${getCardStyles()} rounded-xl p-6 backdrop-blur-lg border glass-card ${
                  !alert.read ? 'ring-2 ring-orange-500/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.includes(alert._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAlerts(prev => [...prev, alert._id]);
                      } else {
                        setSelectedAlerts(prev => prev.filter(id => id !== alert._id));
                      }
                    }}
                    className="mt-1"
                  />
                  
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`font-medium ${theme.colors.textPrimary} mb-1`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`flex items-center gap-1 ${theme.colors.textMuted}`}>
                            <FaClock size={12} />
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            alert.read 
                              ? getThemeClasses('bg-gray-200 text-gray-600', 'bg-gray-700 text-gray-300')
                              : getThemeClasses('bg-orange-200 text-orange-800', 'bg-orange-500/20 text-orange-300')
                          }`}>
                            {alert.read ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!alert.read && (
                          <button
                            onClick={() => handleMarkAsRead(alert._id)}
                            className={`p-2 rounded-lg ${getThemeClasses('hover:bg-gray-100', 'hover:bg-gray-700')} transition-colors`}
                            title="Mark as read"
                          >
                            <FaEye className={getThemeClasses('text-green-600', 'text-green-400')} size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
