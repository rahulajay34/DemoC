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
  FaUsers
} from "react-icons/fa";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Simulated reports data
      const simulatedReports = [
        {
          _id: "rep1",
          title: "Monthly Revenue Report",
          type: "financial",
          description: "Comprehensive revenue analysis for the current month",
          dateRange: "January 2024",
          status: "completed",
          generatedDate: new Date("2024-01-31"),
          fileSize: "2.4 MB",
          format: "PDF",
          category: "Revenue",
          data: {
            totalRevenue: 245000,
            totalTransactions: 456,
            avgTransactionValue: 537
          }
        },
        {
          _id: "rep2",
          title: "Fleet Utilization Analysis",
          type: "operational",
          description: "Detailed analysis of bike utilization and performance metrics",
          dateRange: "January 2024",
          status: "completed",
          generatedDate: new Date("2024-01-30"),
          fileSize: "1.8 MB",
          format: "Excel",
          category: "Operations",
          data: {
            totalBikes: 125,
            averageUtilization: 78.5,
            topPerformingBikes: 12
          }
        },
        {
          _id: "rep3",
          title: "Maintenance Cost Summary",
          type: "maintenance",
          description: "Monthly maintenance expenses and scheduled maintenance overview",
          dateRange: "January 2024",
          status: "completed",
          generatedDate: new Date("2024-01-29"),
          fileSize: "980 KB",
          format: "PDF",
          category: "Maintenance",
          data: {
            totalMaintenanceCost: 45600,
            completedServices: 34,
            pendingServices: 8
          }
        },
        {
          _id: "rep4",
          title: "Rider Performance Dashboard",
          type: "performance",
          description: "Top riders, ratings, and performance analytics",
          dateRange: "January 2024",
          status: "generating",
          generatedDate: new Date(),
          fileSize: "Generating...",
          format: "PDF",
          category: "Performance",
          data: {
            totalRiders: 156,
            averageRating: 4.3,
            topRiders: 25
          }
        }
      ];
      setReports(simulatedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const reportTemplates = [
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Detailed financial performance and revenue analytics",
      icon: <FaCreditCard className="text-green-500" />,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      id: "fleet",
      title: "Fleet Analysis",
      description: "Bike utilization, performance, and availability metrics",
      icon: <FaBicycle className="text-blue-500" />,
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      id: "riders",
      title: "Rider Analytics",
      description: "Rider performance, ratings, and activity analysis",
      icon: <FaUsers className="text-purple-500" />,
      color: "from-purple-500/20 to-purple-600/20"
    },
    {
      id: "maintenance",
      title: "Maintenance Report",
      description: "Maintenance costs, schedules, and service history",
      icon: <FaWrench className="text-orange-500" />,
      color: "from-orange-500/20 to-orange-600/20"
    }
  ];

  const generateReport = async (templateId) => {
    setGenerating(templateId);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport = {
        _id: `rep_${Date.now()}`,
        title: reportTemplates.find(t => t.id === templateId)?.title || "Custom Report",
        type: templateId,
        description: `Auto-generated ${templateId} report`,
        dateRange: new Date().toLocaleDateString(),
        status: "completed",
        generatedDate: new Date(),
        fileSize: "1.2 MB",
        format: "PDF",
        category: templateId.charAt(0).toUpperCase() + templateId.slice(1)
      };
      
      setReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGenerating(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = reportType === "all" || report.type === reportType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-400/20";
      case "generating": return "text-yellow-400 bg-yellow-400/20";
      case "failed": return "text-red-400 bg-red-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
      case "pdf": return <FaFilePdf className="text-red-400" />;
      case "excel": return <FaFileExcel className="text-green-400" />;
      default: return <FaFileAlt className="text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaFileAlt className="text-purple-500" />
            Reports & Analytics
          </h1>
          <p className="text-gray-400 mt-1">Generate and manage comprehensive business reports</p>
        </div>
      </div>

      {/* Quick Generate Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Generate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${template.color} p-6 rounded-2xl border border-gray-700/50 cursor-pointer hover:border-blue-500/50 transition-all duration-300`}
              onClick={() => generateReport(template.id)}
            >
              <div className="flex items-center gap-3 mb-4">
                {template.icon}
                <h3 className="text-white font-semibold">{template.title}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">{template.description}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={generating === template.id}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating === template.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FaFileExport />
                    Generate
                  </>
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="performance">Performance</option>
            </select>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Generated Reports</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium">Report</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Date Range</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Generated</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Size</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredReports.map((report, index) => (
                  <motion.tr
                    key={report._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getFormatIcon(report.format)}
                        <div>
                          <p className="text-white font-medium">{report.title}</p>
                          <p className="text-gray-400 text-sm">{report.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                        {report.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{report.dateRange}</td>
                    <td className="p-4 text-gray-300">{report.generatedDate.toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{report.fileSize}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {report.status === "completed" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              title="Download"
                            >
                              <FaDownload size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                              title="Print"
                            >
                              <FaPrint size={14} />
                            </motion.button>
                          </>
                        )}
                        {report.status === "generating" && (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FaFileAlt className="text-gray-600 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No reports found</h3>
            <p className="text-gray-500">Generate your first report using the templates above</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
