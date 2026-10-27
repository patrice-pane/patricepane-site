import type { Metadata } from "next";
import type { Entry } from "./content/index.ts";
import type { Site } from "./content/schema.ts";

// Canonical origin: the indexed URLs are on www.
export const SITE_URL = "https://www.patricepane.com";

// A page's openGraph replaces the layout's: every page sets these.
export const openGraphBase = (site: Site) => ({ locale: "fr_FR", siteName: `${site.nom_site} - ${site.metier}` });

// Metadata of a page or project: its own title and description, first image as preview.
export function entryMetadata(entry: Entry, path: string, site: Site): Metadata {
  const image = entry.images[0];
  return {
    title: entry.titre,
    description: entry.description || undefined,
    alternates: { canonical: path },
    openGraph: {
      ...openGraphBase(site),
      title: entry.titre,
      description: entry.description || undefined,
      type: "article",
      url: path,
      images: image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : [],
    },
  };
}
