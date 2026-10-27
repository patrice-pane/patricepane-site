// Build-time access to content/ (written by Sveltia CMS). Every file is validated
// against lib/content/schema.ts and the build fails on the first invalid one.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { imageSize } from "image-size";
import { parse } from "yaml";
import { z } from "zod";
import { accueilSchema, pageSchema, projetSchema, siteSchema, type ImageRef } from "./schema.ts";

const CONTENT = join(process.cwd(), "content");
const PUBLIC = join(process.cwd(), "public");

// Page slugs live at the root of the site: they must not shadow other routes.
const RESERVED_SLUGS = new Set(["projet", "admin", "uploads", "_next", "404", "index", "sitemap.xml", "robots.txt"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type Image = { src: string; alt: string; width: number; height: number };

export type Entry = {
  slug: string;
  titre: string;
  description: string;
  images: Image[];
  order?: number;
  // Markdown, rendered through renderMarkdown() (sanitized).
  body: string;
};
export type Projet = Entry;
export type Page = Entry & { titre_menu: string };

function validate<S extends z.ZodType>(schema: S, data: unknown, file: string): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Contenu invalide : ${file}\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

function readYaml(file: string): unknown {
  return parse(readFileSync(join(CONTENT, file), "utf8"));
}

// gray-matter's bundled YAML parser is older than the one used everywhere else: use `yaml` for both.
function readMarkdown(file: string) {
  return matter(readFileSync(join(CONTENT, file), "utf8"), { engines: { yaml: (s) => parse(s) ?? {} } });
}

function withSize({ image, alt }: ImageRef, file: string): Image {
  let size;
  try {
    size = imageSize(readFileSync(join(PUBLIC, image)));
  } catch (error) {
    throw new Error(`Image introuvable ou illisible : ${image} (dans ${file})`, { cause: error });
  }
  if (!size.width || !size.height) throw new Error(`Dimensions inconnues : ${image} (dans ${file})`);
  return { src: image, alt, width: size.width, height: size.height };
}

const byOrder = (a: { titre: string; order?: number }, b: { titre: string; order?: number }) =>
  (a.order ?? Infinity) - (b.order ?? Infinity) || a.titre.localeCompare(b.titre, "fr");

type EntryData = { titre: string; images: ImageRef[]; publie: boolean; order?: number };

function readFolder<T extends EntryData>(folder: string, schema: z.ZodType<T>) {
  return readdirSync(join(CONTENT, folder))
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const file = `${folder}/${name}`;
      const slug = name.slice(0, -".md".length);
      if (!SLUG.test(slug)) throw new Error(`Nom de fichier invalide (minuscules, chiffres, tirets) : ${file}`);
      const { data, content } = readMarkdown(file);
      const { images, ...fields } = validate(schema, data, file);
      return { ...fields, slug, body: content, images: images.map((img) => withSize(img, file)) };
    })
    .filter((entry) => entry.publie)
    .map(({ publie: _, ...entry }) => entry)
    .sort(byOrder);
}

let cache: { projets: Projet[]; pages: Page[] } | undefined;

function load() {
  if (cache) return cache;
  const projets = readFolder("projets", projetSchema);
  const pages = readFolder("pages", pageSchema);
  for (const { slug } of pages) {
    if (RESERVED_SLUGS.has(slug)) throw new Error(`Slug de page réservé : content/pages/${slug}.md`);
  }
  cache = { projets, pages };
  return cache;
}

export const getProjects = (): Projet[] => load().projets;
export const getProject = (slug: string): Projet | undefined => load().projets.find((p) => p.slug === slug);
export const getPages = (): Page[] => load().pages;
export const getPage = (slug: string): Page | undefined => load().pages.find((p) => p.slug === slug);
export const getAccueil = () => validate(accueilSchema, readYaml("accueil.yml"), "accueil.yml");
export const getSite = () => validate(siteSchema, readYaml("reglages/site.yml"), "reglages/site.yml");
