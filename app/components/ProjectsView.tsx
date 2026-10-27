import { getAccueil, getProjects, getSite } from "@/lib/content/index.ts";
import { renderMarkdown } from "@/lib/markdown.ts";
import Address, { Insta } from "./Address";
import Carrousel from "./Carrousel";
import NavBar from "./NavBar";
import Title from "./Title";

// Home page (ProjectsView.module.css on the live site).
export default async function ProjectsView() {
  const site = getSite();
  const html = await renderMarkdown(getAccueil().texte);
  const items = getProjects().map((p) => ({ href: `/projet/${p.slug}`, titre: p.titre, image: p.images[0] }));

  return (
    <main className="main-grid">
      <div className="navbar-grid-area">
        <NavBar current="/" />
        <Insta site={site} size={26} color="black" className="hidden max-md:block my-[7px] mr-[7px] h-fit" />
      </div>

      <div className="[grid-area:3/2/5/12] -mr-3 flex flex-col justify-center items-end max-md:[grid-area:3/3/5/12] max-md:m-0">
        <Title site={site} />
      </div>

      <div className="[grid-area:7/1/11/13] max-md:[grid-area:6/1/10/13]">
        <Carrousel items={items} />
      </div>

      <div className="[grid-area:12/1/13/13] mr-[30px] flex flex-col justify-center max-md:[grid-area:11/1/12/12] max-md:mr-[7px]">
        <Address site={site} isHome />
      </div>

      {html && (
        <article
          className="rich-text rich-home [grid-area:13/6/14/12] mt-[50px] p-10 bg-[#f9f9f9] rounded-lg max-md:[grid-area:13/1/14/13]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </main>
  );
}
