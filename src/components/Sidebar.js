"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FaBars, FaUserFriends, FaBicycle, FaClipboardList, FaHome } from "react-icons/fa";
import { useState } from "react";

export default function Sidebar() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar for mobile */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#f28a22] to-[#FF5E62] text-white shadow-lg">
        <button aria-label="Open menu" onClick={() => setOpen(true)}><FaBars size={26} /></button>
        <span className="font-extrabold text-xl">CHEETAH 🐾</span>
      </div>
      {/* Drawer */}
      <nav className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#f28a22] to-[#FF5E62] text-white z-50 transform ${open ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 md:relative md:translate-x-0 md:w-64 md:min-h-screen flex flex-col px-6 py-8 shadow-lg`}>
        <span className="md:hidden absolute top-3 right-5 cursor-pointer" onClick={() => setOpen(false)}>&times;</span>
        <div>
          <h1 className="font-extrabold text-2xl mb-10 hidden md:block">CHEETAH 🐾</h1>
          <div className="flex flex-col gap-6 text-lg font-semibold mt-10">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 hover:opacity-90"><FaHome /> Dashboard</Link>
            <Link href="/riders" onClick={() => setOpen(false)} className="flex items-center gap-3 hover:opacity-90"><FaUserFriends /> Riders</Link>
            <Link href="/bikes" onClick={() => setOpen(false)} className="flex items-center gap-3 hover:opacity-90"><FaBicycle /> Bikes</Link>
            <Link href="/assignments" onClick={() => setOpen(false)} className="flex items-center gap-3 hover:opacity-90"><FaClipboardList /> Assignments</Link>
          </div>
        </div>
        <button onClick={logout} className="mt-auto text-sm text-white font-semibold hover:underline w-full md:w-auto">Logout</button>
      </nav>
      {/* Overlay for mobile drawer */}
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden" />}
    </>
  );
}
