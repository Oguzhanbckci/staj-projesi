import { z } from "zod";

// Saf modül — React'e/Next.js'e bağımlı değil (bkz. lib/validation/contact.ts
// ile aynı ilke). Panel formunda (istemci, canlı hata metni) VE sunucu
// eyleminde (app/panel/(protected)/icerikler/hizmetler/actions.ts, gerçek
// doğrulama) AYNI şema kullanılır — biri diğerinden sapmaz.
export const serviceFormSchema = z.object({
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

  // Lucide ikon adı (ör. "hammer") — serbest metin, gerçek ikon
  // eşleşmesi components/site/services/icons.tsx'te; burada sadece
  // uzunluk sınırı var, ikon listesiyle çapraz doğrulama yapılmıyor
  // (bilinmeyen bir isim girilirse ServiceCardIcon zaten yedek ikona
  // düşüyor, bkz. o dosya).
  icon: z
    .string()
    .trim()
    .max(50, { error: "İkon adı en fazla 50 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  isPublished: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export const SERVICE_FIELD_LABELS: Record<keyof ServiceFormValues, string> = {
  title: "Başlık",
  description: "Açıklama",
  icon: "İkon",
  isPublished: "Yayın Durumu",
};
