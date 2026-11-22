import React, { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showSparkles?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  interactive = false,
  size = 'md',
  showBadge = false,
  showSparkles = false,
  className = ''
}) => {
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11'
  }[size];

  const currentVal = hoverVal !== null ? hoverVal : value;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Sparkles left */}
      {showSparkles && (
        <span className="text-amber-400 text-lg animate-pulse select-none -mr-1">
          ✦
        </span>
      )}

      {/* Stars row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= currentVal;

          return (
            <button
              type="button"
              key={starIndex}
              disabled={!interactive}
              onClick={() => onChange && onChange(starIndex)}
              onMouseEnter={() => interactive && setHoverVal(starIndex)}
              onMouseLeave={() => interactive && setHoverVal(null)}
              className={`transition-all duration-150 transform ${
                interactive
                  ? 'cursor-pointer hover:scale-115 active:scale-95 focus:outline-none'
                  : 'cursor-default pointer-events-none'
              }`}
              aria-label={`${starIndex} of 5 stars`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`${starSizes} transition-colors ${
                  isFilled
                    ? 'text-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)]'
                    : 'text-slate-200'
                }`}
                fill={isFilled ? 'currentColor' : '#e2e8f0'}
                stroke={isFilled ? '#f59e0b' : '#cbd5e1'}
                strokeWidth={isFilled ? '0.5' : '1'}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Sparkles right */}
      {showSparkles && (
        <span className="text-amber-400 text-lg animate-pulse select-none -ml-1">
          ✦
        </span>
      )}

      {/* Score badge e.g. "4 / 5" */}
      {showBadge && (
        <span className="ml-1 px-3 py-1 bg-amber-50 border border-amber-200/60 text-slate-800 text-sm font-bold rounded-full shadow-xs">
          {currentVal} / 5
        </span>
      )}
    </div>
  );
};
