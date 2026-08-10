"use server";

import { revalidatePath } from "next/cache";
import { projectFormSchema, type ProjectFormValues } from "@/lib/validation/project";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getNextOrderIndex } from "@/lib/supabase/panelQueries";

// Hizmetler'deki createServiceAction ile birebir aynı desen (bkz. o
// dosyadaki yorum) — sadece hedef tablo ve alanlar farklı.
export async function createProjectAction(
  _prevState: ActionResult<keyof ProjectFormValues>,
  formData: FormData
): Promise<ActionResult<keyof ProjectFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    location: String(formData.get("location") ?? ""),
    year: String(formData.get("year") ?? ""),
    liveUrl: String(formData.get("liveUrl") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = projectFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof ProjectFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ProjectFormValues;
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

  const orderIndex = await getNextOrderIndex("projects", tenantId);
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("projects").insert({
    tenant_id: tenantId,
    title: result.data.title,
    description: result.data.description || null,
    category: result.data.category || null,
    location: result.data.location || null,
    year: result.data.year ? Number(result.data.year) : null,
    live_url: result.data.liveUrl || null,
    is_published: result.data.isPublished,
    order_index: orderIndex,
  });

  if (error) {
    console.error("createProjectAction insert hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Proje kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  // Projeler bölümü de sadece ana sayfada ("/") render ediliyor (bkz.
  // createServiceAction'daki aynı gerekçe).
  revalidatePath("/");

  return { success: true };
}

// updateServiceAction ile birebir aynı desen (bkz. hizmetler/actions.ts).
export async function updateProjectAction(
  id: string,
  _prevState: ActionResult<keyof ProjectFormValues>,
  formData: FormData
): Promise<ActionResult<keyof ProjectFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    location: String(formData.get("location") ?? ""),
    year: String(formData.get("year") ?? ""),
    liveUrl: String(formData.get("liveUrl") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = projectFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof ProjectFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ProjectFormValues;
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

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .update({
      title: result.data.title,
      description: result.data.description || null,
      category: result.data.category || null,
      location: result.data.location || null,
      year: result.data.year ? Number(result.data.year) : null,
      live_url: result.data.liveUrl || null,
      is_published: result.data.isPublished,
    })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("updateProjectAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Proje güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath("/");

  return { success: true };
}

export interface DeleteState {
  success: boolean;
  formError?: string;
}

// deleteServiceAction ile birebir aynı desen (bkz. hizmetler/actions.ts).
export async function deleteProjectAction(
  _prevState: DeleteState,
  formData: FormData
): Promise<DeleteState> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, formError: authCheck.formError };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { success: false, formError: "Geçersiz kayıt." };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return { success: false, formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("deleteProjectAction silme hatası:", error);
    return { success: false, formError: "Proje silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/");

  return { success: true };
}
