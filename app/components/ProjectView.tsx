import Link from "next/link";
import { getProjects, getSite, type Projet } from "@/lib/content/index.ts";
import { renderMarkdown } from "@/lib/markdown.ts";
import Address from "./Address";
import ImageCarousel from "./ImageCarousel";
import NavBar from "./NavBar";

// Project page (ProjectView.module.css on the live site). Desktop: text scrolls on the left,
// images on the right. Mobile: the carousel overlays rows 2-6, left empty in the text grid, and the
// whole page scrolls (overflow visible on both axes: hidden on one would make the other auto).
export default async function ProjectView({ projet }: { projet: Projet }) {
  const site = getSite();
  const html = await renderMarkdown(projet.body);
  // Neighbours in the home page order, wrapping around: every project links to two others.
  const projets = getProjects();
  const i = projets.findIndex((p) => p.slug === projet.slug);
  const neighbours =
    projets.length > 1
      ? [
          { label: "projet précédent", p: projets[(i - 1 + projets.length) % projets.length] },
          { label: "projet suivant", p: projets[(i + 1) % projets.length] },
        ].filter(({ p }, k, all) => k === 0 || p.slug !== all[0].p.slug)
      : [];

  return (
    <main className="main-grid">
      <div className="[grid-area:1/1/13/8] grid grid-cols-[repeat(7,8.33vw)] grid-rows-[repeat(5,8.33vh)_auto_repeat(2,8.33vh)] overflow-y-scroll overflow-x-hidden no-scrollbar max-md:[grid-area:1/1/13/13] max-md:grid-cols-[repeat(12,8.33vw)] max-md:grid-rows-[repeat(10,8.33vh)_auto_8.33vh] max-md:overflow-visible">
        <div className="navbar-grid-area">
          <NavBar />
        </div>

        <div className="[grid-area:6/2/10/7] max-md:[grid-area:8/2/13/12]">
          <article className="rich-text rich-project" dangerouslySetInnerHTML={{ __html: html }} />
          {neighbours.length > 0 && (
            <nav aria-label="Autres projets" className="mt-15 flex justify-between gap-8 max-md:flex-col max-md:gap-5">
              {neighbours.map(({ label, p }) => (
                <Link
                  key={label}
                  href={`/projet/${p.slug}`}
                  className={`group block max-w-[45%] max-md:max-w-none ${label === "projet suivant" ? "text-right max-md:text-left" : ""}`}
                >
                  <span className="block text-xs lowercase tracking-[2px] font-extralight text-black">
                    {label === "projet suivant" ? `${label} →` : `← ${label}`}
                  </span>
                  <span className="block mt-1 text-sm leading-[20px] font-thin text-[#525252] group-hover:text-black transition-colors">
                    {p.titre}
                  </span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="[grid-area:12/1/13/7] pt-10 mb-[3vh] max-md:[grid-area:15/2/16/12]">
          <Address site={site} />
        </div>
      </div>

      {projet.images.length > 0 && (
        <div className="[grid-area:1/8/13/13] flex justify-center h-screen max-md:[grid-area:2/1/7/13] max-md:h-[41.65vh]">
          <div className="h-full w-[41.65vw] max-md:w-full">
            <ImageCarousel images={projet.images} titre={projet.titre} />
          </div>
        </div>
      )}
    </main>
  );
}
