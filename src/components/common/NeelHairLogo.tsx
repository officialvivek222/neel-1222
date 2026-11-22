import React from 'react';

interface NeelHairLogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'gold-accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const NeelHairLogo: React.FC<NeelHairLogoProps> = ({
  className = '',
  size = 'md'
}) => {
  // Height sizing for exact 3:4 aspect ratio across all screen sizes
  const sizeClasses = {
    sm: 'h-12 sm:h-14',
    md: 'h-24 sm:h-28',
    lg: 'h-36 sm:h-44',
    xl: 'h-48 sm:h-56'
  }[size];

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/neel-hair-logo.jpg"
        alt="Neel Hair"
        className={`${sizeClasses} w-auto max-w-full max-h-full object-contain rounded-lg drop-shadow-lg`}
        loading="eager"
      />
    </div>
  );
};
