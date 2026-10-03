"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CalendarHeart,
  Building2,
  Star,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Send,
  Lock,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  formatDate,
  computeBookingAdvance,
} from "@/lib/store";
import { BackButton } from "@/components/back-button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export function OwnerDashboard() {
  const { venues, bookings, inquiries, currentUser, setOwnerView, selectVenue } =
    useAppStore();

  const myVenues = venues.filter(
    (v) => v.ownerId === (currentUser?.id ?? "u-owner-1")
  );
  const myVenueIds = new Set(myVenues.map((v) => v.id));
  const myBookings = bookings.filter((b) => myVenueIds.has(b.venueId));
  const myInquiries = inquiries.filter((i) => myVenueIds.has(i.venueId));

  const today = new Date().toISOString().split("T")[0];
  const upcoming = myBookings
    .filter((b) => b.eventDate >= today && b.status !== "cancelled")
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const revenue = myBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.bookingAmount, 0);
  const pendingActions = myBookings.filter(
    (b) => b.status === "pending_payment"
  ).length;

  // Inquiry stats
  const pendingInquiries = myInquiries.filter((i) =>
    ["pending_owner", "accepted_by_customer"].includes(i.status)
  ).length;
  const activeInquiries = myInquiries.filter((i) =>
    ["quoted", "date_locked", "paid", "receipt_uploaded"].includes(i.status)
  ).length;
  const walletEscrow = myInquiries
    .filter((i) => i.status === "paid" || i.status === "receipt_uploaded")
    .reduce((s, i) => s + (i.advancePaid ?? 0), 0);
  const recentInquiries = [...myInquiries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Charts data
  const monthlyData = [
    { month: "Apr", revenue: 245000 },
    { month: "May", revenue: 312000 },
    { month: "Jun", revenue: 198000 },
    { month: "Jul", revenue: 425000 },
    { month: "Aug", revenue: 388000 },
    { month: "Sep", revenue: 512000 },
  ];
  const eventTypeData = [
    { name: "Wedding", value: 12, color: "oklch(0.55 0.2 350)" },
    { name: "Reception", value: 8, color: "oklch(0.7 0.15 45)" },
    { name: "Engagement", value: 4, color: "oklch(0.65 0.18 150)" },
    { name: "Corporate", value: 3, color: "oklch(0.7 0.16 280)" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            Welcome, {currentUser?.name?.split(" ")[0] ?? "Owner"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {myVenues.length} venues · {myBookings.length} total bookings
          </p>
        </div>
        <Button
          className="wedding-gradient text-primary-foreground"
          onClick={() => setOwnerView("venues")}
        >
          + Add new venue
        </Button>
      </div>

      {/* KPIs — inquiry-aware */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard
          icon={Send}
          label="Pending inquiries"
          value={`${pendingInquiries}`}
          delta="Needs your response"
          accent="text-amber-700"
          onClick={() => setOwnerView("inquiries")}
        />
        <KpiCard
          icon={CalendarHeart}
          label="Active bookings"
          value={`${activeInquiries}`}
          delta="In progress"
          accent="text-blue-700"
          onClick={() => setOwnerView("inquiries")}
        />
        <KpiCard
          icon={Wallet}
          label="In wallet (escrow)"
          value={formatINR(walletEscrow)}
          delta="Advance held by Mandapam"
          accent="text-emerald-700"
          onClick={() => setOwnerView("earnings")}
        />
        <KpiCard
          icon={Building2}
          label="Active venues"
          value={`${myVenues.filter((v) => v.status === "approved").length}`}
          delta={`${myVenues.filter((v) => v.status === "pending").length} pending approval`}
          accent="text-emerald-700"
          onClick={() => setOwnerView("venues")}
        />
        <KpiCard
          icon={TrendingUp}
          label="Total revenue (bookings)"
          value={formatINR(revenue)}
          delta="+12.4% MoM"
          accent="text-primary"
        />
        <KpiCard
          icon={Star}
          label="Avg rating"
          value={
            myVenues.length > 0
              ? (
                  myVenues.reduce((s, v) => s + v.rating, 0) / myVenues.length
                ).toFixed(1)
              : "—"
          }
          delta={`${myVenues.reduce((s, v) => s + v.reviewsCount, 0)} reviews`}
          accent="text-amber-700"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Revenue (last 6 months)</h3>
                <p className="text-xs text-muted-foreground">
                  Booking advance collected per month
                </p>
              </div>
              <Badge variant="outline" className="text-emerald-700">
                <TrendingUp className="size-3 mr-1" /> +18.4%
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.015 350)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickFormatter={(v) => `₹${v / 1000}k`}
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
                <Bar dataKey="revenue" fill="oklch(0.55 0.2 350)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-1">Events by type</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Last 12 months
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {eventTypeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent inquiries */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Recent inquiries</h3>
              <p className="text-xs text-muted-foreground">
                Latest leads from customers — respond within 4 hours
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOwnerView("inquiries")}
            >
              View all <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No inquiries yet. They&apos;ll appear here when customers submit
              them.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto fancy-scroll">
              {recentInquiries.map((inq) => {
                const venue = myVenues.find((v) => v.id === inq.venueId);
                const stepLabel =
                  inq.status === "pending_owner"
                    ? "Respond now"
                    : inq.status === "quoted"
                    ? "Quote sent"
                    : inq.status === "accepted_by_customer"
                    ? "Lock date"
                    : inq.status === "date_locked"
                    ? "Awaiting payment"
                    : inq.status === "paid"
                    ? "Advance received"
                    : inq.status === "receipt_uploaded"
                    ? "Receipt submitted"
                    : inq.status === "released"
                    ? "Completed"
                    : inq.status;
                const stepColor =
                  inq.status === "pending_owner"
                    ? "text-amber-700"
                    : inq.status === "accepted_by_customer"
                    ? "text-indigo-700"
                    : inq.status === "paid" || inq.status === "released"
                    ? "text-emerald-700"
                    : "text-muted-foreground";
                return (
                  <div
                    key={inq.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer"
                    onClick={() => setOwnerView("inquiries")}
                  >
                    {venue && (
                      <img
                        src={venue.coverImage}
                        alt={inq.venueName}
                        className="size-10 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {inq.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {inq.venueName} · {inq.eventType} ·{" "}
                        {formatDate(inq.eventDate)}
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${stepColor} shrink-0`}>
                      {stepLabel}
                    </div>
                    {inq.quote && (
                      <div className="text-sm font-semibold text-primary shrink-0">
                        {formatINR(inq.quote.amount)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming + venues list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Upcoming bookings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOwnerView("bookings")}
              >
                View all <ArrowUpRight className="size-3.5" />
              </Button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto fancy-scroll">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No upcoming bookings
                </p>
              ) : (
                upcoming.slice(0, 6).map((b) => {
                  const venue = myVenues.find((v) => v.id === b.venueId);
                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer"
                      onClick={() => setOwnerView("bookings")}
                    >
                      <div className="size-10 grid place-items-center rounded-lg bg-accent text-accent-foreground text-xs font-semibold shrink-0">
                        {new Date(b.eventDate + "T00:00:00").getDate()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {b.customerName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {b.venueName} · {b.eventType} · {b.guestCount} guests
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-primary">
                          {formatINR(b.bookingAmount)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatDate(b.eventDate)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your venues</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOwnerView("venues")}
              >
                Manage <ArrowUpRight className="size-3.5" />
              </Button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto fancy-scroll">
              {myVenues.map((v) => {
                const venueBookings = myBookings.filter((b) => b.venueId === v.id);
                const venueRevenue = venueBookings
                  .filter((b) => b.status !== "cancelled")
                  .reduce((s, b) => s + b.bookingAmount, 0);
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer"
                    onClick={() => selectVenue(v.id)}
                  >
                    <img
                      src={v.coverImage}
                      alt={v.name}
                      className="size-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{v.name}</div>
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {v.rating.toFixed(1)} · {v.city}
                        {v.status === "pending" && (
                          <Badge variant="outline" className="text-amber-700 ml-1">
                            <Clock className="size-3 mr-0.5" /> Pending
                          </Badge>
                        )}
                        {v.status === "approved" && (
                          <Badge variant="outline" className="text-emerald-700 ml-1">
                            <CheckCircle2 className="size-3 mr-0.5" /> Live
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-primary">
                        {formatINR(venueRevenue)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {venueBookings.length} bookings
                      </div>
                    </div>
                  </div>
                );
              })}
              {myVenues.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No venues listed yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
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
