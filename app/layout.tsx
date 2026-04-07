import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MINDR",
  description: "Del og se billeder fra eventet",
  // Smart App Banner — viser App Clip-kort i Safari (kræver App Store ID når appen er live)
  // appleWebApp bruges som fallback indtil App Store ID kendes
  other: {
    "apple-itunes-app":
      "app-clip-bundle-id=com.mycompany.mindr.Clip, app-clip-display=card",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
