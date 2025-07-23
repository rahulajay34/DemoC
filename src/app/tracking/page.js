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
  FaHistory
} from "react-icons/fa";

export default function TrackingPage() {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [mapView, setMapView] = useState("grid");

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      // Simulated tracking data
      const simulatedData = [
        {
          _id: "track1",
          assignmentId: "ASN001",
          bikeId: "BK001",
          riderId: "RD001",
          bikeName: "Honda Activa 125",
          riderName: "Rahul Sharma",
          currentLocation: {
            lat: 28.6139,
            lng: 77.2090,
            address: "Connaught Place, New Delhi"
          },
          status: "active",
          startTime: new Date("2024-01-15T09:00:00"),
          route: [
            { lat: 28.6129, lng: 77.2295, timestamp: "09:00" },
            { lat: 28.6139, lng: 77.2090, timestamp: "09:15" },
            { lat: 28.6239, lng: 77.1850, timestamp: "09:30" }
          ],
          totalDistance: 12.5,
          duration: "2h 30m",
          speed: 5.0
        },
        {
          _id: "track2",
          assignmentId: "ASN002",
          bikeId: "BK002",
          riderId: "RD002",
          bikeName: "TVS Jupiter",
          riderName: "Priya Singh",
          currentLocation: {
            lat: 28.5355,
            lng: 77.3910,
            address: "Noida Sector 18"
          },
          status: "paused",
          startTime: new Date("2024-01-15T10:30:00"),
          route: [
            { lat: 28.5355, lng: 77.3910, timestamp: "10:30" },
            { lat: 28.5455, lng: 77.3710, timestamp: "10:45" }
          ],
          totalDistance: 8.2,
          duration: "1h 45m",
          speed: 4.7
        },
        {
          _id: "track3",
          assignmentId: "ASN003",
          bikeId: "BK003",
          riderId: "RD003",
          bikeName: "Hero Maestro",
          riderName: "Amit Kumar",
          currentLocation: {
            lat: 28.4595,
            lng: 77.0266,
            address: "Gurgaon City Center"
          },
          status: "completed",
          startTime: new Date("2024-01-15T08:00:00"),
          endTime: new Date("2024-01-15T12:00:00"),
          route: [
            { lat: 28.4595, lng: 77.0266, timestamp: "08:00" },
            { lat: 28.4695, lng: 77.0366, timestamp: "08:30" },
            { lat: 28.4795, lng: 77.0466, timestamp: "09:00" },
            { lat: 28.4895, lng: 77.0566, timestamp: "09:30" },
            { lat: 28.4595, lng: 77.0266, timestamp: "12:00" }
          ],
          totalDistance: 25.8,
          duration: "4h 00m",
          speed: 6.5
        }
      ];
      setTrackingData(simulatedData);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTracking = trackingData.filter(track => {
    const matchesSearch = track.bikeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.riderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         track.assignmentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || track.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "text-green-400 bg-green-400/20";
      case "paused": return "text-yellow-400 bg-yellow-400/20";
      case "completed": return "text-blue-400 bg-blue-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return <FaPlay className="text-green-400" />;
      case "paused": return <FaPause className="text-yellow-400" />;
      case "completed": return <FaStop className="text-blue-400" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaMapMarkerAlt className="text-green-500" />
            Live Tracking
          </h1>
          <p className="text-gray-400 mt-1">Real-time location tracking and route monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMapView(mapView === "grid" ? "map" : "grid")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaMapPin /> {mapView === "grid" ? "Map View" : "Grid View"}
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by bike, rider, or assignment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaPlay className="text-green-400" size={20} />
            <span className="text-gray-400">Active Rides</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {filteredTracking.filter(t => t.status === "active").length}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaPause className="text-yellow-400" size={20} />
            <span className="text-gray-400">Paused</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {filteredTracking.filter(t => t.status === "paused").length}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaRoute className="text-blue-400" size={20} />
            <span className="text-gray-400">Total Distance</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {filteredTracking.reduce((sum, t) => sum + t.totalDistance, 0).toFixed(1)} km
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-2xl border border-gray-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaClock className="text-purple-400" size={20} />
            <span className="text-gray-400">Avg Speed</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {(filteredTracking.reduce((sum, t) => sum + t.speed, 0) / filteredTracking.length || 0).toFixed(1)} km/h
          </p>
        </motion.div>
      </div>

      {/* Tracking Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTracking.map((track, index) => (
            <motion.div
              key={track._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedTracking(track)}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <FaBicycle className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{track.bikeName}</h3>
                    <p className="text-gray-400 text-sm">{track.assignmentId}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusColor(track.status)}`}>
                  {getStatusIcon(track.status)}
                  {track.status}
                </div>
              </div>

              {/* Rider Info */}
              <div className="flex items-center gap-2 mb-4">
                <FaUser className="text-gray-400" size={14} />
                <span className="text-gray-300">{track.riderName}</span>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 mb-4">
                <FaMapMarkerAlt className="text-green-400 mt-1" size={14} />
                <div>
                  <p className="text-white text-sm font-medium">Current Location</p>
                  <p className="text-gray-400 text-xs">{track.currentLocation.address}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Distance</p>
                  <p className="text-white font-semibold">{track.totalDistance} km</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Duration</p>
                  <p className="text-white font-semibold">{track.duration}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Speed</p>
                  <p className="text-white font-semibold">{track.speed} km/h</p>
                </div>
              </div>

              {/* Route Points */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaRoute className="text-blue-400" size={14} />
                  <span className="text-gray-400 text-sm">Route ({track.route.length} points)</span>
                </div>
                <div className="flex gap-1">
                  {track.route.slice(0, 5).map((point, idx) => (
                    <div 
                      key={idx}
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      title={`${point.timestamp} - ${point.lat}, ${point.lng}`}
                    />
                  ))}
                  {track.route.length > 5 && (
                    <span className="text-gray-400 text-xs ml-2">+{track.route.length - 5} more</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTracking.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <FaHistory className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No tracking data found</h3>
          <p className="text-gray-500">No rides match your current filters</p>
        </motion.div>
      )}
    </div>
  );
}
