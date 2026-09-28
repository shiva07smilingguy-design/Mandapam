"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  Users,
  Star,
} from "lucide-react";
import { useAppStore, formatINR, genVenueId } from "@/lib/store";
import { CITIES, COMING_SOON_CITIES, VENUE_TYPES, ALL_AMENITIES } from "@/lib/seed-data";
import { amenityIcon } from "@/lib/amenity-icons";
import type { Venue } from "@/lib/types";
import { toast } from "sonner";

interface FormState {
  name: string;
  type: string;
  city: string;
  area: string;
  address: string;
  description: string;
  capacityMin: number;
  capacityMax: number;
  priceWeekday: number;
  priceWeekend: number;
  coverImage: string;
  photos: string;
  amenities: string[];
  indoor: boolean;
  outdoor: boolean;
  parking: boolean;
  catering: boolean;
  decoration: boolean;
  ac: boolean;
  bar: boolean;
  dj: boolean;
  rooms: number;
}

const EMPTY: FormState = {
  name: "",
  type: "Banquet Hall",
  city: "Ahmedabad",
  area: "",
  address: "",
  description: "",
  capacityMin: 100,
  capacityMax: 500,
  priceWeekday: 75000,
  priceWeekend: 125000,
  coverImage:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
  photos: "",
  amenities: [],
  indoor: true,
  outdoor: false,
  parking: true,
  catering: true,
  decoration: true,
  ac: true,
  bar: false,
  dj: true,
  rooms: 1,
};

export function OwnerVenues() {
  const { venues, currentUser, addVenue, updateVenue, deleteVenue, selectVenue } =
    useAppStore();
  const myVenues = venues.filter(
    (v) => v.ownerId === (currentUser?.id ?? "u-owner-1")
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openAdd = () => {
    setForm(EMPTY);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (v: Venue) => {
    setForm({
      name: v.name,
      type: v.type,
      city: v.city,
      area: v.area,
      address: v.address,
      description: v.description,
      capacityMin: v.capacityMin,
      capacityMax: v.capacityMax,
      priceWeekday: v.priceWeekday,
      priceWeekend: v.priceWeekend,
      coverImage: v.coverImage,
      photos: v.photos.join("\n"),
      amenities: v.amenities,
      indoor: v.indoor,
      outdoor: v.outdoor,
      parking: v.parking,
      catering: v.catering,
      decoration: v.decoration,
      ac: v.ac,
      bar: v.bar,
      dj: v.dj,
      rooms: v.rooms,
    });
    setEditingId(v.id);
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name || !form.city || !form.area) {
      toast.error("Please fill venue name, city, and area");
      return;
    }
    const photos = form.photos
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (photos.length === 0) photos.push(form.coverImage);

    if (editingId) {
      updateVenue(editingId, {
        name: form.name,
        type: form.type as Venue["type"],
        city: form.city,
        area: form.area,
        address: form.address || `${form.area}, ${form.city}`,
        description:
          form.description ||
          `${form.type} available for weddings and events in ${form.area}, ${form.city}.`,
        capacityMin: form.capacityMin,
        capacityMax: form.capacityMax,
        priceWeekday: form.priceWeekday,
        priceWeekend: form.priceWeekend,
        coverImage: form.coverImage,
        photos,
        amenities: form.amenities,
        indoor: form.indoor,
        outdoor: form.outdoor,
        parking: form.parking,
        catering: form.catering,
        decoration: form.decoration,
        ac: form.ac,
        bar: form.bar,
        dj: form.dj,
        rooms: form.rooms,
      });
      toast.success("Venue updated");
    } else {
      const id = genVenueId();
      const newVenue: Venue = {
        id,
        name: form.name,
        ownerId: currentUser?.id ?? "u-owner-1",
        ownerName: currentUser?.name ?? "Owner",
        type: form.type as Venue["type"],
        city: form.city,
        area: form.area,
        address: form.address || `${form.area}, ${form.city}`,
        description:
          form.description ||
          `${form.type} available for weddings and events in ${form.area}, ${form.city}.`,
        capacityMin: form.capacityMin,
        capacityMax: form.capacityMax,
        priceWeekday: form.priceWeekday,
        priceWeekend: form.priceWeekend,
        coverImage: form.coverImage,
        photos,
        amenities: form.amenities,
        indoor: form.indoor,
        outdoor: form.outdoor,
        parking: form.parking,
        catering: form.catering,
        decoration: form.decoration,
        ac: form.ac,
        bar: form.bar,
        dj: form.dj,
        rooms: form.rooms,
        packages: [],
        rating: 0,
        reviewsCount: 0,
        reviews: [],
        blockedDates: [],
        status: "pending",
        verified: false,
        createdAt: new Date().toISOString(),
      };
      addVenue(newVenue);
      toast.success("Venue submitted for approval", {
        description: "Our team will review and approve within 24 hours.",
      });
    }
    setDialogOpen(false);
  };

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold">My Venues</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage listings, pricing, photos and amenities
          </p>
        </div>
        <Button className="wedding-gradient text-primary-foreground" onClick={openAdd}>
          <Plus className="size-4" /> Add venue
        </Button>
      </div>

      {myVenues.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="size-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No venues listed yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first venue to start receiving bookings.
          </p>
          <Button className="mt-4" onClick={openAdd}>
            <Plus className="size-4" /> Add your first venue
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myVenues.map((v) => (
            <Card key={v.id} className="overflow-hidden p-0">
              <div className="grid grid-cols-[140px_1fr] gap-0">
                <div className="aspect-square sm:aspect-auto bg-muted">
                  <img
                    src={v.coverImage}
                    alt={v.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        className="font-semibold cursor-pointer hover:text-primary"
                        onClick={() => selectVenue(v.id)}
                      >
                        {v.name}
                      </h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3" /> {v.area}, {v.city}
                      </div>
                    </div>
                    {v.status === "approved" ? (
                      <Badge className="bg-emerald-600 text-white border-0">
                        <CheckCircle2 className="size-3 mr-0.5" /> Live
                      </Badge>
                    ) : v.status === "pending" ? (
                      <Badge className="bg-amber-500 text-white border-0">
                        <Clock className="size-3 mr-0.5" /> Pending
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600 text-white border-0">
                        <X className="size-3 mr-0.5" /> Rejected
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3" /> {v.capacityMin}–{v.capacityMax}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {v.rating.toFixed(1)}
                    </span>
                    <span className="font-medium text-primary">
                      {formatINR(v.priceWeekday)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {v.amenities.slice(0, 3).map((a) => (
                      <Badge
                        key={a}
                        variant="outline"
                        className="text-[10px] font-normal"
                      >
                        {a}
                      </Badge>
                    ))}
                    {v.amenities.length > 3 && (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        +{v.amenities.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(v)}
                    >
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectVenue(v.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/5 ml-auto"
                      onClick={() => setConfirmDelete(v.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto fancy-scroll">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit venue" : "Add new venue"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update venue details. Changes go live immediately."
                : "Submit your venue for admin approval. Usually reviewed within 24 hours."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Venue name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Shree Party Plot"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Venue type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Select
                  value={form.city}
                  onValueChange={(v) => setForm({ ...form, city: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label>Area *</Label>
                <Input
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="e.g. Bodakdev"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Full address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, landmark, pincode"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe your venue — what makes it special, what events you host, highlights…"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Min capacity</Label>
                <Input
                  type="number"
                  value={form.capacityMin}
                  onChange={(e) =>
                    setForm({ ...form, capacityMin: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max capacity</Label>
                <Input
                  type="number"
                  value={form.capacityMax}
                  onChange={(e) =>
                    setForm({ ...form, capacityMax: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Weekday price</Label>
                <Input
                  type="number"
                  value={form.priceWeekday}
                  onChange={(e) =>
                    setForm({ ...form, priceWeekday: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Weekend price</Label>
                <Input
                  type="number"
                  value={form.priceWeekend}
                  onChange={(e) =>
                    setForm({ ...form, priceWeekend: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Cover image URL</Label>
              <Input
                value={form.coverImage}
                onChange={(e) =>
                  setForm({ ...form, coverImage: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Additional photo URLs (one per line)</Label>
              <Textarea
                value={form.photos}
                onChange={(e) => setForm({ ...form, photos: e.target.value })}
                placeholder="https://..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Number of rooms</Label>
              <Input
                type="number"
                min={0}
                value={form.rooms}
                onChange={(e) =>
                  setForm({ ...form, rooms: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <Label className="mb-2 block">Setup & features</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    ["indoor", "Indoor"],
                    ["outdoor", "Outdoor"],
                    ["parking", "Parking"],
                    ["catering", "Catering"],
                    ["decoration", "Decoration"],
                    ["ac", "AC"],
                    ["bar", "Bar"],
                    ["dj", "DJ"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={`o-${key}`}
                      checked={form[key] as boolean}
                      onCheckedChange={(v) =>
                        setForm({ ...form, [key]: !!v })
                      }
                    />
                    <Label
                      htmlFor={`o-${key}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Amenities</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1 fancy-scroll">
                {ALL_AMENITIES.map((a) => {
                  const Icon = amenityIcon(a);
                  const checked = form.amenities.includes(a);
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="wedding-gradient text-primary-foreground"
              onClick={save}
            >
              {editingId ? "Save changes" : "Submit for approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete venue?</DialogTitle>
            <DialogDescription>
              This will permanently remove the venue and all its packages. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) deleteVenue(confirmDelete);
                setConfirmDelete(null);
                toast.success("Venue deleted");
              }}
            >
              Delete venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
