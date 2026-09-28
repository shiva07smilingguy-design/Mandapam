"use client";

import { Heart, Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { CITIES, COMING_SOON_CITIES } from "@/lib/seed-data";

export function SiteFooter() {
  const setRole = useAppStore((s) => s.setRole);
  const setCustomerView = useAppStore((s) => s.setCustomerView);
  const setFilter = useAppStore((s) => s.setFilter);

  return (
    <footer className="mt-auto border-t bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="grid size-8 place-items-center rounded-full wedding-gradient text-primary-foreground">
              <Heart className="size-4 fill-current" />
            </div>
            <div className="font-serif text-base font-bold">
              Manda<span className="gold-text">pam</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vadodara&apos;s wedding venue marketplace. Discover, compare and book
            marriage plots, banquet halls, party plots, lawns, resorts and
            wedding venues across Vadodara and beyond — all in one place.
          </p>
          <div className="flex gap-2 mt-4">
            <a
              href="#"
              className="grid size-8 place-items-center rounded-full bg-background border hover:bg-accent"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="#"
              className="grid size-8 place-items-center rounded-full bg-background border hover:bg-accent"
              aria-label="Facebook"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="#"
              className="grid size-8 place-items-center rounded-full bg-background border hover:bg-accent"
              aria-label="Twitter"
            >
              <Twitter className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Cities we serve</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CITIES.map((c) => (
              <li key={c}>
                <button
                  className="hover:text-primary text-left font-medium text-foreground"
                  onClick={() => {
                    setRole("customer");
                    setFilter("city", c);
                    setCustomerView("browse");
                  }}
                >
                  Wedding venues in {c}
                </button>
              </li>
            ))}
            {COMING_SOON_CITIES.slice(0, 5).map((c) => (
              <li key={c} className="text-left flex items-center gap-1.5 opacity-60">
                {c}
                <span className="text-[10px] uppercase tracking-wide bg-secondary text-muted-foreground rounded px-1.5 py-0.5">
                  Soon
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">For Customers</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <button
                className="hover:text-primary"
                onClick={() => {
                  setRole("customer");
                  setCustomerView("browse");
                }}
              >
                Browse venues
              </button>
            </li>
            <li>
              <button
                className="hover:text-primary"
                onClick={() => {
                  setRole("customer");
                  setCustomerView("compare");
                }}
              >
                Compare venues
              </button>
            </li>
            <li>
              <button
                className="hover:text-primary"
                onClick={() => {
                  setRole("customer");
                  setCustomerView("my-bookings");
                }}
              >
                My bookings
              </button>
            </li>
            <li>
              <button className="hover:text-primary">Cancellation policy</button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">For Venue Owners</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <button
                className="hover:text-primary"
                onClick={() => setRole("owner")}
              >
                List your venue
              </button>
            </li>
            <li>
              <button
                className="hover:text-primary"
                onClick={() => setRole("owner")}
              >
                Owner dashboard
              </button>
            </li>
            <li>
              <button className="hover:text-primary">Pricing & commission</button>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-3.5" /> hello@mandapam.in
            </li>
            <li>
              <a
                href="tel:+919016180583"
                className="flex items-center gap-2 hover:text-primary transition"
              >
                <Phone className="size-3.5" /> +91 90161 80583
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Mandapam Technologies Pvt. Ltd. · Made
        with <Heart className="inline size-3 fill-primary text-primary" /> in
        India
      </div>
    </footer>
  );
}
