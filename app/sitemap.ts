import type { MetadataRoute } from "next";
import { getPages, getProjects, type Entry } from "@/lib/content/index.ts";
import { lastModified } from "@/lib/git-dates.ts";
import { SITE_URL } from "@/lib/metadata.ts";

export const dynamic = "force-static";

// Each entry lists its photos (Google Images) and, when git history is available, the date of its
// last change. The home page shows every project, so it changes with any of them.
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, e: Entry, file: string) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastModified(file),
    images: e.images.map((i) => `${SITE_URL}${i.src}`),
  });
  const projets = getProjects();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: lastModified("content/accueil.yml", "content/projets", "content/reglages"),
      images: projets.flatMap((p) => p.images.slice(0, 1)).map((i) => `${SITE_URL}${i.src}`),
    },
    ...getPages().map((p) => entry(`/${p.slug}`, p, `content/pages/${p.slug}.md`)),
    ...projets.map((p) => entry(`/projet/${p.slug}`, p, `content/projets/${p.slug}.md`)),
  ];
}
