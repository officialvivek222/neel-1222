import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessSettings,
  FeedbackItem,
  PerformanceStats,
  AdminTab,
  FeedbackStatus,
  AppLanguage,
  ActivityPoint,
  AdminRole,
  AdminStatus,
  AdminUser,
  AdminInvitation,
  CustomerEnquiry,
  EnquiryStatus
} from '../types';
import {
  initialBusinessSettings,
  initialFeedbackList,
  initialPerformanceStats
} from '../data/mockData';
import {
  supabase,
  isSupabaseConfigured,
  getDbBusinessSettings,
  saveDbBusinessSettings,
  getDbFeedbacks,
  insertDbFeedback,
  updateDbFeedbackStatus,
  deleteDbFeedback,
  recordDbAnalyticsEvent,
  getDbAnalyticsStats,
  checkOwnerRegistrationStatus,
  signUpOwnerWithSupabase,
  signUpInvitedAdminWithSupabase,
  signInAdminWithSupabase,
  resetPasswordWithSupabase,
  updateUserPasswordWithSupabase,
  signOutAdminFromSupabase,
  checkPendingInvitation,
  getAdminProfile,
  getAdminsList,
  inviteAdminWithSupabase,
  updateAdminStatusWithSupabase,
  deleteAdminWithSupabase,
  revokeAdminInvitationWithSupabase,
  getDbEnquiries,
  insertDbEnquiry,
  updateDbEnquiryQuotation,
  updateDbEnquiryStatus,
  deleteDbEnquiry,
  OwnerStatus
} from '../lib/supabase';

interface ToastInfo {
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  // Business state
  businessSettings: BusinessSettings;
  updateBusinessSettings: (newSettings: Partial<BusinessSettings>) => Promise<void>;
  resetBusinessSettings: () => void;
  businessId: string | null;

  // Language state (for full customer localized flow: Welcome, Form, Thank You)
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;

  // Feedback state
  feedbackList: FeedbackItem[];
  addFeedback: (data: {
    customerName?: string;
    rating: number;
    service: string;
    feedbackText: string;
    phone?: string;
  }) => Promise<void>;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  exportFeedbackCSV: () => void;

  // Contact Enquiries & WhatsApp Quotations
  enquiryList: CustomerEnquiry[];
  addEnquiry: (data: {
    customerName: string;
    phone: string;
    service: string;
    message?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateEnquiryQuotation: (
    id: string,
    quote: {
      quotationAmount: number;
      discountAmount: number;
      finalAmount: number;
      notes?: string;
      status?: EnquiryStatus;
    }
  ) => Promise<boolean>;
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<boolean>;
  deleteEnquiry: (id: string) => Promise<boolean>;
  fetchEnquiries: () => Promise<void>;

  // Performance analytics (Production clean starting at 0)
  stats: PerformanceStats;
  trackQrScan: () => void;
  trackGoogleClick: () => void;
  refreshStats: () => Promise<void>;
  clearAllAnalytics: () => Promise<void>;

  // Supabase connection state
  isSupabaseConnected: boolean;

  // Admin routing & authentication
  isAuthenticated: boolean;
  currentUserEmail: string | null;
  currentUserRole: AdminRole;
  adminList: AdminUser[];
  invitationList: AdminInvitation[];
  isPasswordResetFlow: boolean;
  setIsPasswordResetFlow: (flag: boolean) => void;
  ownerStatus: OwnerStatus | null;
  checkOwnerStatus: () => Promise<OwnerStatus>;
  fetchAdmins: () => Promise<void>;
  inviteAdmin: (email: string, fullName: string, role?: AdminRole) => Promise<{ success: boolean; error?: string }>;
  toggleAdminStatus: (adminId: string, currentStatus: AdminStatus) => Promise<{ success: boolean; error?: string }>;
  removeAdmin: (adminId: string) => Promise<{ success: boolean; error?: string }>;
  revokeInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>;
  registerOwner: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }>;
  registerAdminWithInvitation: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }>;
  login: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;

  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  dateRange: string;
  setDateRange: (range: string) => void;

  // Customer navigation flow
  customerStep: 'landing' | 'feedback-form' | 'thank-you';
  setCustomerStep: (step: 'landing' | 'feedback-form' | 'thank-you') => void;
  customerRating: number | null;
  setCustomerRating: (rating: number | null) => void;

  // View switch (Admin portal vs Customer view)
  currentView: 'customer' | 'admin';
  setCurrentView: (view: 'customer' | 'admin') => void;

  // Toast notifications
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize businessId
  const [businessId, setBusinessId] = useState<string | null>(() => {
    return localStorage.getItem('neel_business_id') || '3b0ee36b-47db-4bec-9516-9ea8ffdcef99';
  });

  // Localized language for customer experience (EN, HI, MR)
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('neel_customer_lang') as AppLanguage) || 'EN';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('neel_customer_lang', lang);
    } catch {
      // ignore
    }
  };

  // Load initial settings from localStorage or clean defaults
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem('neel_business_settings');
      return saved ? JSON.parse(saved) : initialBusinessSettings;
    } catch {
      return initialBusinessSettings;
    }
  });

  // Clean Production Feedback List (Empty starting slate)
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem('neel_feedback_list');
      const parsed = saved ? JSON.parse(saved) : [];
      // Clean out any legacy mock data containing fake users
      if (Array.isArray(parsed) && parsed.some(p => p.customerName === 'Rohan Patil' && p.phone === '+91 98220 12345')) {
        localStorage.removeItem('neel_feedback_list');
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  });

  // Clean Production Stats (Starts strictly at zero)
  const [stats, setStats] = useState<PerformanceStats>(() => {
    try {
      // Force one-time client purge of previous demo/test scans (47 scans, 8 clicks, etc.)
      const resetFlag = localStorage.getItem('neel_production_clean_v3');
      if (!resetFlag) {
        localStorage.removeItem('neel_stats');
        localStorage.setItem('neel_analytics_reset_time', new Date().toISOString());
        localStorage.setItem('neel_production_clean_v3', 'true');
        return initialPerformanceStats;
      }

      const saved = localStorage.getItem('neel_stats');
      const parsed = saved ? JSON.parse(saved) : null;
      // If cached stats have legacy test scans, reset to clean zero
      if (parsed && (parsed.totalScans === 1268 || parsed.feedbackReceived === 126 || parsed.totalScans === 47)) {
        localStorage.removeItem('neel_stats');
        return initialPerformanceStats;
      }
      return parsed || initialPerformanceStats;
    } catch {
      return initialPerformanceStats;
    }
  });

  // Navigation and auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('neel_admin_auth') === 'true';
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('neel_registered_owner_email') || null;
  });
  const [currentUserRole, setCurrentUserRole] = useState<AdminRole>(() => {
    return (localStorage.getItem('neel_current_user_role') as AdminRole) || 'owner';
  });
  const [adminList, setAdminList] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('neel_admin_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [invitationList, setInvitationList] = useState<AdminInvitation[]>(() => {
    try {
      const saved = localStorage.getItem('neel_invitations_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [enquiryList, setEnquiryList] = useState<CustomerEnquiry[]>(() => {
    try {
      const saved = localStorage.getItem('neel_customer_enquiries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isPasswordResetFlow, setIsPasswordResetFlow] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.includes('type=recovery') || window.location.hash.includes('reset-password');
    }
    return false;
  });
  const [ownerStatus, setOwnerStatus] = useState<OwnerStatus | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [customerStep, setCustomerStep] = useState<'landing' | 'feedback-form' | 'thank-you'>('landing');
  const [customerRating, setCustomerRating] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.toLowerCase().includes('admin') ? 'admin' : 'customer';
    }
    return 'customer';
  });
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Whenever currentView changes, update the URL: #admin for admin, no hash for customer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentView === 'admin') {
      if (!window.location.hash.toLowerCase().includes('admin')) {
        window.location.hash = 'admin';
      }
    } else {
      if (window.location.hash) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          window.location.hash = '';
        }
      }
    }
  }, [currentView]);

  // Listen to hash changes (browser forward/back or manual URL navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        setCurrentView('admin');
      } else {
        setCurrentView('customer');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('neel_business_settings', JSON.stringify(businessSettings));
  }, [businessSettings]);

  useEffect(() => {
    localStorage.setItem('neel_feedback_list', JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem('neel_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('neel_admin_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Check owner status on mount
  const checkOwnerStatus = async (): Promise<OwnerStatus> => {
    const s = await checkOwnerRegistrationStatus();
    setOwnerStatus(s);
    return s;
  };

  useEffect(() => {
    checkOwnerStatus();
  }, []);

  // Listen for recovery links in URL
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || hash.includes('reset-password')) {
          setIsPasswordResetFlow(true);
          setCurrentView('admin');
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Verify admin user profile and permissions before setting authentication state
  const verifyAndSyncAdminSession = async (userId: string, email: string | null) => {
    if (!supabase) return;
    try {
      let { data: profile, error: profileErr } = await supabase
        .from('admin_profiles')
        .select('role, status')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching admin profile in auth listener:', profileErr);
      }

      // If missing profile, attempt claim_owner once (handles owner sign-up with email confirmation)
      if (!profile) {
        const { data: claimed } = await supabase.rpc('claim_owner');
        if (claimed) {
          const { data: refetched } = await supabase
            .from('admin_profiles')
            .select('role, status')
            .eq('id', userId)
            .maybeSingle();
          profile = refetched;
        } else {
          // If not claimed as owner, also try accept_invitation in case user was invited
          const { data: accepted } = await supabase.rpc('accept_invitation');
          if (accepted) {
            const { data: refetched } = await supabase
              .from('admin_profiles')
              .select('role, status')
              .eq('id', userId)
              .maybeSingle();
            profile = refetched;
          }
        }
      }

      if (profile && profile.status === 'active') {
        setIsAuthenticated(true);
        setCurrentUserEmail(email);
        const role = profile.role as AdminRole;
        setCurrentUserRole(role);
        localStorage.setItem('neel_admin_auth', 'true');
        if (email) localStorage.setItem('neel_registered_owner_email', email);
        localStorage.setItem('neel_current_user_role', role);
      } else {
        // Do NOT set isAuthenticated(true) if there is no active admin profile!
        setIsAuthenticated(false);
        localStorage.removeItem('neel_admin_auth');
      }
    } catch (e) {
      console.error('Could not verify admin profile:', e);
      setIsAuthenticated(false);
      localStorage.removeItem('neel_admin_auth');
    }
  };

  // Supabase Auth session listener
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        verifyAndSyncAdminSession(session.user.id, session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setCurrentUserEmail(null);
        localStorage.removeItem('neel_admin_auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        verifyAndSyncAdminSession(session.user.id, session.user.email || null);
      } else {
        // If logged out
        setIsAuthenticated(false);
        setCurrentUserEmail(null);
        localStorage.removeItem('neel_admin_auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Dynamic calculation for stats from real feedback and analytics
  const recalculateStats = (list: FeedbackItem[], analyticsSummary?: any) => {
    const total = list.length;
    const avg = total > 0
      ? Number((list.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1))
      : 0.0;
    const resolved = list.filter((item) => item.status === 'resolved').length;
    const fiveStar = list.filter((item) => item.rating === 5).length;

    const breakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = list.filter((item) => item.rating === stars).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { stars, percentage, count };
    });

    setStats((prev) => ({
      ...prev,
      totalScans: analyticsSummary ? analyticsSummary.totalScans : prev.totalScans,
      scansGrowth: analyticsSummary ? analyticsSummary.scansGrowth : 0,
      googleClicks: analyticsSummary ? analyticsSummary.googleClicks : prev.googleClicks,
      clicksGrowth: analyticsSummary ? analyticsSummary.clicksGrowth : 0,
      activityData: analyticsSummary?.activityData || [],
      feedbackReceived: total,
      averageRating: avg,
      resolvedCount: resolved,
      fiveStarCount: fiveStar,
      fiveStarGrowth: total > 0 ? Math.round((fiveStar / total) * 100) : 0,
      ratingBreakdown: breakdown
    }));
  };

  // Refresh all stats and feedback directly from Supabase
  const refreshStats = async () => {
    if (!isSupabaseConfigured) return;

    try {
      const [biz, feedbacks, analytics] = await Promise.all([
        getDbBusinessSettings(),
        getDbFeedbacks(),
        getDbAnalyticsStats(businessId)
      ]);

      if (biz) {
        setBusinessId(biz.businessId);
        setBusinessSettings(biz.settings);
      }

      if (feedbacks !== null) {
        setFeedbackList(feedbacks);
        recalculateStats(feedbacks, analytics);
      } else if (analytics) {
        setStats((prev) => ({
          ...prev,
          totalScans: analytics.totalScans,
          googleClicks: analytics.googleClicks,
          activityData: analytics.activityData
        }));
      }

      await fetchEnquiries();
    } catch (err) {
      console.warn('Error refreshing stats from Supabase:', err);
    }
  };

  // Initial load from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    refreshStats();

    // Setup Realtime subscription on feedback table
    if (supabase) {
      const channel = supabase
        .channel('public:feedback_and_analytics')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'feedback' },
          async () => {
            const updated = await getDbFeedbacks();
            if (updated) {
              setFeedbackList(updated);
              recalculateStats(updated);
            }
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const updateBusinessSettings = async (newSettings: Partial<BusinessSettings>) => {
    const updated = { ...businessSettings, ...newSettings };
    setBusinessSettings(updated);

    if (isSupabaseConfigured && businessId) {
      const success = await saveDbBusinessSettings(businessId, newSettings);
      if (success) {
        showToast('Settings saved & synced to Supabase!');
        return;
      }
    }
    showToast('Settings saved successfully!');
  };

  const resetBusinessSettings = () => {
    setBusinessSettings(initialBusinessSettings);
    showToast('Settings reset to default', 'info');
  };

  const addFeedback = async (data: {
    customerName?: string;
    rating: number;
    service: string;
    feedbackText: string;
    phone?: string;
  }) => {
    const name = data.customerName?.trim() || 'Valued Guest';
    const avatar = name.charAt(0).toUpperCase();
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const localItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      customerName: name,
      rating: data.rating,
      service: data.service,
      feedbackText: data.feedbackText || 'Customer provided positive feedback via ReviewTap.',
      createdAt: today,
      status: 'pending',
      customerAvatar: avatar,
      phone: data.phone
    };

    // Update locally first for instant UI responsiveness
    const updatedList = [localItem, ...feedbackList];
    setFeedbackList(updatedList);
    recalculateStats(updatedList);
    setCustomerStep('thank-you');

    // Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        const dbItem = await insertDbFeedback(businessId, {
          customerName: name,
          rating: data.rating,
          service: data.service,
          feedbackText: data.feedbackText,
          phone: data.phone
        });

        if (dbItem) {
          // Replace temp local id with Supabase UUID
          setFeedbackList((prev) => [dbItem, ...prev.filter((f) => f.id !== localItem.id)]);
        }
        await recordDbAnalyticsEvent(businessId, 'feedback_submitted');
      } catch (err) {
        console.warn('Feedback recorded locally, Supabase sync error:', err);
      }
    }

    showToast('Feedback submitted successfully!');
  };

  const updateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
    const updated = feedbackList.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    setFeedbackList(updated);
    recalculateStats(updated);

    if (isSupabaseConfigured) {
      await updateDbFeedbackStatus(id, status);
    }
    showToast(`Feedback marked as ${status}`);
  };

  const deleteFeedback = async (id: string) => {
    const updated = feedbackList.filter((item) => item.id !== id);
    setFeedbackList(updated);
    recalculateStats(updated);

    if (isSupabaseConfigured) {
      await deleteDbFeedback(id);
    }
    showToast('Feedback removed', 'info');
  };

  // Enquiries & WhatsApp Quotations Handlers
  const fetchEnquiries = async () => {
    try {
      const list = await getDbEnquiries(businessId);
      setEnquiryList(list);
    } catch (e) {
      console.warn('Error fetching enquiries:', e);
    }
  };

  const addEnquiry = async (data: {
    customerName: string;
    phone: string;
    service: string;
    message?: string;
  }) => {
    if (!data.customerName.trim() || !data.phone.trim()) {
      return { success: false, error: 'Name and phone number are required.' };
    }
    const res = await insertDbEnquiry({
      businessId: businessId || undefined,
      customerName: data.customerName,
      phone: data.phone,
      service: data.service,
      message: data.message,
      status: 'new',
      quotationAmount: 0,
      discountAmount: 0,
      finalAmount: 0
    });
    if (res.success && res.data) {
      setEnquiryList((prev) => [res.data!, ...prev.filter((i) => i.id !== res.data!.id)]);
      showToast('Enquiry submitted successfully! Our team will contact you on WhatsApp.');
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to submit enquiry' };
  };

  const updateEnquiryQuotation = async (
    id: string,
    quote: {
      quotationAmount: number;
      discountAmount: number;
      finalAmount: number;
      notes?: string;
      status?: EnquiryStatus;
    }
  ) => {
    const ok = await updateDbEnquiryQuotation(id, quote);
    if (ok) {
      await fetchEnquiries();
      showToast('Quotation updated and ready to send via WhatsApp!', 'success');
      return true;
    }
    showToast('Failed to update quotation', 'error');
    return false;
  };

  const updateEnquiryStatus = async (id: string, status: EnquiryStatus) => {
    const ok = await updateDbEnquiryStatus(id, status);
    if (ok) {
      await fetchEnquiries();
      showToast(`Enquiry status updated to ${status}`, 'success');
      return true;
    }
    return false;
  };

  const deleteEnquiry = async (id: string) => {
    const ok = await deleteDbEnquiry(id);
    if (ok) {
      setEnquiryList((prev) => prev.filter((item) => item.id !== id));
      showToast('Enquiry deleted successfully', 'info');
      return true;
    }
    return false;
  };

  const trackQrScan = () => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().slice(0, 10);
      const lastScanDate = localStorage.getItem('neel_last_qr_scan_date');
      if (lastScanDate === today) {
        return;
      }
      localStorage.setItem('neel_last_qr_scan_date', today);
    }

    setStats((prev) => ({
      ...prev,
      totalScans: prev.totalScans + 1
    }));
    if (isSupabaseConfigured) {
      const effectiveBizId = businessId || localStorage.getItem('neel_business_id') || '3b0ee36b-47db-4bec-9516-9ea8ffdcef99';
      recordDbAnalyticsEvent(effectiveBizId, 'qr_scan');
    }
  };

  const trackGoogleClick = () => {
    setStats((prev) => ({
      ...prev,
      googleClicks: prev.googleClicks + 1
    }));
    if (isSupabaseConfigured) {
      recordDbAnalyticsEvent(businessId, 'google_click');
    }
  };

  const clearAllAnalytics = async () => {
    try {
      localStorage.setItem('neel_analytics_reset_time', new Date().toISOString());
      localStorage.setItem('neel_stats', JSON.stringify(initialPerformanceStats));
      if (supabase) {
        try {
          await supabase.from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (dbErr) {
          console.warn('Analytics DB delete error:', dbErr);
        }
      }
    } catch {
      // ignore
    }
    setStats(initialPerformanceStats);
    await refreshStats();
    showToast('All QR scans and Google review clicks cleared to zero!', 'success');
  };

  const fetchAdmins = async () => {
    try {
      const res = await getAdminsList(businessId || undefined);
      setAdminList(res.admins);
      setInvitationList(res.invitations);
      localStorage.setItem('neel_admin_list', JSON.stringify(res.admins));
      localStorage.setItem('neel_invitations_list', JSON.stringify(res.invitations));
    } catch (err) {
      console.warn('Error fetching admin accounts:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdmins();
    }
  }, [isAuthenticated, businessId]);

  const inviteAdmin = async (email: string, fullName: string, role: AdminRole = 'admin') => {
    if (!email.trim()) return { success: false, error: 'Email address is required.' };
    const res = await inviteAdminWithSupabase(email, fullName, role, undefined, businessId || undefined);
    if (res.success) {
      showToast(`Invitation sent to ${email.trim()}`, 'success');
      await fetchAdmins();
    } else {
      showToast(res.error || 'Failed to send invitation', 'error');
    }
    return res;
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: AdminStatus) => {
    const nextStatus: AdminStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    const res = await updateAdminStatusWithSupabase(adminId, nextStatus);
    if (res.success) {
      showToast(`Admin account ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      await fetchAdmins();
    } else {
      showToast(res.error || 'Could not update status', 'error');
    }
    return res;
  };

  const removeAdmin = async (adminId: string) => {
    const res = await deleteAdminWithSupabase(adminId);
    if (res.success) {
      showToast('Administrator removed successfully', 'info');
      await fetchAdmins();
    } else {
      showToast(res.error || 'Could not remove administrator', 'error');
    }
    return res;
  };

  const revokeInvitation = async (invitationId: string) => {
    const res = await revokeAdminInvitationWithSupabase(invitationId);
    if (res.success) {
      showToast('Invitation revoked successfully', 'info');
      await fetchAdmins();
    } else {
      showToast(res.error || 'Could not revoke invitation', 'error');
    }
    return res;
  };

  const registerOwner = async (name: string, email: string, password: string) => {
    const res = await signUpOwnerWithSupabase(name, email, password);
    if (res.success) {
      await checkOwnerStatus();
      if (!res.needsEmailVerification) {
        setIsAuthenticated(true);
        setCurrentUserEmail(email.trim());
        setCurrentUserRole('owner');
        setCurrentView('admin');
        setActiveTab('dashboard');
        refreshStats();
        fetchAdmins();
      }
      showToast('Owner account successfully created!', 'success');
    } else {
      showToast(res.error || 'Registration failed', 'error');
    }
    return res;
  };

  const registerAdminWithInvitation = async (fullName: string, email: string, password: string) => {
    const res = await signUpInvitedAdminWithSupabase(fullName, email, password);
    if (res.success) {
      await checkOwnerStatus();
      if (!res.needsEmailVerification) {
        setIsAuthenticated(true);
        setCurrentUserEmail(email.trim().toLowerCase());
        setCurrentView('admin');
        setActiveTab('dashboard');
        refreshStats();
        fetchAdmins();
      }
      showToast('Administrator account successfully created!', 'success');
    } else {
      showToast(res.error || 'Failed to create administrator account', 'error');
    }
    return res;
  };

  const login = async (email?: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    if (!isSupabaseConfigured) {
      const err = 'Database is not configured. Please check your Supabase environment settings.';
      showToast(err, 'error');
      return { success: false, error: err };
    }

    const authRes = await signInAdminWithSupabase(cleanEmail, password);
    if (authRes.success) {
      setIsAuthenticated(true);
      setCurrentUserEmail(cleanEmail);
      if (authRes.role) {
        setCurrentUserRole(authRes.role);
      }
      setCurrentView('admin');
      setActiveTab('dashboard');
      refreshStats();
      fetchAdmins();
      showToast(`Welcome back to Neel Hair Dashboard!`);
      return { success: true };
    } else {
      showToast(authRes.error || 'Invalid email or password', 'error');
      return { success: false, error: authRes.error };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await signOutAdminFromSupabase();
    }
    setIsAuthenticated(false);
    setCurrentUserEmail(null);
    setCurrentView('customer');
    try {
      localStorage.removeItem('neel_admin_auth');
    } catch {
      // ignore
    }
    showToast('Logged out of Admin Portal', 'info');
  };

  const resetPassword = async (email: string) => {
    const res = await resetPasswordWithSupabase(email);
    if (res.success) {
      showToast('Password reset link sent to your email!', 'info');
    } else {
      showToast(res.error || 'Failed to send reset link', 'error');
    }
    return res;
  };

  const updatePassword = async (newPassword: string) => {
    const res = await updateUserPasswordWithSupabase(newPassword);
    if (res.success) {
      showToast('Password updated successfully!');
    } else {
      showToast(res.error || 'Password update failed', 'error');
    }
    return res;
  };

  const exportFeedbackCSV = () => {
    if (feedbackList.length === 0) {
      showToast('No feedback data to export', 'error');
      return;
    }

    const headers = ['ID', 'Customer Name', 'Rating', 'Service', 'Feedback', 'Date', 'Status', 'Phone'];
    const rows = feedbackList.map((item) => [
      item.id,
      `"${item.customerName.replace(/"/g, '""')}"`,
      item.rating,
      `"${item.service.replace(/"/g, '""')}"`,
      `"${item.feedbackText.replace(/"/g, '""')}"`,
      item.createdAt,
      item.status,
      item.phone || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Neel_Hair_Feedback_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Feedback CSV successfully!');
  };

  return (
    <AppContext.Provider
      value={{
        businessSettings,
        updateBusinessSettings,
        resetBusinessSettings,
        businessId,
        language,
        setLanguage,
        feedbackList,
        addFeedback,
        updateFeedbackStatus,
        deleteFeedback,
        exportFeedbackCSV,
        enquiryList,
        addEnquiry,
        updateEnquiryQuotation,
        updateEnquiryStatus,
        deleteEnquiry,
        fetchEnquiries,
        stats,
        trackQrScan,
        trackGoogleClick,
        refreshStats,
        clearAllAnalytics,
        isSupabaseConnected: isSupabaseConfigured,
        isAuthenticated,
        currentUserEmail,
        currentUserRole,
        adminList,
        invitationList,
        isPasswordResetFlow,
        setIsPasswordResetFlow,
        ownerStatus,
        checkOwnerStatus,
        fetchAdmins,
        inviteAdmin,
        toggleAdminStatus,
        removeAdmin,
        revokeInvitation,
        registerOwner,
        registerAdminWithInvitation,
        login,
        logout,
        resetPassword,
        updatePassword,
        activeTab,
        setActiveTab,
        dateRange,
        setDateRange,
        customerStep,
        setCustomerStep,
        customerRating,
        setCustomerRating,
        currentView,
        setCurrentView,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
