"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarHeart,
  Check,
  MapPin,
  Star,
  Users,
  Car,
  Utensils,
  Sparkles,
  Snowflake,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  GitCompareArrows,
  ChevronLeft,
  Calendar,
  Clock,
  DoorOpen,
  Music,
  Crown,
  PartyPopper,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  formatDate,
  isVenueAvailable,
  priceForDate,
  computeBookingAdvance,
} from "@/lib/store";
import { amenityIcon } from "@/lib/amenity-icons";
import { EVENT_TYPES } from "@/lib/seed-data";
import { BookingFlowDialog } from "@/components/booking/booking-flow";

function next30Days(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < 45; i++) {
    const t = new Date(d);
    t.setDate(d.getDate() + i);
    out.push(t.toISOString().split("T")[0]);
  }
  return out;
}

export function CustomerVenueDetail() {
  const {
    venues,
    selectedVenueId,
    selectVenue,
    setCustomerView,
    startBooking,
    compareIds,
    toggleCompare,
    filters,
    setFilter,
  } = useAppStore();

  const venue = venues.find((v) => v.id === selectedVenueId);
  const [activePhoto, setActivePhoto] = useState(0);
  const [checkDate, setCheckDate] = useState<string>(filters.date || "");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [bookingOpen, setBookingOpen] = useState(false);

  const dates = useMemo(() => next30Days(), []);

  if (!venue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-semibold">Venue not found</h2>
        <Button
          className="mt-4"
          onClick={() => setCustomerView("browse")}
        >
          Back to browse
        </Button>
      </div>
    );
  }

  const inCompare = compareIds.includes(venue.id);
  const photos = venue.photos.length > 0 ? venue.photos : [venue.coverImage];
  const pkg = venue.packages.find((p) => p.id === selectedPackageId);
  const basePrice =
    pkg?.price ?? (checkDate ? priceForDate(venue, checkDate) : venue.priceWeekday);
  const advance = computeBookingAdvance(basePrice);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => selectVenue(null)}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ChevronLeft className="size-4" /> Back to venues
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className="bg-primary text-primary-foreground border-0">
              {venue.type}
            </Badge>
            {venue.verified && (
              <Badge className="bg-emerald-600 text-white border-0">
                <ShieldCheck className="size-3 mr-0.5" /> Verified
              </Badge>
            )}
            <Badge variant="outline" className="font-normal">
              <Star className="size-3 fill-amber-400 text-amber-400 mr-0.5" />
              {venue.rating.toFixed(1)} · {venue.reviewsCount} reviews
            </Badge>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            {venue.name}
          </h1>
          <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="size-4" /> {venue.address}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={inCompare ? "secondary" : "outline"}
            onClick={() => {
              toggleCompare(venue.id);
              if (!inCompare) setCustomerView("compare");
            }}
            disabled={!inCompare && compareIds.length >= 3}
          >
            <GitCompareArrows className="size-4" />
            {inCompare ? "In compare" : "Add to compare"}
          </Button>
        </div>
      </div>

      {/* Photo gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 mb-6">
        <Card className="overflow-hidden p-0">
          <div className="aspect-[16/10] bg-muted relative">
            <img
              src={photos[activePhoto]}
              alt={`${venue.name} photo ${activePhoto + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-black/55 text-white text-xs px-2 py-1 rounded">
              {activePhoto + 1} / {photos.length}
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {photos.slice(0, 4).map((p, i) => (
            <button
              key={i}
              onClick={() => setActivePhoto(i)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition ${
                activePhoto === i
                  ? "border-primary shadow"
                  : "border-transparent hover:border-primary/30"
              }`}
            >
              <img
                src={p}
                alt={`${venue.name} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: info tabs */}
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={Users}
              label="Capacity"
              value={`${venue.capacityMin}–${venue.capacityMax}`}
            />
            <StatCard
              icon={Crown}
              label="From / day"
              value={formatINR(venue.priceWeekday)}
            />
            <StatCard
              icon={DoorOpen}
              label="Rooms"
              value={venue.rooms > 0 ? `${venue.rooms}` : "—"}
            />
            <StatCard
              icon={Calendar}
              label="Min booking"
              value="1 day"
            />
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">About this venue</h3>
                  <p className="text-sm text-foreground/85 leading-relaxed">
                    {venue.description}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-3">Quick facts</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <FactRow label="Type" value={venue.type} />
                    <FactRow label="City" value={venue.city} />
                    <FactRow label="Area" value={venue.area} />
                    <FactRow
                      label="Indoor / Outdoor"
                      value={
                        venue.indoor && venue.outdoor
                          ? "Both"
                          : venue.indoor
                          ? "Indoor"
                          : "Outdoor"
                      }
                    />
                    <FactRow
                      label="AC"
                      value={venue.ac ? "Available" : "Not available"}
                    />
                    <FactRow
                      label="Bar"
                      value={venue.bar ? "Permitted" : "Not permitted"}
                    />
                    <FactRow
                      label="DJ"
                      value={venue.dj ? "Allowed" : "Not allowed"}
                    />
                    <FactRow
                      label="Parking"
                      value={venue.parking ? "Available" : "Limited"}
                    />
                    <FactRow
                      label="Catering"
                      value={venue.catering ? "In-house" : "External only"}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="packages" className="mt-4">
              <div className="space-y-3">
                {venue.packages.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-muted-foreground">
                      This venue has not published any packages yet. Contact the
                      owner for custom pricing.
                    </CardContent>
                  </Card>
                )}
                {venue.packages.map((p) => (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all ${
                      selectedPackageId === p.id
                        ? "border-primary shadow-md ring-2 ring-primary/20"
                        : "hover:border-primary/40"
                    }`}
                    onClick={() => setSelectedPackageId(p.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{p.name}</h4>
                            {selectedPackageId === p.id && (
                              <Badge className="bg-primary text-primary-foreground">
                                <Check className="size-3 mr-0.5" /> Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {p.description}
                          </p>
                          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {p.includes.map((inc) => (
                              <li
                                key={inc}
                                className="text-sm flex items-center gap-1.5"
                              >
                                <Check className="size-3.5 text-emerald-600" />
                                {inc}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                            Package
                          </div>
                          <div className="text-xl font-bold text-primary">
                            {formatINR(p.price)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="amenities" className="mt-4">
              <Card>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {venue.amenities.map((a) => {
                      const Icon = amenityIcon(a);
                      return (
                        <div
                          key={a}
                          className="flex items-center gap-2 text-sm border rounded-lg p-2.5 bg-secondary/30"
                        >
                          <Icon className="size-4 text-primary shrink-0" />
                          {a}
                        </div>
                      );
                    })}
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Toggle icon={Car} label="Parking" on={venue.parking} />
                    <Toggle icon={Utensils} label="Catering" on={venue.catering} />
                    <Toggle icon={Sparkles} label="Decoration" on={venue.decoration} />
                    <Toggle icon={Snowflake} label="AC" on={venue.ac} />
                    <Toggle icon={Building2} label="Indoor" on={venue.indoor} />
                    <Toggle icon={PartyPopper} label="Outdoor" on={venue.outdoor} />
                    <Toggle icon={Music} label="DJ" on={venue.dj} />
                    <Toggle icon={DoorOpen} label="Rooms" on={venue.rooms > 0} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4 space-y-3">
              {venue.reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    No reviews yet. Be the first to review after your event!
                  </CardContent>
                </Card>
              ) : (
                venue.reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm">
                            {r.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.eventType} · {formatDate(r.date)}
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
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: booking widget */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="shadow-lg">
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {pkg ? "Selected package" : "Starting price"}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatINR(basePrice)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {pkg
                    ? "All-inclusive package"
                    : "Venue rental only · weekday"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Check availability</Label>
                <Input
                  type="date"
                  value={checkDate}
                  onChange={(e) => {
                    setCheckDate(e.target.value);
                    setFilter("date", e.target.value);
                  }}
                />
                {checkDate && (
                  <div
                    className={`text-xs flex items-center gap-1.5 ${
                      isVenueAvailable(venue, checkDate)
                        ? "text-emerald-700"
                        : "text-destructive"
                    }`}
                  >
                    <Clock className="size-3.5" />
                    {isVenueAvailable(venue, checkDate)
                      ? "Available on this date"
                      : "Already booked — pick another date"}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">Quick date picker</Label>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {dates.slice(0, 21).map((d) => {
                    const taken = !isVenueAvailable(venue, d);
                    const selected = checkDate === d;
                    const day = new Date(d + "T00:00:00");
                    const weekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <button
                        key={d}
                        disabled={taken}
                        onClick={() => {
                          setCheckDate(d);
                          setFilter("date", d);
                        }}
                        className={`text-[11px] py-1 rounded transition ${
                          selected
                            ? "bg-primary text-primary-foreground"
                            : taken
                            ? "bg-muted text-muted-foreground line-through cursor-not-allowed"
                            : weekend
                            ? "bg-accent/50 hover:bg-accent"
                            : "bg-secondary/60 hover:bg-secondary"
                        }`}
                        title={d}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-muted" /> Booked
                  <span className="inline-block size-2 rounded-full bg-accent" /> Weekend
                </div>
              </div>

              {pkg && (
                <div className="rounded-lg bg-secondary/50 p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-medium">{pkg.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{formatINR(pkg.price)}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between text-primary">
                    <span className="font-medium">Booking advance (20%)</span>
                    <span className="font-bold">{formatINR(advance)}</span>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full wedding-gradient text-primary-foreground hover:opacity-95"
                disabled={!checkDate || !isVenueAvailable(venue, checkDate)}
                onClick={() => {
                  if (!checkDate) return;
                  startBooking(venue.id, pkg?.id);
                  setBookingOpen(true);
                }}
              >
                <CalendarHeart className="size-4 mr-1.5" />
                {checkDate && isVenueAvailable(venue, checkDate)
                  ? "Book now"
                  : "Select a date to book"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                You won&apos;t be charged yet · 20% advance on confirmation · Free
                cancellation up to 15 days before event
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="font-semibold text-sm">Need help? Talk to Mandapam</div>
              <div className="text-xs text-muted-foreground">
                Our concierge connects you with {venue.ownerName} or any venue owner.
              </div>
              <a
                href="tel:+919016180583"
                className="flex items-center gap-2 text-sm hover:text-primary transition"
              >
                <Phone className="size-4 text-muted-foreground" /> +91 90161 80583
              </a>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground" /> hello@mandapam.in
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full"
                size="sm"
              >
                <a href="tel:+919016180583">
                  <Phone className="size-4 mr-1.5" /> Call to book
                </a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <BookingFlowDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        preselectedPackageId={selectedPackageId || undefined}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-3 gap-0">
      <div className="flex items-center gap-2">
        <div className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground shrink-0">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className="text-sm font-semibold truncate">{value}</div>
        </div>
      </div>
    </Card>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  on,
}: {
  icon: typeof Car;
  label: string;
  on: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm rounded-lg p-2 border ${
        on
          ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
          : "border-muted bg-muted/40 text-muted-foreground line-through"
      }`}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </div>
  );
}
