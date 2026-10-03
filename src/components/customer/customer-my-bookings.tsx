"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarHeart,
  MapPin,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  PartyPopper,
  AlertCircle,
  Download,
  MessageCircle,
} from "lucide-react";
import { useAppStore, formatINR, formatDate } from "@/lib/store";
import { BackButton } from "@/components/back-button";
import type { BookingStatus } from "@/lib/types";
import { toast } from "sonner";

const STATUS_META: Record<
  BookingStatus,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  pending_payment: {
    label: "Pending payment",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: PartyPopper,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    color: "bg-zinc-100 text-zinc-800 border-zinc-200",
    icon: AlertCircle,
  },
};

export function CustomerMyBookings() {
  const { bookings, currentUser, venues, selectVenue, setBookingStatus } =
    useAppStore();
  const [tab, setTab] = useState<"all" | "upcoming" | "completed" | "cancelled">(
    "all"
  );

  const myBookings = bookings.filter(
    (b) => b.customerId === (currentUser?.id ?? "u-cust-1")
  );

  const today = new Date().toISOString().split("T")[0];
  const filtered = myBookings.filter((b) => {
    if (tab === "all") return true;
    if (tab === "upcoming")
      return b.eventDate >= today && b.status !== "cancelled";
    if (tab === "completed")
      return b.status === "completed" || b.eventDate < today;
    if (tab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const stats = {
    total: myBookings.length,
    upcoming: myBookings.filter(
      (b) => b.eventDate >= today && b.status !== "cancelled"
    ).length,
    spent: myBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.bookingAmount, 0),
    pending: myBookings.filter((b) => b.status === "pending_payment").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <BackButton />
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">My Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {currentUser?.name?.split(" ")[0] ?? "Guest"} — here are
          your venue bookings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={CalendarHeart}
          label="Total bookings"
          value={`${stats.total}`}
        />
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={`${stats.upcoming}`}
          accent="text-amber-700"
        />
        <StatCard
          icon={Wallet}
          label="Total paid"
          value={formatINR(stats.spent)}
          accent="text-primary"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending payment"
          value={`${stats.pending}`}
          accent="text-red-700"
        />
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({stats.upcoming})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarHeart className="size-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No bookings to show</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse venues and book your first event.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const venue = venues.find((v) => v.id === b.venueId);
            const meta = STATUS_META[b.status];
            const Icon = meta.icon;
            const upcoming = b.eventDate >= today && b.status !== "cancelled";
            return (
              <Card key={b.id} className="overflow-hidden p-0">
                <div className="grid sm:grid-cols-[160px_1fr] gap-0">
                  <div className="aspect-video sm:aspect-auto bg-muted">
                    {venue && (
                      <img
                        src={venue.coverImage}
                        alt={b.venueName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className="font-semibold text-base cursor-pointer hover:text-primary"
                            onClick={() => venue && selectVenue(venue.id)}
                          >
                            {b.venueName}
                          </h3>
                          <Badge className={`${meta.color} border`}>
                            <Icon className="size-3 mr-1" />
                            {meta.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="size-3" /> {b.venueCity} · Booking{" "}
                          {b.id.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                          Paid
                        </div>
                        <div className="font-bold text-primary">
                          {formatINR(b.bookingAmount)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          of {formatINR(b.totalAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <InfoPill
                        icon={CalendarHeart}
                        label="Date"
                        value={formatDate(b.eventDate)}
                      />
                      <InfoPill
                        icon={PartyPopper}
                        label="Event"
                        value={b.eventType}
                      />
                      <InfoPill
                        icon={Users}
                        label="Guests"
                        value={`${b.guestCount}`}
                      />
                      <InfoPill
                        icon={Wallet}
                        label="Payment"
                        value={b.paymentRef}
                      />
                    </div>

                    {b.packageName && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Package:</span>{" "}
                        <span className="font-medium">{b.packageName}</span>
                      </div>
                    )}

                    {b.specialRequests && (
                      <div className="text-xs bg-secondary/50 rounded p-2 border">
                        <span className="text-muted-foreground">
                          Special requests:
                        </span>{" "}
                        {b.specialRequests}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {venue && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectVenue(venue.id)}
                        >
                          View venue
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Download className="size-3.5" /> Invoice
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="size-3.5" /> Contact owner
                      </Button>
                      {upcoming && b.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/5"
                          onClick={() => {
                            setBookingStatus(b.id, "cancelled");
                            toast.success("Booking cancelled", {
                              description: "Refund will be processed in 5-7 days.",
                            });
                          }}
                        >
                          Cancel booking
                        </Button>
                      )}
                      {b.status === "pending_payment" && (
                        <Button size="sm" className="wedding-gradient text-primary-foreground">
                          Complete payment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-foreground",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="p-4 gap-0">
      <div className="flex items-center gap-2.5">
        <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shrink-0">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className={`text-lg font-bold ${accent}`}>{value}</div>
        </div>
      </div>
    </Card>
  );
}

function InfoPill({
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
