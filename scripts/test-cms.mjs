// CMS coverage tests (adapted from aMu). Usage: npm run test:cms [-- --verbose]
//
// 1. Schema parity: every field of public/admin/config.yml (Sveltia) exists in
//    the Zod schema of lib/content/schema.ts (exported as JSON schema), with
//    the same nesting and "required" flags, and vice versa.
// 2. Rendering: on a throwaway copy of the project, every CMS field gets a
//    unique marker value; after `next build`, each marker must appear in out/
//    (pages, <head>, sitemap). A field whose marker is missing is never shown
//    on the site. "Publié" is checked by unpublishing an entry. The real
//    content is never touched.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parse, stringify } from "yaml";
import { z } from "zod";
import { accueilSchema, pageSchema, projetSchema, siteSchema } from "../lib/content/schema.ts";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const cms = parse(fs.readFileSync(path.join(root, "public/admin/config.yml"), "utf8"));

// CMS entry (file or folder) → Zod schema, by content path.
const SCHEMA_BY_PATH = {
  "content/projets": projetSchema,
  "content/pages": pageSchema,
  "content/accueil.yml": accueilSchema,
  "content/reglages/site.yml": siteSchema,
};
// Keys written by Sveltia itself rather than by a field (reorder: true).
const CMS_MANAGED = new Set(["order"]);

const units = cms.collections.flatMap((c) =>
  c.files
    ? c.files.map((f) => ({ label: `${c.label} → ${f.label}`, path: f.file, fields: f.fields, kind: "file" }))
    : [{ label: c.label, path: c.folder, fields: c.fields, kind: "folder" }],
);

const errors = [];
const warnings = [];

// --- 1. Schema parity -------------------------------------------------------

// Input side of the schema: what a content file may contain. Nullable lists come as anyOf.
const jsonSchema = (schema) => z.toJSONSchema(schema, { io: "input" });
const arrayOf = (p) => (p.type === "array" ? p : p.anyOf?.find((x) => x.type === "array"));

function compareFields(fields, schema, where) {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  for (const f of fields) {
    // The markdown body is the file content, not a frontmatter key.
    if (f.name === "body") continue;
    const p = props[f.name];
    const at = `${where}.${f.name}`;
    if (!p) {
      errors.push(`[schéma] ${at} : champ du CMS absent du schéma du site (le build le refuse)`);
      continue;
    }
    const cmsRequired = f.required !== false && f.widget !== "boolean";
    if (!cmsRequired && required.has(f.name)) {
      errors.push(`[schéma] ${at} : facultatif dans le CMS mais obligatoire pour le site (laisser vide casserait le build)`);
    } else if (cmsRequired && !required.has(f.name) && p.default === undefined) {
      warnings.push(`[schéma] ${at} : obligatoire dans le CMS mais facultatif pour le site`);
    }
    if (f.widget === "list") {
      const arr = arrayOf(p);
      if (!arr?.items?.properties) errors.push(`[schéma] ${at} : liste dans le CMS, pas dans le schéma`);
      else compareFields(f.fields, arr.items, `${at}[]`);
    }
  }
  // Fields the site accepts that the CMS cannot edit.
  const names = new Set(fields.map((f) => f.name));
  for (const key of Object.keys(props)) {
    if (!names.has(key) && !CMS_MANAGED.has(key)) {
      errors.push(`[schéma] ${where}.${key} : attendu par le site mais absent du CMS (impossible à modifier)`);
    }
  }
}

for (const u of units) {
  const schema = SCHEMA_BY_PATH[u.path];
  if (!schema) errors.push(`[schéma] ${u.label} (${u.path}) : aucun schéma du site ne lit ce fichier`);
  else compareFields(u.fields, jsonSchema(schema), u.path);
}
for (const p of Object.keys(SCHEMA_BY_PATH)) {
  if (!units.some((u) => u.path === p)) errors.push(`[schéma] ${p} : lu par le site mais absent du CMS`);
}

// --- 2. Rendering ------------------------------------------------------------

// Inside the project: Turbopack only resolves node_modules within its root, found by walking up.
const tmp = fs.mkdtempSync(path.join(root, ".test-cms-"));
const copy = ["app", "lib", "content", "next.config.mjs", "postcss.config.mjs", "package.json", "tsconfig.json"];
for (const item of copy) fs.cpSync(path.join(root, item), path.join(tmp, item), { recursive: true });
// public/ without the optimizer's cache; uploads are needed (image dimensions are read at build time).
fs.cpSync(path.join(root, "public"), path.join(tmp, "public"), {
  recursive: true,
  filter: (src) => !src.includes("nextImageExportOptimizer"),
});
const sampleImage = fs.readdirSync(path.join(tmp, "public/uploads")).find((f) => f.endsWith(".webp"));

let n = 0;
const checks = []; // { label, needle, present }
const marker = (label, f) => {
  const id = `ZQ${++n}ZQ`;
  // Image paths and emails are written in lowercase.
  const lower = f.widget === "image" || f.name === "email";
  checks.push({ label, needle: lower ? id.toLowerCase() : id, present: true });
  if (f.widget === "image") {
    // A real file under a marked name, so the image's own path can be found in the output.
    const file = `${id.toLowerCase()}.webp`;
    fs.copyFileSync(path.join(tmp, "public/uploads", sampleImage), path.join(tmp, "public/uploads", file));
    return `/uploads/${file}`;
  }
  if (f.name === "email") return `${id.toLowerCase()}@example.org`;
  return id;
};

// Fill every field of an object with a marker (lists get one marked item).
function fill(fields, obj, where) {
  for (const f of fields) {
    const label = `${where} → ${f.label}`;
    if (f.widget === "list") {
      const item = {};
      fill(f.fields, item, label);
      obj[f.name] = [item];
    } else if (f.widget === "boolean") {
      obj[f.name] = true;
    } else {
      obj[f.name] = marker(label, f);
    }
  }
}

const writeEntry = (dir, name, { body = "", ...data }) =>
  fs.writeFileSync(path.join(tmp, dir, `${name}.md`), `---\n${stringify(data)}---\n${body}\n`);

for (const u of units) {
  if (u.kind === "file") {
    const data = {};
    fill(u.fields, data, u.label);
    fs.writeFileSync(path.join(tmp, u.path), stringify(data));
    continue;
  }
  const entry = {};
  fill(u.fields, entry, u.label);
  writeEntry(u.path, "zz-test-complet", entry);

  // "Publié" unchecked: the entry must disappear (pages, menu, sitemap).
  const hidden = { ...entry, titre: `ZQcache${++n}ZQ`, titre_menu: `ZQcachemenu${n}ZQ`, publie: false };
  if (!("titre_menu" in entry)) delete hidden.titre_menu;
  writeEntry(u.path, `zz-test-depublie-${n}`, hidden);
  checks.push({ label: `${u.label} → Publié (décoché)`, needle: hidden.titre, present: false });
  checks.push({ label: `${u.label} → Publié (décoché), adresse`, needle: `zz-test-depublie-${n}`, present: false });
}

let built = true;
try {
  execFileSync("npx", ["next", "build"], { cwd: tmp, stdio: "pipe" });
} catch (e) {
  built = false;
  errors.push(`[rendu] le build échoue avec les valeurs de test :\n${String(e.stdout ?? "")}${String(e.stderr ?? "")}`.slice(0, 3000));
}

if (built) {
  const out = path.join(tmp, "out");
  const files = fs.readdirSync(out, { recursive: true }).filter((f) => /\.(html|xml)$/.test(f));
  const output = files.map((f) => fs.readFileSync(path.join(out, f), "utf8")).join("\n");
  for (const c of checks) c.ok = output.includes(c.needle) === c.present;
}

fs.rmSync(tmp, { recursive: true, force: true });

// --- Report -------------------------------------------------------------------

const ok = checks.filter((c) => c.ok);
const ko = checks.filter((c) => !c.ok);
console.log(`\nTest 1 – cohérence CMS ↔ schéma du site : ${errors.some((e) => e.startsWith("[schéma]")) ? "ÉCHEC" : "OK"}`);
console.log(`Test 2 – chaque champ s'affiche : ${built ? `${ok.length}/${checks.length} vérifications OK` : "ÉCHEC (build)"}`);
for (const c of ko) {
  console.log(`  ✗ ${c.label} : ${c.present ? "la valeur saisie n'apparaît nulle part sur le site" : "l'entrée reste visible alors qu'elle est dépubliée"}`);
}
for (const e of errors) console.log(`  ✗ ${e}`);
for (const w of warnings) console.log(`  ! ${w}`);
if (process.argv.includes("--verbose")) for (const c of ok) console.log(`  ✓ ${c.label}`);
process.exit(errors.length || ko.length ? 1 : 0);
