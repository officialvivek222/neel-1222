import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { CustomerWelcome } from './components/customer/CustomerWelcome';
import { CustomerFeedbackForm } from './components/customer/CustomerFeedbackForm';
import { CustomerThankYou } from './components/customer/CustomerThankYou';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { Toast } from './components/common/Toast';

export const AppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    customerStep,
    isAuthenticated,
    trackQrScan
  } = useApp();

  // Track QR scan on first arrival to customer view
  useEffect(() => {
    if (currentView === 'customer' && customerStep === 'landing') {
      trackQrScan();
    }
  }, []);

  // Listen to hash / URL params if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('admin') || search.includes('admin')) {
        setCurrentView('admin');
      } else if (hash.includes('customer') || hash.includes('qr')) {
        setCurrentView('customer');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setCurrentView]);

  return (
    <div className="relative min-h-screen">
      {/* Toast Notification Mount */}
      <Toast />

      {/* VIEW ROUTING */}
      {currentView === 'admin' ? (
        isAuthenticated ? (
          <AdminLayout />
        ) : (
          <AdminLogin />
        )
      ) : (
        <>
          {customerStep === 'landing' && <CustomerWelcome />}
          {customerStep === 'feedback-form' && <CustomerFeedbackForm />}
          {customerStep === 'thank-you' && <CustomerThankYou />}
        </>
      )}
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
