import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  Smartphone,
  Banknote,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { Payment, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';
import { PrintableDocument } from '../common/PrintableDocument';
import { api } from '../../services/api';

export const PaymentsView: React.FC = () => {
  const { payments, invoices, stays, refreshAll, showToast } = useHotel();
  const { user, hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPaymentForPrint, setSelectedPaymentForPrint] = useState<Payment | null>(null);

  // New Payment Form
  const [paymentAmount, setPaymentAmount] = useState<number>(3500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('M-Pesa');
  const [guestName, setGuestName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRecordPayment = hasPermission(['Administrator', 'Manager', 'Front Office Staff', 'Finance Officer']);

  const handleOpenAdd = () => {
    setPaymentAmount(3500);
    setPaymentMethod('M-Pesa');
    setGuestName('');
    setTransactionRef(`SJK${Math.floor(100000 + Math.random() * 900000)}M`);
    setSelectedInvoiceId('');
    setPaymentNotes('Verified via M-Pesa Till 8923411');
    setIsAddModalOpen(true);
  };

  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find(i => i.id === invId);
    if (inv) {
      setGuestName(inv.guestName);
      setPaymentAmount(inv.balanceDue > 0 ? inv.balanceDue : inv.grandTotal);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      showToast('Enter a valid payment amount', 'error');
      return;
    }
    if (!guestName.trim()) {
      showToast('Guest name is required', 'error');
      return;
    }
    if (!transactionRef.trim()) {
      showToast('Transaction reference / M-Pesa code is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payment = await api.recordPayment({
        invoiceId: selectedInvoiceId || undefined,
        guestName: guestName.trim(),
        amount: paymentAmount,
        method: paymentMethod,
        transactionReference: transactionRef.trim(),
        notes: paymentNotes.trim(),
        staffName: user?.name || 'Front Desk Cashier'
      });

      showToast(`Payment of KES ${paymentAmount.toLocaleString()} recorded successfully`, 'success');
      setIsAddModalOpen(false);
      await refreshAll();

      // Show receipt for immediate printing
      setSelectedPaymentForPrint(payment);
    } catch (err: any) {
      showToast(err.message || 'Payment recording failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch =
      p.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.filter(p => p.status === 'Completed').reduce((acc, c) => acc + c.amount, 0);
  const mpesaCollected = payments.filter(p => p.method === 'M-Pesa' && p.status === 'Completed').reduce((acc, c) => acc + c.amount, 0);
  const cashCollected = payments.filter(p => p.method === 'Cash' && p.status === 'Completed').reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Payments Ledger & M-Pesa Verifications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-safe register of cash, Safaricom M-Pesa, card terminals, and bank transfers.
          </p>
        </div>

        {canRecordPayment && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Verified Payment</span>
          </button>
        )}
      </div>

      {/* Payment Channel Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">All Completed Payments</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 block font-brand">
            KES {totalCollected.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">{payments.length} audited ledger entries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" /> M-Pesa Collections (Till 8923411)
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-950 block font-brand">
            KES {mpesaCollected.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700">Instant Safaricom mobile transactions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" /> Cash Currency Received
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block font-brand">
            KES {cashCollected.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">Secured in front office safe</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by payment ref, guest name, M-Pesa confirmation code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="sm:w-56">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Payment Channels</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Cash">Cash</option>
            <option value="Card">Credit / Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Payment Ref</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Channel & Method</th>
                <th className="py-3 px-4">Transaction Code</th>
                <th className="py-3 px-4">Amount (KES)</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Receiving Staff</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 font-brand">
                      {p.paymentReference}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.guestName}</div>
                      {p.notes && <div className="text-[10px] text-slate-400 italic">{p.notes}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        p.method === 'M-Pesa'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : p.method === 'Bank Transfer'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {p.transactionReference}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 text-xs">
                      KES {p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {p.receivedBy}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPaymentForPrint(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Verified Settlement / Payment"
        subtitle="Post verified funds received from guests against an invoice or as room deposit."
        maxWidth="2xl"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          {/* Link to Invoice */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Link to Existing Invoice (Optional)
            </label>
            <select
              value={selectedInvoiceId}
              onChange={e => handleInvoiceSelect(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">-- No linked invoice (General deposit or direct settlement) --</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.guestName} (Room {inv.roomNumber}) — Balance Due: KES {inv.balanceDue.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Guest Full Name *</label>
              <input
                type="text"
                required
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="e.g. Peter Kamau"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount Paid (KES) *</label>
              <input
                type="number"
                min={1}
                required
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="M-Pesa">Safaricom M-Pesa (Till 8923411)</option>
                <option value="Cash">Cash (Front Desk)</option>
                <option value="Card">Credit / Debit Card POS</option>
                <option value="Bank Transfer">Bank Transfer (Equity Bank)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Transaction Reference / M-Pesa Confirmation Code *
              </label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="e.g. SJK489102X"
                className="w-full p-2 border border-slate-300 rounded-lg uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cashier Remarks / Notes</label>
            <input
              type="text"
              value={paymentNotes}
              onChange={e => setPaymentNotes(e.target.value)}
              placeholder="e.g. Room deposit received, customer SMS verified"
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
              {isSubmitting ? 'Recording...' : 'Save Payment & Print Receipt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt */}
      {selectedPaymentForPrint && (
        <PrintableDocument
          type="receipt"
          payment={selectedPaymentForPrint}
          onClose={() => setSelectedPaymentForPrint(null)}
        />
      )}
    </div>
  );
};
