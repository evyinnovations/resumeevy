import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/shared/providers";
import { CustomCursor } from "@/components/shared/custom-cursor";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ResumeEvy — AI-Powered Resume Builder & Tailoring",
    template: "%s | ResumeEvy",
  },
  description:
    "Build, tailor, and optimize your resume with AI. Get higher ATS scores, land more interviews. Trusted by 10,000+ job seekers.",
  keywords: [
    "resume builder",
    "AI resume",
    "ATS optimization",
    "resume tailoring",
    "job application",
    "CV builder",
    "resume templates",
  ],
  authors: [{ name: "ResumeEvy" }],
  creator: "ResumeEvy",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://resumeevy.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resumeevy.com",
    siteName: "ResumeEvy",
    title: "ResumeEvy — AI-Powered Resume Builder & Tailoring",
    description:
      "Build, tailor, and optimize your resume with AI. Get higher ATS scores, land more interviews.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ResumeEvy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeEvy — AI-Powered Resume Builder & Tailoring",
    description: "Build, tailor, and optimize your resume with AI.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased cursor-none">
        <Providers>
          <CustomCursor />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
