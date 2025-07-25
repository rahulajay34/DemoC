// I want smooth page transitions with Framer Motion inspired by grabandgo.pt. This provides comprehensive transition animations for seamless navigation with performance monitoring.
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

// Performance monitoring for transitions
const transitionMetrics = {
  startTime: null,
  endTime: null,
  totalTransitions: 0,
  averageTime: 0
};

// Enhanced transition variants with performance optimizations
const pageVariants = {
  dashboard: {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.98,
      filter: "blur(4px)"
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 0.4, 
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.98,
      filter: "blur(2px)",
      transition: { 
        duration: 0.3, 
        ease: "easeInOut",
        when: "afterChildren"
      }
    }
  },
  slide: {
    initial: { opacity: 0, x: "100vw" },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 20,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      x: "-100vw",
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 20,
        duration: 0.4
      }
    }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: [0.175, 0.885, 0.32, 1.275]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 1.1,
      transition: { duration: 0.3 }
    }
  },
  grabandgo: {
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
  }
};

// Loading transition for async content
const loadingVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Responsive animation adjustments for mobile devices to avoid lag
const getResponsiveVariant = (variant, isMobile) => {
  if (isMobile) {
    // Faster, simpler animations on mobile
    return {
      ...variant,
      animate: {
        ...variant.animate,
        transition: {
          ...variant.animate.transition,
          duration: (variant.animate.transition.duration || 0.5) * 0.7
        }
      }
    };
  }
  return variant;
};

// Custom hook for detecting mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Main page transition wrapper with performance monitoring
export function PageTransition({ children, variant = "dashboard", className = "" }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [transitionStarted, setTransitionStarted] = useState(false);
  const startTimeRef = useRef(null);
  
  const selectedVariant = getResponsiveVariant(pageVariants[variant], isMobile);

  // Performance monitoring
  useEffect(() => {
    if (!transitionStarted) {
      startTimeRef.current = performance.now();
      setTransitionStarted(true);
      transitionMetrics.startTime = startTimeRef.current;
    }
  }, [pathname, transitionStarted]);

  const handleAnimationComplete = () => {
    if (startTimeRef.current) {
      const endTime = performance.now();
      const duration = endTime - startTimeRef.current;
      
      transitionMetrics.endTime = endTime;
      transitionMetrics.totalTransitions++;
      transitionMetrics.averageTime = 
        ((transitionMetrics.averageTime * (transitionMetrics.totalTransitions - 1)) + duration) / 
        transitionMetrics.totalTransitions;

      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Page transition completed in ${duration.toFixed(2)}ms`);
        console.log(`Average transition time: ${transitionMetrics.averageTime.toFixed(2)}ms`);
      }

      setTransitionStarted(false);
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={selectedVariant}
        initial="initial"
        animate="animate"
        exit="exit"
        onAnimationComplete={handleAnimationComplete}
        className={`min-h-screen ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Loading state transition
export function LoadingTransition({ isLoading, children, fallback }) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          variants={loadingVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {fallback}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={loadingVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Staggered children animation for cards/lists
export const staggerContainer = {
  initial: "initial",
  animate: "animate",
  exit: "exit"
};

export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.43, 0.13, 0.23, 0.96] 
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { 
      duration: 0.3, 
      ease: "easeIn" 
    }
  }
};

// Hover effects for interactive elements
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2, ease: "easeOut" }
};

export const hoverLift = {
  y: -4,
  scale: 1.02,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  transition: { duration: 0.2, ease: "easeOut" }
};

// Page-specific transition variants
export const pageTransitions = {
  dashboard: "dashboard",
  forms: "slide", 
  lists: "fade",
  details: "scale"
};

// Higher-order component for automatic page transitions
export function withPageTransition(Component, variant = "dashboard") {
  return function TransitionedComponent(props) {
    return (
      <PageTransition variant={variant}>
        <Component {...props} />
      </PageTransition>
    );
  };
}

// Hook for programmatic animations
export function usePageAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return {
    isVisible,
    triggerAnimation: () => setIsVisible(!isVisible)
  };
}
