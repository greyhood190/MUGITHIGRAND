import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  initialHotelSettings,
  initialUsers,
  initialCategories,
  initialRooms,
  initialGuests,
  initialReservations,
  initialStays,
  initialInvoices,
  initialPayments,
  initialHousekeepingTasks,
  initialStaffTasks,
  initialAuditLogs
} from './src/data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'hotel_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory + persisted database
interface HotelDatabase {
  settings: typeof initialHotelSettings;
  users: typeof initialUsers;
  categories: typeof initialCategories;
  rooms: typeof initialRooms;
  guests: typeof initialGuests;
  reservations: typeof initialReservations;
  stays: typeof initialStays;
  invoices: typeof initialInvoices;
  payments: typeof initialPayments;
  housekeepingTasks: typeof initialHousekeepingTasks;
  staffTasks: typeof initialStaffTasks;
  auditLogs: typeof initialAuditLogs;
}

let db: HotelDatabase;

function loadDatabase(): HotelDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded: HotelDatabase = JSON.parse(content);
      // Ensure all seed users (including Steve Munyue) exist in loaded database
      initialUsers.forEach(initUser => {
        if (!loaded.users.some(u => u.email.toLowerCase() === initUser.email.toLowerCase())) {
          loaded.users.unshift(initUser);
        }
      });
      return loaded;
    }
  } catch (err) {
    console.error('Failed to load DB file, reinitializing from seed data:', err);
  }

  const freshDb: HotelDatabase = {
    settings: initialHotelSettings,
    users: initialUsers,
    categories: initialCategories,
    rooms: initialRooms,
    guests: initialGuests,
    reservations: initialReservations,
    stays: initialStays,
    invoices: initialInvoices,
    payments: initialPayments,
    housekeepingTasks: initialHousekeepingTasks,
    staffTasks: initialStaffTasks,
    auditLogs: initialAuditLogs
  };

  saveDatabase(freshDb);
  return freshDb;
}

function saveDatabase(data: HotelDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB file:', err);
  }
}

db = loadDatabase();

function addAuditLog(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  module: string,
  details: string,
  ip = '127.0.0.1'
) {
  const log = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole: userRole as any,
    action,
    module,
    details,
    ipAddress: ip
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs.pop();
  }
  saveDatabase(db);
}

// Check room reservation overlap helper
// existing_check_in < requested_check_out AND existing_check_out > requested_check_in
function hasRoomReservationConflict(
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeReservationId?: string
): boolean {
  return db.reservations.some(res => {
    if (res.id === excludeReservationId) return false;
    if (res.roomId !== roomId) return false;
    if (res.status === 'Cancelled' || res.status === 'Checked Out' || res.status === 'No Show') {
      return false;
    }
    return res.checkInDate < checkOutDate && res.checkOutDate > checkInDate;
  });
}

const app = express();
app.use(express.json());

// API Routes

// 1. Auth & Session
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Username or email address is required' });
  }

  const query = (email || '').trim().toLowerCase();

  // Flexible lookup: exact email, username prefix, full name, or role keyword
  let user = db.users.find(u => {
    const uEmail = u.email.toLowerCase();
    const uPrefix = uEmail.split('@')[0];
    const uName = u.name.toLowerCase();
    const uRole = u.role.toLowerCase();

    return (
      uEmail === query ||
      uPrefix === query ||
      uName === query ||
      uName.includes(query) ||
      uRole === query ||
      (query === 'admin' && u.role === 'Administrator') ||
      (query === 'manager' && u.role === 'Manager') ||
      (query === 'reception' && u.role === 'Front Office Staff') ||
      (query === 'receptionist' && u.role === 'Front Office Staff') ||
      (query === 'frontdesk' && u.role === 'Front Office Staff') ||
      (query === 'housekeeping' && u.role === 'Housekeeping Staff') ||
      (query === 'finance' && u.role === 'Finance Officer') ||
      (query === 'cashier' && u.role === 'Finance Officer')
    );
  });

  // If user enters a custom email not in directory, provision as Administrator
  if (!user) {
    if (query.includes('@')) {
      const namePart = query.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      user = {
        id: `usr-admin-${Date.now()}`,
        name: namePart || 'Authorized Administrator',
        email: query,
        role: 'Administrator',
        phone: '+254 722 000 111',
        department: 'Executive Hotel Administration',
        active: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      db.users.unshift(user);
    } else {
      // Default to Administrator
      user = db.users.find(u => u.role === 'Administrator') || db.users[0];
    }
  }

  if (user && !user.active) {
    return res.status(403).json({ error: 'Your staff account has been deactivated. Contact an Administrator.' });
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveDatabase(db);

  addAuditLog(user.id, user.name, user.role, 'LOGIN', 'Authentication', `Staff member (${user.name}) logged in to MGHMS.`);

  // Safe base64 token
  const token = `MGH_${Buffer.from(user.id).toString('base64')}_${Date.now()}`;

  return res.json({
    user,
    token
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const rawToken = authHeader.replace('Bearer ', '').trim();

  let userId: string | null = null;
  if (rawToken.startsWith('MGH_')) {
    try {
      const parts = rawToken.split('_');
      if (parts[1]) {
        userId = Buffer.from(parts[1], 'base64').toString('utf-8');
      }
    } catch (e) {
      console.error('Error decoding token', e);
    }
  } else if (rawToken.startsWith('mgh-token-')) {
    // backward compatibility
    const stripped = rawToken.replace('mgh-token-', '');
    const lastDash = stripped.lastIndexOf('-');
    if (lastDash > 0) {
      userId = stripped.substring(0, lastDash);
    }
  }

  const user = db.users.find(u => u.id === userId);
  if (!user || !user.active) {
    // If not found, fallback to active administrator instead of logging out
    const fallbackUser = db.users.find(u => u.active);
    if (fallbackUser) {
      return res.json({ user: fallbackUser });
    }
    return res.status(401).json({ error: 'Session invalid or user inactive' });
  }
  return res.json({ user });
});

// 2. Rooms & Categories
app.get('/api/rooms', (req: Request, res: Response) => {
  return res.json(db.rooms);
});

app.post('/api/rooms', (req: Request, res: Response) => {
  const { number, categoryId, maxOccupancy, nightlyRate, floor, notes, assignedStaff } = req.body;
  if (!number || !categoryId) {
    return res.status(400).json({ error: 'Room number and category are required' });
  }

  if (db.rooms.some(r => r.number === number)) {
    return res.status(409).json({ error: `Room ${number} already exists in hotel inventory` });
  }

  const category = db.categories.find(c => c.id === categoryId);
  if (!category) {
    return res.status(400).json({ error: 'Selected room category is invalid' });
  }

  const newRoom = {
    id: `rm-${number}-${Date.now()}`,
    number,
    categoryId,
    categoryName: category.name,
    maxOccupancy: Number(maxOccupancy) || category.maxOccupancy,
    nightlyRate: Number(nightlyRate) || category.defaultRate,
    floor: Number(floor) || 1,
    occupancyStatus: 'Available' as const,
    operationalStatus: 'Clean' as const,
    notes: notes || '',
    assignedStaff: assignedStaff || '',
    active: true
  };

  db.rooms.push(newRoom);
  saveDatabase(db);
  addAuditLog('system', 'Staff Member', 'Administrator', 'CREATE_ROOM', 'Rooms', `Added Room ${newRoom.number} (${category.name}) to inventory.`);

  return res.status(201).json(newRoom);
});

app.put('/api/rooms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const room = db.rooms.find(r => r.id === id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const { categoryId, maxOccupancy, nightlyRate, floor, operationalStatus, occupancyStatus, notes, assignedStaff, active } = req.body;

  if (categoryId && categoryId !== room.categoryId) {
    const category = db.categories.find(c => c.id === categoryId);
    if (category) {
      room.categoryId = category.id;
      room.categoryName = category.name;
    }
  }

  if (maxOccupancy !== undefined) room.maxOccupancy = Number(maxOccupancy);
  if (nightlyRate !== undefined) room.nightlyRate = Number(nightlyRate);
  if (floor !== undefined) room.floor = Number(floor);
  if (operationalStatus !== undefined) room.operationalStatus = operationalStatus;
  if (occupancyStatus !== undefined) room.occupancyStatus = occupancyStatus;
  if (notes !== undefined) room.notes = notes;
  if (assignedStaff !== undefined) room.assignedStaff = assignedStaff;
  if (active !== undefined) room.active = Boolean(active);

  saveDatabase(db);
  addAuditLog('system', 'Staff Member', 'Manager', 'UPDATE_ROOM', 'Rooms', `Updated room details/status for Room ${room.number}.`);
  return res.json(room);
});

app.get('/api/categories', (req: Request, res: Response) => {
  return res.json(db.categories);
});

// 3. Reservations
app.get('/api/reservations', (req: Request, res: Response) => {
  return res.json(db.reservations);
});

app.post('/api/reservations', (req: Request, res: Response) => {
  const {
    guestId,
    guestName,
    guestPhone,
    guestEmail,
    categoryId,
    roomId,
    checkInDate,
    checkOutDate,
    adults,
    children,
    nightlyRate,
    specialRequests,
    bookingSource,
    creatorName
  } = req.body;

  if (!guestName || !guestPhone || !categoryId || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Guest name, phone, category, and dates are required' });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ error: 'Check-out date must be after check-in date' });
  }

  const category = db.categories.find(c => c.id === categoryId);
  const categoryName = category ? category.name : 'Standard Room';

  let assignedRoom = null;
  if (roomId) {
    assignedRoom = db.rooms.find(r => r.id === roomId);
    if (!assignedRoom) {
      return res.status(400).json({ error: 'Assigned room not found' });
    }

    // Check conflict
    const conflict = hasRoomReservationConflict(roomId, checkInDate, checkOutDate);
    if (conflict) {
      return res.status(409).json({
        error: `Room ${assignedRoom.number} is already booked for these dates (inclusive ${checkInDate} to ${checkOutDate}).`
      });
    }

    // Check operational condition
    if (assignedRoom.operationalStatus === 'Maintenance' || assignedRoom.operationalStatus === 'Out of Service') {
      return res.status(400).json({
        error: `Room ${assignedRoom.number} is currently under ${assignedRoom.operationalStatus} and cannot be assigned.`
      });
    }
  }

  // Calculate nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const rate = Number(nightlyRate) || (category ? category.defaultRate : 4500);
  const estimatedTotal = totalNights * rate;

  const refNumber = `MGH-RES-2026-${String(db.reservations.length + 101).padStart(3, '0')}`;

  const newReservation = {
    id: `res-${Date.now()}`,
    reference: refNumber,
    guestId: guestId || `gst-${Date.now()}`,
    guestName,
    guestPhone,
    guestEmail: guestEmail || '',
    categoryId,
    categoryName,
    roomId: assignedRoom ? assignedRoom.id : undefined,
    roomNumber: assignedRoom ? assignedRoom.number : undefined,
    checkInDate,
    checkOutDate,
    adults: Number(adults) || 1,
    children: Number(children) || 0,
    nightlyRate: rate,
    totalNights,
    estimatedTotal,
    specialRequests: specialRequests || '',
    bookingSource: bookingSource || 'Front Desk Walk-in',
    status: 'Confirmed' as const,
    createdBy: creatorName || 'Front Desk',
    createdAt: new Date().toISOString()
  };

  db.reservations.unshift(newReservation);

  // If room assigned and reservation is today, update room occupancy to Reserved
  const today = new Date().toISOString().split('T')[0];
  if (assignedRoom && checkInDate <= today && checkOutDate > today) {
    if (assignedRoom.occupancyStatus === 'Available') {
      assignedRoom.occupancyStatus = 'Reserved';
    }
  }

  saveDatabase(db);
  addAuditLog(
    'system',
    creatorName || 'Front Desk',
    'Front Office Staff',
    'CREATE_RESERVATION',
    'Reservations',
    `Created reservation ${refNumber} for ${guestName} (${totalNights} nights, Room ${newReservation.roomNumber || 'TBD'}).`
  );

  return res.status(201).json(newReservation);
});

app.put('/api/reservations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const resIndex = db.reservations.findIndex(r => r.id === id);
  if (resIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = db.reservations[resIndex];
  const { status, roomId, notes, staffName } = req.body;

  if (roomId && roomId !== reservation.roomId) {
    const room = db.rooms.find(r => r.id === roomId);
    if (!room) return res.status(400).json({ error: 'Room not found' });
    if (hasRoomReservationConflict(roomId, reservation.checkInDate, reservation.checkOutDate, reservation.id)) {
      return res.status(409).json({ error: `Room ${room.number} is unavailable for selected reservation dates` });
    }
    reservation.roomId = room.id;
    reservation.roomNumber = room.number;
  }

  if (status) {
    reservation.status = status;
    // Release room if cancelled
    if ((status === 'Cancelled' || status === 'No Show') && reservation.roomId) {
      const room = db.rooms.find(r => r.id === reservation.roomId);
      if (room && room.occupancyStatus === 'Reserved') {
        room.occupancyStatus = 'Available';
      }
    }
  }

  saveDatabase(db);
  addAuditLog(
    'system',
    staffName || 'Staff Member',
    'Front Office Staff',
    'UPDATE_RESERVATION',
    'Reservations',
    `Updated reservation ${reservation.reference} (Status: ${reservation.status}).`
  );
  return res.json(reservation);
});

// 4. Guests
app.get('/api/guests', (req: Request, res: Response) => {
  return res.json(db.guests);
});

app.post('/api/guests', (req: Request, res: Response) => {
  const { fullName, phone, email, idType, idNumber, nationality, address, city, preferences, notes } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ error: 'Full name and telephone number are required' });
  }

  // Warning for duplicate detection
  const duplicate = db.guests.find(
    g => g.phone === phone || (idNumber && g.idNumber && g.idNumber === idNumber)
  );

  const newGuest = {
    id: `gst-${Date.now()}`,
    fullName,
    phone,
    email: email || '',
    idType: idType || 'National ID',
    idNumber: idNumber || '',
    nationality: nationality || 'Kenyan',
    address: address || '',
    city: city || 'Juja',
    registrationDate: new Date().toISOString().split('T')[0],
    preferences: preferences || '',
    notes: notes || '',
    totalStays: 0,
    outstandingBalance: 0
  };

  db.guests.unshift(newGuest);
  saveDatabase(db);
  addAuditLog('system', 'Staff Member', 'Front Office Staff', 'REGISTER_GUEST', 'Guests', `Registered guest profile for ${fullName} (${phone}).`);

  return res.status(201).json({
    guest: newGuest,
    duplicateWarning: duplicate ? `Notice: A profile with phone ${phone} or ID already existed (${duplicate.fullName}).` : null
  });
});

// 5. Stays & Front Desk Check-in / Check-out
app.get('/api/stays', (req: Request, res: Response) => {
  return res.json(db.stays);
});

app.post('/api/stays/checkin', (req: Request, res: Response) => {
  const {
    reservationId,
    guestId,
    guestName,
    guestPhone,
    guestEmail,
    guestIdType,
    guestIdNumber,
    roomId,
    nightlyRate,
    expectedCheckOutDate,
    depositAmount,
    depositMethod,
    depositRef,
    notes,
    staffName
  } = req.body;

  const room = db.rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(400).json({ error: 'Target room not found' });
  }

  // Operational validation: MUST NOT check in to occupied, dirty, or maintenance rooms
  if (room.occupancyStatus === 'Occupied') {
    return res.status(400).json({ error: `Cannot check in: Room ${room.number} is currently OCCUPIED by another guest.` });
  }

  if (room.operationalStatus === 'Dirty' || room.operationalStatus === 'Cleaning in Progress') {
    return res.status(400).json({
      error: `Cannot check in: Room ${room.number} is DIRTY or being cleaned. Must be Inspected or Ready for Occupancy.`
    });
  }

  if (room.operationalStatus === 'Maintenance' || room.operationalStatus === 'Out of Service') {
    return res.status(400).json({
      error: `Cannot check in: Room ${room.number} is currently marked as ${room.operationalStatus}.`
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const checkOutStr = expectedCheckOutDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Create or retrieve guest
  let currentGuest = db.guests.find(g => g.id === guestId || g.phone === guestPhone);
  if (!currentGuest) {
    currentGuest = {
      id: `gst-${Date.now()}`,
      fullName: guestName,
      phone: guestPhone,
      email: guestEmail || '',
      idType: guestIdType || 'National ID',
      idNumber: guestIdNumber || '',
      nationality: 'Kenyan',
      address: 'Kalimoni, Juja',
      city: 'Juja',
      registrationDate: todayStr,
      totalStays: 1,
      outstandingBalance: 0
    };
    db.guests.unshift(currentGuest);
  } else {
    currentGuest.totalStays += 1;
    if (guestIdNumber) currentGuest.idNumber = guestIdNumber;
  }

  const stayRef = `MGH-STY-2026-${String(db.stays.length + 51).padStart(3, '0')}`;
  const rate = Number(nightlyRate) || room.nightlyRate;
  const deposit = Number(depositAmount) || 0;

  const newStay = {
    id: `sty-${Date.now()}`,
    stayReference: stayRef,
    reservationId: reservationId || undefined,
    guestId: currentGuest.id,
    guestName: currentGuest.fullName,
    guestPhone: currentGuest.phone,
    roomId: room.id,
    roomNumber: room.number,
    categoryName: room.categoryName,
    checkInTime: new Date().toISOString(),
    expectedCheckOutDate: checkOutStr,
    nightlyRate: rate,
    status: 'Active' as const,
    incidentalCharges: [],
    transfers: [],
    depositAmount: deposit,
    notes: notes || '',
    checkedInBy: staffName || 'Front Desk'
  };

  db.stays.unshift(newStay);

  // Update room status
  room.occupancyStatus = 'Occupied';
  room.notes = `Occupied by ${currentGuest.fullName} (${stayRef})`;

  // If there was a reservation, update its status
  if (reservationId) {
    const resv = db.reservations.find(r => r.id === reservationId);
    if (resv) {
      resv.status = 'Checked In';
    }
  }

  // If deposit provided, record payment
  if (deposit > 0) {
    const payRef = `PAY-MGH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment = {
      id: `pay-${Date.now()}`,
      paymentReference: payRef,
      stayId: newStay.id,
      guestId: currentGuest.id,
      guestName: currentGuest.fullName,
      amount: deposit,
      method: (depositMethod || 'M-Pesa') as any,
      transactionReference: depositRef || `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      receivedBy: staffName || 'Front Desk',
      status: 'Completed' as const,
      notes: `Advance check-in deposit for Room ${room.number}`
    };
    db.payments.unshift(newPayment);
  }

  saveDatabase(db);
  addAuditLog(
    'system',
    staffName || 'Front Desk Staff',
    'Front Office Staff',
    'CHECK_IN_GUEST',
    'Check-In / Check-Out',
    `Checked in ${currentGuest.fullName} into Room ${room.number} (Stay Ref: ${stayRef}, Deposit: KES ${deposit.toLocaleString()}).`
  );

  return res.status(201).json(newStay);
});

// Room Transfer
app.post('/api/stays/:id/transfer', (req: Request, res: Response) => {
  const { id } = req.params;
  const { newRoomId, reason, staffName } = req.body;

  const stay = db.stays.find(s => s.id === id && s.status === 'Active');
  if (!stay) {
    return res.status(404).json({ error: 'Active stay not found' });
  }

  const targetRoom = db.rooms.find(r => r.id === newRoomId);
  if (!targetRoom) {
    return res.status(404).json({ error: 'Target room not found' });
  }

  if (targetRoom.occupancyStatus === 'Occupied') {
    return res.status(400).json({ error: `Cannot transfer: Target Room ${targetRoom.number} is occupied.` });
  }

  if (targetRoom.operationalStatus === 'Dirty' || targetRoom.operationalStatus === 'Maintenance') {
    return res.status(400).json({ error: `Cannot transfer: Target Room ${targetRoom.number} is ${targetRoom.operationalStatus}.` });
  }

  const oldRoom = db.rooms.find(r => r.id === stay.roomId);
  const oldRoomNumber = stay.roomNumber;

  // Record transfer
  const transfer = {
    id: `tr-${Date.now()}`,
    fromRoomNumber: oldRoomNumber,
    toRoomNumber: targetRoom.number,
    transferredAt: new Date().toISOString(),
    reason: reason || 'Guest room change request',
    transferredBy: staffName || 'Front Desk'
  };

  stay.transfers.push(transfer);
  stay.roomId = targetRoom.id;
  stay.roomNumber = targetRoom.number;
  stay.categoryName = targetRoom.categoryName;
  stay.nightlyRate = targetRoom.nightlyRate;

  // Old room becomes dirty for housekeeping
  if (oldRoom) {
    oldRoom.occupancyStatus = 'Available';
    oldRoom.operationalStatus = 'Dirty';
    oldRoom.notes = `Guest transferred to ${targetRoom.number}. Housekeeping required.`;
  }

  // New room becomes occupied
  targetRoom.occupancyStatus = 'Occupied';
  targetRoom.notes = `Occupied by ${stay.guestName} (transferred from ${oldRoomNumber})`;

  saveDatabase(db);
  addAuditLog(
    'system',
    staffName || 'Front Desk',
    'Front Office Staff',
    'ROOM_TRANSFER',
    'Check-In / Check-Out',
    `Transferred guest ${stay.guestName} from Room ${oldRoomNumber} to Room ${targetRoom.number}. Reason: ${reason}`
  );

  return res.json({ stay, transfer });
});

// Post Incidental Charge
app.post('/api/stays/:id/incidentals', (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, category, quantity, unitPrice, staffName } = req.body;

  const stay = db.stays.find(s => s.id === id && s.status === 'Active');
  if (!stay) {
    return res.status(404).json({ error: 'Active stay not found' });
  }

  const qty = Number(quantity) || 1;
  const price = Number(unitPrice) || 0;
  const total = qty * price;

  const charge = {
    id: `inc-${Date.now()}`,
    stayId: stay.id,
    description: description || 'Restaurant Service',
    category: category || 'Restaurant',
    quantity: qty,
    unitPrice: price,
    total,
    timestamp: new Date().toISOString(),
    addedBy: staffName || 'Staff Member'
  };

  stay.incidentalCharges.push(charge);
  saveDatabase(db);

  addAuditLog(
    'system',
    staffName || 'Restaurant/Bar Staff',
    'Front Office Staff',
    'POST_INCIDENTAL',
    'Restaurant / Incidentals',
    `Posted ${charge.description} (KES ${total}) to Room ${stay.roomNumber} (${stay.guestName}).`
  );

  return res.status(201).json(charge);
});

// Checkout Workflow
app.post('/api/stays/:id/checkout', (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    discountAmount,
    paymentMethod,
    paymentReference,
    notes,
    staffName,
    allowBalancePostpone
  } = req.body;

  const stay = db.stays.find(s => s.id === id && s.status === 'Active');
  if (!stay) {
    return res.status(404).json({ error: 'Active stay not found or already checked out' });
  }

  const room = db.rooms.find(r => r.id === stay.roomId);
  const guest = db.guests.find(g => g.id === stay.guestId);

  // Calculate billable accommodation nights
  const checkInDate = new Date(stay.checkInTime);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
  let billableNights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (billableNights < 1) billableNights = 1;

  const accommodationTotal = billableNights * stay.nightlyRate;
  const incidentalsTotal = stay.incidentalCharges.reduce((acc, cur) => acc + cur.total, 0);
  const subtotal = accommodationTotal + incidentalsTotal;

  // Taxes
  const vatRate = db.settings.vatRate || 16;
  const cateringLevyRate = db.settings.cateringLevyRate || 2;
  const discount = Math.max(0, Number(discountAmount) || 0);

  const taxableAmount = Math.max(0, subtotal - discount);
  const vatAmount = Math.round(taxableAmount * (vatRate / 100));
  const cateringLevyAmount = Math.round(taxableAmount * (cateringLevyRate / 100));
  const grandTotal = taxableAmount + vatAmount + cateringLevyAmount;

  // Retrieve previous payments / deposits
  const existingPayments = db.payments.filter(p => p.stayId === stay.id && p.status === 'Completed');
  const depositPaid = existingPayments.reduce((acc, cur) => acc + cur.amount, 0);

  const remainingBeforeCheckout = Math.max(0, grandTotal - depositPaid);

  let newPaymentRecord = null;
  if (remainingBeforeCheckout > 0) {
    if (!paymentMethod && !allowBalancePostpone) {
      return res.status(400).json({
        error: `Outstanding balance of KES ${remainingBeforeCheckout.toLocaleString()} requires payment recording or authorized ledger approval.`
      });
    }

    if (paymentMethod) {
      const payRef = `PAY-MGH-${Math.floor(1000 + Math.random() * 9000)}`;
      newPaymentRecord = {
        id: `pay-${Date.now()}`,
        paymentReference: payRef,
        stayId: stay.id,
        guestId: stay.guestId,
        guestName: stay.guestName,
        amount: remainingBeforeCheckout,
        method: paymentMethod as any,
        transactionReference: paymentReference || `KES-TXN-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        receivedBy: staffName || 'Front Desk',
        status: 'Completed' as const,
        notes: `Final checkout settlement for Room ${stay.roomNumber}`
      };
      db.payments.unshift(newPaymentRecord);
    }
  }

  const totalPaid = depositPaid + (newPaymentRecord ? newPaymentRecord.amount : 0);
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  // Close stay
  stay.status = 'Checked Out';
  stay.actualCheckOutTime = now.toISOString();
  stay.checkedOutBy = staffName || 'Front Desk';

  // Room MUST NOT be automatically clean! It must be marked Dirty / Cleaning in Progress
  if (room) {
    room.occupancyStatus = 'Available';
    room.operationalStatus = 'Dirty';
    room.notes = `Checked out at ${now.toLocaleTimeString()}. Requires full housekeeping turnover before next guest.`;

    // Add Housekeeping task
    const hkTask = {
      id: `hk-${Date.now()}`,
      roomId: room.id,
      roomNumber: room.number,
      categoryName: room.categoryName,
      floor: room.floor,
      priority: 'High' as const,
      status: 'Pending' as const,
      assignedTo: 'Housekeeping Duty Team',
      notes: `Checkout turnover after ${stay.guestName}. Clean, sanitize, replace linens.`,
      requestedAt: now.toISOString()
    };
    db.housekeepingTasks.unshift(hkTask);
  }

  // Update reservation status if present
  if (stay.reservationId) {
    const resv = db.reservations.find(r => r.id === stay.reservationId);
    if (resv) {
      resv.status = 'Checked Out';
    }
  }

  // Generate finalized invoice
  const invNumber = `INV-2026-${String(db.invoices.length + 185).padStart(4, '0')}`;
  const invoiceItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    type: 'Accommodation' | 'Incidental' | 'Tax' | 'Discount';
  }> = [
    {
      id: `li-acc-${Date.now()}`,
      description: `${stay.categoryName} Accommodation (${billableNights} nights @ KES ${stay.nightlyRate.toLocaleString()})`,
      quantity: billableNights,
      unitPrice: stay.nightlyRate,
      amount: accommodationTotal,
      type: 'Accommodation' as const
    },
    ...stay.incidentalCharges.map(inc => ({
      id: `li-inc-${inc.id}`,
      description: `${inc.description} (${inc.category})`,
      quantity: inc.quantity,
      unitPrice: inc.unitPrice,
      amount: inc.total,
      type: 'Incidental' as const
    }))
  ];

  if (discount > 0) {
    invoiceItems.push({
      id: `li-disc-${Date.now()}`,
      description: 'Authorized Stay Discount / Adjustment',
      quantity: 1,
      unitPrice: -discount,
      amount: -discount,
      type: 'Discount' as const
    });
  }

  invoiceItems.push(
    {
      id: `li-vat-${Date.now()}`,
      description: `Value Added Tax - VAT (${vatRate}%)`,
      quantity: 1,
      unitPrice: vatAmount,
      amount: vatAmount,
      type: 'Tax' as const
    },
    {
      id: `li-ctl-${Date.now()}`,
      description: `Catering Tourism Levy (${cateringLevyRate}%)`,
      quantity: 1,
      unitPrice: cateringLevyAmount,
      amount: cateringLevyAmount,
      type: 'Tax' as const
    }
  );

  const finalInvoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber: invNumber,
    issueDate: now.toISOString().split('T')[0],
    stayId: stay.id,
    reservationId: stay.reservationId,
    guestId: stay.guestId,
    guestName: stay.guestName,
    guestPhone: stay.guestPhone,
    guestEmail: (guest && guest.email) || '',
    guestIdNumber: (guest && guest.idNumber) || '',
    roomNumber: stay.roomNumber,
    categoryName: stay.categoryName,
    checkInDate: stay.checkInTime.split('T')[0],
    checkOutDate: now.toISOString().split('T')[0],
    billableNights,
    nightlyRate: stay.nightlyRate,
    accommodationTotal,
    incidentalsTotal,
    subtotal,
    vatRate,
    vatAmount,
    cateringLevyRate,
    cateringLevyAmount,
    discountAmount: discount,
    grandTotal,
    totalPaid,
    balanceDue,
    status: (balanceDue === 0 ? 'Paid' : 'Partially Paid') as any,
    currency: 'KES',
    items: invoiceItems,
    notes: notes || 'Thank you for choosing Mugithi Grand Hotel, Kalimoni, Juja.',
    createdBy: staffName || 'Front Desk',
    createdAt: now.toISOString()
  };

  db.invoices.unshift(finalInvoice);

  if (guest && balanceDue > 0) {
    guest.outstandingBalance += balanceDue;
  }

  saveDatabase(db);

  addAuditLog(
    'system',
    staffName || 'Front Desk',
    'Front Office Staff',
    'CHECK_OUT_GUEST',
    'Check-In / Check-Out',
    `Checked out ${stay.guestName} from Room ${stay.roomNumber}. Final Invoice: ${invNumber} (Total: KES ${grandTotal.toLocaleString()}, Paid: KES ${totalPaid.toLocaleString()}, Balance: KES ${balanceDue.toLocaleString()}). Room marked Dirty.`
  );

  return res.json({
    stay,
    invoice: finalInvoice,
    payment: newPaymentRecord,
    roomStatus: room ? room.operationalStatus : 'Dirty'
  });
});

// 6. Invoices & Billing
app.get('/api/invoices', (req: Request, res: Response) => {
  return res.json(db.invoices);
});

// 7. Payments
app.get('/api/payments', (req: Request, res: Response) => {
  return res.json(db.payments);
});

app.post('/api/payments', (req: Request, res: Response) => {
  const {
    invoiceId,
    stayId,
    guestId,
    guestName,
    amount,
    method,
    transactionReference,
    notes,
    staffName
  } = req.body;

  const amt = Number(amount);
  if (!amt || amt <= 0) {
    return res.status(400).json({ error: 'Valid payment amount is required' });
  }

  const payRef = `PAY-MGH-${Math.floor(1000 + Math.random() * 9000)}`;

  const payment = {
    id: `pay-${Date.now()}`,
    paymentReference: payRef,
    invoiceId: invoiceId || undefined,
    stayId: stayId || undefined,
    guestId: guestId || 'gst-walkin',
    guestName: guestName || 'Walk-in Guest',
    amount: amt,
    method: (method || 'Cash') as any,
    transactionReference: transactionReference || `TXN-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    receivedBy: staffName || 'Front Office',
    status: 'Completed' as const,
    notes: notes || ''
  };

  db.payments.unshift(payment);

  // If invoice linked, update total paid and balance
  if (invoiceId) {
    const inv = db.invoices.find(i => i.id === invoiceId);
    if (inv) {
      inv.totalPaid += amt;
      inv.balanceDue = Math.max(0, inv.grandTotal - inv.totalPaid);
      if (inv.balanceDue === 0) {
        inv.status = 'Paid';
      } else {
        inv.status = 'Partially Paid';
      }
    }
  }

  saveDatabase(db);
  addAuditLog(
    'system',
    staffName || 'Finance/Front Desk',
    'Finance Officer',
    'RECORD_PAYMENT',
    'Payments',
    `Recorded payment ${payRef} of KES ${amt.toLocaleString()} via ${method} (Ref: ${payment.transactionReference}) for ${guestName}.`
  );

  return res.status(201).json(payment);
});

// 8. Housekeeping
app.get('/api/housekeeping', (req: Request, res: Response) => {
  return res.json({
    tasks: db.housekeepingTasks,
    rooms: db.rooms
  });
});

app.post('/api/housekeeping/status', (req: Request, res: Response) => {
  const { roomId, operationalStatus, staffName, notes } = req.body;
  const room = db.rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const oldStatus = room.operationalStatus;
  room.operationalStatus = operationalStatus;
  room.lastCleanedAt = new Date().toISOString();
  if (notes) room.notes = notes;
  if (staffName) room.assignedStaff = staffName;

  saveDatabase(db);
  addAuditLog(
    'system',
    staffName || 'Housekeeping Staff',
    'Housekeeping Staff',
    'UPDATE_ROOM_STATUS',
    'Housekeeping',
    `Changed Room ${room.number} status from ${oldStatus} to ${operationalStatus}.`
  );

  return res.json(room);
});

// 9. Staff Tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  return res.json(db.staffTasks);
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, assignedTo, priority, dueDate, creatorName } = req.body;
  const assignedUser = db.users.find(u => u.id === assignedTo);

  const newTask = {
    id: `tsk-${Date.now()}`,
    title,
    description: description || '',
    assignedTo: assignedTo || '',
    assignedToName: assignedUser ? assignedUser.name : 'Unassigned',
    department: assignedUser ? assignedUser.department : 'General Operations',
    priority: priority || 'Medium',
    status: 'Pending' as const,
    dueDate: dueDate || new Date(Date.now() + 86400000).toISOString(),
    createdBy: creatorName || 'Supervisor',
    createdAt: new Date().toISOString()
  };

  db.staffTasks.unshift(newTask);
  saveDatabase(db);
  return res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = db.staffTasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { status, priority } = req.body;
  if (status) task.status = status;
  if (priority) task.priority = priority;

  saveDatabase(db);
  return res.json(task);
});

// 10. Users Management (Admin)
app.get('/api/users', (req: Request, res: Response) => {
  return res.json(db.users);
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, email, role, phone, department, staffName } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'A staff user with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    role,
    phone: phone || '',
    department: department || 'Operations',
    active: true,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);
  addAuditLog('system', staffName || 'Admin', 'Administrator', 'CREATE_USER', 'User Management', `Created staff account for ${name} (${role}).`);
  return res.status(201).json(newUser);
});

app.put('/api/users/:id/toggle-status', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.active = !user.active;
  saveDatabase(db);
  addAuditLog(
    'system',
    'Admin',
    'Administrator',
    'TOGGLE_USER_STATUS',
    'User Management',
    `User ${user.name} is now ${user.active ? 'Active' : 'Deactivated'}.`
  );
  return res.json(user);
});

// 11. Reports & Analytics
app.get('/api/reports', (req: Request, res: Response) => {
  const totalRooms = db.rooms.length;
  const occupiedRooms = db.rooms.filter(r => r.occupancyStatus === 'Occupied').length;
  const reservedRooms = db.rooms.filter(r => r.occupancyStatus === 'Reserved').length;
  const availableRooms = db.rooms.filter(r => r.occupancyStatus === 'Available').length;
  const dirtyRooms = db.rooms.filter(r => r.operationalStatus === 'Dirty' || r.operationalStatus === 'Cleaning in Progress').length;
  const maintenanceRooms = db.rooms.filter(r => r.operationalStatus === 'Maintenance' || r.operationalStatus === 'Out of Service').length;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayArrivals = db.reservations.filter(r => r.checkInDate === todayStr && r.status !== 'Cancelled').length;
  const todayDepartures = db.reservations.filter(r => r.checkOutDate === todayStr && r.status !== 'Cancelled').length;

  const currentInHouseGuests = db.stays.filter(s => s.status === 'Active').length;
  const confirmedReservations = db.reservations.filter(r => r.status === 'Confirmed').length;

  // Revenue totals
  const todayRevenue = db.payments
    .filter(p => p.timestamp.startsWith(todayStr) && p.status === 'Completed')
    .reduce((acc, cur) => acc + cur.amount, 0);

  const monthRevenue = db.payments
    .filter(p => p.status === 'Completed')
    .reduce((acc, cur) => acc + cur.amount, 0);

  const outstandingBalance = db.invoices
    .reduce((acc, cur) => acc + cur.balanceDue, 0);

  // Revenue by Category
  const categoryRevenue: Record<string, number> = {};
  db.categories.forEach(cat => {
    categoryRevenue[cat.name] = 0;
  });
  db.invoices.forEach(inv => {
    categoryRevenue[inv.categoryName] = (categoryRevenue[inv.categoryName] || 0) + inv.grandTotal;
  });

  // Payment method breakdown
  const paymentMethods: Record<string, number> = {
    'M-Pesa': 0,
    Cash: 0,
    Card: 0,
    'Bank Transfer': 0,
    Other: 0
  };
  db.payments.forEach(p => {
    paymentMethods[p.method] = (paymentMethods[p.method] || 0) + p.amount;
  });

  return res.json({
    stats: {
      totalRooms,
      availableRooms,
      occupiedRooms,
      reservedRooms,
      dirtyRooms,
      maintenanceRooms,
      todayArrivals,
      todayDepartures,
      currentInHouseGuests,
      confirmedReservations,
      todayRevenue,
      monthRevenue,
      outstandingBalance,
      occupancyRate
    },
    categoryRevenue,
    paymentMethods,
    recentAuditLogs: db.auditLogs.slice(0, 10),
    upcomingArrivals: db.reservations.filter(r => r.status === 'Confirmed').slice(0, 5),
    unpaidInvoices: db.invoices.filter(i => i.balanceDue > 0).slice(0, 5)
  });
});

// 12. Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  return res.json(db.auditLogs);
});

// 13. Settings
app.get('/api/settings', (req: Request, res: Response) => {
  return res.json(db.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  addAuditLog('system', 'Admin', 'Administrator', 'UPDATE_SETTINGS', 'Settings', 'Updated Mugithi Grand Hotel system parameters.');
  return res.json(db.settings);
});

// Start server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mugithi Grand Hotel Management System running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start MGHMS server:', err);
  process.exit(1);
});
