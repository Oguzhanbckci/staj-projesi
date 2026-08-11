// Font ailesi, artık theme_preset'e bağımlı OLMAK ZORUNDA değil — panelden
// bağımsız seçilebilir (bkz. docs/TEMA-MIMARISI.md, "Tema Düzenleyici").
// next/font/google build-time'da sabit yüklüyor (runtime'da şartlı font
// yükleme desteklenmiyor) — bu yüzden seçenekler burada SABİT bir liste,
// serbest metin girişi değil. Her anahtarın karşılığı app/layout.tsx'te
// next/font/google ile önceden yüklenmiş olmalı.
export type FontFamilyKey = "geist-sans" | "manrope" | "inter" | "poppins" | "work-sans";

export const FONT_FAMILY_KEYS: readonly FontFamilyKey[] = [
  "geist-sans",
  "manrope",
  "inter",
  "poppins",
  "work-sans",
];

export interface FontFamilyOption {
  label: string;
  /** app/layout.tsx'te next/font/google ile tanımlanan CSS değişkeni. */
  variable: string;
}

export const FONT_FAMILY_OPTIONS: Record<FontFamilyKey, FontFamilyOption> = {
  "geist-sans": { label: "Geist Sans", variable: "var(--font-geist-sans)" },
  manrope: { label: "Manrope", variable: "var(--font-manrope)" },
  inter: { label: "Inter", variable: "var(--font-inter)" },
  poppins: { label: "Poppins", variable: "var(--font-poppins)" },
  "work-sans": { label: "Work Sans", variable: "var(--font-work-sans)" },
};

export function isFontFamilyKey(value: unknown): value is FontFamilyKey {
  return typeof value === "string" && FONT_FAMILY_KEYS.includes(value as FontFamilyKey);
}
