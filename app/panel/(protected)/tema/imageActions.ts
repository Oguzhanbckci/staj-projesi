"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getThemeSettings } from "@/lib/supabase/panelQueries";
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

// icerikler/projeler/imageActions.ts'teki uploadProjectImageAction'ın
// birebir aynı deseni — farkları: `id` parametresi YOK (site_settings
// tenant başına tek satır, projelerdeki gibi bir kayıt id'sine gerek yok),
// hedef kolon `logo_path`, `.eq("tenant_id", ...)` ile güncelleniyor.
// Logo/favicon için AYRI eylem tercih edildi (tek generic `field`
// parametreli fonksiyon yerine) — her biri farklı DB kolonuna yazıyor,
// ayrı kalmak güvenlik-kritik kodun (requireAdminUser + doğrulama +
// atomiklik) her dalını izole/okunabilir tutuyor (bkz. docs/KARAR-GUNLUGU.md,
// 2026-08-15).
export async function uploadLogoAction(
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

  const current = await getThemeSettings();
  if (!current) {
    return { success: false, formError: "Ayarlar bulunamadı." };
  }

  const supabase = await createServerSupabaseClient();
  const path = `${tenantId}/logo-${randomUUID()}.${signature.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: signature.mimeType, upsert: false });

  if (uploadError) {
    console.error("uploadLogoAction Storage hatası:", uploadError);
    return { success: false, formError: "Logo yüklenirken bir sorun oluştu. Lütfen tekrar deneyin." };
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
      { tenant_id: tenantId, logo_path: path },
      { onConflict: "tenant_id" }
    );

  if (updateError) {
    console.error("uploadLogoAction DB güncelleme hatası:", updateError);
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      console.error("uploadLogoAction temizlik hatası (yetim dosya kalmış olabilir):", cleanupError);
    }
    return { success: false, formError: "Logo kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  if (current.logoPath && current.logoPath !== path) {
    const { error: oldRemoveError } = await supabase.storage.from(BUCKET).remove([current.logoPath]);
    if (oldRemoveError) {
      console.error("uploadLogoAction eski logo silme hatası:", oldRemoveError);
    }
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function deleteLogoAction(
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
    console.error("deleteLogoAction Storage silme hatası:", removeError);
    return { success: false, formError: "Logo silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  const { error: clearError } = await supabase
    .from("site_settings")
    .update({ logo_path: null })
    .eq("tenant_id", tenantId)
    .eq("logo_path", path);

  if (clearError) {
    console.error("deleteLogoAction referans temizleme hatası:", clearError);
  }

  revalidatePath("/", "layout");

  return { success: true };
}

// uploadLogoAction'ın birebir aynı deseni, hedef kolon `favicon_path`.
// Favicon için de aynı JPEG/PNG/WEBP kontrolü kullanılıyor (ICO
// desteklenmiyor, kapsam dışı — modern tarayıcılar PNG favicon'u sorunsuz
// gösteriyor, panel formunda bunu belirten bir yardım metni var).
export async function uploadFaviconAction(
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

  const current = await getThemeSettings();
  if (!current) {
    return { success: false, formError: "Ayarlar bulunamadı." };
  }

  const supabase = await createServerSupabaseClient();
  const path = `${tenantId}/favicon-${randomUUID()}.${signature.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: signature.mimeType, upsert: false });

  if (uploadError) {
    console.error("uploadFaviconAction Storage hatası:", uploadError);
    return { success: false, formError: "Favicon yüklenirken bir sorun oluştu. Lütfen tekrar deneyin." };
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
      { tenant_id: tenantId, favicon_path: path },
      { onConflict: "tenant_id" }
    );

  if (updateError) {
    console.error("uploadFaviconAction DB güncelleme hatası:", updateError);
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      console.error("uploadFaviconAction temizlik hatası (yetim dosya kalmış olabilir):", cleanupError);
    }
    return { success: false, formError: "Favicon kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  if (current.faviconPath && current.faviconPath !== path) {
    const { error: oldRemoveError } = await supabase.storage.from(BUCKET).remove([current.faviconPath]);
    if (oldRemoveError) {
      console.error("uploadFaviconAction eski favicon silme hatası:", oldRemoveError);
    }
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function deleteFaviconAction(
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
    console.error("deleteFaviconAction Storage silme hatası:", removeError);
    return { success: false, formError: "Favicon silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  const { error: clearError } = await supabase
    .from("site_settings")
    .update({ favicon_path: null })
    .eq("tenant_id", tenantId)
    .eq("favicon_path", path);

  if (clearError) {
    console.error("deleteFaviconAction referans temizleme hatası:", clearError);
  }

  revalidatePath("/", "layout");

  return { success: true };
}
