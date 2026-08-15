import { z } from "zod";

// Aynı ilke: saf modül, hem panel formunda hem sunucu eyleminde kullanılır
// (bkz. lib/validation/service.ts). `ctaLink`/`secondaryCtaLink` BİLEREK
// `z.url()` DEĞİL — Hero'nun CTA'sı çoğu zaman iç bir çapaya (ör.
// "#iletisim") ya da göreli bir yola (ör. "/iletisim") gider, bunlar
// `z.url()` için geçersizdir (bkz. lib/validation/project.ts'teki
// `liveUrl` alanı — o gerçekten DIŞ bir adres olduğu için `z.url()`
// kullanıyor, buradaki durum farklı).
const linkField = z
  .string()
  .trim()
  .max(200, { error: "Bağlantı en fazla 200 karakter olabilir." })
  .optional()
  .or(z.literal(""));

export const HERO_VARIANTS = ["a", "b"] as const;

export const heroFormSchema = z.object({
  variant: z.enum(HERO_VARIANTS, { error: "Lütfen bir görünüm seçin." }),

  title: z
    .string({ error: "Başlık zorunludur." })
    .trim()
    .min(2, { error: "Başlık en az 2 karakter olmalıdır." })
    .max(120, { error: "Başlık en fazla 120 karakter olabilir." }),

  subtitle: z
    .string()
    .trim()
    .max(300, { error: "Alt başlık en fazla 300 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  ctaText: z
    .string()
    .trim()
    .max(40, { error: "Buton metni en fazla 40 karakter olabilir." })
    .optional()
    .or(z.literal("")),
  ctaLink: linkField,

  secondaryCtaText: z
    .string()
    .trim()
    .max(40, { error: "İkinci buton metni en fazla 40 karakter olabilir." })
    .optional()
    .or(z.literal("")),
  secondaryCtaLink: linkField,
});

export type HeroFormValues = z.infer<typeof heroFormSchema>;

export const HERO_FIELD_LABELS: Record<keyof HeroFormValues, string> = {
  variant: "Görünüm",
  title: "Başlık",
  subtitle: "Alt Başlık",
  ctaText: "Buton Metni",
  ctaLink: "Buton Bağlantısı",
  secondaryCtaText: "İkinci Buton Metni",
  secondaryCtaLink: "İkinci Buton Bağlantısı",
};
