"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaClipboardList,
  FaUser,
  FaBicycle,
  FaCreditCard,
  FaWrench,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaDownload,
  FaHistory,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCog,
  FaExclamationTriangle,
  FaShieldAlt
} from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function AuditPage() {
  const { theme, getThemeClasses } = useTheme();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();

  // Theme helper functions
  const getCardStyles = () => {
    return getThemeClasses(
      'bg-white/80 border-gray-200/50',
      'bg-gray-900/50 border-gray-700/50'
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return getThemeClasses('bg-red-200/80 text-red-800 border-red-300', 'bg-red-500/20 text-red-300 border-red-400/50');
      case 'medium': return getThemeClasses('bg-amber-200/80 text-amber-800 border-amber-300', 'bg-amber-500/20 text-amber-300 border-amber-400/50');
      case 'low': return getThemeClasses('bg-emerald-200/80 text-emerald-800 border-emerald-300', 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50');
      default: return getThemeClasses('bg-gray-200/80 text-gray-700 border-gray-300', 'bg-gray-500/20 text-gray-300 border-gray-400/50');
    }
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'add': return <FaPlus className={getThemeClasses('text-emerald-600', 'text-green-400')} size={14} />;
      case 'update':
      case 'edit': return <FaEdit className={getThemeClasses('text-blue-600', 'text-blue-400')} size={14} />;
      case 'delete':
      case 'remove': return <FaTrash className={getThemeClasses('text-red-600', 'text-red-400')} size={14} />;
      case 'login':
      case 'access': return <FaUser className={getThemeClasses('text-purple-600', 'text-purple-400')} size={14} />;
      default: return <FaCog className={getThemeClasses('text-gray-500', 'text-gray-400')} size={14} />;
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, userFilter, severityFilter, dateRange]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: actionFilter,
        user: userFilter,
        severity: severityFilter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/audit?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
        setFilteredLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLogs(auditLogs);
    } else {
      setFilteredLogs(
        auditLogs.filter(log =>
          log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.userName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, auditLogs]);

  const handleExportLogs = async () => {
    try {
      toast.info('Exporting audit logs...');
      // Export functionality would be implemented here
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  return (
    <div className={`min-h-screen p-6 space-y-8 ${theme.colors.background}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className={`text-3xl font-bold ${theme.colors.textPrimary} flex items-center`}>
              <FaShieldAlt className={`mr-3 ${getThemeClasses('text-blue-600', 'text-blue-400')}`} />
              Audit Log
            </h1>
            <p className={`${theme.colors.textMuted} mt-1`}>Track system activities and user actions</p>
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
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${getCardStyles()} border rounded-lg px-4 py-2 pr-10 ${theme.colors.textPrimary} backdrop-blur-sm`}
            />
            <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.colors.textMuted}`} />
          </div>
          <button
            onClick={handleExportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FaDownload size={14} />
            Export
          </button>
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
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${getCardStyles()} border rounded-lg px-4 py-2 pr-10 ${theme.colors.textPrimary} backdrop-blur-sm`}
            />
            <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.colors.textMuted}`} />
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
        >
          <option value="all">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
        />

        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
        />
      </div>

      {/* Audit Logs */}
      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className={`${getCardStyles()} rounded-xl p-8 text-center backdrop-blur-lg border glass-card`}>
              <FaClipboardList className={`mx-auto ${theme.colors.textMuted} mb-4`} size={48} />
              <p className={`${theme.colors.textPrimary} text-lg mb-2`}>No audit logs found</p>
              <p className={`${theme.colors.textMuted}`}>
                {searchQuery || actionFilter !== "all" || severityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No activity recorded for the selected date range"}
              </p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${getCardStyles()} rounded-xl p-6 backdrop-blur-lg border glass-card cursor-pointer hover:scale-[1.02] transition-transform`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className={`font-medium ${theme.colors.textPrimary} mb-1`}>
                          {log.action} - {log.details}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`flex items-center gap-1 ${theme.colors.textMuted}`}>
                            <FaUser size={12} />
                            {log.userName || 'System'}
                          </span>
                          <span className={`flex items-center gap-1 ${theme.colors.textMuted}`}>
                            <FaClock size={12} />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className={`p-2 rounded-lg ${getThemeClasses('hover:bg-gray-100', 'hover:bg-gray-700')} transition-colors`}
                        title="View details"
                      >
                        <FaEye className={getThemeClasses('text-blue-600', 'text-blue-400')} size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${getCardStyles()} rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto backdrop-blur-lg border glass-card`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme.colors.textPrimary}`}>Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className={`p-2 rounded-lg ${getThemeClasses('hover:bg-gray-100', 'hover:bg-gray-700')} transition-colors`}
              >
                <FaTimes className={theme.colors.textMuted} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className={`text-sm ${theme.colors.textMuted} mb-1`}>Action</p>
                <p className={`${theme.colors.textPrimary} font-medium`}>{selectedLog.action}</p>
              </div>

              <div>
                <p className={`text-sm ${theme.colors.textMuted} mb-1`}>Details</p>
                <p className={`${theme.colors.textPrimary}`}>{selectedLog.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${theme.colors.textMuted} mb-1`}>User</p>
                  <p className={`${theme.colors.textPrimary}`}>{selectedLog.userName || 'System'}</p>
                </div>

                <div>
                  <p className={`text-sm ${theme.colors.textMuted} mb-1`}>Timestamp</p>
                  <p className={`${theme.colors.textPrimary}`}>{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className={`text-sm ${theme.colors.textMuted} mb-1`}>Severity</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityColor(selectedLog.severity)}`}>
                  {selectedLog.severity}
                </span>
              </div>

              {selectedLog.ipAddress && (
                <div>
                  <p className={`text-sm ${theme.colors.textMuted} mb-1`}>IP Address</p>
                  <p className={`${theme.colors.textPrimary}`}>{selectedLog.ipAddress}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <p className={`text-sm ${theme.colors.textMuted} mb-1`}>User Agent</p>
                  <p className={`${theme.colors.textPrimary} text-sm break-all`}>{selectedLog.userAgent}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
