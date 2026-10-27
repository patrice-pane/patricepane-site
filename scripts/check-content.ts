// Loads and validates everything under content/, then lists it. Fails like the build would.
// Usage: npm run content
import { getAccueil, getPages, getProjects, getSite } from "../lib/content/index.ts";
import { renderMarkdown } from "../lib/markdown.ts";

const site = getSite();
const accueil = getAccueil();
const projets = getProjects();
const pages = getPages();

console.log(`Site : ${site.nom_site}, ${site.titre}`);
console.log(`Accueil : ${accueil.titre} (${(await renderMarkdown(accueil.texte)).length} car. HTML)`);
console.log(`\nProjets (${projets.length}) :`);
for (const p of projets) console.log(`  ${p.order ?? "-"}. ${p.slug} — ${p.images.length} images`);
console.log(`\nPages (${pages.length}) :`);
for (const p of pages) console.log(`  ${p.order ?? "-"}. ${p.slug} « ${p.titre_menu} » — ${p.images.length} image(s)`);
