import type { SectionKey } from "./config";
import type { HeroVariant } from "@/components/site/hero/types";
import type { ServiceCardVariant } from "@/components/site/services/types";
import type { GalleryVariant } from "@/components/site/projects/types";
import type { TestimonialsVariant } from "@/components/site/testimonials/types";
import type { FaqVariant } from "@/components/site/faqs/types";

export interface SectionVariantOption {
  key: string;
  /** Müşteri dilinde, teknik anahtar DEĞİL (KISITLAR). */
  label: string;
  /** VariantPicker'da diyagramın altında, 1 cümlelik ayrım. */
  description: string;
}

// Panelin "Sayfa Düzeni" ekranı için TEK doğruluk kaynağı — hem UI (hangi
// kartlar gösterilecek) hem sunucu eylemi (isValidVariantForSection ile
// yazma öncesi whitelist) buradan okur. Her dizinin İLK elemanı, ilgili
// Section bileşeninin GERÇEK runtime varsayılanıyla (bkz. HeroSection.tsx/
// ServicesSection.tsx/ProjectsSection.tsx/TestimonialsSection.tsx/
// FaqsSection.tsx'teki fallback'ler) BİREBİR aynı sırada — variant=null
// olan bir kayıtta panelin "şu an fiilen ne gösteriliyor"u doğru
// yansıtabilmesi için bilerek böyle. `key` alanları `satisfies` ile
// ilgili bölümün kendi varyant tipine karşı denetleniyor — registry.ts'teki
// varyant tanımları değişirse burada derleme hatası alınır.
//
// Sadece 5 bölüm burada VAR (Partial) — diğer 5'i (about/stats/team/cta/
// contact) kasıtlı olarak yok, o bileşenler hiç `variant` prop'u almıyor
// (bkz. docs/KARAR-GUNLUGU.md, 2026-08-15).
export const SECTION_VARIANT_OPTIONS: Partial<Record<SectionKey, SectionVariantOption[]>> = {
  hero: [
    {
      key: "a" satisfies HeroVariant,
      label: "Tam Ekran Görsel",
      description: "Arka planda tam genişlik görsel, ortalanmış başlık.",
    },
    {
      key: "b" satisfies HeroVariant,
      label: "İki Kolonlu",
      description: "Solda başlık ve metin, sağda görsel.",
    },
  ],
  services: [
    {
      key: "icon" satisfies ServiceCardVariant,
      label: "İkonlu Kart",
      description: "Sade kart: ikon, başlık ve açıklama.",
    },
    {
      key: "image" satisfies ServiceCardVariant,
      label: "Görselli Kart",
      description: "Üstte büyük görsel, altında metin.",
    },
  ],
  projects: [
    {
      key: "grid" satisfies GalleryVariant,
      label: "Izgara",
      description: "Eşit boyutlu kartlar, düzenli sıralar.",
    },
    {
      key: "mosaic" satisfies GalleryVariant,
      label: "Mozaik",
      description: "Bazı projeler daha büyük ve öne çıkan gösterilir.",
    },
  ],
  testimonials: [
    {
      key: "grid" satisfies TestimonialsVariant,
      label: "Izgara",
      description: "Yorum kartları yan yana ve alt alta.",
    },
    {
      key: "featured" satisfies TestimonialsVariant,
      label: "Öne Çıkan",
      description: "Tek büyük alıntı, ok butonlarıyla gezinme.",
    },
  ],
  faq: [
    {
      key: "single" satisfies FaqVariant,
      label: "Tek Sütun",
      description: "Sorular alt alta tek liste hâlinde.",
    },
    {
      key: "two-column" satisfies FaqVariant,
      label: "İki Sütun",
      description: "Sorular iki sütuna yayılır.",
    },
  ],
};

export function getSectionVariantOptions(sectionKey: SectionKey): SectionVariantOption[] {
  return SECTION_VARIANT_OPTIONS[sectionKey] ?? [];
}

// Sunucu eyleminin (updateSectionVariantAction) yazmadan önce çağırdığı
// tek whitelist kontrolü — KABUL KRİTERİ: "geçersiz bir varyant seçilemesin".
export function isValidVariantForSection(sectionKey: SectionKey, value: string): boolean {
  const options = SECTION_VARIANT_OPTIONS[sectionKey];
  if (!options) return false;
  return options.some((option) => option.key === value);
}
