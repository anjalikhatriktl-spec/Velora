import React from 'react';

interface VeloraLogoProps {
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showMonogram?: boolean;
  className?: string;
}

export const VeloraLogo: React.FC<VeloraLogoProps> = ({
  tone = 'dark',
  size = 'md',
  showMonogram = true,
  className = '',
}) => {
  const textColor = tone === 'light' ? 'text-[#FAF8F4]' : 'text-[#181614]';
  const accentColor = tone === 'light' ? 'text-[#B8935A]' : 'text-[#9A7742]';

  const sizeClasses =
    size === 'sm'
      ? 'text-lg sm:text-xl tracking-[0.24em]'
      : size === 'lg'
        ? 'text-3xl sm:text-5xl tracking-[0.28em]'
        : 'text-xl sm:text-2xl lg:text-[26px] tracking-[0.24em] sm:tracking-[0.28em]';

  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {showMonogram && (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className={`${iconSize} ${accentColor} shrink-0`}
        >
          <rect
            x="1.5"
            y="1.5"
            width="29"
            height="29"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeOpacity="0.65"
          />
          <path
            d="M9.5 8.5H13.4L16 19.6L18.6 8.5H22.5L17.3 23.8H14.7L9.5 8.5Z"
            fill="currentColor"
          />
        </svg>
      )}
      <span className={`font-serif font-medium uppercase leading-none ${textColor} ${sizeClasses}`}>
        VELORA
      </span>
    </span>
  );
};
