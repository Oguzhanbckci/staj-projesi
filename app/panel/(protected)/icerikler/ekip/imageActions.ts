"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getTeamMemberById } from "@/lib/supabase/panelQueries";
import {
  detectImageSignature,
  formatMegabytes,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/supabase/imageValidation";

const BUCKET = "team";
// Ekip 2026-08-13'ten beri ayrı bir sayfa (app/(site)/ekip/page.tsx),
// page_sections'a bağlı bir ana sayfa bölümü DEĞİL — bkz.
// app/panel/(protected)/icerikler/ekip/actions.ts'teki aynı sabit.
const REVALIDATE_PATH = "/ekip";

// app/panel/(protected)/icerikler/projeler/imageActions.ts ile BİREBİR
// aynı desen — kolon adı `photo_path`.
export interface ImageActionState {
  success: boolean;
  formError?: string;
}

export async function uploadTeamMemberImageAction(
  id: string,
  _prevState: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, formError: authCheck.formError };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, formError: "Lütfen bir görsel dosyası seçin." };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      success: false,
      formError: `Dosya boyutu ${formatMegabytes(file.size)}, izin verilen üst sınır ${formatMegabytes(MAX_IMAGE_SIZE_BYTES)}. Telefonunuzun galeri/paylaşım ekranında "küçük" veya "orta boyut" seçeneğini kullanarak tekrar deneyin.`,
    };
  }

  const signature = await detectImageSignature(file);
  if (!signature) {
    return {
      success: false,
      formError: "Sadece JPEG, PNG veya WEBP formatında görsel yükleyebilirsiniz.",
    };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return { success: false, formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin." };
  }

  const current = await getTeamMemberById(id);
  if (!current) {
    return { success: false, formError: "Ekip üyesi bulunamadı." };
  }

  const supabase = await createServerSupabaseClient();
  const path = `${tenantId}/${randomUUID()}.${signature.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: signature.mimeType, upsert: false });

  if (uploadError) {
    console.error("uploadTeamMemberImageAction Storage hatası:", uploadError);
    return { success: false, formError: "Görsel yüklenirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  const { error: updateError } = await supabase
    .from("team_members")
    .update({ photo_path: path })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (updateError) {
    console.error("uploadTeamMemberImageAction DB güncelleme hatası:", updateError);
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      console.error(
        "uploadTeamMemberImageAction temizlik hatası (yetim dosya kalmış olabilir):",
        cleanupError
      );
    }
    return { success: false, formError: "Görsel kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  if (current.photoPath && current.photoPath !== path) {
    const { error: oldRemoveError } = await supabase.storage.from(BUCKET).remove([current.photoPath]);
    if (oldRemoveError) {
      console.error("uploadTeamMemberImageAction eski görsel silme hatası:", oldRemoveError);
    }
  }

  revalidatePath(REVALIDATE_PATH);

  return { success: true };
}

export async function deleteTeamMemberImageAction(
  _prevState: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  const authCheck = await requireAdminUser();
  if (!authCheck.ok) {
    return { success: false, formError: authCheck.formError };
  }

  const path = String(formData.get("id") ?? "");
  if (!path) {
    return { success: false, formError: "Geçersiz görsel." };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return { success: false, formError: "Aktif site bulunamadı, lütfen daha sonra tekrar deneyin." };
  }

  if (!path.startsWith(`${tenantId}/`)) {
    return { success: false, formError: "Geçersiz görsel." };
  }

  const supabase = await createServerSupabaseClient();

  const { error: removeError } = await supabase.storage.from(BUCKET).remove([path]);
  if (removeError) {
    console.error("deleteTeamMemberImageAction Storage silme hatası:", removeError);
    return { success: false, formError: "Görsel silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  const { error: clearError } = await supabase
    .from("team_members")
    .update({ photo_path: null })
    .eq("tenant_id", tenantId)
    .eq("photo_path", path);

  if (clearError) {
    console.error("deleteTeamMemberImageAction referans temizleme hatası:", clearError);
  }

  revalidatePath(REVALIDATE_PATH);

  return { success: true };
}
