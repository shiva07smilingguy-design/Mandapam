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
  Inquiry,
  InquiryStatus,
  OwnerQuote,
  Role,
  Venue,
  VenuePackage,
} from "./types";
import {
  SEED_BOOKINGS,
  SEED_COUPONS,
  SEED_DISPUTES,
  SEED_INQUIRIES,
  SEED_USERS,
  SEED_VENUES,
} from "./seed-data";
import {
  notifyOwner_newInquiry,
  notifyCustomer_ownerQuote,
  notifyOwner_customerAccepted,
  notifyCustomer_paymentLink,
  notifyOwner_paymentReceived,
  notifyOwner_receiptSubmitted,
  notifyOwner_walletReleased,
  notifyCustomer_ownerDeclined,
} from "./notifications";
import { computeCommission } from "./commission";

// ----- App navigation state -----

export type CustomerView =
  | "home"
  | "browse"
  | "venue-detail"
  | "my-bookings"
  | "my-inquiries"
  | "compare";

export type OwnerView =
  | "dashboard"
  | "venues"
  | "calendar"
  | "bookings"
  | "inquiries"
  | "packages"
  | "earnings";

export type AdminView =
  | "dashboard"
  | "approvals"
  | "bookings"
  | "inquiries"
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
  inquiries: Inquiry[];

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

  // ----- Inquiry lifecycle (7-step escrow flow) -----

  // Step 1: Customer submits inquiry → Mandapam notifies owner
  submitInquiry: (input: {
    venueId: string;
    eventDate: string;
    eventType: EventType;
    guestCount: number;
    customerMessage: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }) => Inquiry;

  // Step 2: Owner sends quote → Mandapam notifies customer
  ownerSendQuote: (
    inquiryId: string,
    quote: Omit<OwnerQuote, "validUntil"> & { validUntil: string }
  ) => void;

  // Step 2 alt: Owner declines
  ownerDeclineInquiry: (inquiryId: string) => void;

  // Step 3: Customer accepts → Mandapam notifies owner
  customerAcceptQuote: (inquiryId: string) => void;

  // Step 3 alt: Customer declines
  customerDeclineQuote: (inquiryId: string) => void;

  // Step 4: Owner locks date → Mandapam sends payment link to customer
  ownerLockDate: (inquiryId: string) => void;

  // Step 5: Customer pays + uploads screenshot → Mandapam credits owner wallet
  customerPayAdvance: (
    inquiryId: string,
    paymentRef: string,
    screenshotRef: string
  ) => void;

  // Step 6: Owner uploads cash receipt → goes to redeem request queue
  ownerUploadReceipt: (
    inquiryId: string,
    receiptRef: string,
    receiptAmount: number
  ) => void;

  // Step 7: Auto-release wallet after event date (admin or system trigger)
  releaseWallet: (inquiryId: string) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  city: "Vadodara",
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
      inquiries: SEED_INQUIRIES,

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

      // ----- Inquiry lifecycle implementations -----

      // Step 1: Customer submits inquiry
      submitInquiry: (input) => {
        const venue = get().venues.find((v) => v.id === input.venueId);
        if (!venue) throw new Error("Venue not found");
        const id = `inq-${String(get().inquiries.length + 1).padStart(3, "0")}`;
        const now = new Date().toISOString();
        const newInquiry: Inquiry = {
          id,
          venueId: venue.id,
          venueName: venue.name,
          venueCity: venue.city,
          venueType: venue.type,
          ownerId: venue.ownerId,
          ownerName: venue.ownerName,
          customerId: get().currentUser?.id ?? "u-cust-1",
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          eventDate: input.eventDate,
          eventType: input.eventType,
          guestCount: input.guestCount,
          customerMessage: input.customerMessage,
          status: "pending_owner",
          timeline: [
            {
              step: 1,
              label: "Inquiry submitted by customer",
              actor: "customer",
              at: now,
              note: "Mandapam notified owner via WhatsApp + dashboard",
            },
          ],
          createdAt: now,
        };
        // Trigger mock WhatsApp notification to owner
        notifyOwner_newInquiry(newInquiry);
        set((s) => ({ inquiries: [newInquiry, ...s.inquiries] }));
        return newInquiry;
      },

      // Step 2: Owner sends quote
      ownerSendQuote: (inquiryId, quote) => {
        set((s) => ({
          inquiries: s.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  status: "quoted" as InquiryStatus,
                  quote,
                  timeline: [
                    ...inq.timeline,
                    {
                      step: 2,
                      label: `Owner sent quote — ${formatINR(quote.amount)}`,
                      actor: "owner" as const,
                      at: new Date().toISOString(),
                      note: "Mandapam notified customer via WhatsApp",
                    },
                  ],
                }
              : inq
          ),
        }));
        const updated = get().inquiries.find((i) => i.id === inquiryId);
        if (updated) notifyCustomer_ownerQuote(updated);
      },

      // Step 2 alt: Owner declines
      ownerDeclineInquiry: (inquiryId) => {
        set((s) => ({
          inquiries: s.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  status: "declined_by_owner" as InquiryStatus,
                  timeline: [
                    ...inq.timeline,
                    {
                      step: 2,
                      label: "Owner declined inquiry",
                      actor: "owner" as const,
                      at: new Date().toISOString(),
                      note: "Mandapam notified customer via WhatsApp",
                    },
                  ],
                }
              : inq
          ),
        }));
        const updated = get().inquiries.find((i) => i.id === inquiryId);
        if (updated) notifyCustomer_ownerDeclined(updated);
      },

      // Step 3: Customer accepts quote
      customerAcceptQuote: (inquiryId) => {
        set((s) => ({
          inquiries: s.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  status: "accepted_by_customer" as InquiryStatus,
                  timeline: [
                    ...inq.timeline,
                    {
                      step: 3,
                      label: "Customer accepted quote",
                      actor: "customer" as const,
                      at: new Date().toISOString(),
                      note: "Mandapam notified owner to lock date",
                    },
                  ],
                }
              : inq
          ),
        }));
        const updated = get().inquiries.find((i) => i.id === inquiryId);
        if (updated) notifyOwner_customerAccepted(updated);
      },

      // Step 3 alt: Customer declines
      customerDeclineQuote: (inquiryId) => {
        set((s) => ({
          inquiries: s.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  status: "declined_by_customer" as InquiryStatus,
                  timeline: [
                    ...inq.timeline,
                    {
                      step: 3,
                      label: "Customer declined quote",
                      actor: "customer" as const,
                      at: new Date().toISOString(),
                    },
                  ],
                }
              : inq
          ),
        }));
      },

      // Step 4: Owner locks date → send payment link
      ownerLockDate: (inquiryId) => {
        const inquiry = get().inquiries.find((i) => i.id === inquiryId);
        if (!inquiry) return;
        set((s) => ({
          inquiries: s.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  status: "date_locked" as InquiryStatus,
                  timeline: [
                    ...inq.timeline,
                    {
                      step: 4,
                      label: "Owner locked date — payment link sent",
                      actor: "owner" as const,
                      at: new Date().toISOString(),
                      note: "Mandapam sent WhatsApp with payment link to customer",
                    },
                  ],
                }
              : inq
          ),
          // Also lock the date in venue's blockedDates
          venues: s.venues.map((v) =>
            v.id === inquiry.venueId
              ? { ...v, blockedDates: [...v.blockedDates, inquiry.eventDate] }
              : v
          ),
        }));
        const updated = get().inquiries.find((i) => i.id === inquiryId);
        if (updated) notifyCustomer_paymentLink(updated);
      },

      // Step 5: Customer pays advance + uploads screenshot
      customerPayAdvance: (inquiryId, paymentRef, screenshotRef) => {
        set((s) => {
          const inquiry = s.inquiries.find((i) => i.id === inquiryId);
          if (!inquiry || !inquiry.quote) return {};
          const advancePaid = Math.round(inquiry.quote.amount * 0.2);
          return {
            inquiries: s.inquiries.map((inq) =>
              inq.id === inquiryId
                ? {
                    ...inq,
                    status: "paid" as InquiryStatus,
                    paymentRef,
                    paymentScreenshotRef: screenshotRef,
                    advancePaid,
                    paidAt: new Date().toISOString(),
                    timeline: [
                      ...inq.timeline,
                      {
                        step: 5,
                        label: `Customer paid ${formatINR(advancePaid)} advance — ${screenshotRef}`,
                        actor: "customer" as const,
                        at: new Date().toISOString(),
                        note: `${formatINR(advancePaid)} credited to owner wallet (in escrow)`,
                      },
                    ],
                  }
                : inq
            ),
          };
        });
        const updated = get().inquiries.find((i) => i.id === inquiryId);
        if (updated) notifyOwner_paymentReceived(updated);
      },

      // Step 6: Owner uploads cash receipt → goes to redeem request queue
      ownerUploadReceipt: (inquiryId, receiptRef, receiptAmount) => {
        set((s) => ({
          inquiries: s.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  status: "receipt_uploaded" as InquiryStatus,
                  cashReceiptRef: receiptRef,
                  cashReceiptAmount: receiptAmount,
                  receiptUploadedAt: new Date().toISOString(),
                  timeline: [
                    ...inq.timeline,
                    {
                      step: 6,
                      label: `Owner uploaded cash receipt (${receiptRef}) — ${formatINR(receiptAmount)}`,
                      actor: "owner" as const,
                      at: new Date().toISOString(),
                      note: "Added to redeem request queue",
                    },
                  ],
                }
              : inq
          ),
        }));
        const updated = get().inquiries.find((i) => i.id === inquiryId);
        if (updated) notifyOwner_receiptSubmitted(updated);
      },

      // Step 7: Release wallet after event date
      releaseWallet: (inquiryId) => {
        set((s) => {
          const inquiry = s.inquiries.find((i) => i.id === inquiryId);
          if (!inquiry || !inquiry.advancePaid) return {};
          // Use the tiered commission engine
          const breakdown = computeCommission(
            inquiry.venueType,
            inquiry.advancePaid
          );
          return {
            inquiries: s.inquiries.map((inq) =>
              inq.id === inquiryId
                ? {
                    ...inq,
                    status: "released" as InquiryStatus,
                    commissionDeducted: breakdown.commissionAmount,
                    releasedAmount: breakdown.ownerPayout,
                    releasedAt: new Date().toISOString(),
                    timeline: [
                      ...inq.timeline,
                      {
                        step: 7,
                        label: `Wallet released — ${formatINR(breakdown.ownerPayout)} (after ${formatINR(breakdown.commissionAmount)} commission)`,
                        actor: "system" as const,
                        at: new Date().toISOString(),
                        note: "NEFT'd to owner's registered bank account",
                      },
                    ],
                  }
                : inq
            ),
          };
        });
        const updated = get().inquiries.find((i) => i.id === inquiryId);
        if (updated) notifyOwner_walletReleased(updated);
      },
    }),
    {
      name: "mandapam-store",
      storage: createJSONStorage(() => localStorage),
      // Don't persist currentUser to avoid stale session
      partialize: (state) => ({
        venues: state.venues,
        bookings: state.bookings,
        coupons: state.coupons,
        disputes: state.disputes,
        inquiries: state.inquiries,
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
