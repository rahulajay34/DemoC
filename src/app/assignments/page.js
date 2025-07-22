"use client";
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaTimes, FaPlus } from "react-icons/fa";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import SkeletonTable from "@/components/SkeletonTable";
import { useToast } from "@/context/ToastContext";
import { FormModal } from "@/components/FormModal";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [riders, setRiders] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assignRes, ridersRes, bikesRes] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/riders"),
        fetch("/api/bikes"),
      ]);
      const assignmentsData = await assignRes.json();
      const ridersData = await ridersRes.json();
      const bikesData = await bikesRes.json();

      const availableBikes = bikesData.filter((b) => b.status === "available");

      setAssignments(assignmentsData);
      setFilteredAssignments(assignmentsData);
      setRiders(ridersData);
      setBikes(availableBikes);
    } catch (error) {
      toast.error("❌ Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignmentSubmit = async (formData) => {
    const { riderId, bikeId, tenureMonths, monthlyCharge } = formData;

    if (!riderId || !bikeId || !tenureMonths || !monthlyCharge) {
      toast.error("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rider: riderId,
          bike: bikeId,
          tenureMonths,
          monthlyCharge,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create assignment");
      }
      
      toast.success("✅ Assignment successful");
      fetchData();
    } catch (error) {
        toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleUnassign = async (assignmentId) => {
    setLoading(true);
    try {
        const res = await fetch(`/api/assignments?id=${assignmentId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to unassign");
        toast.success("✅ Unassigned successfully");
        fetchData();
    } catch (error) {
        toast.error(`❌ ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  const exportToExcel = () => {
    const data = filteredAssignments.map((a) => ({
      Rider: a.rider?.name || "N/A",
      Bike: a.bike?.number || "N/A",
      "Start Date": new Date(a.startDate).toLocaleDateString(),
      "Tenure (Months)": a.tenureMonths,
      "Monthly Charge": a.monthlyCharge,
      Active: a.active ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assignments");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
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
            a.bike?.number.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, assignments]);

  // ✨ FIX: Wrap dynamic form fields in useMemo
  const assignmentFormFields = useMemo(() => [
    { name: 'riderId', label: 'Rider', type: 'select', options: riders.map(r => ({ value: r._id, label: r.name })) },
    { name: 'bikeId', label: 'Bike', type: 'select', options: bikes.map(b => ({ value: b._id, label: `${b.make} ${b.model} (${b.number})` })) },
    { name: 'tenureMonths', label: 'Tenure (Months)', type: 'number', placeholder: 'e.g., 6' },
    { name: 'monthlyCharge', label: 'Monthly Charge (₹)', type: 'number', placeholder: 'e.g., 1500' }
  ], [riders, bikes]);

  return (
    <>
      <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAssignmentSubmit}
          fields={assignmentFormFields}
          title="Create New Assignment"
      />
      <section className="animate-fade-in glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Assignments</h2>
          <div className="flex items-center gap-4">
              <button
                  className="text-white/80 hover:text-white p-2"
                  onClick={() => setSearchActive(!searchActive)}
              >
                  {searchActive ? <FaTimes size={20} /> : <FaSearch size={20} />}
              </button>
              <button onClick={() => setIsModalOpen(true)} className="cheetah-gradient-btn flex items-center gap-2">
                  <FaPlus/> New Assignment
              </button>
          </div>
        </div>
        
        {searchActive && (
           <div className="mb-5">
             <input
               type="text"
               placeholder="Search by rider or bike number..."
               className="w-full sm:w-96 bg-white/10 border border-white/20 rounded-full px-4 py-2"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
        )}

        <div className="mb-6 flex justify-end">
           <button onClick={exportToExcel} className="cheetah-gradient-btn">
              Download Excel
           </button>
        </div>

        {loading ? <SkeletonTable columns={7} rows={6} /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-base text-left">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="px-4 py-3">Rider</th>
                  <th className="px-4 py-3">Bike</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">Tenure</th>
                  <th className="px-4 py-3">Charge (₹)</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a, i) => (
                  <tr
                    key={a._id}
                    className="border-b border-white/10 animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <td className="px-4 py-3">{a.rider?.name}</td>
                    <td className="px-4 py-3">{a.bike?.number}</td>
                    <td className="px-4 py-3">{new Date(a.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{a.tenureMonths}</td>
                    <td className="px-4 py-3">₹{a.monthlyCharge}</td>
                    <td className="px-4 py-3">{a.active ? "✅" : "❌"}</td>
                    <td className="px-4 py-3">
                      {a.active && (
                        <button
                            className="text-sm text-red-400 hover:text-red-300 transition"
                            onClick={() => handleUnassign(a._id)}
                        >
                            Unassign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}