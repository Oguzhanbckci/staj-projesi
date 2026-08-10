"use server";

import { revalidatePath } from "next/cache";
import { serviceFormSchema, type ServiceFormValues } from "@/lib/validation/service";
import { requireAdminUser, type ActionResult } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getNextOrderIndex, getServiceById, swapOrderIndex } from "@/lib/supabase/panelQueries";

// Yeni bir hizmet ekler. KISITLAR/KABUL KRİTERİ'nin hepsi burada:
// 1) oturum kontrolü eylemin içinde, 2) istemciden gelen veriye
// güvenilmez — aynı zod şeması sunucuda tekrar çalıştırılır, 3) hata
// durumunda anlamlı/Türkçe mesaj döner, ham DB hatası hiç kullanıcıya
// gitmez (sadece sunucu konsoluna loglanır), 4) dönüş tipi
// ActionResult<T> ile başarı/hata ayırt edilebilir, 5) başarıda ilgili
// yol yeniden üretilir.
export async function createServiceAction(
  _prevState: ActionResult<keyof ServiceFormValues>,
  formData: FormData
): Promise<ActionResult<keyof ServiceFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    icon: String(formData.get("icon") ?? ""),
    // Checkbox işaretli değilse FormData'da hiç anahtar olarak görünmez —
    // bu yüzden "on" karşılaştırması, boolean'a burada (şemadan ÖNCE)
    // çeviriliyor; şema saf kalsın diye bu dönüşüm şemanın kendisinde
    // değil (bkz. lib/validation/service.ts).
    isPublished: formData.get("isPublished") === "on",
  };

  const result = serviceFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof ServiceFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ServiceFormValues;
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

  const orderIndex = await getNextOrderIndex("services", tenantId);
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("services").insert({
    tenant_id: tenantId,
    title: result.data.title,
    description: result.data.description || null,
    icon: result.data.icon || null,
    is_published: result.data.isPublished,
    order_index: orderIndex,
  });

  if (error) {
    // KABUL KRİTERİ: "Veritabanı hatası kullanıcıya ham şekilde
    // gösterilmesin ama sunucuda loglansın."
    console.error("createServiceAction insert hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Hizmet kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  // Hizmetler bölümü ziyaretçi sitesinde SADECE ana sayfada ("/") render
  // ediliyor (page_sections'a göre, bkz. components/site/services/
  // ServicesSection.tsx) — doğru yeniden üretilecek yol budur.
  // /panel zaten force-dynamic (bkz. (protected)/layout.tsx), o yüzden
  // panel tarafında ayrıca bir revalidate gerekmiyor.
  revalidatePath("/");

  return { success: true };
}

// Mevcut bir hizmeti günceller. `id`, `useActionState`'in (prevState,
// formData) imzasından ÖNCE `.bind(null, id)` ile bağlanır (bkz.
// ServiceForm.tsx) — Next.js'in Server Action'lara ekstra bağlam geçirme
// yöntemi budur. Geri kalan her şey createServiceAction'la aynı desen.
export async function updateServiceAction(
  id: string,
  _prevState: ActionResult<keyof ServiceFormValues>,
  formData: FormData
): Promise<ActionResult<keyof ServiceFormValues>> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, fieldErrors: {}, formError: authCheck.formError };
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    icon: String(formData.get("icon") ?? ""),
    isPublished: formData.get("isPublished") === "on",
  };

  const result = serviceFormSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Partial<Record<keyof ServiceFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ServiceFormValues;
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

  // Değişiklik yoksa yazma yapma: mevcut kaydı çekip doğrulanmış yeni
  // değerlerle alan alan karşılaştır. Fark yoksa DB'ye hiç yazılmaz,
  // revalidatePath de çağrılmaz — kullanıcı yine "Değişiklikler
  // kaydedildi" görür (davranış farkı sadece gereksiz işin atlanması).
  const current = await getServiceById(id);
  if (!current) {
    return { success: false, fieldErrors: {}, formError: "Kayıt bulunamadı." };
  }

  const nextDescription = result.data.description || null;
  const nextIcon = result.data.icon || null;
  const hasChanges =
    current.title !== result.data.title ||
    current.description !== nextDescription ||
    current.icon !== nextIcon ||
    current.isPublished !== result.data.isPublished;

  if (!hasChanges) {
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  // `tenant_id` eşleşmesi de aranıyor — bir tenant'ın kaydı başka bir
  // tenant'ın id'siyle (URL'den elle değiştirilerek) güncellenemesin diye
  // ekstra bir savunma katmanı (RLS zaten authenticated'e tam yetki
  // veriyor, bu ONA GÜVENMEK YERİNE ek bir kontrol).
  const { error } = await supabase
    .from("services")
    .update({
      title: result.data.title,
      description: nextDescription,
      icon: nextIcon,
      is_published: result.data.isPublished,
    })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("updateServiceAction güncelleme hatası:", error);
    return {
      success: false,
      fieldErrors: {},
      formError: "Hizmet güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  revalidatePath("/");

  return { success: true };
}

export interface ToggleState {
  success: boolean;
  formError?: string;
}

// Listeden tek tıkla yayın durumunu tersine çevirir (bkz.
// components/panel/PublishToggleButton.tsx). `id` `.bind(null, id)` ile
// önceden bağlanır — updateServiceAction'daki aynı kalıp.
export async function toggleServicePublishedAction(
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
    .from("services")
    .select("is_published")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (fetchError || !current) {
    return { success: false, formError: "Kayıt bulunamadı." };
  }

  const { error } = await supabase
    .from("services")
    .update({ is_published: !current.is_published })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("toggleServicePublishedAction hata:", error);
    return { success: false, formError: "Yayın durumu değiştirilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/");

  return { success: true };
}

export interface MoveState {
  success: boolean;
  formError?: string;
}

// Yukarı/aşağı taşıma — komşu kayıtla order_index takası (bkz.
// lib/supabase/panelQueries.ts swapOrderIndex, components/panel/
// ReorderButtons.tsx).
export async function moveServiceOrderAction(
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

  const result = await swapOrderIndex("services", id, direction, tenantId);
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

// Bir hizmeti siler. `useActionState` ile kullanıldığı için (prevState,
// formData) imzası — bkz. components/panel/DeleteButton.tsx.
export async function deleteServiceAction(
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
    .from("services")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("deleteServiceAction silme hatası:", error);
    return { success: false, formError: "Hizmet silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/");

  return { success: true };
}
