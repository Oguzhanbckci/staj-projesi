"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { swapOrderIndex } from "@/lib/supabase/panelQueries";
import { isSectionKey } from "@/lib/sections/config";
import { isValidVariantForSection } from "@/lib/sections/variantOptions";

// Üç eylem de moveTestimonialOrderAction/toggleServicePublishedAction ile
// birebir aynı iskelet (requireAdminUser -> tenant -> yaz -> revalidate).
// BİLEREK revalidatePath("/", "layout") — düz "/" DEĞİL: page_sections
// değişikliği Navbar/Footer üzerinden (buildSectionNavLinks) "/", "/ekip",
// "/iletisim" hepsini etkiliyor (updateThemeSettingsAction'daki AYNI
// gerekçe, bkz. docs/KARAR-GUNLUGU.md 2026-08-15).

export interface MoveState {
  success: boolean;
  formError?: string;
}

export async function moveSectionOrderAction(
  id: string,
  direction: "up" | "down",
  _prevState: MoveState,
  _formData: FormData
): Promise<MoveState> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, formError: authCheck.formError };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return { success: false, formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin." };
  }

  const result = await swapOrderIndex("page_sections", id, direction, tenantId);
  if (!result.ok) {
    return { success: false, formError: result.error };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export interface ToggleState {
  success: boolean;
  formError?: string;
}

export async function toggleSectionVisibilityAction(
  id: string,
  _prevState: ToggleState,
  _formData: FormData
): Promise<ToggleState> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, formError: authCheck.formError };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return { success: false, formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: current, error: fetchError } = await supabase
    .from("page_sections")
    .select("is_visible")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (fetchError || !current) {
    return { success: false, formError: "Kayıt bulunamadı." };
  }

  const { error } = await supabase
    .from("page_sections")
    .update({ is_visible: !current.is_visible })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("toggleSectionVisibilityAction hata:", error);
    return { success: false, formError: "Görünürlük değiştirilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export interface VariantState {
  success: boolean;
  formError?: string;
}

// sectionKey İSTEMCİDEN bağlanmıyor (bind edilmiyor) — kaydın gerçek
// section_key'i burada DB'den okunuyor, whitelist kontrolü BUNA göre
// yapılıyor. İstemcinin yanlış/kötü niyetli bir sectionKey göndermesiyle
// doğrulama atlatılamaz.
export async function updateSectionVariantAction(
  id: string,
  _prevState: VariantState,
  formData: FormData
): Promise<VariantState> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, formError: authCheck.formError };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return { success: false, formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin." };
  }

  const variant = String(formData.get("variant") ?? "");

  const supabase = await createServerSupabaseClient();
  const { data: current, error: fetchError } = await supabase
    .from("page_sections")
    .select("section_key, variant")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (fetchError || !current || !isSectionKey(current.section_key)) {
    return { success: false, formError: "Kayıt bulunamadı." };
  }

  if (!isValidVariantForSection(current.section_key, variant)) {
    return { success: false, formError: "Geçersiz görünüm seçimi." };
  }

  if (current.variant === variant) {
    return { success: true };
  }

  const { error } = await supabase
    .from("page_sections")
    .update({ variant })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("updateSectionVariantAction hata:", error);
    return { success: false, formError: "Görünüm değiştirilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
