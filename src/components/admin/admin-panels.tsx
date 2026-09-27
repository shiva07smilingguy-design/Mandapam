"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Users,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarHeart,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Phone,
  Mail,
  PartyPopper,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  formatDate,
  computeBookingAdvance,
} from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { toast } from "sonner";
import { genCouponId } from "@/lib/store";

// ----- Admin Dashboard -----

export function AdminDashboard() {
  const { venues, bookings, setAdminView } = useAppStore();

  const totalVenues = venues.length;
  const pendingApprovals = venues.filter((v) => v.status === "pending").length;
  const totalBookings = bookings.length;
  const grossGMV = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.totalAmount, 0);
  const commissionEarned = Math.round(grossGMV * 0.1);
  const activeCustomers = new Set(
    bookings.map((b) => b.customerEmail)
  ).size;

  const gmvData = [
    { month: "Apr", gmv: 1250000, comm: 125000 },
    { month: "May", gmv: 1850000, comm: 185000 },
    { month: "Jun", gmv: 980000, comm: 98000 },
    { month: "Jul", gmv: 2250000, comm: 225000 },
    { month: "Aug", gmv: 2680000, comm: 268000 },
    { month: "Sep", gmv: 3120000, comm: 312000 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-wide overview of venues, bookings and revenue
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={Building2}
          label="Total venues"
          value={`${totalVenues}`}
          delta={`${pendingApprovals} pending approval`}
          accent="text-emerald-700"
          onClick={() => setAdminView("approvals")}
        />
        <Kpi
          icon={CalendarHeart}
          label="Total bookings"
          value={`${totalBookings}`}
          delta={`${bookings.filter((b) => b.status === "pending_payment").length} pending`}
          accent="text-amber-700"
          onClick={() => setAdminView("bookings")}
        />
        <Kpi
          icon={Wallet}
          label="Platform GMV"
          value={formatINR(grossGMV)}
          delta="+18.4% MoM"
          accent="text-primary"
        />
        <Kpi
          icon={TrendingUp}
          label="Commission earned"
          value={formatINR(commissionEarned)}
          delta="10% rate"
          accent="text-emerald-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Platform GMV (last 6 months)</h3>
                <p className="text-xs text-muted-foreground">
                  Gross merchandise value & commission earned
                </p>
              </div>
              <Badge variant="outline" className="text-emerald-700">
                <TrendingUp className="size-3 mr-1" /> Growing
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={gmvData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.2 350)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.55 0.2 350)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.15 45)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="oklch(0.7 0.15 45)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.015 350)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid oklch(0.9 0.015 350)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gmv"
                  stroke="oklch(0.55 0.2 350)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="comm"
                  stroke="oklch(0.7 0.15 45)"
                  fill="url(#g2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold">Quick actions</h3>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setAdminView("approvals")}
            >
              <ShieldCheck className="size-4 mr-2 text-amber-700" />
              Review venue approvals
              {pendingApprovals > 0 && (
                <Badge className="ml-auto bg-amber-500 text-white">{pendingApprovals}</Badge>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setAdminView("disputes")}
            >
              <AlertTriangle className="size-4 mr-2 text-red-700" />
              Resolve disputes
              <Badge className="ml-auto bg-red-500 text-white">2</Badge>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setAdminView("coupons")}
            >
              <Plus className="size-4 mr-2" /> Manage coupons
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setAdminView("reports")}
            >
              <TrendingUp className="size-4 mr-2" /> View reports
            </Button>

            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground mb-2">
                Platform health
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active customers</span>
                  <span className="font-medium">{activeCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified venues</span>
                  <span className="font-medium">
                    {venues.filter((v) => v.verified).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg rating</span>
                  <span className="font-medium">
                    {(
                      venues.reduce((s, v) => s + v.rating, 0) / venues.length
                    ).toFixed(2)}{" "}
                    ★
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  accent,
  onClick,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  delta: string;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`p-4 gap-0 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shrink-0">
          <Icon className="size-5" />
        </div>
        <span className={`text-xs ${accent} font-medium`}>{delta}</span>
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

// ----- Admin Approvals -----

export function AdminApprovals() {
  const { venues, setVenueStatus, selectVenue } = useAppStore();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending"
  );
  const [reviewId, setReviewId] = useState<string | null>(null);

  const filtered =
    filter === "all" ? venues : venues.filter((v) => v.status === filter);
  const reviewVenue = venues.find((v) => v.id === reviewId);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-5">
        <h1 className="font-serif text-3xl font-bold">Venue Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve venue listings before they go live
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
            ["all", "All"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key)}
          >
            {label} ({key === "all" ? venues.length : venues.filter((v) => v.status === key).length})
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <Card key={v.id} className="overflow-hidden p-0">
            <div className="relative aspect-video bg-muted">
              <img
                src={v.coverImage}
                alt={v.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                {v.status === "pending" && (
                  <Badge className="bg-amber-500 text-white border-0">
                    <Clock className="size-3 mr-0.5" /> Pending
                  </Badge>
                )}
                {v.status === "approved" && (
                  <Badge className="bg-emerald-600 text-white border-0">
                    <CheckCircle2 className="size-3 mr-0.5" /> Live
                  </Badge>
                )}
                {v.status === "rejected" && (
                  <Badge className="bg-red-600 text-white border-0">
                    <XCircle className="size-3 mr-0.5" /> Rejected
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              <div>
                <h3 className="font-semibold">{v.name}</h3>
                <div className="text-xs text-muted-foreground">
                  {v.area}, {v.city} · {v.type}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Owner: <span className="font-medium text-foreground">{v.ownerName}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="font-normal">
                  Cap: {v.capacityMin}–{v.capacityMax}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  From {formatINR(v.priceWeekday)}
                </Badge>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setReviewId(v.id)}>
                  <Eye className="size-3.5" /> Review
                </Button>
                {v.status !== "approved" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setVenueStatus(v.id, "approved");
                      toast.success("Venue approved & published");
                    }}
                  >
                    <CheckCircle2 className="size-3.5" /> Approve
                  </Button>
                )}
                {v.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      setVenueStatus(v.id, "rejected");
                      toast.success("Venue rejected");
                    }}
                  >
                    <XCircle className="size-3.5" /> Reject
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!reviewId} onOpenChange={(o) => !o && setReviewId(null)}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto fancy-scroll">
          {reviewVenue && (
            <>
              <DialogHeader>
                <DialogTitle>{reviewVenue.name}</DialogTitle>
                <DialogDescription>
                  Submitted by {reviewVenue.ownerName} · {reviewVenue.createdAt}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={reviewVenue.coverImage}
                    alt={reviewVenue.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Info label="Type" value={reviewVenue.type} />
                  <Info label="City" value={reviewVenue.city} />
                  <Info label="Area" value={reviewVenue.area} />
                  <Info label="Address" value={reviewVenue.address} />
                  <Info
                    label="Capacity"
                    value={`${reviewVenue.capacityMin}–${reviewVenue.capacityMax}`}
                  />
                  <Info
                    label="Weekday / Weekend"
                    value={`${formatINR(reviewVenue.priceWeekday)} / ${formatINR(reviewVenue.priceWeekend)}`}
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Description</div>
                  <p className="text-sm">{reviewVenue.description}</p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Amenities</div>
                  <div className="flex flex-wrap gap-1">
                    {reviewVenue.amenities.map((a) => (
                      <Badge key={a} variant="outline" className="font-normal">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    selectVenue(reviewVenue.id);
                    setReviewId(null);
                  }}
                >
                  Open as customer
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    setVenueStatus(reviewVenue.id, "rejected");
                    setReviewId(null);
                    toast.success("Venue rejected");
                  }}
                >
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    setVenueStatus(reviewVenue.id, "approved");
                    setReviewId(null);
                    toast.success("Venue approved & published");
                  }}
                >
                  Approve & publish
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

// ----- Admin Bookings -----

export function AdminBookings() {
  const { bookings, venues, setBookingStatus } = useAppStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = bookings.filter((b) => {
    if (status !== "all" && b.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.venueName.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-5">
        <h1 className="font-serif text-3xl font-bold">All Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage every booking across the platform
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search by booking ID, customer, venue, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px]"
        />
        <select
          className="h-9 px-3 rounded-md border bg-background text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All status</option>
          <option value="pending_payment">Pending payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto fancy-scroll">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="text-left p-3 font-medium">Booking</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Venue</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-secondary/30">
                  <td className="p-3">
                    <div className="font-mono text-xs">{b.id.toUpperCase()}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {b.paymentRef}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{b.customerName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {b.customerPhone}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>{b.venueName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {b.venueCity}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>{formatDate(b.eventDate)}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {b.eventType} · {b.guestCount} guests
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-semibold text-primary">
                      {formatINR(b.bookingAmount)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      of {formatINR(b.totalAmount)}
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-3">
                    <select
                      className="h-7 text-xs px-2 rounded border bg-background"
                      value={b.status}
                      onChange={(e) => {
                        setBookingStatus(b.id, e.target.value as never);
                        toast.success("Status updated");
                      }}
                    >
                      <option value="pending_payment">Pending payment</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No bookings match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending_payment: {
      label: "Pending",
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
  const meta = map[status] ?? map.confirmed;
  return <Badge className={`${meta.color} border`}>{meta.label}</Badge>;
}

// ----- Admin Commission -----

export function AdminCommission() {
  const { bookings, venues } = useAppStore();
  const rate = 0.1;
  const grossGMV = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.totalAmount, 0);
  const collected = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.bookingAmount, 0);
  const commissionCollected = Math.round(collected * rate);
  const pendingPayouts = Math.round(
    bookings
      .filter((b) => b.status === "completed")
      .reduce((s, b) => s + b.bookingAmount, 0) * (1 - rate)
  );

  const perOwner = venues
    .reduce<
      {
        ownerName: string;
        ownerId: string;
        gross: number;
        commission: number;
        net: number;
        bookings: number;
      }[]
    >((acc, v) => {
      const vBookings = bookings.filter(
        (b) => b.venueId === v.id && b.status !== "cancelled"
      );
      const gross = vBookings.reduce((s, b) => s + b.bookingAmount, 0);
      const existing = acc.find((o) => o.ownerId === v.ownerId);
      if (existing) {
        existing.gross += gross;
        existing.bookings += vBookings.length;
      } else {
        acc.push({
          ownerName: v.ownerName,
          ownerId: v.ownerId,
          gross,
          commission: 0,
          net: 0,
          bookings: vBookings.length,
        });
      }
      return acc;
    }, [])
    .map((o) => ({
      ...o,
      commission: Math.round(o.gross * rate),
      net: o.gross - Math.round(o.gross * rate),
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold">Commission & Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform commission: <strong>10%</strong> · Settled to venue owners on
          5th of every month
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-5 gap-0">
          <div className="text-xs text-muted-foreground uppercase">
            Gross GMV (all time)
          </div>
          <div className="text-2xl font-bold mt-1">{formatINR(grossGMV)}</div>
        </Card>
        <Card className="p-5 gap-0">
          <div className="text-xs text-muted-foreground uppercase">
            Commission collected
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-700">
            {formatINR(commissionCollected)}
          </div>
        </Card>
        <Card className="p-5 gap-0">
          <div className="text-xs text-muted-foreground uppercase">
            Pending owner payouts
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-700">
            {formatINR(pendingPayouts)}
          </div>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">Per-owner settlements</h3>
          <div className="overflow-x-auto fancy-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-3">Venue owner</th>
                  <th className="py-2 pr-3 text-center">Bookings</th>
                  <th className="py-2 pr-3 text-right">Gross collected</th>
                  <th className="py-2 pr-3 text-right">Commission (10%)</th>
                  <th className="py-2 pr-3 text-right">Net payable</th>
                  <th className="py-2 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {perOwner.map((row) => (
                  <tr key={row.ownerId} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{row.ownerName}</td>
                    <td className="py-2.5 pr-3 text-center">{row.bookings}</td>
                    <td className="py-2.5 pr-3 text-right">
                      {formatINR(row.gross)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-amber-700">
                      {formatINR(row.commission)}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-primary">
                      {formatINR(row.net)}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <Button size="sm" variant="outline">
                        Mark settled
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- Admin Disputes -----

export function AdminDisputes() {
  const { disputes, bookings, setDisputeStatus } = useAppStore();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-5">
        <h1 className="font-serif text-3xl font-bold">Disputes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customer / venue-owner disputes and resolution status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {disputes.map((d) => {
          const booking = bookings.find((b) => b.id === d.bookingId);
          return (
            <Card key={d.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{d.subject}</h3>
                      {d.status === "open" && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          Open
                        </Badge>
                      )}
                      {d.status === "investigating" && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Clock className="size-3 mr-0.5" /> Investigating
                        </Badge>
                      )}
                      {d.status === "resolved" && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          <CheckCircle2 className="size-3 mr-0.5" /> Resolved
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Raised by <strong>{d.customerName}</strong> against{" "}
                      <strong>{d.venueName}</strong> on {formatDate(d.raisedAt)}
                    </div>
                  </div>
                </div>
                <p className="text-sm bg-secondary/40 p-2.5 rounded border">
                  {d.description}
                </p>
                {booking && (
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                    <span>Booking: {booking.id.toUpperCase()}</span>
                    <span>Amount: {formatINR(booking.bookingAmount)}</span>
                    <span>Date: {formatDate(booking.eventDate)}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {d.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDisputeStatus(d.id, "investigating");
                        toast.success("Marked as investigating");
                      }}
                    >
                      Start investigation
                    </Button>
                  )}
                  {d.status !== "resolved" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        setDisputeStatus(d.id, "resolved");
                        toast.success("Dispute resolved");
                      }}
                    >
                      <CheckCircle2 className="size-3.5" /> Mark resolved
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Phone className="size-3.5" /> Call customer
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="size-3.5" /> Email owner
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {disputes.length === 0 && (
          <Card className="p-12 text-center col-span-2">
            <CheckCircle2 className="size-12 mx-auto text-emerald-600 mb-3" />
            <h3 className="font-semibold">No disputes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              All clear! No active disputes on the platform.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ----- Admin Coupons -----

export function AdminCoupons() {
  const { coupons, addCoupon, toggleCoupon, deleteCoupon } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "flat" as "flat" | "percent",
    value: 1000,
    minAmount: 50000,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold">Coupons & Offers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage promo codes customers can apply at checkout
          </p>
        </div>
        <Button
          className="wedding-gradient text-primary-foreground"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4" /> New coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                      {c.code}
                    </code>
                    {c.active ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {c.description}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {c.type === "flat"
                      ? `Flat ${formatINR(c.value)} off`
                      : `${c.value}% off (max ₹15,000)`}{" "}
                    · Min booking {formatINR(c.minAmount)}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={c.active}
                      onCheckedChange={() => toggleCoupon(c.id)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {c.active ? "On" : "Off"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive h-7"
                    onClick={() => {
                      deleteCoupon(c.id);
                      toast.success("Coupon deleted");
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create coupon</DialogTitle>
            <DialogDescription>
              Coupons can be applied at checkout by customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Coupon code</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="WEDDING1000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Flat ₹1000 off on bookings above ₹50,000"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select
                  className="h-9 px-3 rounded-md border bg-background w-full text-sm"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as never })
                  }
                >
                  <option value="flat">Flat amount</option>
                  <option value="percent">Percentage</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) =>
                    setForm({ ...form, value: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Minimum booking amount</Label>
              <Input
                type="number"
                value={form.minAmount}
                onChange={(e) =>
                  setForm({ ...form, minAmount: Number(e.target.value) })
                }
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
                if (!form.code) {
                  toast.error("Coupon code required");
                  return;
                }
                addCoupon({
                  id: genCouponId(),
                  code: form.code,
                  description: form.description,
                  type: form.type,
                  value: form.value,
                  minAmount: form.minAmount,
                  active: true,
                });
                toast.success("Coupon created");
                setDialogOpen(false);
              }}
            >
              Create coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----- Admin Reports -----

export function AdminReports() {
  const { venues, bookings } = useAppStore();

  // City-wise
  const cityData = venues
    .filter((v) => v.status === "approved")
    .reduce<Record<string, number>>((acc, v) => {
      acc[v.city] = (acc[v.city] ?? 0) + 1;
      return acc;
    }, {});
  const cityRows = Object.entries(cityData).sort((a, b) => b[1] - a[1]);

  // Venue type
  const typeData = venues
    .filter((v) => v.status === "approved")
    .reduce<Record<string, number>>((acc, v) => {
      acc[v.type] = (acc[v.type] ?? 0) + 1;
      return acc;
    }, {});

  // Monthly bookings
  const monthlyBookings = [
    { month: "Apr", bookings: 18 },
    { month: "May", bookings: 24 },
    { month: "Jun", bookings: 15 },
    { month: "Jul", bookings: 31 },
    { month: "Aug", bookings: 38 },
    { month: "Sep", bookings: 45 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-wide insights on venues, bookings and trends
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-1">Bookings per month</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Total confirmed + completed bookings
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyBookings}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.015 350)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar
                  dataKey="bookings"
                  fill="oklch(0.55 0.2 350)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-1">Venues by city</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Distribution of approved venues
            </p>
            <div className="space-y-2">
              {cityRows.map(([city, count]) => {
                const max = Math.max(...cityRows.map((r) => r[1]));
                const pct = (count / max) * 100;
                return (
                  <div key={city} className="flex items-center gap-3">
                    <div className="w-24 text-sm">{city}</div>
                    <div className="flex-1 h-6 bg-secondary/50 rounded relative overflow-hidden">
                      <div
                        className="h-full wedding-gradient"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-8 text-sm text-right font-medium">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">Venues by type</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(typeData).map(([type, count]) => (
                <div
                  key={type}
                  className="p-3 rounded-lg border bg-secondary/30"
                >
                  <div className="text-xs text-muted-foreground">{type}</div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3">Top venues by rating</h3>
            <div className="space-y-2">
              {venues
                .filter((v) => v.status === "approved")
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 5)
                .map((v, idx) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50"
                  >
                    <div className="text-sm font-medium w-6 text-right">
                      #{idx + 1}
                    </div>
                    <img
                      src={v.coverImage}
                      alt={v.name}
                      className="size-8 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {v.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {v.city}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {v.rating.toFixed(1)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ----- Admin Customers -----

export function AdminCustomers() {
  const { bookings } = useAppStore();
  const customers = bookings.reduce<
    Record<
      string,
      {
        name: string;
        email: string;
        phone: string;
        bookings: number;
        spent: number;
      }
    >
  >((acc, b) => {
    if (!acc[b.customerEmail]) {
      acc[b.customerEmail] = {
        name: b.customerName,
        email: b.customerEmail,
        phone: b.customerPhone,
        bookings: 0,
        spent: 0,
      };
    }
    acc[b.customerEmail].bookings += 1;
    if (b.status !== "cancelled") {
      acc[b.customerEmail].spent += b.bookingAmount;
    }
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-5">
        <h1 className="font-serif text-3xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All customers who have made bookings on the platform
        </p>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto fancy-scroll">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase">
              <tr>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Contact</th>
                <th className="text-center p-3 font-medium">Bookings</th>
                <th className="text-right p-3 font-medium">Total spent</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(customers).map((c) => (
                <tr
                  key={c.email}
                  className="border-b last:border-0 hover:bg-secondary/30"
                >
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground">
                    <div className="text-xs">{c.email}</div>
                    <div className="text-xs">{c.phone}</div>
                  </td>
                  <td className="p-3 text-center">{c.bookings}</td>
                  <td className="p-3 text-right font-semibold text-primary">
                    {formatINR(c.spent)}
                  </td>
                </tr>
              ))}
              {Object.keys(customers).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No customers yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- Admin Reviews (read-only) -----

export function AdminReviews() {
  const { venues } = useAppStore();
  const allReviews = venues.flatMap((v) =>
    v.reviews.map((r) => ({ ...r, venueName: v.name, venueCity: v.city }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-5">
        <h1 className="font-serif text-3xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All customer reviews across the platform · {allReviews.length} total
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allReviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{r.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.venueName} · {r.venueCity} · {formatDate(r.date)}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < r.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm mt-2 text-foreground/85">
                &quot;{r.comment}&quot;
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="font-normal">
                  <PartyPopper className="size-3 mr-1" /> {r.eventType}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
