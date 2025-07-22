"use client";
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";
import { FormModal } from "@/components/FormModal";

export default function BikesPage() {
  const [bikes, setBikes] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchBikes = () => {
    setLoading(true);
    fetch("/api/bikes").then(res => res.json()).then(data => {
      setBikes(data);
      setFilteredBikes(data);
    }).catch(() => toast.error("❌ Failed to fetch bikes")).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBikes();
    fetch("/api/fleets").then(res => res.json()).then(data => setFleets(data));
  }, []);
  
  const handleAddBike = () => setIsModalOpen(true);

  const handleBikeSubmit = async (formData) => {
    try {
      const res = await fetch("/api/bikes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to add bike");
      toast.success("🚴‍♂️ Bike added successfully!");
      fetchBikes();
    } catch (error) {
      toast.error("❌ Failed to add bike");
    } finally {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBikes(bikes);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredBikes(
        bikes.filter((b) => b.number.toLowerCase().includes(query) || b.make.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, bikes]);

  // ✨ FIX: Wrap dynamic form fields in useMemo
  const bikeFormFields = useMemo(() => [
    { name: 'make', label: 'Make', type: 'text', placeholder: 'e.g., Honda' },
    { name: 'model', label: 'Model', type: 'text', placeholder: 'e.g., Activa 6G' },
    { name: 'number', label: 'Number', type: 'text', placeholder: 'e.g., DL01AB1234' },
    { name: 'fleet', label: 'Fleet', type: 'select', options: fleets.map(f => ({ value: f._id, label: f.name })) },
    { name: 'condition', label: 'Condition', type: 'select', options: [{value: 'good', label: 'Good'}, {value: 'damaged', label: 'Damaged'}]}
  ], [fleets]); // Dependency on 'fleets' state

  return (
    <>
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBikeSubmit}
        fields={bikeFormFields}
        title="Add New Bike"
      />
      <section className="animate-fade-in glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Fleet Manager</h2>
          <div className="flex items-center gap-4">
              <button
                  onClick={() => setSearchActive((prev) => !prev)}
                  className="text-white/80 hover:text-white p-2"
              >
                  {searchActive ? <FaTimes size={22} /> : <FaSearch size={22} />}
              </button>
              <button onClick={handleAddBike} className="cheetah-gradient-btn">
                  Add Bike
              </button>
          </div>
        </div>

        {searchActive && (
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by bike number or make..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 bg-white/10 border border-white/20 rounded-full px-4 py-2"
            />
          </div>
        )}
        
        {loading ? <SkeletonTable columns={5} rows={5} /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-base">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left">Make</th>
                  <th className="px-4 py-3 text-left">Model</th>
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Fleet</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBikes.map((bike) => (
                  <tr key={bike._id} className="border-b border-white/10">
                    <td className="px-4 py-3">{bike.make}</td>
                    <td className="px-4 py-3">{bike.model}</td>
                    <td className="px-4 py-3">{bike.number}</td>
                    <td className="px-4 py-3">{bike.fleet?.name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                          bike.status === "available" ? "bg-green-500/20 text-green-300"
                          : bike.status === "assigned" ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {bike.status}
                      </span>
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