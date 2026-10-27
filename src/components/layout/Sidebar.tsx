import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BedDouble,
  DoorOpen,
  Receipt,
  CreditCard,
  Sparkles,
  ClipboardList,
  BarChart3,
  UserCheck,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Building2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export type NavPage =
  | 'dashboard'
  | 'reservations'
  | 'guests'
  | 'rooms'
  | 'checkin-checkout'
  | 'billing'
  | 'payments'
  | 'housekeeping'
  | 'tasks'
  | 'reports'
  | 'users'
  | 'settings'
  | 'audit-logs';

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badgeCount?: number;
}

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile
}) => {
  const { user, logout, switchRoleForDemo } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['Administrator', 'Manager', 'Front Office Staff', 'Housekeeping Staff', 'Finance Officer']
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: CalendarDays,
      allowedRoles: ['Administrator', 'Manager', 'Front Office Staff']
    },
    {
      id: 'guests',
      label: 'Guest Directory',
      icon: Users,
      allowedRoles: ['Administrator', 'Manager', 'Front Office Staff']
    },
    {
      id: 'rooms',
      label: 'Room Inventory',
      icon: BedDouble,
      allowedRoles: ['Administrator', 'Manager', 'Front Office Staff', 'Housekeeping Staff']
    },
    {
      id: 'checkin-checkout',
      label: 'Check-In / Out',
      icon: DoorOpen,
      allowedRoles: ['Administrator', 'Manager', 'Front Office Staff']
    },
    {
      id: 'billing',
      label: 'Billing & Invoices',
      icon: Receipt,
      allowedRoles: ['Administrator', 'Manager', 'Front Office Staff', 'Finance Officer']
    },
    {
      id: 'payments',
      label: 'Payments & M-Pesa',
      icon: CreditCard,
      allowedRoles: ['Administrator', 'Manager', 'Front Office Staff', 'Finance Officer']
    },
    {
      id: 'housekeeping',
      label: 'Housekeeping',
      icon: Sparkles,
      allowedRoles: ['Administrator', 'Manager', 'Front Office Staff', 'Housekeeping Staff']
    },
    {
      id: 'tasks',
      label: 'Staff Tasks',
      icon: ClipboardList,
      allowedRoles: ['Administrator', 'Manager', 'Housekeeping Staff', 'Front Office Staff', 'Finance Officer']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      allowedRoles: ['Administrator', 'Manager', 'Finance Officer']
    },
    {
      id: 'users',
      label: 'User Management',
      icon: UserCheck,
      allowedRoles: ['Administrator']
    },
    {
      id: 'settings',
      label: 'Hotel Settings',
      icon: Settings,
      allowedRoles: ['Administrator', 'Manager']
    },
    {
      id: 'audit-logs',
      label: 'Audit Trail',
      icon: ShieldCheck,
      allowedRoles: ['Administrator', 'Manager', 'Finance Officer']
    }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;
    if (user.role === 'Administrator') return true;
    return item.allowedRoles.includes(user.role);
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-amber-500/20">
            <Building2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-brand font-bold text-base text-white tracking-wider flex items-center gap-1.5">
              MUGITHI GRAND
            </h1>
            <p className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">
              Hotel Management (MGHMS)
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role / Current Shift Indicator */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/50">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Duty Session:</span>
          <span className="text-amber-400 font-bold uppercase tracking-wider">{user?.role}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {filteredNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectPage(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition ${
                  isActive ? 'text-slate-950 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Fast Demo Role Switcher (For Evaluator Convenience) */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px]">
        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
          Role-Based Access Switcher
        </label>
        <select
          value={user?.role}
          onChange={e => switchRoleForDemo(e.target.value as UserRole)}
          className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="Administrator">Administrator (Alice)</option>
          <option value="Manager">Manager (David)</option>
          <option value="Front Office Staff">Front Office Staff (Faith)</option>
          <option value="Housekeeping Staff">Housekeeping Staff (John)</option>
          <option value="Finance Officer">Finance Officer (Grace)</option>
        </select>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out of MGHMS"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 fixed inset-y-0 z-30 shadow-xl border-r border-slate-800 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden no-print">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
