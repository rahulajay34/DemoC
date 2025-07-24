"use client";
import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";

export default function RidersPageContent({ initialRiders }) {
  const [riders, setRiders] = useState(initialRiders);
  const [filteredRiders, setFilteredRiders] = useState(initialRiders);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const addrRef = useRef();

  async function handleAddRider(e) {
    e.preventDefault();
    setIsSubmitting(true);
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

      const newRider = await res.json();
      const updatedRiders = [...riders, newRider];
      setRiders(updatedRiders);
      setFilteredRiders(updatedRiders);
      setSearchQuery("");
      e.target.reset();
      toast.success("Rider added successfully ✅");
    } catch (error) {
      toast.error("Error adding rider ❌");
    } finally {
      setIsSubmitting(false);
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
    <section className="animate-fade-in glass-card p-6 md:p-8">
      <div className="card-content">
        {/* Header & Search Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Riders</h2>
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
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>
        )}

        {/* Add Rider Form */}
        <form
          onSubmit={handleAddRider}
          className="w-full p-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end bg-black/10 rounded-2xl mb-6"
        >
          <input
            ref={nameRef}
            type="text"
            placeholder="Name"
            className="bg-white/10 border border-white/20 rounded px-3 py-2 w-full sm:w-56"
            required
          />
          <input
            ref={emailRef}
            type="email"
            placeholder="Email *"
            className="bg-white/10 border border-white/20 rounded px-3 py-2 w-full sm:w-56"
            required
          />
          <input
            ref={phoneRef}
            type="tel"
            placeholder="Phone *"
            className="bg-white/10 border border-white/20 rounded px-3 py-2 w-full sm:w-44"
            required
          />
          <input
            ref={addrRef}
            type="text"
            placeholder="Address"
            className="bg-white/10 border border-white/20 rounded px-3 py-2 w-full sm:w-80"
            required
          />
          <button
            type="submit"
            className="cheetah-gradient-btn w-full sm:w-auto px-5 py-2 font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "➕ Add Rider"}
          </button>
        </form>

        {/* Riders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-base">
            <thead className="border-b border-white/20">
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
                    className="border-b border-white/10"
                  >
                    <td className="px-4 py-3">{rider.name}</td>
                    <td className="px-4 py-3">{rider.email}</td>
                    <td className="px-4 py-3">{rider.phone}</td>
                    <td className="px-4 py-3">{rider.address}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-white/50">
                    No riders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}