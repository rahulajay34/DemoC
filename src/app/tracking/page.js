"use client";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function TrackingPage() {
  const [bikeNumber, setBikeNumber] = useState("");
  const [bikeData, setBikeData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!bikeNumber) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bikes/track?number=${bikeNumber}`);
      if (res.ok) {
        const data = await res.json();
        setBikeData(data);
      } else {
        setBikeData(null);
        alert("Bike not found");
      }
    } catch (error) {
      console.error("Failed to fetch bike data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="animate-fade-in glass-card p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-4">Track a Bike</h2>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Enter Bike Number"
          value={bikeNumber}
          onChange={(e) => setBikeNumber(e.target.value)}
          className="w-full sm:w-80 bg-white/10 border border-white/20 rounded-full px-4 py-2"
        />
        <button onClick={handleSearch} className="cheetah-gradient-btn ml-4" disabled={loading}>
          {loading ? "Searching..." : <FaSearch />}
        </button>
      </div>
      {bikeData && (
        <div className="mt-8 p-4 bg-black/20 rounded-lg">
          <h3 className="text-xl font-semibold">{bikeData.make} {bikeData.model}</h3>
          <p><strong>Number:</strong> {bikeData.number}</p>
          <p><strong>Status:</strong> {bikeData.status}</p>
          <p><strong>Condition:</strong> {bikeData.condition}</p>
          {bikeData.assignedTo && <p><strong>Rider:</strong> {bikeData.assignedTo.name}</p>}
          {bikeData.fleet && <p><strong>Fleet:</strong> {bikeData.fleet.name}</p>}
        </div>
      )}
    </section>
  );
}