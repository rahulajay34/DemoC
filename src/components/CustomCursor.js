// Custom cursor component inspired by theyearofgreta.com and bruno-simon.com
"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const [cursorLabel, setCursorLabel] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Don't show custom cursor on mobile
    if (isMobile) {
      document.body.classList.remove('custom-cursor-enabled');
      return;
    }

    // Enable custom cursor
    document.body.classList.add('custom-cursor-enabled');

    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Add event listeners for interactive elements
    const addInteractiveListeners = () => {
      // Clean up existing listeners
      const existingElements = document.querySelectorAll('[data-cursor-setup="true"]');
      existingElements.forEach(el => {
        if (el._cursorEnterHandler) {
          el.removeEventListener('mouseenter', el._cursorEnterHandler);
        }
        if (el._cursorLeaveHandler) {
          el.removeEventListener('mouseleave', el._cursorLeaveHandler);
        }
        el.removeAttribute('data-cursor-setup');
        delete el._cursorEnterHandler;
        delete el._cursorLeaveHandler;
      });

      // Buttons and links
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      const cards = document.querySelectorAll('.glass-card, .card-hover');
      const inputs = document.querySelectorAll('input, textarea, select');

      const handleButtonEnter = (button) => () => {
        setCursorVariant('button');
        setCursorLabel(button.getAttribute('aria-label') || button.textContent?.trim().slice(0, 20) || 'Click');
      };

      const handleDefaultLeave = () => {
        setCursorVariant('default');
        setCursorLabel('');
      };

      buttons.forEach(button => {
        if (!button.hasAttribute('data-cursor-setup')) {
          button.setAttribute('data-cursor-setup', 'true');
          const enterHandler = handleButtonEnter(button);
          button.addEventListener('mouseenter', enterHandler);
          button.addEventListener('mouseleave', handleDefaultLeave);
          
          // Store handlers for cleanup
          button._cursorEnterHandler = enterHandler;
          button._cursorLeaveHandler = handleDefaultLeave;
        }
      });

      cards.forEach(card => {
        if (!card.hasAttribute('data-cursor-setup')) {
          card.setAttribute('data-cursor-setup', 'true');
          const enterHandler = () => {
            setCursorVariant('card');
            setCursorLabel('View');
          };
          card.addEventListener('mouseenter', enterHandler);
          card.addEventListener('mouseleave', handleDefaultLeave);
          
          card._cursorEnterHandler = enterHandler;
          card._cursorLeaveHandler = handleDefaultLeave;
        }
      });

      inputs.forEach(input => {
        if (!input.hasAttribute('data-cursor-setup')) {
          input.setAttribute('data-cursor-setup', 'true');
          const enterHandler = () => {
            setCursorVariant('input');
            setCursorLabel('Type');
          };
          input.addEventListener('mouseenter', enterHandler);
          input.addEventListener('mouseleave', handleDefaultLeave);
          
          input._cursorEnterHandler = enterHandler;
          input._cursorLeaveHandler = handleDefaultLeave;
        }
      });
    };

    // Initial setup
    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Set up interactive element listeners
    addInteractiveListeners();

    // Re-run when DOM changes (for dynamic content)
    const observer = new MutationObserver(addInteractiveListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.body.classList.remove('custom-cursor-enabled');
      observer.disconnect();
    };
  }, [isVisible, isMobile]);

  // Cursor variants for different interaction states
  const cursorVariants = {
    default: {
      scale: 1,
      backgroundColor: 'rgba(249, 115, 22, 0.8)',
      border: '2px solid rgba(249, 115, 22, 0.3)',
      width: 20,
      height: 20,
    },
    button: {
      scale: 1.5,
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      border: '2px solid rgba(59, 130, 246, 0.4)',
      width: 32,
      height: 32,
    },
    card: {
      scale: 1.2,
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      border: '2px solid rgba(16, 185, 129, 0.4)',
      width: 24,
      height: 24,
    },
    input: {
      scale: 0.8,
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      border: '2px solid rgba(139, 92, 246, 0.4)',
      width: 16,
      height: 16,
    }
  };

  // Label variants
  const labelVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Don't show on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Main cursor dot */}
          <motion.div
            className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
            style={{
              x: mousePosition.x - 10,
              y: mousePosition.y - 10,
            }}
            animate={cursorVariants[cursorVariant]}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 28,
              mass: 0.5
            }}
          >
            <div
              className="rounded-full backdrop-blur-sm"
              style={{
                width: cursorVariants[cursorVariant].width,
                height: cursorVariants[cursorVariant].height,
                backgroundColor: cursorVariants[cursorVariant].backgroundColor,
                border: cursorVariants[cursorVariant].border,
              }}
            />
          </motion.div>

          {/* Cursor label */}
          <AnimatePresence>
            {cursorLabel && (
              <motion.div
                className="fixed top-0 left-0 z-[9998] pointer-events-none"
                style={{
                  x: mousePosition.x + 20,
                  y: mousePosition.y - 30,
                }}
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20">
                  {cursorLabel}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cursor trail effect */}
          <motion.div
            className="fixed top-0 left-0 z-[9997] pointer-events-none"
            style={{
              x: mousePosition.x - 25,
              y: mousePosition.y - 25,
            }}
            animate={{
              scale: cursorVariant === 'default' ? 1 : 1.5,
              opacity: cursorVariant === 'default' ? 0.3 : 0.5,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut"
            }}
          >
            <div className="w-12 h-12 rounded-full border border-orange-400/20 animate-pulse" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Custom hook for cursor interactions
export function useCursorInteraction() {
  const setCursorVariant = (variant, label = '') => {
    // This would be connected to a global cursor state if needed
    // For now, we use data attributes
    document.body.setAttribute('data-cursor-variant', variant);
    document.body.setAttribute('data-cursor-label', label);
  };

  return { setCursorVariant };
}
