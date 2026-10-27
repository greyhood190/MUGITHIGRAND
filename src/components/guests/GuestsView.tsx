import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  Calendar,
  AlertTriangle,
  History
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { Guest } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const GuestsView: React.FC = () => {
  const { guests, stays, reservations, invoices, refreshAll, showToast } = useHotel();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuestForView, setSelectedGuestForView] = useState<Guest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState<'National ID' | 'Passport' | 'Alien ID' | 'Driving License'>('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [nationality, setNationality] = useState('Kenyan');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Juja');
  const [preferences, setPreferences] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = hasPermission(['Administrator', 'Manager', 'Front Office Staff']);

  const handleOpenAdd = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setIdType('National ID');
    setIdNumber('');
    setNationality('Kenyan');
    setAddress('');
    setCity('Juja');
    setPreferences('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast('Guest name and telephone are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createGuest({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        idType,
        idNumber: idNumber.trim(),
        nationality: nationality.trim(),
        address: address.trim(),
        city: city.trim(),
        preferences: preferences.trim(),
        notes: notes.trim()
      });

      if (res.duplicateWarning) {
        showToast(res.duplicateWarning, 'warning');
      } else {
        showToast(`Guest profile created for ${fullName}`, 'success');
      }

      setIsAddModalOpen(false);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to register guest', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGuests = guests.filter(g =>
    g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.phone.includes(searchTerm) ||
    g.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Guest Registry & Historical Profiles
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized guest database with duplicate warning checks and stay histories.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Guest</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone (+254...), ID/Passport number, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Guest Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Telephone & Email</th>
                <th className="py-3 px-4">Identification</th>
                <th className="py-3 px-4">Nationality / Origin</th>
                <th className="py-3 px-4">Total Stays</th>
                <th className="py-3 px-4">Outstanding</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No guest profiles found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredGuests.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{g.fullName}</div>
                      <div className="text-[10px] text-slate-400">Registered: {g.registrationDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{g.phone}</div>
                      {g.email && <div className="text-[10px] text-slate-400">{g.email}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {g.idType}: {g.idNumber || 'Not verified'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {g.nationality} ({g.city || 'Juja'})
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{g.totalStays}</span> stay{g.totalStays !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4">
                      {g.outstandingBalance > 0 ? (
                        <span className="font-bold text-rose-700">
                          KES {g.outstandingBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Cleared</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedGuestForView(g)}
                        className="px-2.5 py-1 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile & History</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register New Guest Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Hotel Guest"
        subtitle="Collect mandatory guest contact and lawful identification particulars."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveGuest} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Samuel Wanjohi Mwangi"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telephone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +254 712 345 678"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ID Document Type</label>
              <select
                value={idType}
                onChange={e => setIdType(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="National ID">Kenya National ID</option>
                <option value="Passport">International Passport</option>
                <option value="Alien ID">Alien Registration Card</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ID / Passport Number</label>
              <input
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="e.g. 28910433"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                placeholder="Kenyan"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Juja / Nairobi / Thika"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Residential / Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Kalimoni, Juja or Westlands, Nairobi"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Guest Preferences & Notes</label>
            <textarea
              rows={2}
              value={preferences}
              onChange={e => setPreferences(e.target.value)}
              placeholder="e.g. Extra towels, quiet room, late check-out on Sundays"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Save Guest Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Guest Full Profile Modal */}
      {selectedGuestForView && (
        <Modal
          isOpen={!!selectedGuestForView}
          onClose={() => setSelectedGuestForView(null)}
          title={`Guest Profile: ${selectedGuestForView.fullName}`}
          subtitle={`Registered on ${selectedGuestForView.registrationDate}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Contact & ID card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block">Telephone:</span>
                <span className="font-bold text-slate-900">{selectedGuestForView.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email:</span>
                <span className="font-medium text-slate-800">{selectedGuestForView.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ID Document:</span>
                <span className="font-bold text-slate-900">{selectedGuestForView.idType}: {selectedGuestForView.idNumber || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nationality / City:</span>
                <span className="font-semibold text-slate-800">{selectedGuestForView.nationality} ({selectedGuestForView.city})</span>
              </div>
            </div>

            {/* Stay History List */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span>Recorded Stays & Reservations</span>
              </h4>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {reservations.filter(r => r.guestId === selectedGuestForView.id || r.guestPhone === selectedGuestForView.phone).length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No linked reservation records.
                  </div>
                ) : (
                  reservations
                    .filter(r => r.guestId === selectedGuestForView.id || r.guestPhone === selectedGuestForView.phone)
                    .map(r => (
                      <div key={r.id} className="p-3 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-slate-900">{r.reference}</strong> • Room {r.roomNumber || 'TBD'} ({r.categoryName})
                          <div className="text-[10px] text-slate-500">{r.checkInDate} to {r.checkOutDate} ({r.totalNights} nights)</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">KES {r.estimatedTotal.toLocaleString()}</span>
                          <span className="text-[10px] text-amber-700 font-semibold uppercase">{r.status}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Invoices List */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Tax Invoices & Billing Statements</span>
              </h4>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {invoices.filter(i => i.guestId === selectedGuestForView.id || i.guestPhone === selectedGuestForView.phone).length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No invoices generated yet for this guest.
                  </div>
                ) : (
                  invoices
                    .filter(i => i.guestId === selectedGuestForView.id || i.guestPhone === selectedGuestForView.phone)
                    .map(inv => (
                      <div key={inv.id} className="p-3 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-slate-900">{inv.invoiceNumber}</strong> • Room {inv.roomNumber}
                          <div className="text-[10px] text-slate-500">Issued: {inv.issueDate}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">KES {inv.grandTotal.toLocaleString()}</span>
                          <span className={`text-[10px] font-bold ${inv.balanceDue === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {inv.balanceDue === 0 ? 'PAID' : `BAL: KES ${inv.balanceDue.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedGuestForView(null)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
