"use client";

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiSettings, FiUser, FiTruck, FiDollarSign, FiActivity, FiCheck, FiX, FiInfo, FiAlertTriangle } from 'react-icons/fi';

export default function DemoUIPage() {
  const { currentTheme, changeTheme, getStatusColor, getCardStyles, getButtonStyles } = useTheme();
  const [selectedDemo, setSelectedDemo] = useState('cards');

  const demoSections = [
    { id: 'cards', label: 'Cards', icon: FiSettings },
    { id: 'buttons', label: 'Buttons', icon: FiUser },
    { id: 'forms', label: 'Forms', icon: FiTruck },
    { id: 'status', label: 'Status', icon: FiActivity },
    { id: 'themes', label: 'Themes', icon: FiSun }
  ];

  const statusTypes = [
    { status: 'success', label: 'Success', icon: FiCheck },
    { status: 'warning', label: 'Warning', icon: FiAlertTriangle },
    { status: 'error', label: 'Error', icon: FiX },
    { status: 'info', label: 'Info', icon: FiInfo }
  ];

  const themes = ['dark', 'light', 'blue', 'purple', 'green'];

  const renderCardsDemo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Basic Card */}
      <motion.div
        className={`${getCardStyles()} p-6`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <FiUser className="text-2xl text-blue-500 mr-3" />
          <h3 className="text-lg font-semibold">Basic Card</h3>
        </div>
        <p className="text-gray-400 mb-4">This is a basic card component with standard styling.</p>
        <div className="text-sm text-gray-500">
          Last updated: 2 hours ago
        </div>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        className={`${getCardStyles()} p-6`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiDollarSign className="text-2xl text-green-500 mr-3" />
            <h3 className="text-lg font-semibold">Revenue</h3>
          </div>
          <span className="text-sm text-green-500 bg-green-500/10 px-2 py-1 rounded">+12%</span>
        </div>
        <div className="text-3xl font-bold mb-2">₹1,24,500</div>
        <p className="text-gray-400 text-sm">Total revenue this month</p>
      </motion.div>

      {/* Interactive Card */}
      <motion.div
        className={`${getCardStyles()} p-6 cursor-pointer hover:scale-105 transition-transform`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center mb-4">
          <FiTruck className="text-2xl text-purple-500 mr-3" />
          <h3 className="text-lg font-semibold">Interactive Card</h3>
        </div>
        <p className="text-gray-400 mb-4">This card has hover effects and animations.</p>
        <button className={`${getButtonStyles('primary')} w-full`}>
          View Details
        </button>
      </motion.div>
    </div>
  );

  const renderButtonsDemo = () => (
    <div className="space-y-8">
      {/* Primary Buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Primary Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className={getButtonStyles('primary')}>Primary Button</button>
          <button className={`${getButtonStyles('primary')} opacity-50 cursor-not-allowed`} disabled>
            Disabled
          </button>
          <button className={`${getButtonStyles('primary')} px-8`}>Wide Button</button>
        </div>
      </div>

      {/* Secondary Buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Secondary Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className={getButtonStyles('secondary')}>Secondary Button</button>
          <button className={`${getButtonStyles('secondary')} opacity-50 cursor-not-allowed`} disabled>
            Disabled
          </button>
          <button className={`${getButtonStyles('secondary')} px-8`}>Wide Button</button>
        </div>
      </div>

      {/* Icon Buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Icon Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className={`${getButtonStyles('primary')} flex items-center gap-2`}>
            <FiUser />
            With Icon
          </button>
          <button className={`${getButtonStyles('secondary')} flex items-center gap-2`}>
            <FiSettings />
            Settings
          </button>
          <button className={`${getButtonStyles('primary')} p-3`}>
            <FiTruck />
          </button>
        </div>
      </div>
    </div>
  );

  const renderFormsDemo = () => (
    <div className="max-w-md space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Input Field</label>
        <input
          type="text"
          placeholder="Enter your name"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Select Dropdown</label>
        <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Choose an option</option>
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Textarea</label>
        <textarea
          rows={4}
          placeholder="Enter your message"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="demo-checkbox"
          className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="demo-checkbox" className="text-sm">
          I agree to the terms and conditions
        </label>
      </div>

      <button className={`${getButtonStyles('primary')} w-full`}>
        Submit Form
      </button>
    </div>
  );

  const renderStatusDemo = () => (
    <div className="space-y-6">
      {statusTypes.map(({ status, label, icon: Icon }) => (
        <motion.div
          key={status}
          className={`${getCardStyles()} p-4 border-l-4`}
          style={{ borderLeftColor: getStatusColor(status) }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <Icon className="text-xl mr-3" style={{ color: getStatusColor(status) }} />
            <div>
              <h3 className="font-semibold">{label} Status</h3>
              <p className="text-gray-400 text-sm">
                This is a {status} status indicator with appropriate styling.
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderThemesDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {themes.map((theme) => (
          <motion.button
            key={theme}
            onClick={() => changeTheme(theme)}
            className={`p-4 rounded-lg border-2 transition-all ${
              currentTheme === theme
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center justify-center mb-2">
              {theme === 'light' ? (
                <FiSun className="text-2xl text-yellow-500" />
              ) : (
                <FiMoon className="text-2xl text-blue-500" />
              )}
            </div>
            <span className="capitalize text-sm font-medium">{theme}</span>
          </motion.button>
        ))}
      </div>

      <div className={`${getCardStyles()} p-6`}>
        <h3 className="text-lg font-semibold mb-4">Current Theme: {currentTheme}</h3>
        <p className="text-gray-400">
          The current theme is <span className="capitalize font-medium">{currentTheme}</span>. 
          You can switch between different themes to see how the UI adapts.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedDemo) {
      case 'cards':
        return renderCardsDemo();
      case 'buttons':
        return renderButtonsDemo();
      case 'forms':
        return renderFormsDemo();
      case 'status':
        return renderStatusDemo();
      case 'themes':
        return renderThemesDemo();
      default:
        return renderCardsDemo();
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">UI Components Demo</h1>
          <p className="text-gray-400">
            Explore and test various UI components with different themes and states.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64"
          >
            <div className={`${getCardStyles()} p-4`}>
              <h2 className="font-semibold mb-4">Components</h2>
              <nav className="space-y-2">
                {demoSections.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedDemo(id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      selectedDemo === id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'hover:bg-gray-800/50 text-gray-300'
                    }`}
                  >
                    <Icon className="mr-3" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={selectedDemo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <div className={`${getCardStyles()} p-6`}>
              <h2 className="text-2xl font-semibold mb-6 capitalize">
                {selectedDemo} Demo
              </h2>
              {renderContent()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
