"use server";

import { revalidatePath } from "next/cache";
import { projectFormSchema, type ProjectFormValues } from "@/lib/validation/project";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import {
  getAllProjects,
  getNextOrderIndex,
  getProjectById,
  swapOrderIndex,
} from "@/lib/supabase/panelQueries";
import { ensureUniqueSlug, slugify } from "@/lib/slug";

// Bir proje değiştiğinde tazelenmesi gereken ÜÇ statik yüzey var:
// (1) ana sayfadaki Projeler bölümü, (2) projenin KENDİ detay sayfası
// (2026-08-21'de eklendi — /projeler/<slug>, generateStaticParams ile
// build sırasında üretiliyor), (3) sitemap.xml (yayınlanmış projeleri
// listeliyor). Üçü de ayrı ayrı unutulabilir olduğu için tek yerde.
//
// Dinamik rotada `type: "page"` ZORUNLU — bkz. next/dist/docs,
// revalidatePath: "If path contains a dynamic segment ... this parameter
// is required".
function revalidateProjectPaths() {
  revalidatePath("/");
  revalidatePath("/projeler/[slug]", "page");
  revalidatePath("/sitemap.xml");
}
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
    status: String(formData.get("status") ?? ""),
    slug: String(formData.get("slug") ?? ""),
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

  // Adres parçası: kullanıcı girdiyse ondan, girmediyse başlıktan.
  // Benzersizlik tenant içinde kontrol ediliyor — DB'de de
  // `projects_tenant_slug_key` var, yani buradaki kontrol atlansa bile
  // veri bozulmaz, kullanıcı anlaşılmaz bir hata görürdü.
  const mevcutProjeler = await getAllProjects();
  const slug = ensureUniqueSlug(
    slugify(result.data.slug || result.data.title),
    mevcutProjeler.map((p) => p.slug)
  );

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("projects").insert({
    tenant_id: tenantId,
    slug,
    title: result.data.title,
    description: result.data.description || null,
    category: result.data.category || null,
    status: result.data.status || null,
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
  revalidateProjectPaths();

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
    status: String(formData.get("status") ?? ""),
    slug: String(formData.get("slug") ?? ""),
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

  // Değişiklik yoksa yazma yapma — hizmetler/actions.ts'teki
  // updateServiceAction ile aynı kalıp.
  const current = await getProjectById(id);
  if (!current) {
    return { success: false, fieldErrors: {}, formError: "Kayıt bulunamadı." };
  }

  const nextDescription = result.data.description || null;
  const nextCategory = result.data.category || null;
  const nextStatus = result.data.status || null;

  // Slug alanı BOŞSA mevcut adres korunur — başlık değişti diye
  // yayınlanmış bir adresin sessizce kırılması, paylaşılmış her
  // bağlantıyı bozardı. Kullanıcı bilerek yeni bir adres yazarsa
  // benzersizlik kontrolünden KENDİ slug'ı çıkarılıyor, yoksa kayıt
  // kendisiyle çakışıp her kaydedişte "-2" eklerdi.
  const nextSlug = result.data.slug
    ? ensureUniqueSlug(
        slugify(result.data.slug),
        (await getAllProjects()).filter((p) => p.id !== id).map((p) => p.slug)
      )
    : current.slug;
  const nextLocation = result.data.location || null;
  const nextYear = result.data.year ? Number(result.data.year) : null;
  const nextLiveUrl = result.data.liveUrl || null;
  const hasChanges =
    current.title !== result.data.title ||
    current.description !== nextDescription ||
    current.category !== nextCategory ||
    current.status !== nextStatus ||
    current.slug !== nextSlug ||
    current.location !== nextLocation ||
    current.year !== nextYear ||
    current.liveUrl !== nextLiveUrl ||
    current.isPublished !== result.data.isPublished;

  if (!hasChanges) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .update({
      slug: nextSlug,
      title: result.data.title,
      description: nextDescription,
      category: nextCategory,
      status: nextStatus,
      location: nextLocation,
      year: nextYear,
      live_url: nextLiveUrl,
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

  revalidateProjectPaths();

  return { success: true };
}

export interface ToggleState {
  success: boolean;
  formError?: string;
}

// Hizmetler'deki toggleServicePublishedAction ile birebir aynı desen.
export async function toggleProjectPublishedAction(
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
    .from("projects")
    .select("is_published")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (fetchError || !current) {
    return { success: false, formError: "Kayıt bulunamadı." };
  }

  const { error } = await supabase
    .from("projects")
    .update({ is_published: !current.is_published })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("toggleProjectPublishedAction hata:", error);
    return { success: false, formError: "Yayın durumu değiştirilemedi. Lütfen tekrar deneyin." };
  }

  revalidateProjectPaths();

  return { success: true };
}

export interface MoveState {
  success: boolean;
  formError?: string;
}

// Hizmetler'deki moveServiceOrderAction ile birebir aynı desen.
export async function moveProjectOrderAction(
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

  const result = await swapOrderIndex("projects", id, direction, tenantId);
  if (!result.ok) {
    return { success: false, formError: result.error };
  }

  revalidateProjectPaths();

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

  revalidateProjectPaths();

  return { success: true };
}
