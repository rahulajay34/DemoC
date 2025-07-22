"use client";
import { useState, useEffect } from "react";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FormModal } from "@/components/FormModal";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/SkeletonTable";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ✨ FIX: Define the form fields array outside the component to prevent re-creation on every render.
const fleetFormFields = [
  { name: 'name', label: 'Fleet Name', type: 'text', placeholder: 'e.g., Delhi', required: true },
  { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Delhi, India', required: true },
];

export default function FleetsPage() {
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchFleets = () => {
    setLoading(true);
    fetch("/api/fleets")
      .then((res) => res.json())
      .then((data) => {
        setFleets(data);
        const locationLabels = data.map(f => f.name);
        const bikeCounts = data.map(f => f.bikeCount);
        const makeCounts = {};
        data.forEach(fleet => {
          if (fleet.bikesByMake) {
            fleet.bikesByMake.forEach(make => {
              if (makeCounts[make._id]) {
                makeCounts[make._id] += make.count;
              } else {
                makeCounts[make._id] = make.count;
              }
            });
          }
        });

        setChartData({
          pie: { labels: locationLabels, datasets: [{ data: bikeCounts, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }] },
          bar: { labels: Object.keys(makeCounts), datasets: [{ label: 'Bikes by Make', data: Object.values(makeCounts), backgroundColor: '#FFCE56' }] }
        });
      })
      .catch((error) => toast.error(`Failed to load fleet data: ${error.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFleets();
  }, []);

  const handleAddFleet = () => setIsModalOpen(true);

  const handleFleetSubmit = async (formData) => {
    try {
      const res = await fetch('/api/fleets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Fleet added successfully!");
        fetchFleets();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add fleet');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsModalOpen(false);
    }
  };
  
  const exportToExcel = (bikesData, fileName) => {
    if (!bikesData || bikesData.length === 0) {
      toast.info("No data available to download.");
      return;
    }
    const formattedData = bikesData.map(bike => ({
      'Bike Number': bike.number,
      'Make': bike.make,
      'Model': bike.model,
      'Status': bike.status,
      'Condition': bike.condition,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bikes");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  const handleDownloadAllotted = () => {
    const allottedBikes = fleets.flatMap(f => f.allottedBikes || []);
    exportToExcel(allottedBikes, 'allotted-bikes.xlsx');
  };

  const handleDownloadUnallotted = () => {
    const unallottedBikes = fleets.flatMap(f => f.unallottedBikes || []);
    exportToExcel(unallottedBikes, 'unallotted-bikes.xlsx');
  };

  return (
    <>
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFleetSubmit}
        fields={fleetFormFields}
        title="Add New Fleet"
      />
      <section className="animate-fade-in glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Fleets Dashboard</h2>
          <button onClick={handleAddFleet} className="cheetah-gradient-btn">
            Add Fleet
          </button>
        </div>
        {loading ? <SkeletonTable columns={2} rows={2} /> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Bikes by Location</h3>
                {chartData && chartData.pie.labels.length > 0 ? <Pie data={chartData.pie} /> : <p className="text-center text-white/50 h-64 flex items-center justify-center">No data to display.</p>}
              </div>
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Bikes by Make</h3>
                {chartData && chartData.bar.labels.length > 0 ? <Bar data={chartData.bar} /> : <p className="text-center text-white/50 h-64 flex items-center justify-center">No data to display.</p>}
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={handleDownloadAllotted} className="cheetah-gradient-btn">
                Download Allotted Bikes
              </button>
              <button onClick={handleDownloadUnallotted} className="cheetah-gradient-btn">
                Download Unallotted Bikes
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}