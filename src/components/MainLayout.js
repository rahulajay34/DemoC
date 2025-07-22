"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function MainLayout({ children }) {
  const pathname = usePathname();

  // A simpler, more performant fade transition
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
    },
    out: {
      opacity: 0,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "linear",
    duration: 0.3, // A slightly faster transition
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
    <div className="block md:flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 px-2 py-6 md:px-10 md:py-8 relative isolate">
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