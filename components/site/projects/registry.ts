import type { ComponentType } from "react";
import type { GalleryVariant, ProjectItem } from "./types";
import { ProjectsGridLayout } from "./ProjectsGridLayout";
import { ProjectsMosaicLayout } from "./ProjectsMosaicLayout";

interface GalleryProps {
  projects: ProjectItem[];
}

// Hero/Hizmetler registry'leriyle aynı ilke — galeri düzeni seçimi tek burada.
export const GALLERY_VARIANTS: Record<GalleryVariant, ComponentType<GalleryProps>> = {
  grid: ProjectsGridLayout,
  mosaic: ProjectsMosaicLayout,
};
