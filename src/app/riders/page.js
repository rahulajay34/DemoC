"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";
import { FormModal } from "@/components/FormModal";

// ✨ FIX: Define form fields outside the component
const riderFormFields = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'e.g., Arjun Sharma' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'arjun@example.com' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '10-digit number' },
  { name: 'address', label: 'Address', type: 'text', placeholder: 'Full address' },
];

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchRiders = () => {
    setLoading(true);
    fetch("/api/riders")
      .then((res) => res.json())
      .then((data) => {
        setRiders(data);
        setFilteredRiders(data);
      })
      .catch(() => toast.error("Failed to load riders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleAddRider = () => setIsModalOpen(true);

  const handleRiderSubmit = async (formData) => {
    try {
      const res = await fetch("/api/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add rider");
      
      toast.success("Rider added successfully ✅");
      fetchRiders();
    } catch (error) {
      toast.error("Error adding rider ❌");
    } finally {
        setIsModalOpen(false);
    }
  };

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
    <>
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRiderSubmit}
        fields={riderFormFields}
        title="Add New Rider"
      />
      <section className="animate-fade-in glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Riders Manager</h2>
          <div className="flex items-center gap-4">
              <button
                  onClick={() => setSearchActive((prev) => !prev)}
                  className="text-white/80 hover:text-white p-2"
              >
                  {searchActive ? <FaTimes size={22} /> : <FaSearch size={22} />}
              </button>
              <button onClick={handleAddRider} className="cheetah-gradient-btn">
                  Add Rider
              </button>
          </div>
        </div>

        {searchActive && (
          <div className="mb-5">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 bg-white/10 border border-white/20 rounded-full px-4 py-2"
            />
          </div>
        )}

        {loading ? <SkeletonTable columns={4} rows={6} /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.map((rider) => (
                  <tr key={rider._id} className="border-b border-white/10">
                    <td className="px-4 py-3">{rider.name}</td>
                    <td className="px-4 py-3">{rider.email}</td>
                    <td className="px-4 py-3">{rider.phone}</td>
                    <td className="px-4 py-3">{rider.address}</td>
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