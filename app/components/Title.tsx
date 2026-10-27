import type { Site } from "@/lib/content/schema.ts";

export default function Title({ site }: { site: Site }) {
  return (
    <div>
      <h2 className="m-0 mr-[3px] md:mr-0 font-display text-[38px] leading-[34px] tracking-[6px] md:text-[68px] md:leading-[60px] md:tracking-[12px] font-normal text-right uppercase">
        {site.nom_site}
      </h2>
      <h1 className="m-0 text-sm tracking-[5px] md:text-[18px] md:tracking-[12px] font-light text-right">
        {site.titre}
      </h1>
    </div>
  );
}
