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
  notes: "Notes",
  quiz: "Quizzes",
  create: "Create",
  edit: "Edit",
  browse: "Browse",
  answer: "Take Quiz",
  result: "Results",
  papers: "Papers",
  chat: "Chat",
  peer: "Peer Learning",
  schedule: "Schedule",
  gamification: "Achievements",
  // Add more route mappings as needed
};

const DashboardBreadcrumbs = () => {
  const pathname = usePathname();

  // Function to check if a segment looks like an ID
  const isIdSegment = (segment: string): boolean => {
    // Check for UUID pattern (8-4-4-4-12 characters)
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Check for numeric ID
    const numericPattern = /^\d+$/;

    // Check for other common ID patterns (alphanumeric with certain length)
    const alphanumericIdPattern = /^[a-zA-Z0-9]{8,}$/;

    return (
      uuidPattern.test(segment) ||
      numericPattern.test(segment) ||
      alphanumericIdPattern.test(segment)
    );
  };

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Remove leading slash and split by '/'
    const segments = pathname.split("/").filter(Boolean);

    // Filter out route groups (segments wrapped in parentheses) and ID segments
    const filteredSegments = segments.filter(
      (segment) =>
        (!segment.startsWith("(") || !segment.endsWith(")")) &&
        !isIdSegment(segment)
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
      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb className="hidden sm:flex">
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
