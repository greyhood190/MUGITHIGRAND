import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Shield,
  Mail,
  Phone,
  Power,
  CheckCircle2,
  XCircle,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { User, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const UsersView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useHotel();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Front Office Staff');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Front Desk & Guest Services');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      showToast('Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      await api.createUser({
        name,
        email,
        role,
        phone,
        department,
        staffName: currentUser?.name || 'Administrator'
      });
      showToast(`Staff account created for ${name}`, 'success');
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      await loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      showToast('Cannot deactivate your own active session account', 'error');
      return;
    }

    try {
      await api.toggleUserStatus(user.id);
      showToast(`User ${user.name} is now ${user.active ? 'Deactivated' : 'Active'}`, 'info');
      await loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Status toggle failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Staff Access & User Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin portal: provision authorized accounts, manage role permissions, and toggle access.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email & Phone</th>
                <th className="py-3 px-4">Role & Privileges</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-slate-400">ID: {u.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{u.email}</div>
                    <div className="text-[11px] text-slate-500">{u.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      <Shield className="w-3 h-3" /> {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {u.department}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {u.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{u.active ? 'Active' : 'Deactivated'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={u.id === currentUser?.id}
                      className={`px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 transition ${
                        u.active
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      } disabled:opacity-40`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{u.active ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Account Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Staff Account"
        subtitle="Assign role-based access for Mugithi Grand Hotel employee."
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Employee Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dennis Njuguna"
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Staff Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@mugithigrand.co.ke"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone (+254...)</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+254 7..."
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Role *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Administrator">Administrator (Full Access)</option>
                <option value="Manager">Manager (Operations & Reports)</option>
                <option value="Front Office Staff">Front Office Staff (Reservations & Check-In)</option>
                <option value="Housekeeping Staff">Housekeeping Staff (Room Status)</option>
                <option value="Finance Officer">Finance Officer (Billing & Ledger)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="Front Desk / Housekeeping / Accounts"
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow"
            >
              {isSubmitting ? 'Creating...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
