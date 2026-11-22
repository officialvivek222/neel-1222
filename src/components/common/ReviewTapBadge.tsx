import React from 'react';

interface ReviewTapBadgeProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export const ReviewTapBadge: React.FC<ReviewTapBadgeProps> = ({
  className = '',
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs select-none ${className}`}>
      <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>
        Powered by
      </span>
      <div className="inline-flex items-center gap-1">
        {/* Blue Star Logo */}
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-sm">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
        <span className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Review<span className="text-blue-500">Tap</span>
        </span>
      </div>
    </div>
  );
};
