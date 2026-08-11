// Köşe yarıçapı, artık theme_preset'e bağımlı OLMAK ZORUNDA değil — panelden
// bağımsız bir "ölçek" seçilebilir (bkz. docs/TEMA-MIMARISI.md, "Tema
// Düzenleyici"). "dengeli"/"yuvarlak" mevcut kurumsal-mavi/modern-koyu
// preset'lerinin ZATEN elle doğrulanmış radius değerleriyle birebir aynı
// (bkz. lib/theme/presets.ts) — tekrar icat edilmedi. "keskin" yeni, üçüncü
// bir seçenek.
export type BorderRadiusScaleKey = "keskin" | "dengeli" | "yuvarlak";

export const BORDER_RADIUS_SCALE_KEYS: readonly BorderRadiusScaleKey[] = [
  "keskin",
  "dengeli",
  "yuvarlak",
];

export interface BorderRadiusScale {
  label: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export const BORDER_RADIUS_SCALES: Record<BorderRadiusScaleKey, BorderRadiusScale> = {
  keskin: {
    label: "Keskin (minimal yuvarlama)",
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.375rem",
    xl: "0.5rem",
  },
  dengeli: {
    label: "Dengeli (varsayılan)",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  yuvarlak: {
    label: "Yuvarlak",
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1.25rem",
    xl: "1.75rem",
  },
};

export function isBorderRadiusScaleKey(value: unknown): value is BorderRadiusScaleKey {
  return typeof value === "string" && BORDER_RADIUS_SCALE_KEYS.includes(value as BorderRadiusScaleKey);
}
