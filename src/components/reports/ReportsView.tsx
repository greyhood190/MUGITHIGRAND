import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  BedDouble,
  DollarSign,
  Printer,
  Calendar,
  Layers,
  PieChart
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export const ReportsView: React.FC = () => {
  const { rooms, reservations, stays, invoices, payments, categories } = useHotel();
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'all'>('monthly');

  // Operational metrics
  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(r => r.occupancyStatus === 'Occupied').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  const totalRevenue = payments.filter(p => p.status === 'Completed').reduce((acc, c) => acc + c.amount, 0);
  const totalInvoiced = invoices.reduce((acc, c) => acc + c.grandTotal, 0);
  const totalOutstanding = invoices.reduce((acc, c) => acc + c.balanceDue, 0);

  // ADR (Average Daily Rate) = Total Accommodation Revenue / Occupied Room Nights
  const accommodationTotal = invoices.reduce((acc, c) => acc + c.accommodationTotal, 0);
  const totalNights = invoices.reduce((acc, c) => acc + c.billableNights, 0) || 1;
  const adr = Math.round(accommodationTotal / totalNights);

  // RevPAR (Revenue Per Available Room) = Total Revenue / Total Available Rooms
  const revPar = totalRooms > 0 ? Math.round(accommodationTotal / totalRooms) : 0;

  // Breakdown by Category
  const categoryStats = categories.map(cat => {
    const catRooms = rooms.filter(r => r.categoryId === cat.id);
    const catInvoices = invoices.filter(i => i.categoryName === cat.name);
    const catRevenue = catInvoices.reduce((acc, c) => acc + c.grandTotal, 0);
    const occupiedInCat = catRooms.filter(r => r.occupancyStatus === 'Occupied').length;
    return {
      name: cat.name,
      totalRooms: catRooms.length,
      occupiedRooms: occupiedInCat,
      utilizationRate: catRooms.length > 0 ? Math.round((occupiedInCat / catRooms.length) * 100) : 0,
      revenue: catRevenue,
      defaultRate: cat.defaultRate
    };
  });

  // Breakdown by Payment Channel
  const paymentBreakdown = [
    { name: 'Safaricom M-Pesa', amount: payments.filter(p => p.method === 'M-Pesa').reduce((a, c) => a + c.amount, 0), color: 'bg-emerald-500' },
    { name: 'Bank Transfer (Equity)', amount: payments.filter(p => p.method === 'Bank Transfer').reduce((a, c) => a + c.amount, 0), color: 'bg-blue-600' },
    { name: 'Cash Currency', amount: payments.filter(p => p.method === 'Cash').reduce((a, c) => a + c.amount, 0), color: 'bg-amber-500' },
    { name: 'Card POS Terminals', amount: payments.filter(p => p.method === 'Card').reduce((a, c) => a + c.amount, 0), color: 'bg-purple-600' }
  ];

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Operational & Financial Management Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key hospitality KPIs: RevPAR, ADR, occupancy distribution, and payment reconciliations.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Management Summary</span>
        </button>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Realized Revenue</span>
          <span className="text-2xl font-black text-amber-700 font-brand mt-1 block">
            KES {totalRevenue.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">All verified settlements to date</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">ADR (Average Daily Rate)</span>
          <span className="text-2xl font-black text-slate-900 font-brand mt-1 block">
            KES {adr.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">Average accommodation rate per room night</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">RevPAR (Rev per Avail. Room)</span>
          <span className="text-2xl font-black text-slate-900 font-brand mt-1 block">
            KES {revPar.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">Yield across total 24 rooms</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">Current Occupancy Rate</span>
          <span className="text-2xl font-black text-blue-900 font-brand mt-1 block">
            {occupancyRate}%
          </span>
          <span className="text-[10px] text-blue-600">{occupiedCount} of {totalRooms} rooms active</span>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Category Performance Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm font-brand mb-4 flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-amber-600" />
            <span>Room Category Utilization & Revenue Yield</span>
          </h3>

          <div className="space-y-4">
            {categoryStats.map(cat => (
              <div key={cat.name} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-center text-xs mb-1">
                  <div>
                    <span className="font-bold text-slate-900">{cat.name}</span>
                    <span className="text-slate-400 text-[10px] ml-2">({cat.totalRooms} rooms total)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">KES {cat.revenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.utilizationRate}%` }}
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Current Utilization: {cat.utilizationRate}%</span>
                  <span>Rack Rate: KES {cat.defaultRate.toLocaleString()}/nt</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm font-brand mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Payment Channel Distribution</span>
          </h3>

          <div className="space-y-4">
            {paymentBreakdown.map(channel => {
              const pct = totalRevenue > 0 ? Math.round((channel.amount / totalRevenue) * 100) : 0;
              return (
                <div key={channel.name} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-slate-900">{channel.name}</span>
                    <span className="font-bold text-slate-900">
                      KES {channel.amount.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`${channel.color} h-full rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">Audit Reconciliation Note:</span>
            M-Pesa statements are reconciled daily against Till 8923411. Bank transfers are audited against Equity Bank Juja Branch credit slips.
          </div>
        </div>
      </div>
    </div>
  );
};
