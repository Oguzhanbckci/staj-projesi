import { cache } from "react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  DEFAULT_THEME_PRESET,
  THEME_PRESET_KEYS,
  type ThemePresetKey,
} from "@/lib/theme/presets";
import type { SiteThemeSettings } from "@/lib/theme/resolve";
import { isBorderRadiusScaleKey } from "@/lib/theme/radiusScales";
import { isFontFamilyKey } from "@/lib/theme/fonts";
import type { HeroSectionData, HeroVariant } from "@/components/site/hero/types";
import type { ServiceItem } from "@/components/site/services/types";
import type { AboutSectionData } from "@/components/site/about/types";
import type { ProjectItem } from "@/components/site/projects/types";
import type { FaqItem } from "@/components/site/faqs/types";
import type { TestimonialItem } from "@/components/site/testimonials/types";
import type { StatItem } from "@/components/site/stats/types";
import type { TeamMember } from "@/components/site/team/types";
import { isSectionKey, type PageSectionRow } from "@/lib/sections/config";

// Akme İnşaat — "aktif site" olarak hedeflenen tenant. Host header'a göre
// tenant çözümleyen middleware henüz yok (bkz. docs/MIMARI.md madde 7,
// docs/DURUM.md "Sıradaki adım"); o gelene kadar bütün sorgular sabit bu
// domain'i hedefler. Daha önce burada platform sahibinin
// (is_platform_owner = true) satırı kullanılıyordu, ama o satırda sadece
// site_settings/stats var — PRD'ye göre Referanslar/SSS/İstatistikler/Ekip
// zaten sadece TENANT sitelerinde bulunuyor (platformun kendi tanıtım
// sitesinde değil, bkz. docs/PRD.md madde 3.1/3.3), bu yüzden "örnek/aktif
// site" olarak platform yerine Akme'yi hedeflemek PRD'ye daha sadık (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-10). `cache()` ile bir istekte (ör. Navbar +
// Footer + PageSections aynı anda) birden fazla çağrılsa da tek sorguya iner.
const ACTIVE_TENANT_DOMAIN = "akmeinsaat.com.tr";

export const getActiveTenantId = cache(async (): Promise<string | null> => {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .eq("domain", ACTIVE_TENANT_DOMAIN)
      .maybeSingle();

    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
});

// sitemap.ts/robots.ts/getLocalBusinessData() için — DB'ye hiç gitmeden
// (sitemap/robots gibi herkese açık, sık istenen dosyalar için bir DB
// bağımlılığı eklememek daha sağlam) aynı sabit domain'i döner. `async`
// olarak tanımlı — Host header'a göre gerçek tenant çözümlemesi
// yazıldığında (bkz. docs/DURUM.md açık madde) bu imza DEĞİŞMEDEN
// gerçek bir header okumasına dönüşebilir.
export async function getActiveTenantDomain(): Promise<string> {
  return ACTIVE_TENANT_DOMAIN;
}

/**
 * Sadece `is_published = true` kayıtlar, `order_index` sırasıyla — ikisi de
 * DB sorgusunda (`.eq`/`.order`), JS'te değil. Hata olursa (Supabase
 * erişilemez, migration henüz uygulanmamış vb.) sayfa çökmez — sunucu
 * konsoluna loglanır, boş dizi döner; çağıran taraf (ServicesSection) bunu
 * "kayıt yok" ile aynı şekilde ele alır.
 *
 * image_path kolonu için tip artık types/database.types.ts'te var
 * (migration uygulandı + `npm run types:generate` çalıştırıldı,
 * 2026-08-08) — tipli client kullanılıyor.
 */
export async function getServices(): Promise<ServiceItem[]> {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();

    if (!tenantId) {
      throw new Error("Aktif tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("services")
      .select("id, title, description, icon, image_path")
      .eq("tenant_id", tenantId)
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
    const tenantId = await getActiveTenantId();

    if (!tenantId) {
      throw new Error("Aktif tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("tenants")
      .select("about_sections(*)")
      .eq("id", tenantId)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("Hakkımızda verisi alınamadı.");
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
  secondaryColor: null,
  borderRadiusScale: null,
  fontFamilyKey: null,
};

function isThemePresetKey(value: unknown): value is ThemePresetKey {
  return (
    typeof value === "string" &&
    THEME_PRESET_KEYS.includes(value as ThemePresetKey)
  );
}

/**
 * Aktif tenant için (bkz. getActiveTenantId) — Host başlığına göre gerçek
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
    const tenantId = await getActiveTenantId();

    if (!tenantId) {
      throw new Error("Aktif tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("tenants")
      .select(
        "theme_mode, site_settings(primary_color, secondary_color, theme_preset, border_radius_scale, font_family_key)"
      )
      .eq("id", tenantId)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("Tema ayarları alınamadı.");
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
      secondaryColor:
        typeof settingsRow?.secondary_color === "string"
          ? settingsRow.secondary_color
          : null,
      borderRadiusScale: isBorderRadiusScaleKey(settingsRow?.border_radius_scale)
        ? settingsRow.border_radius_scale
        : null,
      fontFamilyKey: isFontFamilyKey(settingsRow?.font_family_key)
        ? settingsRow.font_family_key
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
 * Aktif tenant için (bkz. getActiveTenantId yorumu).
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
    const tenantId = await getActiveTenantId();

    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("tenants")
      .select("hero_sections(*)")
      .eq("id", tenantId)
      .maybeSingle();

    if (error || !data) {
      throw error ?? new Error("Hero verisi alınamadı.");
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
    const tenantId = await getActiveTenantId();

    if (!tenantId) {
      throw new Error("Aktif tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, location, year, category, image_path, live_url")
      .eq("tenant_id", tenantId)
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

/**
 * faqs tablosunda yeni kolon yok, tipli client yeterli. getServices()'le
 * aynı desen (iki sorgu: tenant id, sonra filtreli/sıralı liste).
 */
export async function getFaqs(): Promise<FaqItem[]> {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();

    if (!tenantId) {
      throw new Error("Aktif tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer")
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("SSS alınamadı.");
    }

    return data.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
    }));
  } catch (err) {
    console.error("getFaqs sorgu hatası:", err);
    return [];
  }
}

/**
 * testimonials.logo_path için tip artık var (migration uygulandı +
 * `npm run types:generate` çalıştırıldı, 2026-08-08) — tipli client.
 */
export async function getTestimonials(): Promise<TestimonialItem[]> {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();

    if (!tenantId) {
      throw new Error("Aktif tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, author_name, author_title, quote, logo_path")
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Referanslar alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      authorName: String(row.author_name),
      authorTitle: typeof row.author_title === "string" ? row.author_title : null,
      quote: String(row.quote),
      logoPath: typeof row.logo_path === "string" ? row.logo_path : null,
    }));
  } catch (err) {
    console.error("getTestimonials sorgu hatası:", err);
    return [];
  }
}

/**
 * stats tablosu için tip artık var (aynı migration + types:generate) —
 * tipli client.
 */
export async function getStats(): Promise<StatItem[]> {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();

    if (!tenantId) {
      throw new Error("Aktif tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("stats")
      .select("id, label, value, suffix")
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("İstatistikler alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      label: String(row.label),
      value: typeof row.value === "number" ? row.value : 0,
      suffix: typeof row.suffix === "string" ? row.suffix : null,
    }));
  } catch (err) {
    console.error("getStats sorgu hatası:", err);
    return [];
  }
}

/**
 * team_members — getServices() ile aynı desen. Ekip bölümü sadece tenant
 * sitelerinde kullanılır (bkz. docs/PRD.md, "marka anonim kalma" kuralı).
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();

    if (!tenantId) {
      throw new Error("Aktif tenant bulunamadı.");
    }

    const { data, error } = await supabase
      .from("team_members")
      .select("id, full_name, role, bio, photo_path")
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Ekip üyeleri alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      fullName: String(row.full_name),
      role: String(row.role),
      bio: typeof row.bio === "string" ? row.bio : null,
      photoPath: typeof row.photo_path === "string" ? row.photo_path : null,
    }));
  } catch (err) {
    console.error("getTeamMembers sorgu hatası:", err);
    return [];
  }
}

export interface ContactSectionData {
  address: string | null;
  phone: string | null;
  email: string | null;
  workingHours: string | null;
}

/**
 * contact_sections — sadece statik gösterim bilgisi (bkz.
 * docs/VERİ-MODELİ.md, "form verisi burada değil"). Kayıt yoksa/yayında
 * değilse null döner, ContactSection/Footer bunu "gösterecek bir şey yok"
 * olarak ele alır. `working_hours` için tip artık var (migration uygulandı
 * + `npm run types:generate` çalıştırıldı, 2026-08-11).
 */
export const getContactSection = cache(async (): Promise<ContactSectionData | null> => {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();

    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("contact_sections")
      .select("address, phone, email, working_hours")
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) return null;

    return {
      address: typeof data.address === "string" ? data.address : null,
      phone: typeof data.phone === "string" ? data.phone : null,
      email: typeof data.email === "string" ? data.email : null,
      workingHours: typeof data.working_hours === "string" ? data.working_hours : null,
    };
  } catch (err) {
    console.error("getContactSection sorgu hatası:", err);
    return null;
  }
});

export interface LocalBusinessData {
  name: string;
  domain: string;
  description: string | null;
  logoPath: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  weekdayOpens: string | null;
  weekdayCloses: string | null;
  weekendOpens: string | null;
  weekendCloses: string | null;
  serviceAreas: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
}

/**
 * `LocalBusiness` (GeneralContractor) JSON-LD'si için ham veri — TEK
 * sorguda tenants+site_settings+contact_sections (getThemeSettings'teki
 * çift-embed deseniyle aynı). BİLEREK `getContactSection()`'dan AYRI:
 * o sadece `is_published=true` + ziyaretçiye GÖSTERİLECEK alanları
 * döner, bu TÜM yapısal-veri alanlarını (weekday_opens vb.) çeker ve
 * `is_published` filtresi UYGULAMAZ — yapısal veri "bu bölüm sitede
 * görünür mü" sorusundan bağımsız, firma her zaman aynı firma (bkz.
 * docs/KARAR-GUNLUGU.md, 2026-08-17). Ham veri çekme (bu fonksiyon) ile
 * JSON-LD nesnesini KURMA (lib/seo/localBusiness.ts) bilerek ayrı —
 * biri Supabase'e bağımlı, diğeri saf/test edilebilir.
 */
export const getLocalBusinessData = cache(async (): Promise<LocalBusinessData | null> => {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();
    const domain = await getActiveTenantDomain();
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("tenants")
      .select(
        "name, site_settings(seo_description, logo_path, facebook_url, instagram_url, linkedin_url), contact_sections(address, phone, email, weekday_opens, weekday_closes, weekend_opens, weekend_closes, service_areas)"
      )
      .eq("id", tenantId)
      .maybeSingle();

    if (error || !data) return null;

    const settings = Array.isArray(data.site_settings) ? data.site_settings[0] : data.site_settings;
    const contact = Array.isArray(data.contact_sections)
      ? data.contact_sections[0]
      : data.contact_sections;

    return {
      name: String(data.name),
      domain,
      description: typeof settings?.seo_description === "string" ? settings.seo_description : null,
      logoPath: typeof settings?.logo_path === "string" ? settings.logo_path : null,
      address: typeof contact?.address === "string" ? contact.address : null,
      phone: typeof contact?.phone === "string" ? contact.phone : null,
      email: typeof contact?.email === "string" ? contact.email : null,
      weekdayOpens: typeof contact?.weekday_opens === "string" ? contact.weekday_opens : null,
      weekdayCloses: typeof contact?.weekday_closes === "string" ? contact.weekday_closes : null,
      weekendOpens: typeof contact?.weekend_opens === "string" ? contact.weekend_opens : null,
      weekendCloses: typeof contact?.weekend_closes === "string" ? contact.weekend_closes : null,
      serviceAreas: typeof contact?.service_areas === "string" ? contact.service_areas : null,
      facebookUrl: typeof settings?.facebook_url === "string" ? settings.facebook_url : null,
      instagramUrl: typeof settings?.instagram_url === "string" ? settings.instagram_url : null,
      linkedinUrl: typeof settings?.linkedin_url === "string" ? settings.linkedin_url : null,
    };
  } catch (err) {
    console.error("getLocalBusinessData sorgu hatası:", err);
    return null;
  }
});

export interface SiteSettingsData {
  tenantName: string;
  slogan: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ctaTitle: string | null;
  ctaDescription: string | null;
  ctaButtonText: string | null;
  ctaButtonLink: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  logoPath: string | null;
  faviconPath: string | null;
  ogImagePath: string | null;
}

/**
 * Eylem Çağrısı içeriği + Footer sosyal medya linkleri + site kimliği
 * (slogan/logo/favicon) — hepsi site_settings'te (bkz. supabase/migrations/
 * 20260810120000_..., 20260815120000_..., "İçerik ayarlardan gelsin"
 * yönergesi). `cache()`: CtaSection/Footer/(site) layout aynı istekte
 * birden fazla çağırsa da tek sorguya iner.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData | null> => {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();

    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("tenants")
      .select(
        "name, site_settings(slogan, seo_title, seo_description, seo_keywords, cta_title, cta_description, cta_button_text, cta_button_link, facebook_url, instagram_url, linkedin_url, logo_path, favicon_path, og_image_path)"
      )
      .eq("id", tenantId)
      .maybeSingle();

    if (error || !data) return null;

    const settingsRow = Array.isArray(data.site_settings)
      ? data.site_settings[0]
      : data.site_settings;

    return {
      tenantName: data.name,
      slogan: typeof settingsRow?.slogan === "string" ? settingsRow.slogan : null,
      seoTitle: typeof settingsRow?.seo_title === "string" ? settingsRow.seo_title : null,
      seoDescription:
        typeof settingsRow?.seo_description === "string" ? settingsRow.seo_description : null,
      seoKeywords:
        typeof settingsRow?.seo_keywords === "string" ? settingsRow.seo_keywords : null,
      ctaTitle: typeof settingsRow?.cta_title === "string" ? settingsRow.cta_title : null,
      ctaDescription:
        typeof settingsRow?.cta_description === "string" ? settingsRow.cta_description : null,
      ctaButtonText:
        typeof settingsRow?.cta_button_text === "string" ? settingsRow.cta_button_text : null,
      ctaButtonLink:
        typeof settingsRow?.cta_button_link === "string" ? settingsRow.cta_button_link : null,
      facebookUrl:
        typeof settingsRow?.facebook_url === "string" ? settingsRow.facebook_url : null,
      instagramUrl:
        typeof settingsRow?.instagram_url === "string" ? settingsRow.instagram_url : null,
      linkedinUrl:
        typeof settingsRow?.linkedin_url === "string" ? settingsRow.linkedin_url : null,
      logoPath: typeof settingsRow?.logo_path === "string" ? settingsRow.logo_path : null,
      faviconPath:
        typeof settingsRow?.favicon_path === "string" ? settingsRow.favicon_path : null,
      ogImagePath:
        typeof settingsRow?.og_image_path === "string" ? settingsRow.og_image_path : null,
    };
  } catch (err) {
    console.error("getSiteSettings sorgu hatası:", err);
    return null;
  }
});

/**
 * page_sections — bir tenant sitesindeki bölümlerin sırası/görünürlüğü/
 * varyantı (bkz. supabase/migrations/20260810120000_..., KISITLAR: "Bölüm
 * kayıtları veritabanında dursun"). Sadece `is_visible = true` satırlar,
 * `order_index` sırasıyla — DB sorgusunda, JS'te değil. Bilinmeyen bir
 * section_key (silinmiş bir bölüm türü, elle yapılmış bir DB düzenlemesi)
 * `isSectionKey` ile elenir — components/site/PageSections.tsx bu listeyi
 * güvenle SectionKey olarak kullanabilir. `cache()`: Navbar/Footer/
 * PageSections aynı istekte üçü de çağırsa tek sorguya iner.
 *
 * page_sections kolonları için tip artık var (migration uygulandı +
 * `npm run types:generate` çalıştırıldı, 2026-08-10) — tipli client
 * kullanılıyor.
 */
export const getPageSections = cache(async (): Promise<PageSectionRow[]> => {
  try {
    const supabase = createServiceRoleClient();
    const tenantId = await getActiveTenantId();

    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("page_sections")
      .select("id, section_key, variant")
      .eq("tenant_id", tenantId)
      .eq("is_visible", true)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Bölüm sırası alınamadı.");
    }

    return data
      .filter((row) => isSectionKey(row.section_key))
      .map((row) => ({
        id: String(row.id),
        sectionKey: row.section_key as PageSectionRow["sectionKey"],
        variant: typeof row.variant === "string" ? row.variant : null,
      }));
  } catch (err) {
    console.error("getPageSections sorgu hatası:", err);
    return [];
  }
});
