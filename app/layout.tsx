import type { Metadata } from "next";
import { Bodoni_Moda, Outfit } from "next/font/google";
import { getSite } from "@/lib/content/index.ts";
import { openGraphBase, SITE_URL } from "@/lib/metadata.ts";
import "./globals.css";

// Same weights as the live site: other weights fall back to the closest one.
const outfit = Outfit({ subsets: ["latin"], weight: ["100", "200", "400"], variable: "--font-outfit" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bodoni" });

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    metadataBase: new URL(SITE_URL),
    icons: { icon: "/favicon.png" },
    openGraph: openGraphBase(site),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} ${bodoni.variable}`}>
      <body>{children}</body>
    </html>
  );
}
