import React from 'react';
import { OccupancyStatus, OperationalStatus, ReservationStatus, InvoiceStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: string;
  type?: 'occupancy' | 'operational' | 'reservation' | 'invoice' | 'payment' | 'priority' | 'task';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'operational', size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (type === 'occupancy') {
    switch (status as OccupancyStatus) {
      case 'Available':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        dotColor = 'bg-emerald-500';
        break;
      case 'Reserved':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        dotColor = 'bg-amber-500';
        break;
      case 'Occupied':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        dotColor = 'bg-blue-600';
        break;
    }
  } else if (type === 'operational') {
    switch (status as OperationalStatus) {
      case 'Ready for Occupancy':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
        dotColor = 'bg-emerald-600';
        break;
      case 'Clean':
        colorClasses = 'bg-teal-50 text-teal-700 border-teal-200';
        dotColor = 'bg-teal-500';
        break;
      case 'Inspected':
        colorClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
        dotColor = 'bg-cyan-500';
        break;
      case 'Cleaning in Progress':
        colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse';
        dotColor = 'bg-indigo-500';
        break;
      case 'Dirty':
        colorClasses = 'bg-orange-50 text-orange-700 border-orange-300';
        dotColor = 'bg-orange-500';
        break;
      case 'Maintenance':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
        dotColor = 'bg-amber-600';
        break;
      case 'Out of Service':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        dotColor = 'bg-rose-600';
        break;
    }
  } else if (type === 'reservation') {
    switch (status as ReservationStatus) {
      case 'Confirmed':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        dotColor = 'bg-emerald-500';
        break;
      case 'Pending':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        dotColor = 'bg-amber-500';
        break;
      case 'Checked In':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
        dotColor = 'bg-blue-600';
        break;
      case 'Checked Out':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        dotColor = 'bg-slate-400';
        break;
      case 'Cancelled':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        dotColor = 'bg-rose-500';
        break;
      case 'No Show':
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
        dotColor = 'bg-purple-500';
        break;
    }
  } else if (type === 'invoice') {
    switch (status as InvoiceStatus) {
      case 'Paid':
        colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
        dotColor = 'bg-emerald-600';
        break;
      case 'Partially Paid':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
        dotColor = 'bg-amber-500';
        break;
      case 'Issued':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        dotColor = 'bg-blue-500';
        break;
      case 'Overdue':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
        dotColor = 'bg-rose-600';
        break;
      case 'Draft':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        dotColor = 'bg-slate-400';
        break;
      case 'Voided':
        colorClasses = 'bg-gray-100 text-gray-500 border-gray-200 line-through';
        dotColor = 'bg-gray-400';
        break;
    }
  } else if (type === 'priority') {
    switch (status) {
      case 'High':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        dotColor = 'bg-rose-600';
        break;
      case 'Medium':
      case 'Normal':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        dotColor = 'bg-amber-500';
        break;
      case 'Low':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        dotColor = 'bg-slate-400';
        break;
    }
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${sizeClasses} ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};
