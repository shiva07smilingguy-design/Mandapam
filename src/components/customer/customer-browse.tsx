"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VenueCard } from "@/components/venue-card";
import {
  SlidersHorizontal,
  Search,
  X,
  MapPin,
  Frown,
  Calendar,
} from "lucide-react";
import { useAppStore, formatINR, isVenueAvailable } from "@/lib/store";
import {
  ALL_AMENITIES,
  CITIES,
  COMING_SOON_CITIES,
  VENUE_TYPES,
} from "@/lib/seed-data";
import { amenityIcon } from "@/lib/amenity-icons";

export function CustomerBrowse() {
  const { venues, filters, setFilter, resetFilters } = useAppStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = venues.filter((v) => v.status === "approved");

    if (filters.city) list = list.filter((v) => v.city === filters.city);
    if (filters.venueType)
      list = list.filter((v) => v.type === filters.venueType);
    if (filters.eventType) {
      // soft match: include venue if any review mentions same event type OR all venues
      // for demo, just keep all — filter is informational
    }
    if (filters.date) {
      list = list.filter((v) => isVenueAvailable(v, filters.date));
    }
    if (filters.guests > 0) {
      list = list.filter((v) => v.capacityMax >= filters.guests);
    }
    if (filters.budgetMax < 5000000) {
      list = list.filter((v) => v.priceWeekday <= filters.budgetMax);
    }
    if (filters.capacityMin > 0) {
      list = list.filter((v) => v.capacityMax >= filters.capacityMin);
    }
    if (filters.indoor) list = list.filter((v) => v.indoor);
    if (filters.outdoor) list = list.filter((v) => v.outdoor);
    if (filters.parking) list = list.filter((v) => v.parking);
    if (filters.catering) list = list.filter((v) => v.catering);
    if (filters.decoration) list = list.filter((v) => v.decoration);
    if (filters.ac) list = list.filter((v) => v.ac);
    if (filters.rooms) list = list.filter((v) => v.rooms > 0);
    if (filters.amenities.length > 0) {
      list = list.filter((v) =>
        filters.amenities.every((a) => v.amenities.includes(a))
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.area.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q)
      );
    }

    switch (filters.sortBy) {
      case "price-asc":
        list = [...list].sort((a, b) => a.priceWeekday - b.priceWeekday);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.priceWeekday - a.priceWeekday);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "capacity":
        list = [...list].sort((a, b) => b.capacityMax - a.capacityMax);
        break;
    }
    return list;
  }, [venues, filters, search]);

  const toggleAmenity = (a: string) => {
    if (filters.amenities.includes(a)) {
      setFilter(
        "amenities",
        filters.amenities.filter((x) => x !== a)
      );
    } else {
      setFilter("amenities", [...filters.amenities, a]);
    }
  };

  const activeFilterCount =
    (filters.city ? 1 : 0) +
    (filters.venueType ? 1 : 0) +
    (filters.indoor ? 1 : 0) +
    (filters.outdoor ? 1 : 0) +
    (filters.parking ? 1 : 0) +
    (filters.catering ? 1 : 0) +
    (filters.decoration ? 1 : 0) +
    (filters.ac ? 1 : 0) +
    (filters.rooms ? 1 : 0) +
    filters.amenities.length +
    (filters.budgetMax < 5000000 ? 1 : 0) +
    (filters.capacityMin > 0 ? 1 : 0);

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-2">City</h4>
        <Select
          value={filters.city || "__all"}
          onValueChange={(v) => setFilter("city", v === "__all" ? "" : v)}
        >
          <SelectTrigger className="w-full">
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

      <div>
        <h4 className="text-sm font-semibold mb-2">Venue Type</h4>
        <Select
          value={filters.venueType || "__all"}
          onValueChange={(v) => setFilter("venueType", v === "__all" ? "" : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">Any type</SelectItem>
            {VENUE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Max budget / day</h4>
        <div className="px-1">
          <Slider
            value={[filters.budgetMax]}
            min={25000}
            max={5000000}
            step={25000}
            onValueChange={(v) => setFilter("budgetMax", v[0])}
          />
          <div className="mt-1.5 text-xs text-muted-foreground flex justify-between">
            <span>{formatINR(25000)}</span>
            <span className="font-medium text-foreground">
              {filters.budgetMax >= 5000000
                ? "Any"
                : formatINR(filters.budgetMax)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Min capacity</h4>
        <div className="px-1">
          <Slider
            value={[filters.capacityMin]}
            min={0}
            max={1500}
            step={50}
            onValueChange={(v) => setFilter("capacityMin", v[0])}
          />
          <div className="mt-1.5 text-xs text-muted-foreground flex justify-between">
            <span>0</span>
            <span className="font-medium text-foreground">
              {filters.capacityMin}+ guests
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Setup</h4>
        <div className="space-y-2">
          {(
            [
              ["indoor", "Indoor"],
              ["outdoor", "Outdoor"],
              ["parking", "Parking"],
              ["catering", "Catering"],
              ["decoration", "Decoration"],
              ["ac", "AC"],
              ["rooms", "Rooms available"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={`f-${key}`}
                checked={filters[key] as boolean}
                onCheckedChange={(v) => setFilter(key, !!v)}
              />
              <Label htmlFor={`f-${key}`} className="text-sm font-normal cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Amenities</h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 fancy-scroll">
          {ALL_AMENITIES.map((a) => {
            const Icon = amenityIcon(a);
            const checked = filters.amenities.includes(a);
            return (
              <div key={a} className="flex items-center gap-2">
                <Checkbox
                  id={`am-${a}`}
                  checked={checked}
                  onCheckedChange={() => toggleAmenity(a)}
                />
                <Label
                  htmlFor={`am-${a}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  {a}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={resetFilters}>
          <X className="size-4 mr-1" /> Clear all filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by venue, area, city or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(v) => setFilter("sortBy", v as never)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Sort: Relevance</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Rating: High to Low</SelectItem>
            <SelectItem value="capacity">Capacity: High to Low</SelectItem>
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden relative">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 size-5 grid place-items-center p-0 bg-primary text-primary-foreground text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{FilterPanel}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {filters.city && (
            <Chip onClear={() => setFilter("city", "")}>
              <MapPin className="size-3 mr-1" /> {filters.city}
            </Chip>
          )}
          {filters.venueType && (
            <Chip onClear={() => setFilter("venueType", "")}>
              {filters.venueType}
            </Chip>
          )}
          {filters.indoor && (
            <Chip onClear={() => setFilter("indoor", false)}>Indoor</Chip>
          )}
          {filters.outdoor && (
            <Chip onClear={() => setFilter("outdoor", false)}>Outdoor</Chip>
          )}
          {filters.parking && (
            <Chip onClear={() => setFilter("parking", false)}>Parking</Chip>
          )}
          {filters.catering && (
            <Chip onClear={() => setFilter("catering", false)}>Catering</Chip>
          )}
          {filters.decoration && (
            <Chip onClear={() => setFilter("decoration", false)}>Decoration</Chip>
          )}
          {filters.ac && <Chip onClear={() => setFilter("ac", false)}>AC</Chip>}
          {filters.rooms && (
            <Chip onClear={() => setFilter("rooms", false)}>Rooms</Chip>
          )}
          {filters.amenities.map((a) => (
            <Chip key={a} onClear={() => toggleAmenity(a)}>
              {a}
            </Chip>
          ))}
          {filters.budgetMax < 5000000 && (
            <Chip onClear={() => setFilter("budgetMax", 5000000)}>
              ≤ {formatINR(filters.budgetMax)}
            </Chip>
          )}
          {filters.capacityMin > 0 && (
            <Chip onClear={() => setFilter("capacityMin", 0)}>
              {filters.capacityMin}+ guests
            </Chip>
          )}
          {filters.date && (
            <Chip onClear={() => setFilter("date", "")}>
              <Calendar className="size-3 mr-1" /> {filters.date}
            </Chip>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden lg:block">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">{activeFilterCount}</Badge>
                )}
              </div>
              {FilterPanel}
            </CardContent>
          </Card>
        </aside>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              venues found
              {filters.city ? ` in ${filters.city}` : ""}
              {filters.date ? ` available on ${filters.date}` : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Frown className="size-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-semibold">
                {filters.venueType && filters.city
                  ? `No ${filters.venueType} venues in ${filters.city} yet`
                  : filters.venueType
                  ? `No ${filters.venueType} venues match your filters`
                  : "No venues match your filters"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {filters.venueType && filters.city
                  ? `We don't have ${filters.venueType} venues in ${filters.city} yet, but they may be available in other cities that are coming soon. Try clearing the city filter or pick another venue type.`
                  : "Try widening your budget, date, or amenity selection."}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {filters.venueType && filters.city && (
                  <Button
                    variant="outline"
                    onClick={() => setFilter("city", "")}
                  >
                    Clear city filter
                  </Button>
                )}
                {filters.venueType && (
                  <Button
                    variant="outline"
                    onClick={() => setFilter("venueType", "")}
                  >
                    Show all venue types
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={resetFilters}
                >
                  Reset all filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <Badge variant="outline" className="pl-2.5 pr-1 py-1 gap-1 bg-background">
      {children}
      <button
        onClick={onClear}
        className="ml-1 grid size-4 place-items-center rounded-full hover:bg-accent text-muted-foreground"
        aria-label="Remove filter"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
