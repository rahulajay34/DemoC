"use client";
import { useState, useEffect } from "react";
import { FaWrench, FaPlus, FaSearch, FaTimes, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function MaintenancePage() {
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Form state
  const [selectedBike, setSelectedBike] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const [maintenanceRes, bikesRes] = await Promise.all([
        fetch(`/api/maintenance?${params}`),
        fetch('/api/bikes')
      ]);
      
      const maintenanceData = await maintenanceRes.json();
      const bikesData = await bikesRes.json();

      const maintenance = maintenanceData.maintenance || maintenanceData || [];
      const bikes = bikesData.bikes || bikesData || [];

      setMaintenanceRecords(maintenance);
      setFilteredRecords(maintenance);
      setBikes(bikes);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("❌ Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedBike("");
    setMaintenanceType("");
    setCategory("");
    setPriority("medium");
    setDescription("");
    setScheduledDate("");
    setEstimatedCost("");
    setEstimatedDuration("");
  };

  const populateForm = (record) => {
    setSelectedBike(record.bike._id);
    setMaintenanceType(record.type);
    setCategory(record.category);
    setPriority(record.priority);
    setDescription(record.description);
    setScheduledDate(record.scheduledDate ? new Date(record.scheduledDate).toISOString().split('T')[0] : "");
    setEstimatedCost(record.cost?.estimated?.toString() || "");
    setEstimatedDuration(record.estimatedDuration?.toString() || "");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newRecord = {
        bike: selectedBike,
        type: maintenanceType,
        category: category,
        priority: priority,
        description: description,
        scheduledDate: scheduledDate,
        cost: {
          estimated: parseFloat(estimatedCost) || 0
        },
        estimatedDuration: parseInt(estimatedDuration) || 0
      };

      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecord),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchData();
        resetForm();
        setShowAddForm(false);
        toast.success("🔧 Maintenance record created successfully!");
      } else {
        toast.error(`❌ Failed to create maintenance record: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      toast.error("❌ Failed to create maintenance record");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    populateForm(record);
    setShowAddForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    setLoading(true);
    try {
      const updatedRecord = {
        bike: selectedBike,
        type: maintenanceType,
        category: category,
        priority: priority,
        description: description,
        scheduledDate: scheduledDate,
        cost: {
          estimated: parseFloat(estimatedCost) || 0
        },
        estimatedDuration: parseInt(estimatedDuration) || 0
      };

      const res = await fetch(`/api/maintenance/${editingRecord._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRecord),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchData();
        resetForm();
        setShowAddForm(false);
        setEditingRecord(null);
        toast.success("🔧 Maintenance record updated successfully!");
      } else {
        toast.error(`❌ Failed to update maintenance record: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      toast.error("❌ Failed to update maintenance record");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance/${recordId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
        toast.success("🔧 Maintenance record deleted successfully!");
      } else {
        let errorMessage = 'Unknown error';
        try {
          const result = await res.json();
          errorMessage = result.error || 'Unknown error';
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = res.statusText || `HTTP ${res.status}`;
        }
        toast.error(`❌ Failed to delete maintenance record: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast.error("❌ Failed to delete maintenance record");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (editingRecord) {
      handleUpdate(e);
    } else {
      handleAdd(e);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setShowAddForm(false);
    resetForm();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300';
      case 'high': return 'bg-orange-500/20 text-orange-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-300';
      case 'cancelled': return 'bg-red-500/20 text-red-300';
      case 'on_hold': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecords(maintenanceRecords);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRecords(
        maintenanceRecords.filter((record) =>
          record.bike?.make?.toLowerCase().includes(query) ||
          record.bike?.model?.toLowerCase().includes(query) ||
          record.bike?.number?.toLowerCase().includes(query) ||
          record.description?.toLowerCase().includes(query) ||
          record.type?.toLowerCase().includes(query) ||
          record.category?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, maintenanceRecords]);

  return (
    <section className="animate-fade-in glass-card p-6 md:p-8">
      <div className="card-content">
        {/* Header & Search Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FaWrench className="mr-3 text-orange-400" />
            Maintenance
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
              placeholder="Search by bike, type, category, or description..."
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
            className="bg-white/10 border border-white/20 rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On Hold</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-3 py-2"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="cheetah-gradient-btn px-6 py-2 font-semibold"
          >
            <FaPlus className="mr-2" />
            {editingRecord ? 'Edit Maintenance' : 'Add Maintenance'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <form
            onSubmit={handleFormSubmit}
            className="w-full p-6 bg-black/10 rounded-2xl mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingRecord ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                required
              >
                <option value="">Select Bike *</option>
                {bikes.map((bike) => (
                  <option key={bike._id} value={bike._id}>
                    {bike.make} {bike.model} ({bike.number})
                  </option>
                ))}
              </select>

              <select
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                required
              >
                <option value="">Select Type *</option>
                <option value="routine">Routine</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
                <option value="recall">Recall</option>
                <option value="upgrade">Upgrade</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                required
              >
                <option value="">Select Category *</option>
                <option value="engine">Engine</option>
                <option value="transmission">Transmission</option>
                <option value="brakes">Brakes</option>
                <option value="electrical">Electrical</option>
                <option value="body">Body</option>
                <option value="tires">Tires</option>
                <option value="battery">Battery</option>
                <option value="other">Other</option>
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                title="Select the date when maintenance should be performed"
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <input
                type="number"
                min="100"
                max="50000"
                step="0.01"
                placeholder="Estimated Cost in ₹ (e.g., 2500.00)"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                title="Please enter estimated cost between ₹100 to ₹50,000"
              />

              <input
                type="number"
                min="1"
                max="240"
                placeholder="Estimated Duration in hours (e.g., 4)"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                title="Please enter duration between 1 to 240 hours (10 days max)"
              />

              <textarea
                placeholder="Description (e.g., Replace brake pads, Engine oil change, Regular servicing) *"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2 col-span-full"
                maxLength="500"
                title="Please describe the maintenance work to be performed (max 500 characters)"
                rows="3"
                required
              />

              <div className="col-span-full flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
                >
                  {loading ? "Processing..." : (editingRecord ? "Update Record" : "Add Record")}
                </button>
                {editingRecord && (
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

        {/* Maintenance Table */}
        {loading ? (
          <SkeletonTable columns={7} rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-sm">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left">Bike</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Scheduled Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record, idx) => (
                    <tr
                      key={record._id}
                      className="border-b border-white/10 animate-slide-up hover:bg-white/5"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-mono">{record.bike?.number || 'N/A'}</div>
                          <div className="text-xs text-white/60">
                            {record.bike?.make} {record.bike?.model}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{record.type}</td>
                      <td className="px-4 py-3 capitalize">{record.category}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(record.priority)}`}>
                          {record.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString() : 'Not set'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Edit record"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete record"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-white/50">
                      No maintenance records found.
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
