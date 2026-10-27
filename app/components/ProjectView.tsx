import { getSite, type Projet } from "@/lib/content/index.ts";
import { renderMarkdown } from "@/lib/markdown.ts";
import Address from "./Address";
import ImageCarousel from "./ImageCarousel";
import NavBar from "./NavBar";

// Project page (ProjectView.module.css on the live site). Desktop: text scrolls on the left,
// images on the right. Mobile: the carousel overlays rows 2-6, left empty in the text grid.
export default async function ProjectView({ projet }: { projet: Projet }) {
  const site = getSite();
  const html = await renderMarkdown(projet.body);

  return (
    <main className="main-grid">
      <div className="[grid-area:1/1/13/8] grid grid-cols-[repeat(7,8.33vw)] grid-rows-[repeat(5,8.33vh)_auto_repeat(2,8.33vh)] overflow-y-scroll overflow-x-hidden no-scrollbar max-md:[grid-area:1/1/13/13] max-md:grid-cols-[repeat(12,8.33vw)] max-md:grid-rows-[repeat(10,8.33vh)_auto_8.33vh] max-md:overflow-y-visible">
        <div className="navbar-grid-area">
          <NavBar />
        </div>

        <article
          className="rich-text rich-project [grid-area:6/2/10/7] max-md:[grid-area:8/2/13/12]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

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
