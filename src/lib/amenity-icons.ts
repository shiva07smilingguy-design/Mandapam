"use client";

import {
  Snowflake,
  Car,
  Carrot,
  DoorOpen,
  Lightbulb,
  Music,
  Palmtree,
  PartyPopper,
  Shirt,
  Sparkles,
  TreePalm,
  Utensils,
  Waves,
  Camera,
  Building2,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "AC Hall": Snowflake,
  "Bridal Room": Shirt,
  "Bridal Suite": Shirt,
  "Power Backup": Lightbulb,
  "Valet Parking": Car,
  "In-house Decor": Sparkles,
  Lawn: TreePalm,
  Kitchen: Utensils,
  "LED Wall": Lightbulb,
  DJ: Music,
  Bar: PartyPopper,
  Spa: Palmtree,
  "Swimming Pool": Waves,
  "Beach Access": Palmtree,
  "Heritage Architecture": Building2,
  "Photography Friendly": Camera,
  "Multi-cuisine Restaurant": Utensils,
};

export function amenityIcon(label: string): LucideIcon {
  return ICON_MAP[label] ?? Sparkles;
}
