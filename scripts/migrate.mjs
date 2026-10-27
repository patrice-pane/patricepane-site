// One-off migration of the AWS export (../patricepane-docker/scripts/data) into content/ and public/uploads/.
// The export was checked field by field against the live site's __NEXT_DATA__ on 2026-10-27.
// Usage: node scripts/migrate.mjs [path/to/data]
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import { stringify } from "yaml";

const DATA = process.argv[2] ?? "../patricepane-docker/scripts/data";
const UPLOADS = "public/uploads";
const CONTENT = "content";
const MAX_SIDE = 2400;
const QUALITY = 85;

// Live menu order and labels (live site shows the slug; accents restored).
const PAGES = [
  { slug: "mission", titre_menu: "mission" },
  { slug: "presentation", titre_menu: "présentation" },
  { slug: "parcours", titre_menu: "parcours" },
];

// Slugs are kept as-is (indexed URLs) except this one, which has an accent: see public/_redirects.
const SLUG_RENAMES = { "renovation-maison-année-30-st-barnabe": "renovation-maison-annee-30-st-barnabe" };

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Old alts are the original filenames ("cuisine blanche.jpg"): drop the extension and extra spaces.
const altFromKey = (key) => basename(key, extname(key)).replace(/\s+/g, " ").trim();

const yamlOptions = { lineWidth: 0 };
// Same layout as Sveltia's (blank line after the front matter), so a first save only shows real edits.
const frontmatter = (data, body) => `---\n${stringify(data, yamlOptions)}---\n\n${body.endsWith("\n") ? body : `${body}\n`}`;

const usedNames = new Set();
let converted = 0;

async function convertImage(key) {
  let name = slugify(basename(key, extname(key)));
  for (let i = 2; usedNames.has(name); i++) name = `${slugify(basename(key, extname(key)))}-${i}`;
  usedNames.add(name);
  const file = `${name}.webp`;
  const target = join(UPLOADS, file);
  const exists = await stat(target).then(() => true, () => false);
  if (!exists) {
    await sharp(join(DATA, "images", key))
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(target);
    converted++;
  }
  return `/uploads/${file}`;
}

async function images(list) {
  const sorted = [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const out = [];
  for (const img of sorted) out.push({ image: await convertImage(img.key), alt: altFromKey(img.alt || img.key) });
  return out;
}

const readJson = async (file) => JSON.parse(await readFile(join(DATA, file), "utf8"));
const projects = await readJson("projects.json");
const pages = await readJson("pages.json");

await rm(join(CONTENT, "projets"), { recursive: true, force: true });
await rm(join(CONTENT, "pages"), { recursive: true, force: true });
for (const dir of [UPLOADS, join(CONTENT, "projets"), join(CONTENT, "pages"), join(CONTENT, "reglages")]) {
  await mkdir(dir, { recursive: true });
}

for (const p of [...projects].sort((a, b) => a.position - b.position)) {
  const slug = SLUG_RENAMES[p.slug] ?? p.slug;
  // Sveltia writes `order` first.
  const data = {
    order: p.position + 1,
    titre: p.title,
    description: p.description ?? "",
    images: await images(p.images),
    publie: p.state === "PUBLISHED",
  };
  await writeFile(join(CONTENT, "projets", `${slug}.md`), frontmatter(data, p.content));
}

// Page state is DRAFT in the export but all pages are live: the old site ignored it.
for (const [i, { slug, titre_menu }] of PAGES.entries()) {
  const p = pages.find((x) => x.slug === slug);
  const data = {
    order: i + 1,
    titre: p.title,
    titre_menu,
    description: p.description ?? "",
    images: await images(p.images),
    publie: true,
  };
  await writeFile(join(CONTENT, "pages", `${slug}.md`), frontmatter(data, p.content));
}

// Home: the live <title> and meta description are the "home" entry's, with a final period.
// Its image is never rendered on the live site, so it is not migrated.
const home = pages.find((x) => x.slug === "home");
await writeFile(
  join(CONTENT, "accueil.yml"),
  stringify({ titre: `${home.title}.`, description: `${home.description}.`, texte: home.content }, yamlOptions),
);

// Values hard-coded in the old Address.tsx / Title.tsx.
await writeFile(
  join(CONTENT, "reglages", "site.yml"),
  stringify(
    {
      nom_site: "Patrice Pane",
      titre: "architecte d'intérieur à marseille",
      metier: "Architecte d'intérieur",
      adresse: "6 avenue de la corse\n13007, Marseille",
      telephone: "06 29 53 56 07",
      email: "patrice.pane@gmail.com",
      instagram: "patrice_pane_",
    },
    yamlOptions,
  ),
);

console.log(`${projects.length} projets, ${PAGES.length} pages, ${usedNames.size} images (${converted} converties).`);
