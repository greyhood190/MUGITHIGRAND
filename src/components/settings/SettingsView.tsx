import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Save,
  CheckCircle2,
  Percent,
  Clock,
  Phone,
  Mail,
  MapPin,
  CreditCard
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { HotelSettings } from '../../types';
import { api } from '../../services/api';

export const SettingsView: React.FC = () => {
  const { settings, refreshAll, showToast } = useHotel();
  const [formData, setFormData] = useState<HotelSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  if (!formData) return null;

  const handleChange = (field: keyof HotelSettings, value: any) => {
    setFormData(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(formData);
      showToast('Hotel system settings updated successfully', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-brand">
            Hotel System Settings & Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure legal tax PINs, VAT/Catering levies, M-Pesa channels, and standard check-in/out policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Hotel Identity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 font-brand flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Establishment Brand & Location</span>
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hotel Name</label>
            <input
              type="text"
              value={formData.hotelName}
              onChange={e => handleChange('hotelName', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Brand Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={e => handleChange('tagline', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Constituency / County</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => handleChange('location', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Telephone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Financial & Tax Parameters */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 font-brand flex items-center gap-2 border-b border-slate-100 pb-3">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Taxation & Payment Channels</span>
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Kenya Revenue Authority (KRA) Tax PIN</label>
            <input
              type="text"
              value={formData.taxPin}
              onChange={e => handleChange('taxPin', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg uppercase font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Value Added Tax (VAT %)</label>
              <input
                type="number"
                value={formData.vatRate}
                onChange={e => handleChange('vatRate', Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Catering Tourism Levy (CTL %)</label>
              <input
                type="number"
                value={formData.cateringLevyRate}
                onChange={e => handleChange('cateringLevyRate', Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Safaricom M-Pesa Buy Goods Till</label>
              <input
                type="text"
                value={formData.mpesaTillNumber}
                onChange={e => handleChange('mpesaTillNumber', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">M-Pesa Paybill / Account</label>
              <input
                type="text"
                value={formData.mpesaPaybill}
                onChange={e => handleChange('mpesaPaybill', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bank Remittance Particulars</label>
            <input
              type="text"
              value={formData.bankAccountDetails}
              onChange={e => handleChange('bankAccountDetails', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Operating Hours & Check-in Times */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm text-slate-900 font-brand flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Operational Schedule & Check-in / Check-out Windows</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Check-In Time</label>
              <input
                type="time"
                value={formData.checkInTime}
                onChange={e => handleChange('checkInTime', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Standard: 14:00 (2:00 PM)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Check-Out Time</label>
              <input
                type="time"
                value={formData.checkOutTime}
                onChange={e => handleChange('checkOutTime', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Standard: 10:30 AM</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Currency Code</label>
              <input
                type="text"
                disabled
                value={formData.currency}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-100 font-bold"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Kenyan Shillings (KES)</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
