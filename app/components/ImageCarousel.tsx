"use client";

import { useRef, useState } from "react";
import ExportedImage from "next-image-export-optimizer";
import { ratio, type Image } from "@/lib/content/image.ts";
import Lightbox from "./Lightbox";
import { useDragScroll } from "./useDragScroll";

// Project images: vertical column on desktop, horizontal strip on mobile (one DOM, switched in CSS).
// Clicking an image opens it in the lightbox.
export default function ImageCarousel({ images, titre }: { images: Image[]; titre: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  useDragScroll(ref, { horizontalWheel: true });

  return (
    <>
      <div
        ref={ref}
        role="region"
        aria-label="Galerie d'images du projet"
        className="flex gap-[3px] h-full w-full overflow-x-auto no-scrollbar select-none md:flex-col md:gap-[10px] md:overflow-x-hidden md:overflow-y-auto"
      >
        {images.map((image, index) => (
          <button
            key={image.src}
            className="shrink-0 h-full p-0 border-0 bg-transparent cursor-pointer md:h-auto md:w-full"
            onClick={() => setOpen(index)}
            aria-label={`Agrandir l'image ${index + 1}`}
          >
            <ExportedImage
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt || titre}
              // Mobile: 41.65vh high strip; desktop: 41.65vw wide column.
              sizes={`(max-width: 900px) calc(41.65vh * ${ratio(image)}), 42vw`}
              className="h-full w-auto md:w-full md:h-auto"
              draggable={false}
              preload={index === 0}
              fetchPriority={index === 0 ? "high" : undefined}
            />
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox images={images} index={open} onChange={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
