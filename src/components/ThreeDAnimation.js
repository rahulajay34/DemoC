// I have a 3D model requirement. This component integrates Three.js for lightweight 3D animations with fallback to 2D if performance is a concern on mobile devices.
"use client";
import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Simple 3D bike model using basic geometries with enhanced interactivity
function BikeModel({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, mousePosition = { x: 0, y: 0 } }) {
  const bikeRef = useRef();
  
  useFrame((state) => {
    if (bikeRef.current) {
      // Gentle floating animation
      bikeRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
      
      // Mouse-reactive rotation
      const targetRotationY = rotation[1] + (mousePosition.x * 0.5);
      const targetRotationX = rotation[0] + (mousePosition.y * 0.3);
      
      bikeRef.current.rotation.y += (targetRotationY - bikeRef.current.rotation.y) * 0.05;
      bikeRef.current.rotation.x += (targetRotationX - bikeRef.current.rotation.x) * 0.03;
    }
  });

  return (
    <group ref={bikeRef} position={position} rotation={rotation} scale={scale}>
      {/* Enhanced bike frame with better geometry */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 12]} />
        <meshStandardMaterial 
          color="#ff6500" 
          roughness={0.3}
          metalness={0.7}
          emissive="#ff6500"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Enhanced bike wheels with spokes */}
      <group position={[-0.8, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.3, 0.05, 8, 16]} />
          <meshStandardMaterial color="#333" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Spokes */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            <cylinderGeometry args={[0.01, 0.01, 0.5, 4]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        ))}
      </group>
      
      <group position={[0.8, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.3, 0.05, 8, 16]} />
          <meshStandardMaterial color="#333" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Spokes */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            <cylinderGeometry args={[0.01, 0.01, 0.5, 4]} />
            <meshStandardMaterial color="#666" />
          </mesh>
        ))}
      </group>
      
      {/* Enhanced handlebars */}
      <mesh position={[-0.8, 0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#666" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Enhanced seat */}
      <mesh position={[0.5, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      
      {/* Added pedals */}
      <mesh position={[0, -0.5, 0.15]}>
        <boxGeometry args={[0.1, 0.05, 0.05]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, -0.5, -0.15]}>
        <boxGeometry args={[0.1, 0.05, 0.05]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

// Particle system for ambient effects
function ParticleSystem({ count = 100 }) {
  const particles = useRef();
  const particlesPosition = new Float32Array(count * 3);
  
  // Initialize particle positions
  for (let i = 0; i < count; i++) {
    particlesPosition[i * 3] = (Math.random() - 0.5) * 20;
    particlesPosition[i * 3 + 1] = (Math.random() - 0.5) * 20;
    particlesPosition[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  
  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y += 0.001;
      particles.current.rotation.x += 0.0005;
    }
  });
  
  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#ff6500" 
        transparent 
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Animated scene with multiple bikes and enhanced lighting
function AnimatedScene({ mousePosition = { x: 0, y: 0 } }) {
  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4f46e5" />
      <pointLight position={[10, 5, 10]} intensity={0.4} color="#f59e0b" />
      <hemisphereLight skyColor="#87ceeb" groundColor="#654321" intensity={0.3} />
      
      {/* Particle system */}
      <ParticleSystem count={150} />
      
      {/* Multiple bike models with mouse interaction */}
      <BikeModel 
        position={[-2, 0, 0]} 
        rotation={[0, 0.5, 0]} 
        scale={0.8} 
        mousePosition={mousePosition}
      />
      <BikeModel 
        position={[0, 0, -1]} 
        rotation={[0, 0, 0]} 
        scale={1} 
        mousePosition={mousePosition}
      />
      <BikeModel 
        position={[2, 0, 0]} 
        rotation={[0, -0.5, 0]} 
        scale={0.8} 
        mousePosition={mousePosition}
      />
      
      {/* Enhanced ground plane with grid pattern */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial 
          color="#f0f0f0" 
          transparent 
          opacity={0.3}
          roughness={0.8}
        />
      </mesh>
      
      {/* Grid lines for depth perception */}
      <gridHelper args={[15, 15, "#999999", "#cccccc"]} position={[0, -0.99, 0]} />
    </>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-orange-600 font-medium">Loading 3D Scene...</p>
      </div>
    </div>
  );
}

// 2D fallback for performance concerns
function Simple2DFallback({ showBikes = true }) {
  return (
    <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-300 rounded-lg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-orange-500 rounded-full opacity-20 animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </div>
      
      {showBikes && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl animate-pulse">🏍️</div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-orange-600 text-sm font-medium">
        Optimized 2D Mode
      </div>
    </div>
  );
}

// Main 3D component with performance detection and mouse interaction
export default function ThreeDAnimation({ 
  fallbackTo2D = false, 
  height = 300,
  showControls = true,
  autoRotate = true 
}) {
  const [use3D, setUse3D] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef();

  // Mouse tracking for interactive effects
  const handleMouseMove = (event) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePosition({ x, y });
    }
  };

  // Performance detection
  useEffect(() => {
    const checkPerformance = () => {
      // Check if device supports WebGL
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setUse3D(false);
        return;
      }

      // Check device memory and performance
      const isMobile = window.innerWidth < 768;
      const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
      const isSlowConnection = navigator.connection && navigator.connection.effectiveType === 'slow-2g';
      
      if (isMobile || hasLowMemory || isSlowConnection || fallbackTo2D) {
        setPerformanceMode(true);
        if (isMobile && hasLowMemory) {
          setUse3D(false);
        }
      }
    };

    checkPerformance();
    setIsLoading(false);
  }, [fallbackTo2D]);

  // Force 2D mode on user preference
  const handle2DToggle = () => {
    setUse3D(false);
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!use3D) {
    return <Simple2DFallback showBikes={true} />;
  }

  return (
    <div className="relative">
      {/* Performance toggle */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handle2DToggle}
          className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-xs text-gray-600 hover:bg-white/90 transition-colors"
          title="Switch to 2D for better performance"
        >
          {performanceMode ? '⚡ Performance' : '🎮 Switch to 2D'}
        </button>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{ height: `${height}px` }} 
        className="rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-none"
      >
        <Canvas
          shadows
          camera={{ position: [5, 3, 5], fov: 50 }}
          gl={{ 
            antialias: !performanceMode, 
            alpha: true,
            powerPreference: performanceMode ? "low-power" : "high-performance"
          }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[5, 3, 5]} />
            
            {showControls && (
              <OrbitControls
                enableZoom={!performanceMode}
                enablePan={!performanceMode}
                autoRotate={autoRotate && !performanceMode}
                autoRotateSpeed={0.5}
                minDistance={3}
                maxDistance={10}
                maxPolarAngle={Math.PI / 2}
              />
            )}
            
            <AnimatedScene mousePosition={mousePosition} />
            
            {/* Enhanced fog for depth */}
            <fog attach="fog" args={['#f0f0f0', 6, 25]} />
          </Suspense>
        </Canvas>
      </div>
      
      {performanceMode && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
          Performance Mode Active
        </div>
      )}
    </div>
  );
}

// Hook for 3D animation in components
export function use3DAnimation(enabled = true) {
  const [canUse3D, setCanUse3D] = useState(enabled);
  
  useEffect(() => {
    if (!enabled) {
      setCanUse3D(false);
      return;
    }

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      setCanUse3D(false);
    }
  }, [enabled]);

  return {
    canUse3D,
    disable3D: () => setCanUse3D(false)
  };
}

// Simple 3D icon component for buttons/cards
export function Icon3D({ type = 'bike', size = 40, animate = true }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && animate) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'bike':
        return <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />;
      case 'user':
        return <sphereGeometry args={[0.2, 16, 16]} />;
      case 'gear':
        return <torusGeometry args={[0.2, 0.05, 8, 16]} />;
      default:
        return <boxGeometry args={[0.3, 0.3, 0.3]} />;
    }
  };

  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 1], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
        <mesh ref={meshRef}>
          {getGeometry()}
          <meshStandardMaterial color="#ff6500" />
        </mesh>
      </Canvas>
    </div>
  );
}
