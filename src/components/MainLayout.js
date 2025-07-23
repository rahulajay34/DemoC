"use client";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    // This now correctly inherits the full height from the <body> tag.
    <div className="flex bg-gray-900 text-white h-full">
      <Sidebar />

      {/* This container correctly handles all scrolling for the main content area,
          ensuring it can never overlap other elements. */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}