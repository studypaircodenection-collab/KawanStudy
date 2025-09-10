"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Text } from "@/components/ui/typography";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  const handleReport = () => {
    const subject = `Error report: ${encodeURIComponent(error?.message ?? "")}`;
    const body = encodeURIComponent(String(error?.stack ?? ""));
    // opens user's email client with pre-filled subject/body
    window.location.href = `mailto:dev@studypair.example?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <SidebarProvider>
        <SiteHeader />
      </SidebarProvider>
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-destructive">
              Something went wrong
            </CardTitle>
            <CardDescription>
              We encountered an unexpected error. You can try the actions below
              or report this issue to the team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Unhandled exception</AlertTitle>
              <AlertDescription>
                <Text as="p" styleVariant="muted">
                  {error?.message ?? "An unknown error occurred."}
                </Text>
              </AlertDescription>
            </Alert>

            <details className="text-sm text-muted-foreground">
              <summary className="cursor-pointer font-medium">
                Show details
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
                {String(error?.stack ?? "No stack available")}
              </pre>
            </details>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={reset} variant="outline">
                Try again
              </Button>
              <Button onClick={() => window.location.reload()} variant="ghost">
                Reload page
              </Button>
              <Button onClick={() => router.push("/")}>Go home</Button>
              <Button variant="link" onClick={handleReport}>
                Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
