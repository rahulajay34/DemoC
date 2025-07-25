"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Toast from "./Toast";
import CustomCursor from "./CustomCursor";
import { useAuth } from "@/context/AuthContext";
import { ClipLoader } from "react-spinners";

// Import optimized performance utilities
import { preloadCriticalData, clearApiCache } from "@/utils/apiHelper";
import PerformanceMonitor from "./PerformanceMonitor";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, authLoading } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [preloadedRoutes, setPreloadedRoutes] = useState(new Set());

  // Optimized route preloading for faster navigation
  useEffect(() => {
    const preloadRoutes = async () => {
      // Define critical routes to preload based on current page
      const routePreloadMap = {
        '/': ['/riders', '/bikes', '/assignments'],
        '/riders': ['/assignments', '/payments'],
        '/bikes': ['/assignments', '/maintenance'],
        '/assignments': ['/riders', '/bikes', '/payments'],
        '/payments': ['/assignments', '/riders'],
        '/maintenance': ['/bikes'],
        '/analytics': ['/dashboard'],
        '/reports': ['/analytics', '/dashboard']
      };

      const routesToPreload = routePreloadMap[pathname] || [];
      
      for (const route of routesToPreload) {
        if (!preloadedRoutes.has(route)) {
          try {
            // Preload API data for the route
            await preloadCriticalData([`/api${route}?limit=5`]);
            setPreloadedRoutes(prev => new Set([...prev, route]));
          } catch (error) {
            console.warn(`Failed to preload ${route}:`, error);
          }
        }
      }
    };

    if (authenticated && !authLoading) {
      preloadRoutes();
    }
  }, [pathname, authenticated, authLoading, preloadedRoutes]);

  // Handle route transitions with loading states
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsTransitioning(true);
    };

    const handleRouteChangeComplete = () => {
      setIsTransitioning(false);
      // Clear stale cache when navigating to ensure fresh data
      if (Math.random() > 0.8) { // Occasionally clear cache
        clearApiCache();
      }
    };

    // Listen for route changes
    handleRouteChangeStart();
    const timer = setTimeout(handleRouteChangeComplete, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

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

  // Enhanced loading screen with animations
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.h2 
            className="text-xl font-semibold text-gray-700 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            CheetahRide
          </motion.h2>
          <motion.p 
            className="text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Loading your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Prevent rendering the page content while a redirect is imminent
  if ((!authenticated && pathname !== "/login") || (authenticated && pathname === "/login")) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-orange-50 to-orange-100">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ClipLoader color="#f28a22" size={50} />
        </motion.div>
      </div>
    );
  }

  // If not authenticated, return null (will redirect to login)
  if (!authenticated) {
    return null;
  }

  // Page transition variants optimized for performance with grabandgo inspiration
  const pageVariants = {
    initial: { 
      opacity: 0, 
      x: 30,
      scale: 0.99,
      filter: "blur(2px)"
    },
    animate: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 0.4,
        ease: [0.43, 0.13, 0.23, 0.96],
        staggerChildren: 0.08,
        when: "beforeChildren"
      }
    },
    exit: { 
      opacity: 0, 
      x: -30, 
      scale: 0.98,
      filter: "blur(1px)",
      transition: { 
        duration: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96],
        when: "afterChildren"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 transition-all duration-300">
      {/* Custom Cursor */}
      <CustomCursor />
      
      {/* Optimized Sidebar */}
      <Sidebar />
      
      {/* Main content with enhanced transitions */}
      <div className="lg:ml-64">
        {/* Transition loading indicator */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className="fixed top-0 left-0 lg:left-64 right-0 h-1 bg-orange-500 z-50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />
          )}
        </AnimatePresence>

        {/* Page content with optimized animations */}
        <main className="min-h-screen">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="min-h-screen"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Performance indicator (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
          >
            <div>📡 Preloaded: {preloadedRoutes.size} routes</div>
            <div>⚡ Cache: Active</div>
            <div>🚀 Optimized</div>
          </motion.div>
        )}

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>

      {/* Custom cursor for desktop */}
      <CustomCursor />

      {/* Toast notifications */}
      <Toast />
      
      {/* Global loading overlay for heavy operations */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white/90 rounded-xl p-4 shadow-lg border"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-5 h-5 border-2 border-orange-200 border-t-orange-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-gray-700 font-medium text-sm">Optimizing...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
