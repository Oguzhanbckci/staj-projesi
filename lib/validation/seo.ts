import { z } from "zod";

// KISITLAR: "sınır aşılınca uyar" — "engelle" DEĞİL. Google'ın fiili
// kesme noktalarına yakın YUMUŞAK sınırlar (60/160) sadece UI'da
// (SeoEditor.tsx'teki karakter sayacı) görsel bir uyarı olarak uygulanır.
// Buradaki zod max'ları çok daha yüksek, SERT bir üst tavan — kötüye
// kullanım/DB şişmesine karşı, gerçek SEO pratiğini kısıtlamak için değil
// (uzun bir başlık hata VERMEZ, sadece arama sonucunda kesilir).
export const SEO_TITLE_RECOMMENDED_MAX = 60;
export const SEO_DESCRIPTION_RECOMMENDED_MAX = 160;

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

export const SEO_FIELD_LABELS: Record<keyof SeoSettingsFormValues, string> = {
  seoTitle: "Sayfa Başlığı",
  seoDescription: "Açıklama",
  seoKeywords: "Anahtar Kelimeler",
};
