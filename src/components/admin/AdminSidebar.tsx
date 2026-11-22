import React from 'react';
import { useApp } from '../../context/AppContext';
import { NeelHairLogo } from '../common/NeelHairLogo';
import { ReviewTapBadge } from '../common/ReviewTapBadge';
import { AdminTab } from '../../types';
import {
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  X,
  Eye,
  LogOut,
  Users,
  Crown,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  mobileOpen,
  onCloseMobile
}) => {
  const { activeTab, setActiveTab, setCurrentView, logout, currentUserEmail, currentUserRole } = useApp();

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    {
      id: 'google-reviews',
      label: 'Google Reviews',
      icon: ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
        </svg>
      )
    },
    { id: 'qr-code', label: 'QR Code', icon: QrCode },
    { id: 'enquiries', label: 'Enquiries & Quotes', icon: FileText },
    { id: 'admins', label: 'Team & Admins', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0e0b24] text-slate-300 z-50 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out border-r border-purple-950/40 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Close Button */}
        <div>
          <div className="flex items-center justify-between px-2 mb-8">
            <NeelHairLogo variant="dark" size="sm" />
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Info, Customer View Switch & Powered by ReviewTap */}
        <div className="flex flex-col gap-3 px-2 pt-4 border-t border-purple-900/30">
          {/* User profile card */}
          {currentUserEmail && (
            <div className="p-2.5 rounded-2xl bg-white/5 border border-purple-800/20 flex items-center justify-between">
              <div className="truncate mr-2">
                <span className="block text-[11px] text-slate-300 font-semibold truncate">
                  {currentUserEmail}
                </span>
                <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                  {currentUserRole === 'owner' ? (
                    <Crown className="w-3 h-3 text-amber-400 inline" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-purple-400 inline" />
                  )}
                  {currentUserRole}
                </span>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                  currentUserRole === 'owner'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}
              >
                {currentUserRole}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
              } else {
                window.location.hash = '';
              }
              setCurrentView('customer');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 hover:text-white border border-purple-700/40 text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Open Customer QR View</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <div className="pt-1 text-center">
            <ReviewTapBadge theme="dark" />
          </div>
        </div>
      </aside>
    </>
  );
};
