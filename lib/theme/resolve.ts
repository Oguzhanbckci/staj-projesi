import {
  DEFAULT_THEME_PRESET,
  THEME_PRESETS,
  type ThemePresetKey,
} from "@/lib/theme/presets";
import { pickReadableTextColor } from "@/lib/theme/contrast";
import { BORDER_RADIUS_SCALES, type BorderRadiusScaleKey } from "@/lib/theme/radiusScales";
import { FONT_FAMILY_OPTIONS, type FontFamilyKey } from "@/lib/theme/fonts";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export interface SiteThemeSettings {
  themeMode: "light" | "dark";
  themePreset: ThemePresetKey;
  /** site_settings.primary_color — preset'in varsayılan marka rengini ezer. */
  primaryColor: string | null;
  /** site_settings.secondary_color — dolu ise --color-accent/-on'u besler. */
  secondaryColor: string | null;
  /** site_settings.border_radius_scale — dolu ise preset'in radius'unu ezer. */
  borderRadiusScale: BorderRadiusScaleKey | null;
  /** site_settings.font_family_key — dolu ise preset'in fontunu ezer. */
  fontFamilyKey: FontFamilyKey | null;
}

export interface ResolvedTheme {
  dataTheme: "light" | "dark";
  /** app/layout.tsx'te <html style={...}> olarak enjekte edilecek CSS özel değişkenleri. */
  styleVars: Record<string, string>;
}

// Kayıtlı değer bozuksa (elle DB düzenlemesi, migration öncesi eski satır
// vb.) kök layout ASLA çökmez — contrast.ts'in throw eden saf fonksiyonunu
// burada, tek çağrı noktasında koruyoruz (bkz. docs/TEMA-MIMARISI.md
// madde 5, "FOUC Önlemi" ile aynı "asla çökmez" ilkesi).
function safeReadableTextColor(hex: string): string | null {
  return HEX_COLOR_RE.test(hex) ? pickReadableTextColor(hex) : null;
}

export function resolveThemeTokens(input: SiteThemeSettings): ResolvedTheme {
  const preset = THEME_PRESETS[input.themePreset] ?? THEME_PRESETS[DEFAULT_THEME_PRESET];
  const mode = input.themeMode === "dark" ? "dark" : "light";

  const customBrand = input.primaryColor?.trim();
  const brand = customBrand && HEX_COLOR_RE.test(customBrand) ? customBrand : preset.brand[mode];
  const brandOn = customBrand
    ? safeReadableTextColor(customBrand) ?? preset.brandOn[mode]
    : preset.brandOn[mode];

  const radius = input.borderRadiusScale
    ? BORDER_RADIUS_SCALES[input.borderRadiusScale]
    : preset.radius;
  const fontVariable = input.fontFamilyKey
    ? FONT_FAMILY_OPTIONS[input.fontFamilyKey].variable
    : preset.fontVariable;

  const styleVars: Record<string, string> = {
    "--color-brand": brand,
    "--color-brand-on": brandOn,
    "--radius-sm": radius.sm,
    "--radius-md": radius.md,
    "--radius-lg": radius.lg,
    "--radius-xl": radius.xl,
    "--font-sans": fontVariable,
  };

  // customAccent yoksa --color-accent/-on hiç eklenmiyor — app/globals.css'teki
  // :root statik varsayılanı (nötr "secondary" görünümü) geçerli kalır,
  // sıfır regresyon (bkz. docs/KARAR-GUNLUGU.md, 2026-08-15).
  const customAccent = input.secondaryColor?.trim();
  if (customAccent && HEX_COLOR_RE.test(customAccent)) {
    styleVars["--color-accent"] = customAccent;
    styleVars["--color-accent-on"] = safeReadableTextColor(customAccent) ?? "#ffffff";
  }

  return { dataTheme: mode, styleVars };
}
