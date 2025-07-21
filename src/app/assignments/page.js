"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import SkeletonTable from "@/components/SkeletonTable";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [riders, setRiders] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");
  const [selectedBike, setSelectedBike] = useState("");
  const [tenureMonths, setTenureMonths] = useState(1);
  const [monthlyCharge, setMonthlyCharge] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(false); // <-- Add loading state

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

  // One Rider <=> One Bike check
  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedRider || !selectedBike) {
      toast.error("Please select both Rider and Bike.");
      return;
    }

    const riderAssigned = assignments.some(
      (a) => a.rider?._id === selectedRider && a.active
    );
    const bikeAssigned = assignments.some(
      (a) => a.bike?._id === selectedBike && a.active
    );
    if (riderAssigned) {
      toast.error("❌ This rider already has a bike assigned.");
      return;
    }
    if (bikeAssigned) {
      toast.error("❌ This bike is already assigned.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rider: selectedRider,
        bike: selectedBike,
        tenureMonths,
        monthlyCharge,
      }),
    });

    setLoading(false);
    if (res.ok) {
      toast.success("✅ Assignment successful");
      setSelectedRider("");
      setSelectedBike("");
      setTenureMonths(1);
      setMonthlyCharge("");
      fetchData();
    } else {
      toast.error("❌ Failed to assign rider");
    }
  };

  const handleUnassign = async (assignmentId) => {
    setLoading(true);
    const res = await fetch(`/api/assignments?id=${assignmentId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (res.ok) {
      toast.success("✅ Unassigned successfully");
      fetchData();
    } else {
      toast.error("❌ Failed to unassign");
    }
  };

  const exportToExcel = () => {
    const data = filteredAssignments.map((a) => ({
      Rider: a.rider?.name || "",
      Bike: a.bike?.number || "",
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

  return (
    <ProtectedRoute>
      <section className="animate-fade-in">
        {/* 🔍 Header & Search */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Assignments</h2>
          <button
            className="text-[#f28a22] p-2"
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
              placeholder="Search by rider or bike number..."
              className="w-full sm:w-96 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* 📝 Assignment Form */}
        <form
          onSubmit={handleAssign}
          className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 p-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end bg-card-gradient rounded-2xl shadow-lg animate-fade-in mb-6"
        >
          <select
            className="border rounded px-3 py-2 w-full sm:w-[14rem]"
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
            required
          >
            <option value="">Select Rider</option>
            {riders.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 w-full sm:w-[14rem]"
            value={selectedBike}
            onChange={(e) => setSelectedBike(e.target.value)}
            required
          >
            <option value="">Select Bike</option>
            {bikes.map((b) => (
              <option key={b._id} value={b._id}>
                {b.make} {b.model} ({b.number})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Tenure (months)"
            value={Number.isNaN(tenureMonths) ? "" : tenureMonths}
            onChange={(e) =>
              setTenureMonths(e.target.value === "" ? "" : parseInt(e.target.value))
            }
            className="border rounded px-3 py-2 w-full sm:w-40"
            required
          />

          <input
            type="number"
            min="0"
            placeholder="Monthly Charge"
            value={Number.isNaN(monthlyCharge) ? "" : monthlyCharge}
            onChange={(e) =>
              setMonthlyCharge(
                e.target.value === "" ? "" : parseFloat(e.target.value)
              )
            }
            className="border rounded px-3 py-2 w-full sm:w-40"
            required
          />

          <button
            type="submit"
            className="cheetah-gradient-btn w-full sm:w-auto font-semibold px-5 py-2"
          >
            ➕ Assign
          </button>
          <button
            type="button"
            onClick={exportToExcel}
            className="cheetah-gradient-btn w-full sm:w-auto font-semibold px-5 py-2"
          >
            📄 Download Excel
          </button>
        </form>

        {/* 📊 Assignments Table */}
        {loading ? (
          <SkeletonTable columns={7} rows={6} />
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow">
            <table className="min-w-full w-full bg-white rounded-2xl shadow text-gray-900 text-base overflow-hidden text-left">
              <thead className="bg-gray-100">
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
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((a, i) => (
                    <tr
                      key={a._id}
                      className="even:bg-gray-50 animate-slide-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <td className="px-4 py-3">{a.rider?.name}</td>
                      <td className="px-4 py-3">{a.bike?.number}</td>
                      <td className="px-4 py-3">
                        {new Date(a.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{a.tenureMonths}</td>
                      <td className="px-4 py-3">₹{a.monthlyCharge}</td>
                      <td className="px-4 py-3">{a.active ? "✅" : "❌"}</td>
                      <td className="px-4 py-3">
                        <button
                          className="text-sm text-red-600 underline hover:opacity-80 transition"
                          onClick={() => handleUnassign(a._id)}
                        >
                          Unassign
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      No assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ProtectedRoute>
  );
}
