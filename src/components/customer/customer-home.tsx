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
} from "lucide-react";
import { useAppStore, formatINR } from "@/lib/store";
import { CITIES, EVENT_TYPES, VENUE_TYPES } from "@/lib/seed-data";
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
              <Sparkles className="size-3 mr-1" /> 2,400+ verified venues across
              India
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Find the perfect venue for your{" "}
              <span className="gold-text">forever</span> moment
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              From marriage plots to palace resorts — compare live availability,
              packages, prices and amenities, then book online in minutes.
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
                sub: "Always one call away",
              },
            ].map((b) => (
              <Card key={b.title} className="p-3 gap-0">
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
              </Card>
            ))}
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
            return (
              <button
                key={type}
                onClick={() => {
                  setFilter("venueType", type);
                  setCustomerView("browse");
                }}
                className="group rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all p-4 text-center"
              >
                <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-accent text-accent-foreground group-hover:scale-105 transition-transform">
                  <Icon className="size-5" />
                </div>
                <div className="text-sm font-medium">{type}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {venues.filter((v) => v.type === type && v.status === "approved").length}{" "}
                  venues
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
