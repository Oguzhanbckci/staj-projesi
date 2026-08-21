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

export const PROJECT_FIELD_LABELS: Record<keyof ProjectFormValues, string> = {
  title: "Başlık",
  description: "Açıklama",
  category: "Kategori",
  location: "Konum",
  year: "Yıl",
  liveUrl: "Canlı Bağlantı",
  isPublished: "Yayın Durumu",
};
