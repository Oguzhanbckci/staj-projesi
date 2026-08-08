export type TestimonialsVariant = "grid" | "featured";

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorTitle: string | null;
  quote: string;
  logoPath: string | null;
}
