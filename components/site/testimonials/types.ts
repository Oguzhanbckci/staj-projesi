export type TestimonialsVariant = "grid" | "featured";

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorTitle: string | null;
  quote: string;
  /** 1-5 arası puan (opsiyonel) — DB'de CHECK ile sınırlı, bkz.
   *  docs/VERİ-MODELİ.md. Boşsa yıldızlar hiç gösterilmez. */
  rating: number | null;
  logoPath: string | null;
}
