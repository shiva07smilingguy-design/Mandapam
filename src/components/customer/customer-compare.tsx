"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Star,
  Users,
  MapPin,
  Check,
  GitCompareArrows,
  Crown,
} from "lucide-react";
import { useAppStore, formatINR } from "@/lib/store";
import { BackButton } from "@/components/back-button";
import { amenityIcon } from "@/lib/amenity-icons";

export function CustomerCompare() {
  const { venues, compareIds, toggleCompare, clearCompare, selectVenue } =
    useAppStore();

  const toCompare = venues.filter((v) => compareIds.includes(v.id));

  if (toCompare.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Card className="p-10">
          <GitCompareArrows className="size-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-serif text-2xl font-bold">Compare venues</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Add up to 3 venues to compare side-by-side. Use the
            &quot;Compare&quot; button on any venue card to add it here.
          </p>
          <Button
            className="mt-4 wedding-gradient text-primary-foreground"
            onClick={() => useAppStore.getState().setCustomerView("browse")}
          >
            Browse venues to compare
          </Button>
        </Card>
      </div>
    );
  }

  const rows: { label: string; render: (v: typeof toCompare[number]) => React.ReactNode }[] = [
    {
      label: "Price (weekday)",
      render: (v) => (
        <span className="font-bold text-primary">{formatINR(v.priceWeekday)}</span>
      ),
    },
    {
      label: "Price (weekend)",
      render: (v) => <span className="font-medium">{formatINR(v.priceWeekend)}</span>,
    },
    {
      label: "Capacity",
      render: (v) => (
        <span className="flex items-center gap-1">
          <Users className="size-3.5" /> {v.capacityMin}–{v.capacityMax}
        </span>
      ),
    },
    {
      label: "Rating",
      render: (v) => (
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {v.rating.toFixed(1)} ({v.reviewsCount})
        </span>
      ),
    },
    {
      label: "Area",
      render: (v) => (
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" /> {v.area}, {v.city}
        </span>
      ),
    },
    {
      label: "Type",
      render: (v) => <Badge variant="outline">{v.type}</Badge>,
    },
    {
      label: "Indoor / Outdoor",
      render: (v) => (
        <span>
          {v.indoor && v.outdoor
            ? "Both"
            : v.indoor
            ? "Indoor"
            : v.outdoor
            ? "Outdoor"
            : "—"}
        </span>
      ),
    },
    {
      label: "Parking",
      render: (v) => <YesNo on={v.parking} />,
    },
    {
      label: "Catering",
      render: (v) => <YesNo on={v.catering} />,
    },
    {
      label: "Decoration",
      render: (v) => <YesNo on={v.decoration} />,
    },
    {
      label: "AC",
      render: (v) => <YesNo on={v.ac} />,
    },
    {
      label: "Rooms",
      render: (v) => <span>{v.rooms > 0 ? v.rooms : "—"}</span>,
    },
    {
      label: "DJ",
      render: (v) => <YesNo on={v.dj} />,
    },
    {
      label: "Amenities",
      render: (v) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {v.amenities.slice(0, 6).map((a) => {
            const Icon = amenityIcon(a);
            return (
              <Badge key={a} variant="outline" className="text-[10px] font-normal">
                <Icon className="size-3 mr-0.5" />
                {a}
              </Badge>
            );
          })}
        </div>
      ),
    },
    {
      label: "Packages",
      render: (v) => (
        <span className="text-sm">
          {v.packages.length} package{v.packages.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      label: "Verified",
      render: (v) =>
        v.verified ? (
          <Badge className="bg-emerald-600 text-white border-0">
            <Check className="size-3 mr-0.5" /> Verified
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">Pending</span>
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <BackButton to="browse" label="Back to venues" />
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Compare venues</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Side-by-side comparison of {toCompare.length} venue
            {toCompare.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" onClick={clearCompare}>
          <X className="size-4" /> Clear all
        </Button>
      </div>

      <div className="overflow-x-auto fancy-scroll">
        <table className="w-full border-separate border-spacing-0 min-w-[640px]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-background z-10 w-40 p-3 text-left text-xs font-medium text-muted-foreground uppercase">
                <div className="flex items-center gap-1">
                  <GitCompareArrows className="size-4" /> Compare
                </div>
              </th>
              {toCompare.map((v) => (
                <th key={v.id} className="p-3 align-top w-56 min-w-[14rem]">
                  <Card className="overflow-hidden p-0 gap-0">
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={v.coverImage}
                        alt={v.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => toggleCompare(v.id)}
                        className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 hover:bg-white"
                        aria-label="Remove from compare"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <CardContent className="p-3">
                      <div className="font-semibold text-sm line-clamp-2">
                        {v.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {v.area}, {v.city}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 wedding-gradient text-primary-foreground"
                        onClick={() => selectVenue(v.id)}
                      >
                        <Crown className="size-3.5" /> View & book
                      </Button>
                    </CardContent>
                  </Card>
                </th>
              ))}
              {Array.from({ length: 3 - toCompare.length }).map((_, i) => (
                <th key={`ph-${i}`} className="p-3 align-top w-56">
                  <Card className="border-dashed p-6 text-center">
                    <div className="text-xs text-muted-foreground">
                      Add another venue
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => useAppStore.getState().setCustomerView("browse")}
                    >
                      Browse
                    </Button>
                  </Card>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-secondary/30" : ""}>
                <td
                  className={`sticky left-0 z-[5] p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                    idx % 2 === 0 ? "bg-secondary/30" : "bg-background"
                  }`}
                >
                  {row.label}
                </td>
                {toCompare.map((v) => (
                  <td key={v.id} className="p-3 text-sm text-center">
                    {row.render(v)}
                  </td>
                ))}
                {Array.from({ length: 3 - toCompare.length }).map((_, i) => (
                  <td key={`ph-${idx}-${i}`} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function YesNo({ on }: { on: boolean }) {
  return on ? (
    <Check className="size-4 text-emerald-600 mx-auto" />
  ) : (
    <X className="size-4 text-muted-foreground mx-auto" />
  );
}
