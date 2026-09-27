"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppUser,
  Booking,
  BookingStatus,
  Coupon,
  Dispute,
  EventType,
  Role,
  Venue,
  VenuePackage,
} from "./types";
import {
  SEED_BOOKINGS,
  SEED_COUPONS,
  SEED_DISPUTES,
  SEED_USERS,
  SEED_VENUES,
} from "./seed-data";

// ----- App navigation state -----

export type CustomerView =
  | "home"
  | "browse"
  | "venue-detail"
  | "my-bookings"
  | "compare";

export type OwnerView =
  | "dashboard"
  | "venues"
  | "calendar"
  | "bookings"
  | "packages"
  | "earnings";

export type AdminView =
  | "dashboard"
  | "approvals"
  | "bookings"
  | "commission"
  | "customers"
  | "coupons"
  | "reviews"
  | "reports"
  | "disputes";

interface SearchFilters {
  city: string;
  eventType: EventType | "";
  date: string; // yyyy-mm-dd
  guests: number;
  venueType: string;
  budgetMax: number;
  capacityMin: number;
  indoor: boolean;
  outdoor: boolean;
  parking: boolean;
  catering: boolean;
  decoration: boolean;
  ac: boolean;
  rooms: boolean;
  amenities: string[];
  sortBy: "relevance" | "price-asc" | "price-desc" | "rating" | "capacity";
}

interface AppState {
  // Auth
  currentUser: AppUser | null;
  users: AppUser[];
  loginAs: (role: Role) => void;
  logout: () => void;

  // Navigation
  role: Role;
  setRole: (r: Role) => void;
  customerView: CustomerView;
  setCustomerView: (v: CustomerView) => void;
  ownerView: OwnerView;
  setOwnerView: (v: OwnerView) => void;
  adminView: AdminView;
  setAdminView: (v: AdminView) => void;

  // Data
  venues: Venue[];
  bookings: Booking[];
  coupons: Coupon[];
  disputes: Dispute[];

  // Customer flow state
  selectedVenueId: string | null;
  selectVenue: (id: string | null) => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // Search filters
  filters: SearchFilters;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;

  // Booking flow
  bookingFlowVenueId: string | null;
  bookingFlowPackageId: string | null;
  startBooking: (venueId: string, packageId?: string) => void;
  cancelBooking: () => void;
  completeBooking: (input: {
    venueId: string;
    packageId?: string;
    packageName?: string;
    eventDate: string;
    eventType: EventType;
    guestCount: number;
    totalAmount: number;
    bookingAmount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    specialRequests?: string;
  }) => Booking;

  // Owner actions
  addVenue: (venue: Venue) => void;
  updateVenue: (id: string, patch: Partial<Venue>) => void;
  deleteVenue: (id: string) => void;
  addPackage: (venueId: string, pkg: VenuePackage) => void;
  deletePackage: (venueId: string, packageId: string) => void;
  toggleBlockDate: (venueId: string, date: string) => void;

  // Booking management
  setBookingStatus: (bookingId: string, status: BookingStatus) => void;
  setOwnerNote: (bookingId: string, note: string) => void;

  // Admin actions
  setVenueStatus: (venueId: string, status: "approved" | "rejected" | "pending") => void;
  setDisputeStatus: (disputeId: string, status: "open" | "investigating" | "resolved") => void;
  addCoupon: (c: Coupon) => void;
  toggleCoupon: (id: string) => void;
  deleteCoupon: (id: string) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  city: "",
  eventType: "",
  date: "",
  guests: 200,
  venueType: "",
  budgetMax: 5000000,
  capacityMin: 0,
  indoor: false,
  outdoor: false,
  parking: false,
  catering: false,
  decoration: false,
  ac: false,
  rooms: false,
  amenities: [],
  sortBy: "relevance",
};

let bookingCounter = 100;
let venueCounter = 100;
let couponCounter = 100;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      users: SEED_USERS,
      loginAs: (role) => {
        const user = get().users.find((u) => u.role === role);
        set({ currentUser: user ?? null, role });
      },
      logout: () => set({ currentUser: null }),

      // Navigation
      role: "customer",
      setRole: (r) =>
        set({
          role: r,
          customerView: "home",
          ownerView: "dashboard",
          adminView: "dashboard",
        }),
      customerView: "home",
      setCustomerView: (v) => set({ customerView: v }),
      ownerView: "dashboard",
      setOwnerView: (v) => set({ ownerView: v }),
      adminView: "dashboard",
      setAdminView: (v) => set({ adminView: v }),

      // Data
      venues: SEED_VENUES,
      bookings: SEED_BOOKINGS,
      coupons: SEED_COUPONS,
      disputes: SEED_DISPUTES,

      // Customer flow
      selectedVenueId: null,
      selectVenue: (id) => set({ selectedVenueId: id, customerView: id ? "venue-detail" : "browse" }),
      compareIds: [],
      toggleCompare: (id) => {
        const cur = get().compareIds;
        if (cur.includes(id)) {
          set({ compareIds: cur.filter((x) => x !== id) });
        } else {
          if (cur.length >= 3) return; // max 3
          set({ compareIds: [...cur, id] });
        }
      },
      clearCompare: () => set({ compareIds: [] }),

      // Filters
      filters: DEFAULT_FILTERS,
      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      // Booking flow
      bookingFlowVenueId: null,
      bookingFlowPackageId: null,
      startBooking: (venueId, packageId) =>
        set({ bookingFlowVenueId: venueId, bookingFlowPackageId: packageId ?? null }),
      cancelBooking: () =>
        set({ bookingFlowVenueId: null, bookingFlowPackageId: null }),
      completeBooking: (input) => {
        const venue = get().venues.find((v) => v.id === input.venueId);
        const bookingId = `b-${++bookingCounter}`;
        const paymentRef = `VS-PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newBooking: Booking = {
          id: bookingId,
          venueId: input.venueId,
          venueName: venue?.name ?? "",
          venueCity: venue?.city ?? "",
          packageId: input.packageId,
          packageName: input.packageName,
          customerId: get().currentUser?.id ?? "u-cust-1",
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          eventDate: input.eventDate,
          eventType: input.eventType,
          guestCount: input.guestCount,
          totalAmount: input.totalAmount,
          bookingAmount: input.bookingAmount,
          status: "confirmed",
          paymentRef,
          createdAt: new Date().toISOString(),
          specialRequests: input.specialRequests,
        };
        // Lock the date by adding to venue's blockedDates
        set((s) => ({
          bookings: [newBooking, ...s.bookings],
          venues: s.venues.map((v) =>
            v.id === input.venueId
              ? { ...v, blockedDates: [...v.blockedDates, input.eventDate] }
              : v
          ),
        }));
        return newBooking;
      },

      // Owner actions
      addVenue: (venue) => set((s) => ({ venues: [venue, ...s.venues] })),
      updateVenue: (id, patch) =>
        set((s) => ({
          venues: s.venues.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      deleteVenue: (id) =>
        set((s) => ({ venues: s.venues.filter((v) => v.id !== id) })),
      addPackage: (venueId, pkg) =>
        set((s) => ({
          venues: s.venues.map((v) =>
            v.id === venueId ? { ...v, packages: [...v.packages, pkg] } : v
          ),
        })),
      deletePackage: (venueId, packageId) =>
        set((s) => ({
          venues: s.venues.map((v) =>
            v.id === venueId
              ? { ...v, packages: v.packages.filter((p) => p.id !== packageId) }
              : v
          ),
        })),
      toggleBlockDate: (venueId, date) =>
        set((s) => ({
          venues: s.venues.map((v) => {
            if (v.id !== venueId) return v;
            const has = v.blockedDates.includes(date);
            return {
              ...v,
              blockedDates: has
                ? v.blockedDates.filter((d) => d !== date)
                : [...v.blockedDates, date],
            };
          }),
        })),

      // Booking management
      setBookingStatus: (bookingId, status) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status } : b
          ),
        })),
      setOwnerNote: (bookingId, note) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, ownerNote: note } : b
          ),
        })),

      // Admin actions
      setVenueStatus: (venueId, status) =>
        set((s) => ({
          venues: s.venues.map((v) =>
            v.id === venueId ? { ...v, status } : v
          ),
        })),
      setDisputeStatus: (disputeId, status) =>
        set((s) => ({
          disputes: s.disputes.map((d) =>
            d.id === disputeId ? { ...d, status } : d
          ),
        })),
      addCoupon: (c) => set((s) => ({ coupons: [c, ...s.coupons] })),
      toggleCoupon: (id) =>
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c
          ),
        })),
      deleteCoupon: (id) =>
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) })),
    }),
    {
      name: "vivaahsetu-store",
      storage: createJSONStorage(() => localStorage),
      // Don't persist currentUser to avoid stale session
      partialize: (state) => ({
        venues: state.venues,
        bookings: state.bookings,
        coupons: state.coupons,
        disputes: state.disputes,
        compareIds: state.compareIds,
      }),
    }
  )
);

// ----- Derived selectors / helpers -----

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function isVenueAvailable(venue: Venue, date: string): boolean {
  if (!date) return true;
  return !venue.blockedDates.includes(date);
}

export function priceForDate(venue: Venue, date: string): number {
  if (!date) return venue.priceWeekday;
  const day = new Date(date + "T00:00:00").getDay();
  const isWeekend = day === 0 || day === 6;
  return isWeekend ? venue.priceWeekend : venue.priceWeekday;
}

// Compute 20% advance for booking
export function computeBookingAdvance(total: number): number {
  return Math.round((total * 0.2) / 100) * 100;
}

// Generate new IDs
export function genVenueId(): string {
  return `v-${++venueCounter}-${Date.now().toString(36).slice(-4)}`;
}
export function genCouponId(): string {
  return `c-${++couponCounter}`;
}
