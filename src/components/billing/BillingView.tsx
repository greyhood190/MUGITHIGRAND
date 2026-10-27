import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Eye,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Invoice, InvoiceStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PrintableDocument } from '../common/PrintableDocument';

export const BillingView: React.FC = () => {
  const { invoices } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.roomNumber.includes(searchTerm) ||
      inv.guestPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((acc, c) => acc + c.grandTotal, 0);
  const totalReceived = invoices.reduce((acc, c) => acc + c.totalPaid, 0);
  const totalOutstanding = invoices.reduce((acc, c) => acc + c.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Billing, Tax Invoices & Statements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official KES hotel folios compliant with KRA VAT (16%) and Tourism Catering Levy (2%).
          </p>
        </div>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Invoiced</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block font-brand">
            KES {totalInvoiced.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">{invoices.length} issued folios</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Collected Revenue</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block font-brand">
            KES {totalReceived.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600">Settled via M-Pesa, Bank, Cash, Card</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">Outstanding Receivables</span>
          <span className="text-2xl font-black text-rose-800 mt-1 block font-brand">
            KES {totalOutstanding.toLocaleString()}
          </span>
          <span className="text-[10px] text-rose-600">Unsettled guest balances</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by invoice #, guest name, room #..."
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
            <option value="all">All Invoice Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Issued">Issued</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
            <option value="Voided">Voided</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Guest & Room</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Stay Duration</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No invoices matching query.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 font-brand">{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.guestName}</div>
                      <div className="text-[11px] text-slate-500">
                        Room {inv.roomNumber} ({inv.categoryName})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.issueDate}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.billableNights} night{inv.billableNights > 1 ? 's' : ''} ({inv.checkInDate} → {inv.checkOutDate})
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      KES {inv.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">
                      KES {inv.totalPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${inv.balanceDue > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                        KES {inv.balanceDue.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inv.status} type="invoice" size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Dialog */}
      {selectedInvoiceForPrint && (
        <PrintableDocument
          type="invoice"
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
};
