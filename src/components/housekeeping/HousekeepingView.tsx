import React, { useState } from 'react';
import {
  Sparkles,
  Wrench,
  CheckCircle2,
  Clock,
  Filter,
  UserCheck,
  AlertTriangle,
  Play,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { Room, OperationalStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const HousekeepingView: React.FC = () => {
  const { rooms, housekeepingTasks, refreshAll, showToast } = useHotel();
  const { user } = useAuth();

  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRoomForMaintenance, setSelectedRoomForMaintenance] = useState<Room | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Quick state transitions
  const handleTransitionStatus = async (room: Room, targetStatus: OperationalStatus, note?: string) => {
    setIsUpdating(true);
    try {
      await api.updateHousekeepingStatus({
        roomId: room.id,
        operationalStatus: targetStatus,
        staffName: user?.name || 'Housekeeping Staff',
        notes: note || room.notes
      });
      showToast(`Room ${room.number} operational state changed to ${targetStatus}`, 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Status transition failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReportMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForMaintenance) return;

    setIsUpdating(true);
    try {
      await api.updateHousekeepingStatus({
        roomId: selectedRoomForMaintenance.id,
        operationalStatus: 'Maintenance',
        staffName: user?.name || 'Housekeeping Staff',
        notes: maintenanceNotes || 'Reported maintenance issue'
      });
      showToast(`Room ${selectedRoomForMaintenance.number} placed under Maintenance hold`, 'warning');
      setSelectedRoomForMaintenance(null);
      setMaintenanceNotes('');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to place under maintenance', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRooms = rooms.filter(r => {
    const matchesFloor = filterFloor === 'all' || r.floor === Number(filterFloor);
    const matchesStatus = filterStatus === 'all' || r.operationalStatus === filterStatus;
    return matchesFloor && matchesStatus;
  });

  const dirtyCount = rooms.filter(r => r.operationalStatus === 'Dirty').length;
  const inProgressCount = rooms.filter(r => r.operationalStatus === 'Cleaning in Progress').length;
  const inspectedCount = rooms.filter(r => r.operationalStatus === 'Inspected' || r.operationalStatus === 'Ready for Occupancy').length;
  const maintenanceCount = rooms.filter(r => r.operationalStatus === 'Maintenance').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Housekeeping & Maintenance Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time room condition transitions: Dirty → In Progress → Clean → Inspected → Ready for Occupancy.
          </p>
        </div>
      </div>

      {/* KPI Tally Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-xs bg-orange-50/20">
          <div className="flex items-center justify-between text-orange-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dirty (Turnover Required)</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-2xl font-black text-orange-950 font-brand">{dirtyCount}</span>
          <span className="text-[10px] text-orange-700 block mt-0.5">Awaiting housekeeping duty</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs bg-indigo-50/20">
          <div className="flex items-center justify-between text-indigo-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cleaning in Progress</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-950 font-brand">{inProgressCount}</span>
          <span className="text-[10px] text-indigo-700 block mt-0.5">Housekeepers currently on site</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inspected / Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-950 font-brand">{inspectedCount}</span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Ready for front desk check-in</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Maintenance Hold</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-950 font-brand">{maintenanceCount}</span>
          <span className="text-[10px] text-amber-700 block mt-0.5">Plumbing, electrical, AC repair</span>
        </div>
      </div>

      {/* Filter row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <select
            value={filterFloor}
            onChange={e => setFilterFloor(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Floors (1, 2, 3)</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3 (VIP & Penthouse)</option>
          </select>
        </div>

        <div className="flex-1">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Housekeeping Statuses</option>
            <option value="Dirty">Dirty</option>
            <option value="Cleaning in Progress">Cleaning in Progress</option>
            <option value="Clean">Clean</option>
            <option value="Inspected">Inspected</option>
            <option value="Ready for Occupancy">Ready for Occupancy</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Housekeeping Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => (
          <div
            key={room.id}
            className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition ${
              room.operationalStatus === 'Dirty'
                ? 'border-orange-300 bg-orange-50/10 ring-1 ring-orange-500/20'
                : room.operationalStatus === 'Cleaning in Progress'
                ? 'border-indigo-300 bg-indigo-50/10'
                : room.operationalStatus === 'Maintenance'
                ? 'border-amber-300 bg-amber-50/10'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 font-brand">
                    Room {room.number}
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Fl {room.floor}
                  </span>
                </div>
                <StatusBadge status={room.occupancyStatus} type="occupancy" size="sm" />
              </div>

              <p className="text-xs font-semibold text-slate-700">{room.categoryName}</p>

              {/* Status Badge */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Readiness:</span>
                <StatusBadge status={room.operationalStatus} type="operational" size="sm" />
              </div>

              {/* Housekeeper info */}
              <div className="mt-2 text-[11px] text-slate-500">
                Staff: <strong className="text-slate-800">{room.assignedStaff || 'Unassigned'}</strong>
              </div>

              {room.notes && (
                <p className="mt-2 text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-2">
                  {room.notes}
                </p>
              )}
            </div>

            {/* Quick Status Shift Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              {room.operationalStatus === 'Dirty' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleTransitionStatus(room, 'Cleaning in Progress', 'Housekeeper started turnover')}
                  className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Cleaning</span>
                </button>
              )}

              {room.operationalStatus === 'Cleaning in Progress' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleTransitionStatus(room, 'Clean', 'Turnover finished; linen changed')}
                  className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Cleaned</span>
                </button>
              )}

              {room.operationalStatus === 'Clean' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleTransitionStatus(room, 'Inspected', 'Supervisor inspection passed')}
                  className="w-full py-1.5 px-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Supervisor Inspect</span>
                </button>
              )}

              {room.operationalStatus === 'Inspected' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleTransitionStatus(room, 'Ready for Occupancy', 'Certified ready for guest arrival')}
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Certify Ready for Occupancy</span>
                </button>
              )}

              {room.operationalStatus === 'Ready for Occupancy' && (
                <div className="text-[10px] text-center text-emerald-800 font-bold py-1 bg-emerald-50 rounded border border-emerald-200">
                  Ready for Guest Assignment
                </div>
              )}

              {room.operationalStatus === 'Maintenance' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleTransitionStatus(room, 'Dirty', 'Maintenance resolved; needs post-repair cleaning')}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repair Complete (Send to Clean)</span>
                </button>
              )}

              {/* Maintenance reporting trigger */}
              {room.operationalStatus !== 'Maintenance' && (
                <button
                  onClick={() => {
                    setSelectedRoomForMaintenance(room);
                    setMaintenanceNotes('');
                  }}
                  className="w-full text-center text-[11px] text-slate-500 hover:text-amber-700 font-medium py-1"
                >
                  Report Maintenance Issue
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Report Maintenance Issue Modal */}
      {selectedRoomForMaintenance && (
        <Modal
          isOpen={!!selectedRoomForMaintenance}
          onClose={() => setSelectedRoomForMaintenance(null)}
          title={`Report Maintenance: Room ${selectedRoomForMaintenance.number}`}
          subtitle="Room will be removed from allocatable inventory until repairs complete."
        >
          <form onSubmit={handleReportMaintenance} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Description *</label>
              <textarea
                required
                rows={3}
                value={maintenanceNotes}
                onChange={e => setMaintenanceNotes(e.target.value)}
                placeholder="e.g. Water heater tripping circuit breaker, shower mixer dripping, TV HDMI port loose"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedRoomForMaintenance(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow"
              >
                {isUpdating ? 'Saving...' : 'Place Room in Maintenance'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
