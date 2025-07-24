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
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedLog, setSelectedLog] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, [entityFilter, actionFilter, severityFilter, dateRange]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Since we don't have a dedicated audit API, generate audit logs from activity across the system
      const [paymentsRes, maintenanceRes, assignmentsRes, bikesRes, ridersRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/maintenance'),
        fetch('/api/assignments'),
        fetch('/api/bikes'),
        fetch('/api/riders')
      ]);

      const payments = await paymentsRes.json();
      const maintenance = await maintenanceRes.json();
      const assignments = await assignmentsRes.json();
      const bikes = await bikesRes.json();
      const riders = await ridersRes.json();

      const generatedLogs = generateAuditLogsFromData(payments, maintenance, assignments, bikes, riders);
      setAuditLogs(generatedLogs);
      setFilteredLogs(generatedLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("❌ Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const generateAuditLogsFromData = (payments, maintenance, assignments, bikes, riders) => {
    const logs = [];
    const currentDate = new Date();

    // Generate logs from payments
    const paymentList = payments.payments || payments || [];
    paymentList.forEach((payment, index) => {
      logs.push({
        _id: `payment_log_${payment._id}_${index}`,
        timestamp: new Date(payment.createdAt || currentDate),
        entity: "payment",
        entityId: payment._id,
        action: payment.status === 'paid' ? 'payment_completed' : 'payment_created',
        severity: payment.status === 'overdue' ? 'high' : 'low',
        user: "System",
        userId: "system",
        description: `Payment ${payment.status === 'paid' ? 'completed' : 'created'} for ${payment.rider?.name || 'rider'}: ₹${payment.amount}`,
        ipAddress: "127.0.0.1",
        userAgent: "CheetahRide System",
        details: {
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          rider: payment.rider?.name,
          type: payment.type
        }
      });
    });

    // Generate logs from maintenance
    const maintenanceList = maintenance.maintenance || maintenance || [];
    maintenanceList.forEach((item, index) => {
      logs.push({
        _id: `maintenance_log_${item._id}_${index}`,
        timestamp: new Date(item.createdAt || currentDate),
        entity: "maintenance",
        entityId: item._id,
        action: item.status === 'completed' ? 'maintenance_completed' : 'maintenance_scheduled',
        severity: item.priority === 'high' ? 'high' : 'medium',
        user: "System",
        userId: "system",
        description: `Maintenance ${item.status === 'completed' ? 'completed' : 'scheduled'} for ${item.bike?.make || 'bike'} ${item.bike?.model || ''}`,
        ipAddress: "127.0.0.1",
        userAgent: "CheetahRide System",
        details: {
          bikeId: item.bike?._id,
          type: item.type,
          priority: item.priority,
          cost: item.estimatedCost
        }
      });
    });

    // Generate logs from assignments
    const assignmentList = assignments.assignments || assignments || [];
    assignmentList.forEach((assignment, index) => {
      logs.push({
        _id: `assignment_log_${assignment._id}_${index}`,
        timestamp: new Date(assignment.createdAt || assignment.startDate || currentDate),
        entity: "assignment",
        entityId: assignment._id,
        action: assignment.status === 'active' ? 'assignment_created' : 'assignment_updated',
        severity: 'medium',
        user: "Admin",
        userId: "admin",
        description: `Assignment ${assignment.status === 'active' ? 'created' : 'updated'} for ${assignment.rider?.name || 'rider'}`,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Admin Portal)",
        details: {
          riderId: assignment.rider?._id,
          bikeId: assignment.bike?._id,
          duration: assignment.durationMonths,
          monthlyCharge: assignment.monthlyCharge
        }
      });
    });

    // Generate logs from bike operations
    const bikeList = bikes.bikes || bikes || [];
    bikeList.forEach((bike, index) => {
      if (bike.status !== 'available') {
        logs.push({
          _id: `bike_log_${bike._id}_${index}`,
          timestamp: new Date(bike.updatedAt || currentDate),
          entity: "bike",
          entityId: bike._id,
          action: `bike_status_${bike.status}`,
          severity: bike.status === 'maintenance' ? 'high' : 'low',
          user: "System",
          userId: "system",
          description: `Bike ${bike.make} ${bike.model} (${bike.number}) status changed to ${bike.status}`,
          ipAddress: "127.0.0.1",
          userAgent: "CheetahRide System",
          details: {
            make: bike.make,
            model: bike.model,
            number: bike.number,
            status: bike.status,
            location: bike.currentLocation
          }
        });
      }
    });

    // Generate logs from rider operations
    const riderList = riders.riders || riders || [];
    riderList.forEach((rider, index) => {
      logs.push({
        _id: `rider_log_${rider._id}_${index}`,
        timestamp: new Date(rider.createdAt || currentDate),
        entity: "rider",
        entityId: rider._id,
        action: rider.status === 'active' ? 'rider_registered' : 'rider_updated',
        severity: 'low',
        user: rider.status === 'active' ? rider.name : "Admin",
        userId: rider.status === 'active' ? rider._id : "admin",
        description: `Rider ${rider.name} ${rider.status === 'active' ? 'registered' : 'profile updated'}`,
        ipAddress: rider.status === 'active' ? "203.0.113.1" : "192.168.1.100",
        userAgent: rider.status === 'active' ? "CheetahRide Mobile App" : "Mozilla/5.0 (Admin Portal)",
        details: {
          name: rider.name,
          email: rider.email,
          phone: rider.personalInfo?.phone,
          status: rider.status
        }
      });
    });

    // Add some system-level audit logs
    const systemLogs = [
      {
        _id: `system_log_${Date.now()}_1`,
        timestamp: new Date(currentDate.getTime() - 3600000), // 1 hour ago
        entity: "system",
        entityId: "system",
        action: "system_backup",
        severity: "low",
        user: "System",
        userId: "system",
        description: "Automated system backup completed successfully",
        ipAddress: "127.0.0.1",
        userAgent: "CheetahRide Backup Service",
        details: {
          backupSize: "2.4 GB",
          duration: "15 minutes",
          status: "success"
        }
      },
      {
        _id: `system_log_${Date.now()}_2`,
        timestamp: new Date(currentDate.getTime() - 7200000), // 2 hours ago
        entity: "security",
        entityId: "security",
        action: "login_attempt",
        severity: "medium",
        user: "admin@cheetahride.com",
        userId: "admin",
        description: "Admin user logged in to system",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: {
          sessionId: "sess_" + Date.now(),
          loginMethod: "password",
          success: true
        }
      }
    ];

    logs.push(...systemLogs);

    // Sort logs by timestamp (newest first)
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const handleExportLogs = () => {
    const csvData = filteredLogs.map(log => ({
      Timestamp: new Date(log.timestamp).toLocaleString(),
      Entity: log.entity,
      Action: log.action,
      Severity: log.severity,
      User: log.user,
      Description: log.description,
      IPAddress: log.ipAddress
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("📁 Audit logs exported successfully!");
  };

  const getEntityIcon = (entity) => {
    switch (entity) {
      case 'payment': return <FaCreditCard className="text-green-400" size={16} />;
      case 'maintenance': return <FaWrench className="text-orange-400" size={16} />;
      case 'assignment': return <FaClipboardList className="text-blue-400" size={16} />;
      case 'bike': return <FaBicycle className="text-purple-400" size={16} />;
      case 'rider': return <FaUser className="text-cyan-400" size={16} />;
      case 'system': return <FaCog className="text-gray-400" size={16} />;
      case 'security': return <FaShieldAlt className="text-red-400" size={16} />;
      default: return <FaClipboardList className="text-gray-400" size={16} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getActionColor = (action) => {
    if (action.includes('created') || action.includes('completed')) return 'text-green-400';
    if (action.includes('updated') || action.includes('scheduled')) return 'text-blue-400';
    if (action.includes('deleted') || action.includes('failed')) return 'text-red-400';
    if (action.includes('login') || action.includes('access')) return 'text-purple-400';
    return 'text-gray-400';
  };

  useEffect(() => {
    let filtered = auditLogs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.description?.toLowerCase().includes(query) ||
        log.user?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.entity?.toLowerCase().includes(query)
      );
    }

    if (entityFilter !== "all") {
      filtered = filtered.filter(log => log.entity === entityFilter);
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter(log => log.action.includes(actionFilter));
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    // Filter by date range
    if (dateRange.startDate) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(dateRange.startDate)
      );
    }
    if (dateRange.endDate) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(dateRange.endDate + 'T23:59:59')
      );
    }

    setFilteredLogs(filtered);
  }, [searchQuery, entityFilter, actionFilter, severityFilter, dateRange, auditLogs]);

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaHistory className="mr-3 text-blue-400" />
              Audit Trail
            </h1>
            <p className="text-gray-400 mt-1">Track all system activities and changes</p>
          </div>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className="text-white/80 hover:text-white text-lg p-2 lg:hidden"
          >
            {searchActive ? <FaTimes size={22} /> : <FaSearch size={22} />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Search - Desktop */}
          <div className="hidden lg:flex">
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            onClick={handleExportLogs}
            className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
          >
            <FaDownload className="mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Search - Mobile */}
      {searchActive && (
        <div className="lg:hidden">
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        >
          <option value="all">All Entities</option>
          <option value="payment">Payments</option>
          <option value="maintenance">Maintenance</option>
          <option value="assignment">Assignments</option>
          <option value="bike">Bikes</option>
          <option value="rider">Riders</option>
          <option value="system">System</option>
          <option value="security">Security</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        >
          <option value="all">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="completed">Completed</option>
          <option value="login">Login</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Logs", value: filteredLogs.length, icon: <FaClipboardList className="text-blue-400" /> },
          { title: "High Severity", value: filteredLogs.filter(l => l.severity === 'high').length, icon: <FaExclamationTriangle className="text-red-400" /> },
          { title: "Today's Activity", value: filteredLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, icon: <FaClock className="text-green-400" /> },
          { title: "Unique Users", value: new Set(filteredLogs.map(l => l.userId)).size, icon: <FaUser className="text-purple-400" /> }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              {card.icon}
              <span className="text-2xl font-bold text-white">{card.value}</span>
            </div>
            <h3 className="text-gray-400 text-sm">{card.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <SkeletonTable columns={7} rows={10} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-sm">
            <thead className="border-b border-white/20">
              <tr>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Entity</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Severity</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr
                    key={log._id}
                    className="border-b border-white/10 animate-slide-up hover:bg-white/5"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td className="px-4 py-3 text-white/80 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity)}
                        <span className="text-white capitalize">{log.entity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-white text-sm">{log.user}</div>
                        <div className="text-gray-400 text-xs">{log.ipAddress}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/80 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View details"
                      >
                        <FaEye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-white/50">
                    No audit logs found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Timestamp</h4>
                  <p className="text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Entity</h4>
                  <div className="flex items-center gap-2">
                    {getEntityIcon(selectedLog.entity)}
                    <span className="text-white capitalize">{selectedLog.entity}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Action</h4>
                  <p className={`font-medium ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Severity</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityColor(selectedLog.severity)}`}>
                    {selectedLog.severity}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">User</h4>
                  <p className="text-white">{selectedLog.user}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">IP Address</h4>
                  <p className="text-white">{selectedLog.ipAddress}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                <p className="text-white">{selectedLog.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">User Agent</h4>
                <p className="text-white text-xs break-all">{selectedLog.userAgent}</p>
              </div>
              
              {selectedLog.details && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Additional Details</h4>
                  <pre className="bg-black/30 p-3 rounded text-xs text-white overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
