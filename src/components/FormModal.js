"use client";
import { useState, useEffect } from "react";

export const FormModal = ({ isOpen, onClose, onSubmit, fields, title, initialData }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initial = fields.reduce((acc, field) => {
      acc[field.name] = initialData?.[field.name] || '';
      return acc;
    }, {});
    setFormData(initial);
  }, [isOpen, initialData, fields]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900/80 backdrop-blur-sm border border-white/20 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-white/80 mb-1" htmlFor={field.name}>
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="" disabled>Select {field.label}</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
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
  );
};