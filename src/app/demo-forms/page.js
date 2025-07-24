// src/app/demo-forms/page.js
"use client";
import { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaRupeeSign, FaMotorcycle, FaCog } from "react-icons/fa";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import FormTextarea from "@/components/FormTextarea";

export default function DemoFormsPage() {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    amount: '',
    bikeType: '',
    description: ''
  });

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    alert('Form submitted successfully! Check console for data.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
            Enhanced Form Components Demo
          </h1>
          <p className="text-gray-300 text-lg">
            Interactive form validation with helpful hints and real-time feedback
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Information Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <FormInput
                  type="text"
                  placeholder="Full Name (e.g., John Doe) *"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  {...getFieldRules('name')}
                  icon={<FaUser />}
                />

                <FormInput
                  type="email"
                  placeholder="Email Address (e.g., john@example.com) *"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  {...getFieldRules('email')}
                  icon={<FaEnvelope />}
                />

                <FormInput
                  type="tel"
                  placeholder="Phone Number (e.g., 9876543210) *"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  {...getFieldRules('phone')}
                  icon={<FaPhone />}
                />

                <FormInput
                  type="text"
                  placeholder="City (e.g., New Delhi)"
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  {...getFieldRules('city')}
                  icon={<FaMapMarkerAlt />}
                />

              </div>
            </div>

            {/* Financial Information Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Financial Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <FormInput
                  type="number"
                  placeholder="Amount in ₹ (e.g., 3000.50) *"
                  value={formData.amount}
                  onChange={handleInputChange('amount')}
                  {...getFieldRules('amount')}
                  icon={<FaRupeeSign />}
                />

                <FormSelect
                  value={formData.bikeType}
                  onChange={handleInputChange('bikeType')}
                  placeholder="Select Bike Type"
                  options={[
                    { value: 'scooter', label: 'Scooter' },
                    { value: 'motorcycle', label: 'Motorcycle' },
                    { value: 'electric', label: 'Electric Bike' },
                    { value: 'sports', label: 'Sports Bike' }
                  ]}
                  hint="Choose your preferred bike type"
                  icon={<FaMotorcycle />}
                  required
                />

              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Additional Information</h2>
              
              <FormTextarea
                placeholder="Description or comments (optional)"
                value={formData.description}
                onChange={handleInputChange('description')}
                maxLength={500}
                hint="Provide any additional information or special requirements"
                rows={4}
                showCharCount={true}
              />
            </div>

            {/* Feature Highlights */}
            <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-400/30">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">✨ Enhanced Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-300 mb-2">Real-time Validation</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Pattern-based input validation</li>
                    <li>• Visual feedback with ✓ and ✗ indicators</li>
                    <li>• Border color changes on validation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-300 mb-2">User Guidance</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Helpful hints with examples</li>
                    <li>• Character count for text areas</li>
                    <li>• Icon-enhanced inputs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-300 mb-2">Error Handling</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Clear error messages</li>
                    <li>• Field-specific validation rules</li>
                    <li>• Required field indicators</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-300 mb-2">Enhanced UX</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Smooth transitions and animations</li>
                    <li>• Consistent design system</li>
                    <li>• Mobile-responsive layout</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 
                         text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform transition-all duration-200 
                         hover:scale-105 hover:shadow-xl"
              >
                Submit Demo Form
              </button>
            </div>

          </form>

          {/* Instructions */}
          <div className="mt-8 bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
            <h4 className="font-semibold text-gray-300 mb-2">🎯 Try It Out:</h4>
            <p className="text-gray-400 text-sm">
              Start typing in the fields above to see the enhanced validation in action. 
              Try entering invalid formats to see error messages, or valid data to see success indicators.
            </p>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-8 bg-black/20 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">Implementation Guide</h2>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-medium text-green-300 mb-2">1. Enhanced Input Components</h3>
              <p className="text-sm">
                Use <code className="bg-gray-800 px-2 py-1 rounded text-green-400">FormInput</code>, 
                <code className="bg-gray-800 px-2 py-1 rounded text-green-400 ml-1">FormSelect</code>, and 
                <code className="bg-gray-800 px-2 py-1 rounded text-green-400 ml-1">FormTextarea</code> 
                components for consistent validation and styling.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-green-300 mb-2">2. Validation Rules</h3>
              <p className="text-sm">
                Import <code className="bg-gray-800 px-2 py-1 rounded text-green-400">getFieldRules</code> 
                from the validation utils to apply consistent rules across your application.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-green-300 mb-2">3. Customization</h3>
              <p className="text-sm">
                All components support custom hints, icons, validation patterns, and styling to match your needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
