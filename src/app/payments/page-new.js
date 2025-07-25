"use client";
import { useState, useEffect } from "react";
import { FaCreditCard, FaPlus, FaSearch, FaTimes, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function PaymentsPage() {
  const { theme, getThemeClasses } = useTheme();
  const [payments, setPayments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Form state
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [selectedRider, setSelectedRider] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [description, setDescription] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      
      const [paymentsRes, assignmentsRes, ridersRes] = await Promise.all([
        fetch(`/api/payments?${params}`),
        fetch('/api/assignments?status=active'),
        fetch('/api/riders?status=active')
      ]);
      
      const paymentsData = await paymentsRes.json();
      const assignmentsData = await assignmentsRes.json();
      const ridersData = await ridersRes.json();

      const payments = paymentsData.payments || paymentsData || [];
      const assignments = assignmentsData.assignments || assignmentsData || [];
      const riders = ridersData.riders || ridersData || [];

      setPayments(payments);
      setFilteredPayments(payments);
      setAssignments(assignments);
      setRiders(riders);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("❌ Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAssignment("");
    setSelectedRider("");
    setPaymentType("");
    setAmount("");
    setDueDate("");
    setPaymentMethod("cash");
    setDescription("");
  };

  const populateForm = (payment) => {
    setSelectedAssignment(payment.assignment?._id || "");
    setSelectedRider(payment.rider?._id || "");
    setPaymentType(payment.type);
    setAmount(payment.amount.toString());
    setDueDate(payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : "");
    setPaymentMethod(payment.paymentMethod);
    setDescription(payment.description || "");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newPayment = {
        assignment: selectedAssignment,
        rider: selectedRider,
        type: paymentType,
        amount: parseFloat(amount),
        dueDate: dueDate,
        paymentMethod: paymentMethod,
        description: description
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPayment),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchData();
        resetForm();
        setShowAddForm(false);
        toast.success("💳 Payment record created successfully!");
      } else {
        toast.error(`❌ Failed to create payment: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error("❌ Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    populateForm(payment);
    setShowAddForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;

    setLoading(true);
    try {
      const updatedPayment = {
        assignment: selectedAssignment,
        rider: selectedRider,
        type: paymentType,
        amount: parseFloat(amount),
        dueDate: dueDate,
        paymentMethod: paymentMethod,
        description: description
      };

      const res = await fetch(`/api/payments/${editingPayment._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPayment),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchData();
        resetForm();
        setShowAddForm(false);
        setEditingPayment(null);
        toast.success("💳 Payment updated successfully!");
      } else {
        toast.error(`❌ Failed to update payment: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error("❌ Failed to update payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentId) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
        toast.success("💳 Payment deleted successfully!");
      } else {
        let errorMessage = 'Unknown error';
        try {
          const result = await res.json();
          errorMessage = result.error || 'Unknown error';
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = res.statusText || `HTTP ${res.status}`;
        }
        toast.error(`❌ Failed to delete payment: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error("❌ Failed to delete payment");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (editingPayment) {
      handleUpdate(e);
    } else {
      handleAdd(e);
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setShowAddForm(false);
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return getThemeClasses('bg-green-200/80 text-black border-green-300', 'bg-green-500/20 text-green-300');
      case 'pending': return getThemeClasses('bg-yellow-200/80 text-black border-yellow-300', 'bg-yellow-500/20 text-yellow-300');
      case 'overdue': return getThemeClasses('bg-red-200/80 text-black border-red-300', 'bg-red-500/20 text-red-300');
      case 'partial': return getThemeClasses('bg-blue-200/80 text-black border-blue-300', 'bg-blue-500/20 text-blue-300');
      case 'refunded': return getThemeClasses('bg-purple-200/80 text-black border-purple-300', 'bg-purple-500/20 text-purple-300');
      default: return getThemeClasses('bg-gray-200/80 text-black border-gray-300', 'bg-gray-500/20 text-gray-300');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'monthly_rent': return getThemeClasses('bg-blue-200/80 text-black border-blue-300', 'bg-blue-500/20 text-blue-300');
      case 'security_deposit': return getThemeClasses('bg-green-200/80 text-black border-green-300', 'bg-green-500/20 text-green-300');
      case 'maintenance_charge': return getThemeClasses('bg-orange-200/80 text-black border-orange-300', 'bg-orange-500/20 text-orange-300');
      case 'damage_charge': return getThemeClasses('bg-red-200/80 text-black border-red-300', 'bg-red-500/20 text-red-300');
      case 'late_fee': return getThemeClasses('bg-purple-200/80 text-black border-purple-300', 'bg-purple-500/20 text-purple-300');
      default: return getThemeClasses('bg-gray-200/80 text-black border-gray-300', 'bg-gray-500/20 text-gray-300');
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPayments(payments);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPayments(
        payments.filter((payment) =>
          payment.rider?.name?.toLowerCase().includes(query) ||
          payment.rider?.email?.toLowerCase().includes(query) ||
          payment.paymentId?.toLowerCase().includes(query) ||
          payment.type?.toLowerCase().includes(query) ||
          payment.paymentMethod?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, payments]);

  return (
    <section className="animate-fade-in glass-card p-6 md:p-8">
      <div className="card-content">
        {/* Header & Search Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FaCreditCard className="mr-3 text-green-400" />
            Payments
          </h2>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className="text-white/80 hover:text-white text-lg p-2"
            aria-label={searchActive ? "Close search" : "Open search"}
          >
            {searchActive ? <FaTimes size={22} /> : <FaSearch size={22} />}
          </button>
        </div>

        {/* Search Input */}
        {searchActive && (
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by rider, payment ID, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-96 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-4 py-2"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-4 py-2"
          >
            <option value="">All Types</option>
            <option value="monthly_rent">Monthly Rent</option>
            <option value="security_deposit">Security Deposit</option>
            <option value="maintenance_charge">Maintenance Charge</option>
            <option value="damage_charge">Damage Charge</option>
            <option value="late_fee">Late Fee</option>
            <option value="refund">Refund</option>
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="cheetah-gradient-btn px-6 py-2 font-semibold"
          >
            <FaPlus className="mr-2" />
            {editingPayment ? 'Edit Payment' : 'Add Payment'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <form
            onSubmit={handleFormSubmit}
            className="w-full p-6 bg-black/10 rounded-2xl mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingPayment ? 'Edit Payment' : 'Add New Payment'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-4 py-2"
                required
              >
                <option value="">Select Rider *</option>
                {riders.map((rider) => (
                  <option key={rider._id} value={rider._id}>
                    {rider.name} - {rider.email}
                  </option>
                ))}
              </select>

              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-4 py-2"
                required
              >
                <option value="">Select Assignment *</option>
                {assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment._id}>
                    {assignment.rider?.name} - {assignment.bike?.number}
                  </option>
                ))}
              </select>

              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-4 py-2"
                required
              >
                <option value="">Select Type *</option>
                <option value="monthly_rent">Monthly Rent</option>
                <option value="security_deposit">Security Deposit</option>
                <option value="maintenance_charge">Maintenance Charge</option>
                <option value="damage_charge">Damage Charge</option>
                <option value="late_fee">Late Fee</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>

              <input
                type="number"
                min="100"
                max="50000"
                step="0.01"
                placeholder="Amount in ₹ (e.g., 3000.50) *"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-4 py-2"
                title="Please enter amount between ₹100 to ₹50,000"
                required
              />

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-4 py-2"
                title="Select the due date for this payment"
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-4 py-2"
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>

              <textarea
                placeholder="Description (e.g., Monthly rent for January 2025, Maintenance charge for brake repair)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-4 py-2 col-span-full"
                maxLength="500"
                title="Optional description for this payment (max 500 characters)"
                rows="2"
              />

              <div className="col-span-full flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
                >
                  {loading ? "Processing..." : (editingPayment ? "Update Payment" : "Add Payment")}
                </button>
                {editingPayment && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-2 font-semibold rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Payments Table */}
        {loading ? (
          <SkeletonTable columns={8} rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-sm">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left">Payment ID</th>
                  <th className="px-4 py-3 text-left">Rider</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Due Date</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment, idx) => (
                    <tr
                      key={payment._id}
                      className="border-b border-white/10 animate-slide-up hover:bg-white/5"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {payment.paymentId || payment._id.slice(-8)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{payment.rider?.name || 'N/A'}</div>
                          <div className="text-xs text-white/60">{payment.rider?.email || ''}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(payment.type)}`}>
                          {payment.type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{payment.amount}</td>
                      <td className="px-4 py-3">
                        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'Not set'}
                      </td>
                      <td className="px-4 py-3 capitalize">{payment.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(payment)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Edit payment"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(payment._id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete payment"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-white/50">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
