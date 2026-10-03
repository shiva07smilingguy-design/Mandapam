"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Clock,
  CheckCircle2,
  Lock,
  Receipt,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  useAppStore,
  formatINR,
  formatDate,
} from "@/lib/store";
import { computeCommission } from "@/lib/commission";
import { BackButton } from "@/components/back-button";
import { toast } from "sonner";

// ----- Owner Wallet (added to OwnerEarnings as a new card) -----
// This component is exported separately so it can be embedded in OwnerEarnings.

export function OwnerWalletCard() {
  const { inquiries, venues, currentUser } = useAppStore();
  const myVenueIds = new Set(
    venues
      .filter((v) => v.ownerId === (currentUser?.id ?? "u-owner-1"))
      .map((v) => v.id)
  );
  const myInquiries = inquiries.filter((i) => myVenueIds.has(i.venueId));

  // Build wallet entries from inquiries that have advancePaid
  const walletEntries = myInquiries
    .filter((i) => i.advancePaid)
    .map((i) => {
      const breakdown = computeCommission(i.venueType, i.advancePaid!);
      return {
        inquiry: i,
        advancePaid: i.advancePaid!,
        commission: breakdown.commissionAmount,
        netPayable: breakdown.ownerPayout,
        commissionRate: breakdown.finalRatePercent * 100,
        status:
          i.status === "released"
            ? ("released" as const)
            : i.status === "receipt_uploaded"
            ? ("redeem_requested" as const)
            : ("in_escrow" as const),
      };
    });

  const inEscrow = walletEntries
    .filter((w) => w.status === "in_escrow")
    .reduce((s, w) => s + w.netPayable, 0);
  const redeemRequested = walletEntries
    .filter((w) => w.status === "redeem_requested")
    .reduce((s, w) => s + w.netPayable, 0);
  const released = walletEntries
    .filter((w) => w.status === "released")
    .reduce((s, w) => s + w.netPayable, 0);
  const totalCommission = walletEntries.reduce((s, w) => s + w.commission, 0);

  return (
    <Card className="border-primary/15">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Mandapam wallet</h3>
            <p className="text-xs text-muted-foreground">
              Advance payments held in escrow + released to your bank
            </p>
          </div>
          <Wallet className="size-5 text-primary" />
        </div>

        {/* Wallet summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-emerald-700">
              In escrow
            </div>
            <div className="text-lg font-bold text-emerald-800">
              {formatINR(inEscrow)}
            </div>
            <div className="text-[10px] text-emerald-600">
              {
                walletEntries.filter((w) => w.status === "in_escrow").length
              }{" "}
              active
            </div>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-amber-700">
              Redeem requested
            </div>
            <div className="text-lg font-bold text-amber-800">
              {formatINR(redeemRequested)}
            </div>
            <div className="text-[10px] text-amber-600">
              {
                walletEntries.filter((w) => w.status === "redeem_requested")
                  .length
              }{" "}
              pending
            </div>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <div className="text-[10px] uppercase tracking-wide text-blue-700">
              Released
            </div>
            <div className="text-lg font-bold text-blue-800">
              {formatINR(released)}
            </div>
            <div className="text-[10px] text-blue-600">
              {walletEntries.filter((w) => w.status === "released").length}{" "}
              settled
            </div>
          </div>
        </div>

        {/* Wallet entries table */}
        {walletEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No wallet transactions yet. Submit quotes to inquiries → customer
            pays advance → funds appear here.
          </p>
        ) : (
          <div className="overflow-x-auto fancy-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-3">Inquiry</th>
                  <th className="py-2 pr-3 text-right">Advance</th>
                  <th className="py-2 pr-3 text-center">Comm.</th>
                  <th className="py-2 pr-3 text-right">Net payable</th>
                  <th className="py-2 pr-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {walletEntries.map((w) => (
                  <tr key={w.inquiry.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="font-mono text-[11px]">
                        {w.inquiry.id.toUpperCase()}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {w.inquiry.venueName} · {formatDate(w.inquiry.eventDate)}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {formatINR(w.advancePaid)}
                    </td>
                    <td className="py-2.5 pr-3 text-center text-xs">
                      <Badge variant="outline" className="font-mono">
                        {w.commissionRate.toFixed(1)}%
                      </Badge>
                      <div className="text-[10px] text-amber-700 mt-0.5">
                        −{formatINR(w.commission)}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-primary">
                      {formatINR(w.netPayable)}
                    </td>
                    <td className="py-2.5 pr-3 text-center">
                      {w.status === "in_escrow" && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          <Lock className="size-3 mr-1" /> Escrow
                        </Badge>
                      )}
                      {w.status === "redeem_requested" && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Clock className="size-3 mr-1" /> Pending release
                        </Badge>
                      )}
                      {w.status === "released" && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <CheckCircle2 className="size-3 mr-1" /> Released
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="py-2.5 pr-3">Total commission paid</td>
                  <td />
                  <td className="py-2.5 pr-3 text-center text-amber-700">
                    {formatINR(totalCommission)}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-primary">
                    {formatINR(inEscrow + redeemRequested + released)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ----- Admin Inquiries monitor -----

export function AdminInquiries() {
  const { inquiries, venues, releaseWallet } = useAppStore();

  const stats = {
    total: inquiries.length,
    pending_owner: inquiries.filter((i) => i.status === "pending_owner")
      .length,
    in_escrow: inquiries.filter((i) => i.status === "paid").length,
    redeem_requested: inquiries.filter((i) => i.status === "receipt_uploaded")
      .length,
    totalEscrow: inquiries
      .filter((i) => i.status === "paid" || i.status === "receipt_uploaded")
      .reduce((s, i) => s + (i.advancePaid ?? 0), 0),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <BackButton />
      <div>
        <h1 className="font-serif text-3xl font-bold">All Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor the 7-step inquiry lifecycle across all venues + manually
          release wallets after event date
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi
          icon={TrendingUp}
          label="Total inquiries"
          value={`${stats.total}`}
        />
        <Kpi
          icon={Clock}
          label="Awaiting owner response"
          value={`${stats.pending_owner}`}
          accent="text-amber-700"
        />
        <Kpi
          icon={Lock}
          label="In escrow"
          value={`${stats.in_escrow}`}
          accent="text-emerald-700"
        />
        <Kpi
          icon={Receipt}
          label="Pending wallet release"
          value={`${stats.redeem_requested}`}
          accent="text-blue-700"
        />
      </div>

      {/* Inquiries table */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">All inquiries (7-step lifecycle)</h3>
          <div className="overflow-x-auto fancy-scroll">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 pr-3">Inquiry</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Venue</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3 text-right">Quote</th>
                  <th className="py-2 pr-3 text-right">Advance</th>
                  <th className="py-2 pr-3 text-center">Step</th>
                  <th className="py-2 pr-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => {
                  const today = new Date().toISOString().split("T")[0];
                  const eventPast = inq.eventDate < today;
                  const canRelease =
                    inq.status === "receipt_uploaded" && eventPast;
                  return (
                    <tr
                      key={inq.id}
                      className="border-b last:border-0 hover:bg-secondary/30"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-mono text-[11px]">
                          {inq.id.toUpperCase()}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">{inq.customerName}</td>
                      <td className="py-2.5 pr-3">{inq.venueName}</td>
                      <td className="py-2.5 pr-3">{formatDate(inq.eventDate)}</td>
                      <td className="py-2.5 pr-3 text-right">
                        {inq.quote ? formatINR(inq.quote.amount) : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-emerald-700">
                        {inq.advancePaid ? formatINR(inq.advancePaid) : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-center">
                        <StepBadge status={inq.status} />
                      </td>
                      <td className="py-2.5 pr-3">
                        {canRelease ? (
                          <Button
                            size="sm"
                            className="wedding-gradient text-primary-foreground"
                            onClick={() => {
                              releaseWallet(inq.id);
                              toast.success("Wallet released to owner");
                            }}
                          >
                            Release wallet
                          </Button>
                        ) : inq.status === "receipt_uploaded" ? (
                          <span className="text-[11px] text-muted-foreground">
                            Auto-releases after event
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Escrow summary */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="size-5 text-primary" />
            <h3 className="font-semibold">Platform escrow summary</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-secondary/40 p-3">
              <div className="text-xs text-muted-foreground">
                Total held in escrow
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {formatINR(stats.totalEscrow)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                From {stats.in_escrow + stats.redeem_requested} active bookings
              </div>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <div className="text-xs text-muted-foreground">
                Pending wallet releases
              </div>
              <div className="text-2xl font-bold text-amber-700">
                {stats.redeem_requested}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Receipts submitted, awaiting event date
              </div>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <div className="text-xs text-muted-foreground">
                Inquiries awaiting owner
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {stats.pending_owner}
              </div>
              <div className="text-[11px] text-muted-foreground">
                4-hour SLA per inquiry
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="p-4 gap-0">
      <div className="flex items-start justify-between">
        <div className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shrink-0">
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

function StepBadge({ status }: { status: string }) {
  const map: Record<string, { step: number; label: string; color: string }> = {
    pending_owner: {
      step: 1,
      label: "Awaiting owner",
      color: "bg-amber-100 text-amber-800 border-amber-200",
    },
    quoted: {
      step: 2,
      label: "Quote sent",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    accepted_by_customer: {
      step: 3,
      label: "Accepted",
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    declined_by_owner: {
      step: 2,
      label: "Owner declined",
      color: "bg-red-100 text-red-800 border-red-200",
    },
    declined_by_customer: {
      step: 3,
      label: "Customer declined",
      color: "bg-zinc-100 text-zinc-800 border-zinc-200",
    },
    date_locked: {
      step: 4,
      label: "Date locked",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    paid: {
      step: 5,
      label: "Advance paid",
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    receipt_uploaded: {
      step: 6,
      label: "Receipt uploaded",
      color: "bg-teal-100 text-teal-800 border-teal-200",
    },
    released: {
      step: 7,
      label: "Released",
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
  };
  const meta = map[status] ?? map.pending_owner;
  return (
    <Badge className={`${meta.color} border`}>
      {meta.step}. {meta.label}
    </Badge>
  );
}
