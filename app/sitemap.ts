import type { MetadataRoute } from "next";
import { getPages, getProjects } from "@/lib/content/index.ts";
import { SITE_URL } from "@/lib/metadata.ts";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    ...getPages().map((p) => ({ url: `${SITE_URL}/${p.slug}` })),
    ...getProjects().map((p) => ({ url: `${SITE_URL}/projet/${p.slug}` })),
  ];
}
