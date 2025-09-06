import React from 'react';

const Logo = ({ className = "h-8 w-8", ...props }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      {...props}
    >
      {/* Background Circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.2"
      />
      
      {/* Document/Resume Icon */}
      <rect
        x="25"
        y="20"
        width="30"
        height="40"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      
      {/* Document Lines */}
      <line x1="30" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
      <line x1="30" y1="35" x2="45" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
      <line x1="30" y1="40" x2="50" y2="40" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
      <line x1="30" y1="45" x2="40" y2="45" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
      
      {/* AI Brain/Neural Network */}
      <circle
        cx="65"
        cy="35"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Neural Network Connections */}
      <path
        d="M55 35 Q60 30 65 35 Q70 40 75 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
      
      {/* AI Circuit Pattern */}
      <rect x="60" y="45" width="8" height="2" rx="1" fill="currentColor" opacity="0.8"/>
      <rect x="62" y="50" width="4" height="2" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="60" y="55" width="8" height="2" rx="1" fill="currentColor" opacity="0.8"/>
      
      {/* Professional Accent */}
      <path
        d="M20 70 Q30 60 40 70 Q50 80 60 70 Q70 60 80 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.4"
      />
      
      {/* Success Checkmark */}
      <path
        d="M75 20 L80 25 L85 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
};

export default Logo;
