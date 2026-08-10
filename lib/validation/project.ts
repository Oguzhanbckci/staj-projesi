import { z } from "zod";

// Aynı ilke: saf modül, hem panel formunda hem sunucu eyleminde
// kullanılır (bkz. lib/validation/service.ts).
export const projectFormSchema = z.object({
  title: z
    .string({ error: "Başlık zorunludur." })
    .trim()
    .min(2, { error: "Başlık en az 2 karakter olmalıdır." })
    .max(120, { error: "Başlık en fazla 120 karakter olabilir." }),

  description: z
    .string()
    .trim()
    .max(500, { error: "Açıklama en fazla 500 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  category: z
    .string()
    .trim()
    .max(60, { error: "Kategori en fazla 60 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  location: z
    .string()
    .trim()
    .max(120, { error: "Konum en fazla 120 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  year: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, { error: "Yıl 4 haneli bir sayı olmalıdır." })
    .optional()
    .or(z.literal("")),

  liveUrl: z
    .url({ error: "Geçerli bir adres girin (ör. https://ornek.com)." })
    .optional()
    .or(z.literal("")),

  isPublished: z.boolean(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const PROJECT_FIELD_LABELS: Record<keyof ProjectFormValues, string> = {
  title: "Başlık",
  description: "Açıklama",
  category: "Kategori",
  location: "Konum",
  year: "Yıl",
  liveUrl: "Canlı Bağlantı",
  isPublished: "Yayın Durumu",
};
