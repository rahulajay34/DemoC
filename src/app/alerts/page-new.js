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
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state for creating alerts
  const [alertType, setAlertType] = useState("maintenance");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertPriority, setAlertPriority] = useState("medium");

  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 2 minutes
    const interval = setInterval(fetchAlerts, 120000);
    return () => clearInterval(interval);
  }, [typeFilter, statusFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Since we don't have a dedicated alerts API, generate alerts from other APIs
      const [paymentsRes, maintenanceRes, assignmentsRes, bikesRes] = await Promise.all([
        fetch('/api/payments?status=overdue'),
        fetch('/api/maintenance?status=pending'),
        fetch('/api/assignments'),
        fetch('/api/bikes')
      ]);

      const payments = await paymentsRes.json();
      const maintenance = await maintenanceRes.json();
      const assignments = await assignmentsRes.json();
      const bikes = await bikesRes.json();

      const generatedAlerts = generateAlertsFromData(payments, maintenance, assignments, bikes);
      setAlerts(generatedAlerts);
      setFilteredAlerts(generatedAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast.error("❌ Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const generateAlertsFromData = (payments, maintenance, assignments, bikes) => {
    const alerts = [];
    const currentDate = new Date();

    // Payment alerts
    const overduePayments = payments.payments || payments || [];
    overduePayments.forEach((payment, index) => {
      alerts.push({
        _id: `payment_${payment._id}_${index}`,
        type: "payment",
        priority: "high",
        title: "Overdue Payment",
        message: `Payment of ₹${payment.amount} from ${payment.rider?.name || 'rider'} is overdue`,
        status: "unread",
        createdAt: new Date(payment.dueDate || currentDate),
        relatedEntity: payment.rider?.name || 'Unknown Rider'
      });
    });

    // Maintenance alerts
    const pendingMaintenance = maintenance.maintenance || maintenance || [];
    pendingMaintenance.forEach((item, index) => {
      alerts.push({
        _id: `maintenance_${item._id}_${index}`,
        type: "maintenance",
        priority: item.priority === 'high' ? 'high' : 'medium',
        title: "Maintenance Required",
        message: `${item.bike?.make || 'Bike'} ${item.bike?.model || ''} requires ${item.type} maintenance`,
        status: "unread",
        createdAt: new Date(item.scheduledDate || currentDate),
        relatedEntity: `${item.bike?.make || ''} ${item.bike?.model || ''} (${item.bike?.number || ''})`
      });
    });

    // Assignment alerts
    const assignmentList = assignments.assignments || assignments || [];
    assignmentList.forEach((assignment, index) => {
      if (assignment.status === 'active' && assignment.endDate) {
        const endDate = new Date(assignment.endDate);
        const daysUntilEnd = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
          alerts.push({
            _id: `assignment_${assignment._id}_${index}`,
            type: "assignment",
            priority: daysUntilEnd <= 3 ? "high" : "medium",
            title: "Assignment Expiring Soon",
            message: `Assignment for ${assignment.rider?.name || 'rider'} expires in ${daysUntilEnd} days`,
            status: "unread",
            createdAt: currentDate,
            relatedEntity: assignment.rider?.name || 'Unknown Rider'
          });
        }
      }
    });

    // Bike alerts
    const bikeList = bikes.bikes || bikes || [];
    bikeList.forEach((bike, index) => {
      if (bike.status === 'maintenance') {
        alerts.push({
          _id: `bike_${bike._id}_${index}`,
          type: "fleet",
          priority: "medium",
          title: "Bike Under Maintenance",
          message: `${bike.make} ${bike.model} (${bike.number}) is currently under maintenance`,
          status: "unread",
          createdAt: currentDate,
          relatedEntity: `${bike.make} ${bike.model} (${bike.number})`
        });
      }
    });

    // Sort alerts by date (newest first)
    return alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    
    const newAlert = {
      _id: `custom_${Date.now()}`,
      type: alertType,
      priority: alertPriority,
      title: alertTitle,
      message: alertMessage,
      status: "unread",
      createdAt: new Date(),
      relatedEntity: "System Generated"
    };

    setAlerts(prev => [newAlert, ...prev]);
    setFilteredAlerts(prev => [newAlert, ...prev]);
    
    // Reset form
    setAlertTitle("");
    setAlertMessage("");
    setShowCreateForm(false);
    
    toast.success("🔔 Alert created successfully!");
  };

  const handleMarkAsRead = async (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert._id === alertId ? { ...alert, status: 'read' } : alert
    ));
    setFilteredAlerts(prev => prev.map(alert => 
      alert._id === alertId ? { ...alert, status: 'read' } : alert
    ));
    toast.success("✅ Alert marked as read");
  };

  const handleDeleteAlert = async (alertId) => {
    setAlerts(prev => prev.filter(alert => alert._id !== alertId));
    setFilteredAlerts(prev => prev.filter(alert => alert._id !== alertId));
    toast.success("🗑️ Alert deleted");
  };

  const handleBulkAction = (action) => {
    if (selectedAlerts.length === 0) {
      toast.error("Please select alerts first");
      return;
    }

    if (action === 'markRead') {
      setAlerts(prev => prev.map(alert => 
        selectedAlerts.includes(alert._id) ? { ...alert, status: 'read' } : alert
      ));
      setFilteredAlerts(prev => prev.map(alert => 
        selectedAlerts.includes(alert._id) ? { ...alert, status: 'read' } : alert
      ));
      toast.success(`✅ ${selectedAlerts.length} alerts marked as read`);
    } else if (action === 'delete') {
      setAlerts(prev => prev.filter(alert => !selectedAlerts.includes(alert._id)));
      setFilteredAlerts(prev => prev.filter(alert => !selectedAlerts.includes(alert._id)));
      toast.success(`🗑️ ${selectedAlerts.length} alerts deleted`);
    }
    
    setSelectedAlerts([]);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'payment': return <FaCreditCard className="text-green-400" size={16} />;
      case 'maintenance': return <FaWrench className="text-orange-400" size={16} />;
      case 'assignment': return <FaUser className="text-blue-400" size={16} />;
      case 'fleet': return <FaBicycle className="text-purple-400" size={16} />;
      default: return <FaInfoCircle className="text-gray-400" size={16} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  useEffect(() => {
    let filtered = alerts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.title?.toLowerCase().includes(query) ||
        alert.message?.toLowerCase().includes(query) ||
        alert.relatedEntity?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    setFilteredAlerts(filtered);
  }, [searchQuery, typeFilter, statusFilter, alerts]);

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaBell className="mr-3 text-orange-400" />
              Alerts & Notifications
            </h1>
            <p className="text-gray-400 mt-1">Stay updated with important system notifications</p>
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
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Alert
          </button>
        </div>
      </div>

      {/* Search - Mobile */}
      {searchActive && (
        <div className="lg:hidden">
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}

      {/* Filters and Bulk Actions */}
      <div className="flex flex-wrap gap-4 justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-3 py-2"
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
            className="bg-white/10 border border-white/20 rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {selectedAlerts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('markRead')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium flex items-center"
            >
              <FaEye className="mr-2" size={14} />
              Mark as Read
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium flex items-center"
            >
              <FaTrash className="mr-2" size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Create New Alert</h3>
          <form onSubmit={handleCreateAlert}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                required
              >
                <option value="maintenance">Maintenance</option>
                <option value="payment">Payment</option>
                <option value="assignment">Assignment</option>
                <option value="fleet">Fleet</option>
                <option value="system">System</option>
              </select>

              <select
                value={alertPriority}
                onChange={(e) => setAlertPriority(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <input
                type="text"
                placeholder="Alert Title *"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2 col-span-full"
                required
              />

              <textarea
                placeholder="Alert Message *"
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2 col-span-full"
                rows="3"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="cheetah-gradient-btn px-6 py-2 font-semibold"
              >
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 font-semibold rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Alerts List */}
      {loading ? (
        <SkeletonTable columns={1} rows={8} />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-4 rounded-2xl border ${
                alert.status === 'unread' ? 'border-orange-500/30' : 'border-gray-700/50'
              } hover:border-orange-500/50 transition-all`}
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

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <h3 className={`font-semibold ${alert.status === 'unread' ? 'text-white' : 'text-gray-300'}`}>
                        {alert.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                      {alert.status === 'unread' && (
                        <button
                          onClick={() => handleMarkAsRead(alert._id)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title="Mark as read"
                        >
                          <FaEye size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert._id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete alert"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">{alert.message}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Related: {alert.relatedEntity}</span>
                    <span className="capitalize">{alert.type} Alert</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredAlerts.length === 0 && !loading && (
            <div className="text-center py-12">
              <FaBell className="mx-auto text-gray-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No Alerts Found</h3>
              <p className="text-gray-400">You're all caught up! No alerts match your current filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
