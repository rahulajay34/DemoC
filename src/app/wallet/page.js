"use client";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FormModal } from "../../components/FormModal"; // Corrected: Use named import
import { useToast } from "../../context/ToastContext";

export default function WalletPage() {
  const [transactions, setTransactions] = useState([]);
  const [riders, setRiders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchTransactions = () => {
    fetch('/api/wallet')
      .then(res => res.json())
      .then(data => setTransactions(data));
  };

  const fetchRiders = () => {
    fetch('/api/riders')
      .then(res => res.json())
      .then(data => setRiders(data));
  };

  useEffect(() => {
    fetchTransactions();
    fetchRiders();
  }, []);

  const handleAddTransaction = () => setIsModalOpen(true);

  const handleTransactionSubmit = async (formData) => {
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        showToast("Transaction added successfully!", "success");
        fetchTransactions(); // Refresh the list
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add transaction');
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsModalOpen(false);
    }
  };
  
  const transactionFormFields = [
    { name: 'rider', label: 'Rider', type: 'select', options: riders.map(r => ({ value: r._id, label: r.name })) },
    { name: 'type', label: 'Transaction Type', type: 'select', options: [
      { value: 'monthly_charge', label: 'Monthly Charge' },
      { value: 'security_deposit', label: 'Security Deposit' },
      { value: 'extra_charge', label: 'Extra Charge' },
      { value: 'refund', label: 'Refund' },
    ]},
    { name: 'amount', label: 'Amount', type: 'number', placeholder: 'e.g., 500' },
    { name: 'description', label: 'Description', type: 'text', placeholder: 'Describe the transaction' },
  ];

  const filteredTransactions = transactions.filter(t =>
    t.rider?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTransactions.map(t => ({
      Rider: t.rider?.name,
      Type: t.type,
      Amount: t.amount,
      Description: t.description,
      Date: new Date(t.date).toLocaleDateString(),
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wallet");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'wallet-reports.xlsx');
  };

  return (
    <>
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        fields={transactionFormFields}
        title="Add New Transaction"
      />
      <section className="animate-fade-in glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Wallet Reports</h2>
          <button onClick={handleAddTransaction} className="cheetah-gradient-btn">
            Add Transaction
          </button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search by rider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 bg-white/10 border border-white/20 rounded-full px-4 py-2"
          />
          <button onClick={exportToExcel} className="cheetah-gradient-btn">
            Download Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-base">
            <thead className="border-b border-white/20">
              <tr>
                <th className="px-4 py-3 text-left">Rider</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t._id} className="border-b border-white/10">
                  <td className="px-4 py-3">{t.rider?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{t.type}</td>
                  <td className="px-4 py-3">₹{t.amount}</td>
                  <td className="px-4 py-3">{t.description}</td>
                  <td className="px-4 py-3">{new Date(t.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}