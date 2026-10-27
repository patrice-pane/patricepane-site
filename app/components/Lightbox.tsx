"use client";

import { useEffect, useRef, useState } from "react";
import ExportedImage from "next-image-export-optimizer";
import type { Image } from "@/lib/content/index.ts";

const button =
  "absolute z-10 w-12 h-12 flex items-center justify-center rounded-full text-white transition-colors hover:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer";

// Fullscreen image. Arrows or ← → to navigate, ESC / ✕ / click outside to close.
export default function Lightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: Image[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = images[index];
  const hasPrevious = index > 0;
  const hasNext = index < images.length - 1;

  useEffect(() => setLoading(true), [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && hasPrevious) onChange(index - 1);
      else if (e.key === "ArrowRight" && hasNext) onChange(index + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, hasPrevious, hasNext, onChange, onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previousFocus?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-[fadeIn_0.2s_ease-in-out]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Image en plein écran"
    >
      <button ref={closeRef} onClick={onClose} className={`${button} top-4 right-4`} aria-label="Fermer">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
          <path d="M18 6L6 18M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {hasPrevious && (
        <button
          onClick={() => onChange(index - 1)}
          className={`${button} left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70`}
          aria-label="Image précédente"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
            <path d="M15 18L9 12L15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {hasNext && (
        <button
          onClick={() => onChange(index + 1)}
          className={`${button} right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70`}
          aria-label="Image suivante"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-current" aria-hidden>
            <path d="M9 18L15 12L9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <ExportedImage
          key={image.src}
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          sizes="95vw"
          placeholder="empty"
          className="max-w-full max-h-[95vh] w-auto h-auto object-contain"
          onLoad={() => setLoading(false)}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
