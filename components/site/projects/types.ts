import type { ProjectStatus } from "@/lib/validation/projectFields";

// Izgara düzeni (eşit yükseklikli) ve mozaik düzeni (değişen kart
// boyutları) — bkz. registry.ts.
export type GalleryVariant = "grid" | "mosaic";

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  city: string | null;
  year: number | null;
  category: string | null;
  status: ProjectStatus | null;
  coverPath: string | null;
  liveUrl: string | null;
}
