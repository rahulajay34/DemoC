"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCreditCard,
  FaPlus,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave
} from "react-icons/fa";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, typeFilter]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      
      const response = await fetch(`/api/payments?${params}`);
      const data = await response.json();
      setPayments(data.payments || []);
      setAnalytics(data.analytics || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-500 bg-green-100';
      case 'pending':
        return 'text-yellow-500 bg-yellow-100';
      case 'overdue':
        return 'text-red-500 bg-red-100';
      case 'partial':
        return 'text-orange-500 bg-orange-100';
      case 'failed':
        return 'text-red-500 bg-red-100';
      case 'refunded':
        return 'text-blue-500 bg-blue-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'overdue':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'partial':
        return <FaMoneyBillWave className="text-orange-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      'monthly_rent': 'Monthly Rent',
      'security_deposit': 'Security Deposit',
      'maintenance_charge': 'Maintenance',
      'damage_charge': 'Damage Charge',
      'late_fee': 'Late Fee',
      'refund': 'Refund',
      'adjustment': 'Adjustment'
    };
    return typeLabels[type] || type;
  };

  const filteredPayments = payments.filter(payment =>
    payment.rider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.rider?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 flex-wrap">
            <FaCreditCard className="text-green-500" />
            <span>Payment Management</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Track and manage all payment transactions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          >
            <FaDownload /> Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
          >
            <FaPlus /> Record Payment
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {analytics?.map((stat, index) => (
          <motion.div
            key={stat._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-4 sm:p-6 rounded-2xl border border-gray-700/50"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-400 text-xs sm:text-sm font-medium truncate">{stat._id?.toUpperCase()}</h3>
              {getStatusIcon(stat._id)}
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{stat.count}</p>
            <p className="text-green-400 text-xs sm:text-sm truncate">₹{stat.totalAmount?.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card bg-gray-800/50 p-3 sm:p-4 lg:p-6 rounded-xl mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base backdrop-blur-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all text-sm sm:text-base dark-theme-select backdrop-blur-sm"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all text-sm sm:text-base dark-theme-select backdrop-blur-sm"
            >
              <option value="">All Types</option>
              <option value="monthly_rent">Monthly Rent</option>
              <option value="security_deposit">Security Deposit</option>
              <option value="maintenance_charge">Maintenance</option>
              <option value="damage_charge">Damage Charge</option>
            </select>
            <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600/50 hover:bg-gray-600/50 transition-all backdrop-blur-sm text-sm sm:text-base">
              <FaFilter className="text-sm" /> 
              <span className="hidden xs:inline">More Filters</span>
              <span className="xs:hidden">Filters</span>
            </button>
          </div>
        </div>
      </div>
      {/* Payments Table/Cards */}
      <div className="glass-card bg-gray-800/50 rounded-xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rider
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPayments.map((payment, index) => (
                <motion.tr
                  key={payment._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{payment.paymentId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{payment.rider?.name}</div>
                      <div className="text-sm text-gray-400">{payment.rider?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{getTypeLabel(payment.type)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-400">₹{payment.amount?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">
                      <FaEye />
                    </button>
                    <button className="text-green-400 hover:text-green-300">
                      <FaDownload />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
          {filteredPayments.map((payment, index) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card bg-gray-700/30 p-3 sm:p-4 rounded-lg border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300"
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm sm:text-base line-clamp-1">{payment.paymentId}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{payment.rider?.name}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="hidden xs:inline">{payment.status?.toUpperCase()}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Type</p>
                    <p className="text-white font-medium">{getTypeLabel(payment.type)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Amount</p>
                    <p className="text-green-400 font-semibold">₹{payment.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Due Date</p>
                    <p className="text-white">{new Date(payment.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Rider Email</p>
                    <p className="text-white truncate">{payment.rider?.email}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-700/30">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="View Details"
                  >
                    <FaEye size={14} />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center"
                    title="Download Receipt"
                  >
                    <FaDownload size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaCreditCard className="mx-auto text-6xl text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Payments Found</h3>
          <p className="text-gray-500 mb-6">No payment records match your current filters</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 p-4 rounded-lg animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
