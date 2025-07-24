// Performance monitoring component for development
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    apiResponseTime: 0,
    framesPerSecond: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    // FPS monitoring
    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          framesPerSecond: Math.round(frameCount * 1000 / (currentTime - lastTime))
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(updateFPS);
    };

    // Performance observer for navigation timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            setMetrics(prev => ({
              ...prev,
              loadTime: Math.round(entry.loadEventEnd - entry.loadEventStart)
            }));
          } else if (entry.entryType === 'measure' && entry.name === 'render-time') {
            setMetrics(prev => ({
              ...prev,
              renderTime: Math.round(entry.duration)
            }));
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'measure'] });
    }

    // Memory usage monitoring
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    updateFPS();
    updateMemoryUsage();
    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
}

export default function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const metrics = usePerformanceMonitor();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 w-10 h-10 bg-black/80 text-white rounded-full flex items-center justify-center text-xs font-mono z-50 hover:bg-black/90 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ⚡
      </motion.button>

      {/* Performance panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed bottom-16 left-4 bg-black/90 text-white rounded-lg p-4 text-xs font-mono z-50 min-w-64"
          >
            <h3 className="text-green-400 font-bold mb-3">Performance Monitor</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Load Time:</span>
                <span className={metrics.loadTime > 3000 ? 'text-red-400' : 'text-green-400'}>
                  {metrics.loadTime}ms
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Render Time:</span>
                <span className={metrics.renderTime > 16 ? 'text-red-400' : 'text-green-400'}>
                  {metrics.renderTime}ms
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Memory Usage:</span>
                <span className={metrics.memoryUsage > 50 ? 'text-red-400' : 'text-green-400'}>
                  {metrics.memoryUsage}MB
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className={metrics.framesPerSecond < 30 ? 'text-red-400' : 'text-green-400'}>
                  {metrics.framesPerSecond}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Cache Hit Rate:</span>
                <span className="text-blue-400">{metrics.cacheHitRate}%</span>
              </div>
            </div>

            {/* Performance tips */}
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-gray-400 text-xs">
                {metrics.loadTime > 3000 && "⚠️ Slow load time detected"}
                {metrics.framesPerSecond < 30 && "⚠️ Low FPS - consider reducing animations"}
                {metrics.memoryUsage > 50 && "⚠️ High memory usage"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
