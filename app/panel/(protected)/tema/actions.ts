"use server";

import { revalidatePath } from "next/cache";
import { themeSettingsFormSchema, type ThemeSettingsFormValues } from "@/lib/validation/theme";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getThemeSettings } from "@/lib/supabase/panelQueries";

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
    current.address !== nextAddress || current.phone !== nextPhone || current.email !== nextEmail;

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
    const { error } = await supabase
      .from("site_settings")
      .update({
        slogan: nextSlogan,
        primary_color: nextPrimaryColor,
        secondary_color: nextSecondaryColor,
        border_radius_scale: nextBorderRadiusScale,
        font_family_key: nextFontFamilyKey,
        facebook_url: nextFacebookUrl,
        instagram_url: nextInstagramUrl,
        linkedin_url: nextLinkedinUrl,
      })
      .eq("tenant_id", tenantId);
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
    const { error } = await supabase
      .from("contact_sections")
      .update({ address: nextAddress, phone: nextPhone, email: nextEmail })
      .eq("tenant_id", tenantId);
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
