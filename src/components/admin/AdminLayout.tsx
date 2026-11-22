import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { DashboardView } from './DashboardView';
import { CustomerFeedbackView } from './CustomerFeedbackView';
import { QRCodeView } from './QRCodeView';
import { BusinessSettingsView } from './BusinessSettingsView';
import { GoogleReviewsView } from './GoogleReviewsView';
import { AdminManagementView } from './AdminManagementView';
import { EnquiriesQuotationsView } from './EnquiriesQuotationsView';
import {
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  Star,
  Users,
  FileText
} from 'lucide-react';
import { AdminTab } from '../../types';

export const AdminLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'feedback':
        return <CustomerFeedbackView />;
      case 'google-reviews':
        return <GoogleReviewsView />;
      case 'qr-code':
        return <QRCodeView />;
      case 'enquiries':
        return <EnquiriesQuotationsView />;
      case 'admins':
        return <AdminManagementView />;
      case 'settings':
        return <BusinessSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  const mobileNavItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'google-reviews', label: 'Reviews', icon: Star },
    { id: 'qr-code', label: 'QR Code', icon: QrCode },
    { id: 'enquiries', label: 'Quotes', icon: FileText },
    { id: 'admins', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-800 flex font-sans">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen px-4 sm:px-8 py-4 sm:py-6 pb-24 lg:pb-10 max-w-7xl mx-auto w-full">
        {/* Top Header Bar */}
        <AdminTopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Dynamic Tab Body */}
        <main className="flex-1 w-full animate-in fade-in duration-200">
          {renderActiveView()}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR FOR ADMIN */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-30 shadow-lg">
        {mobileNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-purple-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
