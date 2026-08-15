"use server";

import { revalidatePath } from "next/cache";
import { aboutFormSchema, type AboutFormValues } from "@/lib/validation/about";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getAboutSettings } from "@/lib/supabase/panelQueries";

// ../hero/actions.ts (updateHeroSectionAction) ile aynı iskelet — aynı
// gerekçeyle upsert kullanır (bkz. o dosyadaki yorum). Tek fark:
// `coreValues` metni burada satır satır bölünüp gerçek bir diziye
// çevriliyor (`about_sections.core_values` bir `text[]` kolonu, bkz.
// docs/VERİ-MODELİ.md) — bu dönüşüm BİLEREK zod şemasının DIŞINDA (şema
// sadece ham metni doğrular, DB'ye yazılacak şekle çevirmek bu dosyanın
// işi, lib/validation/about.ts'teki yorumla tutarlı).
function parseCoreValues(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function coreValuesEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export async function updateAboutSectionAction(
  _prevState: ActionResult<keyof AboutFormValues>,
  formData: FormData
): Promise<ActionResult<keyof AboutFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    foundedYear: String(formData.get("foundedYear") ?? ""),
    coreValues: String(formData.get("coreValues") ?? ""),
  };

  const result = aboutFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof AboutFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof AboutFormValues;
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
  const nextDescription = data.description || null;
  const nextFoundedYear = data.foundedYear ? Number(data.foundedYear) : null;
  const nextCoreValues = parseCoreValues(data.coreValues ?? "");

  const current = await getAboutSettings();
  const hasChanges =
    !current ||
    current.title !== data.title ||
    current.description !== nextDescription ||
    current.foundedYear !== nextFoundedYear ||
    !coreValuesEqual(current.coreValues, nextCoreValues);

  if (!hasChanges) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("about_sections")
    .upsert(
      {
        tenant_id: tenantId,
        title: data.title,
        description: nextDescription,
        founded_year: nextFoundedYear,
        core_values: nextCoreValues,
      },
      { onConflict: "tenant_id" }
    );

  if (error) {
    console.error("updateAboutSectionAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Hakkımızda bölümü kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  // Hakkımızda sadece ana sayfada render ediliyor — Hero ile aynı gerekçe
  // (bkz. ../hero/actions.ts).
  revalidatePath("/");

  return { success: true };
}
