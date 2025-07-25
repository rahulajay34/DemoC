"use client";
import { useState, useEffect } from "react";
import SkeletonTable from "@/components/SkeletonTable";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaUser, FaMotorcycle, FaRupeeSign, FaCalendarAlt } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

export default function AssignmentsPage() {
  const { theme, getThemeClasses } = useTheme();
  const [assignments, setAssignments] = useState([]);
  const [riders, setRiders] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");
  const [selectedBike, setSelectedBike] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [monthlyCharge, setMonthlyCharge] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const { toast } = useToast();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return getThemeClasses('bg-emerald-200/80 text-black border-emerald-300', 'bg-green-500/20 text-green-300');
      case 'completed': return getThemeClasses('bg-blue-200/80 text-black border-blue-300', 'bg-blue-500/20 text-blue-300');
      case 'terminated': return getThemeClasses('bg-red-200/80 text-black border-red-300', 'bg-red-500/20 text-red-300');
      default: return getThemeClasses('bg-amber-200/80 text-black border-amber-300', 'bg-yellow-500/20 text-yellow-300');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignRes, ridersRes, bikesRes] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/riders?status=active"),
        fetch("/api/bikes?status=available"),
      ]);
      
      const assignmentsData = await assignRes.json();
      const ridersData = await ridersRes.json();
      const bikesData = await bikesRes.json();

      // Handle different response structures
      const assignments = assignmentsData.assignments || assignmentsData || [];
      const riders = ridersData.riders || ridersData || [];
      const bikes = bikesData.bikes || bikesData || [];

      const availableBikes = bikes.filter((b) => b.status === "available");

      setAssignments(assignments);
      setFilteredAssignments(assignments);
      setRiders(riders);
      setBikes(availableBikes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error("❌ Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // One Rider <=> One Bike check
  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedRider || !selectedBike || !tenureMonths || !monthlyCharge) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Basic validation
    if (parseInt(tenureMonths) < 1 || parseInt(tenureMonths) > 60) {
      toast.error("Tenure must be between 1 and 60 months.");
      return;
    }

    if (parseFloat(monthlyCharge) < 0) {
      toast.error("Monthly charge must be a positive number.");
      return;
    }

    const riderAssigned = assignments.some(
      (a) => a.rider?._id === selectedRider && (a.status === 'active' || a.status === 'pending')
    );
    const bikeAssigned = assignments.some(
      (a) => a.bike?._id === selectedBike && (a.status === 'active' || a.status === 'pending')
    );
    
    if (riderAssigned) {
      toast.error("❌ This rider already has an active assignment.");
      return;
    }
    if (bikeAssigned) {
      toast.error("❌ This bike is already assigned.");
      return;
    }

    setLoading(true);
    try {
      const calculatedSecurityDeposit = securityDeposit || parseFloat(monthlyCharge) * 2;
      
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rider: selectedRider,
          bike: selectedBike,
          tenureMonths: parseInt(tenureMonths),
          monthlyCharge: parseFloat(monthlyCharge),
          securityDeposit: calculatedSecurityDeposit
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("✅ Assignment created successfully");
        setSelectedRider("");
        setSelectedBike("");
        setTenureMonths("");
        setMonthlyCharge("");
        setSecurityDeposit("");
        setShowAddForm(false);
        await fetchData(); // Refresh the data
      } else {
        toast.error(`❌ Failed to create assignment: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error("❌ Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setSelectedRider(assignment.rider._id);
    setSelectedBike(assignment.bike._id);
    setTenureMonths(assignment.tenureMonths.toString());
    setMonthlyCharge(assignment.monthlyCharge.toString());
    setSecurityDeposit(assignment.securityDeposit?.toString() || "");
    setShowAddForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;

    if (!selectedRider || !selectedBike || !tenureMonths || !monthlyCharge) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/assignments/${editingAssignment._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rider: selectedRider,
          bike: selectedBike,
          tenureMonths: parseInt(tenureMonths),
          monthlyCharge: parseFloat(monthlyCharge),
          securityDeposit: parseFloat(securityDeposit || monthlyCharge * 2)
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("✅ Assignment updated successfully");
        setEditingAssignment(null);
        setSelectedRider("");
        setSelectedBike("");
        setTenureMonths("");
        setMonthlyCharge("");
        setSecurityDeposit("");
        setShowAddForm(false);
        await fetchData();
      } else {
        toast.error(`❌ Failed to update assignment: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error("❌ Failed to update assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/assignments?id=${assignmentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
        toast.success("✅ Assignment deleted successfully");
      } else {
        let errorMessage = 'Unknown error';
        try {
          const result = await res.json();
          errorMessage = result.error || 'Unknown error';
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = res.statusText || `HTTP ${res.status}`;
        }
        toast.error(`❌ Failed to delete assignment: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error("❌ Failed to delete assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (editingAssignment) {
      handleUpdate(e);
    } else {
      handleAssign(e);
    }
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setSelectedRider("");
    setSelectedBike("");
    setTenureMonths("");
    setMonthlyCharge("");
    setSecurityDeposit("");
    setShowAddForm(false);
  };

  const exportToExcel = () => {
    const data = filteredAssignments.map((a) => ({
      Rider: a.rider?.name || "",
      "Rider Email": a.rider?.email || "",
      Bike: a.bike?.number || "",
      "Bike Model": `${a.bike?.make} ${a.bike?.model}` || "",
      "Start Date": new Date(a.startDate).toLocaleDateString(),
      "Tenure (Months)": a.tenureMonths,
      "Monthly Charge": a.monthlyCharge,
      "Security Deposit": a.securityDeposit,
      Status: a.status || "active",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assignments");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, "Cheetah_Assignments.xlsx");
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssignments(assignments);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAssignments(
        assignments.filter(
          (a) =>
            a.rider?.name.toLowerCase().includes(query) ||
            a.rider?.email.toLowerCase().includes(query) ||
            a.bike?.number.toLowerCase().includes(query) ||
            a.bike?.make.toLowerCase().includes(query) ||
            a.bike?.model.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, assignments]);

  return (
    <section className="animate-fade-in glass-card p-6 md:p-8">
      <div className="card-content">
        {/* 🔍 Header & Search */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Assignments</h2>
          <button
            className="text-white/80 hover:text-white p-2"
            onClick={() => {
              setSearchActive(!searchActive);
              setSearchQuery("");
            }}
          >
            {searchActive ? <FaTimes size={20} /> : <FaSearch size={20} />}
          </button>
        </div>

        {searchActive && (
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by rider, bike, or model..."
              className="w-full sm:w-96 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Add/Edit Assignment Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="cheetah-gradient-btn px-6 py-2 font-semibold"
          >
            <FaPlus className="mr-2" />
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </button>
        </div>

        {/* 📝 Assignment Form */}
        {showAddForm && (
          <form
            onSubmit={handleFormSubmit}
            className="w-full p-6 bg-black/10 rounded-2xl mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormSelect
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                placeholder="Select Rider *"
                options={riders.map(r => ({
                  value: r._id,
                  label: `${r.name} - ${r.email}`
                }))}
                icon={<FaUser />}
                required
              />

              <FormSelect
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                placeholder="Select Bike *"
                options={bikes.map(b => ({
                  value: b._id,
                  label: `${b.make} ${b.model} (${b.number})`
                }))}
                icon={<FaMotorcycle />}
                required
              />

              <FormInput
                type="number"
                placeholder="Tenure in Months *"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                required
                icon={<FaCalendarAlt />}
              />

              <FormInput
                type="number"
                placeholder="Monthly Charge in ₹ *"
                value={monthlyCharge}
                onChange={(e) => {
                  setMonthlyCharge(e.target.value);
                  if (e.target.value && !securityDeposit) {
                    setSecurityDeposit((parseFloat(e.target.value) * 2).toString());
                  }
                }}
                required
                icon={<FaRupeeSign />}
              />

              <FormInput
                type="number"
                placeholder="Security Deposit in ₹"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                icon={<FaRupeeSign />}
              />

              <div className="col-span-full flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
                >
                  {loading ? "Processing..." : (editingAssignment ? "Update Assignment" : "Create Assignment")}
                </button>
                {editingAssignment && (
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

        {/* 📊 Assignments Table */}
        {loading ? (
          <SkeletonTable columns={7} rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-sm">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left">Rider</th>
                  <th className="px-4 py-3 text-left">Bike</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">Tenure</th>
                  <th className="px-4 py-3 text-left">Monthly Charge</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((a, i) => (
                    <tr
                      key={a._id}
                      className="border-b border-white/10 animate-slide-up hover:bg-white/5"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{a.rider?.name || 'N/A'}</div>
                          <div className="text-xs text-white/60">{a.rider?.email || ''}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-mono">{a.bike?.number || 'N/A'}</div>
                          <div className="text-xs text-white/60">{a.bike?.make} {a.bike?.model}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {a.startDate ? new Date(a.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">{a.tenureMonths} months</td>
                      <td className="px-4 py-3">₹{a.monthlyCharge}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(a.status || 'active')}`}
                        >
                          {a.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(a)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Edit assignment"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 p-1"
                            onClick={() => handleDelete(a._id)}
                            title="Delete assignment"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-6 text-white/50"
                    >
                      No assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium"
          >
            📊 Export to Excel
          </button>
        </div>
      </div>
    </section>
  );
}
