"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarHeart,
  Heart,
  Home,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  User as UserIcon,
  GitCompareArrows,
  Building2,
  Crown,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<Role, string> = {
  customer: "Customer",
  owner: "Venue Owner",
  admin: "Admin",
};

const ROLE_ICON: Record<Role, typeof UserIcon> = {
  customer: UserIcon,
  owner: Building2,
  admin: ShieldCheck,
};

export function SiteHeader() {
  const {
    role,
    setRole,
    currentUser,
    loginAs,
    logout,
    customerView,
    setCustomerView,
    ownerView,
    setOwnerView,
    adminView,
    setAdminView,
    compareIds,
    clearCompare,
  } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems =
    role === "customer"
      ? [
          { id: "home", label: "Home", icon: Home },
          { id: "browse", label: "Browse Venues", icon: Search },
          { id: "my-bookings", label: "My Bookings", icon: CalendarHeart },
          {
            id: "compare",
            label: `Compare (${compareIds.length})`,
            icon: GitCompareArrows,
          },
        ]
      : role === "owner"
      ? [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "venues", label: "My Venues", icon: Building2 },
          { id: "calendar", label: "Calendar", icon: CalendarHeart },
          { id: "bookings", label: "Bookings", icon: ListFilter },
          { id: "packages", label: "Packages", icon: Crown },
          { id: "earnings", label: "Earnings", icon: Heart },
        ]
      : [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "approvals", label: "Approvals", icon: ShieldCheck },
          { id: "bookings", label: "Bookings", icon: ListFilter },
          { id: "commission", label: "Commission", icon: Crown },
          { id: "disputes", label: "Disputes", icon: Heart },
          { id: "reports", label: "Reports", icon: Home },
        ];

  const currentViewId =
    role === "customer" ? customerView : role === "owner" ? ownerView : adminView;
  const setView = (id: string) => {
    if (role === "customer") setCustomerView(id as never);
    else if (role === "owner") setOwnerView(id as never);
    else setAdminView(id as never);
  };

  const RoleIcon = ROLE_ICON[role];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Logo */}
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2 shrink-0"
          aria-label="Mandapam home"
        >
          <div className="grid size-9 place-items-center rounded-full wedding-gradient text-primary-foreground">
            <Heart className="size-4.5 fill-current" />
          </div>
          <div className="hidden sm:block leading-none text-left">
            <div className="font-serif text-base font-bold tracking-tight">
              Manda<span className="gold-text">pam</span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Weddings · Venues · Memories
            </div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentViewId === item.id;
            return (
              <Button
                key={item.id}
                variant={active ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 gap-1.5",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/75 hover:text-foreground"
                )}
                onClick={() => setView(item.id)}
              >
                <Icon className="size-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Role switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <RoleIcon className="size-4" />
                <span className="hidden sm:inline">{ROLE_LABEL[role]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch demo role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["customer", "owner", "admin"] as Role[]).map((r) => {
                const Icon = ROLE_ICON[r];
                return (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => {
                      setRole(r);
                      loginAs(r);
                    }}
                    className={cn(role === r && "bg-accent")}
                  >
                    <Icon className="size-4 mr-2" /> {ROLE_LABEL[r]}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-accent p-1 pr-2 transition">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="font-semibold">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {currentUser.email}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {ROLE_LABEL[currentUser.role]} account
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="size-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                loginAs(role);
              }}
            >
              Sign in
            </Button>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Mandapam Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentViewId === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant={active ? "default" : "ghost"}
                      className="justify-start gap-2"
                      onClick={() => {
                        setView(item.id);
                        setMobileOpen(false);
                      }}
                    >
                      <Icon className="size-4" /> {item.label}
                    </Button>
                  );
                })}
                {role === "customer" && compareIds.length > 0 && (
                  <Button
                    variant="ghost"
                    className="justify-start text-muted-foreground"
                    onClick={() => {
                      clearCompare();
                    }}
                  >
                    Clear compare list
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
