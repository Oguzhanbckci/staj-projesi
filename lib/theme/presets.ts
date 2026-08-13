// İki hazır tema ön ayarı — ileride panelden seçilecek (bkz.
// supabase/migrations/20260808120000_add_theme_preset_to_site_settings.sql,
// docs/TEMA-MIMARISI.md). Her preset, açık/koyu temanın her ikisinde de
// WCAG AA (≥4.5:1) doğrulanmış bir marka rengi çifti + kendi köşe
// yarıçapı ölçeği + kendi font'unu taşır. Yeni bir preset eklemek için
// docs/TEMA-MIMARISI.md "Yeni tema nasıl eklenir" bölümüne bakın.

export type ThemePresetKey = "kurumsal-mavi" | "modern-koyu";

export const DEFAULT_THEME_PRESET: ThemePresetKey = "kurumsal-mavi";

export const THEME_PRESET_KEYS: readonly ThemePresetKey[] = [
  "kurumsal-mavi",
  "modern-koyu",
];

interface ThemePreset {
  label: string;
  /** Açık/koyu temada kullanılacak marka rengi — her ikisi de ≥4.5:1 doğrulandı. */
  brand: { light: string; dark: string };
  /** Marka rengi dolgusu üzerindeki metin/ikon rengi. */
  brandOn: { light: string; dark: string };
  /** app/globals.css'teki --radius-sm/md/lg/xl'i override eder. */
  radius: { sm: string; md: string; lg: string; xl: string };
  /** app/layout.tsx'te next/font ile önceden yüklenmiş bir --font-* değişkenine referans. */
  fontVariable: string;
}

export const THEME_PRESETS: Record<ThemePresetKey, ThemePreset> = {
  "kurumsal-mavi": {
    label: "Kurumsal Mavi",
    // Koyu mod marka rengi 2026-08-18'de #6998e2 → #5b9bff'e canlandırıldı
    // (kullanıcı bulgusu: eski ton koyu temada "soluk/donuk" duruyordu) —
    // yeni ton hem daha doygun hem kontrastı YÜKSELTTİ (5.55-6.36:1,
    // eskisinden daha güçlü), WCAG AA hâlâ geçiyor.
    brand: { light: "#2561c1", dark: "#5b9bff" },
    brandOn: { light: "#ffffff", dark: "#16191d" },
    radius: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" },
    fontVariable: "var(--font-geist-sans)",
  },
  "modern-koyu": {
    label: "Modern Koyu",
    // Aynı gerekçeyle #24a8a4 → #2bd1c9 (bkz. yukarıdaki not).
    brand: { light: "#166966", dark: "#2bd1c9" },
    brandOn: { light: "#ffffff", dark: "#16191d" },
    radius: { sm: "0.375rem", md: "0.75rem", lg: "1.25rem", xl: "1.75rem" },
    fontVariable: "var(--font-manrope)",
  },
};
