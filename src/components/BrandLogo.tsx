import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'horizontal' | 'icon';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showSubtitle?: boolean;
  subtitleText?: string;
  subtitleClassName?: string;
}

export default function BrandLogo({
  variant = 'horizontal',
  theme = 'light',
  className = '',
  size = 'md',
  showSubtitle = false,
  subtitleText = 'Mining & Heavy Equipment Fleet Partner',
  subtitleClassName = ''
}: BrandLogoProps) {
  // Theme color mapping
  const isDark = theme === 'dark';
  const navyColor = isDark ? '#FFFFFF' : '#0A1931';
  const redColor = '#E5192D';
  const arcColor = isDark ? '#94A3B8' : '#0A1931';
  const blueChevron = isDark ? '#38BDF8' : '#0A1931';

  // Sizing styles for standalone icon (maintains 3:2 emblem aspect ratio)
  const iconSizeClasses = {
    sm: 'w-8 h-[22px]',
    md: 'w-10 h-[27px]',
    lg: 'w-14 h-[38px]',
    xl: 'w-20 h-[54px]',
    custom: ''
  }[size];

  // Sizing for horizontal lockup to match text height harmoniously
  const horizontalIconSize = {
    sm: 'h-[28px] w-auto',
    md: 'h-[34px] w-auto',
    lg: 'h-[42px] w-auto',
    xl: 'h-[52px] w-auto',
    custom: ''
  }[size];

  const fullSizeClasses = {
    sm: 'w-36 h-auto',
    md: 'w-48 h-auto',
    lg: 'w-64 h-auto',
    xl: 'w-80 h-auto',
    custom: ''
  }[size];

  // 1. ICON ONLY VARIANT
  if (variant === 'icon') {
    return (
      <svg 
        viewBox="0 0 600 400" 
        className={`${iconSizeClasses} ${className} shrink-0`} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FLEET PARTNER Emblem"
      >
        <g id="emblem-group">
          {/* RED CHEVRON: 6-point aerodynamic wing with sharp needle tips */}
          <polygon 
            points="115,45 355,200 115,355 180,275 280,200 180,125" 
            fill={redColor} 
          />
          {/* NAVY CHEVRON: 6-point faceted speed wedge */}
          <polygon 
            points="196,68 425,155 485,200 425,245 196,332 400,200" 
            fill={blueChevron} 
          />
        </g>
      </svg>
    );
  }

  // 2. FULL VERTICAL LOCKUP (Exact match to uploaded image)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center ${fullSizeClasses} ${className}`}>
        <svg 
          viewBox="0 0 600 520" 
          className="w-full h-auto" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-label="FLEET PARTNER Full Logo"
        >
          {/* EMBLEM */}
          <g id="fleet-emblem-full">
            {/* RED CHEVRON */}
            <polygon 
              points="115,45 355,200 115,355 180,275 280,200 180,125" 
              fill={redColor} 
            />
            {/* NAVY CHEVRON */}
            <polygon 
              points="196,68 425,155 485,200 425,245 196,332 400,200" 
              fill={blueChevron} 
            />
          </g>

          {/* WORDMARK: FLEET PARTNER */}
          <text 
            x="300" 
            y="440" 
            fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            fontSize="42" 
            fontWeight="900" 
            letterSpacing="0.25em" 
            fill={navyColor} 
            textAnchor="middle"
          >
            FLEET PARTNER
          </text>

          {/* DYNAMIC SWOOSH ARC */}
          <path 
            d="M 100 480 Q 300 454 500 480 Q 300 464 100 480 Z" 
            fill={arcColor} 
          />
        </svg>

        {showSubtitle && (
          <p className={`mt-2 text-xs font-mono font-bold tracking-wider uppercase ${
            subtitleClassName 
              ? subtitleClassName 
              : isDark 
                ? 'text-slate-400' 
                : 'text-[#0A1931] dark:!text-[#0A1931]'
          }`}>
            {subtitleText}
          </p>
        )}
      </div>
    );
  }

  // 3. HORIZONTAL LOCKUP (Header / Navbar view)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon emblem sized to match typography height */}
      <svg 
        viewBox="0 0 600 400" 
        className={`${horizontalIconSize || 'h-[28px] w-auto'} shrink-0`} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* RED CHEVRON */}
        <polygon 
          points="115,45 355,200 115,355 180,275 280,200 180,125" 
          fill={redColor} 
        />
        {/* NAVY CHEVRON */}
        <polygon 
          points="196,68 425,155 485,200 425,245 196,332 400,200" 
          fill={blueChevron} 
        />
      </svg>

      {/* Typography and Arc */}
      <div className="flex flex-col justify-center">
        <div className="relative">
          <span 
            className={`font-black tracking-[0.20em] uppercase leading-none block ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base sm:text-lg'
            } ${isDark ? 'text-white' : 'text-[#0A1931]'}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            FLEET PARTNER
          </span>

          {/* Slender arc underline */}
          <svg 
            viewBox="0 0 200 12" 
            className="w-full h-1.5 mt-0.5" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M 2 10 Q 100 2 198 10 Q 100 5 2 10 Z" 
              fill={arcColor} 
            />
          </svg>
        </div>

        {showSubtitle && (
          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
}
