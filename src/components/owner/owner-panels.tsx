"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Calendar as CalendarIcon,
  Users,
  Wallet,
  PartyPopper,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  formatDate,
  isVenueAvailable,
} from "@/lib/store";
import {
  computeCommission,
  getBaseRatePercent,
  COMMISSION_BASE_RATES,
  COMMISSION_SLABS,
  COMMISSION_FLOOR_PERCENT,
} from "@/lib/commission";
import { OwnerWalletCard } from "@/components/inquiry/owner-wallet-and-admin";
import { BackButton } from "@/components/back-button";
import type { BookingStatus, VenuePackage } from "@/lib/types";
import { toast } from "sonner";

function monthMatrix(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push(date.toISOString().split("T")[0]);
  }
  return cells;
}

export function OwnerCalendar() {
  const { venues, currentUser, toggleBlockDate, bookings } = useAppStore();
  const myVenues = venues.filter(
    (v) => v.ownerId === (currentUser?.id ?? "u-owner-1")
  );
  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    myVenues[0]?.id ?? ""
  );
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const venue = myVenues.find((v) => v.id === selectedVenueId);
  const cells = useMemo(
    () => monthMatrix(cursor.year, cursor.month),
    [cursor]
  );

  if (myVenues.length === 0) {
    return (
      <Card className="p-12 text-center mx-auto max-w-3xl mt-8">
        <CalendarIcon className="size-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold">No venues to manage</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add a venue first to start managing its calendar.
        </p>
      </Card>
    );
  }

  const monthName = new Date(cursor.year, cursor.month, 1).toLocaleString(
    "en-IN",
    { month: "long", year: "numeric" }
  );

  const bookingForDate = (date: string) =>
    bookings.find(
      (b) =>
        b.venueId === selectedVenueId &&
        b.eventDate === date &&
        b.status !== "cancelled"
    );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <BackButton />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Block unavailable dates and see confirmed bookings
          </p>
        </div>
        <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {myVenues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {venue && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCursor((c) => ({
                    year: c.month === 0 ? c.year - 1 : c.year,
                    month: c.month === 0 ? 11 : c.month - 1,
                  }))
                }
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="font-semibold">{monthName}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCursor((c) => ({
                    year: c.month === 11 ? c.year + 1 : c.year,
                    month: c.month === 11 ? 0 : c.month + 1,
                  }))
                }
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-[11px] text-muted-foreground font-medium py-1"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const day = new Date(date + "T00:00:00");
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = day < today;
                const weekend = day.getDay() === 0 || day.getDay() === 6;
                const booked = !isVenueAvailable(venue, date);
                const booking = bookingForDate(date);
                const isBlocked = venue.blockedDates.includes(date) && !booking;
                return (
                  <button
                    key={date}
                    disabled={isPast}
                    onClick={() => {
                      if (booking) return;
                      toggleBlockDate(venue.id, date);
                      toast.success(
                        isBlocked ? "Date unblocked" : "Date blocked",
                        { description: date }
                      );
                    }}
                    className={`aspect-square rounded text-xs p-1 flex flex-col items-center justify-center border transition relative ${
                      isPast
                        ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                        : booking
                        ? "bg-primary text-primary-foreground border-primary cursor-default"
                        : isBlocked
                        ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        : weekend
                        ? "bg-accent/40 border-accent hover:bg-accent/60"
                        : "bg-background border-border hover:border-primary"
                    }`}
                  >
                    <span className="font-medium">{day.getDate()}</span>
                    {booking && (
                      <span className="text-[9px] truncate w-full text-center">
                        {booking.customerName.split(" ")[0]}
                      </span>
                    )}
                    {isBlocked && !isPast && (
                      <Lock className="size-2.5 absolute top-0.5 right-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <Legend className="bg-primary/90" label="Booked" />
              <Legend className="bg-red-100 border border-red-200" label="Blocked by you" />
              <Legend className="bg-accent/40 border border-accent" label="Weekend" />
              <Legend className="bg-background border border-border" label="Available" />
            </div>

            <div className="mt-3 text-xs text-muted-foreground bg-secondary/40 rounded p-3 border">
              <strong className="text-foreground">Tip:</strong> Click any future date to
              block / unblock it. Dates with confirmed bookings cannot be blocked.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming bookings list for selected venue */}
      {venue && (
        <Card className="mt-5">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">
              Upcoming events · {venue.name}
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto fancy-scroll">
              {bookings
                .filter(
                  (b) =>
                    b.venueId === venue.id &&
                    b.status !== "cancelled" &&
                    b.eventDate >= new Date().toISOString().split("T")[0]
                )
                .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
                .map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/30"
                  >
                    <div className="grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                      <div className="leading-none">
                        {new Date(b.eventDate + "T00:00:00").getDate()}
                      </div>
                      <div className="text-[9px] uppercase">
                        {new Date(b.eventDate + "T00:00:00").toLocaleString(
                          "en-IN",
                          { month: "short" }
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{b.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.eventType} · {b.guestCount} guests · {b.packageName ?? "Venue only"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-primary">
                        {formatINR(b.bookingAmount)}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          b.status === "confirmed"
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }
                      >
                        {b.status === "confirmed" ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              {bookings.filter(
                (b) =>
                  b.venueId === venue.id &&
                  b.status !== "cancelled" &&
                  b.eventDate >= new Date().toISOString().split("T")[0]
              ).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events for this venue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block size-3 rounded ${className}`} />
      {label}
    </span>
  );
}

// ----- Owner Bookings -----

const STATUS_META: Record<BookingStatus, { label: string; color: string }> = {
  pending_payment: {
    label: "Pending payment",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  completed: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  refunded: {
    label: "Refunded",
    color: "bg-zinc-100 text-zinc-800 border-zinc-200",
  },
};

export function OwnerBookings() {
  const { venues, bookings, currentUser, setBookingStatus, setOwnerNote } =
    useAppStore();
  const myVenueIds = new Set(
    venues
      .filter((v) => v.ownerId === (currentUser?.id ?? "u-owner-1"))
      .map((v) => v.id)
  );
  const myBookings = bookings.filter((b) => myVenueIds.has(b.venueId));
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [noteModal, setNoteModal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const filtered =
    filter === "all"
      ? myBookings
      : myBookings.filter((b) => b.status === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <BackButton />
      <div className="mb-5">
        <h1 className="font-serif text-3xl font-bold">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage incoming bookings for all your venues
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ["all", "All"],
            ["pending_payment", "Pending payment"],
            ["confirmed", "Confirmed"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key as never)}
          >
            {label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarHeart className="size-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No bookings</h3>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const meta = STATUS_META[b.status];
            return (
              <Card key={b.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{b.venueName}</h3>
                        <Badge className={`${meta.color} border`}>{meta.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Booking {b.id.toUpperCase()} · {b.paymentRef}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatINR(b.bookingAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {formatINR(b.totalAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <Pill icon={PartyPopper} label="Customer" value={b.customerName} />
                    <Pill icon={CalendarHeart} label="Date" value={formatDate(b.eventDate)} />
                    <Pill icon={Users} label="Guests" value={`${b.guestCount}`} />
                    <Pill icon={Wallet} label="Event" value={b.eventType} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5" /> {b.customerPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="size-3.5" /> {b.customerEmail}
                    </span>
                    {b.packageName && (
                      <span className="font-medium text-foreground">
                        Package: {b.packageName}
                      </span>
                    )}
                  </div>

                  {b.specialRequests && (
                    <div className="text-xs bg-secondary/50 rounded p-2 border">
                      <span className="text-muted-foreground">Special requests:</span>{" "}
                      {b.specialRequests}
                    </div>
                  )}

                  {b.ownerNote && (
                    <div className="text-xs bg-primary/5 rounded p-2 border border-primary/20">
                      <span className="text-primary font-medium">Your note:</span>{" "}
                      {b.ownerNote}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {b.status === "pending_payment" && (
                      <Button
                        size="sm"
                        className="wedding-gradient text-primary-foreground"
                        onClick={() => {
                          setBookingStatus(b.id, "confirmed");
                          toast.success("Booking marked as confirmed");
                        }}
                      >
                        <CheckCircle2 className="size-3.5" /> Accept & confirm
                      </Button>
                    )}
                    {b.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setBookingStatus(b.id, "completed");
                          toast.success("Marked as completed");
                        }}
                      >
                        <CheckCircle2 className="size-3.5" /> Mark completed
                      </Button>
                    )}
                    {(b.status === "confirmed" || b.status === "pending_payment") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => {
                          setBookingStatus(b.id, "cancelled");
                          toast.success("Booking cancelled");
                        }}
                      >
                        <XCircle className="size-3.5" /> Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNoteModal(b.id);
                        setNoteText(b.ownerNote ?? "");
                      }}
                    >
                      Add note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!noteModal} onOpenChange={(o) => !o && setNoteModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Internal note</DialogTitle>
            <DialogDescription>
              Only you (the venue owner) can see this note.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            placeholder="e.g. Customer wants extra parking, will confirm count by 5th."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModal(null)}>
              Cancel
            </Button>
            <Button
              className="wedding-gradient text-primary-foreground"
              onClick={() => {
                if (noteModal) setOwnerNote(noteModal, noteText);
                setNoteModal(null);
                toast.success("Note saved");
              }}
            >
              Save note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Pill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-secondary/40 rounded p-2 border">
      <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
        <Icon className="size-3" /> {label}
      </div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  );
}

// ----- Owner Packages -----

export function OwnerPackages() {
  const { venues, currentUser, addPackage, deletePackage } = useAppStore();
  const myVenues = venues.filter(
    (v) => v.ownerId === (currentUser?.id ?? "u-owner-1")
  );
  const [selectedVenueId, setSelectedVenueId] = useState<string>(
    myVenues[0]?.id ?? ""
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 100000,
    includes: "",
  });

  const venue = myVenues.find((v) => v.id === selectedVenueId);

  if (myVenues.length === 0) {
    return (
      <Card className="p-12 text-center mx-auto max-w-3xl mt-8">
        <h3 className="font-semibold">No venues to manage</h3>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <BackButton />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold">Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create all-inclusive packages for your venues
          </p>
        </div>
        <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {myVenues.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {venue && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Packages for {venue.name}</h3>
              <Button
                className="wedding-gradient text-primary-foreground"
                size="sm"
                onClick={() => {
                  setForm({ name: "", description: "", price: 100000, includes: "" });
                  setDialogOpen(true);
                }}
              >
                + Add package
              </Button>
            </div>
            <div className="space-y-3">
              {venue.packages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No packages yet. Add your first one.
                </p>
              ) : (
                venue.packages.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-lg border bg-secondary/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.description}
                        </p>
                        <ul className="text-xs mt-2 flex flex-wrap gap-1.5">
                          {p.includes.map((inc) => (
                            <Badge
                              key={inc}
                              variant="outline"
                              className="font-normal text-[10px]"
                            >
                              {inc}
                            </Badge>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {formatINR(p.price)}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-7 mt-1"
                          onClick={() => {
                            deletePackage(venue.id, p.id);
                            toast.success("Package removed");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New package</DialogTitle>
            <DialogDescription>
              Packages appear on the venue detail page for customers to select
              during booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Package name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Gold Royal"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Total price (INR)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Inclusions (one per line)</Label>
              <Textarea
                value={form.includes}
                onChange={(e) =>
                  setForm({ ...form, includes: e.target.value })
                }
                rows={3}
                placeholder="Venue rental&#10;Catering&#10;Decoration"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="wedding-gradient text-primary-foreground"
              onClick={() => {
                if (!form.name) {
                  toast.error("Package name required");
                  return;
                }
                const pkg: VenuePackage = {
                  id: `p-${Date.now().toString(36)}`,
                  name: form.name,
                  description: form.description || "Custom package",
                  price: form.price,
                  includes: form.includes
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                };
                addPackage(venue!.id, pkg);
                toast.success("Package added");
                setDialogOpen(false);
              }}
            >
              Save package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----- Owner Earnings -----

export function OwnerEarnings() {
  const { venues, bookings, currentUser } = useAppStore();
  const myVenues = venues.filter(
    (v) => v.ownerId === (currentUser?.id ?? "u-owner-1")
  );
  const myVenueIds = new Set(myVenues.map((v) => v.id));
  const myBookings = bookings.filter(
    (b) => myVenueIds.has(b.venueId) && b.status !== "cancelled"
  );

  // Per-booking commission breakdown (tiered by venue type + slab discount)
  const bookingBreakdown = myBookings.map((b) => {
    const venue = venues.find((v) => v.id === b.venueId)!;
    const breakdown = computeCommission(venue.type, b.bookingAmount);
    return { booking: b, venue, breakdown };
  });

  const grossRevenue = bookingBreakdown.reduce(
    (s, r) => s + r.booking.bookingAmount,
    0
  );
  const totalCommission = bookingBreakdown.reduce(
    (s, r) => s + r.breakdown.commissionAmount,
    0
  );
  const netEarnings = grossRevenue - totalCommission;
  const effectiveRate =
    grossRevenue > 0 ? (totalCommission / grossRevenue) * 100 : 0;

  // Per-venue aggregate
  const perVenue = myVenues.map((v) => {
    const venueRows = bookingBreakdown.filter((r) => r.venue.id === v.id);
    const gross = venueRows.reduce((s, r) => s + r.booking.bookingAmount, 0);
    const commission = venueRows.reduce(
      (s, r) => s + r.breakdown.commissionAmount,
      0
    );
    return {
      venue: v,
      gross,
      commission,
      net: gross - commission,
      bookings: venueRows.length,
      baseRate: getBaseRatePercent(v.type),
    };
  });

  const monthly = [
    { month: "Apr", net: 215000 },
    { month: "May", net: 268000 },
    { month: "Jun", net: 178000 },
    { month: "Jul", net: 380000 },
    { month: "Aug", net: 350000 },
    { month: "Sep", net: 462000 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <BackButton />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Earnings & Settlements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tiered commission · {myBookings.length} active bookings · settled on
            5th of every month
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Effective rate: <strong className="ml-1">{effectiveRate.toFixed(2)}%</strong>
        </Badge>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-5 gap-0">
          <div className="text-xs text-muted-foreground uppercase">Gross revenue</div>
          <div className="text-2xl font-bold mt-1">{formatINR(grossRevenue)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            From {myBookings.length} active bookings
          </div>
        </Card>
        <Card className="p-5 gap-0">
          <div className="text-xs text-muted-foreground uppercase">
            Platform commission
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-700">
            − {formatINR(totalCommission)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Tiered by venue type & booking value
          </div>
        </Card>
        <Card className="p-5 gap-0 wedding-gradient-soft border-primary/20">
          <div className="text-xs text-muted-foreground uppercase">Net earnings</div>
          <div className="text-2xl font-bold mt-1 text-primary">
            {formatINR(netEarnings)}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            Next payout: 5th of next month
          </div>
        </Card>
      </div>

      {/* Commission policy explainer */}
      <Card className="border-primary/15">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground">
              <Info className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold">How Mandapam commission works</h3>
              <p className="text-xs text-muted-foreground">
                Base rate depends on venue type · high-value bookings get a
                discount · floor of 5% applies
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                Tier 1 · Base rate by venue type
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {Object.entries(COMMISSION_BASE_RATES).map(([type, rate]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between bg-secondary/40 rounded px-2 py-1 border"
                  >
                    <span className="truncate">{type}</span>
                    <Badge variant="outline" className="font-mono">
                      {(rate * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                Tier 2 · High-value slab discount
              </div>
              <div className="space-y-1.5 text-xs">
                {COMMISSION_SLABS.map((slab) => (
                  <div
                    key={slab.label}
                    className="flex items-center justify-between bg-secondary/40 rounded px-2 py-1.5 border"
                  >
                    <span>{slab.label}</span>
                    <Badge
                      variant="outline"
                      className={
                        slab.discountPercent > 0
                          ? "text-emerald-700 border-emerald-200"
                          : "text-muted-foreground"
                      }
                    >
                      {slab.discountPercent > 0
                        ? `−${slab.discountPercent}pp`
                        : "base"}
                    </Badge>
                  </div>
                ))}
                <div className="text-[10px] text-muted-foreground pt-1">
                  Floor: final rate never goes below{" "}
                  <strong>{COMMISSION_FLOOR_PERCENT}%</strong>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-venue summary */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">Per-venue breakdown</h3>
          <div className="overflow-x-auto fancy-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-3">Venue</th>
                  <th className="py-2 pr-3 text-center">Type</th>
                  <th className="py-2 pr-3 text-center">Bookings</th>
                  <th className="py-2 pr-3 text-right">Gross</th>
                  <th className="py-2 pr-3 text-center">Base rate</th>
                  <th className="py-2 pr-3 text-right">Commission</th>
                  <th className="py-2 pr-3 text-right">Net payable</th>
                </tr>
              </thead>
              <tbody>
                {perVenue.map((row) => (
                  <tr key={row.venue.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={row.venue.coverImage}
                          alt={row.venue.name}
                          className="size-8 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium">{row.venue.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.venue.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-center text-xs">
                      {row.venue.type}
                    </td>
                    <td className="py-2.5 pr-3 text-center">{row.bookings}</td>
                    <td className="py-2.5 pr-3 text-right">
                      {formatINR(row.gross)}
                    </td>
                    <td className="py-2.5 pr-3 text-center">
                      <Badge variant="outline" className="font-mono">
                        {(row.baseRate * 100).toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-3 text-right text-amber-700">
                      − {formatINR(row.commission)}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-primary">
                      {formatINR(row.net)}
                    </td>
                  </tr>
                ))}
                {perVenue.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground text-sm">
                      No active bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
              {perVenue.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td colSpan={3} className="py-2.5 pr-3">
                      Total
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {formatINR(grossRevenue)}
                    </td>
                    <td />
                    <td className="py-2.5 pr-3 text-right text-amber-700">
                      − {formatINR(totalCommission)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-primary">
                      {formatINR(netEarnings)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Per-booking commission details */}
      {bookingBreakdown.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-1">Per-booking commission</h3>
            <p className="text-xs text-muted-foreground mb-3">
              See exactly how each booking&apos;s commission was calculated
            </p>
            <div className="overflow-x-auto fancy-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-3">Booking</th>
                    <th className="py-2 pr-3">Venue</th>
                    <th className="py-2 pr-3 text-right">Amount</th>
                    <th className="py-2 pr-3 text-center">Base</th>
                    <th className="py-2 pr-3 text-center">Slab</th>
                    <th className="py-2 pr-3 text-center">Final</th>
                    <th className="py-2 pr-3 text-right">Commission</th>
                    <th className="py-2 pr-3 text-right">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingBreakdown.map(({ booking, venue, breakdown }) => (
                    <tr
                      key={booking.id}
                      className="border-b last:border-0 hover:bg-secondary/30"
                    >
                      <td className="py-2 pr-3">
                        <div className="font-mono text-[11px]">
                          {booking.id.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {booking.eventDate}
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="text-xs font-medium truncate max-w-[160px]">
                          {venue.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {venue.type}
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {formatINR(booking.bookingAmount)}
                      </td>
                      <td className="py-2 pr-3 text-center text-xs">
                        {(breakdown.baseRatePercent * 100).toFixed(0)}%
                      </td>
                      <td className="py-2 pr-3 text-center text-xs">
                        {breakdown.slabDiscountPercent > 0 ? (
                          <span className="text-emerald-700">
                            −{breakdown.slabDiscountPercent}pp
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-center">
                        <Badge variant="outline" className="font-mono">
                          {(breakdown.finalRatePercent * 100).toFixed(1)}%
                          {breakdown.floorApplied && (
                            <span className="ml-1 text-amber-700" title="Floor of 5% applied">
                              ⚐
                            </span>
                          )}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3 text-right text-amber-700">
                        {formatINR(breakdown.commissionAmount)}
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold text-primary">
                        {formatINR(breakdown.ownerPayout)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-1">Monthly net payouts</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Settled to your registered bank account on 5th of every month
          </p>
          <div className="space-y-2">
            {monthly.map((m) => {
              const max = Math.max(...monthly.map((x) => x.net));
              const pct = (m.net / max) * 100;
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <div className="w-10 text-xs text-muted-foreground font-medium">
                    {m.month}
                  </div>
                  <div className="flex-1 h-7 bg-secondary/50 rounded relative overflow-hidden">
                    <div
                      className="h-full wedding-gradient"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3 text-xs font-medium">
                      {formatINR(m.net)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Inquiry-based wallet (escrow) */}
      <OwnerWalletCard />
    </div>
  );
}
