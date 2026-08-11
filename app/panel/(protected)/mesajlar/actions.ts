"use server";

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
// Kuralları"), tenant_id ile ekstra kontrol. `revalidatePath`
// ÇAĞRILMIYOR — panel zaten force-dynamic, ayrıca gerekmiyor (bkz.
// docs/MIMARI.md madde 10, kural 5).
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

  return { success: true };
}
