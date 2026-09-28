import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mandapam — Wedding Venue Booking Marketplace",
  description:
    "Discover and book marriage plots, banquet halls, party plots, lawns, resorts and wedding venues across India. Check live availability, compare packages, pay online.",
  keywords: [
    "wedding venue",
    "marriage hall booking",
    "banquet hall",
    "party plot",
    "wedding resort",
    "Mandapam",
  ],
  authors: [{ name: "Mandapam" }],
  openGraph: {
    title: "Mandapam — Wedding Venue Booking Marketplace",
    description:
      "Book marriage plots, banquet halls, party plots, lawns, resorts and wedding venues online.",
    siteName: "Mandapam",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
