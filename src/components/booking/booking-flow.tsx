"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  CreditCard,
  CalendarHeart,
  Loader2,
  Lock,
  PartyPopper,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  isVenueAvailable,
  priceForDate,
  computeBookingAdvance,
} from "@/lib/store";
import { EVENT_TYPES } from "@/lib/seed-data";
import { toast } from "sonner";
import type { EventType } from "@/lib/types";

interface BookingFlowDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  preselectedPackageId?: string;
}

type Step = "details" | "payment" | "processing" | "success";

export function BookingFlowDialog({
  open,
  onOpenChange,
  preselectedPackageId,
}: BookingFlowDialogProps) {
  const {
    venues,
    bookingFlowVenueId,
    bookingFlowPackageId,
    cancelBooking,
    filters,
    setCustomerView,
  } = useAppStore();

  const venue = venues.find((v) => v.id === bookingFlowVenueId);
  if (!venue) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>No venue selected</DialogTitle>
            <DialogDescription>
              Please pick a venue before booking.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}
    >
      <DialogContent className="max-w-lg sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[92vh] overflow-y-auto fancy-scroll">
        {/* Keyed content so state resets cleanly when the dialog re-opens */}
        <BookingFlowContent
          key={`${venue.id}-${preselectedPackageId ?? ""}-${bookingFlowPackageId ?? ""}`}
          venue={venue}
          preselectedPackageId={preselectedPackageId}
          bookingFlowPackageId={bookingFlowPackageId}
          filtersDate={filters.date}
          filtersGuests={filters.guests}
          filtersEventType={filters.eventType}
          onCancel={() => {
            cancelBooking();
            onOpenChange(false);
          }}
          onFinished={() => {
            cancelBooking();
            onOpenChange(false);
            setCustomerView("my-bookings");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface BookingFlowContentProps {
  venue: NonNullable<ReturnType<typeof useAppStore.getState>["venues"][number]>;
  preselectedPackageId?: string;
  bookingFlowPackageId?: string | null;
  filtersDate: string;
  filtersGuests: number;
  filtersEventType: string;
  onCancel: () => void;
  onFinished: () => void;
}

function BookingFlowContent({
  venue,
  preselectedPackageId,
  bookingFlowPackageId,
  filtersDate,
  filtersGuests,
  filtersEventType,
  onCancel,
  onFinished,
}: BookingFlowContentProps) {
  const { completeBooking, currentUser, coupons } = useAppStore();
  const initialPkgId = preselectedPackageId || bookingFlowPackageId || "";
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    phone: currentUser?.phone ?? "",
    email: currentUser?.email ?? "",
    eventType: (filtersEventType || "Wedding") as EventType,
    eventDate: filtersDate || "",
    guestCount: filtersGuests || 200,
    packageId: initialPkgId,
    couponCode: "",
    specialRequests: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    paymentRef: string;
  } | null>(null);

  const pkg = venue.packages.find((p) => p.id === form.packageId);
  const basePrice = useMemo(() => {
    if (pkg) return pkg.price;
    return form.eventDate ? priceForDate(venue, form.eventDate) : venue.priceWeekday;
  }, [venue, pkg, form.eventDate]);

  const advance = computeBookingAdvance(basePrice);
  const coupon = coupons.find(
    (c) => c.code === form.couponCode.trim().toUpperCase() && c.active
  );
  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (basePrice < coupon.minAmount) return 0;
    if (coupon.type === "flat") return coupon.value;
    return Math.min(Math.round((basePrice * coupon.value) / 100), 15000);
  }, [coupon, basePrice]);
  const finalAdvance = Math.max(advance - discount, 0);

  const dateOk = form.eventDate && isVenueAvailable(venue, form.eventDate);
  const capacityOk = form.guestCount <= venue.capacityMax;
  const formValid =
    form.name.trim() &&
    /\d{10}/.test(form.phone.replace(/\D/g, "")) &&
    /.+@.+\..+/.test(form.email) &&
    dateOk &&
    capacityOk;

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => {
      const booking = completeBooking({
        venueId: venue.id,
        packageId: pkg?.id,
        packageName: pkg?.name,
        eventDate: form.eventDate,
        eventType: form.eventType,
        guestCount: form.guestCount,
        totalAmount: basePrice,
        bookingAmount: finalAdvance,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        specialRequests: form.specialRequests,
      });
      setConfirmedBooking({ id: booking.id, paymentRef: booking.paymentRef });
      setStep("success");
      toast.success("Booking confirmed!", {
        description: `${venue.name} · ${form.eventDate}`,
      });
    }, 1800);
  };

  return (
    <>
      <DialogHeader className="px-5 pt-5 pb-3 border-b bg-secondary/30">
        <DialogTitle className="flex items-center gap-2 text-lg">
          <CalendarHeart className="size-5 text-primary" />
          {step === "success" ? "Booking confirmed" : "Book this venue"}
        </DialogTitle>
        <DialogDescription>
          {venue.name} · {venue.area}, {venue.city}
        </DialogDescription>
      </DialogHeader>

      {/* Stepper */}
      {step !== "success" && (
        <div className="px-5 py-3 flex items-center gap-2 text-xs">
          <StepBadge n={1} active={step === "details"} done={step !== "details"} label="Details" />
          <div className="flex-1 h-px bg-border" />
          <StepBadge n={2} active={step === "payment"} done={step === "processing"} label="Payment" />
          <div className="flex-1 h-px bg-border" />
          <StepBadge n={3} active={false} done={false} label="Confirm" muted />
        </div>
      )}

      {step === "details" && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bride / Groom / Family"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone (WhatsApp)</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98XXX XXXXX"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Event type</Label>
              <Select
                value={form.eventType}
                onValueChange={(v) => setForm({ ...form, eventType: v as EventType })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Event date</Label>
              <Input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Number of guests</Label>
              <Input
                type="number"
                min={venue.capacityMin}
                max={venue.capacityMax}
                value={form.guestCount}
                onChange={(e) =>
                  setForm({ ...form, guestCount: Number(e.target.value) })
                }
              />
              {form.guestCount > venue.capacityMax && (
                <p className="text-xs text-destructive">
                  Max capacity is {venue.capacityMax}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Package (optional)</Label>
              <Select
                value={form.packageId || "__none"}
                onValueChange={(v) =>
                  setForm({ ...form, packageId: v === "__none" ? "" : v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Venue only</SelectItem>
                  {venue.packages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatINR(p.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Special requests (optional)</Label>
            <Textarea
              value={form.specialRequests}
              onChange={(e) =>
                setForm({ ...form, specialRequests: e.target.value })
              }
              placeholder="Bridal entry arrangement, extra parking, dietary preferences, etc."
              rows={2}
            />
          </div>

          <Card className="bg-secondary/40">
            <CardContent className="p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {pkg ? "Package" : "Venue rental"}
                </span>
                <span className="font-medium">
                  {pkg ? pkg.name : formatINR(basePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total estimate</span>
                <span className="font-semibold">{formatINR(basePrice)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-primary">
                <span className="font-medium">Booking advance (20%)</span>
                <span className="font-bold">{formatINR(advance)}</span>
              </div>
            </CardContent>
          </Card>

          {!dateOk && form.eventDate && (
            <p className="text-xs text-destructive">
              This date is not available. Please pick another date.
            </p>
          )}
          {!capacityOk && (
            <p className="text-xs text-destructive">
              Guest count exceeds venue capacity.
            </p>
          )}
        </div>
      )}

      {step === "payment" && (
        <div className="p-5 space-y-4">
          <div className="rounded-lg bg-secondary/40 p-3 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue</span>
              <span className="font-medium">{venue.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{form.eventDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guests</span>
              <span className="font-medium">{form.guestCount}</span>
            </div>
            {pkg && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{pkg.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{formatINR(basePrice)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-primary">
              <span className="font-medium">Pay now (20% advance)</span>
              <span className="font-bold">{formatINR(advance)}</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="flex gap-2">
            <Input
              value={form.couponCode}
              onChange={(e) =>
                setForm({ ...form, couponCode: e.target.value.toUpperCase() })
              }
              placeholder="Coupon code (try VIVAAH1000)"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => {
                if (form.couponCode && !coupon) {
                  toast.error("Invalid or expired coupon");
                } else if (coupon) {
                  if (basePrice < coupon.minAmount) {
                    toast.error(
                      `Min booking ${formatINR(coupon.minAmount)} required`
                    );
                  } else {
                    toast.success(`Coupon applied: ${coupon.code}`);
                  }
                }
              }}
            >
              Apply
            </Button>
          </div>
          {coupon && discount > 0 && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Saved {formatINR(discount)} with{" "}
              {coupon.code}
            </div>
          )}

          {/* Payment method */}
          <div>
            <Label className="text-xs mb-1.5 block">Payment method</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["upi", "UPI", Smartphone],
                  ["card", "Card", CreditCard],
                  ["netbanking", "Net Banking", Wallet],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs transition ${
                    paymentMethod === id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "upi" && (
            <Input placeholder="yourname@okhdfc" defaultValue="ananya@okhdfc" />
          )}
          {paymentMethod === "card" && (
            <div className="space-y-2">
              <Input placeholder="Card number" defaultValue="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="MM/YY" defaultValue="12/27" />
                <Input placeholder="CVV" defaultValue="123" />
              </div>
            </div>
          )}
          {paymentMethod === "netbanking" && (
            <Select defaultValue="hdfc">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hdfc">HDFC Bank</SelectItem>
                <SelectItem value="icici">ICICI Bank</SelectItem>
                <SelectItem value="sbi">State Bank of India</SelectItem>
                <SelectItem value="axis">Axis Bank</SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="size-3" /> Payments secured by Razorpay · 256-bit
            encryption
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="p-10 flex flex-col items-center justify-center text-center">
          <Loader2 className="size-10 animate-spin text-primary mb-3" />
          <h3 className="font-semibold">Processing payment…</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Locking your date · {form.eventDate}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Please don&apos;t close this window.
          </p>
        </div>
      )}

      {step === "success" && confirmedBooking && (
        <div className="p-6 flex flex-col items-center text-center">
          <div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
            <CheckCircle2 className="size-9" />
          </div>
          <h3 className="font-serif text-xl font-bold">
            Your booking is confirmed!
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            We&apos;ve sent a confirmation on WhatsApp & email.
          </p>
          <Card className="w-full mt-4 text-left">
            <CardContent className="p-4 space-y-1.5 text-sm">
              <Row label="Booking ID" value={confirmedBooking.id.toUpperCase()} />
              <Row label="Venue" value={venue.name} />
              <Row label="Date" value={form.eventDate} />
              <Row label="Event" value={form.eventType} />
              <Row label="Guests" value={`${form.guestCount}`} />
              <Row
                label="Amount paid"
                value={formatINR(finalAdvance)}
                bold
              />
              <Row label="Payment ref" value={confirmedBooking.paymentRef} />
            </CardContent>
          </Card>
          <div className="flex items-center gap-2 mt-3 text-xs text-emerald-700">
            <PartyPopper className="size-4" /> Date {form.eventDate} is now
            locked for you
          </div>
        </div>
      )}

      <DialogFooter className="px-5 py-4 border-t bg-secondary/30 gap-2">
        {step === "details" && (
          <>
            <Button variant="outline" onClick={onCancel}>
              <X className="size-4" /> Cancel
            </Button>
            <Button
              className="flex-1 wedding-gradient text-primary-foreground"
              disabled={!formValid}
              onClick={() => setStep("payment")}
            >
              Continue to payment
            </Button>
          </>
        )}
        {step === "payment" && (
          <>
            <Button variant="outline" onClick={() => setStep("details")}>
              Back
            </Button>
            <Button
              className="flex-1 wedding-gradient text-primary-foreground"
              onClick={handlePay}
            >
              <Lock className="size-4 mr-1.5" /> Pay {formatINR(finalAdvance)} &
              confirm
            </Button>
          </>
        )}
        {step === "success" && (
          <Button
            className="w-full wedding-gradient text-primary-foreground"
            onClick={onFinished}
          >
            View my bookings
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

function StepBadge({
  n,
  label,
  active,
  done,
  muted,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold ${
          done
            ? "bg-primary text-primary-foreground"
            : active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        } ${muted ? "opacity-50" : ""}`}
      >
        {done ? <CheckCircle2 className="size-3.5" /> : n}
      </div>
      <span className={`text-xs ${active ? "font-semibold" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
