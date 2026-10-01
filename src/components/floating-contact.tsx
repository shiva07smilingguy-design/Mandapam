"use client";

import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PHONE_NUMBER = "+919016180583";
const PHONE_DISPLAY = "+91 90161 80583";

/**
 * FloatingContactButtons — sticky Call Now FAB.
 *
 * - Visible on every page (mounted in root layout)
 * - Mobile-first: bottom-right floating button
 * - Desktop: also bottom-right, slightly larger hit area
 * - Auto-expands on first visit (3 seconds) to draw attention, then collapses
 * - Hover/tap reveals label on desktop
 */
export function FloatingContactButtons() {
  const [expanded, setExpanded] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Show a one-time hint pulse after 2 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2"
      aria-label="Quick contact"
    >
      {/* Call Now button */}
      <a
        href={`tel:${PHONE_NUMBER}`}
        className={cn(
          "group flex items-center gap-2 rounded-full shadow-lg transition-all",
          "wedding-gradient text-primary-foreground hover:opacity-95",
          "size-14 sm:size-16 hover:pr-5 hover:w-auto",
          expanded && "pr-5 w-auto"
        )}
        aria-label={`Call us at ${PHONE_DISPLAY}`}
        title={`Call ${PHONE_DISPLAY}`}
      >
        <Phone className="size-6 sm:size-7 shrink-0 mx-auto group-hover:mx-0 animate-pulse" />
        <span
          className={cn(
            "text-sm font-semibold whitespace-nowrap overflow-hidden transition-all",
            "max-w-0 group-hover:max-w-[160px]",
            expanded && "max-w-[160px]"
          )
          }
        >
          Call to book
        </span>
      </a>

      {/* Hint badge — pulses once on first load, then disappears */}
      {showHint && (
        <button
          onClick={() => {
            setExpanded((e) => !e);
            setShowHint(false);
          }}
          className="absolute -top-1 -left-1 -translate-x-full -translate-y-1/2 bg-background border rounded-full shadow-md px-2.5 py-1 text-[11px] font-medium whitespace-nowrap animate-bounce hover:bg-accent"
          aria-label="Toggle contact options"
        >
          Need help? Tap here 👋
          <X className="inline size-3 ml-1 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
