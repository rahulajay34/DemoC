// src/components/SubtleFlair.js
import React from 'react';

const SubtleFlair = () => {
  // Create an array to hold the star elements
  const stars = Array.from({ length: 50 }).map((_, i) => {
    const style = {
      // Random position
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      // Random size
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      // Random animation delay and duration
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${Math.random() * 4 + 4}s`,
    };
    return <div key={i} className="absolute rounded-full bg-white/50 animate-twinkle" style={style} />;
  });

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
      {stars}
    </div>
  );
};

export default SubtleFlair;