// Bu modul BILEREK zod'a dokunmuyor. Sebebi olculdu (2026-08-21 denetimi):
// istemci bilesenleri yalnizca asagidaki duz sabitleri kullaniyor, ama
// bunlar zod semasiyla AYNI dosyada durdugu icin zod kutuphanesinin TAMAMI
// tarayiciya iniyordu — ana sayfa JS'inin %35,5'i (283.405 bayt ham /
// 63.885 gzip) saf zoddu ve tarayicida tek bir sema calismiyordu (form
// dogrulamasi Server Action'da yapiliyor).
//
// KURAL: buraya zod import EDILMEZ. Yeni bir sabiti istemci bileseni
// kullanacaksa buraya, yalnizca sema kullanacaksa ./project.ts icine yazilir.
// Asagidaki `import type` derlemede tamamen silinir, calisma zamani
// bagimliligi dogurmaz.

import type { ProjectFormValues } from "./project";

// Proje durumu — DB anahtarları (projects_status_check kısıtıyla birebir,
// bkz. supabase/migrations/20260821120000_add_project_status.sql) ve
// ekranda gösterilen Türkçe etiketleri. Anahtar/etiket ayrımı bilinçli:
// etiket değişirse veritabanındaki satırlara dokunmak gerekmez.
export const PROJECT_STATUSES = ["devam", "tamamlandi", "planlanan"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  devam: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
  planlanan: "Planlanan",
};

// DB'den gelen değer teorik olarak listede olmayan bir şey olabilir
// (elle SQL düzenlemesi, ileride eklenip geri alınan bir değer) —
// getContactSubjectLabel ile aynı savunmacı desen: bilinmeyen değer
// sayfayı çökertmez, null döner ve rozet hiç basılmaz.
export function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === "string" && (PROJECT_STATUSES as readonly string[]).includes(value);
}

export const PROJECT_FIELD_LABELS: Record<keyof ProjectFormValues, string> = {
  slug: "Adres Parçası",
  status: "Durum",
  title: "Başlık",
  description: "Açıklama",
  category: "Kategori",
  location: "Konum",
  year: "Yıl",
  liveUrl: "Canlı Bağlantı",
  isPublished: "Yayın Durumu",
};
