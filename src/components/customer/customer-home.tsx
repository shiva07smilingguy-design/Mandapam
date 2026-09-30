"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VenueCard } from "@/components/venue-card";
import {
  CalendarHeart,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck,
  Wallet,
  Star,
  PhoneCall,
  ChevronRight,
  Heart,
  PartyPopper,
  TreePalm,
  Building2,
  Palmtree,
  Crown,
  Plane,
  Globe2,
  Video,
  Languages,
  MessageCircle,
  Clock4,
} from "lucide-react";
import { useAppStore, formatINR } from "@/lib/store";
import {
  CITIES,
  COMING_SOON_CITIES,
  EVENT_TYPES,
  VENUE_TYPES,
} from "@/lib/seed-data";
import { motion } from "framer-motion";

const TYPE_ICONS: Record<string, typeof Building2> = {
  "Marriage Plot": PartyPopper,
  "Banquet Hall": Building2,
  "Party Plot": PartyPopper,
  Lawn: TreePalm,
  Resort: Palmtree,
  "Wedding Venue": Crown,
};

export function CustomerHome() {
  const {
    filters,
    setFilter,
    venues,
    setCustomerView,
    loginAs,
    currentUser,
  } = useAppStore();

  const featured = venues.filter((v) => v.status === "approved").slice(0, 6);
  const trending = venues
    .filter((v) => v.status === "approved")
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const handleSearch = () => {
    setCustomerView("browse");
  };

  return (
    <div className="space-y-12 pb-6">
      {/* Hero with search */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="bg-accent text-accent-foreground mb-4 border-0">
              <Sparkles className="size-3 mr-1" /> Vadodara&apos;s #1 wedding venue
              marketplace
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Find the perfect venue in{" "}
              <span className="gold-text">Vadodara</span> for your forever moment
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              From Akota banquet halls to Laxmi Vilas Palace venues — compare live
              availability, packages, prices and amenities, then book online in
              minutes.
            </p>
          </motion.div>

          {/* Search card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mt-8 max-w-5xl mx-auto shadow-2xl border-primary/15">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="search-city" className="text-xs font-medium">
                      <MapPin className="inline size-3 mr-1" /> City
                    </Label>
                    <Select
                      value={filters.city || "__all"}
                      onValueChange={(v) =>
                        setFilter("city", v === "__all" ? "" : v)
                      }
                    >
                      <SelectTrigger id="search-city" className="w-full">
                        <SelectValue placeholder="Any city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all">Any city</SelectItem>
                        {CITIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                        {COMING_SOON_CITIES.map((c) => (
                          <SelectItem key={c} value={`__soon_${c}`} disabled>
                            {c} · Coming soon
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="search-type" className="text-xs font-medium">
                      <Sparkles className="inline size-3 mr-1" /> Event Type
                    </Label>
                    <Select
                      value={filters.eventType || "__all"}
                      onValueChange={(v) =>
                        setFilter("eventType", v === "__all" ? "" : (v as never))
                      }
                    >
                      <SelectTrigger id="search-type" className="w-full">
                        <SelectValue placeholder="Any event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all">Any event</SelectItem>
                        {EVENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="search-date" className="text-xs font-medium">
                      <CalendarHeart className="inline size-3 mr-1" /> Event Date
                    </Label>
                    <Input
                      id="search-date"
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilter("date", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="search-guests" className="text-xs font-medium">
                      <Users className="inline size-3 mr-1" /> Guests
                    </Label>
                    <Input
                      id="search-guests"
                      type="number"
                      min={10}
                      step={10}
                      value={filters.guests}
                      onChange={(e) =>
                        setFilter("guests", Number(e.target.value) || 0)
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-4 h-11 wedding-gradient text-primary-foreground hover:opacity-95"
                  onClick={handleSearch}
                >
                  <Sparkles className="size-4 mr-1.5" /> Search wedding venues
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              {
                icon: ShieldCheck,
                title: "Verified venues",
                sub: "Every listing reviewed",
              },
              {
                icon: Wallet,
                title: "Secure payments",
                sub: "20% advance, refund policy",
              },
              {
                icon: Star,
                title: "Real reviews",
                sub: "4.5+ avg rating",
              },
              {
                icon: PhoneCall,
                title: "24×7 concierge",
                sub: "+91 90161 80583",
              },
            ].map((b) => {
              const isPhone = b.title === "24×7 concierge";
              const Wrapper = (props: { children: React.ReactNode }) =>
                isPhone ? (
                  <a href="tel:+919016180583" className="block">
                    <Card className="p-3 gap-0 hover:border-primary hover:shadow-md transition cursor-pointer">
                      {props.children}
                    </Card>
                  </a>
                ) : (
                  <Card className="p-3 gap-0">{props.children}</Card>
                );
              return (
                <Wrapper key={b.title}>
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground shrink-0">
                      <b.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {b.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {b.sub}
                      </div>
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse by venue type */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Browse by venue type
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find the right space for every kind of celebration
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {VENUE_TYPES.map((type) => {
            const Icon = TYPE_ICONS[type] ?? Building2;
            // Count venues of this type across all cities (so users can browse
            // even if Vadodara doesn't have any of this type yet — the helpful
            // empty state on the Browse page will guide them).
            const totalCount = venues.filter(
              (v) => v.type === type && v.status === "approved"
            ).length;
            const vadodaraCount = venues.filter(
              (v) =>
                v.type === type &&
                v.status === "approved" &&
                v.city === "Vadodara"
            ).length;
            const isAvailable = totalCount > 0;
            return (
              <button
                key={type}
                onClick={() => {
                  setFilter("venueType", type);
                  setCustomerView("browse");
                }}
                className="group rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all p-4 text-center cursor-pointer"
                title={`Browse ${type} venues`}
              >
                <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground group-hover:scale-105 transition-transform">
                  <Icon className="size-5" />
                </div>
                <div className="text-sm font-medium">{type}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {vadodaraCount > 0 ? (
                    <>
                      {vadodaraCount} venue{vadodaraCount !== 1 ? "s" : ""} in Vadodara
                    </>
                  ) : isAvailable ? (
                    <>
                      {totalCount} venue{totalCount !== 1 ? "s" : ""} ·{" "}
                      <span className="text-[10px] uppercase tracking-wide bg-secondary text-muted-foreground rounded px-1 py-0.5">
                        Other cities
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wide bg-secondary text-muted-foreground rounded px-1.5 py-0.5">
                      Soon
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured venues */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Featured venues
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Hand-picked, verified, and ready to book
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:flex"
            onClick={() => setCustomerView("browse")}
          >
            View all <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      </section>

      {/* Trending strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl wedding-gradient-soft border border-primary/10 p-6 sm:p-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <Badge className="bg-primary text-primary-foreground border-0 mb-2">
                <Star className="size-3 fill-current mr-1" /> Top rated
              </Badge>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                Trending this wedding season
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Venues couples are loving right now
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trending.map((v, idx) => (
              <Card
                key={v.id}
                className="overflow-hidden p-0 gap-0 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => useAppStore.getState().selectVenue(v.id)}
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={v.coverImage}
                    alt={v.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    #{idx + 1}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{v.name}</h3>
                    <div className="flex items-center gap-1 text-sm shrink-0">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {v.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="size-3" /> {v.area}, {v.city}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">From</span>
                    <span className="font-bold text-primary">
                      {formatINR(v.priceWeekday)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon cities banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="border-dashed border-2 bg-secondary/20">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                  <Plane className="size-5 text-primary" />
                  We&apos;re taking off in more cities soon
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Mandapam currently operates in{" "}
                  <strong className="text-foreground">Vadodara</strong> —
                  we&apos;re expanding to these cities next. Want us to launch in
                  yours?
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = "mailto:hello@mandapam.in?subject=Launch Mandapam in my city";
                }}
              >
                Request your city
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMING_SOON_CITIES.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="py-1.5 px-3 font-normal bg-background"
                >
                  <MapPin className="size-3 mr-1 text-muted-foreground" />
                  {c}
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide bg-secondary text-muted-foreground rounded px-1.5 py-0.5">
                    Soon
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* NRI dedicated section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
          {/* Left: NRI intro card */}
          <Card className="overflow-hidden p-0 border-0">
            <div className="wedding-gradient text-primary-foreground p-6 sm:p-8 h-full flex flex-col justify-between">
              <div>
                <Badge className="bg-white/15 text-white border-0 mb-3">
                  <Globe2 className="size-3 mr-1" /> For NRI couples & families
                </Badge>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                  Planning your Indian wedding from abroad?
                </h3>
                <p className="mt-3 text-white/85 text-sm leading-relaxed">
                  Our dedicated NRI concierge desk handles everything remotely —
                  venue shortlisting via video tours, virtual site visits,
                  international payments, and on-ground coordination in Vadodara.
                  You land only for the wedding; we handle the rest.
                </p>
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/90">
                  <Languages className="size-4 shrink-0" />
                  English, Hindi, Gujarati concierge
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Clock4 className="size-4 shrink-0" />
                  24×7 coordination across time zones
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Wallet className="size-4 shrink-0" />
                  USD, GBP, EUR, AED, SGD payments accepted
                </div>
              </div>
            </div>
          </Card>

          {/* Right: NRI services + contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5 gap-0">
              <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground mb-3">
                <Video className="size-5" />
              </div>
              <h4 className="font-semibold">Video venue tours</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Live WhatsApp video tours of any 3 shortlisted venues — no need
                to fly down just to see options.
              </p>
            </Card>
            <Card className="p-5 gap-0">
              <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground mb-3">
                <ShieldCheck className="size-5" />
              </div>
              <h4 className="font-semibold">Verified legal paperwork</h4>
              <p className="text-sm text-muted-foreground mt-1">
                We handle all permits, FIR letters, fire NOC, and venue contracts
                on your behalf — shared digitally with e-sign.
              </p>
            </Card>
            <Card className="p-5 gap-0">
              <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground mb-3">
                <Plane className="size-5" />
              </div>
              <h4 className="font-semibold">Airport pickup & guest stay</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Vadodara/Ahmedabad airport pickup, hotel block bookings, and
                guest transport bundled into your package.
              </p>
            </Card>
            <Card className="p-5 gap-0">
              <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground mb-3">
                <Sparkles className="size-5" />
              </div>
              <h4 className="font-semibold">End-to-end decor & catering</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Pre-approved decor themes and multi-cuisine caterers
                (veg/Jain/Jain-veg + international menus) — book sight-unseen
                with confidence.
              </p>
            </Card>

            {/* Dedicated NRI contact card */}
            <Card className="sm:col-span-2 wedding-gradient-soft border-primary/20">
              <CardContent className="p-5">
                <h4 className="font-semibold mb-1">Talk to our NRI concierge</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Available 9 AM – 11 PM IST · responds within 2 hours
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://wa.me/919016180583?text=Hi%20Mandapam%20NRI%20desk!%20I%27m%20based%20abroad%20and%20planning%20a%20wedding%20in%20Vadodara.%20Please%20share%20details."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition"
                  >
                    <MessageCircle className="size-5 text-[#25D366] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">WhatsApp NRI desk</div>
                      <div className="text-xs text-muted-foreground">
                        +91 90161 80583
                      </div>
                    </div>
                  </a>
                  <a
                    href="tel:+919016180583"
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 transition"
                  >
                    <PhoneCall className="size-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">Call (24×7)</div>
                      <div className="text-xs text-muted-foreground">
                        +91 90161 80583
                      </div>
                    </div>
                  </a>
                </div>
                <Button
                  asChild
                  className="w-full mt-3 wedding-gradient text-primary-foreground"
                >
                  <a href="mailto:nri@mandapam.in?subject=NRI wedding booking enquiry">
                    Email: nri@mandapam.in
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Become a host CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden p-0 border-0">
          <div className="wedding-gradient text-primary-foreground grid md:grid-cols-2 gap-6 items-center">
            <div className="p-8 sm:p-12">
              <Badge className="bg-white/15 text-white border-0 mb-3">
                For venue owners
              </Badge>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
                List your venue and reach 50,000+ couples every month
              </h3>
              <p className="mt-3 text-white/85 text-sm leading-relaxed">
                Manage your calendar, packages, pricing and payouts — all from a
                single dashboard. Earn up to 3× more with Mandapam&apos;s
                pan-India reach.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => {
                    loginAs("owner");
                  }}
                >
                  List your venue
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10"
                  onClick={() => {
                    loginAs("owner");
                  }}
                >
                  Explore owner dashboard
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-full min-h-[280px]">
              <img
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80"
                alt="Wedding decor"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </Card>
      </section>

      {!currentUser && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
          <div className="mandala-divider mb-4">
            <Heart className="size-4" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Demo platform · Switch between Customer, Venue Owner and Admin roles
            from the top-right menu to explore every feature.
          </p>
        </section>
      )}
    </div>
  );
}
