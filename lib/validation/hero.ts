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

// 2026-08-21: `variant` alanı bu şemadan ÇIKARILDI. Hero görünümü iki
// ayrı kolonda tutuluyordu (`hero_sections.variant` ve
// `page_sections.variant`) ve render tarafında page_sections KOŞULSUZ
// kazanıyordu (bkz. components/site/hero/HeroSection.tsx). Hem Akme
// migration'ı hem yeni müşteri şablonu hero satırını variant dolu
// seed'lediği için hero_sections.variant HİÇBİR ZAMAN devreye girmiyordu:
// panel bir değer alıyor, DB'ye yazıyor, "kaydedildi" diyor ve değerin
// sonuca sıfır etkisi oluyordu. Varyant seçimi artık tek yerde — Sayfa
// Düzeni ekranında, 5 bölümün hepsi için aynı şemalı arayüzle.
export const heroFormSchema = z.object({
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
