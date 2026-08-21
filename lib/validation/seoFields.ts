// Bu modul BILEREK zod'a dokunmuyor. Sebebi olculdu (2026-08-21 denetimi):
// istemci bilesenleri yalnizca asagidaki duz sabitleri kullaniyor, ama
// bunlar zod semasiyla AYNI dosyada durdugu icin zod kutuphanesinin TAMAMI
// tarayiciya iniyordu — ana sayfa JS'inin %35,5'i (283.405 bayt ham /
// 63.885 gzip) saf zoddu ve tarayicida tek bir sema calismiyordu (form
// dogrulamasi Server Action'da yapiliyor).
//
// KURAL: buraya zod import EDILMEZ. Yeni bir sabiti istemci bileseni
// kullanacaksa buraya, yalnizca sema kullanacaksa ./seo.ts icine yazilir.
// Asagidaki `import type` derlemede tamamen silinir, calisma zamani
// bagimliligi dogurmaz.

import type { SeoSettingsFormValues } from "./seo";

// KISITLAR: "sınır aşılınca uyar" — "engelle" DEĞİL. Google'ın fiili
// kesme noktalarına yakın YUMUŞAK sınırlar (60/160) sadece UI'da
// (SeoEditor.tsx'teki karakter sayacı) görsel bir uyarı olarak uygulanır.
// Buradaki zod max'ları çok daha yüksek, SERT bir üst tavan — kötüye
// kullanım/DB şişmesine karşı, gerçek SEO pratiğini kısıtlamak için değil
// (uzun bir başlık hata VERMEZ, sadece arama sonucunda kesilir).
export const SEO_TITLE_RECOMMENDED_MAX = 60;

export const SEO_DESCRIPTION_RECOMMENDED_MAX = 160;

export const SEO_FIELD_LABELS: Record<keyof SeoSettingsFormValues, string> = {
  seoTitle: "Sayfa Başlığı",
  seoDescription: "Açıklama",
  seoKeywords: "Anahtar Kelimeler",
};
