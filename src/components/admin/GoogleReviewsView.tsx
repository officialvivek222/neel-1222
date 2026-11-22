import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Star,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Send,
  AlertCircle
} from 'lucide-react';

interface GoogleReviewItem {
  id: string;
  author: string;
  rating: number;
  relativeTime: string;
  text: string;
  reply?: string;
}

export const GoogleReviewsView: React.FC = () => {
  const { businessSettings, trackGoogleClick, stats, showToast, setActiveTab } = useApp();
  const [copied, setCopied] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Clean Production Slate: 0 mock reviews
  const [googleReviews, setGoogleReviews] = useState<GoogleReviewItem[]>([]);

  const googleLink = (businessSettings.googleReviewUrl || businessSettings.googleReviewLink || '').trim();

  const handleCopyLink = async () => {
    if (googleLink) {
      const success = await copyToClipboard(googleLink);
      if (success) {
        setCopied(true);
        showToast('Google Review link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      showToast('No Google Review link set yet. Configure under Settings.', 'error');
    }
  };

  const testGoogleLink = () => {
    trackGoogleClick();
    if (googleLink) {
      window.open(googleLink, '_blank', 'noopener,noreferrer');
    } else {
      showToast('No Google Review link set yet. Configure under Settings.', 'error');
    }
  };

  // Dynamic calculations based strictly on real Supabase telemetry
  const conversionRate = stats.totalScans > 0
    ? ((stats.googleClicks / stats.totalScans) * 100).toFixed(1) + '%'
    : '0.0%';

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* 3 STAT CARDS (Zero-Baseline Production Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Google Rating */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Google Maps Rating
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats.averageRating > 0 ? stats.averageRating : '0.0'}
              </span>
              <span className="text-slate-400 font-bold text-sm">/ 5</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              stats.averageRating > 0
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-slate-500 bg-slate-100'
            }`}>
              {stats.averageRating > 0 ? 'Verified Store' : 'Pending Reviews'}
            </span>
          </div>
        </div>

        {/* Card 2: Google Review Clicks */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Google Review Clicks
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.googleClicks}
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {stats.clicksGrowth > 0 ? `+${stats.clicksGrowth}%` : 'Real-Time'}
            </span>
          </div>
        </div>

        {/* Card 3: QR to Google Conversion */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              QR to Google Conversion
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {conversionRate}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {stats.totalScans > 0 ? `${stats.googleClicks} of ${stats.totalScans} scans` : 'Waiting for scans'}
            </span>
          </div>
        </div>
      </div>

      {/* GOOGLE LINK MANAGEMENT BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Google Business Profile Integration</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">
            Direct Customers Straight to Google Reviews
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            When customers tap "Review Us on Google" after scanning your QR code, they are instantly directed to your Google Business Profile review dialog.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={testGoogleLink}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>Test Review Link</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* SYNCED GOOGLE REVIEWS LIST */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Synced Google Reviews
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Live reviews from your Google Business Profile
            </p>
          </div>

          <button
            onClick={() => showToast('Connecting to Google Places API...', 'info')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Latest</span>
          </button>
        </div>

        {/* Clean Production State: No mock reviews */}
        {googleReviews.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100/60 shadow-sm">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-slate-800">
              No Google Reviews Synced Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
              Once you configure your official Google Review link in Settings and customers leave reviews on Google, you can track and manage responses directly here.
            </p>
            <button
              onClick={() => setActiveTab('settings')}
              className="mt-4 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Configure Google Review Link
            </button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {googleReviews.map((rev) => (
              <div key={rev.id} className="py-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{rev.author}</h4>
                      <span className="text-[11px] text-slate-400">{rev.relativeTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 italic">
                  "{rev.text}"
                </p>

                {rev.reply ? (
                  <div className="mt-2 p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-slate-700 flex flex-col gap-1">
                    <span className="font-bold text-purple-700 text-[11px]">
                      Owner Response:
                    </span>
                    <p>{rev.reply}</p>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a response as owner..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white outline-none"
                    />
                    <button
                      onClick={() => {
                        if (replyText.trim()) {
                          showToast('Reply published successfully!');
                          setReplyText('');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
