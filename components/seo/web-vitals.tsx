"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to analytics service
    if (process.env.NODE_ENV === "production") {
      // Example: Send to Google Analytics, Vercel Analytics, etc.
      console.log("Web Vital:", metric);

      // You can send to various analytics services:
      // gtag('event', metric.name, {
      //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      //   event_label: metric.id,
      //   non_interaction: true,
      // });

      // Or send to your own analytics endpoint:
      // fetch('/api/analytics/web-vitals', {
      //   method: 'POST',
      //   body: JSON.stringify(metric),
      //   headers: { 'Content-Type': 'application/json' }
      // });
    }
  });

  return null;
}
