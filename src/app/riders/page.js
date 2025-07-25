"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "../../components/ProtectedRoute.js";
import { FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaEye, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import { staggerContainer, staggerItem, staggerContainerVariants } from "@/components/PageTransition";

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const { toast } = useToast();

  // Form refs
  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const dobRef = useRef();
  const licenseNumberRef = useRef();
  const licenseExpiryRef = useRef();
  const streetRef = useRef();
  const cityRef = useRef();
  const stateRef = useRef();
  const zipCodeRef = useRef();
  const emergencyNameRef = useRef();
  const emergencyPhoneRef = useRef();
  const emergencyRelationshipRef = useRef();

  useEffect(() => {
    fetchRiders();
  }, [pagination.currentPage]);

  const fetchRiders = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/riders?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.riders) {
        setRiders(data.riders);
        setFilteredRiders(data.riders);
        setPagination(data.pagination || pagination);
      } else {
        // Handle case where API returns array directly (backward compatibility)
        setRiders(Array.isArray(data) ? data : []);
        setFilteredRiders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch riders:', error);
      toast.error("❌ Failed to fetch riders");
      setRiders([]);
      setFilteredRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (nameRef.current) nameRef.current.value = '';
    if (emailRef.current) emailRef.current.value = '';
    if (phoneRef.current) phoneRef.current.value = '';
    if (dobRef.current) dobRef.current.value = '';
    if (licenseNumberRef.current) licenseNumberRef.current.value = '';
    if (licenseExpiryRef.current) licenseExpiryRef.current.value = '';
    if (streetRef.current) streetRef.current.value = '';
    if (cityRef.current) cityRef.current.value = '';
    if (stateRef.current) stateRef.current.value = '';
    if (zipCodeRef.current) zipCodeRef.current.value = '';
    if (emergencyNameRef.current) emergencyNameRef.current.value = '';
    if (emergencyPhoneRef.current) emergencyPhoneRef.current.value = '';
    if (emergencyRelationshipRef.current) emergencyRelationshipRef.current.value = '';
  };

  const populateForm = (rider) => {
    if (nameRef.current) nameRef.current.value = rider.name || '';
    if (emailRef.current) emailRef.current.value = rider.email || '';
    if (phoneRef.current) phoneRef.current.value = rider.phone || '';
    if (dobRef.current) dobRef.current.value = rider.dateOfBirth ? new Date(rider.dateOfBirth).toISOString().split('T')[0] : '';
    if (licenseNumberRef.current) licenseNumberRef.current.value = rider.licenseNumber || '';
    if (licenseExpiryRef.current) licenseExpiryRef.current.value = rider.licenseExpiry ? new Date(rider.licenseExpiry).toISOString().split('T')[0] : '';
    if (streetRef.current) streetRef.current.value = rider.address?.street || '';
    if (cityRef.current) cityRef.current.value = rider.address?.city || '';
    if (stateRef.current) stateRef.current.value = rider.address?.state || '';
    if (zipCodeRef.current) zipCodeRef.current.value = rider.address?.zipCode || '';
    if (emergencyNameRef.current) emergencyNameRef.current.value = rider.emergencyContact?.name || '';
    if (emergencyPhoneRef.current) emergencyPhoneRef.current.value = rider.emergencyContact?.phone || '';
    if (emergencyRelationshipRef.current) emergencyRelationshipRef.current.value = rider.emergencyContact?.relationship || '';
  };

  async function handleAddRider(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const newRider = {
        name: nameRef.current.value,
        email: emailRef.current.value,
        phone: phoneRef.current.value,
        dateOfBirth: dobRef.current.value,
        licenseNumber: licenseNumberRef.current.value,
        licenseExpiry: licenseExpiryRef.current.value,
        address: {
          street: streetRef.current.value,
          city: cityRef.current.value,
          state: stateRef.current.value,
          zipCode: zipCodeRef.current.value,
          country: 'India'
        },
        emergencyContact: {
          name: emergencyNameRef.current.value,
          phone: emergencyPhoneRef.current.value,
          relationship: emergencyRelationshipRef.current.value
        }
      };

      const res = await fetch("/api/riders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRider),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchRiders(1);
        resetForm();
        setShowAddForm(false);
        toast.success("👤 Rider added successfully!");
      } else {
        toast.error(`❌ Failed to add rider: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding rider:', error);
      toast.error("❌ Failed to add rider");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = async (rider) => {
    setEditingRider(rider);
    populateForm(rider);
    setShowAddForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRider) return;
    
    setLoading(true);
    try {
      const updatedRider = {
        name: nameRef.current.value,
        email: emailRef.current.value,
        phone: phoneRef.current.value,
        dateOfBirth: dobRef.current.value,
        licenseNumber: licenseNumberRef.current.value,
        licenseExpiry: licenseExpiryRef.current.value,
        address: {
          street: streetRef.current.value,
          city: cityRef.current.value,
          state: stateRef.current.value,
          zipCode: zipCodeRef.current.value,
          country: 'India'
        },
        emergencyContact: {
          name: emergencyNameRef.current.value,
          phone: emergencyPhoneRef.current.value,
          relationship: emergencyRelationshipRef.current.value
        }
      };

      const res = await fetch(`/api/riders/${editingRider._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRider),
      });

      const result = await res.json();

      if (res.ok) {
        await fetchRiders(pagination.currentPage);
        resetForm();
        setShowAddForm(false);
        setEditingRider(null);
        toast.success("👤 Rider updated successfully!");
      } else {
        toast.error(`❌ Failed to update rider: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating rider:', error);
      toast.error("❌ Failed to update rider");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (riderId) => {
    if (!confirm("Are you sure you want to delete this rider?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/riders/${riderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchRiders(pagination.currentPage);
        toast.success("👤 Rider deleted successfully!");
      } else {
        let errorMessage = 'Unknown error';
        try {
          const result = await res.json();
          errorMessage = result.error || 'Unknown error';
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = res.statusText || `HTTP ${res.status}`;
        }
        toast.error(`❌ Failed to delete rider: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting rider:', error);
      toast.error("❌ Failed to delete rider");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (editingRider) {
      handleUpdate(e);
    } else {
      handleAddRider(e);
    }
  };

  const handleCancelEdit = () => {
    setEditingRider(null);
    setShowAddForm(false);
    resetForm();
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRiders(riders);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRiders(
        riders.filter((r) => 
          r.name.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query) ||
          r.phone.includes(query) ||
          r.licenseNumber?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, riders]);

  return (
    <ProtectedRoute>
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
                placeholder="Search by name, email, phone, or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>
          )}

          {/* Add/Edit Rider Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="cheetah-gradient-btn px-6 py-2 font-semibold"
            >
              <FaPlus className="mr-2" />
              {editingRider ? 'Edit Rider' : 'Add New Rider'}
            </button>
          </div>

          {/* Add/Edit Rider Form */}
          {showAddForm && (
            <form
              onSubmit={handleFormSubmit}
              className="w-full p-6 bg-black/10 rounded-2xl mb-6"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingRider ? 'Edit Rider' : 'Add New Rider'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Personal Information */}
                <div className="col-span-full">
                  <h4 className="text-md font-medium mb-3 text-orange-400">Personal Information</h4>
                </div>
                
                <FormInput
                  ref={nameRef}
                  type="text"
                  placeholder="Full Name (e.g., John Doe)"
                  required
                  icon={<FaUser />}
                />
                
                <FormInput
                  ref={emailRef}
                  type="email"
                  placeholder="Email Address *"
                  required
                  icon={<FaEnvelope />}
                />
                
                <FormInput
                  ref={phoneRef}
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  icon={<FaPhone />}
                />
                
                <FormInput
                  ref={dobRef}
                  type="date"
                  placeholder="Date of Birth *"
                  required
                />
                
                <FormInput
                  ref={licenseNumberRef}
                  type="text"
                  placeholder="License Number *"
                  required
                  icon={<FaIdCard />}
                />
                <FormInput
                  ref={licenseExpiryRef}
                  type="date"
                  placeholder="License Expiry *"
                  required
                />

                {/* Address Information */}
                <div className="col-span-full">
                  <h4 className="text-md font-medium mb-3 mt-4 text-orange-400">Address</h4>
                </div>
                
                <FormInput
                  ref={streetRef}
                  type="text"
                  placeholder="Street Address"
                  icon={<FaMapMarkerAlt />}
                />
                
                <FormInput
                  ref={cityRef}
                  type="text"
                  placeholder="City"
                />
                
                <FormInput
                  ref={stateRef}
                  type="text"
                  placeholder="State"
                />
                
                <FormInput
                  ref={zipCodeRef}
                  type="text"
                  placeholder="PIN Code"
                />

                {/* Emergency Contact */}
                <div className="col-span-full">
                  <h4 className="text-md font-medium mb-3 mt-4 text-orange-400">Emergency Contact</h4>
                </div>
                
                <FormInput
                  ref={emergencyNameRef}
                  type="text"
                  placeholder="Emergency Contact Name"
                />
                
                <FormInput
                  ref={emergencyPhoneRef}
                  type="tel"
                  placeholder="Emergency Contact Phone"
                  icon={<FaPhone />}
                />
                
                <FormSelect
                  ref={emergencyRelationshipRef}
                  placeholder="Relationship"
                  options={[
                    { value: 'father', label: 'Father' },
                    { value: 'mother', label: 'Mother' },
                    { value: 'spouse', label: 'Spouse' },
                    { value: 'sibling', label: 'Sibling' },
                    { value: 'friend', label: 'Friend' },
                    { value: 'colleague', label: 'Colleague' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                
                <div className="col-span-full flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
                  >
                    {loading ? "Processing..." : (editingRider ? "Update Rider" : "Add Rider")}
                  </button>
                  {editingRider && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-600 hover:bg-gray-700 px-6 py-2 font-semibold rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Riders Table */}
          {loading ? (
            <SkeletonTable columns={6} rows={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full w-full text-sm">
                <thead className="border-b border-white/20">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">License</th>
                    <th className="px-4 py-3 text-left">Location</th>
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
                  {filteredRiders.length > 0 ? (
                    filteredRiders.map((rider, idx) => (
                      <motion.tr
                        key={rider._id}
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
                            <div className="font-medium">{rider.name}</div>
                            <div className="text-xs text-white/60">
                              Joined: {new Date(rider.joinedAt || rider.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-xs">{rider.email}</div>
                            <div className="text-xs text-white/60">{rider.phone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-xs font-mono">{rider.licenseNumber}</div>
                            {rider.licenseExpiry && (
                              <div className="text-xs text-white/60">
                                Exp: {new Date(rider.licenseExpiry).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            {rider.address?.city && rider.address?.state 
                              ? `${rider.address.city}, ${rider.address.state}`
                              : 'Not provided'
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              rider.status === "active"
                                ? "bg-green-500/20 text-green-300"
                                : rider.status === "inactive"
                                ? "bg-gray-500/20 text-gray-300"
                                : rider.status === "suspended"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {rider.status || 'active'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(rider)}
                              className="text-blue-400 hover:text-blue-300 p-1"
                              title="Edit rider"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(rider._id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete rider"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr variants={staggerItem}>
                      <td colSpan="6" className="text-center py-6 text-white/50">
                        No riders found.
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
                onClick={() => fetchRiders(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 bg-white/10 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchRiders(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 bg-white/10 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}