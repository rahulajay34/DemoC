import React from 'react';

const CheetahLogo = ({ className }) => {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 395 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cheetah Logo"
    >
      <style>
        {`
          .cheetah-text {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-weight: 800;
            font-size: 80px;
            fill: currentColor;
          }
          .lightning {
            fill: #FFD700;
            stroke: #fff;
            stroke-width: 2px;
            stroke-linejoin: round;
          }
        `}
      </style>
      
      <text x="0" y="75" className="cheetah-text">C</text>
      <text x="58" y="75" className="cheetah-text">H</text>
      
      <g transform="translate(130 18) scale(1.2)">
        <path className="lightning" d="M21.5 0L0 25h15l-5 25L35 20H20z"/>
      </g>
      <g transform="translate(165 18) scale(1.2)">
        <path className="lightning" d="M21.5 0L0 25h15l-5 25L35 20H20z"/>
      </g>

      <text x="210" y="75" className="cheetah-text">T</text>
      <text x="265" y="75" className="cheetah-text">A</text>
      <text x="325" y="75" className="cheetah-text">H</text>
    </svg>
  );
};

export default CheetahLogo;