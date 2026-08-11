"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/panel/actionResult";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { getProjectById } from "@/lib/supabase/panelQueries";
import {
  detectImageSignature,
  formatMegabytes,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/supabase/imageValidation";

const BUCKET = "projects";

export interface ImageActionState {
  success: boolean;
  formError?: string;
}

// Bir projenin görselini yükler/değiştirir — metin alanlarını kaydeden
// updateProjectAction'dan (actions.ts) bilinçli olarak AYRI bir eylem
// (bkz. ProjectImageUploader.tsx). KISITLAR/KABUL KRİTERİ'nin hepsi
// burada: (1) requireAdminUser() ile oturum kontrolü — hem burada hem
// Storage RLS katmanında (bkz. ...migrations/
// 20260814120000_create_projects_storage_bucket.sql) yalnız giriş yapmış
// kullanıcı, (2) tür kontrolü sadece gerçek baytlara (magic number)
// bakıyor — uzantı/tarayıcı MIME'ı hiç kullanılmıyor (bkz.
// lib/supabase/imageValidation.ts), (3) boyut sınırı aşılırsa ne
// yapılması gerektiğini söyleyen somut bir mesaj, (4) benzersiz, kullanıcı
// girdisinden tamamen bağımsız dosya adı — path traversal yapısal olarak
// imkansız, (5) DB yazması başarısız olursa yüklenen dosya hemen silinir
// — yarım/yetim kayıt kalmaz.
export async function uploadProjectImageAction(
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

  // Uzantıya/tarayıcının bildirdiği türe DEĞİL, dosyanın gerçek ilk
  // baytlarına bakılıyor (KISITLAR'ın açık isteği).
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

  const current = await getProjectById(id);
  if (!current) {
    return { success: false, formError: "Proje bulunamadı." };
  }

  const supabase = await createServerSupabaseClient();
  // Kullanıcının gönderdiği dosya adının TEK BİR KARAKTERİ bile yol
  // oluşturmada kullanılmıyor — kötü niyetli bir ad (ör. "../../evil.jpg")
  // gönderilse bile bunun path'e karışması yapısal olarak mümkün değil.
  const path = `${tenantId}/${randomUUID()}.${signature.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: signature.mimeType, upsert: false });

  if (uploadError) {
    console.error("uploadProjectImageAction Storage hatası:", uploadError);
    return { success: false, formError: "Görsel yüklenirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({ image_path: path })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (updateError) {
    console.error("uploadProjectImageAction DB güncelleme hatası:", updateError);
    // Telafi edici temizlik — DB'ye yazılamayan bir dosya Storage'da
    // yetim kalmasın (KABUL KRİTERİ: "yarım kayıt kalmasın").
    const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([path]);
    if (cleanupError) {
      console.error(
        "uploadProjectImageAction temizlik hatası (yetim dosya kalmış olabilir):",
        cleanupError
      );
    }
    return { success: false, formError: "Görsel kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  // Eski görsel varsa (değiştiriliyorsa) best-effort sil — başarısız olsa
  // da işlemi başarısız SAYMAZ (asıl kritik olan yeni görselin doğru
  // kaydedilmiş olması), sadece loglanır.
  if (current.imagePath && current.imagePath !== path) {
    const { error: oldRemoveError } = await supabase.storage.from(BUCKET).remove([current.imagePath]);
    if (oldRemoveError) {
      console.error("uploadProjectImageAction eski görsel silme hatası:", oldRemoveError);
    }
  }

  // Projeler ziyaretçi sitesinde sadece ana sayfada ("/") render ediliyor.
  revalidatePath("/");

  return { success: true };
}

// Bir görseli Storage'dan siler + varsa onu kullanan projenin
// image_path'ini null'a çeker — kırık bir görsel referansı sitede
// kalmasın. `id` FormData alanı projenin id'si DEĞİL, silinecek
// görselin Storage path'idir (bkz. ConfirmDeleteDialog/DeleteButton —
// bu iki bileşen generic, "id" prop'una hangi anlamda bir değer
// verildiğini bilmez, sadece gizli forma yazar). Hem
// ProjectImageUploader.tsx'teki "Kaldır" butonu hem
// app/panel/(protected)/medya/ (Medya Kütüphanesi) "Sil" butonu bu AYNI
// eylemi kullanır — path'i kullanan proje aranırken belirli bir id'ye
// değil, path eşleşmesine bakılır, bu yüzden iki farklı çağrı yeri için
// de doğru çalışır.
export async function deleteProjectImageAction(
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

  // path her zaman "<tenantId>/<uuid>.<uzanti>" biçiminde üretiliyor
  // (bkz. uploadProjectImageAction) — bu ön ek kontrolü, ileride birden
  // fazla gerçek tenant olduğunda birinin diğerinin görsel yolunu
  // silmeye çalışamamasını garanti eden ekstra bir savunma katmanı (RLS
  // zaten authenticated'e tam yetki veriyor, bu ONA GÜVENMEK YERİNE ek
  // bir kontrol — DB satırlarındaki .eq("tenant_id", tenantId) ile aynı
  // ilke).
  if (!path.startsWith(`${tenantId}/`)) {
    return { success: false, formError: "Geçersiz görsel." };
  }

  const supabase = await createServerSupabaseClient();

  const { error: removeError } = await supabase.storage.from(BUCKET).remove([path]);
  if (removeError) {
    console.error("deleteProjectImageAction Storage silme hatası:", removeError);
    return { success: false, formError: "Görsel silinirken bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  const { error: clearError } = await supabase
    .from("projects")
    .update({ image_path: null })
    .eq("tenant_id", tenantId)
    .eq("image_path", path);

  if (clearError) {
    // Storage'dan silme zaten başarılı oldu — bu adım sadece kırık bir
    // referans kalmasın diye ek bir temizlik, başarısız olsa da asıl
    // silme işlemini başarısız SAYMAZ, loglanır.
    console.error("deleteProjectImageAction referans temizleme hatası:", clearError);
  }

  revalidatePath("/");

  return { success: true };
}
