"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Snowflake,
  Calendar,
  Car,
  Check,
  GitCompareArrows,
  Heart,
  MapPin,
  Sparkles,
  Star,
  Users,
  Utensils,
} from "lucide-react";
import type { Venue } from "@/lib/types";
import { formatINR, useAppStore } from "@/lib/store";

interface VenueCardProps {
  venue: Venue;
  onSelect?: (id: string) => void;
}

export function VenueCard({ venue, onSelect }: VenueCardProps) {
  const selectVenue = useAppStore((s) => s.selectVenue);
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);

  const inCompare = compareIds.includes(venue.id);
  const handleOpen = () => (onSelect ? onSelect(venue.id) : selectVenue(venue.id));

  return (
    <Card className="group overflow-hidden p-0 gap-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      <div
        className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-muted"
        onClick={handleOpen}
      >
        <img
          src={venue.coverImage}
          alt={`${venue.name} — cover image`}
          loading="lazy"
          className="w-full h-full object-cover zoom-img"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge className="bg-primary/95 text-primary-foreground border-0 shadow">
            {venue.type}
          </Badge>
          {venue.verified && (
            <Badge className="bg-emerald-600/95 text-white border-0 shadow">
              <Check className="size-3 mr-0.5" /> Verified
            </Badge>
          )}
        </div>
        <button
          aria-label="Save venue"
          className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-white/85 backdrop-blur text-primary hover:bg-white shadow"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Heart className="size-4" />
        </button>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-semibold leading-tight drop-shadow-sm">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-white/90 mt-0.5">
            <MapPin className="size-3" />
            {venue.area}, {venue.city}
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{venue.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({venue.reviewsCount} reviews)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-4" />
            {venue.capacityMin}–{venue.capacityMax}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {venue.parking && (
            <Badge variant="outline" className="text-[11px] font-normal">
              <Car className="size-3 mr-1" /> Parking
            </Badge>
          )}
          {venue.catering && (
            <Badge variant="outline" className="text-[11px] font-normal">
              <Utensils className="size-3 mr-1" /> Catering
            </Badge>
          )}
          {venue.decoration && (
            <Badge variant="outline" className="text-[11px] font-normal">
              <Sparkles className="size-3 mr-1" /> Decor
            </Badge>
          )}
          {venue.ac && (
            <Badge variant="outline" className="text-[11px] font-normal">
              <Snowflake className="size-3 mr-1" /> AC
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex items-end justify-between gap-2">
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
            From / day
          </div>
          <div className="text-lg font-bold text-primary">
            {formatINR(venue.priceWeekday)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={inCompare ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleCompare(venue.id)}
            disabled={!inCompare && compareIds.length >= 3}
          >
            <GitCompareArrows className="size-4" />
            {inCompare ? "Added" : "Compare"}
          </Button>
          <Button size="sm" onClick={handleOpen}>
            <Calendar className="size-4" /> View
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
