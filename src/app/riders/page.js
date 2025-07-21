"use client";
import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "../../components/ProtectedRoute.js";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable"; // ✅

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false); // ✅

  const { toast } = useToast();

  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const addrRef = useRef();

  useEffect(() => {
    setLoading(true);
    fetch("/api/riders")
      .then((res) => res.json())
      .then((data) => {
        setRiders(data);
        setFilteredRiders(data);
      })
      .catch(() => {
        toast.error("Failed to load riders");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAddRider(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameRef.current.value,
          email: emailRef.current.value,
          phone: phoneRef.current.value,
          address: addrRef.current.value,
        }),
      });

      if (!res.ok) throw new Error("Failed to add rider");

      const updated = await fetch("/api/riders").then((res) => res.json());
      setRiders(updated);
      setFilteredRiders(updated);
      setSearchQuery("");
      e.target.reset();
      toast.success("Rider added successfully ✅");
    } catch (error) {
      toast.error("Error adding rider ❌");
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRiders(riders);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRiders(
        riders.filter((r) => r.name.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, riders]);

  return (
    <ProtectedRoute>
      <section className="animate-fade-in">
        {/* Header & Search Toggle */}
        <div className="flex justify-between items-center mb-6 px-1 sm:px-0">
          <h2 className="text-2xl font-bold">Riders</h2>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className="text-[#f28a22] text-lg p-2"
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
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 border border-orange-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>
        )}

        {/* Add Rider Form */}
        <form
          onSubmit={handleAddRider}
          className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 p-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end bg-card-gradient rounded-2xl shadow-lg animate-fade-in"
        >
          <input
            ref={nameRef}
            type="text"
            placeholder="Name"
            className="border rounded px-3 py-2 w-full sm:w-56"
            required
          />
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2 w-full sm:w-56"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            title="Please enter a valid email address"
          />
          <input
            ref={phoneRef}
            type="tel"
            placeholder="Phone (10 digits)"
            className="border rounded px-3 py-2 w-full sm:w-44"
            required
            pattern="^\d{10}$"
            title="Please enter a 10-digit phone number"
          />
          <input
            ref={addrRef}
            type="text"
            placeholder="Address"
            className="border rounded px-3 py-2 w-full sm:w-80"
            required
          />
          <button
            type="submit"
            className="cheetah-gradient-btn w-full sm:w-auto px-5 py-2 font-semibold"
          >
            ➕ Add Rider
          </button>
        </form>

        {/* Riders Table */}
        {loading ? (
          <SkeletonTable columns={4} rows={6} />
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow mt-6">
            <table className="min-w-full w-full bg-white rounded-2xl shadow text-gray-900 text-base overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.length > 0 ? (
                  filteredRiders.map((rider, idx) => (
                    <tr
                      key={rider._id}
                      className="even:bg-gray-50 animate-slide-up"
                      style={{ animationDelay: `${idx * 70}ms` }}
                    >
                      <td className="px-4 py-3">{rider.name}</td>
                      <td className="px-4 py-3">{rider.email}</td>
                      <td className="px-4 py-3">{rider.phone}</td>
                      <td className="px-4 py-3">{rider.address}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500">
                      No riders found.
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
