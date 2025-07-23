"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCog,
  FaUser,
  FaBell,
  FaShieldAlt,
  FaDatabase,
  FaPalette,
  FaLanguage,
  FaEnvelope,
  FaKey,
  FaCloud,
  FaDownload,
  FaUpload,
  FaSave,
  FaCheck,
  FaTimes
} from "react-icons/fa";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    general: {
      companyName: "CheetahRide",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      currency: "INR",
      language: "en"
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      maintenanceAlerts: true,
      paymentReminders: true,
      overdueAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      requirePasswordChange: true
    },
    system: {
      backupFrequency: "daily",
      dataRetention: 365,
      logLevel: "info",
      maintenanceMode: false,
      autoUpdates: true
    },
    appearance: {
      theme: "dark",
      accentColor: "#3B82F6",
      compactMode: false,
      showAnimations: true,
      sidebarCollapsed: false
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: <FaCog className="text-blue-500" />,
      color: "from-blue-500/20 to-blue-600/20"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <FaBell className="text-yellow-500" />,
      color: "from-yellow-500/20 to-yellow-600/20"
    },
    {
      id: "security",
      label: "Security",
      icon: <FaShieldAlt className="text-green-500" />,
      color: "from-green-500/20 to-green-600/20"
    },
    {
      id: "system",
      label: "System",
      icon: <FaDatabase className="text-purple-500" />,
      color: "from-purple-500/20 to-purple-600/20"
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <FaPalette className="text-pink-500" />,
      color: "from-pink-500/20 to-pink-600/20"
    }
  ];

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Company Name</label>
          <input
            type="text"
            value={settings.general.companyName}
            onChange={(e) => updateSetting("general", "companyName", e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-white font-medium mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => updateSetting("general", "timezone", e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>
        <div>
          <label className="block text-white font-medium mb-2">Date Format</label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => updateSetting("general", "dateFormat", e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-white font-medium mb-2">Currency</label>
          <select
            value={settings.general.currency}
            onChange={(e) => updateSetting("general", "currency", e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <h4 className="text-white font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-gray-400 text-sm">
                {key === "emailNotifications" && "Receive email notifications"}
                {key === "smsNotifications" && "Receive SMS notifications"}
                {key === "pushNotifications" && "Receive push notifications"}
                {key === "maintenanceAlerts" && "Maintenance due alerts"}
                {key === "paymentReminders" && "Payment reminder notifications"}
                {key === "overdueAlerts" && "Overdue payment alerts"}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => updateSetting("notifications", key, !value)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                value ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <motion.div
                animate={{ x: value ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
              />
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Two-Factor Authentication</h4>
            <p className="text-gray-400 text-sm">Enable 2FA for enhanced security</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => updateSetting("security", "twoFactorAuth", !settings.security.twoFactorAuth)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              settings.security.twoFactorAuth ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <motion.div
              animate={{ x: settings.security.twoFactorAuth ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
            />
          </motion.button>
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSetting("security", "sessionTimeout", parseInt(e.target.value))}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Password Expiry (days)</label>
          <input
            type="number"
            value={settings.security.passwordExpiry}
            onChange={(e) => updateSetting("security", "passwordExpiry", parseInt(e.target.value))}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => updateSetting("security", "maxLoginAttempts", parseInt(e.target.value))}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Backup Frequency</label>
          <select
            value={settings.system.backupFrequency}
            onChange={(e) => updateSetting("system", "backupFrequency", e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Data Retention (days)</label>
          <input
            type="number"
            value={settings.system.dataRetention}
            onChange={(e) => updateSetting("system", "dataRetention", parseInt(e.target.value))}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Maintenance Mode</h4>
            <p className="text-gray-400 text-sm">Enable system maintenance mode</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => updateSetting("system", "maintenanceMode", !settings.system.maintenanceMode)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              settings.system.maintenanceMode ? "bg-red-500" : "bg-gray-600"
            }`}
          >
            <motion.div
              animate={{ x: settings.system.maintenanceMode ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
            />
          </motion.button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Auto Updates</h4>
            <p className="text-gray-400 text-sm">Automatically install system updates</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => updateSetting("system", "autoUpdates", !settings.system.autoUpdates)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              settings.system.autoUpdates ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <motion.div
              animate={{ x: settings.system.autoUpdates ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
            />
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-medium mb-2">Theme</label>
          <select
            value={settings.appearance.theme}
            onChange={(e) => updateSetting("appearance", "theme", e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">Accent Color</label>
          <input
            type="color"
            value={settings.appearance.accentColor}
            onChange={(e) => updateSetting("appearance", "accentColor", e.target.value)}
            className="w-full h-12 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Compact Mode</h4>
            <p className="text-gray-400 text-sm">Use compact interface layout</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => updateSetting("appearance", "compactMode", !settings.appearance.compactMode)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              settings.appearance.compactMode ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <motion.div
              animate={{ x: settings.appearance.compactMode ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
            />
          </motion.button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Animations</h4>
            <p className="text-gray-400 text-sm">Enable interface animations</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => updateSetting("appearance", "showAnimations", !settings.appearance.showAnimations)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              settings.appearance.showAnimations ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <motion.div
              animate={{ x: settings.appearance.showAnimations ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
            />
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaCog className="text-blue-500" />
            Settings & Configuration
          </h1>
          <p className="text-gray-400 mt-1">Manage system settings and preferences</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : saved ? (
              <>
                <FaCheck /> Saved!
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-br ${tab.color} border-blue-500/50`
                    : "bg-gray-900/50 border-gray-700/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span className="text-white font-medium">{tab.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-8 rounded-2xl border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold text-white mb-6 capitalize">
              {tabs.find(tab => tab.id === activeTab)?.label} Settings
            </h2>
            
            {activeTab === "general" && renderGeneralSettings()}
            {activeTab === "notifications" && renderNotificationSettings()}
            {activeTab === "security" && renderSecuritySettings()}
            {activeTab === "system" && renderSystemSettings()}
            {activeTab === "appearance" && renderAppearanceSettings()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
