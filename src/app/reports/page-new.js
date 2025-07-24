"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaFileAlt,
  FaDownload,
  FaCalendarAlt,
  FaFilter,
  FaChartLine,
  FaPrint,
  FaSearch,
  FaBicycle,
  FaCreditCard,
  FaWrench,
  FaFileExport,
  FaFilePdf,
  FaFileExcel,
  FaUsers,
  FaPlus,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generating, setGenerating] = useState(null);

  // Form state for generating new reports
  const [newReportType, setNewReportType] = useState("revenue");
  const [newReportFormat, setNewReportFormat] = useState("pdf");
  const [newReportRange, setNewReportRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [includeCharts, setIncludeCharts] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, [reportType, dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportType !== "all") params.append('type', reportType);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      // Since we don't have a reports API endpoint, simulate with combined data
      const [analyticsRes, dashboardRes] = await Promise.all([
        fetch(`/api/analytics?${params}`),
        fetch(`/api/dashboard?${params}`)
      ]);
      
      const analyticsData = await analyticsRes.json();
      const dashboardData = await dashboardRes.json();
      
      // Generate simulated reports based on real data
      const simulatedReports = generateReportsFromData(analyticsData, dashboardData);
      setReports(simulatedReports);
      setFilteredReports(simulatedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("❌ Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const generateReportsFromData = (analytics, dashboard) => {
    const currentDate = new Date();
    const reports = [
      {
        _id: "rep_" + Date.now() + "_1",
        title: "Monthly Revenue Report",
        type: "revenue",
        description: "Comprehensive revenue analysis and financial metrics",
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`,
        status: "completed",
        generatedDate: currentDate,
        fileSize: "2.4 MB",
        format: "PDF",
        category: "Financial",
        data: {
          totalRevenue: analytics?.totalRevenue || 0,
          growth: analytics?.revenueGrowth || 0
        }
      },
      {
        _id: "rep_" + Date.now() + "_2",
        title: "Fleet Utilization Report",
        type: "fleet",
        description: "Bike utilization rates and performance metrics",
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`,
        status: "completed",
        generatedDate: new Date(currentDate.getTime() - 86400000),
        fileSize: "1.8 MB",
        format: "Excel",
        category: "Operations",
        data: {
          utilizationRate: analytics?.utilizationRate || 0,
          totalBikes: dashboard?.summary?.totalBikes || 0
        }
      },
      {
        _id: "rep_" + Date.now() + "_3",
        title: "Rider Performance Report",
        type: "riders",
        description: "Customer engagement and rider activity analysis",
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`,
        status: "completed",
        generatedDate: new Date(currentDate.getTime() - 172800000),
        fileSize: "3.1 MB",
        format: "PDF",
        category: "Customer",
        data: {
          activeRiders: dashboard?.summary?.activeRiders || 0,
          topRiders: analytics?.topRiders?.length || 0
        }
      },
      {
        _id: "rep_" + Date.now() + "_4",
        title: "Maintenance Analytics",
        type: "maintenance",
        description: "Maintenance costs, schedules and bike health metrics",
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`,
        status: "completed",
        generatedDate: new Date(currentDate.getTime() - 259200000),
        fileSize: "1.5 MB",
        format: "PDF",
        category: "Maintenance",
        data: {
          maintenanceCost: analytics?.maintenanceCost || 0,
          pendingMaintenance: dashboard?.summary?.pendingMaintenance || 0
        }
      }
    ];

    // Filter by type if specified
    if (reportType !== "all") {
      return reports.filter(report => report.type === reportType);
    }
    
    return reports;
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerating(newReportType);
    
    try {
      const reportData = {
        type: newReportType,
        format: newReportFormat,
        startDate: newReportRange.startDate,
        endDate: newReportRange.endDate,
        includeCharts: includeCharts
      };

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would hit an API endpoint
      // const response = await fetch('/api/reports/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reportData)
      // });
      
      toast.success("📊 Report generated successfully!");
      setShowGenerateForm(false);
      await fetchReports();
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("❌ Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadReport = async (reportId, format) => {
    try {
      // Simulate download - in real app would fetch from API
      toast.success(`📁 Downloading ${format.toUpperCase()} report...`);
      
      // Create a mock download blob
      const mockData = "Report data would be here...";
      const blob = new Blob([mockData], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("❌ Download failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'generating': return 'bg-yellow-500/20 text-yellow-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'revenue': return <FaCreditCard className="text-green-400" size={16} />;
      case 'fleet': return <FaBicycle className="text-blue-400" size={16} />;
      case 'riders': return <FaUsers className="text-purple-400" size={16} />;
      case 'maintenance': return <FaWrench className="text-orange-400" size={16} />;
      default: return <FaFileAlt className="text-gray-400" size={16} />;
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredReports(
        reports.filter((report) =>
          report.title?.toLowerCase().includes(query) ||
          report.description?.toLowerCase().includes(query) ||
          report.category?.toLowerCase().includes(query) ||
          report.type?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, reports]);

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaFileAlt className="mr-3 text-green-400" />
              Reports
            </h1>
            <p className="text-gray-400 mt-1">Generate and download comprehensive business reports</p>
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
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
          >
            <FaPlus className="mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Search - Mobile */}
      {searchActive && (
        <div className="lg:hidden">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        >
          <option value="all">All Types</option>
          <option value="revenue">Revenue Reports</option>
          <option value="fleet">Fleet Reports</option>
          <option value="riders">Rider Reports</option>
          <option value="maintenance">Maintenance Reports</option>
        </select>

        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
          className="bg-white/10 border border-white/20 rounded px-3 py-2"
        />
      </div>

      {/* Generate Report Form */}
      {showGenerateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Generate New Report</h3>
          <form onSubmit={handleGenerateReport}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <select
                value={newReportType}
                onChange={(e) => setNewReportType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                required
              >
                <option value="revenue">Revenue Report</option>
                <option value="fleet">Fleet Utilization</option>
                <option value="riders">Rider Performance</option>
                <option value="maintenance">Maintenance Analytics</option>
              </select>

              <select
                value={newReportFormat}
                onChange={(e) => setNewReportFormat(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>

              <input
                type="date"
                value={newReportRange.startDate}
                onChange={(e) => setNewReportRange(prev => ({...prev, startDate: e.target.value}))}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                required
              />

              <input
                type="date"
                value={newReportRange.endDate}
                onChange={(e) => setNewReportRange(prev => ({...prev, endDate: e.target.value}))}
                className="bg-white/10 border border-white/20 rounded px-3 py-2"
                required
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded"
                />
                Include Charts & Visualizations
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={generating}
                className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
              >
                {generating ? <FaSpinner className="mr-2 animate-spin" /> : <FaFileExport className="mr-2" />}
                {generating ? "Generating..." : "Generate Report"}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 font-semibold rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <SkeletonTable columns={6} rows={8} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50 hover:border-orange-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(report.type)}
                  <div>
                    <h3 className="font-semibold text-white text-lg">{report.title}</h3>
                    <p className="text-gray-400 text-sm">{report.category}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-4">{report.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Date Range:</span>
                  <span className="text-white">{report.dateRange}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Generated:</span>
                  <span className="text-white">{new Date(report.generatedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">{report.fileSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white">{report.format}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadReport(report._id, report.format.toLowerCase())}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium text-sm flex items-center justify-center"
                >
                  <FaDownload className="mr-2" size={12} />
                  Download
                </button>
                <button
                  onClick={() => toast.info("🖨️ Print functionality coming soon!")}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded"
                >
                  <FaPrint size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FaFileAlt className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">No Reports Found</h3>
          <p className="text-gray-400 mb-4">Generate your first report to get started</p>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="cheetah-gradient-btn px-6 py-2 font-semibold"
          >
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
}
