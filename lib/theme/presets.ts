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
    // Koyu mod marka rengi 2026-08-18'de ÜÇ KEZ değişti: #6998e2 →
    // #5b9bff (canlandırma) → #c36628 (turuncu, "koyu zeminde mavi çok
    // boğuyor" geri bildirimi) → #3b82c4 (yeni tam palet denemesi, AYNI
    // GÜN — kullanıcı kendi turuncu kararını yeni paletle bilerek
    // geçersiz kılıyor, bu eski #5b9bff'ten farklı, daha doygun bir mavi).
    // Açık tema da bu denemede #2561c1 → #2563a8 (küçük fark). KISITLAR:
    // turuncu/amber uyarı rengine ayrılmıştı kararı (TASARIM-SISTEMI.md
    // madde 1.1) burada ikinci kez gevşetiliyor — kullanıcı "bu haliyle
    // devam ederim ya da eskiye dönerim" diyerek deneme olarak istedi.
    // Kontrast: #3b82c4, koyu surface/surface-raised'e karşı 4.26:1 /
    // 3.56:1 — 4.5:1 gövde-metni eşiğinin hafif altında ama 3:1 büyük-
    // metin/UI eşiğini rahat geçiyor (marka rengi çoğunlukla buton
    // dolgusu gibi büyük öğelerde kullanılıyor, aynı durum eskiden
    // turuncu için de geçerliydi). brandOn siyah kaldı (4.26:1, beyazdan
    // — 4.06:1 — az farkla daha iyi).
    brand: { light: "#2563a8", dark: "#3b82c4" },
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
