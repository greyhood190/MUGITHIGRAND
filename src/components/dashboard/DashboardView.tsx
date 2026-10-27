import React, { useState } from 'react';
import {
  BedDouble,
  DoorOpen,
  CalendarCheck,
  Sparkles,
  Wrench,
  Users,
  CreditCard,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { StatusBadge } from '../common/StatusBadge';
import { NavPage } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (page: NavPage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { rooms, reservations, stays, invoices, payments, housekeepingTasks, auditLogs, reportsData } = useHotel();
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today');

  const stats = reportsData?.stats || {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.occupancyStatus === 'Available').length,
    occupiedRooms: rooms.filter(r => r.occupancyStatus === 'Occupied').length,
    reservedRooms: rooms.filter(r => r.occupancyStatus === 'Reserved').length,
    dirtyRooms: rooms.filter(r => r.operationalStatus === 'Dirty' || r.operationalStatus === 'Cleaning in Progress').length,
    maintenanceRooms: rooms.filter(r => r.operationalStatus === 'Maintenance').length,
    todayArrivals: reservations.filter(r => r.status === 'Confirmed').length,
    todayDepartures: stays.filter(s => s.status === 'Active').length,
    currentInHouseGuests: stays.filter(s => s.status === 'Active').length,
    confirmedReservations: reservations.filter(r => r.status === 'Confirmed').length,
    todayRevenue: payments.reduce((acc, c) => acc + c.amount, 0),
    monthRevenue: payments.reduce((acc, c) => acc + c.amount, 0),
    outstandingBalance: invoices.reduce((acc, c) => acc + c.balanceDue, 0),
    occupancyRate: rooms.length > 0 ? Math.round((rooms.filter(r => r.occupancyStatus === 'Occupied').length / rooms.length) * 100) : 0
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingArrivals = reservations.filter(r => r.status === 'Confirmed');
  const activeStays = stays.filter(s => s.status === 'Active');
  const dirtyOrProgressRooms = rooms.filter(r => r.operationalStatus === 'Dirty' || r.operationalStatus === 'Cleaning in Progress');
  const unpaidInvoices = invoices.filter(i => i.balanceDue > 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-brand">
            Hospitality Operations Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live telemetry for Mugithi Grand Hotel, Kalimoni, Juja.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterPeriod === 'today' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Shift
          </button>
          <button
            onClick={() => setFilterPeriod('week')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterPeriod === 'week' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilterPeriod('month')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterPeriod === 'month' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Rooms */}
        <div
          onClick={() => onNavigate('rooms')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Rooms</span>
            <BedDouble className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.totalRooms}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>3 Floors</span> | <span className="text-emerald-700 font-semibold">{stats.availableRooms} Available</span>
          </div>
        </div>

        {/* Occupied Rooms & Rate */}
        <div
          onClick={() => onNavigate('rooms')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Occupied</span>
            <DoorOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-900">{stats.occupiedRooms}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">
            {stats.occupancyRate}% Current Occupancy
          </div>
        </div>

        {/* Reserved */}
        <div
          onClick={() => onNavigate('reservations')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reserved</span>
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900">{stats.reservedRooms}</div>
          <div className="text-[11px] text-amber-700 mt-1">
            {stats.confirmedReservations} Confirmed
          </div>
        </div>

        {/* Housekeeping Turnover Required */}
        <div
          onClick={() => onNavigate('housekeeping')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Turnover Needed</span>
            <Sparkles className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-orange-950">{stats.dirtyRooms}</div>
          <div className="text-[11px] text-orange-700 font-medium mt-1">
            {stats.dirtyRooms > 0 ? 'Dirty / In Progress' : 'All Rooms Pristine'}
          </div>
        </div>

        {/* Maintenance */}
        <div
          onClick={() => onNavigate('housekeeping')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.maintenanceRooms}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Under technician repair
          </div>
        </div>

        {/* Current In-House Guests */}
        <div
          onClick={() => onNavigate('checkin-checkout')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">In-House</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900">{stats.currentInHouseGuests}</div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Active Stay Folders
          </div>
        </div>
      </div>

      {/* Financial Health Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Recorded Revenue */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Recorded Collections</span>
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-brand">
            KES {stats.todayRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified M-Pesa, Cash, Bank & Card settlements.
          </p>
        </div>

        {/* Outstanding Invoiced Balances */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Outstanding Receivables</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 font-brand">
            KES {stats.outstandingBalance.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pending final invoice settlement across {unpaidInvoices.length} active bills.
          </p>
        </div>

        {/* Occupancy Readiness Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Readiness vs Occupancy</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold text-slate-900">
              {rooms.filter(r => r.operationalStatus === 'Ready for Occupancy' || r.operationalStatus === 'Inspected').length}
            </div>
            <span className="text-xs text-slate-500">Rooms ready for immediate check-in</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden flex">
            <div
              style={{ width: `${(stats.occupiedRooms / stats.totalRooms) * 100}%` }}
              className="bg-blue-600 h-full"
              title="Occupied"
            />
            <div
              style={{ width: `${(stats.reservedRooms / stats.totalRooms) * 100}%` }}
              className="bg-amber-500 h-full"
              title="Reserved"
            />
            <div
              style={{ width: `${(stats.dirtyRooms / stats.totalRooms) * 100}%` }}
              className="bg-orange-500 h-full"
              title="Dirty"
            />
          </div>
        </div>
      </div>

      {/* Main Operational Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Arrivals Today */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm font-brand">
                Confirmed Arrivals ({upcomingArrivals.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('reservations')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              View All Reservations →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {upcomingArrivals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No pending arrivals scheduled for today.
              </div>
            ) : (
              upcomingArrivals.map(res => (
                <div key={res.id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{res.guestName}</span>
                      <span className="text-[10px] text-slate-500">({res.guestPhone})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Room {res.roomNumber || 'TBD'} • {res.categoryName} • {res.totalNights} Nights
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      KES {res.estimatedTotal.toLocaleString()}
                    </span>
                    <button
                      onClick={() => onNavigate('checkin-checkout')}
                      className="mt-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                    >
                      Process Check-In
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active In-House Guests / Expected Departures */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm font-brand">
                Active Stays ({activeStays.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('checkin-checkout')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Front Desk Desk →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {activeStays.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active in-house stays currently registered.
              </div>
            ) : (
              activeStays.map(stay => (
                <div key={stay.id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold">
                        Room {stay.roomNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{stay.guestName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Check-out Expected: <strong className="text-slate-700">{stay.expectedCheckOutDate}</strong> • Rate: KES {stay.nightlyRate.toLocaleString()}/night
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">
                      Incidentals: {stay.incidentalCharges.length}
                    </span>
                    <button
                      onClick={() => onNavigate('checkin-checkout')}
                      className="mt-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                    >
                      Checkout / Bill
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Housekeeping Action Queue */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <h3 className="font-bold text-slate-900 text-sm font-brand">
                Rooms Requiring Turnover ({dirtyOrProgressRooms.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('housekeeping')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Housekeeping Board →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {dirtyOrProgressRooms.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                All rooms are clean and ready for guests.
              </div>
            ) : (
              dirtyOrProgressRooms.map(rm => (
                <div key={rm.id} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-800 font-extrabold text-xs flex items-center justify-center">
                      {rm.number}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{rm.categoryName} (Floor {rm.floor})</div>
                      <div className="text-[11px] text-slate-500">{rm.notes || 'Routine cleaning required'}</div>
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={rm.operationalStatus} type="operational" size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Activity & Audit Trail Preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm font-brand">
                Recent Operations Log
              </h3>
            </div>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Full Audit Trail →
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-3.5 hover:bg-slate-50 transition text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.userName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-amber-700 font-semibold">
                  <span>{log.module}</span> • <span className="uppercase">{log.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
