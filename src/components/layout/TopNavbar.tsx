import React from 'react';
import {
  Menu,
  RotateCw,
  Bell,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { NavPage } from './Sidebar';

interface TopNavbarProps {
  currentPage: NavPage;
  onOpenMobileSidebar: () => void;
  onSwitchToLanding?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentPage,
  onOpenMobileSidebar,
  onSwitchToLanding
}) => {
  const { user, logout } = useAuth();
  const { refreshAll, loading, rooms, reservations } = useHotel();

  const getPageTitle = (page: NavPage): string => {
    switch (page) {
      case 'dashboard': return 'Operational Dashboard';
      case 'reservations': return 'Reservation & Availability Management';
      case 'guests': return 'Guest Directory & Stay Profiles';
      case 'rooms': return 'Room Inventory & Housekeeping Status';
      case 'checkin-checkout': return 'Front Desk: Check-In & Check-Out Desk';
      case 'billing': return 'Billing, Statements & Tax Invoices';
      case 'payments': return 'Payments Ledger & M-Pesa Verifications';
      case 'housekeeping': return 'Housekeeping & Maintenance Control';
      case 'tasks': return 'Staff Tasks & Duty Allocation';
      case 'reports': return 'Financial & Operational Management Reports';
      case 'users': return 'User Access & Staff Credentials';
      case 'settings': return 'System Settings & Hotel Configuration';
      case 'audit-logs': return 'System Audit Trail & Security Logs';
      default: return 'Hotel Administration';
    }
  };

  const dirtyCount = rooms.filter(r => r.operationalStatus === 'Dirty').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingArrivals = reservations.filter(r => r.checkInDate === todayStr && r.status === 'Confirmed').length;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/80 shadow-xs px-4 sm:px-6 py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 hidden sm:inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Kalimoni, Juja
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-xs text-slate-500 hidden md:inline">
                Kiambu County, Kenya
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-brand">
              {getPageTitle(currentPage)}
            </h2>
          </div>
        </div>

        {/* Right: Operational tools & User Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Guest Website Showcase link */}
          {onSwitchToLanding && (
            <button
              onClick={onSwitchToLanding}
              title="View Public Guest Showcase & Landing Website"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 rounded-lg transition shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Guest Website</span>
            </button>
          )}

          {/* Refresh Action */}
          <button
            onClick={refreshAll}
            disabled={loading}
            title="Synchronize Live Operational Database"
            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          {/* Housekeeping / Arrival quick indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {dirtyCount > 0 && (
              <span
                title={`${dirtyCount} rooms requiring housekeeping turnover`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{dirtyCount} Dirty</span>
              </span>
            )}
            {pendingArrivals > 0 && (
              <span
                title={`${pendingArrivals} expected arrivals today`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingArrivals} Arrivals Today</span>
              </span>
            )}
          </div>

          {/* User badge */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900">{user?.name}</span>
            <span className="text-[10px] text-amber-700 font-medium flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3" /> {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
