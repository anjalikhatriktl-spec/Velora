import React, { useEffect, useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackTitle || 'VELORA fragrance photograph'}
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#F2ECE4] via-[#EAE2D6] to-[#DFD4C4] text-[#6E655E] p-6 text-center ${className}`}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="mb-2 opacity-60"
        >
          <rect x="13" y="4" width="10" height="5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M10 12H26L28 31H8L10 12Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="18" cy="21" r="3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="font-serif text-sm tracking-wide text-[#2B2623]">
          {fallbackTitle || alt || 'VELORA'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
