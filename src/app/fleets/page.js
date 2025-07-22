"use client";
import { useState, useEffect } from "react";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function FleetsPage() {
  const [fleets, setFleets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch fleet data from the API

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bikes");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  return (
    <section className="animate-fade-in glass-card p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-4">Fleets Dashboard</h2>
      {/* Add charts and tables here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Bikes by Location</h3>
          {/* <Pie data={...} /> */}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Bikes by Make</h3>
          {/* <Bar data={...} /> */}
        </div>
      </div>
      <div className="mt-8">
        <button onClick={() => exportToExcel([], 'allotted-bikes.xlsx')} className="cheetah-gradient-btn">
          Download Allotted Bikes
        </button>
        <button onClick={() => exportToExcel([], 'unallotted-bikes.xlsx')} className="cheetah-gradient-btn ml-4">
          Download Unallotted Bikes
        </button>
      </div>
    </section>
  );
}