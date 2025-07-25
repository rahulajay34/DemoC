"use client";
import { useState, useEffect } from "react";
import { FaWrench, FaPlus, FaSearch, FaTimes, FaEdit, FaTrash, FaEye, FaMotorcycle, FaCog, FaCalendarAlt, FaRupeeSign, FaClock } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import FormTextarea from "@/components/FormTextarea";

export default function MaintenancePage() {
  const { theme, getThemeClasses } = useTheme();
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

      if (res.ok) {
        const result = await res.json();
        await fetchData();
        resetForm();
        setShowAddForm(false);
        toast.success("🔧 Maintenance record created successfully!");
      } else {
        let errorMessage = 'Unknown error';
        try {
          const result = await res.json();
          errorMessage = result.error || 'Unknown error';
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = res.statusText || `HTTP ${res.status}`;
        }
        toast.error(`❌ Failed to create maintenance record: ${errorMessage}`);
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

      if (res.ok) {
        const result = await res.json();
        await fetchData();
        resetForm();
        setShowAddForm(false);
        setEditingRecord(null);
        toast.success("🔧 Maintenance record updated successfully!");
      } else {
        let errorMessage = 'Unknown error';
        try {
          const result = await res.json();
          errorMessage = result.error || 'Unknown error';
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = res.statusText || `HTTP ${res.status}`;
        }
        toast.error(`❌ Failed to update maintenance record: ${errorMessage}`);
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
      case 'critical': return getThemeClasses('bg-red-200/80 text-black border-red-300', 'bg-red-500/20 text-red-300');
      case 'high': return getThemeClasses('bg-orange-200/80 text-black border-orange-300', 'bg-orange-500/20 text-orange-300');
      case 'medium': return getThemeClasses('bg-yellow-200/80 text-black border-yellow-300', 'bg-yellow-500/20 text-yellow-300');
      case 'low': return getThemeClasses('bg-green-200/80 text-black border-green-300', 'bg-green-500/20 text-green-300');
      default: return getThemeClasses('bg-gray-200/80 text-black border-gray-300', 'bg-gray-500/20 text-gray-300');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return getThemeClasses('bg-green-200/80 text-black border-green-300', 'bg-green-500/20 text-green-300');
      case 'in_progress': return getThemeClasses('bg-blue-200/80 text-black border-blue-300', 'bg-blue-500/20 text-blue-300');
      case 'scheduled': return getThemeClasses('bg-yellow-200/80 text-black border-yellow-300', 'bg-yellow-500/20 text-yellow-300');
      case 'cancelled': return getThemeClasses('bg-red-200/80 text-black border-red-300', 'bg-red-500/20 text-red-300');
      case 'on_hold': return getThemeClasses('bg-gray-200/80 text-black border-gray-300', 'bg-gray-500/20 text-gray-300');
      default: return getThemeClasses('bg-gray-200/80 text-black border-gray-300', 'bg-gray-500/20 text-gray-300');
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
            className="bg-white/10 border border-white/20 rounded px-4 py-2"
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
            className="bg-white/10 border border-white/20 rounded px-4 py-2"
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
              <FormSelect
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                placeholder="Select Bike *"
                options={bikes.map(bike => ({
                  value: bike._id,
                  label: `${bike.make} ${bike.model} (${bike.number})`
                }))}
                icon={<FaMotorcycle />}
                required
              />

              <FormSelect
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
                placeholder="Select Maintenance Type *"
                options={[
                  { value: 'routine', label: 'Routine' },
                  { value: 'repair', label: 'Repair' },
                  { value: 'inspection', label: 'Inspection' },
                  { value: 'emergency', label: 'Emergency' },
                  { value: 'recall', label: 'Recall' }
                ]}
                icon={<FaCog />}
                required
              />

              <FormSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Select Category *"
                options={[
                  { value: 'engine', label: 'Engine' },
                  { value: 'transmission', label: 'Transmission' },
                  { value: 'brakes', label: 'Brakes' },
                  { value: 'electrical', label: 'Electrical' },
                  { value: 'body', label: 'Body' },
                  { value: 'tires', label: 'Tires' },
                  { value: 'battery', label: 'Battery' },
                  { value: 'other', label: 'Other' }
                ]}
                required
              />

              <FormSelect
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="Select Priority *"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' }
                ]}
                required
              />

              <FormInput
                type="date"
                placeholder="Scheduled Date *"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                icon={<FaCalendarAlt />}
                required
              />

              <FormInput
                type="number"
                placeholder="Estimated Cost in ₹"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                icon={<FaRupeeSign />}
              />

              <FormInput
                type="number"
                placeholder="Estimated Duration in hours"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                icon={<FaClock />}
              />

              <FormTextarea
                placeholder="Description *"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-full"
                rows={3}
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
