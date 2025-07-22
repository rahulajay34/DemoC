"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  FaBars,
  FaUserFriends,
  FaBicycle,
  FaClipboardList,
  FaHome,
} from "react-icons/fa";
import { useState } from "react";
import { usePathname } from "next/navigation";
import CheetahLogo from "./CheetahLogo"; // Import the new component

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
  ];

  return (
    <>
      {/* Top bar for mobile */}
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
        } transition-transform duration-300 md:relative md:translate-x-0 md:w-64 md:min-h-screen flex flex-col px-4 py-8 shadow-2xl`}
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
          <div className="flex flex-col gap-3 text-lg font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "active-glass-link text-white font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-auto text-gray-400 font-semibold hover:text-white hover:underline w-full text-left pl-4"
        >
          Logout
        </button>
      </nav>

      {/* Overlay for mobile drawer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  );
}