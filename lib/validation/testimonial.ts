import { z } from "zod";

// lib/validation/service.ts ile aynı ilke: saf modül, panel formunda VE
// sunucu eyleminde (app/panel/(protected)/icerikler/referanslar/actions.ts)
// AYNI şema kullanılır.
export const testimonialFormSchema = z.object({
  authorName: z
    .string({ error: "Ad Soyad zorunludur." })
    .trim()
    .min(2, { error: "Ad Soyad en az 2 karakter olmalıdır." })
    .max(120, { error: "Ad Soyad en fazla 120 karakter olabilir." }),

  authorTitle: z
    .string()
    .trim()
    .max(120, { error: "Unvan/Firma en fazla 120 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  quote: z
    .string({ error: "Yorum metni zorunludur." })
    .trim()
    .min(10, { error: "Yorum en az 10 karakter olmalıdır." })
    .max(1000, { error: "Yorum en fazla 1000 karakter olabilir." }),

  // 1-5 arası, opsiyonel — DB'de var (testimonials.rating) ama ziyaretçi
  // sitesinde şu an gösterilmiyor (bkz. components/site/testimonials/
  // types.ts). Select'ten string olarak gelir, action içinde Number'a
  // çevrilir (year alanındaki aynı kalıp, bkz. lib/validation/project.ts).
  rating: z
    .string()
    .trim()
    .regex(/^[1-5]?$/, { error: "Puan 1 ile 5 arasında olmalıdır." })
    .optional()
    .or(z.literal("")),

  isPublished: z.boolean(),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export const TESTIMONIAL_FIELD_LABELS: Record<keyof TestimonialFormValues, string> = {
  authorName: "Ad Soyad",
  authorTitle: "Unvan / Firma",
  quote: "Yorum",
  rating: "Puan",
  isPublished: "Yayın Durumu",
};
