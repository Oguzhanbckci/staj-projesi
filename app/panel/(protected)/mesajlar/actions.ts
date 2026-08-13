"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";

export interface MarkReadState {
  success: boolean;
  formError?: string;
}

// Mesaj detay sayfası açıldığında OTOMATİK tetiklenir (bkz.
// MarkMessageReadOnView.tsx) — kullanıcı elle tıklamıyor, "mesajı
// açınca... okundu olarak işaretle" KISITLAR'ın açık isteği. Yine de
// projenin HER yazma işleminin uyduğu kurala tabi:
// requireAdminUser() ilk satır (bkz. docs/MIMARI.md "Sunucu Eylemleri
// Kuralları"), tenant_id ile ekstra kontrol.
//
// 2026-08-18 DÜZELTMESİ (kullanıcı bulgusu — okunmamış mesaj sayısı
// (kenar menüsündeki rozet) sadece sayfa elle yenilenince azalıyordu):
// Önceki yorum "panel force-dynamic, revalidatePath gerekmiyor"
// diyordu — bu YANLIŞTI, deleteMessageAction'daki AYNI dersle
// (bkz. docs/KARAR-GUNLUGU.md): force-dynamic sunucunun HER İSTEĞİ
// yeniden render etmesini garanti eder, ama BU sayfanın (mesaj
// detayı) render'ı, okunmamış sayısını hesaplayan farklı bir dosyada
// (app/panel/(protected)/layout.tsx — üst katman) yeniden çalıştırmaz.
// `revalidatePath("/panel", "layout")` — Next.js dokümanına göre
// (node_modules/next/dist/docs/.../revalidatePath.md, "Revalidating a
// Layout path") bir layout'u VE altındaki TÜM sayfaları (mesaj listesi
// + detay sayfası dahil) tek çağrıyla geçersiz kılıyor — sadece "page"
// tipi (varsayılan) kullansaydık üst katman (rozet) etkilenmezdi.
export async function markMessageReadAction(
  id: string,
  _prevState: MarkReadState,
  _formData: FormData
): Promise<MarkReadState> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, formError: authCheck.formError };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return { success: false, formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: true })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("markMessageReadAction hata:", error);
    return { success: false, formError: "Mesaj okundu olarak işaretlenemedi." };
  }

  revalidatePath("/panel", "layout");

  return { success: true };
}

export interface DeleteMessageState {
  success: boolean;
  formError?: string;
}

// deleteServiceAction (hizmetler/actions.ts) ile BİREBİR aynı desen.
// Kullanıcı isteğiyle eklendi (2026-08-18) — DeleteButton/
// ConfirmDeleteDialog (Hizmetler/Projeler/Referanslar/SSS/Ekip'in
// PAYLAŞTIĞI bileşenler) burada da aynen kullanılıyor, yeni bir onay
// UI'ı icat edilmedi. `revalidatePath("/panel", "layout")` —
// markMessageReadAction'daki AYNI gerekçe: silinen mesaj OKUNMAMIŞ
// olabilir, bu durumda üst katmandaki (layout) rozet sayısı da
// değişmeli — sadece "/panel/mesajlar" sayfasını (page tipi) revalidate
// etmek listeyi günceller ama rozeti GÜNCELLEMEZ.
export async function deleteMessageAction(
  _prevState: DeleteMessageState,
  formData: FormData
): Promise<DeleteMessageState> {
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
    .from("contact_messages")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("deleteMessageAction silme hatası:", error);
    return { success: false, formError: "Mesaj silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  revalidatePath("/panel", "layout");

  return { success: true };
}
