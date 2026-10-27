import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Printer,
  Edit2,
  Eye,
  AlertCircle,
  Calendar,
  User,
  Phone,
  BedDouble
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { Reservation, ReservationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { PrintableDocument } from '../common/PrintableDocument';
import { api } from '../../services/api';

export const ReservationsView: React.FC = () => {
  const { reservations, rooms, categories, guests, refreshAll, showToast } = useHotel();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedReservationForPrint, setSelectedReservationForPrint] = useState<Reservation | null>(null);

  // New Reservation Form State
  const [selectedGuestType, setSelectedGuestType] = useState<'existing' | 'new'>('existing');
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [nightlyRate, setNightlyRate] = useState(categories[0]?.defaultRate || 4800);
  const [bookingSource, setBookingSource] = useState<'Front Desk Walk-in' | 'Phone Reservation' | 'Email Inquiry' | 'Corporate Partner' | 'Direct Agent'>('Phone Reservation');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle existing guest selection
  const handleExistingGuestSelect = (gId: string) => {
    setSelectedGuestId(gId);
    const g = guests.find(item => item.id === gId);
    if (g) {
      setGuestName(g.fullName);
      setGuestPhone(g.phone);
      setGuestEmail(g.email);
    }
  };

  const handleCategorySelect = (cId: string) => {
    setCategoryId(cId);
    setSelectedRoomId('');
    const cat = categories.find(c => c.id === cId);
    if (cat) {
      setNightlyRate(cat.defaultRate);
    }
  };

  // Find candidate rooms for this category that do not have overlap
  const availableRoomsForDates = rooms.filter(rm => {
    if (categoryId && rm.categoryId !== categoryId) return false;
    if (rm.operationalStatus === 'Maintenance' || rm.operationalStatus === 'Out of Service') return false;

    // Check conflict
    const hasConflict = reservations.some(res => {
      if (res.status === 'Cancelled' || res.status === 'Checked Out' || res.status === 'No Show') return false;
      if (res.roomId !== rm.id) return false;
      return res.checkInDate < checkOutDate && res.checkOutDate > checkInDate;
    });

    return !hasConflict;
  });

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      showToast('Guest full name and telephone number are required', 'error');
      return;
    }

    if (checkOutDate <= checkInDate) {
      showToast('Check-out date must be after check-in date', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createReservation({
        guestId: selectedGuestType === 'existing' ? selectedGuestId : undefined,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim(),
        categoryId,
        roomId: selectedRoomId || undefined,
        checkInDate,
        checkOutDate,
        adults,
        children,
        nightlyRate,
        bookingSource,
        specialRequests,
        creatorName: user?.name || 'Front Desk'
      });

      showToast('Reservation successfully created & locked in system', 'success');
      setIsNewModalOpen(false);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to create reservation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = async (res: Reservation) => {
    if (!window.confirm(`Are you sure you want to cancel reservation ${res.reference} for ${res.guestName}?`)) {
      return;
    }
    try {
      await api.updateReservation(res.id, {
        status: 'Cancelled',
        staffName: user?.name || 'Front Desk'
      });
      showToast(`Reservation ${res.reference} has been cancelled`, 'info');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  const handleConfirmReservation = async (res: Reservation) => {
    try {
      await api.updateReservation(res.id, {
        status: 'Confirmed',
        staffName: user?.name || 'Front Desk'
      });
      showToast(`Reservation ${res.reference} marked as Confirmed`, 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm', 'error');
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch =
      res.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.guestPhone.includes(searchTerm) ||
      (res.roomNumber && res.roomNumber.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Reservation Management & Bookings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time availability checking with automated double-booking prevention.
          </p>
        </div>

        <button
          onClick={() => {
            setGuestName('');
            setGuestPhone('');
            setGuestEmail('');
            setSelectedRoomId('');
            setIsNewModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by reference, guest name, phone, room #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="sm:w-56">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>
        </div>
      </div>

      {/* Reservation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Guest Information</th>
                <th className="py-3 px-4">Category & Room</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Total (KES)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source & Staff</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No reservations matching current filters.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 font-brand">{res.reference}</span>
                      <span className="block text-[10px] text-slate-400">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{res.guestName}</div>
                      <div className="text-[11px] text-slate-500">{res.guestPhone}</div>
                      {res.guestEmail && <div className="text-[10px] text-slate-400">{res.guestEmail}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{res.categoryName}</div>
                      <div className="text-[11px] text-slate-500">
                        {res.roomNumber ? (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                            <BedDouble className="w-3 h-3 text-amber-600" /> Room {res.roomNumber}
                          </span>
                        ) : (
                          <span className="text-amber-700 italic">Unallocated</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {res.checkInDate} <span className="text-slate-400">→</span> {res.checkOutDate}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {res.totalNights} night{res.totalNights > 1 ? 's' : ''} ({res.adults} adult{res.adults > 1 ? 's' : ''}{res.children > 0 ? `, ${res.children} child` : ''})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        KES {res.estimatedTotal.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        KES {res.nightlyRate.toLocaleString()}/nt
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={res.status} type="reservation" size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{res.bookingSource}</div>
                      <div className="text-[10px] text-slate-400">By {res.createdBy}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReservationForPrint(res)}
                          title="Print Booking Voucher"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {res.status === 'Pending' && (
                          <button
                            onClick={() => handleConfirmReservation(res)}
                            title="Confirm Booking"
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200"
                          >
                            Confirm
                          </button>
                        )}

                        {res.status !== 'Cancelled' && res.status !== 'Checked Out' && (
                          <button
                            onClick={() => handleCancelReservation(res)}
                            title="Cancel Reservation"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Reservation"
        subtitle="Server-validated room availability prevents double-booking."
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
          {/* Guest Selection Toggle */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="block font-bold text-slate-700 mb-2">Guest Profile Selection:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="guestType"
                  checked={selectedGuestType === 'existing'}
                  onChange={() => setSelectedGuestType('existing')}
                />
                <span>Select Registered Guest</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="guestType"
                  checked={selectedGuestType === 'new'}
                  onChange={() => setSelectedGuestType('new')}
                />
                <span>Register New Guest</span>
              </label>
            </div>

            {selectedGuestType === 'existing' ? (
              <div className="mt-3">
                <select
                  value={selectedGuestId}
                  onChange={e => handleExistingGuestSelect(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Choose Guest from Directory --</option>
                  {guests.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.fullName} ({g.phone}) — {g.idType}: {g.idNumber}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Waweru"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+254 7..."
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dates & Guests */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Check-in Date *</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={e => setCheckInDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Check-out Date *</label>
              <input
                type="date"
                required
                min={checkInDate}
                value={checkOutDate}
                onChange={e => setCheckOutDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Adults</label>
              <input
                type="number"
                min={1}
                max={6}
                value={adults}
                onChange={e => setAdults(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Children</label>
              <input
                type="number"
                min={0}
                max={5}
                value={children}
                onChange={e => setChildren(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Room Category & Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Room Category *</label>
              <select
                value={categoryId}
                onChange={e => handleCategorySelect(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (KES {c.defaultRate.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Allocate Specific Room (Optional)
              </label>
              <select
                value={selectedRoomId}
                onChange={e => setSelectedRoomId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Assign Later at Check-in --</option>
                {availableRoomsForDates.map(r => (
                  <option key={r.id} value={r.id}>
                    Room {r.number} (Floor {r.floor} • {r.operationalStatus})
                  </option>
                ))}
              </select>
              {availableRoomsForDates.length === 0 && (
                <span className="text-[10px] text-rose-600 block mt-1">
                  No rooms in this category available for chosen dates.
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Agreed Nightly Rate (KES)</label>
              <input
                type="number"
                required
                value={nightlyRate}
                onChange={e => setNightlyRate(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Source and Special Requests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Booking Channel</label>
              <select
                value={bookingSource}
                onChange={e => setBookingSource(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Phone Reservation">Phone Reservation</option>
                <option value="Front Desk Walk-in">Front Desk Walk-in</option>
                <option value="Email Inquiry">Email Inquiry</option>
                <option value="Corporate Partner">Corporate Partner</option>
                <option value="Direct Agent">Direct Agent</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Special Requests / Preferences</label>
              <input
                type="text"
                placeholder="e.g. Quiet floor, baby cot, late arrival at 8 PM"
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Validating Availability...' : 'Confirm & Save Reservation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Booking Voucher Modal */}
      {selectedReservationForPrint && (
        <PrintableDocument
          type="reservation"
          reservation={selectedReservationForPrint}
          onClose={() => setSelectedReservationForPrint(null)}
        />
      )}
    </div>
  );
};
