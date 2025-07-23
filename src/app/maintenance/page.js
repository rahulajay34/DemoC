"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaWrench,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaEye
} from "react-icons/fa";

export default function MaintenancePage() {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMaintenanceRecords();
  }, [statusFilter, priorityFilter]);

  const fetchMaintenanceRecords = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const response = await fetch(`/api/maintenance?${params}`);
      const data = await response.json();
      setMaintenanceRecords(data.maintenance || []);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500 bg-red-100';
      case 'high':
        return 'text-orange-500 bg-orange-100';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100';
      case 'low':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-100';
      case 'in_progress':
        return 'text-blue-500 bg-blue-100';
      case 'scheduled':
        return 'text-yellow-500 bg-yellow-100';
      case 'cancelled':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'in_progress':
        return <FaClock className="text-blue-500" />;
      case 'scheduled':
        return <FaCalendarAlt className="text-yellow-500" />;
      case 'cancelled':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const filteredRecords = maintenanceRecords.filter(record =>
    record.bike?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.bike?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.bike?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaWrench className="text-orange-500" />
            Maintenance Management
          </h1>
          <p className="text-gray-400 mt-1">Track and manage bike maintenance schedules</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Schedule Maintenance
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 p-6 rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search maintenance records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors">
            <FaFilter /> More Filters
          </button>
        </div>
      </div>

      {/* Maintenance Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecords.map((record, index) => (
          <motion.div
            key={record._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {record.bike?.make} {record.bike?.model}
                </h3>
                <p className="text-gray-400 text-sm">{record.bike?.number}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(record.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(record.priority)}`}>
                  {record.priority?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Maintenance Details */}
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-gray-400 text-xs">Type & Category</p>
                <p className="text-white">{record.type} - {record.category}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-xs">Description</p>
                <p className="text-white text-sm line-clamp-2">{record.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs">Scheduled Date</p>
                  <p className="text-white text-sm">
                    {new Date(record.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                {record.completedDate && (
                  <div>
                    <p className="text-gray-400 text-xs">Completed Date</p>
                    <p className="text-white text-sm">
                      {new Date(record.completedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {record.cost?.total > 0 && (
                <div>
                  <p className="text-gray-400 text-xs">Total Cost</p>
                  <p className="text-green-400 font-semibold">₹{record.cost.total.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {record.status?.replace('_', ' ').toUpperCase()}
              </span>
              <button className="text-orange-400 hover:text-orange-300 transition-colors">
                <FaEye /> View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaWrench className="mx-auto text-6xl text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Maintenance Records Found</h3>
          <p className="text-gray-500 mb-6">Schedule your first maintenance to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            Schedule Maintenance
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 p-6 rounded-2xl animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-4"></div>
              <div className="h-3 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
