"use server";

import { revalidatePath } from "next/cache";
import {
  parseRatingInput,
  testimonialFormSchema,
  type TestimonialFormValues,
} from "@/lib/validation/testimonial";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getNextOrderIndex, getTestimonialById, swapOrderIndex } from "@/lib/supabase/panelQueries";

// app/panel/(protected)/icerikler/hizmetler/actions.ts'teki
// createServiceAction ile birebir aynı desen — sadece hedef tablo/alanlar
// farklı. Referanslar bölümü de ziyaretçi sitesinde sadece ana sayfada
// ("/") render ediliyor (page_sections'a göre).
export async function createTestimonialAction(
  _prevState: ActionResult<keyof TestimonialFormValues>,
  formData: FormData
): Promise<ActionResult<keyof TestimonialFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    authorName: String(formData.get("authorName") ?? ""),
    authorTitle: String(formData.get("authorTitle") ?? ""),
    quote: String(formData.get("quote") ?? ""),
    rating: String(formData.get("rating") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = testimonialFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof TestimonialFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof TestimonialFormValues;
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

  const orderIndex = await getNextOrderIndex("testimonials", tenantId);
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("testimonials").insert({
    tenant_id: tenantId,
    author_name: result.data.authorName,
    author_title: result.data.authorTitle || null,
    quote: result.data.quote,
    // Number() DEĞİL parseRatingInput — şemanın kabul ettiği "4,5" biçimini de
    // doğru çevirsin ve doğrulama ile çevirme mantığı ayrışmasın
    // (bkz. lib/validation/testimonial.ts, 2026-08-20 denetimi bulgu 06).
    rating: result.data.rating ? parseRatingInput(result.data.rating) : null,
    is_published: result.data.isPublished,
    order_index: orderIndex,
  });

  if (error) {
    console.error("createTestimonialAction insert hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Referans kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath("/");

  return { success: true };
}

// updateServiceAction ile aynı desen (dirty-check dahil).
export async function updateTestimonialAction(
  id: string,
  _prevState: ActionResult<keyof TestimonialFormValues>,
  formData: FormData
): Promise<ActionResult<keyof TestimonialFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    authorName: String(formData.get("authorName") ?? ""),
    authorTitle: String(formData.get("authorTitle") ?? ""),
    quote: String(formData.get("quote") ?? ""),
    rating: String(formData.get("rating") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = testimonialFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof TestimonialFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof TestimonialFormValues;
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

  const current = await getTestimonialById(id);
  if (!current) {
    return { success: false, fieldErrors: {}, formError: "Kayıt bulunamadı." };
  }

  const nextAuthorTitle = result.data.authorTitle || null;
  const nextRating = result.data.rating ? parseRatingInput(result.data.rating) : null;
  const hasChanges =
    current.authorName !== result.data.authorName ||
    current.authorTitle !== nextAuthorTitle ||
    current.quote !== result.data.quote ||
    current.rating !== nextRating ||
    current.isPublished !== result.data.isPublished;

  if (!hasChanges) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("testimonials")
    .update({
      author_name: result.data.authorName,
      author_title: nextAuthorTitle,
      quote: result.data.quote,
      rating: nextRating,
      is_published: result.data.isPublished,
    })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("updateTestimonialAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Referans güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath("/");

  return { success: true };
}

export interface ToggleState {
  success: boolean;
  formError?: string;
}

export async function toggleTestimonialPublishedAction(
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
    .from("testimonials")
    .select("is_published")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (fetchError || !current) {
    return { success: false, formError: "Kayıt bulunamadı." };
  }

  const { error } = await supabase
    .from("testimonials")
    .update({ is_published: !current.is_published })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("toggleTestimonialPublishedAction hata:", error);
    return { success: false, formError: "Yayın durumu değiştirilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/");

  return { success: true };
}

export interface MoveState {
  success: boolean;
  formError?: string;
}

export async function moveTestimonialOrderAction(
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

  const result = await swapOrderIndex("testimonials", id, direction, tenantId);
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

export async function deleteTestimonialAction(
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
    .from("testimonials")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("deleteTestimonialAction silme hatası:", error);
    return { success: false, formError: "Referans silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/");

  return { success: true };
}
