import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { brand, brandMetadata } from "@/config/brand";
import "./globals.css";

// Inter is the single humanist sans-serif used across the application.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Monospace used for timers and numeric readouts.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: brandMetadata.title,
    template: brandMetadata.titleTemplate,
  },
  description: brand.description,
  applicationName: brand.productName,
  openGraph: {
    title: brandMetadata.title,
    description: brand.description,
    siteName: brand.productName,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: brandMetadata.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-foreground">
        {children}
      </body>
    </html>
  );
}
