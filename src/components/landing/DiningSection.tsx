import React from 'react';
import { UtensilsCrossed, Clock, Sparkles, Coffee, Wine } from 'lucide-react';

export const DiningSection: React.FC = () => {
  return (
    <section id="dining" className="py-20 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
              02. Culinary Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-brand leading-tight">
              Mugithi Restaurant & Executive Lounge
            </h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Indulge in authentic Kenyan specialties alongside continental favorites. From our renowned flame-grilled Nyama Choma goat ribs to aromatic highland coffee from Kiambu's fertile hills, our chefs craft every plate with local pride.
            </p>

            {/* Menu Highlights List */}
            <div className="mt-8 space-y-4">
              <div className="border-l-2 border-amber-500 pl-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Flame-Grilled Nyama Choma Platter
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tender seasoned goat ribs served with piping hot ugali, kachumbari relish, and traditional greens.
                </p>
              </div>

              <div className="border-l-2 border-slate-300 pl-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Terrace Garden Cocktail Lounge
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chilled Tusker Malt, handcrafted cocktails, and select international wines under ambient evening starlight.
                </p>
              </div>

              <div className="border-l-2 border-slate-300 pl-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Kiambu Highland Coffee & High Tea
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Single-origin AA arabica roasts paired with freshly baked mandazi and afternoon scones.
                </p>
              </div>
            </div>

            {/* Timings row */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Open 06:30 AM – 11:00 PM Daily</span>
              </div>
              <span aria-hidden="true">·</span>
              <span>24/7 Room Service for In-House Guests</span>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="/src/assets/images/restaurant_mugithi_dining_1793074184911.jpg"
                alt="Mugithi Restaurant and Executive Garden Lounge in Kalimoni, Juja"
                className="w-full h-[380px] sm:h-[480px] object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-xs">
                <span className="font-bold font-brand tracking-wider uppercase block text-amber-300">
                  Al Fresco Garden Terrace
                </span>
                <span className="text-slate-200 text-[11px]">
                  Accommodates romantic dinners, family gatherings, and corporate celebrations.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
