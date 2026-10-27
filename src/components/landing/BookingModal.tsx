import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle2, ArrowRight, ShieldCheck, Phone, Mail, User } from 'lucide-react';
import { RoomCategory, Reservation } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { useHotel } from '../../context/HotelContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: RoomCategory[];
  initialCategory?: string;
  initialArrival?: string;
  initialDeparture?: string;
  initialGuests?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategory,
  initialArrival,
  initialDeparture,
  initialGuests
}) => {
  const { refreshAll, showToast } = useHotel();

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [categoryId, setCategoryId] = useState(initialCategory || categories[0]?.id || '');
  const [checkInDate, setCheckInDate] = useState(initialArrival || new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    if (initialDeparture) return initialDeparture;
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(initialGuests || 2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (initialCategory) setCategoryId(initialCategory);
    if (initialArrival) setCheckInDate(initialArrival);
    if (initialDeparture) setCheckOutDate(initialDeparture);
    if (initialGuests) setAdults(initialGuests);
  }, [initialCategory, initialArrival, initialDeparture, initialGuests]);

  const selectedCategoryObj = categories.find(c => c.id === categoryId) || categories[0];
  const rate = selectedCategoryObj ? selectedCategoryObj.defaultRate : 4800;

  // Calculate nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.max(0, checkOut.getTime() - checkIn.getTime());
  const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const estimatedTotal = totalNights * rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      showToast('Please provide your full name and contact telephone number', 'error');
      return;
    }

    if (checkOutDate <= checkInDate) {
      showToast('Check-out date must be after check-in date', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createReservation({
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim(),
        categoryId: selectedCategoryObj.id,
        checkInDate,
        checkOutDate,
        adults,
        children,
        nightlyRate: rate,
        specialRequests: specialRequests.trim(),
        bookingSource: 'Direct Agent',
        creatorName: 'Guest Direct Booking'
      });

      setConfirmedReservation(res);
      showToast('Your reservation request has been confirmed by our front desk!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete reservation inquiry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setConfirmedReservation(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={confirmedReservation ? "Reservation Confirmed!" : "Direct Stay Reservation"}
      subtitle={confirmedReservation ? "Mugithi Grand Hotel Front Desk Notification" : "Secure your suite directly with Mugithi Grand Hotel, Kalimoni, Juja."}
      maxWidth="2xl"
    >
      {confirmedReservation ? (
        <div className="space-y-4 text-xs py-2">
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-emerald-950 font-brand">
              Booking Confirmed: {confirmedReservation.reference}
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              Thank you, {confirmedReservation.guestName}. Your reservation is officially registered in our front desk inventory.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block">Suite Category:</span>
              <span className="font-bold text-slate-900">{confirmedReservation.categoryName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Stay Dates:</span>
              <span className="font-bold text-slate-900">
                {confirmedReservation.checkInDate} to {confirmedReservation.checkOutDate} ({confirmedReservation.totalNights} Nights)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Guests:</span>
              <span className="font-medium text-slate-800">
                {confirmedReservation.adults} Adult{confirmedReservation.adults > 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Accommodation:</span>
              <span className="font-extrabold text-slate-950 font-brand">
                KES {confirmedReservation.estimatedTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
            <span className="font-bold block mb-0.5">Check-In Instructions:</span>
            Standard check-in begins at 14:00 (2:00 PM). Cash, Safaricom M-Pesa (Till 8923411), and Visa/Mastercard payments are accepted at the front desk upon arrival.
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleModalClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
            >
              Done & Return to Website
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Guest particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="e.g. Peter Kamau"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telephone Number (+254...) *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  placeholder="e.g. +254 722 123 456"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
            <input
              type="email"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              placeholder="name@email.com"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Dates & Suite */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Arrival Date *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={checkInDate}
                onChange={e => setCheckInDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Departure Date *</label>
              <input
                type="date"
                required
                min={checkInDate}
                value={checkOutDate}
                onChange={e => setCheckOutDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Suite Category *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-amber-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — KES {c.defaultRate.toLocaleString()}/nt
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Adults</label>
              <select
                value={adults}
                onChange={e => setAdults(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
                <option value={4}>4 Adults</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Children</label>
              <select
                value={children}
                onChange={e => setChildren(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value={0}>No Children</option>
                <option value={1}>1 Child</option>
                <option value={2}>2 Children</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Special Requests</label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              placeholder="e.g. Quiet floor, late arrival around 8:00 PM, baby cot needed"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Pricing summary calculation */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Estimated Stay Total</span>
              <span className="text-xs text-slate-600 font-medium">
                {totalNights} Night{totalNights > 1 ? 's' : ''} × KES {rate.toLocaleString()} / night
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-slate-950 font-brand tabular-nums">
                KES {estimatedTotal.toLocaleString()}
              </span>
              <span className="block text-[10px] text-emerald-700 font-semibold">Pay on arrival</span>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming with Front Desk...' : 'Confirm Stay Reservation'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
