"use server";

import { revalidatePath } from "next/cache";
import { teamMemberFormSchema, type TeamMemberFormValues } from "@/lib/validation/teamMember";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getNextOrderIndex, getTeamMemberById, swapOrderIndex } from "@/lib/supabase/panelQueries";

// DİKKAT: Ekip 2026-08-13'ten beri page_sections'a bağlı bir ana sayfa
// bölümü DEĞİL, ayrı bir sayfa (app/(site)/ekip/page.tsx) — bu yüzden
// her yazma işleminden sonra revalidatePath("/ekip") çağrılır, "/" DEĞİL
// (diğer tüm içerik türlerinden farklı, bkz. docs/MIMARI.md madde 10).
const REVALIDATE_PATH = "/ekip";

export async function createTeamMemberAction(
  _prevState: ActionResult<keyof TeamMemberFormValues>,
  formData: FormData
): Promise<ActionResult<keyof TeamMemberFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    role: String(formData.get("role") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = teamMemberFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof TeamMemberFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof TeamMemberFormValues;
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

  const orderIndex = await getNextOrderIndex("team_members", tenantId);
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("team_members").insert({
    tenant_id: tenantId,
    full_name: result.data.fullName,
    role: result.data.role,
    bio: result.data.bio || null,
    is_published: result.data.isPublished,
    order_index: orderIndex,
  });

  if (error) {
    console.error("createTeamMemberAction insert hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Ekip üyesi kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath(REVALIDATE_PATH);

  return { success: true };
}

export async function updateTeamMemberAction(
  id: string,
  _prevState: ActionResult<keyof TeamMemberFormValues>,
  formData: FormData
): Promise<ActionResult<keyof TeamMemberFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    role: String(formData.get("role") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = teamMemberFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof TeamMemberFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof TeamMemberFormValues;
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

  const current = await getTeamMemberById(id);
  if (!current) {
    return { success: false, fieldErrors: {}, formError: "Kayıt bulunamadı." };
  }

  const nextBio = result.data.bio || null;
  const hasChanges =
    current.fullName !== result.data.fullName ||
    current.role !== result.data.role ||
    current.bio !== nextBio ||
    current.isPublished !== result.data.isPublished;

  if (!hasChanges) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("team_members")
    .update({
      full_name: result.data.fullName,
      role: result.data.role,
      bio: nextBio,
      is_published: result.data.isPublished,
    })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("updateTeamMemberAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Ekip üyesi güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath(REVALIDATE_PATH);

  return { success: true };
}

export interface ToggleState {
  success: boolean;
  formError?: string;
}

export async function toggleTeamMemberPublishedAction(
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
    .from("team_members")
    .select("is_published")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (fetchError || !current) {
    return { success: false, formError: "Kayıt bulunamadı." };
  }

  const { error } = await supabase
    .from("team_members")
    .update({ is_published: !current.is_published })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("toggleTeamMemberPublishedAction hata:", error);
    return { success: false, formError: "Yayın durumu değiştirilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath(REVALIDATE_PATH);

  return { success: true };
}

export interface MoveState {
  success: boolean;
  formError?: string;
}

export async function moveTeamMemberOrderAction(
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

  const result = await swapOrderIndex("team_members", id, direction, tenantId);
  if (!result.ok) {
    return { success: false, formError: result.error };
  }

  revalidatePath(REVALIDATE_PATH);

  return { success: true };
}

export interface DeleteState {
  success: boolean;
  formError?: string;
}

export async function deleteTeamMemberAction(
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
    .from("team_members")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("deleteTeamMemberAction silme hatası:", error);
    return { success: false, formError: "Ekip üyesi silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath(REVALIDATE_PATH);

  return { success: true };
}
