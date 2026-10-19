import React from 'react';

interface RunStackLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export const RunStackLogo: React.FC<RunStackLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-bold',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original RunStack Symbol: Stacked code brackets forming an elevated execution engine */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs shrink-0 transition-transform hover:scale-105`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4/5 h-4/5 text-white"
        >
          {/* Top execution chevron layer */}
          <path d="M4 6l4-3 4 3" />
          {/* Middle stack layer */}
          <path d="M4 12l4-3 4 3 8-6" />
          {/* Base foundation code bracket */}
          <path d="M4 18l8 5 8-5" />
          {/* Fast forward terminal prompt pulse */}
          <circle cx="16" cy="15" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {showWordmark && (
        <span
          className={`${textSizes[size]} tracking-tight text-slate-900 font-sans whitespace-nowrap`}
        >
          Run<span className="text-blue-600">Stack</span>
        </span>
      )}
    </div>
  );
};
