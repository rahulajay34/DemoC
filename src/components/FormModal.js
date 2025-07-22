"use client";
import { useState, useEffect } from 'react';

export function FormModal({ isOpen, onClose, onSubmit, fields, title, initialData }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initial = fields.reduce((acc, field) => {
        acc[field.name] = (initialData && initialData[field.name]) || "";
        return acc;
      }, {});
      setFormData(initial);
    }
  }, [isOpen, fields, initialData]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    // Backdrop overlay
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center transition-opacity duration-300 z-50"
      onClick={onClose}
    >
      {/* Modal container */}
      <div 
        className="glass-card bg-gray-900/80 backdrop-blur-sm border border-white/20 p-8 rounded-2xl shadow-lg w-full max-w-md animate-fade-in-up" 
        onClick={e => e.stopPropagation()}
      >
        {/* ✨ FIX: This wrapper lifts the form content above the 'glass-card' pseudo-elements, making it interactive. ✨ */}
        <div className="card-content">
          <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-white/80 mb-1" htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required={field.required}
                />
              </div>
            ))}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cheetah-gradient-btn"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};