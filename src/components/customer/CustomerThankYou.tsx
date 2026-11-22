import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NeelHairLogo } from '../common/NeelHairLogo';
import { ReviewTapBadge } from '../common/ReviewTapBadge';
import { StarRating } from '../common/StarRating';
import { Home } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CustomerThankYou: React.FC = () => {
  const { setCustomerStep, language, customerRating } = useApp();

  const t = {
    EN: {
      title: 'Thank You!',
      subtitle: 'Your feedback has been successfully submitted.',
      appreciation: 'We appreciate your time and valuable feedback.',
      backHome: 'Back to Home'
    },
    HI: {
      title: 'धन्यवाद!',
      subtitle: 'आपका फीडबैक सफलतापूर्वक सबमिट हो गया है।',
      appreciation: 'हम आपके बहुमूल्य समय और सुझाव की सराहना करते हैं।',
      backHome: 'होम पेज पर वापस जाएं'
    },
    MR: {
      title: 'धन्यवाद!',
      subtitle: 'तुमचा अभिप्राय यशस्वीरीत्या सबमिट झाला आहे.',
      appreciation: 'आम्ही तुमच्या मौल्यवान वेळ आणि अभिप्रायाची कदर करतो.',
      backHome: 'होम पेजवर परत जा'
    }
  }[language];

  useEffect(() => {
    // Only fire confetti when rating is 3, 4, or 5 stars (turned off for 1 or 2 stars)
    const ratingVal = customerRating ?? 5;
    if (ratingVal <= 2) {
      return;
    }

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6']
      });
    } catch {
      // safe fallback if canvas is not ready
    }
  }, [customerRating]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 py-6 overflow-hidden bg-slate-950 font-sans">
      {/* Background salon atmosphere */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop')`,
          backgroundColor: '#0a0817'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/95 pointer-events-none" />

      {/* Header Logo */}
      <div className="relative z-10 w-full max-w-md flex justify-center pt-2 pb-4">
        <NeelHairLogo variant="dark" size="md" />
      </div>

      {/* Main Success Card */}
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="w-full relative bg-white rounded-[32px] shadow-2xl p-7 sm:p-9 flex flex-col items-center text-center border border-slate-100 overflow-hidden">
          {/* Golden Ribbon Wave at Top Border */}
          <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 shadow-sm" />

          {/* Celebratory Green Checkmark with Sunburst Accent Rays */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Burst rays */}
            <div className="absolute -inset-4 flex items-center justify-center pointer-events-none opacity-80">
              <span className="absolute -top-3 w-1.5 h-3 bg-emerald-400 rounded-full rotate-0" />
              <span className="absolute -bottom-3 w-1.5 h-3 bg-emerald-400 rounded-full rotate-0" />
              <span className="absolute -left-3 w-3 h-1.5 bg-emerald-400 rounded-full" />
              <span className="absolute -right-3 w-3 h-1.5 bg-emerald-400 rounded-full" />
              <span className="absolute -top-2 -left-2 w-2.5 h-1 bg-emerald-300 rounded-full -rotate-45" />
              <span className="absolute -top-2 -right-2 w-2.5 h-1 bg-emerald-300 rounded-full rotate-45" />
              <span className="absolute -bottom-2 -left-2 w-2.5 h-1 bg-emerald-300 rounded-full rotate-45" />
              <span className="absolute -bottom-2 -right-2 w-2.5 h-1 bg-emerald-300 rounded-full -rotate-45" />
            </div>

            {/* Green Circle Badge */}
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-emerald-100">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            {t.title}
          </h2>

          {/* Golden flourish */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent my-3" />

          {/* Subtitle */}
          <p className="text-slate-600 text-base font-medium max-w-xs mb-5 leading-snug">
            {t.subtitle}
          </p>

          {/* 5 Golden Stars in Speech Bubble Box */}
          <div className="relative bg-amber-50/80 border border-amber-200/80 rounded-2xl px-5 py-3 mb-5 flex items-center justify-center">
            {/* Sparkle burst decoration */}
            <span className="text-amber-500 text-sm absolute -top-2 -left-2">✦</span>
            <span className="text-amber-500 text-sm absolute -top-2 -right-2">✦</span>

            <StarRating
              value={customerRating || 5}
              size="md"
              interactive={false}
              showSparkles={false}
            />
          </div>

          <p className="text-slate-500 text-sm max-w-xs mb-8">
            {t.appreciation}
          </p>

          {/* Back to Home Button */}
          <button
            onClick={() => setCustomerStep('landing')}
            className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-blue-50/50 text-blue-600 font-bold text-base border-2 border-blue-500 hover:border-blue-600 shadow-sm flex items-center justify-center gap-2.5 transition-all duration-200 transform active:scale-[0.98] cursor-pointer"
          >
            <Home className="w-5 h-5 text-blue-600" />
            <span>{t.backHome}</span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 pt-6 pb-2">
        <ReviewTapBadge theme="dark" />
      </div>
    </div>
  );
};
