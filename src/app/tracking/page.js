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
  FaSync,
  FaLocationArrow,
  FaChartLine
} from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function TrackingPage() {
  const { 
    theme, 
    getThemeClasses,
    getCardStyles,
    getButtonStyles,
    getStatusColor,
    getGlassStyles
  } = useTheme();
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'moving': return <FaPlay className={getStatusColor("success")} size={12} />;
      case 'parked': return <FaPause className={getStatusColor("warning")} size={12} />;
      case 'idle': return <FaStop className={getStatusColor("info")} size={12} />;
      default: return <FaClock className={theme.colors.textMuted} size={12} />;
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
    <div className={`min-h-screen p-6 space-y-8 ${theme.colors.primary}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className={`text-3xl font-bold ${theme.colors.textPrimary} flex items-center`}>
              <FaMapMarkerAlt className={`mr-3 ${theme.colors.textAccent}`} />
              Live Tracking
            </h1>
            <p className={`${theme.colors.textMuted} mt-1`}>Real-time location and status of your fleet</p>
          </div>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className={`${theme.colors.textPrimary} hover:opacity-80 text-lg p-2 lg:hidden`}
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
              className={`w-64 ${theme.colors.input} ${theme.colors.inputFocus} rounded-full px-4 py-2`}
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`${getButtonStyles("primary")} px-6 py-2 rounded-lg font-semibold flex items-center`}
          >
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
            className={`w-full ${theme.colors.input} ${theme.colors.inputFocus} rounded-full px-4 py-2`}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${theme.colors.input} ${theme.colors.inputFocus} rounded-lg px-4 py-2`}
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
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${mapView === "grid" 
              ? getButtonStyles("primary")
              : getButtonStyles("secondary")
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setMapView("map")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${mapView === "map" 
              ? getButtonStyles("primary")
              : getButtonStyles("secondary")
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Active Rides", value: filteredAssignments.filter(a => a.trackingData?.status === 'active').length, icon: <FaPlay className={getStatusColor("success")} /> },
          { title: "Moving Bikes", value: filteredAssignments.filter(a => a.trackingData?.status === 'moving').length, icon: <FaBicycle className={getStatusColor("info")} /> },
          { title: "Parked Bikes", value: filteredAssignments.filter(a => a.trackingData?.status === 'parked').length, icon: <FaPause className={getStatusColor("warning")} /> },
          { title: "Total Distance", value: `${filteredAssignments.reduce((sum, a) => sum + (a.trackingData?.todayDistance || 0), 0)} km`, icon: <FaRoute className={theme.colors.textAccent} /> }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${getCardStyles()} p-6 rounded-2xl ${theme.colors.cardHover}`}
          >
            <div className="flex items-center justify-between mb-2">
              {card.icon}
              <span className={`text-2xl font-bold ${theme.colors.textPrimary}`}>{card.value}</span>
            </div>
            <h3 className={`${theme.colors.textMuted} text-sm`}>{card.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Tracking Data */}
      {loading ? (
        <SkeletonTable columns={8} rows={6} />
      ) : mapView === "grid" ? (
        <div className={`${getCardStyles()} rounded-2xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full w-full text-sm">
              <thead className={`${theme.colors.secondary} ${theme.colors.borderPrimary} border-b`}>
                <tr>
                  <th className={`px-4 py-3 text-left ${theme.colors.textSecondary} font-medium`}>Rider & Bike</th>
                  <th className={`px-4 py-3 text-left ${theme.colors.textSecondary} font-medium`}>Status</th>
                  <th className={`px-4 py-3 text-left ${theme.colors.textSecondary} font-medium`}>Current Location</th>
                  <th className={`px-4 py-3 text-left ${theme.colors.textSecondary} font-medium`}>Speed</th>
                  <th className={`px-4 py-3 text-left ${theme.colors.textSecondary} font-medium`}>Battery</th>
                  <th className={`px-4 py-3 text-left ${theme.colors.textSecondary} font-medium`}>Distance Today</th>
                  <th className={`px-4 py-3 text-left ${theme.colors.textSecondary} font-medium`}>Last Update</th>
                  <th className={`px-4 py-3 text-left ${theme.colors.textSecondary} font-medium`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment, idx) => (
                    <tr
                      key={assignment._id}
                      className={`${theme.colors.borderMuted} border-b animate-slide-up ${theme.colors.surfaceHover} transition-all duration-300`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className={`font-medium ${theme.colors.textPrimary} flex items-center`}>
                            <FaUser className={`mr-2 ${getStatusColor("info")}`} size={12} />
                            {assignment.rider?.name || 'N/A'}
                          </div>
                          <div className={`text-xs ${theme.colors.textMuted} flex items-center`}>
                            <FaBicycle className={`mr-2 ${getStatusColor("success")}`} size={12} />
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
                        <div className={`flex items-center ${theme.colors.textSecondary}`}>
                          <FaMapPin className={`mr-2 ${getStatusColor("error")}`} size={12} />
                          <span className="text-xs">{assignment.trackingData?.currentLocation?.address || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${theme.colors.textPrimary}`}>
                        <span>{assignment.trackingData?.speed || 0} km/h</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className={`w-16 ${theme.colors.tertiary} rounded-full h-2 mr-2`}>
                            <div 
                              className={`${getStatusColor("success")} h-2 rounded-full`} 
                              style={{ width: `${assignment.trackingData?.batteryLevel || 0}%` }}
                            />
                          </div>
                          <span className={`text-xs ${theme.colors.textPrimary}`}>{assignment.trackingData?.batteryLevel || 0}%</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${theme.colors.textPrimary}`}>{assignment.trackingData?.todayDistance || 0} km</td>
                      <td className={`px-4 py-3 ${theme.colors.textMuted} text-xs`}>
                        {assignment.trackingData?.lastUpdate ? new Date(assignment.trackingData.lastUpdate).toLocaleTimeString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(assignment)}
                          className={`${getStatusColor("info")} hover:opacity-80 p-1`}
                          title="View details"
                        >
                          <FaEye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className={`text-center py-6 ${theme.colors.textMuted}`}>
                      No active assignments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={`${getCardStyles()} p-6 rounded-2xl`}>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className={`mx-auto ${theme.colors.textMuted} mb-4`} size={48} />
              <h3 className={`text-xl font-semibold ${theme.colors.textPrimary} mb-2`}>Interactive Map</h3>
              <p className={theme.colors.textSecondary}>Map integration would be implemented here with Google Maps or similar service</p>
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
            className={`${getCardStyles()} p-6 rounded-2xl max-w-md w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-lg font-semibold ${theme.colors.textPrimary}`}>Tracking Details</h3>
              <button
                onClick={() => setSelectedTracking(null)}
                className={`${theme.colors.textMuted} hover:opacity-80`}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium ${theme.colors.textSecondary} mb-2`}>Rider & Vehicle</h4>
                <p className={theme.colors.textPrimary}>{selectedTracking.rider?.name}</p>
                <p className={`${theme.colors.textMuted} text-sm`}>{selectedTracking.bike?.make} {selectedTracking.bike?.model}</p>
              </div>
              
              <div>
                <h4 className={`text-sm font-medium ${theme.colors.textSecondary} mb-2`}>Current Status</h4>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(selectedTracking.trackingData?.status)}`}>
                  {selectedTracking.trackingData?.status}
                </span>
              </div>
              
              <div>
                <h4 className={`text-sm font-medium ${theme.colors.textSecondary} mb-2`}>Location</h4>
                <p className={`${theme.colors.textPrimary} text-sm`}>{selectedTracking.trackingData?.currentLocation?.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className={`text-xs ${theme.colors.textMuted}`}>Speed</h5>
                  <p className={theme.colors.textPrimary}>{selectedTracking.trackingData?.speed} km/h</p>
                </div>
                <div>
                  <h5 className={`text-xs ${theme.colors.textMuted}`}>Battery</h5>
                  <p className={theme.colors.textPrimary}>{selectedTracking.trackingData?.batteryLevel}%</p>
                </div>
                <div>
                  <h5 className={`text-xs ${theme.colors.textMuted}`}>Today Distance</h5>
                  <p className={theme.colors.textPrimary}>{selectedTracking.trackingData?.todayDistance} km</p>
                </div>
                <div>
                  <h5 className={`text-xs ${theme.colors.textMuted}`}>Ride Time</h5>
                  <p className={theme.colors.textPrimary}>{Math.floor((selectedTracking.trackingData?.rideTime || 0) / 60)}h {(selectedTracking.trackingData?.rideTime || 0) % 60}m</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
