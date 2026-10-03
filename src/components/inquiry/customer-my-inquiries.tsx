"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarHeart,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  Send,
  MapPin,
  Users,
  Lock,
  Receipt,
  ChevronDown,
  ChevronRight,
  PartyPopper,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  formatDate,
  computeBookingAdvance,
} from "@/lib/store";
import { BackButton } from "@/components/back-button";
import type { Inquiry, InquiryStatus } from "@/lib/types";

const STATUS_META: Record<
  InquiryStatus,
  { label: string; color: string; icon: typeof Clock; step: number }
> = {
  pending_owner: {
    label: "Awaiting owner response",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
    step: 1,
  },
  quoted: {
    label: "Quote received — review & accept",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Send,
    step: 2,
  },
  accepted_by_customer: {
    label: "Quote accepted — owner locking date",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: CheckCircle2,
    step: 3,
  },
  declined_by_owner: {
    label: "Owner declined",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    step: 2,
  },
  declined_by_customer: {
    label: "You declined the quote",
    color: "bg-zinc-100 text-zinc-800 border-zinc-200",
    icon: XCircle,
    step: 3,
  },
  date_locked: {
    label: "Date locked — pay advance",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Lock,
    step: 4,
  },
  paid: {
    label: "Advance paid — event in progress",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Wallet,
    step: 5,
  },
  receipt_uploaded: {
    label: "Receipt submitted — awaiting wallet release",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: Receipt,
    step: 6,
  },
  released: {
    label: "Completed — wallet released to owner",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
    step: 7,
  },
};

export function CustomerMyInquiries() {
  const {
    inquiries,
    currentUser,
    customerAcceptQuote,
    customerDeclineQuote,
    customerPayAdvance,
    venues,
    selectVenue,
  } = useAppStore();

  const myInquiries = inquiries.filter(
    (i) => i.customerId === (currentUser?.id ?? "u-cust-1")
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payDialog, setPayDialog] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <BackButton />
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">My Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your venue inquiries, accept quotes, and pay advances — all
          routed securely through Mandapam
        </p>
      </div>

      {myInquiries.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarHeart className="size-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No inquiries yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse venues and submit an inquiry to check availability.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {myInquiries.map((inq) => {
            const meta = STATUS_META[inq.status];
            const Icon = meta.icon;
            const isExpanded = expandedId === inq.id;
            const venue = venues.find((v) => v.id === inq.venueId);
            return (
              <Card key={inq.id} className="overflow-hidden p-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                  className="w-full text-left p-4 hover:bg-secondary/30 transition flex items-start gap-3"
                >
                  {venue && (
                    <img
                      src={venue.coverImage}
                      alt={inq.venueName}
                      className="size-16 sm:size-20 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3
                          className="font-semibold text-base cursor-pointer hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectVenue(inq.venueId);
                          }}
                        >
                          {inq.venueName}
                        </h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3" /> {inq.venueCity} ·{" "}
                          {inq.eventType} · {inq.guestCount} guests
                        </div>
                      </div>
                      <Badge className={`${meta.color} border`}>
                        <Icon className="size-3 mr-1" />
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <CalendarHeart className="size-3 text-muted-foreground" />
                        {formatDate(inq.eventDate)}
                      </span>
                      {inq.quote && (
                        <span className="font-semibold text-primary">
                          Quote: {formatINR(inq.quote.amount)}
                        </span>
                      )}
                      {inq.advancePaid && (
                        <span className="text-emerald-700">
                          Paid: {formatINR(inq.advancePaid)}
                        </span>
                      )}
                      <span className="text-muted-foreground font-mono">
                        {inq.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="size-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="size-5 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <CardContent className="p-4 pt-0 space-y-3 border-t">
                    {/* Quote section */}
                    {inq.quote && (
                      <div className="rounded-lg bg-secondary/40 p-3 border">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Owner&apos;s quote
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-primary">
                            {formatINR(inq.quote.amount)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Valid until {formatDate(inq.quote.validUntil)}
                          </Badge>
                        </div>
                        <p className="text-sm italic text-foreground/80 mb-2">
                          &quot;{inq.quote.message}&quot;
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {inq.quote.services.map((s) => (
                            <Badge
                              key={s}
                              variant="outline"
                              className="font-normal text-[11px]"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons based on status */}
                    {inq.status === "quoted" && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="wedding-gradient text-primary-foreground"
                          onClick={() => customerAcceptQuote(inq.id)}
                        >
                          <CheckCircle2 className="size-4" /> Accept quote
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive"
                          onClick={() => customerDeclineQuote(inq.id)}
                        >
                          <XCircle className="size-4" /> Decline
                        </Button>
                      </div>
                    )}

                    {inq.status === "date_locked" && (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-sm">
                          <div className="flex items-center gap-2 font-semibold text-purple-800 mb-1">
                            <Lock className="size-4" /> Date locked by owner!
                          </div>
                          <p className="text-purple-700 text-xs">
                            Pay 20% advance (
                            {formatINR(
                              computeBookingAdvance(inq.quote?.amount ?? 0)
                            )}
                            ) to confirm your booking. Mandapam will hold this
                            in escrow until your event.
                          </p>
                        </div>
                        <Button
                          className="wedding-gradient text-primary-foreground"
                          onClick={() => setPayDialog(inq.id)}
                        >
                          <Wallet className="size-4 mr-1.5" /> Pay advance now
                        </Button>
                      </div>
                    )}

                    {inq.status === "paid" && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-1">
                          <CheckCircle2 className="size-4" /> Advance paid
                        </div>
                        <p className="text-emerald-700 text-xs">
                          {formatINR(inq.advancePaid ?? 0)} has been credited to
                          the owner&apos;s Mandapam wallet (in escrow). Owner
                          will upload the cash receipt after the event to
                          release the funds.
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Payment ref: <strong>{inq.paymentRef}</strong>
                          <br />
                          UTR/Screenshot: <strong>{inq.paymentScreenshotRef}</strong>
                        </div>
                      </div>
                    )}

                    {inq.status === "receipt_uploaded" && (
                      <div className="rounded-lg bg-teal-50 border border-teal-200 p-3 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-teal-800 mb-1">
                          <Receipt className="size-4" /> Cash receipt uploaded
                        </div>
                        <p className="text-teal-700 text-xs">
                          Owner submitted receipt {inq.cashReceiptRef} for{" "}
                          {formatINR(inq.cashReceiptAmount ?? 0)}. Wallet will
                          be released after the event date.
                        </p>
                      </div>
                    )}

                    {inq.status === "released" && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-1">
                          <PartyPopper className="size-4" /> Booking completed
                        </div>
                        <p className="text-emerald-700 text-xs">
                          Wallet balance of{" "}
                          {formatINR(inq.releasedAmount ?? 0)} (after{" "}
                          {formatINR(inq.commissionDeducted ?? 0)} platform
                          commission) has been released to the owner.
                        </p>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Timeline
                      </div>
                      <div className="space-y-1.5">
                        {inq.timeline.map((ev, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs"
                          >
                            <div className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                              {ev.step}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium">{ev.label}</div>
                              <div className="text-muted-foreground">
                                {new Date(ev.at).toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                · {ev.actor}
                              </div>
                              {ev.note && (
                                <div className="text-foreground/70 italic mt-0.5">
                                  {ev.note}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer message */}
                    {inq.customerMessage && (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Your message
                        </div>
                        <p className="text-sm italic text-foreground/80">
                          &quot;{inq.customerMessage}&quot;
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment dialog */}
      <PayAdvanceDialog
        inquiryId={payDialog}
        onOpenChange={(o) => !o && setPayDialog(null)}
      />
    </div>
  );
}

function PayAdvanceDialog({
  inquiryId,
  onOpenChange,
}: {
  inquiryId: string | null;
  onOpenChange: (o: boolean) => void;
}) {
  const { inquiries, customerPayAdvance } = useAppStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);
  const [utr, setUtr] = useState("");
  const [paid, setPaid] = useState(false);

  if (!inquiry || !inquiry.quote) return null;
  const advance = computeBookingAdvance(inquiry.quote.amount);

  const handlePay = () => {
    if (!utr.trim()) return;
    const paymentRef = `VS-PAY-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
    customerPayAdvance(inquiry.id, paymentRef, utr.trim().toUpperCase());
    setPaid(true);
    setTimeout(() => {
      onOpenChange(false);
      setPaid(false);
      setUtr("");
    }, 2500);
  };

  return (
    <Dialog open={!!inquiryId} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-md">
        {!paid ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="size-5 text-primary" />
                Pay 20% advance
              </DialogTitle>
              <DialogDescription>
                {inquiry.venueName} · {formatDate(inquiry.eventDate)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="rounded-lg bg-secondary/40 p-3 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total quote</span>
                  <span className="font-medium">
                    {formatINR(inquiry.quote.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Advance (20%)
                  </span>
                  <span className="font-bold text-primary">
                    {formatINR(advance)}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 text-xs">
                <strong className="text-primary">Payment instructions:</strong>
                <br />
                1. Pay {formatINR(advance)} via UPI to{" "}
                <code className="bg-background px-1 rounded">
                  mandapam@okhdfc
                </code>
                <br />
                2. Note your UPI reference / UTR number
                <br />
                3. Enter it below so we can verify and credit the owner&apos;s
                wallet
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  UPI Reference / UTR Number *
                </Label>
                <Input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. UTR8347291042"
                />
                <p className="text-[11px] text-muted-foreground">
                  Upload your payment screenshot in your dashboard after
                  submitting. We&apos;ll match it to this UTR.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="wedding-gradient text-primary-foreground"
                disabled={!utr.trim()}
                onClick={handlePay}
              >
                <Wallet className="size-4 mr-1.5" /> I&apos;ve paid — submit UTR
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-6 text-center flex flex-col items-center">
            <div className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
              <CheckCircle2 className="size-9" />
            </div>
            <h3 className="font-serif text-lg font-bold">Payment recorded!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We&apos;ve credited {formatINR(advance)} to the owner&apos;s wallet
              (in escrow). Owner has been notified via WhatsApp.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
