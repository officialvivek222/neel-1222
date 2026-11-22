import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  MessageSquare,
  Star,
  TrendingUp,
  Download,
  Settings,
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { stats, feedbackList, setActiveTab, clearAllAnalytics } = useApp();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // SVG Chart Geometry for Activity Over Time
  const points = stats.activityData && stats.activityData.length > 0
    ? stats.activityData
    : [
        { date: 'Apr 1', qrScans: 0, googleClicks: 0 },
        { date: 'Apr 30', qrScans: 0, googleClicks: 0 }
      ];
  const width = 640;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  // Calculate dynamic chart ceiling based on real activity data
  const highestCount = Math.max(
    ...points.map((p) => Math.max(p.qrScans, p.googleClicks)),
    4
  );
  const maxVal = Math.max(10, Math.ceil((highestCount * 1.25) / 5) * 5);

  const gridSteps = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0
  ];

  const getX = (index: number) => {
    const divisor = Math.max(1, points.length - 1);
    return paddingX + (index / divisor) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    return height - paddingY - (val / maxVal) * (height - paddingY * 2);
  };

  // Build smooth bezier curves
  const buildSmoothPath = (valKey: 'qrScans' | 'googleClicks') => {
    if (points.length < 2) return '';
    const pts = points.map((p, i) => ({ x: getX(i), y: getY(p[valKey]) }));
    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const pathQr = buildSmoothPath('qrScans');
  const pathGoogle = buildSmoothPath('googleClicks');

  const areaQr = `${pathQr} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;
  const areaGoogle = `${pathGoogle} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* 4 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total QR Scans */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total QR Scans
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalScans.toLocaleString()}
            </span>
            {stats.totalScans > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>+{stats.scansGrowth}%</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                <span>Live</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Google Review Clicks */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Google Review Clicks
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {/* Google G icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.googleClicks.toLocaleString()}
            </span>
            {stats.googleClicks > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>+{stats.clicksGrowth}%</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>Live</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Feedback Received */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Feedback Received
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.feedbackReceived.toLocaleString()}
            </span>
            {stats.feedbackReceived > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>+{stats.feedbackGrowth}%</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <span>Live</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Average Store Rating */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between hover:shadow-card-hover transition-all">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Store Rating
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.averageRating}
              </span>
              <span className="text-slate-400 font-bold text-sm">/ 5</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              ({stats.feedbackReceived} feedbacks)
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Activity Over Time Chart & Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Over Time (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Activity Over Time
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                QR scans vs Google review redirects
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-purple-600 shadow-xs" />
                <span>QR Scans</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-xs" />
                <span>Google Clicks</span>
              </div>
            </div>
          </div>

          {/* Responsive SVG Chart or Clean Zero Baseline */}
          {stats.totalScans === 0 && stats.googleClicks === 0 ? (
            <div className="relative w-full h-[220px] rounded-2xl bg-gradient-to-b from-purple-50/40 via-white to-slate-50/60 border border-dashed border-purple-200/80 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center mb-3 shadow-inner">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                Ready for Live Customer Activity
              </h4>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                No QR scans or Google review clicks recorded yet. As soon as clients scan your salon QR code or tap &quot;Review on Google&quot;, real-time performance analytics will dynamically plot here.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 bg-white px-3 py-1 rounded-full border border-purple-100 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Telemetry Engine Ready</span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-[220px]">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Dynamic Grid Lines & Values */}
                {gridSteps.map((val) => (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={getY(val)}
                      x2={width - paddingX}
                      y2={getY(val)}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 10}
                      y={getY(val) + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-medium"
                    >
                      {val}
                    </text>
                  </g>
                ))}

                {/* Gradient Areas */}
                <path d={areaQr} fill="url(#purpleGrad)" />
                <path d={areaGoogle} fill="url(#cyanGrad)" />

                {/* Paths */}
                <path
                  d={pathQr}
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d={pathGoogle}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data points & hover triggers */}
                {points.map((p, i) => {
                  const x = getX(i);
                  const yQr = getY(p.qrScans);
                  const yG = getY(p.googleClicks);
                  const isHovered = hoveredPoint === i;

                  return (
                    <g
                      key={p.date}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Vertical guideline on hover */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={height - paddingY}
                          stroke="#c4b5fd"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* QR Point */}
                      <circle
                        cx={x}
                        cy={yQr}
                        r={isHovered ? 6 : 4}
                        fill="#7c3aed"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />

                      {/* Google Point */}
                      <circle
                        cx={x}
                        cy={yG}
                        r={isHovered ? 6 : 4}
                        fill="#06b6d4"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />

                      {/* X axis date labels */}
                      <text
                        x={x}
                        y={height - 8}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-500 font-semibold"
                      >
                        {p.date}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint !== null && (
                <div
                  className="absolute -top-1 bg-slate-900/95 text-white text-[11px] rounded-xl px-3 py-2 shadow-xl backdrop-blur-xs pointer-events-none transform -translate-x-1/2 z-20 flex flex-col gap-1 border border-slate-700"
                  style={{
                    left: `${(getX(hoveredPoint) / width) * 100}%`,
                  }}
                >
                  <span className="font-bold text-amber-300">
                    {points[hoveredPoint].date}
                  </span>
                  <span className="text-purple-300">
                    QR Scans: {points[hoveredPoint].qrScans}
                  </span>
                  <span className="text-cyan-300">
                    Google Clicks: {points[hoveredPoint].googleClicks}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating Distribution (Store Feedback) (1 col on lg) */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Rating Distribution
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Store feedback breakdown
            </p>
          </div>

          <div className="my-4 flex flex-col gap-3">
            {stats.ratingBreakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-2.5 text-xs">
                <span className="w-6 font-bold text-slate-700 flex items-center gap-1">
                  {row.stars} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                </span>

                {/* Progress track */}
                <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>

                {/* Stats */}
                <span className="w-16 text-right font-semibold text-slate-600">
                  {row.percentage}% <span className="text-slate-400">({row.count})</span>
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Total Rated Responses</span>
            <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              {stats.feedbackReceived} Reviews
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Recent Feedback list & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Feedback List (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Recent Feedback
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Latest customer responses received
              </p>
            </div>

            <button
              onClick={() => setActiveTab('feedback')}
              className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feedback items */}
          <div className="flex flex-col divide-y divide-slate-100">
            {feedbackList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No customer feedback recorded yet.
              </div>
            ) : (
              feedbackList.slice(0, 3).map((item) => (
              <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Customer Avatar Circle */}
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    {item.customerAvatar || item.customerName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {item.customerName}
                      </span>
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {item.service}
                      </span>
                    </div>

                    {/* Star row */}
                    <div className="flex items-center gap-1 my-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 font-normal line-clamp-2">
                      "{item.feedbackText}"
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                  {item.createdAt}
                </span>
              </div>
            )))}
          </div>
        </div>

        {/* Quick Actions (1 col on lg) */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Quick Actions
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Common tasks &amp; shortcuts
            </p>
          </div>

          <div className="my-auto flex flex-col gap-3 py-4">
            {/* Download QR Card */}
            <button
              onClick={() => setActiveTab('qr-code')}
              className="w-full p-4 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-100 transition-all flex items-center gap-3.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Download QR Code
                </h4>
                <p className="text-xs text-slate-500">Print / Share review QR</p>
              </div>
            </button>

            {/* Update Details Card */}
            <button
              onClick={() => setActiveTab('settings')}
              className="w-full p-4 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 transition-all flex items-center gap-3.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Update Details
                </h4>
                <p className="text-xs text-slate-500">Salon Info, Review Link</p>
              </div>
            </button>

            {/* Reset Telemetry Data (One-Click Clean Slate) */}
            <button
              onClick={async () => {
                if (window.confirm('Reset all QR scans and Google review clicks to 0 for a fresh production launch?')) {
                  await clearAllAnalytics();
                }
              }}
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/70 border border-slate-200/80 hover:border-rose-200 transition-all flex items-center gap-3.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 group-hover:bg-rose-600 text-slate-700 group-hover:text-white flex items-center justify-center shadow-xs transition-colors">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-900 transition-colors">
                  Reset Telemetry Data
                </h4>
                <p className="text-xs text-slate-500">Clear past scans &amp; clicks</p>
              </div>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-emerald-900 font-medium">
              Live Supabase Cloud Sync active &amp; connected!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
