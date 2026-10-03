// Mock WhatsApp notification helper.
//
// In production, replace `sendWhatsAppNotification` with a real call to
// Twilio / Gupshup / Interakt using the Mandapam Business WhatsApp number.
// For now, this returns the message that WOULD be sent and triggers a toast.

import { toast } from "sonner";
import type { Inquiry } from "./types";

const MANDAPAM_PHONE = "+91 90161 80583";

export interface WhatsAppMessage {
  to: string; // recipient phone (customer or owner)
  recipientRole: "customer" | "owner";
  template: string; // template name
  body: string; // rendered message body
  inquiryId: string;
}

// Render a WhatsApp-style message for each step of the inquiry flow.
// All messages come FROM Mandapam's official number — never reveal the
// other party's direct phone number.

export function notifyOwner_newInquiry(inquiry: Inquiry): WhatsAppMessage {
  const body = `*New inquiry received on Mandapam* 🎉

*Venue:* ${inquiry.venueName}
*Customer:* ${inquiry.customerName}
*Event:* ${inquiry.eventType} on ${inquiry.eventDate}
*Guests:* ${inquiry.guestCount}
*Message:* ${inquiry.customerMessage || "—"}

Reply in your Mandapam owner dashboard with a quote within 4 hours.
— Mandapam Concierge`;
  const msg: WhatsAppMessage = {
    to: "OWNER_PHONE", // owner's registered phone (would be looked up)
    recipientRole: "owner",
    template: "new_inquiry_notification",
    body,
    inquiryId: inquiry.id,
  };
  toast.success("WhatsApp sent to venue owner", {
    description: `Inquiry ${inquiry.id.toUpperCase()} delivered`,
  });
  return msg;
}

export function notifyCustomer_ownerQuote(inquiry: Inquiry): WhatsAppMessage {
  if (!inquiry.quote) {
    throw new Error("notifyCustomer_ownerQuote: inquiry has no quote");
  }
  const body = `*Quote received from ${inquiry.venueName}* 💍

*Total quote:* ₹${inquiry.quote.amount.toLocaleString("en-IN")}
*Valid until:* ${inquiry.quote.validUntil}
*Included services:*
${inquiry.quote.services.map((s) => `  • ${s}`).join("\n")}

*Owner's note:* ${inquiry.quote.message}

Accept or decline this quote in your Mandapam dashboard.
— Mandapam Concierge`;
  const msg: WhatsAppMessage = {
    to: inquiry.customerPhone,
    recipientRole: "customer",
    template: "owner_quote_notification",
    body,
    inquiryId: inquiry.id,
  };
  toast.success("WhatsApp sent to customer with owner's quote", {
    description: `Inquiry ${inquiry.id.toUpperCase()}`,
  });
  return msg;
}

export function notifyOwner_customerAccepted(inquiry: Inquiry): WhatsAppMessage {
  const body = `*Customer accepted your quote!* ✅

*Venue:* ${inquiry.venueName}
*Customer:* ${inquiry.customerName}
*Event:* ${inquiry.eventType} on ${inquiry.eventDate}
*Agreed amount:* ₹${inquiry.quote?.amount.toLocaleString("en-IN") ?? "—"}

Please lock the date in your dashboard so Mandapam can send the customer a payment link.
— Mandapam Concierge`;
  const msg: WhatsAppMessage = {
    to: "OWNER_PHONE",
    recipientRole: "owner",
    template: "customer_accepted_quote",
    body,
    inquiryId: inquiry.id,
  };
  toast.success("WhatsApp sent to owner — customer accepted quote", {
    description: `Inquiry ${inquiry.id.toUpperCase()}`,
  });
  return msg;
}

export function notifyCustomer_paymentLink(inquiry: Inquiry): WhatsAppMessage {
  const advance = inquiry.quote
    ? Math.round(inquiry.quote.amount * 0.2)
    : 0;
  const body = `*Date locked! Time to pay your advance* 🔒

*Venue:* ${inquiry.venueName}
*Event date:* ${inquiry.eventDate}
*Advance (20%):* ₹${advance.toLocaleString("en-IN")}

Pay via the secure Mandapam link in your dashboard. After payment, upload the screenshot/UPI reference ID so we can credit the owner's wallet.

— Mandapam Concierge`;
  const msg: WhatsAppMessage = {
    to: inquiry.customerPhone,
    recipientRole: "customer",
    template: "payment_link_notification",
    body,
    inquiryId: inquiry.id,
  };
  toast.success("WhatsApp sent to customer with payment link", {
    description: `Inquiry ${inquiry.id.toUpperCase()}`,
  });
  return msg;
}

export function notifyOwner_paymentReceived(inquiry: Inquiry): WhatsAppMessage {
  const body = `*Advance payment received!* 💰

*Venue:* ${inquiry.venueName}
*Customer:* ${inquiry.customerName}
*Advance paid:* ₹${inquiry.advancePaid?.toLocaleString("en-IN") ?? "—"}
*Payment ref:* ${inquiry.paymentRef ?? "—"}

The amount has been credited to your Mandapam wallet (in escrow). It will be released to your bank after the event date, minus platform commission.

— Mandapam Concierge`;
  const msg: WhatsAppMessage = {
    to: "OWNER_PHONE",
    recipientRole: "owner",
    template: "payment_received_notification",
    body,
    inquiryId: inquiry.id,
  };
  toast.success("WhatsApp sent to owner — payment received", {
    description: `Inquiry ${inquiry.id.toUpperCase()}`,
  });
  return msg;
}

export function notifyOwner_receiptSubmitted(inquiry: Inquiry): WhatsAppMessage {
  const body = `*Cash receipt submitted* 📄

*Venue:* ${inquiry.venueName}
*Customer:* ${inquiry.customerName}
*Event date:* ${inquiry.eventDate}
*Receipt ref:* ${inquiry.cashReceiptRef ?? "—"}
*Receipt amount:* ₹${inquiry.cashReceiptAmount?.toLocaleString("en-IN") ?? "—"}

Your redeem request is now in the queue. Wallet balance will be released to your registered bank account after the event date, minus commission.

— Mandapam Concierge`;
  const msg: WhatsAppMessage = {
    to: "OWNER_PHONE",
    recipientRole: "owner",
    template: "receipt_submitted_notification",
    body,
    inquiryId: inquiry.id,
  };
  toast.success("WhatsApp sent to owner — receipt submitted", {
    description: `Inquiry ${inquiry.id.toUpperCase()}`,
  });
  return msg;
}

export function notifyOwner_walletReleased(inquiry: Inquiry): WhatsAppMessage {
  const body = `*Wallet balance released!* 🎊

*Venue:* ${inquiry.venueName}
*Customer:* ${inquiry.customerName}
*Advance held:* ₹${inquiry.advancePaid?.toLocaleString("en-IN") ?? "—"}
*Commission (${(inquiry.commissionDeducted && inquiry.advancePaid ? (inquiry.commissionDeducted / inquiry.advancePaid * 100) : 0).toFixed(1)}%):* −₹${inquiry.commissionDeducted?.toLocaleString("en-IN") ?? "—"}
*Net released:* ₹${inquiry.releasedAmount?.toLocaleString("en-IN") ?? "—"}

The amount has been NEFT'd to your registered bank account. Thank you for hosting on Mandapam!

— Mandapam Concierge`;
  const msg: WhatsAppMessage = {
    to: "OWNER_PHONE",
    recipientRole: "owner",
    template: "wallet_released_notification",
    body,
    inquiryId: inquiry.id,
  };
  toast.success("WhatsApp sent to owner — wallet released", {
    description: `Inquiry ${inquiry.id.toUpperCase()}`,
  });
  return msg;
}

export function notifyCustomer_ownerDeclined(inquiry: Inquiry): WhatsAppMessage {
  const body = `*Update on your inquiry* 💔

Unfortunately, the owner of *${inquiry.venueName}* has declined your inquiry for ${inquiry.eventDate}. This usually means the date is already booked or unavailable.

Browse more venues on Mandapam — we'll find you the perfect one!

— Mandapam Concierge`;
  const msg: WhatsAppMessage = {
    to: inquiry.customerPhone,
    recipientRole: "customer",
    template: "owner_declined_notification",
    body,
    inquiryId: inquiry.id,
  };
  toast.success("WhatsApp sent to customer — owner declined", {
    description: `Inquiry ${inquiry.id.toUpperCase()}`,
  });
  return msg;
}

// Helper: format a phone for display
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  return phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4);
}

export { MANDAPAM_PHONE };
