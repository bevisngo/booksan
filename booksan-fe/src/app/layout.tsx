import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booksan - Book Sports Venues",
  description: "Find and book sports venues near you. Play your favorite sports with ease.",
  keywords: ["sports", "venues", "booking", "courts", "fields", "tennis", "basketball", "football"],
  authors: [{ name: "Booksan Team" }],
  creator: "Booksan",
  publisher: "Booksan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://booksan.com",
    title: "Booksan - Book Sports Venues",
    description: "Find and book sports venues near you. Play your favorite sports with ease.",
    siteName: "Booksan",
  },
  twitter: {
    card: "summary_large_image",
    title: "Booksan - Book Sports Venues",
    description: "Find and book sports venues near you. Play your favorite sports with ease.",
    creator: "@booksan",
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
