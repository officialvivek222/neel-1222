import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NeelHairLogo } from '../common/NeelHairLogo';
import { ReviewTapBadge } from '../common/ReviewTapBadge';
import { StarRating } from '../common/StarRating';
import { salonServicesList } from '../../data/mockData';
import {
  ChevronLeft,
  CheckCircle2,
  Scissors,
  MessageSquare,
  Send,
  ChevronDown,
  User,
  Phone,
  Loader2
} from 'lucide-react';

export const CustomerFeedbackForm: React.FC = () => {
  const { addFeedback, setCustomerStep, language, customerRating } = useApp();

  const [rating, setRating] = useState<number>(customerRating || 0);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [service, setService] = useState<string>('Haircut');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const t = {
    EN: {
      title: 'Share Your Feedback',
      subtitle: 'Tell us about your experience at Neel Hair.',
      rateLabel: 'Rate Your Experience',
      serviceLabel: 'Service Received',
      nameLabel: 'Name',
      optional: '(Optional)',
      namePlaceholder: 'e.g. Rohan Patil',
      phoneLabel: 'Phone',
      phonePlaceholder: 'e.g. +91 98220...',
      phoneInvalid: 'Please enter a valid phone number (at least 10 digits)',
      feedbackLabel: 'Your Feedback',
      feedbackPlaceholder: 'How was your experience? (Optional)',
      submitBtn: 'Submit Feedback',
      submittingBtn: 'Submitting Feedback...',
      tapStarsToRate: 'Tap stars to rate',
      pleaseSelectRating: 'Please select a rating',
      services: {
        'Haircut': 'Haircut',
        'Beard Trim': 'Beard Trim',
        'Hair Styling': 'Hair Styling',
        'Hair Color': 'Hair Color',
        'Facial & Spa': 'Facial & Spa',
        'Head Massage': 'Head Massage',
        'Groom Package': 'Groom Package',
        'Hair Treatment / Spa': 'Hair Treatment / Spa'
      }
    },
    HI: {
      title: 'फीडबैक साझा करें',
      subtitle: 'नील हेयर में अपने अनुभव के बारे में बताएं।',
      rateLabel: 'अपना अनुभव रेट करें',
      serviceLabel: 'प्राप्त सेवा चुनें',
      nameLabel: 'नाम',
      optional: '(वैकल्पिक)',
      namePlaceholder: 'उदा. रोहन पाटिल',
      phoneLabel: 'फ़ोन नंबर',
      phonePlaceholder: 'उदा. 9822012345',
      phoneInvalid: 'कृपया वैध 10 अंकों का फोन नंबर दर्ज करें',
      feedbackLabel: 'आपकी प्रतिक्रिया',
      feedbackPlaceholder: 'आपका अनुभव कैसा रहा? (वैकल्पिक)',
      submitBtn: 'फीडबैक सबमिट करें',
      submittingBtn: 'सबमिट हो रहा है...',
      tapStarsToRate: 'रेटिंग देने के लिए सितारों पर टैप करें',
      pleaseSelectRating: 'कृपया रेटिंग चुनें',
      services: {
        'Haircut': 'हेयरकट (Haircut)',
        'Beard Trim': 'दाढ़ी ट्रिम (Beard Trim)',
        'Hair Styling': 'हेयर स्टाइलिंग (Hair Styling)',
        'Hair Color': 'हेयर कलर (Hair Color)',
        'Facial & Spa': 'फेशियल और स्पा (Facial & Spa)',
        'Head Massage': 'हेड मसाज (Head Massage)',
        'Groom Package': 'ग्रूम पैकेज (Groom Package)',
        'Hair Treatment / Spa': 'हेयर ट्रीटमेंट / स्पा'
      }
    },
    MR: {
      title: 'अभिप्राय शेअर करा',
      subtitle: 'नील हेअरमधील आपल्या अनुभवाबद्दल सांगा.',
      rateLabel: 'आपला अनुभव रेट करा',
      serviceLabel: 'घेतलेली सेवा निवडा',
      nameLabel: 'नाव',
      optional: '(ऐच्छिक)',
      namePlaceholder: 'उदा. रोहन पाटील',
      phoneLabel: 'फोन नंबर',
      phonePlaceholder: 'उदा. 9822012345',
      phoneInvalid: 'कृपया वैध 10 अंकी फोन नंबर प्रविष्ट करा',
      feedbackLabel: 'तुमचा अभिप्राय',
      feedbackPlaceholder: 'आपला अनुभव कसा होता? (ऐच्छिक)',
      submitBtn: 'अभिप्राय पाठवा',
      submittingBtn: 'पाठवत आहे...',
      tapStarsToRate: 'रेटिंग देण्यासाठी ताऱ्यांवर टॅप करा',
      pleaseSelectRating: 'कृपया रेटिंग निवडा',
      services: {
        'Haircut': 'हेअरकट (Haircut)',
        'Beard Trim': 'दाढी ट्रिम (Beard Trim)',
        'Hair Styling': 'हेअर स्टायलिंग (Hair Styling)',
        'Hair Color': 'हेअर कलर (Hair Color)',
        'Facial & Spa': 'फेशियल आणि स्पा (Facial & Spa)',
        'Head Massage': 'हेड मसाज (Head Massage)',
        'Groom Package': 'ग्रूम पॅकेज (Groom Package)',
        'Hair Treatment / Spa': 'हेअर ट्रीटमेंट / स्पा'
      }
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!rating || rating < 1) {
      setRatingError(t.pleaseSelectRating);
      return;
    }
    setRatingError(null);

    // Validate phone if entered
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (cleanPhone && !/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
      setPhoneError(t.phoneInvalid);
      return;
    }
    setPhoneError(null);

    setIsSubmitting(true);
    try {
      await addFeedback({
        customerName: customerName.trim() || 'Guest Customer',
        rating,
        service,
        feedbackText: feedbackText.trim(),
        phone: cleanPhone || undefined
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 py-6 overflow-hidden bg-slate-950 font-sans">
      {/* Background with luxury salon image & fallback */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop')`,
          backgroundColor: '#0a0817'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/95 pointer-events-none" />

      {/* Top Header Row with Back Button and Centered Logo */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-1 pb-3">
        <button
          onClick={() => setCustomerStep('landing')}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-sm cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex justify-center -mr-10">
          <NeelHairLogo variant="dark" size="sm" showSubtitle={false} />
        </div>
      </div>

      {/* Main Feedback Form Card */}
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="w-full relative bg-white rounded-[32px] shadow-2xl p-6 sm:p-8 flex flex-col border border-slate-100 overflow-hidden">
          {/* Golden Ribbon Wave at Top Border */}
          <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 shadow-sm" />

          {/* Title and subtitle */}
          <div className="text-center mt-2 mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.title}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Field 1: Rate Your Experience */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-slate-900" />
                <span>{t.rateLabel} *</span>
              </label>

              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border ${ratingError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-100'}`}>
                <StarRating
                  value={rating}
                  onChange={(val) => {
                    setRating(val);
                    setRatingError(null);
                  }}
                  interactive={true}
                  size="md"
                  showBadge={rating > 0}
                />
                {rating === 0 && (
                  <span className="text-xs text-slate-400 font-medium">{t.tapStarsToRate}</span>
                )}
              </div>
              {ratingError && (
                <p className="text-xs text-rose-600 font-bold px-1 animate-in fade-in">
                  {ratingError}
                </p>
              )}
            </div>

            {/* Field 2: Service Received */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Scissors className="w-4 h-4 text-slate-900" />
                <span>{t.serviceLabel}</span>
              </label>

              <div className="relative">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-slate-800 text-sm font-semibold transition-all outline-none cursor-pointer"
                >
                  {salonServicesList.map((svc) => (
                    <option key={svc} value={svc}>
                      {(t.services as Record<string, string>)[svc] || svc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 3: Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.nameLabel} <span className="text-[10px] font-normal text-slate-400">{t.optional}</span></span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  maxLength={60}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 text-slate-800 text-xs transition-all outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.phoneLabel} <span className="text-[10px] font-normal text-slate-400">{t.optional}</span></span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder={t.phonePlaceholder}
                  maxLength={16}
                  className={`w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border text-slate-800 text-xs transition-all outline-none ${
                    phoneError ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-100'
                  }`}
                />
                {phoneError && (
                  <p className="text-[10px] text-rose-500 font-medium mt-0.5">{phoneError}</p>
                )}
              </div>
            </div>

            {/* Field 4: Your Feedback */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <MessageSquare className="w-4 h-4 text-slate-900" />
                <span>{t.feedbackLabel}</span>
              </label>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={t.feedbackPlaceholder}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-slate-800 text-sm transition-all outline-none resize-none placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2.5 transition-all duration-200 transform active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>{t.submittingBtn}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 transform -rotate-12" />
                  <span>{t.submitBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 pt-5 pb-2">
        <ReviewTapBadge theme="dark" />
      </div>
    </div>
  );
};
