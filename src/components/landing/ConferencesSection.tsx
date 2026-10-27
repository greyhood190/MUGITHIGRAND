import React from 'react';
import { Presentation, Wifi, Users, CheckCircle2, ArrowRight } from 'lucide-react';

interface ConferencesSectionProps {
  onInquireEvent: () => void;
}

export const ConferencesSection: React.FC<ConferencesSectionProps> = ({ onInquireEvent }) => {
  return (
    <section id="conferences" className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Column */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="/src/assets/images/conference_boardroom_1793074184437.jpg"
                alt="Executive Boardroom Conference Facilities at Mugithi Grand Hotel"
                className="w-full h-[380px] sm:h-[460px] object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-xs">
                <span className="font-bold font-brand tracking-wider uppercase block text-amber-300">
                  High-Tech Executive Boardroom
                </span>
                <span className="text-slate-200 text-[11px]">
                  Ergonomic executive seating, hybrid conferencing displays, and sound insulation.
                </span>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
              03. Corporate & Banqueting
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-brand leading-tight">
              Executive Conferences & Corporate Retreats
            </h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Ideally positioned for institutions, university symposiums, government delegations, and private corporate planning sessions. Our venues combine tranquility with productivity tools.
            </p>

            {/* Venues Grid */}
            <div className="mt-6 space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Executive Boardroom</span>
                  <span className="text-amber-800 font-semibold">15 – 25 Delegates</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Equipped with 4K interactive presentation display, ergonomic leather armchairs, and private tea lounge.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Kalimoni Grand Hall</span>
                  <span className="text-amber-800 font-semibold">Up to 120 Guests</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Configurable theater or banquet layout for academic symposiums, product launches, and corporate galas.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Terrace & Garden Grounds</span>
                  <span className="text-amber-800 font-semibold">Outdoor Team Building</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Expansive manicured lawn ideal for breakout activities, cocktail evenings, and celebratory dinners.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={onInquireEvent}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
              >
                <span>Request Conference Package</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
