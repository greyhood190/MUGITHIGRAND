export type UserRole = 
  | 'Administrator'
  | 'Manager'
  | 'Front Office Staff'
  | 'Housekeeping Staff'
  | 'Finance Officer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  active: boolean;
  department: string;
  lastLogin?: string;
  createdAt: string;
}

export type OccupancyStatus = 'Available' | 'Reserved' | 'Occupied';

export type OperationalStatus = 
  | 'Clean'
  | 'Dirty'
  | 'Cleaning in Progress'
  | 'Inspected'
  | 'Ready for Occupancy'
  | 'Maintenance'
  | 'Out of Service';

export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  defaultRate: number; // KES
  amenities: string[];
  active: boolean;
}

export interface Room {
  id: string;
  number: string;
  categoryId: string;
  categoryName: string;
  maxOccupancy: number;
  nightlyRate: number; // KES
  floor: number;
  occupancyStatus: OccupancyStatus;
  operationalStatus: OperationalStatus;
  notes?: string;
  lastCleanedAt?: string;
  assignedStaff?: string;
  active: boolean;
}

export type ReservationStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Checked In'
  | 'Checked Out'
  | 'Cancelled'
  | 'No Show';

export interface Reservation {
  id: string;
  reference: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  categoryId: string;
  categoryName: string;
  roomId?: string;
  roomNumber?: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  nightlyRate: number;
  totalNights: number;
  estimatedTotal: number;
  specialRequests?: string;
  bookingSource: 'Front Desk Walk-in' | 'Phone Reservation' | 'Email Inquiry' | 'Corporate Partner' | 'Direct Agent';
  status: ReservationStatus;
  createdBy: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idType: 'National ID' | 'Passport' | 'Alien ID' | 'Driving License';
  idNumber: string;
  nationality: string;
  address: string;
  city: string;
  registrationDate: string;
  preferences?: string;
  notes?: string;
  totalStays: number;
  outstandingBalance: number;
}

export interface IncidentalCharge {
  id: string;
  stayId: string;
  description: string;
  category: 'Restaurant' | 'Bar / Lounge' | 'Café' | 'Room Service' | 'Laundry' | 'Other';
  quantity: number;
  unitPrice: number;
  total: number;
  timestamp: string;
  addedBy: string;
}

export interface RoomTransfer {
  id: string;
  fromRoomNumber: string;
  toRoomNumber: string;
  transferredAt: string;
  reason: string;
  transferredBy: string;
}

export interface Stay {
  id: string;
  stayReference: string;
  reservationId?: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  categoryName: string;
  checkInTime: string;
  expectedCheckOutDate: string;
  actualCheckOutTime?: string;
  nightlyRate: number;
  status: 'Active' | 'Checked Out' | 'Transferred';
  incidentalCharges: IncidentalCharge[];
  transfers: RoomTransfer[];
  depositAmount: number;
  notes?: string;
  checkedInBy: string;
  checkedOutBy?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: 'Accommodation' | 'Incidental' | 'Tax' | 'Discount';
}

export type InvoiceStatus = 'Draft' | 'Issued' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Voided';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  stayId?: string;
  reservationId?: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestIdNumber?: string;
  roomNumber: string;
  categoryName: string;
  checkInDate: string;
  checkOutDate: string;
  billableNights: number;
  nightlyRate: number;
  accommodationTotal: number;
  incidentalsTotal: number;
  subtotal: number;
  vatRate: number; // e.g. 16%
  vatAmount: number;
  cateringLevyRate: number; // e.g. 2%
  cateringLevyAmount: number;
  discountAmount: number;
  grandTotal: number;
  totalPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  currency: string;
  items: InvoiceLineItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type PaymentMethod = 'Cash' | 'M-Pesa' | 'Card' | 'Bank Transfer' | 'Other';
export type PaymentStatus = 'Completed' | 'Pending' | 'Refunded' | 'Reversed';

export interface Payment {
  id: string;
  paymentReference: string;
  invoiceId?: string;
  stayId?: string;
  guestId: string;
  guestName: string;
  amount: number;
  method: PaymentMethod;
  transactionReference: string; // M-Pesa code e.g. SJK478912M
  timestamp: string;
  receivedBy: string;
  status: PaymentStatus;
  notes?: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  categoryName: string;
  floor: number;
  priority: 'High' | 'Normal' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Inspected';
  assignedTo: string;
  notes?: string;
  requestedAt: string;
  completedAt?: string;
}

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  department: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}

export interface HotelSettings {
  hotelName: string;
  tagline: string;
  address: string;
  location: string;
  poBox: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  website: string;
  taxPin: string;
  vatRate: number; // 16
  cateringLevyRate: number; // 2
  serviceChargeRate: number; // 0
  currency: string; // KES
  currencySymbol: string; // KES
  checkInTime: string; // 14:00
  checkOutTime: string; // 10:30
  mpesaTillNumber: string;
  mpesaPaybill: string;
  bankAccountDetails: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  dirtyRooms: number;
  maintenanceRooms: number;
  todayArrivals: number;
  todayDepartures: number;
  currentInHouseGuests: number;
  confirmedReservations: number;
  todayRevenue: number;
  monthRevenue: number;
  outstandingBalance: number;
  occupancyRate: number;
}
