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
  FaHistory
} from "react-icons/fa";

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // Simulated audit logs data
      const simulatedLogs = [
        {
          _id: "audit1",
          action: "CREATE",
          entity: "rider",
          entityId: "RD156",
          entityName: "Priya Singh",
          userId: "admin1",
          userName: "Admin User",
          timestamp: new Date("2024-01-15T14:30:00"),
          details: {
            operation: "User Registration",
            changes: {
              name: "Priya Singh",
              phone: "+91 98765 43210",
              email: "priya.singh@email.com",
              status: "active"
            }
          },
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        {
          _id: "audit2",
          action: "UPDATE",
          entity: "bike",
          entityId: "BK023",
          entityName: "Honda Activa 125",
          userId: "tech1",
          userName: "Technical Team",
          timestamp: new Date("2024-01-15T12:45:00"),
          details: {
            operation: "Maintenance Update",
            changes: {
              status: { from: "available", to: "maintenance" },
              lastServiceDate: new Date("2024-01-15T00:00:00"),
              nextServiceDate: new Date("2024-04-15T00:00:00")
            }
          },
          ipAddress: "192.168.1.105",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        {
          _id: "audit3",
          action: "CREATE",
          entity: "assignment",
          entityId: "ASN034",
          entityName: "Assignment #034",
          userId: "operator1",
          userName: "Operations Team",
          timestamp: new Date("2024-01-15T10:20:00"),
          details: {
            operation: "New Assignment",
            changes: {
              riderId: "RD089",
              bikeId: "BK045",
              startDate: new Date("2024-01-15T10:00:00"),
              duration: "7 days",
              totalAmount: 1500
            }
          },
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        },
        {
          _id: "audit4",
          action: "UPDATE",
          entity: "payment",
          entityId: "PAY078",
          entityName: "Payment #078",
          userId: "finance1",
          userName: "Finance Team",
          timestamp: new Date("2024-01-15T09:15:00"),
          details: {
            operation: "Payment Status Update",
            changes: {
              status: { from: "pending", to: "completed" },
              paymentMethod: "UPI",
              transactionId: "TXN789123456",
              amount: 1200
            }
          },
          ipAddress: "192.168.1.108",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        {
          _id: "audit5",
          action: "DELETE",
          entity: "rider",
          entityId: "RD012",
          entityName: "John Doe",
          userId: "admin1",
          userName: "Admin User",
          timestamp: new Date("2024-01-14T16:00:00"),
          details: {
            operation: "Account Deletion",
            reason: "User requested account closure",
            changes: {
              status: { from: "inactive", to: "deleted" },
              deletedAt: new Date("2024-01-14T16:00:00")
            }
          },
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        {
          _id: "audit6",
          action: "CREATE",
          entity: "maintenance",
          entityId: "MNT012",
          entityName: "Scheduled Service",
          userId: "tech2",
          userName: "Maintenance Team",
          timestamp: new Date("2024-01-14T14:30:00"),
          details: {
            operation: "Maintenance Record Creation",
            changes: {
              bikeId: "BK078",
              type: "scheduled",
              description: "Regular 3-month service",
              cost: 850,
              scheduledDate: new Date("2024-01-20T00:00:00")
            }
          },
          ipAddress: "192.168.1.110",
          userAgent: "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0"
        }
      ];
      setAuditLogs(simulatedLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE": return "text-green-400 bg-green-400/20";
      case "UPDATE": return "text-blue-400 bg-blue-400/20";
      case "DELETE": return "text-red-400 bg-red-400/20";
      case "VIEW": return "text-gray-400 bg-gray-400/20";
      default: return "text-purple-400 bg-purple-400/20";
    }
  };

  const getEntityIcon = (entity) => {
    switch (entity) {
      case "rider": return <FaUser className="text-blue-400" />;
      case "bike": return <FaBicycle className="text-green-400" />;
      case "assignment": return <FaClipboardList className="text-purple-400" />;
      case "payment": return <FaCreditCard className="text-yellow-400" />;
      case "maintenance": return <FaWrench className="text-orange-400" />;
      default: return <FaHistory className="text-gray-400" />;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.operation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === "all" || log.entity === entityFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    let matchesDate = true;
    if (dateRange.startDate && dateRange.endDate) {
      const logDate = new Date(log.timestamp);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      matchesDate = logDate >= startDate && logDate <= endDate;
    }
    
    return matchesSearch && matchesEntity && matchesAction && matchesDate;
  });

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "Action", "Entity", "Entity Name", "User", "Operation", "IP Address"].join(","),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.action,
        log.entity,
        log.entityName,
        log.userName,
        log.details.operation,
        log.ipAddress
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaClipboardList className="text-purple-500" />
            Audit Log
          </h1>
          <p className="text-gray-400 mt-1">Track all system activities and user actions</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportLogs}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaDownload /> Export CSV
          </motion.button>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-green-400 font-bold">CREATE</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {auditLogs.filter(log => log.action === "CREATE").length}
          </p>
          <p className="text-gray-400 text-sm">New records created</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-blue-400 font-bold">UPDATE</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {auditLogs.filter(log => log.action === "UPDATE").length}
          </p>
          <p className="text-gray-400 text-sm">Records modified</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-red-400 font-bold">DELETE</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {auditLogs.filter(log => log.action === "DELETE").length}
          </p>
          <p className="text-gray-400 text-sm">Records deleted</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaHistory className="text-purple-400" size={20} />
            <span className="text-gray-400">Total Activities</span>
          </div>
          <p className="text-2xl font-bold text-white">{auditLogs.length}</p>
          <p className="text-gray-400 text-sm">All time</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50 mb-8">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Entities</option>
              <option value="rider">Riders</option>
              <option value="bike">Bikes</option>
              <option value="assignment">Assignments</option>
              <option value="payment">Payments</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW">View</option>
            </select>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium">Timestamp</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Action</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Entity</th>
                  <th className="text-left p-4 text-gray-400 font-medium">User</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Operation</th>
                  <th className="text-left p-4 text-gray-400 font-medium">IP Address</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-400" size={12} />
                        <div>
                          <p className="text-white text-sm">{log.timestamp.toLocaleDateString()}</p>
                          <p className="text-gray-400 text-xs">{log.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity)}
                        <div>
                          <p className="text-white font-medium">{log.entityName}</p>
                          <p className="text-gray-400 text-sm">{log.entityId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-400" size={12} />
                        </div>
                        <div>
                          <p className="text-white text-sm">{log.userName}</p>
                          <p className="text-gray-400 text-xs">{log.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{log.details.operation}</td>
                    <td className="p-4 text-gray-300 font-mono text-sm">{log.ipAddress}</td>
                    <td className="p-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="View details"
                      >
                        <FaEye size={14} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLogs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <FaHistory className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No audit logs found</h3>
          <p className="text-gray-500">No activities match your current filters</p>
        </motion.div>
      )}
    </div>
  );
}
