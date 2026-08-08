// Varyant adı burada bir string literal union — geçersiz bir varyant
// (ör. registry.ts'te yazım hatası) derleme zamanında yakalanır (bkz.
// registry.ts, Record<HeroVariant, ...> kullanımı).
export type HeroVariant = "a" | "b";

// hero_sections tablosunun 1:1 karşılığı — her iki varyant da AYNI veriyle
// çalışır (bkz. docs/MIMARI.md, docs/TASARIM-SISTEMI.md "Bileşen API
// Kuralları"), sadece görsel düzen değişir.
export interface HeroSectionData {
  variant: HeroVariant;
  title: string;
  subtitle: string | null;
  backgroundImagePath: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  secondaryCtaText: string | null;
  secondaryCtaLink: string | null;
}
