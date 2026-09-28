"use client";

import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CustomerHome } from "@/components/customer/customer-home";
import { CustomerBrowse } from "@/components/customer/customer-browse";
import { CustomerVenueDetail } from "@/components/customer/customer-venue-detail";
import { CustomerMyBookings } from "@/components/customer/customer-my-bookings";
import { CustomerCompare } from "@/components/customer/customer-compare";
import { OwnerDashboard } from "@/components/owner/owner-dashboard";
import {
  OwnerVenues,
} from "@/components/owner/owner-venues";
import {
  OwnerBookings,
  OwnerCalendar,
  OwnerPackages,
  OwnerEarnings,
} from "@/components/owner/owner-panels";
import {
  AdminDashboard,
  AdminApprovals,
  AdminBookings,
  AdminCommission,
  AdminDisputes,
  AdminCoupons,
  AdminReports,
  AdminCustomers,
  AdminReviews,
} from "@/components/admin/admin-panels";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const {
    role,
    customerView,
    ownerView,
    adminView,
    currentUser,
    loginAs,
  } = useAppStore();

  // Auto-login as the current role if not signed in
  useEffect(() => {
    if (!currentUser) loginAs(role);
  }, [role, currentUser, loginAs]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {role === "customer" && (
          <>
            {customerView === "home" && <CustomerHome />}
            {customerView === "browse" && <CustomerBrowse />}
            {customerView === "venue-detail" && <CustomerVenueDetail />}
            {customerView === "my-bookings" && <CustomerMyBookings />}
            {customerView === "compare" && <CustomerCompare />}
          </>
        )}
        {role === "owner" && (
          <>
            {ownerView === "dashboard" && <OwnerDashboard />}
            {ownerView === "venues" && <OwnerVenues />}
            {ownerView === "calendar" && <OwnerCalendar />}
            {ownerView === "bookings" && <OwnerBookings />}
            {ownerView === "packages" && <OwnerPackages />}
            {ownerView === "earnings" && <OwnerEarnings />}
          </>
        )}
        {role === "admin" && (
          <>
            {adminView === "dashboard" && <AdminDashboard />}
            {adminView === "approvals" && <AdminApprovals />}
            {adminView === "bookings" && <AdminBookings />}
            {adminView === "commission" && <AdminCommission />}
            {adminView === "disputes" && <AdminDisputes />}
            {adminView === "coupons" && <AdminCoupons />}
            {adminView === "reports" && <AdminReports />}
            {adminView === "customers" && <AdminCustomers />}
            {adminView === "reviews" && <AdminReviews />}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
