import type { ComponentType } from "react";
import type { TestimonialItem, TestimonialsVariant } from "./types";
import { TestimonialsGrid } from "./TestimonialsGrid";
import { TestimonialsFeatured } from "./TestimonialsFeatured";

// Hero/Hizmetler/Projeler registry'leriyle aynı ilke.
export const TESTIMONIALS_VARIANTS: Record<
  TestimonialsVariant,
  ComponentType<{ items: TestimonialItem[] }>
> = {
  grid: TestimonialsGrid,
  featured: TestimonialsFeatured,
};
