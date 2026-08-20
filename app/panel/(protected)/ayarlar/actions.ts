"use server";

import { revalidatePath } from "next/cache";
import { seoSettingsFormSchema, type SeoSettingsFormValues } from "@/lib/validation/seo";
import {
  notificationSettingsFormSchema,
  type NotificationSettingsFormValues,
} from "@/lib/validation/notifications";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getSeoSettings, getNotificationSettings } from "@/lib/supabase/panelQueries";

// updateThemeSettingsAction ile aynı iskelet (bkz. ../tema/actions.ts) —
// tek tabloya yazdığı için o dosyadaki çok-tablolu dirty-check'in
// basitleştirilmiş hâli.
export async function updateSeoSettingsAction(
  _prevState: ActionResult<keyof SeoSettingsFormValues>,
  formData: FormData
): Promise<ActionResult<keyof SeoSettingsFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    seoKeywords: String(formData.get("seoKeywords") ?? ""),
  };

  const result = seoSettingsFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof SeoSettingsFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof SeoSettingsFormValues;
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

  const current = await getSeoSettings();
  if (!current) {
    return { success: false, fieldErrors: {}, formError: "Ayarlar bulunamadı." };
  }

  const nextTitle = result.data.seoTitle || null;
  const nextDescription = result.data.seoDescription || null;
  const nextKeywords = result.data.seoKeywords || null;

  const hasChanges =
    current.seoTitle !== nextTitle ||
    current.seoDescription !== nextDescription ||
    current.seoKeywords !== nextKeywords;

  if (!hasChanges) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  // `.update()` DEĞİL `.upsert()` — 2026-08-20 mentör denetimi (bulgu 08),
  // aynı gerekçe tema/actions.ts'te ayrıntılı yazılı: düz update eşleşen
  // satır yoksa hata vermeden hiçbir şey yazmaz, eylem yine "kaydedildi"
  // döner. site_settings_tenant_id_key UNIQUE kısıtı onConflict'i güvenli
  // kılıyor; tenant_id dışında NOT NULL kolon olmadığı için insert dalı da
  // sorunsuz çalışır.
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        tenant_id: tenantId,
        seo_title: nextTitle,
        seo_description: nextDescription,
        seo_keywords: nextKeywords,
      },
      { onConflict: "tenant_id" }
    );

  if (error) {
    console.error("updateSeoSettingsAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "SEO ayarları kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  // seo_title/description app/(site)/layout.tsx'in generateMetadata()'sında
  // kullanılıyor — o da bu layout'un ALTINDAKİ tüm sayfaları (/, /ekip,
  // /iletisim) kapsıyor, bu yüzden "layout" tipi (updateThemeSettingsAction
  // ile aynı gerekçe).
  revalidatePath("/", "layout");

  return { success: true };
}

// tenants.contact_recipient_email — updateSeoSettingsAction ile aynı
// iskelet, ama BİLEREK revalidatePath YOK: bu değer ziyaretçi sitesinde
// hiçbir yerde render edilmiyor, sadece submitContactForm'un (sunucu
// tarafı) bildirim e-postası için okuduğu operasyonel bir alan (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-18 dokuzuncu oturum).
export async function updateNotificationSettingsAction(
  _prevState: ActionResult<keyof NotificationSettingsFormValues>,
  formData: FormData
): Promise<ActionResult<keyof NotificationSettingsFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    recipientEmail: String(formData.get("recipientEmail") ?? ""),
  };

  const result = notificationSettingsFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof NotificationSettingsFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof NotificationSettingsFormValues;
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

  const current = await getNotificationSettings();
  if (!current) {
    return { success: false, fieldErrors: {}, formError: "Ayarlar bulunamadı." };
  }

  const nextRecipientEmail = result.data.recipientEmail || null;
  if (current.recipientEmail === nextRecipientEmail) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("tenants")
    .update({ contact_recipient_email: nextRecipientEmail })
    .eq("id", tenantId);

  if (error) {
    console.error("updateNotificationSettingsAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Bildirim ayarı kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  return { success: true };
}
