// Shared domain types for the Mandapam wedding venue marketplace.

export type Role = "customer" | "owner" | "admin";

export type VenueType =
  | "Marriage Plot"
  | "Banquet Hall"
  | "Party Plot"
  | "Lawn"
  | "Resort"
  | "Wedding Venue";

export type EventType =
  | "Wedding"
  | "Reception"
  | "Engagement"
  | "Birthday"
  | "Corporate"
  | "Anniversary"
  | "Sangeet / Haldi";

export type VenueStatus = "pending" | "approved" | "rejected";

export interface VenuePackage {
  id: string;
  name: string;
  description: string;
  price: number; // total package price
  perGuest?: boolean;
  includes: string[];
}

export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  eventType: EventType;
}

export interface Venue {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  type: VenueType;
  city: string;
  area: string;
  address: string;
  description: string;
  capacityMin: number;
  capacityMax: number;
  priceWeekday: number;
  priceWeekend: number;
  coverImage: string;
  photos: string[];
  amenities: string[]; // free-form amenity tags
  indoor: boolean;
  outdoor: boolean;
  parking: boolean;
  catering: boolean;
  decoration: boolean;
  rooms: number;
  ac: boolean;
  bar: boolean;
  dj: boolean;
  packages: VenuePackage[];
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  blockedDates: string[]; // ISO yyyy-mm-dd
  status: VenueStatus;
  verified: boolean;
  createdAt: string;
}

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "refunded";

export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  venueCity: string;
  packageId?: string;
  packageName?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventDate: string; // ISO yyyy-mm-dd
  eventType: EventType;
  guestCount: number;
  totalAmount: number;
  bookingAmount: number; // advance paid
  status: BookingStatus;
  paymentRef: string;
  createdAt: string;
  specialRequests?: string;
  ownerNote?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: "flat" | "percent";
  value: number;
  minAmount: number;
  active: boolean;
}

export interface Dispute {
  id: string;
  bookingId: string;
  customerName: string;
  venueName: string;
  subject: string;
  description: string;
  status: "open" | "investigating" | "resolved";
  raisedAt: string;
}

// ----- Inquiry (lead-routing + escrow flow) -----
//
// Lifecycle (7 steps):
// 1. pending_owner       — customer submitted inquiry, Mandapam notifies owner
// 2. quoted              — owner responded with quote + services, Mandapam notifies customer
// 3. accepted_by_customer — customer accepted the quote, Mandapam notifies owner
//    (or declined_by_customer / declined_by_owner — inquiry closed)
// 4. date_locked         — owner locks the date, Mandapam sends payment link to customer
// 5. paid                — customer paid 20% advance + uploaded screenshot, money in owner wallet (escrow)
// 6. receipt_uploaded    — owner uploaded cash receipt PDF after event, goes to redeem request queue
// 7. released            — wallet balance released to owner minus commission (auto after event date)

export type InquiryStatus =
  | "pending_owner"
  | "quoted"
  | "accepted_by_customer"
  | "declined_by_owner"
  | "declined_by_customer"
  | "date_locked"
  | "paid"
  | "receipt_uploaded"
  | "released";

export interface OwnerQuote {
  amount: number; // total quote (incl. all services)
  services: string[]; // included services
  message: string; // personalized note from owner
  validUntil: string; // ISO date
}

export interface TimelineEvent {
  step: number;
  label: string;
  actor: "customer" | "owner" | "mandapam" | "system";
  at: string; // ISO timestamp
  note?: string;
}

export interface Inquiry {
  id: string;
  venueId: string;
  venueName: string;
  venueCity: string;
  venueType: VenueType;
  ownerId: string;
  ownerName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventDate: string;
  eventType: EventType;
  guestCount: number;
  customerMessage: string;
  status: InquiryStatus;

  // Step 2: owner's quote
  quote?: OwnerQuote;

  // Step 5: customer payment
  paymentRef?: string;
  paymentScreenshotRef?: string; // mock: a text ref like "UTR123456789"
  advancePaid?: number;
  paidAt?: string;

  // Step 6: owner's cash receipt
  cashReceiptRef?: string; // mock: a text ref like "RECEIPT-2026-001"
  cashReceiptAmount?: number;
  receiptUploadedAt?: string;

  // Step 7: wallet release
  commissionDeducted?: number;
  releasedAmount?: number;
  releasedAt?: string;

  timeline: TimelineEvent[];
  createdAt: string;
}

// Owner wallet entry — derived from inquiries, but stored as ledger
export interface WalletEntry {
  id: string;
  inquiryId: string;
  venueName: string;
  customerName: string;
  eventDate: string;
  advancePaid: number;
  commissionRate: number; // percentage applied
  commissionAmount: number;
  netPayable: number;
  status: "in_escrow" | "redeem_requested" | "released";
  cashReceiptRef?: string;
  receiptUploadedAt?: string;
  releasedAt?: string;
  createdAt: string;
}
