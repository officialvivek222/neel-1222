import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NeelHairLogo } from '../common/NeelHairLogo';
import { ReviewTapBadge } from '../common/ReviewTapBadge';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  BarChart2,
  MessageSquare,
  QrCode,
  Settings,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Check
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const {
    login,
    registerOwner,
    registerAdminWithInvitation,
    resetPassword,
    updatePassword,
    setCurrentView,
    showToast,
    ownerStatus,
    checkOwnerStatus,
    isPasswordResetFlow,
    setIsPasswordResetFlow
  } = useApp();

  // Mode: 'login' | 'register' | 'forgot' | 'reset-password'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset-password'>('login');

  // Login inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot password input
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Reset password inputs
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkOwnerStatus();
  }, [authMode]);

  useEffect(() => {
    if (isPasswordResetFlow) {
      setAuthMode('reset-password');
    }
  }, [isPasswordResetFlow]);

  // Handle URL hash navigation (e.g. #register, #login)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#register') {
        setAuthMode('register');
      } else if (hash.includes('type=recovery') || hash === '#reset-password') {
        setAuthMode('reset-password');
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!regFullName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long for security.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const isOwnerRegistered = Boolean(ownerStatus?.isRegistered);

      if (!isOwnerRegistered) {
        // Initial Owner Registration
        const res = await registerOwner(regFullName, regEmail, regPassword);
        if (res.success) {
          if (res.needsEmailVerification) {
            setResetSuccessMessage('Owner registration successful! A verification link has been dispatched to your email.');
          } else {
            showToast('Owner account created successfully! Access granted.');
          }
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      } else {
        // Invited Admin Registration
        const res = await registerAdminWithInvitation(regFullName, regEmail, regPassword);
        if (res.success) {
          if (res.needsEmailVerification) {
            setResetSuccessMessage('Account created! A confirmation email has been dispatched. Please confirm to sign in.');
          } else {
            showToast('Administrator account activated! Access granted.');
          }
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail);
      if (res.success) {
        setResetSuccessMessage('Password reset instructions have been sent to your email.');
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setIsPasswordResetFlow(false);
        setResetSuccessMessage('Password has been successfully updated. You may now sign in.');
        setAuthMode('login');
        if (typeof window !== 'undefined' && window.location.hash) {
          window.location.hash = '';
        }
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwnerAlreadyRegistered = Boolean(ownerStatus?.isRegistered);

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row bg-[#0d0a21] font-sans overflow-x-hidden">
      {/* LEFT COLUMN: Luxurious Salon Branding & Feature Highlights */}
      <div className="relative w-full lg:w-[48%] min-h-[380px] lg:min-h-screen flex flex-col justify-between p-8 lg:p-14 overflow-hidden">
        {/* Salon interior background with warm lighting */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none transform scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop')`,
            backgroundColor: '#0a0818'
          }}
        />
        {/* Deep navy vignette & golden glows */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0818]/95 via-[#0e0b25]/85 to-[#1c1445]/60 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Golden Wave Divider on right edge for large screens */}
        <div className="hidden lg:block absolute -right-1 top-0 bottom-0 w-16 pointer-events-none z-10">
          <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 1000">
            <path
              d="M0,0 Q60,250 20,500 T90,1000 L100,1000 L100,0 Z"
              fill="#f4f6fa"
              className="drop-shadow-lg"
            />
            <path
              d="M-5,0 Q55,250 15,500 T85,1000"
              fill="none"
              stroke="#d4af37"
              strokeWidth="5"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* Top: Switch back to Customer QR Experience */}
        <div className="relative z-10">
          <button
            onClick={() => {
              if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              } else {
                window.location.hash = '';
              }
              setCurrentView('customer');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold backdrop-blur-md border border-white/10 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Customer QR View</span>
          </button>
        </div>

        {/* Center: Neel Hair Brand & Admin Portal Highlights */}
        <div className="relative z-10 my-auto py-6">
          <div className="flex flex-col items-start gap-4">
            <NeelHairLogo variant="dark" size="lg" className="items-start" />

            {/* Admin Portal Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase mt-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Portal</span>
            </div>

            {/* Feature Bullets */}
            <div className="mt-8 flex flex-col gap-4 text-slate-200">
              <div className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-amber-400/20 text-amber-300 flex items-center justify-center transition-colors">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  View Reviews &amp; Ratings
                </span>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-amber-400/20 text-amber-300 flex items-center justify-center transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  Manage Feedback
                </span>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-amber-400/20 text-amber-300 flex items-center justify-center transition-colors">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  Generate QR Code
                </span>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-amber-400/20 text-amber-300 flex items-center justify-center transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  Multi-Admin Team Access
                </span>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:bg-amber-400/20 text-amber-300 flex items-center justify-center transition-colors">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  Business Settings
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom subtle copyright */}
        <div className="relative z-10 text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Neel Hair. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: Admin Authentication Card */}
      <div className="relative flex-1 flex flex-col justify-between items-center p-6 sm:p-10 lg:p-16 bg-[#f4f6fa] overflow-hidden">
        {/* Soft decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md my-auto relative z-10">
          <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-card border border-slate-200/80 relative">
            {/* Top Icon Badge */}
            <div className="flex justify-center -mt-16 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white border-4 border-white">
                {authMode === 'register' ? (
                  <User className="w-8 h-8" />
                ) : authMode === 'forgot' || authMode === 'reset-password' ? (
                  <KeyRound className="w-8 h-8" />
                ) : (
                  <Lock className="w-8 h-8" />
                )}
              </div>
            </div>

            {/* Error & Info Banners */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {resetSuccessMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            {/* SEGMENTED TAB SWITCHER REMOVED (Public Create Account is disabled) */}

            {/* ========================================================= */}
            {/* 1. SIGN IN MODE */}
            {/* ========================================================= */}
            {authMode === 'login' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Admin Sign In
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                    Access your Neel Hair administrative dashboard
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@neelhair.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-slate-900 text-sm font-medium transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-slate-900 text-sm font-medium transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setResetSuccessMessage(null);
                        setAuthMode('forgot');
                      }}
                      className="font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-[0.98] cursor-pointer mt-1 disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        <span>Sign In to Dashboard</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Initial Setup Prompts */}
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  {!isOwnerAlreadyRegistered ? (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setResetSuccessMessage(null);
                        setAuthMode('register');
                      }}
                      className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Initial Setup: Register Platform Owner Account</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Salon Owner Bound • Invitation Required for New Staff</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ========================================================= */}
            {/* 2. CREATE ACCOUNT MODE */}
            {/* ========================================================= */}
            {authMode === 'register' && (
              <>
                <div className="text-center mb-5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {!isOwnerAlreadyRegistered ? 'Owner Setup' : 'Create Account'}
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                    {!isOwnerAlreadyRegistered
                      ? 'Initialize the primary Neel Hair owner account'
                      : 'Join the Neel Hair administration team via invitation'}
                  </p>
                </div>

                {isOwnerAlreadyRegistered && (
                  <div className="mb-4 p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-medium leading-relaxed">
                    <span className="font-bold">Team Invitation Notice:</span> Public registrations are locked. If the salon owner invited your email, fill out the form below to set up your password and activate your access.
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Neel Patil"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-slate-900 text-xs sm:text-sm transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={!isOwnerAlreadyRegistered ? 'owner@neelhair.com' : 'invited-staff@neelhair.com'}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-slate-900 text-xs sm:text-sm transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password (Min 8 Characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-slate-900 text-xs sm:text-sm transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-slate-900 text-xs sm:text-sm transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : !isOwnerAlreadyRegistered ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Register &amp; Bind Salon Owner</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Activate Invited Account</span>
                      </>
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setAuthMode('login');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      Already have an account? <span className="text-purple-600 font-bold underline">Sign In here</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ========================================================= */}
            {/* 3. FORGOT PASSWORD MODE */}
            {/* ========================================================= */}
            {authMode === 'forgot' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                    We'll email you a secure link to reset your password
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Registered Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@neelhair.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-slate-900 text-sm font-medium transition-all outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setAuthMode('login');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      Remembered your password? <span className="text-purple-600 font-bold underline">Back to Sign In</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ========================================================= */}
            {/* 4. SET NEW PASSWORD MODE (Supabase Recovery Token) */}
            {/* ========================================================= */}
            {authMode === 'reset-password' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
                    Enter your new secure password to restore dashboard access
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      New Password (Min 8 Characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-slate-900 text-sm font-medium transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-slate-900 text-sm font-medium transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Update Password &amp; Sign In</span>
                      </>
                    )}
                  </button>

                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setAuthMode('login');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      Return to <span className="text-purple-600 font-bold underline">Sign In</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Footer Branding */}
        <div className="relative z-10 pt-6 pb-2 text-center">
          <ReviewTapBadge theme="light" />
        </div>
      </div>
    </div>
  );
};
