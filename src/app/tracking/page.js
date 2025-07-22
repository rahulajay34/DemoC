"use client";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function TrackingPage() {
  const [bikeNumber, setBikeNumber] = useState("");
  const [bikeData, setBikeData] = useState(null);

  const handleSearch = async () => {
    // Fetch bike data from the API
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
        <button onClick={handleSearch} className="cheetah-gradient-btn ml-4">
          <FaSearch />
        </button>
      </div>
      {bikeData && (
        <div className="mt-8">
          {/* Display bike details */}
        </div>
      )}
    </section>
  );
}