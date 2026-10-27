import {
  User,
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
  HotelSettings
} from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('mgh_auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Authentication failed' }));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    const res = await fetch(`${API_BASE}/rooms`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load rooms');
    return res.json();
  },

  async createRoom(data: Partial<Room>): Promise<Room> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create room');
    }
    return res.json();
  },

  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update room');
    }
    return res.json();
  },

  async getCategories(): Promise<RoomCategory[]> {
    const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE}/reservations`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load reservations');
    return res.json();
  },

  async createReservation(data: any): Promise<Reservation> {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create reservation');
    }
    return res.json();
  },

  async updateReservation(id: string, data: any): Promise<Reservation> {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update reservation');
    }
    return res.json();
  },

  // Guests
  async getGuests(): Promise<Guest[]> {
    const res = await fetch(`${API_BASE}/guests`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load guests');
    return res.json();
  },

  async createGuest(data: any): Promise<{ guest: Guest; duplicateWarning?: string | null }> {
    const res = await fetch(`${API_BASE}/guests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register guest');
    }
    return res.json();
  },

  // Stays & Check-in / Checkout
  async getStays(): Promise<Stay[]> {
    const res = await fetch(`${API_BASE}/stays`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load stays');
    return res.json();
  },

  async checkIn(data: any): Promise<Stay> {
    const res = await fetch(`${API_BASE}/stays/checkin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Check-in failed');
    }
    return res.json();
  },

  async transferRoom(stayId: string, data: { newRoomId: string; reason: string; staffName: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/stays/${stayId}/transfer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Room transfer failed');
    }
    return res.json();
  },

  async addIncidental(stayId: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/stays/${stayId}/incidentals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to post incidental');
    }
    return res.json();
  },

  async checkOut(stayId: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/stays/${stayId}/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Checkout failed');
    }
    return res.json();
  },

  // Invoices & Payments
  async getInvoices(): Promise<Invoice[]> {
    const res = await fetch(`${API_BASE}/invoices`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load invoices');
    return res.json();
  },

  async getPayments(): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/payments`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load payments');
    return res.json();
  },

  async recordPayment(data: any): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record payment');
    }
    return res.json();
  },

  // Housekeeping
  async getHousekeeping(): Promise<{ tasks: HousekeepingTask[]; rooms: Room[] }> {
    const res = await fetch(`${API_BASE}/housekeeping`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load housekeeping board');
    return res.json();
  },

  async updateHousekeepingStatus(data: { roomId: string; operationalStatus: string; staffName: string; notes?: string }): Promise<Room> {
    const res = await fetch(`${API_BASE}/housekeeping/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update housekeeping status');
    }
    return res.json();
  },

  // Staff Tasks
  async getStaffTasks(): Promise<StaffTask[]> {
    const res = await fetch(`${API_BASE}/tasks`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load staff tasks');
    return res.json();
  },

  async createStaffTask(data: any): Promise<StaffTask> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },

  async updateStaffTask(id: string, data: any): Promise<StaffTask> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update task');
    }
    return res.json();
  },

  // Reports
  async getReports(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load operational reports');
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
  },

  async createUser(data: any): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
  },

  async toggleUserStatus(id: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}/toggle-status`, {
      method: 'PUT',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to update user status');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<HotelSettings> {
    const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(data: Partial<HotelSettings>): Promise<HotelSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  }
};
