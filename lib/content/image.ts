// Client-safe image helpers (lib/content/index.ts reads the filesystem and is server-only).

export type Image = { src: string; alt: string; width: number; height: number };

// Width/height ratio, for `sizes` attributes computed from a height (carousels are height-bound).
export const ratio = ({ width, height }: Image) => (width / height).toFixed(3);
