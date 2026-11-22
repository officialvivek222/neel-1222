import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Calendar,
  Bell,
  ChevronDown,
  LogOut,
  Eye,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AdminTopBarProps {
  onOpenMobileSidebar: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ onOpenMobileSidebar }) => {
  const {
    activeTab,
    dateRange,
    setDateRange,
    businessSettings,
    logout,
    setCurrentView,
    feedbackList,
    currentUserEmail,
    currentUserRole
  } = useApp();

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = () => {
      setDateDropdownOpen(false);
      setProfileDropdownOpen(false);
      setNotificationsOpen(false);
    };

    if (dateDropdownOpen || profileDropdownOpen || notificationsOpen) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [dateDropdownOpen, profileDropdownOpen, notificationsOpen]);

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Review & Feedback Management'
    },
    feedback: {
      title: 'Customer Feedback',
      subtitle: 'View and manage all store feedback & ratings'
    },
    'google-reviews': {
      title: 'Google Reviews',
      subtitle: 'Track and manage your Google Business profile reviews'
    },
    'qr-code': {
      title: 'QR Code Management',
      subtitle: 'Create, download and manage your review QR code'
    },
    enquiries: {
      title: 'Enquiries & Quotations',
      subtitle: 'Review customer requests and dispatch WhatsApp quotations'
    },
    admins: {
      title: 'Team Management',
      subtitle: 'Manage salon administrators, roles and dashboard permissions'
    },
    settings: {
      title: 'Business Settings',
      subtitle: 'Manage your salon details, review link and preferences'
    }
  };

  const currentInfo = titles[activeTab] || titles.dashboard;

  const dateOptions = [
    'Last 30 Days',
    'Last 7 Days',
    'Today',
    'This Month',
    'All Time'
  ];

  // Dynamic notifications based on real feedback records
  const notifications = feedbackList.slice(0, 5).map((fb) => ({
    id: fb.id,
    title: `${fb.rating}★ Feedback Received`,
    desc: `${fb.customerName} rated ${fb.service}`,
    time: fb.createdAt,
    unread: fb.status === 'pending'
  }));

  return (
    <header className="w-full flex items-center justify-between pb-6 pt-2 select-none">
      {/* Left: Mobile hamburger & Page Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Action Tools: Date Range + Notifications + User Avatar */}
      <div className="flex items-center gap-3">
        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDateDropdownOpen(!dateDropdownOpen);
              setProfileDropdownOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setDateDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                    dateRange === opt
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt}</span>
                  {dateRange === opt && <Check className="w-3.5 h-3.5 text-purple-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNotificationsOpen(!notificationsOpen);
              setDateDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="relative p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {/* Notification pink/purple indicator dot only when there are unread notifications */}
            {notifications.some((n) => n.unread) && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800">Notifications</span>
                {notifications.length > 0 && (
                  <span className="text-[11px] text-purple-600 font-semibold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No new notifications. New feedback will alert you here.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl transition-all ${
                        n.unread ? 'bg-purple-50/70 border border-purple-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{n.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Pill */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setProfileDropdownOpen(!profileDropdownOpen);
              setDateDropdownOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {businessSettings.businessName.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {businessSettings.businessName}
              </span>
              <span className="text-[10px] text-purple-600 font-extrabold uppercase tracking-wide">
                {currentUserRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-slate-800">{businessSettings.businessName}</p>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      currentUserRole === 'owner'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {currentUserRole}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{currentUserEmail || businessSettings.contactNumber}</p>
              </div>

              <button
                onClick={() => {
                  if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                  } else {
                    window.location.hash = '';
                  }
                  setCurrentView('customer');
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 text-left transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-purple-600" />
                <span>Open Customer QR View</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
