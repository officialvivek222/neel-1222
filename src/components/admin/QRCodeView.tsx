import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { QRStyle } from '../../types';
import QRCodeLib from 'qrcode';
import {
  Download,
  Share2,
  Copy,
  RotateCcw,
  Upload,
  Check,
  TrendingUp,
  Printer,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { NeelHairLogo } from '../common/NeelHairLogo';

import { copyToClipboard } from '../../lib/clipboard';

// Helper to draw rounded rect with fallback for older browsers
const safeRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
};

export const QRCodeView: React.FC = () => {
  const {
    businessSettings,
    updateBusinessSettings,
    stats,
    showToast,
    setCurrentView
  } = useApp();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const destination = businessSettings.qrDestinationUrl || window.location.origin;

  // Generate dynamic QR code whenever destination or style changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCodeLib.toDataURL(destination, {
          width: 480,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H' // High redundancy allows center logo overlay
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    };

    generateQR();
  }, [destination, businessSettings.qrStyle]);

  // Handle Download QR code as PNG image
  const handleDownloadQR = () => {
    if (!qrDataUrl) return;

    // Create a composite canvas with Neel Hair center logo and branding
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = '#ffffff';
    safeRoundRect(ctx, 0, 0, 600, 700, 24);
    ctx.fill();

    // Golden header ribbon
    const goldGrad = ctx.createLinearGradient(0, 0, 600, 0);
    goldGrad.addColorStop(0, '#fde047');
    goldGrad.addColorStop(0.5, '#eab308');
    goldGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 0, 600, 16);

    // Salon title text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText(businessSettings.businessName, 300, 70);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SCAN TO REVIEW & GIVE FEEDBACK', 300, 95);

    // Load QR Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw QR image
      ctx.drawImage(img, 75, 120, 450, 450);

      // Draw Center Logo badge
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      safeRoundRect(ctx, 250, 295, 100, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.stroke();

      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';

      const finalizeDownload = () => {
        // Footer
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText('Powered by ReviewTap • www.reviewtap.in', 300, 640);

        // Trigger download
        const link = document.createElement('a');
        link.download = `${businessSettings.businessName.replace(/\s+/g, '_')}_QR_Code.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('QR Code image downloaded successfully!');
      };

      logoImg.onload = () => {
        // Center the 3:4 aspect ratio logo within the 100x100 badge (width: 68px, height: 90px)
        ctx.drawImage(logoImg, 266, 300, 68, 90);
        finalizeDownload();
      };
      logoImg.onerror = () => {
        finalizeDownload();
      };
      logoImg.src = '/neel-hair-logo.jpg';
    };
    img.src = qrDataUrl;
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(destination);
    if (success) {
      setCopied(true);
      showToast('Destination URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast('Could not copy link', 'error');
    }
  };

  const qrStyles: { id: QRStyle; label: string; icon: string }[] = [
    { id: 'classic', label: 'Classic', icon: '■ ■\n■ ■' },
    { id: 'dots', label: 'Dots', icon: '● ●\n● ●' },
    { id: 'rounded', label: 'Rounded', icon: '▢ ▢\n▢ ▢' },
    { id: 'circle', label: 'Target', icon: '◎ ◎\n◎ ◎' },
  ];

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* 2 MAIN COLUMNS: Left QR Preview & Right Management Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Your Review QR Code (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left mb-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              Your Review QR Code
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Customers can scan this QR to share feedback or leave a Google review.
            </p>
          </div>

          {/* QR CODE CONTAINER WITH PURPLE CORNER BRACKETS */}
          <div className="relative p-6 sm:p-8 my-auto flex items-center justify-center">
            {/* 4 Thick Purple Corner Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-600 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-600 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-600 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-600 rounded-br-xl" />

            {/* QR Image Frame */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 bg-white p-2 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Review QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />
              )}

              {/* Center Logo Square (Neel Hair) */}
              <div className="absolute inset-0 m-auto w-14 h-14 bg-black rounded-xl flex items-center justify-center p-0.5 border-2 border-amber-400 shadow-lg overflow-hidden">
                <NeelHairLogo variant="dark" size="sm" showSubtitle={false} />
              </div>
            </div>
          </div>

          {/* Actions: Download QR & Share Link */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-8">
            <button
              onClick={handleDownloadQR}
              className="w-full flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download QR</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>Share Link</span>
            </button>
          </div>

          {/* Counter Tent Card Preview Button */}
          <button
            onClick={() => setPrintModalOpen(true)}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-purple-700 hover:text-purple-800 hover:underline cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Salon Counter Tent Card</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Performance, Customization & Destination (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: QR Performance */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                QR Performance
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                How your QR code is performing
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Scans */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">Total Scans</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {stats.totalScans.toLocaleString()}
                  </span>
                  {stats.totalScans > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{stats.scansGrowth}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                      <span>Live</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Google Clicks */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">Google Clicks</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {stats.googleClicks.toLocaleString()}
                  </span>
                  {stats.googleClicks > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{stats.clicksGrowth}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span>Live</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback Received */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500">Feedback Received</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {stats.feedbackReceived.toLocaleString()}
                  </span>
                  {stats.feedbackReceived > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{stats.feedbackGrowth}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                      <span>Live</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: QR Customization */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  QR Customization
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Customize how your QR code looks
                </p>
              </div>

              <button
                onClick={() => {
                  updateBusinessSettings({ qrStyle: 'classic' });
                  showToast('QR styling reset to default', 'info');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Center Logo */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">
                  Center Logo
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-black p-1 flex items-center justify-center border border-amber-400/80 shadow-xs flex-shrink-0 overflow-hidden">
                    <NeelHairLogo variant="dark" size="sm" showSubtitle={false} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => showToast('Logo updated successfully!')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Logo</span>
                    </button>
                    <span className="text-[10px] text-slate-400">JPG, PNG (Max 2MB)</span>
                  </div>
                </div>
              </div>

              {/* QR Style Options */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700">
                  QR Style
                </label>
                <div className="flex items-center gap-2">
                  {qrStyles.map((st) => {
                    const isSelected = businessSettings.qrStyle === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => updateBusinessSettings({ qrStyle: st.id })}
                        className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-mono text-[10px] font-bold border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                        }`}
                        title={st.label}
                      >
                        <span className="whitespace-pre leading-none">{st.icon}</span>
                        {isSelected && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] ring-2 ring-white">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: QR Destination */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
            <div className="mb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                QR Destination
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Choose where the QR will take customers
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) =>
                    updateBusinessSettings({ qrDestinationUrl: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white text-xs sm:text-sm font-semibold text-slate-800 transition-all outline-none"
                />
              </div>

              <button
                onClick={handleCopyLink}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SALON COUNTER TENT CARD MODAL */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative text-center">
            <button
              onClick={() => setPrintModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Tent Card Mock */}
            <div className="p-6 rounded-3xl bg-slate-950 text-white border-2 border-amber-400/80 shadow-xl mb-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500" />
              <NeelHairLogo variant="dark" size="md" />

              <h4 className="font-serif text-lg font-bold text-amber-300 mt-4">
                Scan to Review Us!
              </h4>
              <p className="text-xs text-slate-300 mb-4">
                Share your feedback or give us a Google rating
              </p>

              <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto shadow-inner flex items-center justify-center">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Printable QR"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <p className="text-[10px] text-amber-400 font-semibold tracking-widest uppercase mt-4">
                Thank you for your visit!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  window.print();
                  setPrintModalOpen(false);
                }}
                className="flex-1 py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Stand Display</span>
              </button>

              <button
                onClick={() => setPrintModalOpen(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
