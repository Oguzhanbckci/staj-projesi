"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getTestimonialById } from "@/lib/supabase/panelQueries";
import {
  detectImageSignature,
  formatMegabytes,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/supabase/imageValidation";

const BUCKET = "testimonials";

// app/panel/(protected)/icerikler/projeler/imageActions.ts ile BİREBİR
// aynı desen — kolon adı `logo_path` (referans veren kişinin/firmanın
// logosu, `image_path` değil).
export interface ImageActionState {
  success: boolean;
  formError?: string;
}

export async function uploadTestimonialImageAction(
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

  const current = await getTestimonialById(id);
  if (!current) {
    return { success: false, formError: "Referans bulunamadı." };
  }

  const supabase = await createServerSupabaseClient();
  const path = `${tenantId}/${randomUUID()}.${signature.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: signature.mimeType, upsert: false });

  if (uploadError) {
    console.error("uploadTestimonialImageAction Storage hatası:", uploadError);
    return { success: false, formError: "Görsel yüklenirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  const { error: updateError } = await supabase
    .from("testimonials")
    .update({ logo_path: path })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (updateError) {
    console.error("uploadTestimonialImageAction DB güncelleme hatası:", updateError);
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      console.error(
        "uploadTestimonialImageAction temizlik hatası (yetim dosya kalmış olabilir):",
        cleanupError
      );
    }
    return { success: false, formError: "Görsel kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  if (current.logoPath && current.logoPath !== path) {
    const { error: oldRemoveError } = await supabase.storage.from(BUCKET).remove([current.logoPath]);
    if (oldRemoveError) {
      console.error("uploadTestimonialImageAction eski görsel silme hatası:", oldRemoveError);
    }
  }

  revalidatePath("/");

  return { success: true };
}

export async function deleteTestimonialImageAction(
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
    console.error("deleteTestimonialImageAction Storage silme hatası:", removeError);
    return { success: false, formError: "Görsel silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  const { error: clearError } = await supabase
    .from("testimonials")
    .update({ logo_path: null })
    .eq("tenant_id", tenantId)
    .eq("logo_path", path);

  if (clearError) {
    console.error("deleteTestimonialImageAction referans temizleme hatası:", clearError);
  }

  revalidatePath("/");

  return { success: true };
}
