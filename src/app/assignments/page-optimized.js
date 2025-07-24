// I need to fetch multiple MongoDB collections (assignments, riders, bikes) for this page. Using Promise.all and SWR to fetch them in parallel to improve performance significantly.
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SkeletonTable from "@/components/SkeletonTable";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaUser, FaMotorcycle, FaRupeeSign, FaCalendarAlt } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

// Optimized data fetching imports
import { useParallelFetch, useOptimizedFetch } from "@/hooks/useOptimizedFetch";
import { PageTransition, staggerContainer, staggerItem, hoverLift } from "@/components/PageTransition";
import { apiRequest, parallelApiRequests } from "@/utils/apiHelper";

export default function AssignmentsPage() {
  // Form state
  const [selectedRider, setSelectedRider] = useState("");
  const [selectedBike, setSelectedBike] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [monthlyCharge, setMonthlyCharge] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  
  // UI state
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Optimized parallel data fetching for all required collections
  const { 
    results: { 
      assignments: assignmentsResult, 
      riders: ridersResult, 
      bikes: bikesResult 
    }, 
    isLoading: dataLoading, 
    hasError,
    refresh: refreshAllData 
  } = useParallelFetch([
    { key: 'assignments', url: '/api/assignments' },
    { key: 'riders', url: '/api/riders?status=active' },
    { key: 'bikes', url: '/api/bikes?status=available' }
  ], {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true
  });

  // Extract data from parallel fetch results
  const assignments = assignmentsResult?.data?.assignments || assignmentsResult?.data || [];
  const riders = ridersResult?.data?.riders || ridersResult?.data || [];
  const availableBikes = (bikesResult?.data?.bikes || bikesResult?.data || [])
    .filter((b) => b.status === "available");

  // Filter assignments based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAssignments(assignments);
    } else {
      const filtered = assignments.filter((assignment) =>
        assignment.rider?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.bike?.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.assignmentId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAssignments(filtered);
    }
  }, [assignments, searchQuery]);

  // Optimized form submission with better error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRider || !selectedBike || !tenureMonths || !monthlyCharge) {
      toast.error("❌ Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const assignmentData = {
        rider: selectedRider,
        bike: selectedBike,
        tenureMonths: parseInt(tenureMonths),
        monthlyCharge: parseFloat(monthlyCharge),
        securityDeposit: parseFloat(securityDeposit) || 0,
      };

      const result = await apiRequest('/api/assignments', {
        method: 'POST',
        body: JSON.stringify(assignmentData)
      });

      if (result.success) {
        toast.success("✅ Assignment created successfully!");
        resetForm();
        setShowAddForm(false);
        refreshAllData(); // Refresh all data after successful creation
      } else {
        toast.error(`❌ Failed to create assignment: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("❌ Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  // Optimized update function
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingAssignment || !selectedRider || !selectedBike) {
      toast.error("❌ Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        rider: selectedRider,
        bike: selectedBike,
        tenureMonths: parseInt(tenureMonths),
        monthlyCharge: parseFloat(monthlyCharge),
        securityDeposit: parseFloat(securityDeposit) || 0,
      };

      const result = await apiRequest(`/api/assignments/${editingAssignment._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (result.success) {
        toast.success("✅ Assignment updated successfully!");
        resetForm();
        setEditingAssignment(null);
        setShowAddForm(false);
        refreshAllData();
      } else {
        toast.error(`❌ Failed to update assignment: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("❌ Failed to update assignment");
    } finally {
      setLoading(false);
    }
  };

  // Optimized delete function
  const handleDelete = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    setLoading(true);
    try {
      const result = await apiRequest(`/api/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        toast.success("✅ Assignment deleted successfully!");
        refreshAllData();
      } else {
        toast.error(`❌ Failed to delete assignment: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("❌ Failed to delete assignment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRider("");
    setSelectedBike("");
    setTenureMonths("");
    setMonthlyCharge("");
    setSecurityDeposit("");
  };

  const populateForm = (assignment) => {
    setSelectedRider(assignment.rider?._id || "");
    setSelectedBike(assignment.bike?._id || "");
    setTenureMonths(assignment.tenureMonths?.toString() || "");
    setMonthlyCharge(assignment.monthlyCharge?.toString() || "");
    setSecurityDeposit(assignment.securityDeposit?.toString() || "");
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    populateForm(assignment);
    setShowAddForm(true);
  };

  // Enhanced export function with better performance
  const handleExport = async () => {
    try {
      toast.info("📊 Preparing export...");
      
      const exportData = filteredAssignments.map(assignment => ({
        'Assignment ID': assignment.assignmentId || 'N/A',
        'Rider Name': assignment.rider?.name || 'N/A',
        'Rider Email': assignment.rider?.email || 'N/A',
        'Bike Registration': assignment.bike?.registrationNumber || 'N/A',
        'Bike Model': assignment.bike?.model || 'N/A',
        'Start Date': assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A',
        'End Date': assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'N/A',
        'Tenure (Months)': assignment.tenureMonths || 0,
        'Monthly Charge': assignment.monthlyCharge || 0,
        'Security Deposit': assignment.securityDeposit || 0,
        'Status': assignment.status || 'active',
        'Payment Status': assignment.paymentStatus || 'pending'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Assignments");
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(data, `assignments-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("📊 Export completed successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("❌ Failed to export data");
    }
  };

  if (dataLoading) {
    return (
      <PageTransition variant="fade">
        <div className="p-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <SkeletonTable columns={6} rows={8} />
        </div>
      </PageTransition>
    );
  }

  if (hasError) {
    return (
      <PageTransition variant="fade">
        <div className="p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-red-800 text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-red-600 text-sm mb-4">There was an error loading the assignments data</p>
            <button 
              onClick={refreshAllData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="slide">
      <div className="p-4 sm:p-8 space-y-6">
        {/* Header with enhanced animations */}
        <motion.div 
          variants={staggerItem}
          initial="initial"
          animate="animate"
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
        >
          <div>
            <motion.h1 
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Assignments Management
            </motion.h1>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Manage bike assignments and rider relationships
            </motion.p>
          </div>
          
          <motion.div 
            className="flex gap-3 mt-4 sm:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Export</span>
            </motion.button>
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus size={16} />
              <span>Add Assignment</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Search Bar with smooth animation */}
        <motion.div 
          variants={staggerItem}
          initial="initial"
          animate="animate"
          className="relative"
        >
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            />
          </div>
        </motion.div>

        {/* Data Table with enhanced animations */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Assignment ID', 'Rider', 'Bike', 'Duration', 'Monthly Charge', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment, index) => (
                  <motion.tr
                    key={assignment._id}
                    variants={staggerItem}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assignment.assignmentId || `ASN-${assignment._id?.slice(-6)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="text-blue-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.rider?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.rider?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMotorcycle className="text-green-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.bike?.registrationNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.bike?.model || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaCalendarAlt className="text-purple-500 mr-2" />
                        {assignment.tenureMonths || 0} months
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaRupeeSign className="text-yellow-500 mr-1" />
                        {(assignment.monthlyCharge || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : assignment.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleEdit(assignment)}
                          className="text-orange-500 hover:text-orange-700 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaEdit />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(assignment._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAssignments.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FaClipboardList className="mx-auto text-gray-400 text-5xl mb-4" />
              <p className="text-gray-500 text-lg">No assignments found</p>
              <p className="text-gray-400 text-sm">Create your first assignment to get started</p>
            </motion.div>
          )}
        </motion.div>

        {/* Add/Edit Form Modal with smooth transitions */}
        {showAddForm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
                </h2>
                <motion.button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAssignment(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={20} />
                </motion.button>
              </div>

              <form onSubmit={editingAssignment ? handleUpdate : handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    value={selectedRider}
                    onChange={(e) => setSelectedRider(e.target.value)}
                    required
                    options={riders.map(rider => ({
                      value: rider._id,
                      label: `${rider.name} (${rider.email})`
                    }))}
                    placeholder="Select Rider"
                  />
                  
                  <FormSelect
                    value={selectedBike}
                    onChange={(e) => setSelectedBike(e.target.value)}
                    required
                    options={availableBikes.map(bike => ({
                      value: bike._id,
                      label: `${bike.registrationNumber} - ${bike.model}`
                    }))}
                    placeholder="Select Bike"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    type="number"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value)}
                    placeholder="Tenure (Months)"
                    required
                    min="1"
                    max="60"
                  />
                  
                  <FormInput
                    type="number"
                    value={monthlyCharge}
                    onChange={(e) => setMonthlyCharge(e.target.value)}
                    placeholder="Monthly Charge (₹)"
                    required
                    min="0"
                    step="0.01"
                  />
                  
                  <FormInput
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="Security Deposit (₹)"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAssignment(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Performance indicator */}
        <motion.div 
          className="text-center text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Optimized with parallel data fetching • {filteredAssignments.length} assignments loaded
        </motion.div>
      </div>
    </PageTransition>
  );
}
