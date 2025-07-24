// Enhanced 3D hero component with performance monitoring and fallbacks
"use client";
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';
import ThreeDAnimation from './ThreeDAnimation';

// Performance detector hook
function usePerformanceDetection() {
  const [canUse3D, setCanUse3D] = useState(true);
  const [performanceLevel, setPerformanceLevel] = useState('high');

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setCanUse3D(false);
      return;
    }

    // Performance detection
    const isMobile = window.innerWidth < 768;
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    const isSlowConnection = navigator.connection && 
      ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType);

    if (isMobile || hasLowMemory || isSlowConnection) {
      setPerformanceLevel('low');
      if (isMobile && hasLowMemory) {
        setCanUse3D(false);
      }
    } else if (isMobile) {
      setPerformanceLevel('medium');
    }
  }, []);

  return { canUse3D, performanceLevel };
}

// Loading component for 3D scenes
function Loader3D() {
  const { progress } = useProgress();
  return (
    <motion.div 
      className="flex items-center justify-center h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-orange-700 font-medium">Loading 3D Scene...</p>
        <p className="text-orange-600 text-sm">{Math.round(progress)}%</p>
      </div>
    </motion.div>
  );
}

// 2D fallback component with CSS animations
function Enhanced2DFallback() {
  return (
    <motion.div 
      className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 bg-orange-300/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>
      
      {/* Bike icons with animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-6xl text-orange-600"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🚲
        </motion.div>
      </div>
      
      {/* Performance indicator */}
      <div className="absolute bottom-4 right-4 text-xs text-orange-600 bg-white/80 px-2 py-1 rounded">
        2D Mode Active
      </div>
    </motion.div>
  );
}

// Main enhanced 3D hero component
export default function Enhanced3DHero({ height = 300, showControls = false }) {
  const { canUse3D, performanceLevel } = usePerformanceDetection();
  const [userPrefers2D, setUserPrefers2D] = useState(false);

  // Allow user to toggle between 3D and 2D
  const use3D = canUse3D && !userPrefers2D;

  if (!use3D) {
    return <Enhanced2DFallback />;
  }

  return (
    <div className="relative">
      {/* User controls */}
      <div className="absolute top-2 right-2 z-10 space-x-2">
        <button
          onClick={() => setUserPrefers2D(!userPrefers2D)}
          className="px-3 py-1 bg-white/80 backdrop-blur-sm text-xs text-gray-700 rounded-md hover:bg-white/90 transition-colors"
        >
          {use3D ? 'Switch to 2D' : 'Switch to 3D'}
        </button>
      </div>

      {/* 3D Scene */}
      <div style={{ height }} className="w-full rounded-lg overflow-hidden">
        <Suspense fallback={<Loader3D />}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 60 }}
            gl={{ 
              antialias: performanceLevel === 'high',
              alpha: true,
              powerPreference: performanceLevel === 'low' ? 'low-power' : 'high-performance'
            }}
            dpr={performanceLevel === 'low' ? 1 : Math.min(window.devicePixelRatio, 2)}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            <ThreeDAnimation 
              autoRotate={performanceLevel !== 'low'}
              showControls={showControls && performanceLevel === 'high'}
            />
            
            {showControls && performanceLevel === 'high' && (
              <OrbitControls 
                enableZoom={false}
                enablePan={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 3}
              />
            )}
          </Canvas>
        </Suspense>
      </div>

      {/* Performance indicator */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
        3D Mode ({performanceLevel})
      </div>
    </div>
  );
}
