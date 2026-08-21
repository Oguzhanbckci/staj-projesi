"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getSeoSettings } from "@/lib/supabase/panelQueries";
import {
  detectImageSignature,
  formatMegabytes,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/supabase/imageValidation";

const BUCKET = "branding";

export interface ImageActionState {
  success: boolean;
  formError?: string;
}

// ../tema/imageActions.ts'teki uploadLogoAction'ın birebir aynı deseni —
// aynı "branding" bucket'ı, hedef kolon `og_image_path`. Sosyal medya
// paylaşım görseli için de aynı JPEG/PNG/WEBP kontrolü kullanılıyor.
export async function uploadOgImageAction(
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

  const current = await getSeoSettings();
  if (!current) {
    return { success: false, formError: "Ayarlar bulunamadı." };
  }

  const supabase = await createServerSupabaseClient();
  const path = `${tenantId}/og-${randomUUID()}.${signature.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: signature.mimeType, upsert: false });

  if (uploadError) {
    console.error("uploadOgImageAction Storage hatası:", uploadError);
    return {
      success: false,
      formError: "Paylaşım görseli yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  // `.update()` DEĞİL `.upsert()` — 2026-08-20 denetimindeki bulgu 08'in
  // aynısı, o düzeltme bu üç görsel yükleme eylemine (logo/favicon/OG)
  // taşınmamıştı: düz update eşleşen satır yoksa HATA VERMEZ, sıfır satır
  // yazar ve eylem yine `{ success: true }` döner — panel "yüklendi" der,
  // dosya Storage'a gerçekten yazılmıştır ama sitede hiç görünmez ve her
  // yeni deneme bir yetim dosya daha bırakır.
  //
  // Yukarıdaki `if (!current)` bekçisi bunu YAKALAMAZ: getThemeSettings/
  // getSeoSettings sorguyu `tenants` üzerinden nested embed ile yapıyor,
  // yani site_settings satırı hiç yokken bile null değil bir nesne döner
  // (firma adı/domain tenants'tan gelir). hero/hakkımızda'daki aynı
  // dosyalarda `.update()` BİLEREK tercih edilmişti ve orada geçerli,
  // çünkü o bekçiler kendi tablolarını doğrudan sorguluyor.
  //
  // site_settings_tenant_id_key UNIQUE kısıtı onConflict'i güvenli kılıyor.
  const { error: updateError } = await supabase
    .from("site_settings")
    .upsert(
      { tenant_id: tenantId, og_image_path: path },
      { onConflict: "tenant_id" }
    );

  if (updateError) {
    console.error("uploadOgImageAction DB güncelleme hatası:", updateError);
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      console.error("uploadOgImageAction temizlik hatası (yetim dosya kalmış olabilir):", cleanupError);
    }
    return {
      success: false,
      formError: "Paylaşım görseli kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  if (current.ogImagePath && current.ogImagePath !== path) {
    const { error: oldRemoveError } = await supabase.storage.from(BUCKET).remove([current.ogImagePath]);
    if (oldRemoveError) {
      console.error("uploadOgImageAction eski görsel silme hatası:", oldRemoveError);
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteOgImageAction(
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
    console.error("deleteOgImageAction Storage silme hatası:", removeError);
    return {
      success: false,
      formError: "Paylaşım görseli silinirken bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }

  const { error: clearError } = await supabase
    .from("site_settings")
    .update({ og_image_path: null })
    .eq("tenant_id", tenantId)
    .eq("og_image_path", path);

  if (clearError) {
    console.error("deleteOgImageAction referans temizleme hatası:", clearError);
  }

  revalidatePath("/", "layout");
  return { success: true };
}
