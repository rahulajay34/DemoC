"use client";
import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "../../components/ProtectedRoute.js";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable"; // ✅ Import

export default function BikesPage() {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const { toast } = useToast(); // ✅ Toast support

  const makeRef = useRef();
  const modelRef = useRef();
  const numberRef = useRef();

  useEffect(() => {
    setLoading(true);
    fetch("/api/bikes")
      .then((res) => res.json())
      .then((data) => {
        setBikes(data);
        setFilteredBikes(data);
      })
      .catch(() => toast.error("❌ Failed to fetch bikes"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAddBike(e) {
    e.preventDefault();

    const newBike = {
      make: makeRef.current.value,
      model: modelRef.current.value,
      number: numberRef.current.value,
    };

    const res = await fetch("/api/bikes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBike),
    });

    if (res.ok) {
      const updated = await fetch("/api/bikes").then((res) => res.json());
      setBikes(updated);
      setFilteredBikes(updated);
      setSearchQuery("");
      e.target.reset();
      toast.success("🚴‍♂️ Bike added successfully!");
    } else {
      toast.error("❌ Failed to add bike");
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBikes(bikes);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredBikes(
        bikes.filter((b) => b.number.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, bikes]);

  return (
    <ProtectedRoute>
      <section className="animate-fade-in">
        {/* 🚲 Header */}
        <div className="flex justify-between items-center mb-6 px-1 sm:px-0">
          <h2 className="text-2xl font-bold">Bikes</h2>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className="text-[#f28a22] text-lg p-2"
            aria-label="Toggle Search"
          >
            {searchActive ? <FaTimes size={22} /> : <FaSearch size={22} />}
          </button>
        </div>

        {/* 🔍 Search Input */}
        {searchActive && (
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by bike number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 border border-orange-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>
        )}

        {/* 📝 Add Bike Form */}
        <form
          onSubmit={handleAddBike}
          className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 p-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end bg-card-gradient rounded-2xl shadow-lg animate-fade-in"
        >
          <input
            ref={makeRef}
            type="text"
            placeholder="Make"
            className="border rounded px-3 py-2 w-full sm:w-48"
            required
          />
          <input
            ref={modelRef}
            type="text"
            placeholder="Model"
            className="border rounded px-3 py-2 w-full sm:w-48"
            required
          />
          <input
            ref={numberRef}
            type="text"
            placeholder="Number"
            className="border rounded px-3 py-2 w-full sm:w-56"
            required
          />
          <button
            type="submit"
            className="cheetah-gradient-btn w-full sm:w-auto px-5 py-2 font-semibold"
          >
            ➕ Add Bike
          </button>
        </form>

        {/* 🚴‍♂️ Bikes Table / Skeleton Loader */}
        {loading ? (
          <SkeletonTable columns={4} rows={5} />
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow mt-6">
            <table className="min-w-full w-full bg-white rounded-2xl shadow text-gray-900 text-base overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Make</th>
                  <th className="px-4 py-3 text-left">Model</th>
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBikes.length > 0 ? (
                  filteredBikes.map((bike, idx) => (
                    <tr
                      key={bike._id}
                      className="even:bg-gray-50 animate-slide-up"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <td className="px-4 py-3">{bike.make}</td>
                      <td className="px-4 py-3">{bike.model}</td>
                      <td className="px-4 py-3">{bike.number}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-full ${
                            bike.status === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {bike.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500">
                      No bikes found.
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
