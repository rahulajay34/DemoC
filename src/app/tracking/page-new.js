"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaMapMarkerAlt, 
  FaRoute, 
  FaClock, 
  FaPlay,
  FaPause,
  FaStop,
  FaSearch,
  FaFilter,
  FaBicycle,
  FaUser,
  FaMapPin,
  FaHistory,
  FaTimes,
  FaEye,
  FaRefresh,
  FaLocationArrow,
  FaChartLine
} from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function TrackingPage() {
  const [assignments, setAssignments] = useState([]);
  const [riders, setRiders] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [mapView, setMapView] = useState("grid");
  const [refreshing, setRefreshing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchTrackingData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchTrackingData, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchTrackingData = async () => {
    setLoading(true);
    try {
      const [assignRes, ridersRes, bikesRes] = await Promise.all([
        fetch("/api/assignments?status=active"),
        fetch("/api/riders"),
        fetch("/api/bikes"),
      ]);
      
      const assignmentsData = await assignRes.json();
      const ridersData = await ridersRes.json();
      const bikesData = await bikesRes.json();

      const assignments = assignmentsData.assignments || assignmentsData || [];
      const riders = ridersData.riders || ridersData || [];
      const bikes = bikesData.bikes || bikesData || [];

      // Enhance assignments with tracking data
      const enhancedAssignments = assignments.map(assignment => ({
        ...assignment,
        trackingData: generateMockTrackingData(assignment),
        rider: riders.find(r => r._id === assignment.rider?._id || assignment.rider) || assignment.rider,
        bike: bikes.find(b => b._id === assignment.bike?._id || assignment.bike) || assignment.bike
      }));

      setAssignments(enhancedAssignments);
      setFilteredAssignments(enhancedAssignments);
      setRiders(riders);
      setBikes(bikes);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      toast.error("❌ Failed to load tracking data");
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrackingData = (assignment) => {
    const statuses = ['active', 'parked', 'moving', 'idle'];
    const locations = [
      { name: "Connaught Place", lat: 28.6139, lng: 77.2090 },
      { name: "India Gate", lat: 28.6129, lng: 77.2295 },
      { name: "Red Fort", lat: 28.6562, lng: 77.2410 },
      { name: "Lajpat Nagar", lat: 28.5677, lng: 77.2431 },
      { name: "Karol Bagh", lat: 28.6519, lng: 77.1909 }
    ];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      status: randomStatus,
      currentLocation: {
        ...randomLocation,
        address: `${randomLocation.name}, New Delhi`
      },
      lastUpdate: new Date(),
      speed: randomStatus === 'moving' ? Math.floor(Math.random() * 40) + 10 : 0,
      batteryLevel: Math.floor(Math.random() * 50) + 50,
      totalDistance: Math.floor(Math.random() * 200) + 50,
      todayDistance: Math.floor(Math.random() * 50) + 10,
      rideTime: Math.floor(Math.random() * 480) + 60 // minutes
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTrackingData();
    setRefreshing(false);
    toast.success("🔄 Tracking data refreshed");
  };

  const handleViewDetails = (assignment) => {
    setSelectedTracking(assignment);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300';
      case 'moving': return 'bg-blue-500/20 text-blue-300';
      case 'parked': return 'bg-yellow-500/20 text-yellow-300';
      case 'idle': return 'bg-gray-500/20 text-gray-300';
      case 'maintenance': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'moving': return <FaPlay className="text-green-400" size={12} />;
      case 'parked': return <FaPause className="text-yellow-400" size={12} />;
      case 'idle': return <FaStop className="text-gray-400" size={12} />;
      default: return <FaClock className="text-gray-400" size={12} />;
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssignments(assignments);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAssignments(
        assignments.filter((assignment) =>
          assignment.rider?.name?.toLowerCase().includes(query) ||
          assignment.bike?.make?.toLowerCase().includes(query) ||
          assignment.bike?.model?.toLowerCase().includes(query) ||
          assignment.bike?.number?.toLowerCase().includes(query) ||
          assignment.trackingData?.currentLocation?.address?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, assignments]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredAssignments(assignments);
    } else {
      setFilteredAssignments(
        assignments.filter(assignment => assignment.trackingData?.status === statusFilter)
      );
    }
  }, [statusFilter, assignments]);

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaMapMarkerAlt className="mr-3 text-blue-400" />
              Live Tracking
            </h1>
            <p className="text-gray-400 mt-1">Real-time location and status of your fleet</p>
          </div>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className="text-white/80 hover:text-white text-lg p-2 lg:hidden"
          >
            {searchActive ? <FaTimes size={22} /> : <FaSearch size={22} />}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Search - Desktop */}
          <div className="hidden lg:flex">
            <input
              type="text"
              placeholder="Search by rider, bike, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
          >
            <FaRefresh className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search - Mobile */}
      {searchActive && (
        <div className="lg:hidden">
          <input
            type="text"
            placeholder="Search by rider, bike, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="moving">Moving</option>
          <option value="parked">Parked</option>
          <option value="idle">Idle</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setMapView("grid")}
            className={`px-4 py-2 rounded font-medium ${mapView === "grid" ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setMapView("map")}
            className={`px-4 py-2 rounded font-medium ${mapView === "map" ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Active Rides", value: filteredAssignments.filter(a => a.trackingData?.status === 'active').length, icon: <FaPlay className="text-green-400" /> },
          { title: "Moving Bikes", value: filteredAssignments.filter(a => a.trackingData?.status === 'moving').length, icon: <FaBicycle className="text-blue-400" /> },
          { title: "Parked Bikes", value: filteredAssignments.filter(a => a.trackingData?.status === 'parked').length, icon: <FaPause className="text-yellow-400" /> },
          { title: "Total Distance", value: `${filteredAssignments.reduce((sum, a) => sum + (a.trackingData?.todayDistance || 0), 0)} km`, icon: <FaRoute className="text-purple-400" /> }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              {card.icon}
              <span className="text-2xl font-bold text-white">{card.value}</span>
            </div>
            <h3 className="text-gray-400 text-sm">{card.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Tracking Data */}
      {loading ? (
        <SkeletonTable columns={8} rows={6} />
      ) : mapView === "grid" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-sm">
            <thead className="border-b border-white/20">
              <tr>
                <th className="px-4 py-3 text-left">Rider & Bike</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Current Location</th>
                <th className="px-4 py-3 text-left">Speed</th>
                <th className="px-4 py-3 text-left">Battery</th>
                <th className="px-4 py-3 text-left">Distance Today</th>
                <th className="px-4 py-3 text-left">Last Update</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment, idx) => (
                  <tr
                    key={assignment._id}
                    className="border-b border-white/10 animate-slide-up hover:bg-white/5"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-white flex items-center">
                          <FaUser className="mr-2 text-blue-400" size={12} />
                          {assignment.rider?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-white/60 flex items-center">
                          <FaBicycle className="mr-2 text-green-400" size={12} />
                          {assignment.bike?.make} {assignment.bike?.model} ({assignment.bike?.number})
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 w-fit ${getStatusColor(assignment.trackingData?.status)}`}>
                        {getStatusIcon(assignment.trackingData?.status)}
                        {assignment.trackingData?.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-white/80">
                        <FaMapPin className="mr-2 text-red-400" size={12} />
                        <span className="text-xs">{assignment.trackingData?.currentLocation?.address || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">{assignment.trackingData?.speed || 0} km/h</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${assignment.trackingData?.batteryLevel || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">{assignment.trackingData?.batteryLevel || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">{assignment.trackingData?.todayDistance || 0} km</td>
                    <td className="px-4 py-3 text-white/60 text-xs">
                      {assignment.trackingData?.lastUpdate ? new Date(assignment.trackingData.lastUpdate).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(assignment)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View details"
                      >
                        <FaEye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-white/50">
                    No active assignments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="mx-auto text-gray-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Map</h3>
              <p className="text-gray-400">Map integration would be implemented here with Google Maps or similar service</p>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedTracking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTracking(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">Tracking Details</h3>
              <button
                onClick={() => setSelectedTracking(null)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Rider & Vehicle</h4>
                <p className="text-white">{selectedTracking.rider?.name}</p>
                <p className="text-gray-300 text-sm">{selectedTracking.bike?.make} {selectedTracking.bike?.model}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Current Status</h4>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(selectedTracking.trackingData?.status)}`}>
                  {selectedTracking.trackingData?.status}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Location</h4>
                <p className="text-white text-sm">{selectedTracking.trackingData?.currentLocation?.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs text-gray-400">Speed</h5>
                  <p className="text-white">{selectedTracking.trackingData?.speed} km/h</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-400">Battery</h5>
                  <p className="text-white">{selectedTracking.trackingData?.batteryLevel}%</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-400">Today Distance</h5>
                  <p className="text-white">{selectedTracking.trackingData?.todayDistance} km</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-400">Ride Time</h5>
                  <p className="text-white">{Math.floor((selectedTracking.trackingData?.rideTime || 0) / 60)}h {(selectedTracking.trackingData?.rideTime || 0) % 60}m</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
