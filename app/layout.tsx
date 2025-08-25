import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/context/theme-provder";
import { StructuredData } from "@/components/seo/structured-data";
import { WebVitals } from "@/components/seo/web-vitals";
import AuthProvider from "@/lib/context/auth-provider";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KawanStudy - Find Study Partners, Tutors & Level Up Your Learning",
  description:
    "A peer-to-peer campus study site for students to find tutors, study with others, and earn points, badges, and leaderboard ranks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <head>
        <StructuredData />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="bg-background text-foreground">
        <WebVitals />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
          >
            <main className="min-h-screen flex flex-col items-center">
              {children}
              <Toaster richColors theme="light" />
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
