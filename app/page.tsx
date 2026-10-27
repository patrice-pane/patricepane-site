import type { Metadata } from "next";
import ProjectsView from "@/app/components/ProjectsView";
import { getAccueil, getProjects, getSite } from "@/lib/content/index.ts";
import { openGraphBase } from "@/lib/metadata.ts";
import { businessJsonLd, jsonLdScript } from "@/lib/structured-data.ts";

export function generateMetadata(): Metadata {
  const { titre, description } = getAccueil();
  const cover = getProjects()[0]?.images[0];
  return {
    title: titre,
    description: description || undefined,
    alternates: { canonical: "/" },
    openGraph: {
      ...openGraphBase(getSite()),
      title: titre,
      description: description || undefined,
      type: "website",
      url: "/",
      images: cover ? [{ url: cover.src, width: cover.width, height: cover.height }] : [],
    },
  };
}

export default function Home() {
  const jsonLd = businessJsonLd(getSite(), getAccueil(), getProjects()[0]?.images[0]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <ProjectsView />
    </>
  );
}
