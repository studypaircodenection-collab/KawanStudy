import { Metadata } from "next";

export const metadata: Metadata = {
  title: "StudyPair - Smart Tutoring Platform for Modern Students",
  description:
    "Connect with study partners, earn achievements, and transform your learning journey with our intelligent peer-to-peer tutoring ecosystem.",
  keywords: [
    "tutoring",
    "study partners",
    "peer learning",
    "education platform",
    "student collaboration",
    "gamified learning",
    "study tools",
    "academic success",
  ],
  authors: [{ name: "StudyPair Team" }],
  openGraph: {
    title: "StudyPair - Smart Tutoring Platform",
    description:
      "Connect with study partners, earn achievements, and transform your learning journey with our intelligent peer-to-peer tutoring ecosystem.",
    type: "website",
    locale: "en_US",
    siteName: "StudyPair",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyPair - Smart Tutoring Platform",
    description:
      "Connect with study partners, earn achievements, and transform your learning journey with our intelligent peer-to-peer tutoring ecosystem.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
