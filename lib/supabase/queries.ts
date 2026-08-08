import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  DEFAULT_THEME_PRESET,
  THEME_PRESET_KEYS,
  type ThemePresetKey,
} from "@/lib/theme/presets";
import type { SiteThemeSettings } from "@/lib/theme/resolve";

// Dönüş tipi types/database.types.ts'ten otomatik çıkarılır — yanlış tablo/
// kolon adı yazılırsa derleme zamanında hata verir. Tipleri yeniden üretmek
// için: npm run types:generate (bkz. docs/MIMARI.md madde 4.1).
export async function getServices() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, title, description, is_published, order_index")
    .order("order_index");

  if (error) {
    throw new Error(`Hizmetler alınamadı: ${error.message}`);
  }

  return data;
}

const FALLBACK_THEME_SETTINGS: SiteThemeSettings = {
  themeMode: "light",
  themePreset: DEFAULT_THEME_PRESET,
  primaryColor: null,
};

function isThemePresetKey(value: unknown): value is ThemePresetKey {
  return (
    typeof value === "string" &&
    THEME_PRESET_KEYS.includes(value as ThemePresetKey)
  );
}

/**
 * Şu an "aktif site" olarak platform sahibinin kendi tenant kaydı
 * kullanılıyor (is_platform_owner = true) — Host başlığına göre gerçek
 * tenant çözümlemesi yapan middleware henüz yok (bkz. docs/DURUM.md
 * "Sıradaki adım"). Middleware yazıldığında bu fonksiyon bir tenant id
 * parametresi alacak şekilde genişletilmeli.
 *
 * theme_preset kolonuyla ilgili tip artık types/database.types.ts'te var
 * (migration uygulandı + `npm run types:generate` çalıştırıldı, 2026-08-08)
 * — bu yüzden tipli client kullanılıyor. Yine de dönen veri elle
 * doğrulanmaya devam ediyor (isThemePresetKey) çünkü DB'deki gerçek değer
 * her zaman check constraint'in izin verdiği kadar güvenilir olmayabilir.
 * Migration uygulanmamışsa veya Supabase'e erişilemiyorsa kök layout'u
 * asla çökertmez, güvenli varsayılana düşer.
 */
export async function getSiteThemeSettings(): Promise<SiteThemeSettings> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("theme_mode, site_settings(primary_color, theme_preset)")
      .eq("is_platform_owner", true)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("Platform sahibi tenant bulunamadı.");
    }

    const settingsRow = Array.isArray(data.site_settings)
      ? data.site_settings[0]
      : data.site_settings;

    return {
      themeMode: data.theme_mode === "dark" ? "dark" : "light",
      themePreset: isThemePresetKey(settingsRow?.theme_preset)
        ? settingsRow.theme_preset
        : DEFAULT_THEME_PRESET,
      primaryColor:
        typeof settingsRow?.primary_color === "string"
          ? settingsRow.primary_color
          : null,
    };
  } catch {
    return FALLBACK_THEME_SETTINGS;
  }
}
