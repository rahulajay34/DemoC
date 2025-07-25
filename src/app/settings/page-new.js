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
  FaTimes,
  FaEdit,
  FaLock,
  FaGlobe,
  FaChartBar,
  FaBicycle
} from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const { getThemeClasses } = useTheme();
  
  const getActiveTabStyles = (isActive) => {
    if (isActive) {
      return getThemeClasses(
        'bg-orange-200/80 text-black border border-orange-300',
        'bg-orange-500/20 text-orange-300 border border-orange-500/30'
      );
    }
    return getThemeClasses(
      'text-gray-700 hover:bg-gray-100/50',
      'text-gray-300 hover:bg-white/5'
    );
  };

  const [settings, setSettings] = useState({
    general: {
      companyName: "CheetahRide",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      currency: "INR",
      language: "en",
      theme: "dark"
    },
    fleet: {
      defaultRentalDuration: 30,
      securityDepositAmount: 5000,
      latePaymentFee: 100,
      maintenanceInterval: 30,
      autoAssignment: true,
      allowMultipleBookings: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      maintenanceAlerts: true,
      paymentReminders: true,
      overdueAlerts: true,
      systemUpdates: true,
      marketingEmails: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      requirePasswordChange: true,
      ipWhitelist: "",
      encryptData: true
    },
    system: {
      backupFrequency: "daily",
      dataRetention: 365,
      logLevel: "info",
      maintenanceMode: false,
      debugMode: false,
      apiRateLimit: 1000,
      maxFileSize: 10
    },
    integrations: {
      googleMaps: true,
      smsGateway: "twilio",
      paymentGateway: "razorpay",
      emailService: "sendgrid",
      analyticsTracking: true,
      cloudStorage: "aws"
    }
  });

  const { toast } = useToast();

  const tabs = [
    { id: "general", label: "General", icon: <FaCog /> },
    { id: "fleet", label: "Fleet Management", icon: <FaBicycle /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "security", label: "Security", icon: <FaShieldAlt /> },
    { id: "system", label: "System", icon: <FaDatabase /> },
    { id: "integrations", label: "Integrations", icon: <FaCloud /> }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would be:
      // const response = await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      toast.success("⚙️ Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("❌ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cheetahride-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("📁 Settings exported successfully!");
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        setSettings(importedSettings);
        toast.success("📤 Settings imported successfully!");
      } catch (error) {
        toast.error("❌ Invalid settings file");
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
      // Reset to default values
      setSettings({
        general: {
          companyName: "CheetahRide",
          timezone: "Asia/Kolkata",
          dateFormat: "DD/MM/YYYY",
          currency: "INR",
          language: "en",
          theme: "dark"
        },
        fleet: {
          defaultRentalDuration: 30,
          securityDepositAmount: 5000,
          latePaymentFee: 100,
          maintenanceInterval: 30,
          autoAssignment: true,
          allowMultipleBookings: false
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
          maintenanceAlerts: true,
          paymentReminders: true,
          overdueAlerts: true,
          systemUpdates: true,
          marketingEmails: false
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 60,
          passwordExpiry: 90,
          maxLoginAttempts: 5,
          requirePasswordChange: true,
          ipWhitelist: "",
          encryptData: true
        },
        system: {
          backupFrequency: "daily",
          dataRetention: 365,
          logLevel: "info",
          maintenanceMode: false,
          debugMode: false,
          apiRateLimit: 1000,
          maxFileSize: 10
        },
        integrations: {
          googleMaps: true,
          smsGateway: "twilio",
          paymentGateway: "razorpay",
          emailService: "sendgrid",
          analyticsTracking: true,
          cloudStorage: "aws"
        }
      });
      toast.success("🔄 Settings reset to defaults");
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
          <input
            type="text"
            value={settings.general.companyName}
            onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
          <select
            value={settings.general.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
          <select
            value={settings.general.theme}
            onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderFleetSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Default Rental Duration (days)</label>
          <input
            type="number"
            min="1"
            value={settings.fleet.defaultRentalDuration}
            onChange={(e) => handleSettingChange('fleet', 'defaultRentalDuration', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Security Deposit Amount (₹)</label>
          <input
            type="number"
            min="0"
            value={settings.fleet.securityDepositAmount}
            onChange={(e) => handleSettingChange('fleet', 'securityDepositAmount', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Late Payment Fee (₹)</label>
          <input
            type="number"
            min="0"
            value={settings.fleet.latePaymentFee}
            onChange={(e) => handleSettingChange('fleet', 'latePaymentFee', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Maintenance Interval (days)</label>
          <input
            type="number"
            min="1"
            value={settings.fleet.maintenanceInterval}
            onChange={(e) => handleSettingChange('fleet', 'maintenanceInterval', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.fleet.autoAssignment}
            onChange={(e) => handleSettingChange('fleet', 'autoAssignment', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Enable Auto Assignment</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.fleet.allowMultipleBookings}
            onChange={(e) => handleSettingChange('fleet', 'allowMultipleBookings', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Allow Multiple Bookings per Rider</span>
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between">
            <span className="text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
              className="rounded"
            />
          </label>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            min="5"
            max="1440"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password Expiry (days)</label>
          <input
            type="number"
            min="30"
            max="365"
            value={settings.security.passwordExpiry}
            onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Login Attempts</label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">IP Whitelist (comma separated)</label>
          <input
            type="text"
            placeholder="192.168.1.1, 10.0.0.1"
            value={settings.security.ipWhitelist}
            onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.security.twoFactorAuth}
            onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Enable Two-Factor Authentication</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.security.requirePasswordChange}
            onChange={(e) => handleSettingChange('security', 'requirePasswordChange', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Require Password Change on First Login</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.security.encryptData}
            onChange={(e) => handleSettingChange('security', 'encryptData', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Encrypt Sensitive Data</span>
        </label>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Backup Frequency</label>
          <select
            value={settings.system.backupFrequency}
            onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Data Retention (days)</label>
          <input
            type="number"
            min="30"
            value={settings.system.dataRetention}
            onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Log Level</label>
          <select
            value={settings.system.logLevel}
            onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">API Rate Limit (per hour)</label>
          <input
            type="number"
            min="100"
            value={settings.system.apiRateLimit}
            onChange={(e) => handleSettingChange('system', 'apiRateLimit', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max File Size (MB)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={settings.system.maxFileSize}
            onChange={(e) => handleSettingChange('system', 'maxFileSize', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.system.maintenanceMode}
            onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Maintenance Mode</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.system.debugMode}
            onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Debug Mode</span>
        </label>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">SMS Gateway</label>
          <select
            value={settings.integrations.smsGateway}
            onChange={(e) => handleSettingChange('integrations', 'smsGateway', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="twilio">Twilio</option>
            <option value="textlocal">TextLocal</option>
            <option value="msg91">MSG91</option>
            <option value="aws-sns">AWS SNS</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Payment Gateway</label>
          <select
            value={settings.integrations.paymentGateway}
            onChange={(e) => handleSettingChange('integrations', 'paymentGateway', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="razorpay">Razorpay</option>
            <option value="stripe">Stripe</option>
            <option value="payu">PayU</option>
            <option value="ccavenue">CCAvenue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email Service</label>
          <select
            value={settings.integrations.emailService}
            onChange={(e) => handleSettingChange('integrations', 'emailService', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="sendgrid">SendGrid</option>
            <option value="mailgun">Mailgun</option>
            <option value="ses">AWS SES</option>
            <option value="smtp">Custom SMTP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Cloud Storage</label>
          <select
            value={settings.integrations.cloudStorage}
            onChange={(e) => handleSettingChange('integrations', 'cloudStorage', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white"
          >
            <option value="aws">AWS S3</option>
            <option value="gcp">Google Cloud</option>
            <option value="azure">Azure Blob</option>
            <option value="cloudinary">Cloudinary</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.integrations.googleMaps}
            onChange={(e) => handleSettingChange('integrations', 'googleMaps', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Google Maps Integration</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.integrations.analyticsTracking}
            onChange={(e) => handleSettingChange('integrations', 'analyticsTracking', e.target.checked)}
            className="rounded"
          />
          <span className="text-white">Analytics Tracking</span>
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general": return renderGeneralSettings();
      case "fleet": return renderFleetSettings();
      case "notifications": return renderNotificationSettings();
      case "security": return renderSecuritySettings();
      case "system": return renderSystemSettings();
      case "integrations": return renderIntegrationsSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FaCog className="mr-3 text-gray-400" />
            Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure your CheetahRide system preferences</p>
        </div>

        <div className="flex gap-4">
          <input
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
            id="import-settings"
          />
          <label
            htmlFor="import-settings"
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium cursor-pointer flex items-center"
          >
            <FaUpload className="mr-2" size={14} />
            Import
          </label>
          
          <button
            onClick={handleExportSettings}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium flex items-center"
          >
            <FaDownload className="mr-2" size={14} />
            Export
          </button>

          <button
            onClick={resetToDefaults}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${getActiveTabStyles(
                  activeTab === tab.id
                )}`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 rounded-2xl border border-gray-700/50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white capitalize">{activeTab} Settings</h2>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="cheetah-gradient-btn px-6 py-2 font-semibold flex items-center"
              >
                {saving ? (
                  <>
                    <FaCog className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
