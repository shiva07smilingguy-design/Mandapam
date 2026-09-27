// Shared domain types for the VivaahSetu wedding venue marketplace.

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
