import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Sidebar, NavPage } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { RoomsView } from './components/rooms/RoomsView';
import { ReservationsView } from './components/reservations/ReservationsView';
import { GuestsView } from './components/guests/GuestsView';
import { CheckInOutView } from './components/frontdesk/CheckInOutView';
import { BillingView } from './components/billing/BillingView';
import { PaymentsView } from './components/payments/PaymentsView';
import { HousekeepingView } from './components/housekeeping/HousekeepingView';
import { TasksView } from './components/tasks/TasksView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { LandingView } from './components/landing/LandingView';
import { ShieldAlert, X } from 'lucide-react';
import { UserRole } from './types';

const PAGE_PERMISSIONS: Record<NavPage, UserRole[]> = {
  'dashboard': ['Administrator', 'Manager', 'Front Office Staff', 'Housekeeping Staff', 'Finance Officer'],
  'reservations': ['Administrator', 'Manager', 'Front Office Staff'],
  'guests': ['Administrator', 'Manager', 'Front Office Staff'],
  'rooms': ['Administrator', 'Manager', 'Front Office Staff', 'Housekeeping Staff'],
  'checkin-checkout': ['Administrator', 'Manager', 'Front Office Staff'],
  'billing': ['Administrator', 'Manager', 'Front Office Staff', 'Finance Officer'],
  'payments': ['Administrator', 'Manager', 'Front Office Staff', 'Finance Officer'],
  'housekeeping': ['Administrator', 'Manager', 'Front Office Staff', 'Housekeeping Staff'],
  'tasks': ['Administrator', 'Manager', 'Housekeeping Staff', 'Front Office Staff', 'Finance Officer'],
  'reports': ['Administrator', 'Manager', 'Finance Officer'],
  'users': ['Administrator'],
  'settings': ['Administrator', 'Manager'],
  'audit-logs': ['Administrator', 'Manager', 'Finance Officer']
};

function MainLayout() {
  const { user, loading, hasPermission } = useAuth();
  const { toasts, removeToast } = useHotel();
  const [viewMode, setViewMode] = useState<'landing' | 'staff_portal'>('landing');
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="font-brand font-bold text-lg tracking-wider">MUGITHI GRAND HOTEL</h2>
        <p className="text-xs text-amber-400 mt-1 uppercase tracking-widest">Loading Operations Management System...</p>
      </div>
    );
  }

  // Guest Landing Page
  if (viewMode === 'landing') {
    return (
      <>
        <LandingView onOpenStaffPortal={() => setViewMode('staff_portal')} />

        {/* Global Toast Stack */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none no-print">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs flex items-start justify-between gap-3 transition-all ${
                toast.type === 'success'
                  ? 'bg-slate-900 text-white border-emerald-500'
                  : toast.type === 'error'
                  ? 'bg-rose-950 text-white border-rose-600'
                  : toast.type === 'warning'
                  ? 'bg-amber-950 text-white border-amber-500'
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              <div>
                <p className="font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Staff Portal - If unauthenticated, display staff login screen with return-to-landing option
  if (!user) {
    return <LoginView onBackToLanding={() => setViewMode('landing')} />;
  }

  const isAuthorized = hasPermission(PAGE_PERMISSIONS[currentPage] || []);

  const renderActiveView = () => {
    if (!isAuthorized) {
      return (
        <div className="bg-white p-8 rounded-xl border border-rose-200 shadow-xs text-center max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-brand">Access Restricted</h3>
          <p className="text-xs text-slate-600 mt-2">
            Your current staff role (<strong>{user.role}</strong>) does not have authorization to view this module.
          </p>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="mt-5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardView onNavigate={page => setCurrentPage(page)} />;
      case 'reservations':
        return <ReservationsView />;
      case 'guests':
        return <GuestsView />;
      case 'rooms':
        return <RoomsView />;
      case 'checkin-checkout':
        return <CheckInOutView />;
      case 'billing':
        return <BillingView />;
      case 'payments':
        return <PaymentsView />;
      case 'housekeeping':
        return <HousekeepingView />;
      case 'tasks':
        return <TasksView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      default:
        return <DashboardView onNavigate={page => setCurrentPage(page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={page => setCurrentPage(page)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopNavbar
          currentPage={currentPage}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSwitchToLanding={() => setViewMode('landing')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none no-print">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs flex items-start justify-between gap-3 transition-all ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500'
                : toast.type === 'error'
                ? 'bg-rose-950 text-white border-rose-600'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-white border-amber-500'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div>
              <p className="font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <MainLayout />
      </HotelProvider>
    </AuthProvider>
  );
}
