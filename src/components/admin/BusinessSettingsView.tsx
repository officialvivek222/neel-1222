import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessSettings } from '../../types';
import { copyToClipboard } from '../../lib/clipboard';
import {
  Store,
  FileText,
  Scissors,
  Phone,
  MapPin,
  Upload,
  Trash2,
  Copy,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Shield,
  Bell,
  Palette,
  Sliders,
  CheckCircle2,
  Lock,
  KeyRound,
  AlertCircle,
  Link2
} from 'lucide-react';
import { NeelHairLogo } from '../common/NeelHairLogo';

export const BusinessSettingsView: React.FC = () => {
  const {
    businessSettings,
    updateBusinessSettings,
    showToast,
    isSupabaseConnected,
    currentUserEmail,
    currentUserRole,
    ownerStatus,
    updatePassword
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'business-details' | 'review-settings' | 'notifications' | 'appearance' | 'security'
  >('business-details');

  // Form local state
  const [formData, setFormData] = useState<BusinessSettings>(businessSettings);
  const [copiedLink, setCopiedLink] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Additional settings state for other subtabs
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [primaryColorTheme, setPrimaryColorTheme] = useState('purple');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const reviewUrl = formData.googleReviewUrl || formData.googleReviewLink || '';

  const handleUrlChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      googleReviewUrl: val,
      googleReviewLink: val
    }));

    const clean = val.trim();
    if (clean && !clean.startsWith('http://') && !clean.startsWith('https://')) {
      setUrlError('URL must begin with https:// or http://');
    } else {
      setUrlError(null);
    }
  };

  const handleChange = (field: keyof BusinessSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlError) {
      showToast('Please fix the Google Review URL before saving', 'error');
      return;
    }
    await updateBusinessSettings(formData);
  };

  const handleDiscard = () => {
    setFormData(businessSettings);
    setUrlError(null);
    showToast('Changes discarded', 'info');
  };

  const handleCopyReviewLink = async () => {
    if (reviewUrl) {
      const success = await copyToClipboard(reviewUrl);
      if (success) {
        setCopiedLink(true);
        showToast('Google review link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } else {
      showToast('No Google Review link entered yet', 'error');
    }
  };

  const handleTestReviewLink = () => {
    const clean = reviewUrl.trim();
    if (!clean) {
      showToast('Please enter a Google Review link first', 'error');
      return;
    }
    window.open(clean, '_blank', 'noopener,noreferrer');
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-3xl p-2 shadow-card border border-slate-100 flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('business-details')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'business-details'
              ? 'bg-purple-50 text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Business Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('review-settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'review-settings'
              ? 'bg-purple-50 text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Review Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-purple-50 text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('appearance')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'appearance'
              ? 'bg-purple-50 text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Appearance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-purple-50 text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>

      {/* SUBTAB 1: BUSINESS DETAILS */}
      {activeSubTab === 'business-details' && (
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Business Information (7 cols on lg) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                      Business Information
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Update your salon details displayed to customers
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Business Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Business Name</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => handleChange('businessName', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Tagline / Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tagline / Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => handleChange('tagline', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Business Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Business Category
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Scissors className="w-4 h-4" />
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-none cursor-pointer"
                      >
                        <option value="Hair Salon / Barber Shop">Hair Salon / Barber Shop</option>
                        <option value="Beauty Parlor &amp; Spa">Beauty Parlor &amp; Spa</option>
                        <option value="Unisex Grooming Lounge">Unisex Grooming Lounge</option>
                        <option value="Nail &amp; Skin Care Studio">Nail &amp; Skin Care Studio</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Contact Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.contactNumber}
                        onChange={(e) => handleChange('contactNumber', e.target.value)}
                        placeholder="+91 87674 70988"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Business Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.businessAddress}
                        onChange={(e) => handleChange('businessAddress', e.target.value)}
                        placeholder="Ozar, Nashik, Maharashtra"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-xs sm:text-sm font-semibold text-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Logo, Google Link & Landing Page Settings (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Card 1: Business Logo */}
              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
                <div className="mb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Business Logo
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    This logo will be shown on your landing page and QR code
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-black p-1 flex items-center justify-center border-2 border-amber-400/80 shadow-sm flex-shrink-0 overflow-hidden">
                    <NeelHairLogo variant="dark" size="sm" showSubtitle={false} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => showToast('New logo uploaded successfully!')}
                        className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload New Logo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => showToast('Reset to default logo', 'info')}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      JPG, PNG (Max 2MB)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Google Review Link Configuration (Dynamic & Live) */}
              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Official Google Review URL
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Customers who tap "Review Us on Google" are dynamically redirected here.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={reviewUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://g.page/r/your-google-place-id"
                      className={`flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border focus:bg-white text-xs font-semibold text-slate-800 transition-all outline-none ${
                        urlError ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleCopyReviewLink}
                      className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                      title="Copy Link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleTestReviewLink}
                      className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all cursor-pointer"
                      title="Test Google Review Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  {urlError && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{urlError}</span>
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400">
                    Format: <code>https://g.page/r/...</code> or <code>https://search.google.com/local/writereview?placeid=...</code>
                  </span>
                </div>
              </div>

              {/* Card 3: Landing Page Settings Toggles */}
              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
                <div className="mb-4">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Landing Page Settings
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Customize what customers see when they scan your QR code
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Toggle 1: Show Google Review Button */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Show Google Review Button
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Let customers give a review on Google
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleChange('showGoogleReviewButton', !formData.showGoogleReviewButton)
                      }
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                        formData.showGoogleReviewButton ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                          formData.showGoogleReviewButton ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Show Feedback Form */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Show Feedback Form
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Collect direct feedback from customers
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleChange('showFeedbackForm', !formData.showFeedbackForm)
                      }
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                        formData.showFeedbackForm ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                          formData.showFeedbackForm ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS (Save & Discard) */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Discard Changes</span>
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 flex items-center gap-2 transition-all duration-200 transform active:scale-[0.98] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 2: REVIEW SETTINGS */}
      {activeSubTab === 'review-settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Review Routing &amp; Filtering Settings
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure how customer ratings are handled and routed
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900">
              <span className="font-bold">Smart Review Filter Active:</span> Customers rating 4 or 5 stars are enthusiastically encouraged to publish on Google Maps, while feedback below 4 stars is captured internally for immediate salon manager resolution.
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Current Google Review URL for Neel Hair
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={reviewUrl || 'No review link configured yet. Paste under Business Details.'}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={handleTestReviewLink}
                className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage alerts for new customer reviews and feedback
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Email Notifications</h4>
                <p className="text-xs text-slate-500">Receive an email immediately when a customer submits new feedback</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailAlerts(!emailAlerts);
                  showToast(`Email notifications ${!emailAlerts ? 'enabled' : 'disabled'}`);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  emailAlerts ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-800">SMS / WhatsApp Alerts</h4>
                <p className="text-xs text-slate-500">Send an instant alert to the salon manager's contact number</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSmsAlerts(!smsAlerts);
                  showToast(`SMS alerts ${!smsAlerts ? 'enabled' : 'disabled'}`);
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  smsAlerts ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${smsAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: APPEARANCE */}
      {activeSubTab === 'appearance' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Brand Styling &amp; Colors
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Customize the look and feel of the customer feedback cards
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { id: 'purple', name: 'Royal Purple', class: 'bg-purple-600' },
              { id: 'gold', name: 'Luxury Gold', class: 'bg-amber-500' },
              { id: 'midnight', name: 'Midnight Navy', class: 'bg-slate-900' },
              { id: 'rose', name: 'Rose Glamour', class: 'bg-rose-500' }
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setPrimaryColorTheme(theme.id);
                  showToast(`Theme changed to ${theme.name}`);
                }}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  primaryColorTheme === theme.id ? 'border-purple-600 bg-purple-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${theme.class} shadow-md`} />
                <span className="text-xs font-bold text-slate-800">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: SECURITY */}
      {activeSubTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Security &amp; Administrative Access
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Registered salon owner credentials and access restrictions
            </p>
          </div>

          {/* Owner Account Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                  <span>Neel Hair Primary Business Owner</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                    {currentUserRole === 'owner' ? '👑 Owner' : '🛡️ Admin Access'}
                  </span>
                </h4>
                <p className="text-xs text-purple-800">
                  Account: <span className="font-semibold">{ownerStatus?.ownerEmail || currentUserEmail || 'salon owner registered'}</span>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
              Bound &amp; Active
            </span>
          </div>

          {/* Access Control Information */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Lock className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Access Restriction Active:</span> Public registrations are locked. Only authorized administrator invitations or the verified Neel Hair owner can access the admin dashboard. {currentUserRole !== 'owner' ? 'As an administrator, business ownership settings are protected and cannot be modified.' : 'You have full owner authority.'}
            </div>
          </div>

          {/* Password Update Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-600" />
              <span>Update Owner Password</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:border-purple-600"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:border-purple-600"
              />
            </div>
            <button
              type="button"
              disabled={isUpdatingPassword}
              onClick={handlePasswordUpdate}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs w-fit transition-all cursor-pointer disabled:opacity-75"
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
