import {
  DEFAULT_THEME_PRESET,
  THEME_PRESETS,
  type ThemePresetKey,
} from "@/lib/theme/presets";

export interface SiteThemeSettings {
  themeMode: "light" | "dark";
  themePreset: ThemePresetKey;
  /** site_settings.primary_color — preset'in varsayılan marka rengini ezer. */
  primaryColor: string | null;
}

export interface ResolvedTheme {
  dataTheme: "light" | "dark";
  /** app/layout.tsx'te <html style={...}> olarak enjekte edilecek CSS özel değişkenleri. */
  styleVars: Record<string, string>;
}

/**
 * Panelden serbest girilen bir marka rengi için hızlı bir okunabilirlik
 * sezgisi (tam WCAG doğrulaması değil — bkz. docs/TASARIM-SISTEMI.md
 * madde 2). Preset'lerin kendi brandOn değerleri zaten elle doğrulanmış;
 * bu sadece tenant'ın preset dışı özel bir renk girdiği durum için devrede.
 */
function pickReadableOnColor(hex: string): string {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "#ffffff";

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const [r, g, b] = [0, 2, 4].map((i) =>
    toLinear(parseInt(clean.slice(i, i + 2), 16) / 255)
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.35 ? "#16191d" : "#ffffff";
}

export function resolveThemeTokens(input: SiteThemeSettings): ResolvedTheme {
  const preset = THEME_PRESETS[input.themePreset] ?? THEME_PRESETS[DEFAULT_THEME_PRESET];
  const mode = input.themeMode === "dark" ? "dark" : "light";
  const customBrand = input.primaryColor?.trim();

  const brand = customBrand || preset.brand[mode];
  const brandOn = customBrand ? pickReadableOnColor(brand) : preset.brandOn[mode];

  return {
    dataTheme: mode,
    styleVars: {
      "--color-brand": brand,
      "--color-brand-on": brandOn,
      "--radius-sm": preset.radius.sm,
      "--radius-md": preset.radius.md,
      "--radius-lg": preset.radius.lg,
      "--radius-xl": preset.radius.xl,
      "--font-sans": preset.fontVariable,
    },
  };
}
