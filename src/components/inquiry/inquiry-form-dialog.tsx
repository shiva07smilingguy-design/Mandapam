"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarHeart,
  CheckCircle2,
  Clock,
  PartyPopper,
  Send,
  X,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  isVenueAvailable,
  priceForDate,
} from "@/lib/store";
import { EVENT_TYPES } from "@/lib/seed-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventType } from "@/lib/types";

interface InquiryFormDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function InquiryFormDialog({ open, onOpenChange }: InquiryFormDialogProps) {
  const {
    venues,
    selectedVenueId,
    submitInquiry,
    setCustomerView,
    filters,
    setFilter,
    currentUser,
  } = useAppStore();

  const venue = venues.find((v) => v.id === selectedVenueId);
  const [submitted, setSubmitted] = useState<{
    id: string;
    venueName: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    phone: currentUser?.phone ?? "",
    email: currentUser?.email ?? "",
    eventType: (filters.eventType || "Wedding") as EventType,
    eventDate: filters.date || "",
    guestCount: filters.guests || 200,
    message: "",
  });

  if (!venue) return null;

  const dateOk = form.eventDate ? isVenueAvailable(venue, form.eventDate) : false;
  const formValid =
    form.name.trim() &&
    /\d{10}/.test(form.phone.replace(/\D/g, "")) &&
    /.+@.+\..+/.test(form.email) &&
    form.eventDate &&
    form.guestCount >= venue.capacityMin &&
    form.guestCount <= venue.capacityMax;

  const handleSubmit = () => {
    if (!formValid) return;
    const inquiry = submitInquiry({
      venueId: venue.id,
      eventDate: form.eventDate,
      eventType: form.eventType,
      guestCount: form.guestCount,
      customerMessage: form.message,
      customerName: form.name,
      customerPhone: form.phone,
      customerEmail: form.email,
    });
    setSubmitted({ id: inquiry.id, venueName: venue.name });
  };

  const handleClose = () => {
    onOpenChange(false);
    if (submitted) {
      setSubmitted(null);
      setCustomerView("my-inquiries");
    }
  };

  const basePrice = form.eventDate
    ? priceForDate(venue, form.eventDate)
    : venue.priceWeekday;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}
    >
      <DialogContent className="max-w-lg sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[92vh] overflow-y-auto fancy-scroll">
        {!submitted ? (
          <>
            <DialogHeader className="px-5 pt-5 pb-3 border-b bg-secondary/30">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <CalendarHeart className="size-5 text-primary" />
                Check availability
              </DialogTitle>
              <DialogDescription>
                {venue.name} · {venue.area}, {venue.city}
              </DialogDescription>
            </DialogHeader>

            <div className="p-5 space-y-4">
              <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 text-xs text-foreground/80">
                <strong className="text-primary">How it works:</strong> Submit
                this short inquiry → Mandapam notifies the venue owner → owner
                responds with a quote within 4 hours → you accept/decline in
                your dashboard → owner locks date → you pay 20% advance.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Bride / Groom / Family"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98XXX XXXXX"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Event type</Label>
                  <Select
                    value={form.eventType}
                    onValueChange={(v) =>
                      setForm({ ...form, eventType: v as EventType })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Event date</Label>
                  <Input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => {
                      setForm({ ...form, eventDate: e.target.value });
                      setFilter("date", e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Number of guests (capacity: {venue.capacityMin}–
                  {venue.capacityMax})
                </Label>
                <Input
                  type="number"
                  min={venue.capacityMin}
                  max={venue.capacityMax}
                  value={form.guestCount}
                  onChange={(e) =>
                    setForm({ ...form, guestCount: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Message to owner (optional)</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell the owner about your event — what you need, budget range, any special requests…"
                  rows={3}
                />
              </div>

              {form.eventDate && (
                <Card className="bg-secondary/40">
                  <CardContent className="p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue</span>
                      <span className="font-medium">{venue.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Indicative price ({form.eventDate})
                      </span>
                      <span className="font-semibold">
                        {formatINR(basePrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Availability</span>
                      {dateOk ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          <CheckCircle2 className="size-3 mr-1" /> Likely
                          available
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Clock className="size-3 mr-1" /> Confirm with owner
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {form.guestCount > venue.capacityMax && (
                <p className="text-xs text-destructive">
                  Max capacity is {venue.capacityMax}
                </p>
              )}
            </div>

            <DialogFooter className="px-5 py-4 border-t bg-secondary/30 gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="size-4" /> Cancel
              </Button>
              <Button
                className="flex-1 wedding-gradient text-primary-foreground"
                disabled={!formValid}
                onClick={handleSubmit}
              >
                <Send className="size-4 mr-1.5" /> Send inquiry
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
              <CheckCircle2 className="size-9" />
            </div>
            <h3 className="font-serif text-xl font-bold">Inquiry sent!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              We&apos;ve notified the owner of <strong>{submitted.venueName}</strong>{" "}
              via WhatsApp. You&apos;ll receive a quote in your dashboard within 4
              hours.
            </p>
            <Card className="w-full mt-4 text-left">
              <CardContent className="p-4 space-y-1.5 text-sm">
                <Row label="Inquiry ID" value={submitted.id.toUpperCase()} />
                <Row label="Venue" value={submitted.venueName} />
                <Row label="Date" value={form.eventDate} />
                <Row label="Event" value={form.eventType} />
                <Row label="Guests" value={`${form.guestCount}`} />
              </CardContent>
            </Card>
            <div className="flex items-center gap-2 mt-3 text-xs text-emerald-700">
              <PartyPopper className="size-4" /> Owner will be notified on
              WhatsApp now
            </div>
            <DialogFooter className="w-full mt-4">
              <Button
                className="w-full wedding-gradient text-primary-foreground"
                onClick={handleClose}
              >
                View my inquiries
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
