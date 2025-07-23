"use client";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { ClipLoader } from "react-spinners";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return; // Wait until authentication status is determined
    }

    // If user is not authenticated and is not on the login page, redirect
    if (!authenticated && pathname !== "/login") {
      router.replace("/login");
    }

    // If user is authenticated and tries to go to login page, redirect to dashboard
    if (authenticated && pathname === "/login") {
      router.replace("/");
    }
  }, [authLoading, authenticated, pathname, router]);

  // Show a full-screen loader while checking auth status
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <ClipLoader color="#f28a22" size={50} />
      </div>
    );
  }

  // Prevent rendering the page content while a redirect is imminent
  if ((!authenticated && pathname !== "/login") || (authenticated && pathname === "/login")) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <ClipLoader color="#f28a22" size={50} />
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const pageTransition = {
    type: "tween",
    ease: "linear",
    duration: 0.3,
  };

  // Don't show the sidebar on the login page
  if (pathname === "/login") {
    return (
      <main className="w-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    );
  }

  // Show the sidebar on all other pages
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 w-full px-3 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8 relative isolate min-w-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}