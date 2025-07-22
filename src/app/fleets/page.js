"use client";
import { useState, useEffect } from "react";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FormModal } from "../../components/FormModal"; // Corrected: Use named import
import { useToast } from "../../context/ToastContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function FleetsPage() {
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

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
          fleet.bikesByMake.forEach(make => {
            if (makeCounts[make._id]) {
              makeCounts[make._id] += make.count;
            } else {
              makeCounts[make._id] = make.count;
            }
          });
        });

        setChartData({
          pie: { labels: locationLabels, datasets: [{ data: bikeCounts, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }] },
          bar: { labels: Object.keys(makeCounts), datasets: [{ label: 'Bikes by Make', data: Object.values(makeCounts), backgroundColor: '#FFCE56' }] }
        });
      })
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
        showToast("Fleet added successfully!", "success");
        fetchFleets(); // Refresh data
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add fleet');
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsModalOpen(false);
    }
  };

  const fleetFormFields = [
    { name: 'name', label: 'Fleet Name', type: 'text', placeholder: 'e.g., Delhi' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g., Delhi, India' },
  ];

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bikes");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Fleets Dashboard</h2>
          <button onClick={handleAddFleet} className="cheetah-gradient-btn">
            Add Fleet
          </button>
        </div>
        {loading ? <p>Loading...</p> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Bikes by Location</h3>
                {chartData && chartData.pie.labels.length > 0 ? <Pie data={chartData.pie} /> : <p>No data to display.</p>}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Bikes by Make</h3>
                {chartData && chartData.bar.labels.length > 0 ? <Bar data={chartData.bar} /> : <p>No data to display.</p>}
              </div>
            </div>
            <div className="mt-8">
              <button onClick={() => exportToExcel(fleets.flatMap(f => f.allottedBikes), 'allotted-bikes.xlsx')} className="cheetah-gradient-btn">
                Download Allotted Bikes
              </button>
              <button onClick={() => exportToExcel(fleets.flatMap(f => f.unallottedBikes), 'unallotted-bikes.xlsx')} className="cheetah-gradient-btn ml-4">
                Download Unallotted Bikes
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}