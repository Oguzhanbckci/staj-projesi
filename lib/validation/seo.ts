import { z } from "zod";

export const seoSettingsFormSchema = z.object({
  seoTitle: z
    .string()
    .trim()
    .max(200, { error: "Sayfa başlığı en fazla 200 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  seoDescription: z
    .string()
    .trim()
    .max(500, { error: "Açıklama en fazla 500 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  seoKeywords: z
    .string()
    .trim()
    .max(300, { error: "Anahtar kelimeler en fazla 300 karakter olabilir." })
    .optional()
    .or(z.literal("")),
});

export type SeoSettingsFormValues = z.infer<typeof seoSettingsFormSchema>;
