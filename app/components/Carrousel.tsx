"use client";

import { useRef } from "react";
import Link from "next/link";
import ExportedImage from "next-image-export-optimizer";
import type { Image } from "@/lib/content/index.ts";
import { useDragScroll } from "./useDragScroll";

export type CarrouselItem = { href: string; titre: string; image?: Image };

// Home carousel: the cover image of each project, linking to it.
export default function Carrousel({ items }: { items: CarrouselItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useDragScroll(ref, { horizontalWheel: true });

  return (
    <div ref={ref} className="h-[33vh] w-full flex gap-[3px] md:gap-[5px] overflow-x-auto no-scrollbar select-none">
      {items.map(({ href, titre, image }, index) => (
        <Link
          key={href}
          href={href}
          className="h-full shrink-0 transition-opacity duration-[750ms] hover:opacity-60"
          draggable={false}
        >
          {image ? (
            <ExportedImage
              src={image.src}
              width={image.width}
              height={image.height}
              alt={titre}
              sizes="(max-width: 900px) 70vw, 30vw"
              className="h-full w-auto"
              draggable={false}
              priority={index < 3}
            />
          ) : (
            // A project without images stays reachable.
            <span className="h-full w-[20vh] p-4 flex items-center bg-gray-100 text-sm font-extralight text-[#525252]">
              {titre}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
