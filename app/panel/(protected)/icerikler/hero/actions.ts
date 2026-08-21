"use server";

import { revalidatePath } from "next/cache";
import { heroFormSchema, type HeroFormValues } from "@/lib/validation/hero";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getHeroSettings } from "@/lib/supabase/panelQueries";

// updateSeoSettingsAction ile aynı iskelet (bkz. ../../ayarlar/actions.ts)
// — TEK fark: düz `.update()` değil `.upsert(..., {onConflict: "tenant_id"})`
// kullanılıyor, çünkü hero_sections satırı seed'de oluşsa da bunu
// varsaymak güvenli değil (bkz. docs/KARAR-GUNLUGU.md, 2026-08-18
// dokuzuncu oturum — ".update() eşleşen satır yoksa hatasız ama SESSİZCE
// hiçbir şey yazmaz" riski). `current` null ise (satır hiç yok) dirty-check
// atlanır, doğrudan yazılır.
export async function updateHeroSectionAction(
  _prevState: ActionResult<keyof HeroFormValues>,
  formData: FormData
): Promise<ActionResult<keyof HeroFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    ctaText: String(formData.get("ctaText") ?? ""),
    ctaLink: String(formData.get("ctaLink") ?? ""),
    secondaryCtaText: String(formData.get("secondaryCtaText") ?? ""),
    secondaryCtaLink: String(formData.get("secondaryCtaLink") ?? ""),
  };

  const result = heroFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof HeroFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof HeroFormValues;
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

  const data = result.data;
  const nextSubtitle = data.subtitle || null;
  const nextCtaText = data.ctaText || null;
  const nextCtaLink = data.ctaLink || null;
  const nextSecondaryCtaText = data.secondaryCtaText || null;
  const nextSecondaryCtaLink = data.secondaryCtaLink || null;

  const current = await getHeroSettings();
  const hasChanges =
    !current ||
    current.title !== data.title ||
    current.subtitle !== nextSubtitle ||
    current.ctaText !== nextCtaText ||
    current.ctaLink !== nextCtaLink ||
    current.secondaryCtaText !== nextSecondaryCtaText ||
    current.secondaryCtaLink !== nextSecondaryCtaLink;

  if (!hasChanges) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("hero_sections")
    .upsert(
      {
        tenant_id: tenantId,
        title: data.title,
        subtitle: nextSubtitle,
        cta_text: nextCtaText,
        cta_link: nextCtaLink,
        secondary_cta_text: nextSecondaryCtaText,
        secondary_cta_link: nextSecondaryCtaLink,
      },
      { onConflict: "tenant_id" }
    );

  if (error) {
    console.error("updateHeroSectionAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Hero bölümü kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  // Hero sadece ana sayfada render ediliyor (bkz. lib/sections/registry.tsx)
  // — Hizmetler/Projeler ile aynı gerekçeyle sadece "/" yeterli, "layout"
  // gereksiz geniş kapsam olurdu (bkz. docs/MIMARI.md madde 10).
  revalidatePath("/");

  return { success: true };
}
