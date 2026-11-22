import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NeelHairLogo } from '../common/NeelHairLogo';
import { ReviewTapBadge } from '../common/ReviewTapBadge';
import { StarRating } from '../common/StarRating';
import {
  MessageSquare,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Scissors,
  Armchair,
  Globe,
  Lock,
  MessageCircle,
  X,
  Send,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { salonServicesList } from '../../data/mockData';

export const CustomerWelcome: React.FC = () => {
  const {
    businessSettings,
    trackGoogleClick,
    setCustomerStep,
    setCurrentView,
    language,
    setLanguage,
    showToast,
    customerRating,
    setCustomerRating,
    isAuthenticated,
    addEnquiry
  } = useApp();

  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryService, setEnquiryService] = useState('Haircut');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const content = {
    EN: {
      title1: 'Thank You',
      title2: 'for Visiting!',
      subtitle: 'Your experience means a lot to us.',
      googleBtn: 'Review Us on Google',
      feedbackBtn: 'Share Your Feedback',
      enquiryBtn: 'Book / Get WhatsApp Quotation',
      feat1: 'Professional Service',
      feat2: 'Experienced Stylists',
      feat3: 'Clean & Hygienic Environment',
      tapStarsPrompt: '★ Tap stars to rate your visit',
      tapStarsTitle: 'Tap stars to rate'
    },
    HI: {
      title1: 'आने के लिए',
      title2: 'हार्दिक धन्यवाद!',
      subtitle: 'आपका अनुभव हमारे लिए बहुत महत्वपूर्ण है।',
      googleBtn: 'गूगल पर रिव्यू दें',
      feedbackBtn: 'फीडबैक साझा करें',
      enquiryBtn: 'व्हाट्सएप कोटेशन और बुकिंग',
      feat1: 'प्रोफेशनल सर्विस',
      feat2: 'अनुभवी स्टाइलिस्ट',
      feat3: 'स्वच्छ और सुरक्षित वातावरण',
      tapStarsPrompt: '★ रेटिंग देने के लिए सितारों पर टैप करें',
      tapStarsTitle: 'रेटिंग देने के लिए सितारों पर टैप करें'
    },
    MR: {
      title1: 'भेट दिल्याबद्दल',
      title2: 'मनःपूर्वक धन्यवाद!',
      subtitle: 'तुमचा अनुभव आमच्यासाठी अत्यंत मोलाचा आहे.',
      googleBtn: 'गुगलवर रिव्ह्यू द्या',
      feedbackBtn: 'अभिप्राय शेअर करा',
      enquiryBtn: 'व्हॉट्सॲप कोटेशन आणि बुकिंग',
      feat1: 'उत्कृष्ट सेवा',
      feat2: 'अनुभवी स्टायलिस्ट',
      feat3: 'स्वच्छ व निर्जंतुक वातावरण',
      tapStarsPrompt: '★ रेटिंग देण्यासाठी ताऱ्यांवर टॅप करा',
      tapStarsTitle: 'रेटिंग देण्यासाठी ताऱ्यांवर टॅप करा'
    }
  }[language];

  const handleGoogleReview = () => {
    trackGoogleClick();
    const targetUrl = (businessSettings.googleReviewUrl || businessSettings.googleReviewLink || '').trim();
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      showToast('Google Review link is being configured by Neel Hair staff.', 'info');
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName.trim() || !enquiryPhone.trim()) {
      showToast('Please enter your name and contact number.', 'error');
      return;
    }
    setIsSubmittingEnquiry(true);
    const res = await addEnquiry({
      customerName: enquiryName.trim(),
      phone: enquiryPhone.trim(),
      service: enquiryService,
      message: enquiryMessage.trim()
    });
    setIsSubmittingEnquiry(false);
    if (res.success) {
      setEnquirySuccess(true);
    }
  };

  const handleResetEnquiry = () => {
    setEnquiryModalOpen(false);
    setEnquirySuccess(false);
    setEnquiryName('');
    setEnquiryPhone('');
    setEnquiryMessage('');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 py-6 overflow-hidden bg-slate-950 font-sans">
      {/* Luxurious Salon Background Image with Dark Vignette Overlay & Fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop')`,
          backgroundColor: '#0a0817'
        }}
      />
      {/* Warm Golden & Dark Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-slate-950/95 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Staff Login / Dashboard on left, Language Selector on right */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-1 pb-3">
        {/* Staff Login / Dashboard pill */}
        <button
          onClick={() => {
            window.location.hash = 'admin';
            setCurrentView('admin');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm hover:border-white/40"
          title={isAuthenticated ? 'Open Admin Dashboard' : 'Staff Login'}
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAuthenticated ? 'Dashboard' : 'Staff Login'}</span>
        </button>

        {/* Language selector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>文A {language}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>
          <div className="absolute right-0 mt-1.5 w-32 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-30">
            {(['EN', 'HI', 'MR'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`w-full text-left px-3.5 py-2 text-xs cursor-pointer font-medium transition-colors ${
                  language === lang
                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {lang === 'EN' ? 'English' : lang === 'HI' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Salon Logo */}
        <div className="mb-4">
          <NeelHairLogo variant="dark" size="lg" />
        </div>

        {/* Customer Review Card */}
        <div className="w-full relative bg-white rounded-[32px] shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden border border-slate-100">
          {/* Golden Ribbon Wave at Top Border */}
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 shadow-sm" />

          {/* Decorative curved header cut */}
          <div className="w-20 h-1 rounded-full bg-amber-400/50 mx-auto mt-1 mb-5" />

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {content.title1} <br />
            <span className="italic font-normal font-serif">{content.title2}</span>
          </h2>

          {/* Golden underline flourish */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent my-3" />

          {/* Subtitle */}
          <p className="text-slate-500 text-sm sm:text-base font-normal max-w-xs mb-5">
            {content.subtitle}
          </p>

          {/* Big Golden Sparkle Stars: tapping a star opens feedback form with that rating selected */}
          <div className="mb-7 cursor-pointer" title={content.tapStarsTitle}>
            <StarRating
              value={customerRating || 5}
              size="lg"
              showSparkles={true}
              interactive={true}
              onChange={(stars) => {
                setCustomerRating(stars);
                setCustomerStep('feedback-form');
              }}
            />
            <p className="text-[11px] text-amber-600 font-semibold mt-2 animate-pulse">
              {content.tapStarsPrompt}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3.5 mb-7">
            {/* Button 1: Review Us on Google */}
            {businessSettings.showGoogleReviewButton && (
              <button
                onClick={handleGoogleReview}
                className="w-full group py-3.5 px-5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg shadow-blue-500/25 flex items-center justify-between transition-all duration-200 transform active:scale-[0.98] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
                  {/* Google 'G' icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span className="flex-1 text-center font-bold tracking-wide">
                  {content.googleBtn}
                </span>
                <ExternalLink className="w-5 h-5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}

            {/* Button 2: Share Your Feedback */}
            {businessSettings.showFeedbackForm && (
              <button
                onClick={() => setCustomerStep('feedback-form')}
                className="w-full group py-3.5 px-5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border-2 border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-between transition-all duration-200 transform active:scale-[0.98] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="flex-1 text-center font-bold text-slate-800">
                  {content.feedbackBtn}
                </span>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Button 3: Book / Get WhatsApp Quotation */}
            <button
              onClick={() => setEnquiryModalOpen(true)}
              className="w-full group py-3 px-5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-between transition-all duration-200 transform active:scale-[0.98] cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="flex-1 text-center font-bold">
                {content.enquiryBtn}
              </span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-slate-100 mb-6" />

          {/* Three Feature Pillars */}
          <div className="w-full grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center text-center p-1">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 shadow-xs">
                <Armchair className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {content.feat1}
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-1 border-x border-slate-100">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 shadow-xs">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {content.feat2}
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-1">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {content.feat3}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 pt-6 pb-2 flex items-center justify-center">
        <ReviewTapBadge theme="dark" />
      </div>

      {/* Customer Enquiry & WhatsApp Booking Modal */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative text-left">
            <button
              onClick={handleResetEnquiry}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!enquirySuccess ? (
              <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Service Enquiry &amp; Quotation
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Get custom quotation and booking via WhatsApp
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    placeholder="e.g. Rahul Patil"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    placeholder="e.g. +91 98220 12345"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Service Interested In
                  </label>
                  <select
                    value={enquiryService}
                    onChange={(e) => setEnquiryService(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all"
                  >
                    {salonServicesList.map((svc) => (
                      <option key={svc} value={svc}>
                        {svc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Preferred Time / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="e.g. Tomorrow afternoon around 4 PM..."
                    className="w-full px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 text-xs sm:text-sm font-medium text-slate-800 outline-none resize-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEnquiry}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 disabled:opacity-75"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingEnquiry ? 'Sending...' : 'Request Quotation on WhatsApp'}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  Enquiry Received!
                </h3>
                <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
                  Thank you, <strong className="text-slate-800">{enquiryName}</strong>! Neel Hair salon team has received your enquiry for <strong className="text-slate-800">{enquiryService}</strong> and will reach out with your quotation.
                </p>

                <div className="w-full flex flex-col gap-2">
                  <a
                    href={`https://wa.me/919922344401?text=${encodeURIComponent(
                      `Hi Neel Hair! I submitted an enquiry for ${enquiryService}. My name is ${enquiryName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat Directly with Neel Hair</span>
                  </a>

                  <button
                    onClick={handleResetEnquiry}
                    className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
