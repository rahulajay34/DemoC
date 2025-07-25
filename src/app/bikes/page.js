"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaEye, FaMotorcycle, FaCog, FaIdBadge, FaCertificate } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import { staggerContainer, staggerItem, staggerContainerVariants } from "@/components/PageTransition";
import ProtectedRoute from "../../components/ProtectedRoute.js";

function BikesPage() {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const { toast } = useToast();

  // Form refs
  const makeRef = useRef();
  const modelRef = useRef();
  const numberRef = useRef();
  const registrationNumberRef = useRef();
  const chassisNumberRef = useRef();
  const engineNumberRef = useRef();
  const yearRef = useRef();
  const typeRef = useRef();
  const fuelTypeRef = useRef();
  const engineCapacityRef = useRef();
  const colorRef = useRef();
  const statusRef = useRef();
  const conditionRef = useRef();

  const handleEdit = async (bike) => {
    setEditingBike(bike);
    populateForm(bike);
    setShowAddForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBike) return;
    
    setLoading(true);
    try {
      const updatedBike = {
        make: makeRef.current.value,
        model: modelRef.current.value,
        number: numberRef.current.value,
        registrationNumber: registrationNumberRef.current.value,
        chassisNumber: chassisNumberRef.current.value,
        engineNumber: engineNumberRef.current.value,
        year: parseInt(yearRef.current.value),
        type: typeRef.current.value,
        fuelType: fuelTypeRef.current.value,
        engineCapacity: parseInt(engineCapacityRef.current.value),
        color: colorRef.current.value,
        status: statusRef.current.value,
        condition: conditionRef.current.value
      };

      const res = await fetch(`/api/bikes/${editingBike._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBike),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchBikes(pagination.currentPage);
        resetForm();
        setShowAddForm(false);
        setEditingBike(null);
        toast.success("🚴‍♂️ Bike updated successfully!");
      } else {
        toast.error(`❌ Failed to update bike: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating bike:', error);
      toast.error("❌ Failed to update bike");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bikeId) => {
    if (!confirm("Are you sure you want to delete this bike?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/bikes/${bikeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchBikes(pagination.currentPage);
        toast.success("🚴‍♂️ Bike deleted successfully!");
      } else {
        let errorMessage = 'Unknown error';
        try {
          const result = await res.json();
          errorMessage = result.error || 'Unknown error';
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = res.statusText || `HTTP ${res.status}`;
        }
        toast.error(`❌ Failed to delete bike: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting bike:', error);
      toast.error("❌ Failed to delete bike");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (editingBike) {
      handleUpdate(e);
    } else {
      handleAddBike(e);
    }
  };

  const handleCancelEdit = () => {
    setEditingBike(null);
    setShowAddForm(false);
    resetForm();
  };

  useEffect(() => {
    fetchBikes();
  }, [pagination.currentPage]);

  const fetchBikes = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bikes?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.bikes) {
        setBikes(data.bikes);
        setFilteredBikes(data.bikes);
        setPagination(data.pagination || pagination);
      } else {
        // Handle case where API returns array directly (backward compatibility)
        setBikes(Array.isArray(data) ? data : []);
        setFilteredBikes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch bikes:', error);
      toast.error("❌ Failed to fetch bikes");
      setBikes([]);
      setFilteredBikes([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (makeRef.current) makeRef.current.value = '';
    if (modelRef.current) modelRef.current.value = '';
    if (numberRef.current) numberRef.current.value = '';
    if (registrationNumberRef.current) registrationNumberRef.current.value = '';
    if (chassisNumberRef.current) chassisNumberRef.current.value = '';
    if (engineNumberRef.current) engineNumberRef.current.value = '';
    if (yearRef.current) yearRef.current.value = '';
    if (typeRef.current) typeRef.current.value = '';
    if (fuelTypeRef.current) fuelTypeRef.current.value = '';
    if (engineCapacityRef.current) engineCapacityRef.current.value = '';
    if (colorRef.current) colorRef.current.value = '';
    if (statusRef.current) statusRef.current.value = 'available';
    if (conditionRef.current) conditionRef.current.value = 'good';
  };

  const populateForm = (bike) => {
    if (makeRef.current) makeRef.current.value = bike.make || '';
    if (modelRef.current) modelRef.current.value = bike.model || '';
    if (numberRef.current) numberRef.current.value = bike.number || '';
    if (registrationNumberRef.current) registrationNumberRef.current.value = bike.registrationNumber || '';
    if (chassisNumberRef.current) chassisNumberRef.current.value = bike.chassisNumber || '';
    if (engineNumberRef.current) engineNumberRef.current.value = bike.engineNumber || '';
    if (yearRef.current) yearRef.current.value = bike.year || '';
    if (typeRef.current) typeRef.current.value = bike.type || '';
    if (fuelTypeRef.current) fuelTypeRef.current.value = bike.fuelType || '';
    if (engineCapacityRef.current) engineCapacityRef.current.value = bike.engineCapacity || '';
    if (colorRef.current) colorRef.current.value = bike.color || '';
    if (statusRef.current) statusRef.current.value = bike.status || 'available';
    if (conditionRef.current) conditionRef.current.value = bike.condition || 'good';
  };

  async function handleAddBike(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields before submitting
      if (!makeRef.current.value || !modelRef.current.value || !numberRef.current.value || 
          !registrationNumberRef.current.value || !chassisNumberRef.current.value || 
          !engineNumberRef.current.value || !yearRef.current.value || !typeRef.current.value || 
          !fuelTypeRef.current.value || !colorRef.current.value) {
        toast.error("Please fill all required fields");
        setLoading(false);
        return;
      }

      const purchaseDate = new Date().toISOString().split('T')[0]; // Default to today
      
      const newBike = {
        make: makeRef.current.value.trim(),
        model: modelRef.current.value.trim(),
        number: numberRef.current.value.trim().toUpperCase(),
        registrationNumber: registrationNumberRef.current.value.trim().toUpperCase(),
        chassisNumber: chassisNumberRef.current.value.trim().toUpperCase(),
        engineNumber: engineNumberRef.current.value.trim().toUpperCase(),
        year: parseInt(yearRef.current.value),
        type: typeRef.current.value,
        fuelType: fuelTypeRef.current.value,
        engineCapacity: parseInt(engineCapacityRef.current.value) || (fuelTypeRef.current.value === 'electric' ? 0 : 125),
        color: colorRef.current.value.trim(),
        purchaseDate: purchaseDate,
        purchasePrice: parseInt(numberRef.current.value.slice(-4)) * 100 + 50000, // Mock price based on number
        status: statusRef.current.value || 'available',
        condition: conditionRef.current.value || 'good'
      };

      const res = await fetch("/api/bikes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBike),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchBikes(1); // Refresh bikes list
        resetForm();
        setShowAddForm(false);
        toast.success("🚴‍♂️ Bike added successfully!");
      } else {
        toast.error(`❌ Failed to add bike: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding bike:', error);
      toast.error("❌ Failed to add bike");
    } finally {
      setLoading(false);
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
    <section className="animate-fade-in glass-card p-6 md:p-8">
      <div className="card-content">
        {/* 🚲 Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Bikes</h2>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className="text-white/80 hover:text-white text-lg p-2"
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
              className="w-full sm:w-80 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>
        )}

        {/* Add/Edit Bike Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="cheetah-gradient-btn px-6 py-2 font-semibold"
          >
            <FaPlus className="mr-2" />
            {editingBike ? 'Edit Bike' : 'Add New Bike'}
          </button>
        </div>

        {/* 📝 Add/Edit Bike Form */}
        {showAddForm && (
          <form
            onSubmit={handleFormSubmit}
            className="w-full p-6 bg-black/10 rounded-2xl mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <FormInput
              ref={makeRef}
              type="text"
              placeholder="Make *"
              required
              icon={<FaMotorcycle />}
            />
            
            <FormInput
              ref={modelRef}
              type="text"
              placeholder="Model *"
              required
            />
            
            <FormInput
              ref={numberRef}
              type="text"
              placeholder="Number *"
              required
              icon={<FaIdBadge />}
            />
            
            <FormInput
              ref={registrationNumberRef}
              type="text"
              placeholder="Registration Number *"
              required
              icon={<FaCertificate />}
            />
            
            <FormInput
              ref={chassisNumberRef}
              type="text"
              placeholder="Chassis Number *"
              required
            />
            
            <FormInput
              ref={engineNumberRef}
              type="text"
              placeholder="Engine Number *"
              required
              icon={<FaCog />}
            />
            
            <FormInput
              ref={yearRef}
              type="number"
              placeholder="Manufacturing Year *"
              required
            />
            <FormSelect
              ref={typeRef}
              placeholder="Select Bike Type *"
              options={[
                { value: 'scooter', label: 'Scooter' },
                { value: 'motorcycle', label: 'Motorcycle' },
                { value: 'electric', label: 'Electric' },
                { value: 'sports', label: 'Sports' },
                { value: 'cruiser', label: 'Cruiser' },
                { value: 'touring', label: 'Touring' }
              ]}
              required
            />
            
            <FormSelect
              ref={fuelTypeRef}
              placeholder="Select Fuel Type *"
              options={[
                { value: 'petrol', label: 'Petrol' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'electric', label: 'Electric' },
                { value: 'hybrid', label: 'Hybrid' }
              ]}
              required
            />
            
            <FormInput
              ref={engineCapacityRef}
              type="number"
              placeholder="Engine Capacity (cc)"
            />
            <input
              ref={colorRef}
              type="text"
              placeholder="Color"
              className="bg-white/10 border border-white/20 rounded px-3 py-2"
              required
            />
            <select
              ref={statusRef}
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              style={{ 
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              defaultValue="available"
            >
              <option value="available" style={{ color: '#111827', backgroundColor: 'white' }}>Available</option>
              <option value="assigned" style={{ color: '#111827', backgroundColor: 'white' }}>Assigned</option>
              <option value="maintenance" style={{ color: '#111827', backgroundColor: 'white' }}>Maintenance</option>
              <option value="retired" style={{ color: '#111827', backgroundColor: 'white' }}>Retired</option>
            </select>
            <select
              ref={conditionRef}
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              style={{ 
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              defaultValue="good"
            >
              <option value="excellent" style={{ color: '#111827', backgroundColor: 'white' }}>Excellent</option>
              <option value="good" style={{ color: '#111827', backgroundColor: 'white' }}>Good</option>
              <option value="fair" style={{ color: '#111827', backgroundColor: 'white' }}>Fair</option>
              <option value="poor" style={{ color: '#111827', backgroundColor: 'white' }}>Poor</option>
            </select>
            
            <div className="col-span-full flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
              >
                {loading ? "Processing..." : (editingBike ? "Update Bike" : "Add Bike")}
              </button>
              {editingBike && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-2 font-semibold rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* 🚴‍♂️ Bikes Table / Skeleton Loader */}
        {loading ? (
          <SkeletonTable columns={7} rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-sm">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left">Make/Model</th>
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-left">Color</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={staggerContainerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {filteredBikes.length > 0 ? (
                  filteredBikes.map((bike, idx) => (
                    <motion.tr
                      key={bike._id}
                      variants={staggerItem}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                      whileHover={{ 
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        scale: 1.01,
                        y: -2,
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ scale: 0.99 }}
                      layout
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{bike.make} {bike.model}</div>
                          <div className="text-xs text-white/60">{bike.fuelType}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">{bike.number}</td>
                      <td className="px-4 py-3 capitalize">{bike.type}</td>
                      <td className="px-4 py-3">{bike.year}</td>
                      <td className="px-4 py-3 capitalize">{bike.color}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            bike.status === "available"
                              ? "bg-green-500/20 text-green-300"
                              : bike.status === "assigned"
                              ? "bg-blue-500/20 text-blue-300"
                              : bike.status === "maintenance"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {bike.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(bike)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Edit bike"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(bike._id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete bike"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr variants={staggerItem}>
                    <td colSpan="7" className="text-center py-6 text-white/50">
                      No bikes found.
                    </td>
                  </motion.tr>
                )}
              </motion.tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => fetchBikes(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 bg-white/10 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchBikes(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 bg-white/10 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function BikesPageWithProtection() {
  return (
    <ProtectedRoute>
      <BikesPage />
    </ProtectedRoute>
  );
}