import React, { useState } from 'react';
import {
  DoorOpen,
  UserCheck,
  LogOut,
  Plus,
  ArrowRightLeft,
  Coffee,
  Receipt,
  Printer,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  DollarSign,
  UtensilsCrossed,
  ShieldAlert
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { Stay, Room, Reservation, Invoice, Payment } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { PrintableDocument } from '../common/PrintableDocument';
import { api } from '../../services/api';

export const CheckInOutView: React.FC = () => {
  const { stays, rooms, reservations, guests, settings, refreshAll, showToast } = useHotel();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'in-house' | 'arrivals' | 'departures'>('in-house');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isIncidentalModalOpen, setIsIncidentalModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);

  // Active targets
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Printable document preview state
  const [printDoc, setPrintDoc] = useState<{
    type: 'invoice' | 'receipt' | 'reservation' | 'registration';
    invoice?: Invoice;
    payment?: Payment;
    stay?: Stay;
  } | null>(null);

  // Check-In Form State
  const [checkInGuestName, setCheckInGuestName] = useState('');
  const [checkInGuestPhone, setCheckInGuestPhone] = useState('');
  const [checkInGuestIdType, setCheckInGuestIdType] = useState<'National ID' | 'Passport' | 'Alien ID'>('National ID');
  const [checkInGuestIdNumber, setCheckInGuestIdNumber] = useState('');
  const [checkInRoomId, setCheckInRoomId] = useState('');
  const [checkInNightlyRate, setCheckInNightlyRate] = useState(4800);
  const [checkInExpectedCheckOut, setCheckInExpectedCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkInDeposit, setCheckInDeposit] = useState(0);
  const [checkInDepositMethod, setCheckInDepositMethod] = useState<'M-Pesa' | 'Cash' | 'Card' | 'Bank Transfer'>('M-Pesa');
  const [checkInDepositRef, setCheckInDepositRef] = useState('');
  const [checkInNotes, setCheckInNotes] = useState('');

  // Room Transfer Form State
  const [transferTargetRoomId, setTransferTargetRoomId] = useState('');
  const [transferReason, setTransferReason] = useState('Guest requested higher floor / quiet view');

  // Incidental Posting Form State
  const [incidentalDesc, setIncidentalDesc] = useState('Mugithi Special Grilled Goat Ribs & Ugali');
  const [incidentalCategory, setIncidentalCategory] = useState<'Restaurant' | 'Bar / Lounge' | 'Café' | 'Room Service' | 'Laundry' | 'Other'>('Restaurant');
  const [incidentalQty, setIncidentalQty] = useState(1);
  const [incidentalPrice, setIncidentalPrice] = useState(1200);

  // Checkout Form State
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'M-Pesa' | 'Cash' | 'Card' | 'Bank Transfer'>('M-Pesa');
  const [checkoutPaymentRef, setCheckoutPaymentRef] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('Satisfactory stay completed.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter lists
  const activeStays = stays.filter(s => s.status === 'Active');
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingArrivals = reservations.filter(r => r.status === 'Confirmed');

  // Candidate rooms for check-in: Must be NOT Occupied and Operational Status MUST be 'Clean', 'Inspected', or 'Ready for Occupancy'
  const eligibleRoomsForCheckIn = rooms.filter(r => {
    if (r.occupancyStatus === 'Occupied') return false;
    if (r.operationalStatus === 'Dirty' || r.operationalStatus === 'Cleaning in Progress') return false;
    if (r.operationalStatus === 'Maintenance' || r.operationalStatus === 'Out of Service') return false;
    return true;
  });

  // Candidate rooms for transfer
  const eligibleRoomsForTransfer = rooms.filter(r => {
    if (selectedStay && r.id === selectedStay.roomId) return false;
    if (r.occupancyStatus === 'Occupied') return false;
    if (r.operationalStatus === 'Dirty' || r.operationalStatus === 'Maintenance') return false;
    return true;
  });

  // Open Check-in Modal from reservation
  const handleStartCheckInFromReservation = (res: Reservation) => {
    setSelectedReservation(res);
    setCheckInGuestName(res.guestName);
    setCheckInGuestPhone(res.guestPhone);
    setCheckInExpectedCheckOut(res.checkOutDate);
    setCheckInNightlyRate(res.nightlyRate);
    setCheckInRoomId(res.roomId || '');
    setCheckInDeposit(0);
    setCheckInDepositRef('');
    setCheckInNotes(`Checked in from reservation ${res.reference}`);
    setIsCheckInModalOpen(true);
  };

  // Open Walk-In Check-in Modal
  const handleStartWalkInCheckIn = () => {
    setSelectedReservation(null);
    setCheckInGuestName('');
    setCheckInGuestPhone('');
    setCheckInGuestIdNumber('');
    setCheckInRoomId('');
    setCheckInDeposit(0);
    setCheckInDepositRef('');
    setCheckInNotes('Front desk walk-in guest registration');
    setIsCheckInModalOpen(true);
  };

  const handleExecuteCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInGuestName || !checkInGuestPhone || !checkInRoomId) {
      showToast('Guest name, phone, and target room are required', 'error');
      return;
    }

    const targetRoom = rooms.find(r => r.id === checkInRoomId);
    if (!targetRoom) {
      showToast('Selected room invalid', 'error');
      return;
    }

    // Safety rule check: NEVER check in to dirty or occupied room
    if (targetRoom.occupancyStatus === 'Occupied') {
      showToast(`Room ${targetRoom.number} is currently occupied!`, 'error');
      return;
    }
    if (targetRoom.operationalStatus === 'Dirty' || targetRoom.operationalStatus === 'Cleaning in Progress') {
      showToast(`Room ${targetRoom.number} is dirty and cannot be assigned until cleaned & inspected`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newStay = await api.checkIn({
        reservationId: selectedReservation ? selectedReservation.id : undefined,
        guestName: checkInGuestName.trim(),
        guestPhone: checkInGuestPhone.trim(),
        guestIdType: checkInGuestIdType,
        guestIdNumber: checkInGuestIdNumber.trim(),
        roomId: checkInRoomId,
        nightlyRate: checkInNightlyRate,
        expectedCheckOutDate: checkInExpectedCheckOut,
        depositAmount: checkInDeposit,
        depositMethod: checkInDepositMethod,
        depositRef: checkInDepositRef,
        notes: checkInNotes,
        staffName: user?.name || 'Front Desk'
      });

      showToast(`Guest checked in to Room ${targetRoom.number} (Stay Ref: ${newStay.stayReference})`, 'success');
      setIsCheckInModalOpen(false);
      await refreshAll();

      // Show guest registration card for immediate printing
      setPrintDoc({
        type: 'registration',
        stay: newStay
      });
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Room Transfer
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStay || !transferTargetRoomId) {
      showToast('Select target room for transfer', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.transferRoom(selectedStay.id, {
        newRoomId: transferTargetRoomId,
        reason: transferReason,
        staffName: user?.name || 'Front Desk'
      });
      showToast(`Room transfer completed successfully. Old room flagged Dirty for turnover.`, 'success');
      setIsTransferModalOpen(false);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Transfer failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Incidental Posting
  const handleExecuteIncidental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStay || !incidentalDesc || incidentalPrice <= 0) {
      showToast('Enter valid description and price', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addIncidental(selectedStay.id, {
        description: incidentalDesc,
        category: incidentalCategory,
        quantity: incidentalQty,
        unitPrice: incidentalPrice,
        staffName: user?.name || 'Front Desk'
      });
      showToast(`Incidental charge of KES ${(incidentalQty * incidentalPrice).toLocaleString()} posted to Room ${selectedStay.roomNumber}`, 'success');
      setIsIncidentalModalOpen(false);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to post incidental', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Checkout Workflow
  const handleOpenCheckOutModal = (stay: Stay) => {
    setSelectedStay(stay);
    setCheckoutDiscount(0);
    setCheckoutPaymentMethod('M-Pesa');
    setCheckoutPaymentRef(`MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setCheckoutNotes('Thank you for choosing Mugithi Grand Hotel, Juja.');
    setIsCheckOutModalOpen(true);
  };

  const handleExecuteCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStay) return;

    setIsSubmitting(true);
    try {
      const res = await api.checkOut(selectedStay.id, {
        discountAmount: checkoutDiscount,
        paymentMethod: checkoutPaymentMethod,
        paymentReference: checkoutPaymentRef,
        notes: checkoutNotes,
        staffName: user?.name || 'Front Desk'
      });

      showToast(`Stay closed. Room ${selectedStay.roomNumber} set to Dirty for housekeeping.`, 'success');
      setIsCheckOutModalOpen(false);
      await refreshAll();

      // Show finalized tax invoice & receipt for printing
      setPrintDoc({
        type: 'invoice',
        invoice: res.invoice,
        payment: res.payment
      });
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper calculation for checkout preview
  const calculateCheckoutPreview = (stay: Stay) => {
    const checkIn = new Date(stay.checkInTime);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - checkIn.getTime());
    let billableNights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (billableNights < 1) billableNights = 1;

    const accommodationTotal = billableNights * stay.nightlyRate;
    const incidentalsTotal = stay.incidentalCharges.reduce((acc, c) => acc + c.total, 0);
    const subtotal = accommodationTotal + incidentalsTotal;
    const taxable = Math.max(0, subtotal - checkoutDiscount);
    const vat = Math.round(taxable * 0.16);
    const ctl = Math.round(taxable * 0.02);
    const grandTotal = taxable + vat + ctl;
    const depositPaid = stay.depositAmount || 0;
    const netDue = Math.max(0, grandTotal - depositPaid);

    return { billableNights, accommodationTotal, incidentalsTotal, subtotal, vat, ctl, grandTotal, depositPaid, netDue };
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Front Desk: Check-In & Departure Desk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process arrivals, manage room transfers, post restaurant charges, and finalize checkout statements.
          </p>
        </div>

        <button
          onClick={handleStartWalkInCheckIn}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition"
        >
          <UserCheck className="w-4 h-4" />
          <span>Walk-In Guest Check-In</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('in-house')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'in-house'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Current In-House Guests ({activeStays.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('arrivals')}
          className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'arrivals'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Expected Arrivals ({pendingArrivals.length})</span>
        </button>
      </div>

      {/* TAB 1: CURRENT IN-HOUSE GUESTS */}
      {activeTab === 'in-house' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in-house by room #, guest name, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStays
              .filter(s =>
                s.roomNumber.includes(searchTerm) ||
                s.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.guestPhone.includes(searchTerm)
              )
              .map(stay => {
                const totalIncidentals = stay.incidentalCharges.reduce((acc, c) => acc + c.total, 0);
                return (
                  <div
                    key={stay.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-extrabold text-sm flex items-center justify-center font-brand shadow-xs">
                            {stay.roomNumber}
                          </span>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{stay.guestName}</h3>
                            <span className="text-[10px] text-slate-400">{stay.stayReference}</span>
                          </div>
                        </div>
                        <StatusBadge status="Occupied" type="occupancy" size="sm" />
                      </div>

                      {/* Stay Info */}
                      <div className="py-3 text-xs space-y-1.5 text-slate-600">
                        <div className="flex justify-between">
                          <span>Room Category:</span>
                          <strong className="text-slate-900">{stay.categoryName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Nightly Rate:</span>
                          <span className="font-medium text-slate-800">KES {stay.nightlyRate.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Arrived:</span>
                          <span>{new Date(stay.checkInTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Departure:</span>
                          <span className="font-bold text-slate-900">{stay.expectedCheckOutDate}</span>
                        </div>
                        {stay.depositAmount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Advance Deposit:</span>
                            <span className="font-semibold">KES {stay.depositAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1 text-slate-700">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                            Incidentals ({stay.incidentalCharges.length}):
                          </span>
                          <strong className="text-slate-900">KES {totalIncidentals.toLocaleString()}</strong>
                        </div>
                      </div>

                      {/* Transfers note */}
                      {stay.transfers && stay.transfers.length > 0 && (
                        <div className="bg-amber-50 text-amber-800 p-2 rounded text-[11px] mb-3 border border-amber-200">
                          Transferred from Room {stay.transfers[0].fromRoomNumber} ({stay.transfers[0].reason})
                        </div>
                      )}
                    </div>

                    {/* Operational Actions */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setSelectedStay(stay);
                          setIsIncidentalModalOpen(true);
                        }}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold text-center transition flex items-center justify-center gap-1"
                      >
                        <UtensilsCrossed className="w-3 h-3 text-amber-600" />
                        <span>Add Charge</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedStay(stay);
                          setTransferTargetRoomId('');
                          setIsTransferModalOpen(true);
                        }}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-semibold text-center transition flex items-center justify-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-blue-600" />
                        <span>Transfer</span>
                      </button>

                      <button
                        onClick={() => handleOpenCheckOutModal(stay)}
                        className="py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[11px] font-bold text-center transition shadow-xs flex items-center justify-center gap-1"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Check-Out</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: EXPECTED ARRIVALS */}
      {activeTab === 'arrivals' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Category & Room</th>
                  <th className="py-3 px-4">Arrival Date</th>
                  <th className="py-3 px-4">Est. Total</th>
                  <th className="py-3 px-4">Special Requests</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingArrivals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No pending reservations scheduled for check-in.
                    </td>
                  </tr>
                ) : (
                  pendingArrivals.map(res => (
                    <tr key={res.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{res.reference}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{res.guestName}</div>
                        <div className="text-[11px] text-slate-500">{res.guestPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{res.categoryName}</div>
                        <div className="text-[10px] text-amber-700 font-semibold">
                          {res.roomNumber ? `Assigned: Room ${res.roomNumber}` : 'Room to be allocated'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{res.checkInDate}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        KES {res.estimatedTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic">
                        {res.specialRequests || 'Standard setup'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleStartCheckInFromReservation(res)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-xs"
                        >
                          Process Check-In
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHECK-IN MODAL */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title={selectedReservation ? `Process Check-In (${selectedReservation.reference})` : 'New Walk-In Guest Check-In'}
        subtitle="Operational requirement: Assign only clean, ready, unoccupied rooms."
        maxWidth="3xl"
      >
        <form onSubmit={handleExecuteCheckIn} className="space-y-4 text-xs">
          {/* Guest verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Guest Full Name *</label>
              <input
                type="text"
                required
                value={checkInGuestName}
                onChange={e => setCheckInGuestName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number (Kenyan / Int'l) *</label>
              <input
                type="text"
                required
                value={checkInGuestPhone}
                onChange={e => setCheckInGuestPhone(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Identification Document</label>
              <select
                value={checkInGuestIdType}
                onChange={e => setCheckInGuestIdType(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="National ID">Kenya National ID</option>
                <option value="Passport">International Passport</option>
                <option value="Alien ID">Alien Registration Card</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ID / Passport Number</label>
              <input
                type="text"
                placeholder="e.g. 29810344"
                value={checkInGuestIdNumber}
                onChange={e => setCheckInGuestIdNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Room Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Select Ready Room *
              </label>
              <select
                required
                value={checkInRoomId}
                onChange={e => {
                  setCheckInRoomId(e.target.value);
                  const r = rooms.find(item => item.id === e.target.value);
                  if (r) setCheckInNightlyRate(r.nightlyRate);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Choose Clean Room --</option>
                {eligibleRoomsForCheckIn.map(r => (
                  <option key={r.id} value={r.id}>
                    Room {r.number} ({r.categoryName} • Fl {r.floor} • {r.operationalStatus})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Only Clean / Ready rooms are listed.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nightly Room Rate (KES) *</label>
              <input
                type="number"
                required
                value={checkInNightlyRate}
                onChange={e => setCheckInNightlyRate(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Check-Out Date *</label>
              <input
                type="date"
                required
                min={todayStr}
                value={checkInExpectedCheckOut}
                onChange={e => setCheckInExpectedCheckOut(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Advance Deposit Section */}
          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
            <span className="block font-bold text-amber-950 mb-2">Advance Deposit Settlement (Optional):</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600">Deposit Amount (KES)</label>
                <input
                  type="number"
                  min={0}
                  value={checkInDeposit}
                  onChange={e => setCheckInDeposit(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600">Payment Channel</label>
                <select
                  value={checkInDepositMethod}
                  onChange={e => setCheckInDepositMethod(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="M-Pesa">Safaricom M-Pesa</option>
                  <option value="Cash">Cash (Front Desk)</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600">Transaction Reference / M-Pesa Code</label>
                <input
                  type="text"
                  placeholder="e.g. SJK489102X"
                  value={checkInDepositRef}
                  onChange={e => setCheckInDepositRef(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCheckInModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Recording Stay...' : 'Complete Check-In & Generate Card'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ROOM TRANSFER MODAL */}
      {selectedStay && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title={`Transfer Guest: ${selectedStay.guestName}`}
          subtitle={`Current Room: ${selectedStay.roomNumber} (${selectedStay.categoryName})`}
        >
          <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 text-xs">
              <span className="font-bold">Operational Rule:</span> Transferring moves the guest to the new room, adjusts nightly rates if applicable, and automatically flags the previous room ({selectedStay.roomNumber}) as <strong>Dirty</strong> for turnover.
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select New Available Room *</label>
              <select
                required
                value={transferTargetRoomId}
                onChange={e => setTransferTargetRoomId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Choose New Destination Room --</option>
                {eligibleRoomsForTransfer.map(r => (
                  <option key={r.id} value={r.id}>
                    Room {r.number} ({r.categoryName} • Fl {r.floor} • KES {r.nightlyRate.toLocaleString()}/nt)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Room Transfer *</label>
              <textarea
                required
                rows={2}
                value={transferReason}
                onChange={e => setTransferReason(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow disabled:opacity-50"
              >
                {isSubmitting ? 'Transferring...' : 'Execute Room Transfer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* INCIDENTAL POSTING MODAL */}
      {selectedStay && (
        <Modal
          isOpen={isIncidentalModalOpen}
          onClose={() => setIsIncidentalModalOpen(false)}
          title={`Post Restaurant / Incidental Charge`}
          subtitle={`Guest: ${selectedStay.guestName} • Room ${selectedStay.roomNumber}`}
        >
          <form onSubmit={handleExecuteIncidental} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Category</label>
                <select
                  value={incidentalCategory}
                  onChange={e => setIncidentalCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Restaurant">Mugithi Restaurant</option>
                  <option value="Bar / Lounge">Executive Bar & Lounge</option>
                  <option value="Café">Garden Terrace Café</option>
                  <option value="Room Service">24/7 Room Service</option>
                  <option value="Laundry">Dry Cleaning & Laundry</option>
                  <option value="Other">Conference / Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={incidentalQty}
                  onChange={e => setIncidentalQty(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Item Description *</label>
              <input
                type="text"
                required
                value={incidentalDesc}
                onChange={e => setIncidentalDesc(e.target.value)}
                placeholder="e.g. Nyama Choma Platter, Tusker Lager, Breakfast Special"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit Price (KES) *</label>
              <input
                type="number"
                min={1}
                required
                value={incidentalPrice}
                onChange={e => setIncidentalPrice(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">Total To Be Added to Room Folio:</span>
              <span className="text-sm font-extrabold text-slate-900">
                KES {(incidentalQty * incidentalPrice).toLocaleString()}
              </span>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsIncidentalModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Charge to Room'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* CHECK-OUT MODAL */}
      {selectedStay && isCheckOutModalOpen && (
        <Modal
          isOpen={isCheckOutModalOpen}
          onClose={() => setIsCheckOutModalOpen(false)}
          title={`Check-Out Settlement: Room ${selectedStay.roomNumber}`}
          subtitle={`Guest: ${selectedStay.guestName} (${selectedStay.stayReference})`}
          maxWidth="3xl"
        >
          {(() => {
            const preview = calculateCheckoutPreview(selectedStay);
            return (
              <form onSubmit={handleExecuteCheckOut} className="space-y-4 text-xs">
                {/* Folio Summary Breakdown */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wide text-[11px] mb-2">
                    Itemized Folio Computation:
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Accommodation ({preview.billableNights} billable nights @ KES {selectedStay.nightlyRate.toLocaleString()}):</span>
                    <strong className="text-slate-900">KES {preview.accommodationTotal.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Restaurant & Incidental Services ({selectedStay.incidentalCharges.length} items):</span>
                    <strong className="text-slate-900">KES {preview.incidentalsTotal.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-700">
                    <span>Folio Subtotal:</span>
                    <span className="font-semibold">KES {preview.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Value Added Tax - VAT (16%):</span>
                    <span>KES {preview.vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Catering Tourism Levy (2%):</span>
                    <span>KES {preview.ctl.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t border-b border-slate-300 text-sm font-black text-slate-950">
                    <span>Grand Invoiced Total:</span>
                    <span className="font-brand">KES {preview.grandTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Deposits Already Received:</span>
                    <span>-KES {preview.depositPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between bg-amber-100 p-2 rounded text-sm font-extrabold text-amber-950">
                    <span>Remaining Balance to Settle:</span>
                    <span className="font-brand">KES {preview.netDue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Courtesy Discount / Adjustment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Manager Courtesy Discount (KES)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={checkoutDiscount}
                      onChange={e => setCheckoutDiscount(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Payment Channel</label>
                    <select
                      value={checkoutPaymentMethod}
                      onChange={e => setCheckoutPaymentMethod(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="M-Pesa">Safaricom M-Pesa</option>
                      <option value="Cash">Cash Currency</option>
                      <option value="Card">Visa / Mastercard</option>
                      <option value="Bank Transfer">Bank Transfer (Equity Bank)</option>
                    </select>
                  </div>
                </div>

                {/* Transaction Reference & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      M-Pesa Code / Bank Ref / Receipt #
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutPaymentRef}
                      onChange={e => setCheckoutPaymentRef(e.target.value)}
                      placeholder="e.g. SJK902184M"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Folio Remarks</label>
                    <input
                      type="text"
                      value={checkoutNotes}
                      onChange={e => setCheckoutNotes(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="bg-orange-50 p-2.5 rounded border border-orange-200 text-orange-900 text-[11px]">
                  <strong>Automatic Housekeeping Trigger:</strong> Upon confirmation, Room {selectedStay.roomNumber} will immediately transition to <strong>Dirty</strong> condition and a cleaning turnover task will be assigned.
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsCheckOutModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow disabled:opacity-50"
                  >
                    {isSubmitting ? 'Closing Folio...' : 'Finalize Check-Out & Generate Tax Invoice'}
                  </button>
                </div>
              </form>
            );
          })()}
        </Modal>
      )}

      {/* DOCUMENT PRINT PREVIEW */}
      {printDoc && (
        <PrintableDocument
          type={printDoc.type}
          invoice={printDoc.invoice}
          payment={printDoc.payment}
          stay={printDoc.stay}
          onClose={() => setPrintDoc(null)}
        />
      )}
    </div>
  );
};
