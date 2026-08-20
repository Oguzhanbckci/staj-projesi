"use server";

import { revalidatePath } from "next/cache";
import { themeSettingsFormSchema, type ThemeSettingsFormValues } from "@/lib/validation/theme";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getThemeSettings } from "@/lib/supabase/panelQueries";
import { THEME_PRESET_KEYS, type ThemePresetKey } from "@/lib/theme/presets";

// updateProjectAction ile aynı iskelet (bkz. icerikler/projeler/actions.ts)
// — ama 3 AYRI tabloya yazıyor (tenants.name, site_settings.*,
// contact_sections.*) çünkü "Site Kimliği" alanları birden fazla, önceden
// var olan tabloya dağılmış durumda (bkz. docs/KARAR-GUNLUGU.md, 2026-08-15
// — mekanik bir yeni tablo icat etmek yerine mevcutları kullanma kararı).
// Üç tablo için AYRI dirty-check: hiçbiri değişmediyse hiç yazma yapılmaz,
// sadece değişen tablo güncellenir — "değişiklik yoksa yazma yapma"
// ilkesinin (2026-08-14, üçüncü oturum) çok-tablolu genişletilmiş hali.
// Tablolar arası gerçek bir transaction YOK (proje genelinde çok-tablolu
// atomik yazma emsali yok, tek admin/düşük eşzamanlılık nedeniyle kabul
// edilebilir risk).
export async function updateThemeSettingsAction(
  _prevState: ActionResult<keyof ThemeSettingsFormValues>,
  formData: FormData
): Promise<ActionResult<keyof ThemeSettingsFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    companyName: String(formData.get("companyName") ?? ""),
    slogan: String(formData.get("slogan") ?? ""),
    primaryColor: String(formData.get("primaryColor") ?? ""),
    secondaryColor: String(formData.get("secondaryColor") ?? ""),
    borderRadiusScale: String(formData.get("borderRadiusScale") ?? ""),
    fontFamilyKey: String(formData.get("fontFamilyKey") ?? ""),
    address: String(formData.get("address") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    workingHours: String(formData.get("workingHours") ?? ""),
    weekdayOpens: String(formData.get("weekdayOpens") ?? ""),
    weekdayCloses: String(formData.get("weekdayCloses") ?? ""),
    weekendOpens: String(formData.get("weekendOpens") ?? ""),
    weekendCloses: String(formData.get("weekendCloses") ?? ""),
    serviceAreas: String(formData.get("serviceAreas") ?? ""),
    facebookUrl: String(formData.get("facebookUrl") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
  };

  const result = themeSettingsFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof ThemeSettingsFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ThemeSettingsFormValues;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return {
      success: false,
      fieldErrors: {},
      formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin.",
    };
  }

  const current = await getThemeSettings();
  if (!current) {
    return { success: false, fieldErrors: {}, formError: "Ayarlar bulunamadı." };
  }

  const data = result.data;
  const nextSlogan = data.slogan || null;
  const nextPrimaryColor = data.primaryColor || null;
  const nextSecondaryColor = data.secondaryColor || null;
  const nextBorderRadiusScale = data.borderRadiusScale || null;
  const nextFontFamilyKey = data.fontFamilyKey || null;
  const nextFacebookUrl = data.facebookUrl || null;
  const nextInstagramUrl = data.instagramUrl || null;
  const nextLinkedinUrl = data.linkedinUrl || null;
  const nextAddress = data.address || null;
  const nextPhone = data.phone || null;
  const nextEmail = data.email || null;
  const nextWorkingHours = data.workingHours || null;
  const nextWeekdayOpens = data.weekdayOpens || null;
  const nextWeekdayCloses = data.weekdayCloses || null;
  const nextWeekendOpens = data.weekendOpens || null;
  const nextWeekendCloses = data.weekendCloses || null;
  const nextServiceAreas = data.serviceAreas || null;

  const tenantChanged = current.companyName !== data.companyName;
  const settingsChanged =
    current.slogan !== nextSlogan ||
    current.primaryColor !== nextPrimaryColor ||
    current.secondaryColor !== nextSecondaryColor ||
    current.borderRadiusScale !== nextBorderRadiusScale ||
    current.fontFamilyKey !== nextFontFamilyKey ||
    current.facebookUrl !== nextFacebookUrl ||
    current.instagramUrl !== nextInstagramUrl ||
    current.linkedinUrl !== nextLinkedinUrl;
  const contactChanged =
    current.address !== nextAddress ||
    current.phone !== nextPhone ||
    current.email !== nextEmail ||
    current.workingHours !== nextWorkingHours ||
    current.weekdayOpens !== nextWeekdayOpens ||
    current.weekdayCloses !== nextWeekdayCloses ||
    current.weekendOpens !== nextWeekendOpens ||
    current.weekendCloses !== nextWeekendCloses ||
    current.serviceAreas !== nextServiceAreas;

  if (!tenantChanged && !settingsChanged && !contactChanged) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();

  if (tenantChanged) {
    const { error } = await supabase
      .from("tenants")
      .update({ name: data.companyName })
      .eq("id", tenantId);
    if (error) {
      console.error("updateThemeSettingsAction tenants güncelleme hatası:", error);
      return {
        success: false,
        fieldErrors: {},
        formError: "Firma adı kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
      };
    }
  }

  if (settingsChanged) {
    // `.update()` DEĞİL `.upsert()` — 2026-08-20 mentör denetimi (bulgu 08).
    // Düz `.update()`, eşleşen satır yoksa HATA VERMEZ, sessizce hiçbir şey
    // yazmaz ve eylem "Değişiklikler kaydedildi." döner. Bu hata dokuzuncu
    // oturumda Hero/Hakkımızda eylemlerinde tespit edilip düzeltilmişti
    // (bkz. icerikler/hero/actions.ts:11 yorumu) ama aynı düzeltme buraya
    // taşınmamıştı — henüz site_settings satırı oluşmamış taze bir
    // kurulumda tema ayarları sessizce kayboluyordu.
    // `onConflict: "tenant_id"` güvenli: site_settings_tenant_id_key
    // UNIQUE kısıtı var (20260806120000_create_content_tables.sql:69).
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          tenant_id: tenantId,
          slogan: nextSlogan,
          primary_color: nextPrimaryColor,
          secondary_color: nextSecondaryColor,
          border_radius_scale: nextBorderRadiusScale,
          font_family_key: nextFontFamilyKey,
          facebook_url: nextFacebookUrl,
          instagram_url: nextInstagramUrl,
          linkedin_url: nextLinkedinUrl,
        },
        { onConflict: "tenant_id" }
      );
    if (error) {
      console.error("updateThemeSettingsAction site_settings güncelleme hatası:", error);
      return {
        success: false,
        fieldErrors: {},
        formError: "Tema ayarları kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
      };
    }
  }

  if (contactChanged) {
    // Yukarıdaki site_settings ile aynı gerekçe (bulgu 08).
    // contact_sections_tenant_id_key UNIQUE kısıtı var (aynı migration:188).
    const { error } = await supabase
      .from("contact_sections")
      .upsert(
        {
          tenant_id: tenantId,
          address: nextAddress,
          phone: nextPhone,
          email: nextEmail,
          working_hours: nextWorkingHours,
          weekday_opens: nextWeekdayOpens,
          weekday_closes: nextWeekdayCloses,
          weekend_opens: nextWeekendOpens,
          weekend_closes: nextWeekendCloses,
          service_areas: nextServiceAreas,
        },
        { onConflict: "tenant_id" }
      );
    if (error) {
      console.error("updateThemeSettingsAction contact_sections güncelleme hatası:", error);
      return {
        success: false,
        fieldErrors: {},
        formError: "İletişim bilgileri kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
      };
    }
  }

  // Marka rengi kök app/layout.tsx'te, kimlik/logo app/(site)/layout.tsx'te
  // — "layout" tipi ikisini de (ve altındaki TÜM sayfaları: /, /ekip,
  // /iletisim) tazeler; düz revalidatePath("/") sadece ana sayfayı tazeler,
  // diğer sayfaları bayat bırakırdı.
  revalidatePath("/", "layout");

  return { success: true };
}

export interface PresetActionState {
  success: boolean;
  formError?: string;
}

// "Kurumsal Mavi"/"Modern Koyu" önayarlarını uygulamak İÇİN de,
// "Varsayılana Dön" butonu İÇİN de kullanılan TEK eylem — ikisi mekanik
// olarak aynı işlemi yapıyor (theme_preset'i seçilen anahtara çevirip 4
// override kolonunu temizlemek), sadece ThemePresetPicker.tsx'te FARKLI
// onay metni/buton rengiyle sunuluyor (bkz. docs/KARAR-GUNLUGU.md,
// 2026-08-16). Override'lar BİLEREK sıfırlanıyor — aksi halde önayar
// seçimi, hâlâ dolu olan primary_color/secondary_color/... tarafından
// gölgelenip görünürde hiçbir şey değişmemiş gibi görünürdü (KISITLAR:
// "uygulanınca mevcut ayarların değişeceği konusunda kullanıcıyı uyar" —
// bu uyarı ancak GERÇEKTEN değişirse anlamlı).
export async function applyThemePresetAction(
  presetKey: ThemePresetKey,
  _prevState: PresetActionState,
  _formData: FormData
): Promise<PresetActionState> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, formError: authCheck.formError };
  }

  if (!THEME_PRESET_KEYS.includes(presetKey)) {
    return { success: false, formError: "Geçersiz önayar." };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return { success: false, formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin." };
  }

  const supabase = await createServerSupabaseClient();
  // updateThemeSettingsAction ile aynı gerekçe (bulgu 08) — düz `.update()`
  // satır yoksa sessizce hiçbir şey yazmaz ve önayar uygulanmış görünürdü.
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        tenant_id: tenantId,
        theme_preset: presetKey,
        primary_color: null,
        secondary_color: null,
        border_radius_scale: null,
        font_family_key: null,
      },
      { onConflict: "tenant_id" }
    );

  if (error) {
    console.error("applyThemePresetAction hata:", error);
    return { success: false, formError: "Önayar uygulanırken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
