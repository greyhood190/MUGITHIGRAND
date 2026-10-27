import React from 'react';
import { Building2, ShieldCheck, MapPin, Phone, Mail, ArrowUp } from 'lucide-react';

interface LandingFooterProps {
  onOpenStaffPortal: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onOpenStaffPortal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1 & 2: Brand & Address */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                <Building2 className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-base font-black text-white font-brand tracking-wider uppercase">
                MUGITHI GRAND HOTEL
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Hospitality and luxury suites in Kalimoni, Juja Constituency, Kiambu County, Kenya. Offering restful accommodations, Kenyan culinary excellence, and executive conferencing.
            </p>

            <div className="text-[11px] text-slate-500 space-y-1">
              <div>KRA Tax PIN: <strong className="text-slate-300 font-mono">P051284920K</strong></div>
              <div>M-Pesa Buy Goods Till: <strong className="text-slate-300 font-mono">8923411</strong></div>
              <div>P.O. Box 450 - 01007, Juja, Kenya</div>
            </div>
          </div>

          {/* Col 3: Accommodations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Accommodations
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#accommodations" className="hover:text-amber-400 transition">Presidential Mugithi Suite</a></li>
              <li><a href="#accommodations" className="hover:text-amber-400 transition">Deluxe Executive Suite</a></li>
              <li><a href="#accommodations" className="hover:text-amber-400 transition">Family Executive Suite</a></li>
              <li><a href="#accommodations" className="hover:text-amber-400 transition">Twin Executive Rooms</a></li>
              <li><a href="#accommodations" className="hover:text-amber-400 transition">Standard Single & Double</a></li>
            </ul>
          </div>

          {/* Col 4: Hospitality Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Hotel Experiences
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#dining" className="hover:text-amber-400 transition">Mugithi Restaurant</a></li>
              <li><a href="#dining" className="hover:text-amber-400 transition">Garden Cocktail Terrace</a></li>
              <li><a href="#conferences" className="hover:text-amber-400 transition">Executive Boardrooms</a></li>
              <li><a href="#conferences" className="hover:text-amber-400 transition">Kalimoni Banquet Hall</a></li>
              <li><a href="#location" className="hover:text-amber-400 transition">Kiambu Coffee Tours</a></li>
            </ul>
          </div>

          {/* Col 5: Operations & Internal Portal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Employee Portal
            </h4>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Restricted workspace for front office, housekeeping, and hotel administration staff.
            </p>
            <button
              onClick={onOpenStaffPortal}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Login (MGHMS)</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 Mugithi Grand Hotel Ltd. All rights reserved. Kalimoni, Juja, Kenya.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="hover:text-slate-300 transition flex items-center gap-1"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
