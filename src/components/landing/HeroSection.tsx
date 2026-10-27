import React from 'react';
import { Calendar, Users, MapPin, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { RoomCategory } from '../../types';

interface HeroSectionProps {
  categories: RoomCategory[];
  arrivalDate: string;
  departureDate: string;
  selectedCategory: string;
  guestsCount: number;
  onArrivalChange: (date: string) => void;
  onDepartureChange: (date: string) => void;
  onCategoryChange: (catId: string) => void;
  onGuestsChange: (count: number) => void;
  onSearchAvailability: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  categories,
  arrivalDate,
  departureDate,
  selectedCategory,
  guestsCount,
  onArrivalChange,
  onDepartureChange,
  onCategoryChange,
  onGuestsChange,
  onSearchAvailability
}) => {
  return (
    <section id="hero" className="relative pt-6 pb-20 sm:pb-28 overflow-hidden bg-slate-950 text-white">
      {/* Background Hero Image with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_mugithi_resort_1793074183503.jpg"
          alt="Mugithi Grand Hotel luxury pavilion and gardens in Kalimoni, Juja"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Measured dark scrim for 4.5:1 text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
        <div className="absolute inset-0 bg-slate-950/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32">
        {/* Hero Copy */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Kalimoni · Juja Constituency · Kiambu County, Kenya</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-brand text-white leading-tight">
            Serene Luxury & Refined Hospitality in Juja
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl">
            Experience peaceful garden views, masterfully prepared Kenyan cuisine, executive boardroom facilities, and world-class suites just minutes off the Thika Superhighway.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <span>24 Bespoke Suites</span>
            <span aria-hidden="true">·</span>
            <span>Mugithi Terrace Restaurant</span>
            <span aria-hidden="true">·</span>
            <span>Executive Boardrooms</span>
            <span aria-hidden="true">·</span>
            <span>Secure 24/7 Parking</span>
          </div>
        </div>

        {/* Floating Quick Availability Booking Strip */}
        <div className="mt-12 lg:mt-16 bg-white text-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              onSearchAvailability();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
          >
            {/* Arrival Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Check-In Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={arrivalDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => onArrivalChange(e.target.value)}
                  required
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Check-Out Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={departureDate}
                  min={arrivalDate}
                  onChange={e => onDepartureChange(e.target.value)}
                  required
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Room Preference */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Suite Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => onCategoryChange(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Suites & Rooms</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (KES {c.defaultRate.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Guests
              </label>
              <select
                value={guestsCount}
                onChange={e => onGuestsChange(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
                <option value={4}>4 Adults / Family</option>
              </select>
            </div>

            {/* CTA Button */}
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Availability</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
