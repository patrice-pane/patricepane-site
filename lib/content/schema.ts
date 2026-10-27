import { z } from "zod";

// Mirrors public/admin/config.yml (Sveltia CMS). Keep both in sync whenever the
// content model changes: `npm run test:cms` checks them against each other.
// Objects are strict so a field the CMS writes but the site ignores fails the build.

// Sveltia may write an empty optional field as null or omit it.
const optionalText = z
  .string()
  .nullish()
  .transform((v) => v ?? "");

export const imageSchema = z.strictObject({
  image: z.string().regex(/^\/uploads\/[^/]+$/, "chemin attendu : /uploads/<fichier>"),
  alt: optionalText,
});

const entryFields = {
  titre: z.string().min(1),
  // Short text for SEO and link previews.
  description: optionalText,
  // List order is the display order; the first image is the cover.
  images: z.array(imageSchema).nullish().transform((v) => v ?? []),
  publie: z.boolean().default(true),
  // Written by Sveltia's drag & drop (reorder: true), starts at 1.
  order: z.number().int().optional(),
};

export const projetSchema = z.strictObject(entryFields);

export const pageSchema = z.strictObject({
  ...entryFields,
  // Menu label.
  titre_menu: z.string().min(1),
});

export const accueilSchema = z.strictObject({
  // <title> and meta description of the home page.
  titre: z.string().min(1),
  description: optionalText,
  // Markdown, rendered through renderMarkdown() (sanitized).
  texte: optionalText,
});

export const siteSchema = z.strictObject({
  nom_site: z.string().min(1),
  // Tagline under the name on the home page.
  titre: z.string().min(1),
  // Shown under the name in the footer of other pages.
  metier: z.string().min(1),
  // May span several lines; line breaks are kept.
  adresse: z.string().min(1),
  telephone: z.string().min(1),
  email: z.email(),
  // Username only, without @.
  instagram: z.string().regex(/^[A-Za-z0-9._]+$/, "nom d'utilisateur sans @"),
});

export type ImageRef = z.infer<typeof imageSchema>;
export type Accueil = z.infer<typeof accueilSchema>;
export type Site = z.infer<typeof siteSchema>;
