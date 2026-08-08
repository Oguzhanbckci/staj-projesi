import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  DEFAULT_THEME_PRESET,
  THEME_PRESET_KEYS,
  type ThemePresetKey,
} from "@/lib/theme/presets";
import type { SiteThemeSettings } from "@/lib/theme/resolve";
import type { HeroSectionData, HeroVariant } from "@/components/site/hero/types";
import type { ServiceItem } from "@/components/site/services/types";
import type { AboutSectionData } from "@/components/site/about/types";
import type { ProjectItem } from "@/components/site/projects/types";

/**
 * Şu an platform sahibinin tenant kaydına scope'lu (bkz.
 * getSiteThemeSettings yorumu — aynı geçici Host-çözümleme kısıtı).
 * Sadece `is_published = true` kayıtlar, `order_index` sırasıyla —
 * ikisi de DB sorgusunda (`.eq`/`.order`), JS'te değil. Hata olursa
 * (Supabase erişilemez, migration henüz uygulanmamış vb.) sayfa
 * çökmez — sunucu konsoluna loglanır, boş dizi döner; çağıran taraf
 * (ServicesSection) bunu "kayıt yok" ile aynı şekilde ele alır.
 *
 * image_path kolonu için tip artık types/database.types.ts'te var
 * (migration uygulandı + `npm run types:generate` çalıştırıldı,
 * 2026-08-08) — tipli client kullanılıyor.
 */
export async function getServices(): Promise<ServiceItem[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("is_platform_owner", true)
      .maybeSingle();

    if (tenantError || !tenant) {
      throw tenantError ?? new Error("Platform sahibi tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("services")
      .select("id, title, description, icon, image_path")
      .eq("tenant_id", tenant.id)
      .eq("is_published", true)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Hizmetler alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      description: typeof row.description === "string" ? row.description : null,
      icon: typeof row.icon === "string" ? row.icon : null,
      imagePath: typeof row.image_path === "string" ? row.image_path : null,
    }));
  } catch (err) {
    console.error("getServices sorgu hatası:", err);
    return [];
  }
}

/**
 * hero_sections'la aynı desen (nested embed, platform tenant'a scope'lu).
 * core_values kolonu için tip artık var (bkz. yukarıdaki aynı migration +
 * types:generate) — tipli client. Yine de dönen veri elle doğrulanmaya
 * devam ediyor (defansif — DB'deki gerçek değer tipin garanti ettiğinden
 * farklı olabilir). Satır yoksa null döner, AboutSection kendi kendine
 * render etmemeyi seçer.
 */
export async function getAboutSection(): Promise<AboutSectionData | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("about_sections(*)")
      .eq("is_platform_owner", true)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("Platform sahibi tenant bulunamadı.");
    }

    const about = Array.isArray(data.about_sections)
      ? data.about_sections[0]
      : data.about_sections;

    if (!about || typeof about.title !== "string") {
      return null;
    }

    return {
      title: about.title,
      description: typeof about.description === "string" ? about.description : null,
      foundedYear: typeof about.founded_year === "number" ? about.founded_year : null,
      imagePath: typeof about.image_path === "string" ? about.image_path : null,
      coreValues: Array.isArray(about.core_values)
        ? about.core_values.filter((v: unknown): v is string => typeof v === "string")
        : [],
    };
  } catch (err) {
    console.error("getAboutSection sorgu hatası:", err);
    return null;
  }
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

function isHeroVariant(value: unknown): value is HeroVariant {
  return value === "a" || value === "b";
}

/**
 * Şu an platform sahibinin tenant kaydını okuyor (bkz.
 * getSiteThemeSettings yorumu — aynı geçici Host-çözümleme kısıtı).
 *
 * hero_sections.variant/secondary_cta_* kolonları için tip artık var
 * (migration uygulandı + `npm run types:generate` çalıştırıldı,
 * 2026-08-08) — tipli client kullanılıyor. Satır hiç yoksa (henüz
 * içerik girilmemişse) veya Supabase'e erişilemiyorsa null döner —
 * çağıran taraf (sayfa) Hero'yu hiç render etmemeyi seçebilir.
 */
export async function getHeroSection(): Promise<HeroSectionData | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("hero_sections(*)")
      .eq("is_platform_owner", true)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("Platform sahibi tenant bulunamadı.");
    }

    const hero = Array.isArray(data.hero_sections)
      ? data.hero_sections[0]
      : data.hero_sections;

    if (!hero || typeof hero.title !== "string") {
      return null;
    }

    return {
      variant: isHeroVariant(hero.variant) ? hero.variant : "a",
      title: hero.title,
      subtitle: typeof hero.subtitle === "string" ? hero.subtitle : null,
      backgroundImagePath:
        typeof hero.background_image_path === "string"
          ? hero.background_image_path
          : null,
      ctaText: typeof hero.cta_text === "string" ? hero.cta_text : null,
      ctaLink: typeof hero.cta_link === "string" ? hero.cta_link : null,
      secondaryCtaText:
        typeof hero.secondary_cta_text === "string" ? hero.secondary_cta_text : null,
      secondaryCtaLink:
        typeof hero.secondary_cta_link === "string" ? hero.secondary_cta_link : null,
    };
  } catch {
    return null;
  }
}

/**
 * getServices() ile aynı desen (iki sorgu: tenant id, sonra filtreli/
 * sıralı liste — DB seviyesinde `is_published`/`order_index`, JS'te
 * değil). category/description kolonları için tip artık var (migration
 * uygulandı + `npm run types:generate` çalıştırıldı, 2026-08-08) — tipli
 * client kullanılıyor. Hata olursa sayfa çökmez, sunucuya loglanır, boş
 * dizi döner.
 */
export async function getProjects(): Promise<ProjectItem[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("is_platform_owner", true)
      .maybeSingle();

    if (tenantError || !tenant) {
      throw tenantError ?? new Error("Platform sahibi tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, location, year, category, image_path, live_url")
      .eq("tenant_id", tenant.id)
      .eq("is_published", true)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Projeler alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      description: typeof row.description === "string" ? row.description : null,
      city: typeof row.location === "string" ? row.location : null,
      year: typeof row.year === "number" ? row.year : null,
      category: typeof row.category === "string" ? row.category : null,
      coverPath: typeof row.image_path === "string" ? row.image_path : null,
      liveUrl: typeof row.live_url === "string" ? row.live_url : null,
    }));
  } catch (err) {
    console.error("getProjects sorgu hatası:", err);
    return [];
  }
}
