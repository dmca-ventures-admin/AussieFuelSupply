import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Australia Fuel Supply Tracker",
  description:
    "Real-time dashboard tracking Australia's fuel supply chain — from the Strait of Hormuz through Asian refineries to the bowser at your local servo.",
  keywords: [
    "Australia fuel supply",
    "fuel crisis",
    "petrol prices",
    "diesel supply",
    "MSO",
    "fuel stocks",
    "Strait of Hormuz",
  ],
  openGraph: {
    title: "Australia Fuel Supply Tracker",
    description:
      "Tracking the supply chain from the Strait of Hormuz to the bowser at your local servo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-200 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
