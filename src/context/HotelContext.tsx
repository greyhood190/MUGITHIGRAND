import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Room,
  RoomCategory,
  Reservation,
  Guest,
  Stay,
  Invoice,
  Payment,
  HousekeepingTask,
  StaffTask,
  AuditLog,
  HotelSettings,
  DashboardStats
} from '../types';
import { api } from '../services/api';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface HotelContextType {
  rooms: Room[];
  categories: RoomCategory[];
  reservations: Reservation[];
  guests: Guest[];
  stays: Stay[];
  invoices: Invoice[];
  payments: Payment[];
  housekeepingTasks: HousekeepingTask[];
  staffTasks: StaffTask[];
  auditLogs: AuditLog[];
  settings: HotelSettings | null;
  reportsData: any;
  loading: boolean;
  toasts: ToastNotification[];
  refreshAll: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]);
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `tst-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        roomsData,
        categoriesData,
        reservationsData,
        guestsData,
        staysData,
        invoicesData,
        paymentsData,
        hkData,
        tasksData,
        logsData,
        settingsData,
        reports
      ] = await Promise.all([
        api.getRooms(),
        api.getCategories(),
        api.getReservations(),
        api.getGuests(),
        api.getStays(),
        api.getInvoices(),
        api.getPayments(),
        api.getHousekeeping(),
        api.getStaffTasks(),
        api.getAuditLogs(),
        api.getSettings(),
        api.getReports()
      ]);

      setRooms(roomsData);
      setCategories(categoriesData);
      setReservations(reservationsData);
      setGuests(guestsData);
      setStays(staysData);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setHousekeepingTasks(hkData.tasks || []);
      setStaffTasks(tasksData);
      setAuditLogs(logsData);
      setSettings(settingsData);
      setReportsData(reports);
    } catch (err: any) {
      console.error('Error refreshing hotel data:', err);
      showToast(err.message || 'Error updating data from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <HotelContext.Provider
      value={{
        rooms,
        categories,
        reservations,
        guests,
        stays,
        invoices,
        payments,
        housekeepingTasks,
        staffTasks,
        auditLogs,
        settings,
        reportsData,
        loading,
        toasts,
        refreshAll,
        showToast,
        removeToast
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
