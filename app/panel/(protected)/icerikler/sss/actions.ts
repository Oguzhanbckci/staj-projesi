"use server";

import { revalidatePath } from "next/cache";
import { faqFormSchema, type FaqFormValues } from "@/lib/validation/faq";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getFaqById, getNextOrderIndex, swapOrderIndex } from "@/lib/supabase/panelQueries";

// app/panel/(protected)/icerikler/hizmetler/actions.ts'teki
// createServiceAction ile birebir aynı desen. SSS bölümü de ziyaretçi
// sitesinde sadece ana sayfada ("/") render ediliyor.
export async function createFaqAction(
  _prevState: ActionResult<keyof FaqFormValues>,
  formData: FormData
): Promise<ActionResult<keyof FaqFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = faqFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof FaqFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FaqFormValues;
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

  const orderIndex = await getNextOrderIndex("faqs", tenantId);
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("faqs").insert({
    tenant_id: tenantId,
    question: result.data.question,
    answer: result.data.answer,
    is_published: result.data.isPublished,
    order_index: orderIndex,
  });

  if (error) {
    console.error("createFaqAction insert hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Soru kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath("/");

  return { success: true };
}

export async function updateFaqAction(
  id: string,
  _prevState: ActionResult<keyof FaqFormValues>,
  formData: FormData
): Promise<ActionResult<keyof FaqFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = faqFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof FaqFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FaqFormValues;
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

  const current = await getFaqById(id);
  if (!current) {
    return { success: false, fieldErrors: {}, formError: "Kayıt bulunamadı." };
  }

  const hasChanges =
    current.question !== result.data.question ||
    current.answer !== result.data.answer ||
    current.isPublished !== result.data.isPublished;

  if (!hasChanges) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("faqs")
    .update({
      question: result.data.question,
      answer: result.data.answer,
      is_published: result.data.isPublished,
    })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("updateFaqAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Soru güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath("/");

  return { success: true };
}

export interface ToggleState {
  success: boolean;
  formError?: string;
}

export async function toggleFaqPublishedAction(
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
    .from("faqs")
    .select("is_published")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (fetchError || !current) {
    return { success: false, formError: "Kayıt bulunamadı." };
  }

  const { error } = await supabase
    .from("faqs")
    .update({ is_published: !current.is_published })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("toggleFaqPublishedAction hata:", error);
    return { success: false, formError: "Yayın durumu değiştirilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/");

  return { success: true };
}

export interface MoveState {
  success: boolean;
  formError?: string;
}

export async function moveFaqOrderAction(
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

  const result = await swapOrderIndex("faqs", id, direction, tenantId);
  if (!result.ok) {
    return { success: false, formError: result.error };
  }

  revalidatePath("/");

  return { success: true };
}

export interface DeleteState {
  success: boolean;
  formError?: string;
}

export async function deleteFaqAction(
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
  const { error } = await supabase.from("faqs").delete().eq("id", id).eq("tenant_id", tenantId);

  if (error) {
    console.error("deleteFaqAction silme hatası:", error);
    return { success: false, formError: "Soru silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/");

  return { success: true };
}
