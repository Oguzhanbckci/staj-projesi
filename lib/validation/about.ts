import { z } from "zod";

// Aynı ilke: saf modül, hem panel formunda hem sunucu eyleminde kullanılır
// (bkz. lib/validation/project.ts, `year` alanıyla aynı desen). DB'deki
// check kısıtı 1800-2100 (bkz. docs/VERİ-MODELİ.md) — burada da aynı
// aralık tekrarlanıyor, şema DB'nin izin verdiğinden DAHA GEVŞEK olamaz.
export const aboutFormSchema = z.object({
  title: z
    .string({ error: "Başlık zorunludur." })
    .trim()
    .min(2, { error: "Başlık en az 2 karakter olmalıdır." })
    .max(120, { error: "Başlık en fazla 120 karakter olabilir." }),

  description: z
    .string()
    .trim()
    .max(1000, { error: "Açıklama en fazla 1000 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  foundedYear: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, { error: "Kuruluş yılı 4 haneli bir sayı olmalıdır." })
    .refine((value) => value === "" || (Number(value) >= 1800 && Number(value) <= 2100), {
      error: "Kuruluş yılı 1800-2100 arasında olmalıdır.",
    })
    .optional()
    .or(z.literal("")),

  // `about_sections.core_values` gerçek bir `text[]` kolonu (bkz.
  // docs/VERİ-MODELİ.md) — burada tek bir textarea'da SATIR SATIR girilir,
  // sunucu eylemi (icerikler/hakkimizda/actions.ts) satırlara bölüp
  // diziye çevirir (service_areas'ın virgülle bölünmesinden FARKLI bir
  // ayraç — kısa cümleler içerebildiği için virgül burada belirsiz olurdu).
  coreValues: z
    .string()
    .trim()
    .max(1000, { error: "Değerler alanı en fazla 1000 karakter olabilir." })
    .optional()
    .or(z.literal("")),
});

export type AboutFormValues = z.infer<typeof aboutFormSchema>;
