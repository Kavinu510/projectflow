import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function AppLogo({ size = 64, className = '', onClick }: AppLogoProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg flex-shrink-0 ${className}`}
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
    >
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 28 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ProjectFlow logo"
      >
        {/* Top bar */}
        <rect x="0" y="0" width="28" height="5" rx="2.5" fill="#818CF8" />
        {/* Middle bar — gradient from indigo to teal */}
        <defs>
          <linearGradient id="midGrad" x1="0" y1="0" x2="28" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
        </defs>
        <rect x="0" y="7.5" width="22" height="5" rx="2.5" fill="url(#midGrad)" />
        {/* Bottom bar */}
        <rect x="0" y="15" width="16" height="5" rx="2.5" fill="#0D9488" />
      </svg>
    </div>
  );
}
