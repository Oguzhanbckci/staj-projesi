"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getAboutSettings } from "@/lib/supabase/panelQueries";
import {
  detectImageSignature,
  formatMegabytes,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/supabase/imageValidation";

const BUCKET = "about";

export interface ImageActionState {
  success: boolean;
  formError?: string;
}

// ../hero/imageActions.ts ile birebir aynı desen — hedef bucket "about",
// hedef kolon `image_path`. Aynı gerekçeyle `.update()` (upsert DEĞİL):
// Hakkımızda metninin (actions.ts) en az bir kez kaydedilmiş olması
// gerekiyor (`about_sections.title` NOT NULL).
export async function uploadAboutImageAction(
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

  const current = await getAboutSettings();
  if (!current) {
    return {
      success: false,
      formError: "Önce Hakkımızda başlığını girip kaydedin, sonra görsel yükleyebilirsiniz.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const path = `${tenantId}/${randomUUID()}.${signature.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: signature.mimeType, upsert: false });

  if (uploadError) {
    console.error("uploadAboutImageAction Storage hatası:", uploadError);
    return {
      success: false,
      formError: "Görsel yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  const { error: updateError } = await supabase
    .from("about_sections")
    .update({ image_path: path })
    .eq("tenant_id", tenantId);

  if (updateError) {
    console.error("uploadAboutImageAction DB güncelleme hatası:", updateError);
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      console.error("uploadAboutImageAction temizlik hatası (yetim dosya kalmış olabilir):", cleanupError);
    }
    return {
      success: false,
      formError: "Görsel kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  if (current.imagePath && current.imagePath !== path) {
    const { error: oldRemoveError } = await supabase.storage.from(BUCKET).remove([current.imagePath]);
    if (oldRemoveError) {
      console.error("uploadAboutImageAction eski görsel silme hatası:", oldRemoveError);
    }
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteAboutImageAction(
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
    console.error("deleteAboutImageAction Storage silme hatası:", removeError);
    return {
      success: false,
      formError: "Görsel silinirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  const { error: clearError } = await supabase
    .from("about_sections")
    .update({ image_path: null })
    .eq("tenant_id", tenantId)
    .eq("image_path", path);

  if (clearError) {
    console.error("deleteAboutImageAction referans temizleme hatası:", clearError);
  }

  revalidatePath("/");
  return { success: true };
}
