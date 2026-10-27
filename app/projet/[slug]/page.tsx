import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectView from "@/app/components/ProjectView";
import { getProject, getProjects, getSite } from "@/lib/content/index.ts";
import { entryMetadata } from "@/lib/metadata.ts";
import { entryJsonLd, jsonLdScript } from "@/lib/structured-data.ts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const projet = getProject((await params).slug);
  return projet ? entryMetadata(projet, `/projet/${projet.slug}`, getSite()) : {};
}

export default async function ProjectPage({ params }: Props) {
  const projet = getProject((await params).slug);
  if (!projet) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(entryJsonLd(projet, `/projet/${projet.slug}`, "projet")) }}
      />
      <ProjectView projet={projet} />
    </>
  );
}
