import React, { useState } from 'react';
import {
  BedDouble,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Sparkles,
  Edit2,
  Eye,
  Info,
  DollarSign
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { Room, OperationalStatus, OccupancyStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const RoomsView: React.FC = () => {
  const { rooms, categories, refreshAll, showToast } = useHotel();
  const { user, hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterOccupancy, setFilterOccupancy] = useState<string>('all');
  const [filterOperational, setFilterOperational] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoomForView, setSelectedRoomForView] = useState<Room | null>(null);

  // Form states for adding/editing room
  const [roomNumber, setRoomNumber] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [floor, setFloor] = useState(1);
  const [maxOccupancy, setMaxOccupancy] = useState(2);
  const [nightlyRate, setNightlyRate] = useState(4800);
  const [notes, setNotes] = useState('');
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>('Clean');
  const [occupancyStatus, setOccupancyStatus] = useState<OccupancyStatus>('Available');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageRooms = hasPermission(['Administrator', 'Manager']);

  // Reset form
  const handleOpenAdd = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setCategoryId(categories[0]?.id || '');
    setFloor(1);
    setMaxOccupancy(2);
    setNightlyRate(categories[0]?.defaultRate || 4800);
    setNotes('');
    setOperationalStatus('Clean');
    setOccupancyStatus('Available');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.number);
    setCategoryId(room.categoryId);
    setFloor(room.floor);
    setMaxOccupancy(room.maxOccupancy);
    setNightlyRate(room.nightlyRate);
    setNotes(room.notes || '');
    setOperationalStatus(room.operationalStatus);
    setOccupancyStatus(room.occupancyStatus);
    setIsAddModalOpen(true);
  };

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      setNightlyRate(cat.defaultRate);
      setMaxOccupancy(cat.maxOccupancy);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      showToast('Room number is mandatory', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, {
          categoryId,
          floor,
          maxOccupancy,
          nightlyRate,
          notes,
          operationalStatus,
          occupancyStatus
        });
        showToast(`Room ${editingRoom.number} updated successfully`, 'success');
      } else {
        await api.createRoom({
          number: roomNumber.trim(),
          categoryId,
          floor,
          maxOccupancy,
          nightlyRate,
          notes
        });
        showToast(`Room ${roomNumber} added to hotel inventory`, 'success');
      }
      setIsAddModalOpen(false);
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.notes && room.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFloor = filterFloor === 'all' || room.floor === Number(filterFloor);
    const matchesOccupancy = filterOccupancy === 'all' || room.occupancyStatus === filterOccupancy;
    const matchesOperational = filterOperational === 'all' || room.operationalStatus === filterOperational;
    const matchesCategory = filterCategory === 'all' || room.categoryId === filterCategory;

    return matchesSearch && matchesFloor && matchesOccupancy && matchesOperational && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Room Inventory & Status Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mugithi Grand Hotel: 24 active accommodations across Floors 1, 2, and 3.
          </p>
        </div>

        {canManageRooms && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by room #, category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Floor filter */}
          <div>
            <select
              value={filterFloor}
              onChange={e => setFilterFloor(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            >
              <option value="all">All Floors (1, 2, 3)</option>
              <option value="1">Floor 1 (Ground / Standard & Twin)</option>
              <option value="2">Floor 2 (Executive & Family)</option>
              <option value="3">Floor 3 (VIP & Penthouse)</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            >
              <option value="all">All Room Types</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} (KES {cat.defaultRate.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Occupancy Status filter */}
          <div>
            <select
              value={filterOccupancy}
              onChange={e => setFilterOccupancy(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            >
              <option value="all">All Occupancy States</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>

          {/* Operational Condition filter */}
          <div>
            <select
              value={filterOperational}
              onChange={e => setFilterOperational(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            >
              <option value="all">All Operational Readiness</option>
              <option value="Ready for Occupancy">Ready for Occupancy</option>
              <option value="Clean">Clean</option>
              <option value="Inspected">Inspected</option>
              <option value="Dirty">Dirty</option>
              <option value="Cleaning in Progress">Cleaning in Progress</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => (
          <div
            key={room.id}
            className={`bg-white rounded-xl border p-4 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
              room.occupancyStatus === 'Occupied'
                ? 'border-blue-200 ring-1 ring-blue-500/20'
                : room.operationalStatus === 'Dirty'
                ? 'border-orange-300 bg-orange-50/10'
                : room.operationalStatus === 'Maintenance'
                ? 'border-amber-300 bg-amber-50/10'
                : 'border-slate-200'
            }`}
          >
            <div>
              {/* Room Top Line */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-900 font-brand">
                    Room {room.number}
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Fl {room.floor}
                  </span>
                </div>
                <StatusBadge status={room.occupancyStatus} type="occupancy" size="sm" />
              </div>

              {/* Room Category & Rate */}
              <p className="text-xs font-bold text-amber-800">{room.categoryName}</p>
              <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                <span>KES {room.nightlyRate.toLocaleString()} / night</span>
                <span>Max {room.maxOccupancy} Guests</span>
              </div>

              {/* Operational Readiness Badge */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Readiness:</span>
                <StatusBadge status={room.operationalStatus} type="operational" size="sm" />
              </div>

              {/* Notes / Current occupancy */}
              {room.notes && (
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                  {room.notes}
                </p>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setSelectedRoomForView(room)}
                className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Details
              </button>

              {canManageRooms && (
                <button
                  onClick={() => handleOpenEdit(room)}
                  className="text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Room
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingRoom ? `Edit Room ${editingRoom.number}` : 'Add Room to Inventory'}
        subtitle="Manage room category, rates, floor location, and operational conditions."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Room Number *</label>
              <input
                type="text"
                value={roomNumber}
                disabled={!!editingRoom}
                onChange={e => setRoomNumber(e.target.value)}
                placeholder="e.g. 109"
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Floor Level</label>
              <input
                type="number"
                min={1}
                max={5}
                value={floor}
                onChange={e => setFloor(Number(e.target.value))}
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Room Category *</label>
            <select
              value={categoryId}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 bg-white"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — Default KES {c.defaultRate.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Agreed Nightly Rate (KES)</label>
              <input
                type="number"
                value={nightlyRate}
                onChange={e => setNightlyRate(Number(e.target.value))}
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Occupancy (Guests)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxOccupancy}
                onChange={e => setMaxOccupancy(Number(e.target.value))}
                required
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {editingRoom && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Occupancy State</label>
                <select
                  value={occupancyStatus}
                  onChange={e => setOccupancyStatus(e.target.value as OccupancyStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Housekeeping / Readiness</label>
                <select
                  value={operationalStatus}
                  onChange={e => setOperationalStatus(e.target.value as OperationalStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Ready for Occupancy">Ready for Occupancy</option>
                  <option value="Clean">Clean</option>
                  <option value="Inspected">Inspected</option>
                  <option value="Cleaning in Progress">Cleaning in Progress</option>
                  <option value="Dirty">Dirty</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Staff Notes / Condition</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Garden facing balcony, extra pillows placed, shower pressure tested."
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Room Detail Modal */}
      {selectedRoomForView && (
        <Modal
          isOpen={!!selectedRoomForView}
          onClose={() => setSelectedRoomForView(null)}
          title={`Room ${selectedRoomForView.number} Details`}
          subtitle={`${selectedRoomForView.categoryName} • Floor ${selectedRoomForView.floor}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Occupancy Status:</span>
                <div className="mt-1">
                  <StatusBadge status={selectedRoomForView.occupancyStatus} type="occupancy" size="sm" />
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Housekeeping Readiness:</span>
                <div className="mt-1">
                  <StatusBadge status={selectedRoomForView.operationalStatus} type="operational" size="sm" />
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Nightly Rate:</span>
                <span className="font-bold text-slate-900 text-sm">KES {selectedRoomForView.nightlyRate.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Max Guests:</span>
                <span className="font-bold text-slate-900">{selectedRoomForView.maxOccupancy} persons</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block mb-1">Staff Notes:</span>
              <p className="text-slate-600 bg-white p-2.5 rounded border border-slate-200 italic">
                {selectedRoomForView.notes || 'No specific operational notes recorded.'}
              </p>
            </div>

            {selectedRoomForView.assignedStaff && (
              <p className="text-slate-500">
                Assigned Housekeeper: <strong className="text-slate-800">{selectedRoomForView.assignedStaff}</strong>
              </p>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRoomForView(null)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
