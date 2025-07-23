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
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaCreditCard className="text-green-500" />
            Payment Management
          </h1>
          <p className="text-gray-400 mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaDownload /> Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Record Payment
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {analytics?.map((stat, index) => (
          <motion.div
            key={stat._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-400 text-sm font-medium">{stat._id?.toUpperCase()}</h3>
              {getStatusIcon(stat._id)}
            </div>
            <p className="text-2xl font-bold text-white">{stat.count}</p>
            <p className="text-green-400 text-sm">₹{stat.totalAmount?.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 p-6 rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="monthly_rent">Monthly Rent</option>
            <option value="security_deposit">Security Deposit</option>
            <option value="maintenance_charge">Maintenance</option>
            <option value="damage_charge">Damage Charge</option>
            <option value="late_fee">Late Fee</option>
            <option value="refund">Refund</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors">
            <FaFilter /> More Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
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
