"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

// Route segment mapping for human-readable names
const routeSegmentMap: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Settings",
  account: "Account",
  notifications: "Notifications",
  profile: "Profile",
  trading: "Trading",
  portfolio: "Portfolio",
  transactions: "Transactions",
  reports: "Reports",
  analytics: "Analytics",
  credits: "Carbon Credits",
  projects: "Projects",
  marketplace: "Marketplace",
  compliance: "Compliance",
  verification: "Verification",
  // Add more route mappings as needed
};

const DashboardBreadcrumbs = () => {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove leading slash and split by '/'
    const segments = pathname.split("/").filter(Boolean);

    // Filter out route groups (segments wrapped in parentheses)
    const filteredSegments = segments.filter(
      (segment) => !segment.startsWith("(") || !segment.endsWith(")")
    );

    // Create breadcrumb items
    const breadcrumbs = filteredSegments.map((segment, index) => {
      const href = "/" + filteredSegments.slice(0, index + 1).join("/");
      const isLast = index === filteredSegments.length - 1;
      // Remove separators like '-' and '_' for display
      const cleanSegment = segment.replace(/[-_]+/g, " ");
      const displayName =
        routeSegmentMap[segment] ||
        cleanSegment
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      return {
        href,
        label: displayName,
        isLast,
      };
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // If we're at root dashboard, show a simple breadcrumb
  if (breadcrumbs.length <= 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {breadcrumb.isLast ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!breadcrumb.isLast && (
              <BreadcrumbSeparator
                className={index === 0 ? "hidden md:block" : ""}
              />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default DashboardBreadcrumbs;
