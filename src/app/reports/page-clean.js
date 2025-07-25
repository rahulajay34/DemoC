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
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

export default function ReportsPage() {
  const { theme, getThemeClasses } = useTheme();
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

  // Theme helper functions
  const getCardStyles = () => {
    return getThemeClasses(
      'bg-white/80 border-gray-200/50',
      'bg-gray-900/50 border-gray-700/50'
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return getThemeClasses('bg-emerald-200/80 text-emerald-800 border-emerald-300', 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50');
      case 'generating': return getThemeClasses('bg-blue-200/80 text-blue-800 border-blue-300', 'bg-blue-500/20 text-blue-300 border-blue-400/50');
      case 'failed': return getThemeClasses('bg-red-200/80 text-red-800 border-red-300', 'bg-red-500/20 text-red-300 border-red-400/50');
      default: return getThemeClasses('bg-gray-200/80 text-gray-700 border-gray-300', 'bg-gray-500/20 text-gray-300 border-gray-400/50');
    }
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'revenue': return <FaCreditCard className={getThemeClasses('text-emerald-600', 'text-green-400')} size={16} />;
      case 'fleet': return <FaBicycle className={getThemeClasses('text-blue-600', 'text-blue-400')} size={16} />;
      case 'maintenance': return <FaWrench className={getThemeClasses('text-orange-600', 'text-orange-400')} size={16} />;
      case 'users': return <FaUsers className={getThemeClasses('text-purple-600', 'text-purple-400')} size={16} />;
      default: return <FaFileAlt className={getThemeClasses('text-gray-500', 'text-gray-400')} size={16} />;
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/reports?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        setFilteredReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
    } else {
      setFilteredReports(
        reports.filter(report =>
          report.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.type?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, reports]);

  const handleGenerateReport = async () => {
    setGenerating(newReportType);
    try {
      const reportData = {
        type: newReportType,
        format: newReportFormat,
        dateRange: newReportRange,
        includeCharts
      };

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        toast.success('Report generation started');
        setShowGenerateForm(false);
        fetchReports();
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (reportId, fileName) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Report downloaded successfully');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  return (
    <div className={`min-h-screen p-6 space-y-8 ${theme.colors.background}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className={`text-3xl font-bold ${theme.colors.textPrimary} flex items-center`}>
              <FaChartLine className={`mr-3 ${getThemeClasses('text-purple-600', 'text-purple-400')}`} />
              Reports & Analytics
            </h1>
            <p className={`${theme.colors.textMuted} mt-1`}>Generate and download detailed business reports</p>
          </div>
          <button
            onClick={() => {
              setSearchActive((prev) => !prev);
              if (searchActive) setSearchQuery("");
            }}
            className={`${theme.colors.textPrimary} hover:opacity-80 text-lg p-2 lg:hidden`}
          >
            <FaSearch />
          </button>
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${getCardStyles()} border rounded-lg px-4 py-2 pr-10 ${theme.colors.textPrimary} backdrop-blur-sm`}
            />
            <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.colors.textMuted}`} />
          </div>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FaPlus size={14} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${getCardStyles()} border rounded-lg px-4 py-2 pr-10 ${theme.colors.textPrimary} backdrop-blur-sm`}
            />
            <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.colors.textMuted}`} />
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
        >
          <option value="all">All Reports</option>
          <option value="revenue">Revenue</option>
          <option value="fleet">Fleet</option>
          <option value="maintenance">Maintenance</option>
          <option value="users">Users</option>
        </select>

        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
        />

        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          className={`${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
        />

        {/* Mobile Generate Button */}
        <button
          onClick={() => setShowGenerateForm(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <FaPlus size={14} />
          Generate
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <SkeletonTable />
      ) : (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className={`${getCardStyles()} rounded-xl p-8 text-center backdrop-blur-lg border glass-card`}>
              <FaFileAlt className={`mx-auto ${theme.colors.textMuted} mb-4`} size={48} />
              <p className={`${theme.colors.textPrimary} text-lg mb-2`}>No reports found</p>
              <p className={`${theme.colors.textMuted}`}>
                {searchQuery || reportType !== "all"
                  ? "Try adjusting your filters"
                  : "Generate your first report to get started"}
              </p>
              <button
                onClick={() => setShowGenerateForm(true)}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Generate Report
              </button>
            </div>
          ) : (
            filteredReports.map((report, index) => (
              <motion.div
                key={report._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${getCardStyles()} rounded-xl p-6 backdrop-blur-lg border glass-card`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getReportIcon(report.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-medium ${theme.colors.textPrimary} mb-1`}>
                          {report.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`${theme.colors.textMuted} capitalize`}>
                            {report.type} Report
                          </span>
                          <span className={`${theme.colors.textMuted}`}>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className={`${theme.colors.textMuted} text-sm mt-2`}>
                          Period: {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {report.status === 'completed' && (
                          <button
                            onClick={() => handleDownload(report._id, report.fileName)}
                            className={`p-2 rounded-lg ${getThemeClasses('hover:bg-gray-100', 'hover:bg-gray-700')} transition-colors`}
                            title="Download"
                          >
                            <FaDownload className={getThemeClasses('text-blue-600', 'text-blue-400')} size={14} />
                          </button>
                        )}
                        {report.status === 'generating' && (
                          <div className="p-2">
                            <FaSpinner className={`${getThemeClasses('text-blue-600', 'text-blue-400')} animate-spin`} size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${getCardStyles()} rounded-xl p-6 max-w-md w-full backdrop-blur-lg border glass-card`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme.colors.textPrimary}`}>Generate New Report</h3>
              <button
                onClick={() => setShowGenerateForm(false)}
                className={`p-2 rounded-lg ${getThemeClasses('hover:bg-gray-100', 'hover:bg-gray-700')} transition-colors`}
              >
                <FaTimes className={theme.colors.textMuted} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme.colors.textMuted} mb-1`}>Report Type</label>
                <select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value)}
                  className={`w-full ${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
                >
                  <option value="revenue">Revenue Report</option>
                  <option value="fleet">Fleet Report</option>
                  <option value="maintenance">Maintenance Report</option>
                  <option value="users">Users Report</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.colors.textMuted} mb-1`}>Format</label>
                <select
                  value={newReportFormat}
                  onChange={(e) => setNewReportFormat(e.target.value)}
                  className={`w-full ${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium ${theme.colors.textMuted} mb-1`}>Start Date</label>
                  <input
                    type="date"
                    value={newReportRange.startDate}
                    onChange={(e) => setNewReportRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full ${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.colors.textMuted} mb-1`}>End Date</label>
                  <input
                    type="date"
                    value={newReportRange.endDate}
                    onChange={(e) => setNewReportRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className={`w-full ${getCardStyles()} border rounded px-3 py-2 ${theme.colors.textPrimary} backdrop-blur-sm`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="includeCharts" className={`text-sm ${theme.colors.textMuted}`}>Include charts and graphs</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateForm(false)}
                  className={`flex-1 py-2 px-4 ${getThemeClasses('bg-gray-200 text-gray-700 hover:bg-gray-300', 'bg-gray-600 text-gray-300 hover:bg-gray-500')} rounded-lg transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {generating ? <FaSpinner className="animate-spin mx-auto" size={14} /> : 'Generate'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
