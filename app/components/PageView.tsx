import ExportedImage from "next-image-export-optimizer";
import { getSite, type Page } from "@/lib/content/index.ts";
import { ratio } from "@/lib/content/image.ts";
import { renderMarkdown } from "@/lib/markdown.ts";
import Address from "./Address";
import NavBar from "./NavBar";

// Content page (PageView.module.css on the live site): title, description, first image, text.
export default async function PageView({ page }: { page: Page }) {
  const site = getSite();
  const html = await renderMarkdown(page.body);
  const image = page.images[0];

  return (
    <main className="main-grid">
      <div className="navbar-grid-area">
        <NavBar current={`/${page.slug}`} />
      </div>

      <div className="[grid-area:3/5/5/10] flex justify-end items-end max-md:[grid-area:2/2/4/12]">
        <h1 className="title-rule w-full text-[36px] font-thin max-md:text-[30px]">{page.titre}</h1>
      </div>

      {page.description && (
        <div className="[grid-area:5/5/6/10] flex justify-end items-start max-md:[grid-area:4/2/5/12]">
          <h2 className="w-full m-0 mt-2 mb-5 text-sm leading-[22px] font-extralight">{page.description}</h2>
        </div>
      )}

      {image && (
        <div className="[grid-area:6/5/11/7] mt-10 max-md:[grid-area:6/2/11/12]">
          <ExportedImage
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt || page.titre}
            // Contained in a 5-row box (41.65vh minus its 40px top margin), 10 columns wide on mobile, 2 on desktop.
            sizes={`(max-width: 900px) min(83.3vw, calc((41.65vh - 40px) * ${ratio(image)})), min(16.66vw, calc((41.65vh - 40px) * ${ratio(image)}))`}
            className="w-full h-full object-contain object-top"
            preload
            fetchPriority="high"
          />
        </div>
      )}

      <div
        className={`${image ? "[grid-area:6/7/11/10] pl-5" : "[grid-area:6/5/11/10]"} mt-10 max-md:[grid-area:12/2/13/12] max-md:pl-0`}
      >
        <article className="rich-text rich-page pb-10" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="pb-10">
          <Address site={site} />
        </div>
      </div>
    </main>
  );
}
