"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
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
import { useState } from "react";
import { usePathname } from "next/navigation";
import CheetahLogo from "./CheetahLogo";
import { motion } from "framer-motion"; // Import framer-motion

export default function Sidebar() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
      {/* ... (mobile top bar is unchanged) ... */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-950 text-white shadow-lg">
        <button aria-label="Open menu" onClick={() => setOpen(true)}>
          <FaBars size={26} />
        </button>
        <CheetahLogo className="w-[118px] h-[30px] text-orange-400" />
      </div>

      {/* Main Sidebar */}
      <nav
        className={`fixed inset-y-0 left-0 w-64 bg-gray-950 text-white z-50 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:relative md:translate-x-0 md:w-64 md:min-h-screen flex flex-col px-4 py-8 shadow-2xl overflow-y-auto`}
      >
        <span
          className="md:hidden absolute top-3 right-5 cursor-pointer text-2xl text-gray-400"
          onClick={() => setOpen(false)}
        >
          &times;
        </span>
        <div>
          <div className="mb-12 hidden md:block px-2">
            <CheetahLogo className="w-[158px] h-[40px] text-orange-400" />
          </div>
          <div className="flex flex-col gap-2 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {/* ✨ This is the animated sliding indicator ✨ */}
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
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
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">
            Quick Stats
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Active Riders</span>
              <span className="text-green-400 font-semibold">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Available Bikes</span>
              <span className="text-blue-400 font-semibold">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Pending Payments</span>
              <span className="text-yellow-400 font-semibold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Maintenance Due</span>
              <span className="text-red-400 font-semibold">4</span>
            </div>
          </div>
        </div>
        
        {/* Alert Section */}
        <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-xl">
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

      {/* ... (overlay is unchanged) ... */}
       {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  );
}