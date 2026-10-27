import React, { useState } from 'react';
import { BedDouble, Users, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { RoomCategory } from '../../types';

interface RoomsSectionProps {
  categories: RoomCategory[];
  onSelectCategoryForBooking: (categoryId: string) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  categories,
  onSelectCategoryForBooking
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'suites' | 'standard'>('all');

  const filteredCategories = categories.filter(c => {
    if (selectedFilter === 'suites') {
      return c.name.toLowerCase().includes('suite');
    }
    if (selectedFilter === 'standard') {
      return !c.name.toLowerCase().includes('suite');
    }
    return true;
  });

  return (
    <section id="accommodations" className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-2">
              01. Accommodations & Living
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-brand">
              Bespoke Rooms & Executive Suites
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">
              Designed for serene comfort, high-speed connectivity, and uninterrupted rest after business meetings in Juja or leisure travel in Kiambu.
            </p>
          </div>

          {/* Interactive Filter Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 self-start md:self-end shadow-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Accommodations
            </button>
            <button
              onClick={() => setSelectedFilter('suites')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                selectedFilter === 'suites'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Suites & VIP
            </button>
            <button
              onClick={() => setSelectedFilter('standard')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                selectedFilter === 'standard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard & Twin
            </button>
          </div>
        </div>

        {/* Highlight Marquee: Deluxe & Presidential Suite with Real Photography */}
        <div className="mb-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[420px]">
            <img
              src="/src/assets/images/suite_deluxe_interior_1793074183979.jpg"
              alt="Deluxe Suite Bedroom Interior at Mugithi Grand Hotel"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white">
            <div>
              <div className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-2">
                Featured Signature Suite
              </div>
              <h3 className="text-2xl font-bold text-slate-950 font-brand">
                Deluxe Executive Suite
              </h3>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Featuring panoramic glass balconies overlooking the Kalimoni greenery, king-size orthopedic bed, hardwood flooring, complimentary high-speed fiber internet, and luxury ensuite rain shower.
              </p>

              {/* Unboxed Metadata Line */}
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Max 2 Guests</span>
                <span aria-hidden="true">·</span>
                <span>Breakfast Included</span>
                <span aria-hidden="true">·</span>
                <span>Private Balcony</span>
              </div>

              {/* Included Amenities List */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600" /> King Size Bed</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600" /> Smart DSTV</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600" /> Dedicated Desk</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600" /> Room Service</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Nightly Rack Rate</span>
                <span className="text-2xl font-black text-slate-950 font-brand tabular-nums">
                  KES 7,500
                </span>
                <span className="text-xs text-slate-500 ml-1">/ night</span>
              </div>

              <button
                onClick={() => {
                  const deluxe = categories.find(c => c.name.toLowerCase().includes('deluxe'));
                  onSelectCategoryForBooking(deluxe ? deluxe.id : categories[0]?.id);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2"
              >
                <span>Reserve Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px]">
                    {cat.name.includes('Suite') ? 'Luxury Suite' : 'Comfort Accommodation'}
                  </span>
                  <span className="text-slate-500 font-medium">
                    Up to {cat.maxOccupancy} Guests
                  </span>
                </div>

                <h4 className="text-lg font-bold text-slate-950 font-brand">
                  {cat.name}
                </h4>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {cat.description}
                </p>

                {/* Amenity text chips */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-500">
                  {cat.amenities.slice(0, 4).map((amenity, idx) => (
                    <span key={idx} className="after:content-['·'] after:ml-2 last:after:content-none">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Standard Rate</span>
                  <span className="text-lg font-black text-slate-950 font-brand tabular-nums">
                    KES {cat.defaultRate.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">/ nt</span>
                </div>

                <button
                  onClick={() => onSelectCategoryForBooking(cat.id)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition"
                >
                  Book Category
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
