// Izgara düzeni (eşit yükseklikli) ve mozaik düzeni (değişen kart
// boyutları) — bkz. registry.ts.
export type GalleryVariant = "grid" | "mosaic";

export interface ProjectItem {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  year: number | null;
  category: string | null;
  coverPath: string | null;
  liveUrl: string | null;
}
