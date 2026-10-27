import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageView from "@/app/components/PageView";
import { getPage, getPages, getSite } from "@/lib/content/index.ts";
import { entryMetadata } from "@/lib/metadata.ts";
import { entryJsonLd, jsonLdScript } from "@/lib/structured-data.ts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPages().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage((await params).slug);
  return page ? entryMetadata(page, `/${page.slug}`, getSite()) : {};
}

export default async function Page({ params }: Props) {
  const page = getPage((await params).slug);
  if (!page) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(entryJsonLd(page, `/${page.slug}`, "page")) }}
      />
      <PageView page={page} />
    </>
  );
}
