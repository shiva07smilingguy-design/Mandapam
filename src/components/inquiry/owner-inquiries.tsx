"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Send,
  MapPin,
  Users,
  Lock,
  Receipt,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  formatDate,
} from "@/lib/store";
import { maskPhone } from "@/lib/notifications";
import { BackButton } from "@/components/back-button";
import { toast } from "sonner";
import type { Inquiry, InquiryStatus } from "@/lib/types";

const STATUS_META: Record<
  InquiryStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending_owner: {
    label: "New inquiry — respond now",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
  },
  quoted: {
    label: "Quote sent — awaiting customer",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Send,
  },
  accepted_by_customer: {
    label: "Customer accepted — lock the date",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: CheckCircle2,
  },
  declined_by_owner: {
    label: "You declined",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
  declined_by_customer: {
    label: "Customer declined",
    color: "bg-zinc-100 text-zinc-800 border-zinc-200",
    icon: XCircle,
  },
  date_locked: {
    label: "Date locked — awaiting payment",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Lock,
  },
  paid: {
    label: "Advance paid — in your wallet (escrow)",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  receipt_uploaded: {
    label: "Receipt submitted — release pending",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: Receipt,
  },
  released: {
    label: "Completed — wallet released",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
};

export function OwnerInquiries() {
  const {
    inquiries,
    venues,
    currentUser,
    ownerSendQuote,
    ownerDeclineInquiry,
    ownerLockDate,
    ownerUploadReceipt,
  } = useAppStore();

  const myVenueIds = new Set(
    venues
      .filter((v) => v.ownerId === (currentUser?.id ?? "u-owner-1"))
      .map((v) => v.id)
  );
  const myInquiries = inquiries.filter((i) => myVenueIds.has(i.venueId));

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quoteDialog, setQuoteDialog] = useState<string | null>(null);
  const [receiptDialog, setReceiptDialog] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "done">(
    "all"
  );

  const filtered = myInquiries.filter((i) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return ["pending_owner", "accepted_by_customer"].includes(i.status);
    if (filter === "active")
      return ["quoted", "date_locked", "paid", "receipt_uploaded"].includes(
        i.status
      );
    if (filter === "done")
      return [
        "released",
        "declined_by_owner",
        "declined_by_customer",
      ].includes(i.status);
    return true;
  });

  const stats = {
    total: myInquiries.length,
    pending: myInquiries.filter((i) =>
      ["pending_owner", "accepted_by_customer"].includes(i.status)
    ).length,
    active: myInquiries.filter((i) =>
      ["quoted", "date_locked", "paid", "receipt_uploaded"].includes(i.status)
    ).length,
    wallet: myInquiries
      .filter((i) => i.status === "paid" || i.status === "receipt_uploaded")
      .reduce((s, i) => s + (i.advancePaid ?? 0), 0),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <BackButton />
      <div className="mb-5">
        <h1 className="font-serif text-3xl font-bold">Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Respond to inquiries with quotes, lock dates, and submit cash receipts
          to release your wallet balance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard
          icon={CalendarHeart}
          label="Total inquiries"
          value={`${stats.total}`}
        />
        <StatCard
          icon={Clock}
          label="Pending action"
          value={`${stats.pending}`}
          accent="text-amber-700"
        />
        <StatCard
          icon={Send}
          label="Active bookings"
          value={`${stats.active}`}
          accent="text-blue-700"
        />
        <StatCard
          icon={CheckCircle2}
          label="In wallet (escrow)"
          value={formatINR(stats.wallet)}
          accent="text-emerald-700"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ["all", "All"],
            ["pending", "Needs response"],
            ["active", "Active"],
            ["done", "Completed"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarHeart className="size-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold">No inquiries in this filter</h3>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => {
            const meta = STATUS_META[inq.status];
            const Icon = meta.icon;
            const isExpanded = expandedId === inq.id;
            return (
              <Card key={inq.id} className="overflow-hidden p-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                  className="w-full text-left p-4 hover:bg-secondary/30 transition"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-base">
                        {inq.customerName}
                      </h3>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {inq.venueName} · {inq.eventType} · {inq.guestCount}{" "}
                        guests
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
                        Advance: {formatINR(inq.advancePaid)}
                      </span>
                    )}
                    <span className="text-muted-foreground font-mono">
                      {inq.id.toUpperCase()}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <CardContent className="p-4 pt-0 space-y-3 border-t">
                    {/* Customer contact (masked phone — owner can't bypass Mandapam) */}
                    <div className="rounded-lg bg-secondary/40 p-3 border text-sm">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Customer details (routed via Mandapam)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Phone className="size-3.5 text-muted-foreground" />
                          {maskPhone(inq.customerPhone)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5 text-muted-foreground" />
                          {inq.customerEmail}
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-2">
                        💡 Direct phone numbers are revealed only after the event
                        to prevent bypass. All communication routes through
                        Mandapam.
                      </div>
                    </div>

                    {/* Customer message */}
                    {inq.customerMessage && (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          Customer&apos;s message
                        </div>
                        <p className="text-sm italic">
                          &quot;{inq.customerMessage}&quot;
                        </p>
                      </div>
                    )}

                    {/* Quote section (if exists) */}
                    {inq.quote && (
                      <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 text-sm">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Your quote
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
                    {inq.status === "pending_owner" && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="wedding-gradient text-primary-foreground"
                          onClick={() => setQuoteDialog(inq.id)}
                        >
                          <Send className="size-4" /> Send quote
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive"
                          onClick={() => {
                            ownerDeclineInquiry(inq.id);
                            toast.success("Inquiry declined");
                          }}
                        >
                          <XCircle className="size-4" /> Decline
                        </Button>
                      </div>
                    )}

                    {inq.status === "accepted_by_customer" && (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-sm">
                          <div className="flex items-center gap-2 font-semibold text-indigo-800 mb-1">
                            <CheckCircle2 className="size-4" /> Customer
                            accepted your quote!
                          </div>
                          <p className="text-indigo-700 text-xs">
                            Lock the date now. Mandapam will send the customer a
                            payment link via WhatsApp. The 20% advance will be
                            credited to your wallet (in escrow) once paid.
                          </p>
                        </div>
                        <Button
                          className="wedding-gradient text-primary-foreground"
                          onClick={() => {
                            ownerLockDate(inq.id);
                            toast.success("Date locked! Payment link sent to customer");
                          }}
                        >
                          <Lock className="size-4 mr-1.5" /> Lock date & send
                          payment link
                        </Button>
                      </div>
                    )}

                    {inq.status === "paid" && (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
                          <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-1">
                            <CheckCircle2 className="size-4" /> Advance received
                          </div>
                          <p className="text-emerald-700 text-xs">
                            {formatINR(inq.advancePaid ?? 0)} is in your Mandapam
                            wallet (in escrow). After the event, upload the cash
                            receipt to release the funds to your bank.
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Payment ref: <strong>{inq.paymentRef}</strong>
                            <br />
                            UTR: <strong>{inq.paymentScreenshotRef}</strong>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setReceiptDialog(inq.id)}
                          disabled={new Date(inq.eventDate) > new Date()}
                        >
                          <Receipt className="size-4 mr-1.5" /> Upload cash
                          receipt
                        </Button>
                        {new Date(inq.eventDate) > new Date() && (
                          <p className="text-[11px] text-muted-foreground">
                            Receipt upload becomes available after the event
                            date ({formatDate(inq.eventDate)}).
                          </p>
                        )}
                      </div>
                    )}

                    {inq.status === "receipt_uploaded" && (
                      <div className="rounded-lg bg-teal-50 border border-teal-200 p-3 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-teal-800 mb-1">
                          <Receipt className="size-4" /> Receipt submitted
                        </div>
                        <p className="text-teal-700 text-xs">
                          Receipt {inq.cashReceiptRef} for{" "}
                          {formatINR(inq.cashReceiptAmount ?? 0)} submitted.
                          Wallet will be auto-released after the event date with
                          commission deducted.
                        </p>
                      </div>
                    )}

                    {inq.status === "released" && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-1">
                          <CheckCircle2 className="size-4" /> Wallet released
                        </div>
                        <p className="text-emerald-700 text-xs">
                          {formatINR(inq.releasedAmount ?? 0)} released (after{" "}
                          {formatINR(inq.commissionDeducted ?? 0)} platform
                          commission) on{" "}
                          {inq.releasedAt
                            ? formatDate(inq.releasedAt.split("T")[0])
                            : "—"}
                          .
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
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Quote dialog */}
      <QuoteDialog
        inquiryId={quoteDialog}
        onOpenChange={(o) => !o && setQuoteDialog(null)}
      />

      {/* Receipt dialog */}
      <ReceiptDialog
        inquiryId={receiptDialog}
        onOpenChange={(o) => !o && setReceiptDialog(null)}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-foreground",
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="p-4 gap-0">
      <div className="flex items-center gap-2.5">
        <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shrink-0">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
            {label}
          </div>
          <div className={`text-lg font-bold ${accent}`}>{value}</div>
        </div>
      </div>
    </Card>
  );
}

function QuoteDialog({
  inquiryId,
  onOpenChange,
}: {
  inquiryId: string | null;
  onOpenChange: (o: boolean) => void;
}) {
  const { inquiries, ownerSendQuote } = useAppStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);
  const [amount, setAmount] = useState(100000);
  const [services, setServices] = useState(
    "Venue rental\nDecor\nCatering\nDJ"
  );
  const [message, setMessage] = useState("");

  if (!inquiry) return null;

  const handleSend = () => {
    if (!amount || amount < 1000) {
      toast.error("Enter a valid quote amount");
      return;
    }
    ownerSendQuote(inquiry.id, {
      amount,
      services: services
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      message:
        message || `Quote valid for 7 days. Looking forward to your event!`,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
    toast.success("Quote sent! Customer will be notified via WhatsApp.");
    onOpenChange(false);
    setAmount(100000);
    setServices("Venue rental\nDecor\nCatering\nDJ");
    setMessage("");
  };

  return (
    <Dialog open={!!inquiryId} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto fancy-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5 text-primary" /> Send quote
          </DialogTitle>
          <DialogDescription>
            {inquiry.venueName} · {inquiry.customerName} ·{" "}
            {formatDate(inquiry.eventDate)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Total quote amount (INR)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1000}
              step={1000}
            />
            <p className="text-[11px] text-muted-foreground">
              Customer will pay 20% ({formatINR(Math.round(amount * 0.2))}) as
              advance after accepting
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Included services (one per line)</Label>
            <Textarea
              value={services}
              onChange={(e) => setServices(e.target.value)}
              rows={4}
              placeholder="Venue rental&#10;Decor&#10;Catering"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Message to customer</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="e.g. Date is available. We can offer a discount if you confirm within 7 days."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="wedding-gradient text-primary-foreground"
            onClick={handleSend}
          >
            <Send className="size-4 mr-1.5" /> Send quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptDialog({
  inquiryId,
  onOpenChange,
}: {
  inquiryId: string | null;
  onOpenChange: (o: boolean) => void;
}) {
  const { inquiries, ownerUploadReceipt } = useAppStore();
  const inquiry = inquiries.find((i) => i.id === inquiryId);
  const [receiptRef, setReceiptRef] = useState("");
  const [amount, setAmount] = useState(inquiry?.quote?.amount ?? 0);

  if (!inquiry) return null;

  const handleUpload = () => {
    if (!receiptRef.trim() || !amount) {
      toast.error("Enter receipt reference and amount");
      return;
    }
    ownerUploadReceipt(inquiry.id, receiptRef.trim().toUpperCase(), amount);
    toast.success("Receipt submitted! Wallet release pending.");
    onOpenChange(false);
    setReceiptRef("");
  };

  return (
    <Dialog open={!!inquiryId} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-5 text-primary" /> Upload cash receipt
          </DialogTitle>
          <DialogDescription>
            {inquiry.venueName} · {inquiry.customerName} · Event on{" "}
            {formatDate(inquiry.eventDate)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="rounded-lg bg-secondary/40 p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advance in wallet</span>
              <span className="font-semibold text-emerald-700">
                {formatINR(inquiry.advancePaid ?? 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total quote</span>
              <span>{formatINR(inquiry.quote?.amount ?? 0)}</span>
            </div>
            <div className="text-[11px] text-muted-foreground pt-1">
              Upload the cash receipt you received from the customer for the
              remaining balance. Mandapam will release your wallet (minus
              commission) after verification.
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Cash receipt reference / number</Label>
            <Input
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              placeholder="e.g. RECEIPT-2026-001"
            />
            <p className="text-[11px] text-muted-foreground">
              In production: this would be a PDF upload. For demo, enter any
              reference ID.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Cash received (INR)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="wedding-gradient text-primary-foreground"
            onClick={handleUpload}
          >
            <Receipt className="size-4 mr-1.5" /> Submit receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
