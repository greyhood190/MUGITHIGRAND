import React from 'react';
import { MapPin, Phone, Mail, Clock, Compass, Navigation } from 'lucide-react';

export const LocationSection: React.FC = () => {
  return (
    <section id="location" className="py-20 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
            04. Destination & Neighborhood
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-brand">
            Kalimoni, Juja · Kiambu County
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Conveniently accessed directly off the eight-lane Thika Superhighway, combining rapid connectivity to Nairobi with the peaceful serenity of Kiambu's scenic greenery.
          </p>
        </div>

        {/* Vicinity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mb-3">
              <Navigation className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">JKUAT University</h4>
            <p className="text-xs text-slate-500 mt-1">
              5 minutes drive to JKUAT Gate C and Innovation Park. The preferred stay for visiting scholars and parents.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mb-3">
              <Navigation className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Nairobi CBD Access</h4>
            <p className="text-xs text-slate-500 mt-1">
              25 to 30 minutes drive via Thika Superhighway directly into Nairobi city center and Westlands.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mb-3">
              <Navigation className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Thika Greens Golf</h4>
            <p className="text-xs text-slate-500 mt-1">
              15 minutes drive to championship 18-hole golf fairways, clubhouse, and Thika business parks.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mb-3">
              <Navigation className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">14 Falls Excursions</h4>
            <p className="text-xs text-slate-500 mt-1">
              Easy day trips to Fourteen Falls, Chania River scenery, and historic Kiambu coffee farm tours.
            </p>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Physical Location</span>
              <span className="text-xs font-semibold text-white">Kalimoni, Juja Constituency, Kiambu County</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Reservations & Enquiries</span>
              <span className="text-xs font-semibold text-white">+254 722 890 123 / +254 733 456 789</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Direct Email</span>
              <span className="text-xs font-semibold text-white">reservations@mugithigrand.co.ke</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
