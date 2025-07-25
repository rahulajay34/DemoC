"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  FaBars,
  FaUserFriends,
  FaBicycle,
  FaClipboardList,
  FaHome,
  FaWrench,
  FaCreditCard,
  FaChartBar,
  FaCog,
  FaFileAlt,
  FaBell,
  FaMapMarkerAlt,
  FaHistory,
  FaExclamationTriangle
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CheetahLogo from "./CheetahLogo";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

export default function Sidebar() {
  const { logout } = useAuth();
  const { theme, getThemeClasses } = useTheme();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [sidebarStats, setSidebarStats] = useState({
    activeRiders: 0,
    availableBikes: 0,
    pendingPayments: 0,
    maintenanceDue: 0,
    loading: true
  });

  // Animation variants for navigation links with enhanced interactions
  const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: [0.43, 0.13, 0.23, 0.96],
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Enhanced hover animations
  const iconHoverVariants = {
    hover: {
      scale: 1.15,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && open) { // md breakpoint is 768px
        setOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Fetch sidebar stats
  useEffect(() => {
    async function fetchSidebarStats() {
      try {
        const [riders, bikes, payments, maintenance] = await Promise.all([
          fetch('/api/riders?status=active&limit=1').then(res => res.json()),
          fetch('/api/bikes?status=available&limit=1').then(res => res.json()),
          fetch('/api/payments?status=pending&limit=1').then(res => res.json()),
          fetch('/api/maintenance?status=scheduled&limit=1').then(res => res.json())
        ]);

        setSidebarStats({
          activeRiders: riders.pagination?.totalItems || 0,
          availableBikes: bikes.pagination?.totalItems || 0,
          pendingPayments: payments.pagination?.totalItems || 0,
          maintenanceDue: maintenance.pagination?.totalItems || 0,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch sidebar stats:', error);
        setSidebarStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchSidebarStats();
  }, []);

  const navLinks = [
    { href: "/", icon: <FaHome size={20} />, label: "Dashboard" },
    { href: "/riders", icon: <FaUserFriends size={20} />, label: "Riders" },
    { href: "/bikes", icon: <FaBicycle size={20} />, label: "Bikes" },
    {
      href: "/assignments",
      icon: <FaClipboardList size={20} />,
      label: "Assignments",
    },
    {
      href: "/maintenance",
      icon: <FaWrench size={20} />,
      label: "Maintenance",
    },
    {
      href: "/payments",
      icon: <FaCreditCard size={20} />,
      label: "Payments",
    },
    {
      href: "/analytics",
      icon: <FaChartBar size={20} />,
      label: "Analytics",
    },
    {
      href: "/tracking",
      icon: <FaMapMarkerAlt size={20} />,
      label: "Tracking",
    },
    {
      href: "/reports",
      icon: <FaFileAlt size={20} />,
      label: "Reports",
    },
    {
      href: "/alerts",
      icon: <FaBell size={20} />,
      label: "Alerts",
    },
    {
      href: "/audit",
      icon: <FaHistory size={20} />,
      label: "Audit Log",
    },
    {
      href: "/settings",
      icon: <FaCog size={20} />,
      label: "Settings",
    },
  ];

  return (
    <>
      {/* Mobile Top Bar - Only visible on mobile */}
      <div className={`md:hidden flex items-center justify-between px-4 py-3 ${theme.colors.sidebarBg} ${theme.colors.textPrimary} shadow-lg border-b ${theme.colors.borderPrimary} w-full`}>
        <button 
          aria-label="Open menu" 
          onClick={() => setOpen(true)} 
          className={`p-2 ${getThemeClasses('hover:bg-slate-100', 'hover:bg-slate-800/50')} rounded-lg transition-colors`}
        >
          <FaBars size={22} />
        </button>
        <CheetahLogo className="w-[118px] h-[30px] text-orange-400" />
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>

      {/* Desktop Sidebar - Only visible on desktop */}
      <nav className={`hidden md:flex w-64 min-h-screen flex-col ${theme.colors.sidebarBg} ${theme.colors.textPrimary} px-4 py-8 shadow-2xl overflow-y-auto border-r ${theme.colors.borderPrimary}`}>
        <div>
          <div className="mb-12 px-2">
            <CheetahLogo className="w-[158px] h-[40px] text-orange-400" />
          </div>
          <motion.div 
            className="flex flex-col gap-2 text-sm font-medium"
            variants={navContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              const isHovered = hoveredLink === link.href;
              return (
                <motion.div
                  key={link.href}
                  variants={navItemVariants}
                  className="relative"
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <Link
                    href={link.href}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `${theme.colors.textPrimary} font-semibold`
                        : `${theme.colors.textSecondary} hover:${theme.colors.textPrimary} ${getThemeClasses('hover:bg-slate-100', 'hover:bg-gray-800/50')}`
                    }`}
                  >
                    {/* ✨ Active sliding indicator ✨ */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 active-glass-link"
                        style={{ borderRadius: "0.75rem" }}
                        transition={{ duration: 0.6, type: "spring" }}
                      />
                    )}
                    
                    {/* ✨ Hover preview pill with improved animation ✨ */}
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, x: -10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8, x: -10 }}
                          className={`absolute inset-0 ${getThemeClasses('bg-slate-100/60', 'bg-gray-800/40')} backdrop-blur-sm border ${getThemeClasses('border-slate-200/60', 'border-gray-700/60')}`}
                          style={{ borderRadius: "0.75rem" }}
                          transition={{ duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <motion.span 
                      className="relative z-10"
                      variants={iconHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {link.icon}
                    </motion.span>
                    <motion.span 
                      className="relative z-10"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        {/* Quick Stats Section */}
        <div className={`mt-8 p-4 ${theme.colors.cardBg} rounded-xl ${theme.colors.borderSecondary} border`}>
          <h3 className={`text-xs font-semibold ${theme.colors.textSecondary} mb-3 uppercase tracking-wider`}>
            Quick Stats
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className={theme.colors.textSecondary}>Active Riders</span>
              <span className="text-green-400 font-semibold">
                {sidebarStats.loading ? '...' : sidebarStats.activeRiders}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme.colors.textSecondary}>Available Bikes</span>
              <span className="text-blue-400 font-semibold">
                {sidebarStats.loading ? '...' : sidebarStats.availableBikes}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme.colors.textSecondary}>Pending Payments</span>
              <span className="text-yellow-400 font-semibold">
                {sidebarStats.loading ? '...' : sidebarStats.pendingPayments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={theme.colors.textSecondary}>Maintenance Due</span>
              <span className="text-red-400 font-semibold">
                {sidebarStats.loading ? '...' : sidebarStats.maintenanceDue}
              </span>
            </div>
          </div>
        </div>
        
        {/* Alert Section */}
        <div className="mt-4 p-3 bg-red-900/8 border border-red-800/15 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FaExclamationTriangle className="text-red-400" size={14} />
            <span className="text-xs font-semibold text-red-400">System Alerts</span>
          </div>
          <p className={`text-xs ${theme.colors.textSecondary}`}>
            No critical alerts at this time
          </p>
        </div>
        
        <button
          onClick={logout}
          className={`mt-auto ${theme.colors.textSecondary} font-semibold hover:${theme.colors.textPrimary} hover:underline w-full text-left pl-4 py-2`}
        >
          Logout
        </button>
      </nav>

      {/* Mobile Sidebar Overlay - Only shown when open on mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Sidebar */}
          <nav className={`fixed inset-y-0 left-0 w-64 ${theme.colors.sidebarBg} ${theme.colors.textPrimary} flex flex-col px-4 py-6 shadow-2xl overflow-y-auto border-r ${theme.colors.borderPrimary}`}>
            <span
              className={`absolute top-3 right-5 cursor-pointer text-2xl ${theme.colors.textSecondary} hover:${theme.colors.textPrimary} transition-colors`}
              onClick={() => setOpen(false)}
            >
              &times;
            </span>
            <div>
              <div className="mb-8 px-2">
                <CheetahLogo className="w-[158px] h-[40px] text-orange-400" />
              </div>
              <div className="flex flex-col gap-1 text-sm font-medium">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 ${
                        isActive
                          ? `${theme.colors.textPrimary} font-semibold`
                          : `${theme.colors.textSecondary} hover:${theme.colors.textPrimary} ${getThemeClasses('hover:bg-slate-100', 'hover:bg-gray-800/50')}`
                      }`}
                    >
                      {/* ✨ This is the animated sliding indicator ✨ */}
                      {isActive && (
                        <motion.div
                          layoutId="active-pill-mobile"
                          className="absolute inset-0 active-glass-link"
                          style={{ borderRadius: "0.75rem" }}
                          transition={{ duration: 0.6, type: "spring" }}
                        />
                      )}
                      <span className="relative z-10">{link.icon}</span>
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Stats Section */}
            <div className={`mt-8 p-4 ${theme.colors.cardBg} rounded-xl ${theme.colors.borderSecondary} border`}>
              <h3 className={`text-xs font-semibold ${theme.colors.textSecondary} mb-3 uppercase tracking-wider`}>
                Quick Stats
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className={theme.colors.textSecondary}>Active Riders</span>
                  <span className="text-green-400 font-semibold">
                    {sidebarStats.loading ? '...' : sidebarStats.activeRiders}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme.colors.textSecondary}>Available Bikes</span>
                  <span className="text-blue-400 font-semibold">
                    {sidebarStats.loading ? '...' : sidebarStats.availableBikes}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme.colors.textSecondary}>Pending Payments</span>
                  <span className="text-yellow-400 font-semibold">
                    {sidebarStats.loading ? '...' : sidebarStats.pendingPayments}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme.colors.textSecondary}>Maintenance Due</span>
                  <span className="text-red-400 font-semibold">
                    {sidebarStats.loading ? '...' : sidebarStats.maintenanceDue}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Alert Section */}
            <div className="mt-4 p-3 bg-red-900/8 border border-red-800/15 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-red-400" size={14} />
                <span className="text-xs font-semibold text-red-400">System Alerts</span>
              </div>
              <p className="text-xs text-gray-300">
                No critical alerts at this time
              </p>
            </div>
            
            <button
              onClick={logout}
              className="mt-auto text-gray-400 font-semibold hover:text-white hover:underline w-full text-left pl-4 py-2"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </>
  );
}