// Tiered commission engine for Mandapam marketplace.
//
// Model: Base rate by venue type, then a high-value slab discount on top.
//   - Tier 1 (venue type): Marriage Plot 7%, Party Plot/Lawn 8%,
//     Banquet Hall 10%, Wedding Venue 11%, Resort 12%
//   - Tier 2 (slab discount on total booking value):
//       <= ₹2,00,000    -> 0% off
//       ₹2L – ₹8L       -> -1% off
//       ₹8L – ₹20L      -> -2% off
//       > ₹20L          -> -3% off
//   - Floor: final rate never goes below 5% (so platform always earns something
//     on large destination weddings)
//   - All amounts in INR paise-equivalent integers.

import type { VenueType } from "./types";

export const COMMISSION_BASE_RATES: Record<VenueType, number> = {
  "Marriage Plot": 0.07,
  "Party Plot": 0.08,
  Lawn: 0.08,
  "Banquet Hall": 0.1,
  "Wedding Venue": 0.11,
  Resort: 0.12,
};

export interface Slab {
  upTo: number | null; // null = no upper bound
  discountPercent: number; // absolute percentage points subtracted from base
  label: string;
}

export const COMMISSION_SLABS: Slab[] = [
  { upTo: 200_000, discountPercent: 0, label: "Up to ₹2,00,000" },
  { upTo: 800_000, discountPercent: 1, label: "₹2,00,000 – ₹8,00,000" },
  { upTo: 2_000_000, discountPercent: 2, label: "₹8,00,000 – ₹20,00,000" },
  { upTo: null, discountPercent: 3, label: "Above ₹20,00,000" },
];

export const COMMISSION_FLOOR_PERCENT = 5; // never below 5%

export interface CommissionBreakdown {
  baseRatePercent: number; // e.g. 0.10 for 10%
  slabDiscountPercent: number; // percentage points subtracted, e.g. 1
  finalRatePercent: number; // after slab + floor clamp
  commissionAmount: number; // INR
  ownerPayout: number; // INR
  slabLabel: string;
  floorApplied: boolean;
}

export function getBaseRatePercent(venueType: VenueType): number {
  return COMMISSION_BASE_RATES[venueType] ?? 0.1;
}

export function getSlabForAmount(amount: number): Slab {
  for (const slab of COMMISSION_SLABS) {
    if (slab.upTo === null || amount <= slab.upTo) return slab;
  }
  return COMMISSION_SLABS[COMMISSION_SLABS.length - 1];
}

export function computeCommission(
  venueType: VenueType,
  totalAmount: number
): CommissionBreakdown {
  const baseRatePercent = getBaseRatePercent(venueType);
  const slab = getSlabForAmount(totalAmount);
  const rawFinalPercent = baseRatePercent * 100 - slab.discountPercent;
  const floorApplied = rawFinalPercent < COMMISSION_FLOOR_PERCENT;
  const finalRatePercent =
    Math.max(rawFinalPercent, COMMISSION_FLOOR_PERCENT) / 100;
  const commissionAmount = Math.round(totalAmount * finalRatePercent);
  const ownerPayout = totalAmount - commissionAmount;
  return {
    baseRatePercent,
    slabDiscountPercent: slab.discountPercent,
    finalRatePercent,
    commissionAmount,
    ownerPayout,
    slabLabel: slab.label,
    floorApplied,
  };
}

// Convenience: format a rate as "7.0%" etc.
export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

// Convenience: format a percentage-point value (already in pp units) as "1.0pp"
export function formatPP(pp: number): string {
  return `${pp.toFixed(1)}pp`;
}
