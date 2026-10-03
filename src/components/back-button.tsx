"use client";

import { ChevronLeft } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** Where to go back to. Defaults to the role's dashboard. */
  to?: "dashboard" | "home" | "browse";
  /** Custom label, e.g. "Back to venues" */
  label?: string;
  /** Optional className override */
  className?: string;
}

/**
 * BackButton — small inline back navigation button.
 *
 * Renders as a subtle ghost-style link with a left chevron. Clicking it
 * switches the active view to the role's dashboard (or the explicitly
 * specified `to` target).
 *
 * Place at the top of any sub-page for predictable navigation.
 */
export function BackButton({ to, label, className }: BackButtonProps) {
  const { role, setRole, setCustomerView, setOwnerView, setAdminView } =
    useAppStore();

  const handleClick = () => {
    const target = to ?? "dashboard";
    if (role === "customer") {
      if (target === "home") setCustomerView("home");
      else if (target === "browse") setCustomerView("browse");
      else setCustomerView("home");
    } else if (role === "owner") {
      setOwnerView("dashboard");
    } else {
      setAdminView("dashboard");
    }
  };

  const defaultLabel =
    role === "customer"
      ? to === "browse"
        ? "Back to venues"
        : "Back to home"
      : "Back to dashboard";

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-3",
        className
      )}
      aria-label={label ?? defaultLabel}
    >
      <ChevronLeft className="size-4" />
      {label ?? defaultLabel}
    </button>
  );
}
