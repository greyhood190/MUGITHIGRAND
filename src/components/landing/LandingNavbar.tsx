import React, { useState } from 'react';
import { Building2, ShieldCheck, Calendar, Menu, X } from 'lucide-react';

interface LandingNavbarProps {
  onOpenBooking: () => void;
  onOpenStaffPortal: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onOpenBooking,
  onOpenStaffPortal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <a href="#hero" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Building2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-slate-950 font-brand uppercase block leading-none">
              MUGITHI GRAND
            </span>
            <span className="text-[10px] tracking-widest text-amber-700 font-semibold uppercase mt-0.5 block">
              Hotel & Suites · Kalimoni
            </span>
          </div>
        </a>

        {/* Zone 2: 4-5 single-line clean text links with hover underline */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600 tracking-wide uppercase">
          <a href="#accommodations" className="hover:text-amber-700 transition whitespace-nowrap shrink-0">
            Accommodations
          </a>
          <a href="#dining" className="hover:text-amber-700 transition whitespace-nowrap shrink-0">
            Restaurant & Lounge
          </a>
          <a href="#conferences" className="hover:text-amber-700 transition whitespace-nowrap shrink-0">
            Conferences
          </a>
          <a href="#location" className="hover:text-amber-700 transition whitespace-nowrap shrink-0">
            Location & Vicinity
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action + Staff Portal Switcher */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenStaffPortal}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition whitespace-nowrap inline-flex items-center gap-1.5"
            title="Internal Hotel Management System"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Staff Portal</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition whitespace-nowrap inline-flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reserve a Stay</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-md text-xs font-bold"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-950 rounded-md"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
            <a
              href="#accommodations"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-amber-700"
            >
              Accommodations & Suites
            </a>
            <a
              href="#dining"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-amber-700"
            >
              Restaurant & Terrace Lounge
            </a>
            <a
              href="#conferences"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-amber-700"
            >
              Executive Conferences
            </a>
            <a
              href="#location"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-amber-700"
            >
              Location & Vicinity
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStaffPortal();
              }}
              className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg text-center"
            >
              Access Staff Operations Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
