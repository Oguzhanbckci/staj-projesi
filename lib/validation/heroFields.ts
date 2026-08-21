// Bu modul BILEREK zod'a dokunmuyor. Sebebi olculdu (2026-08-21 denetimi):
// istemci bilesenleri yalnizca asagidaki duz sabitleri kullaniyor, ama
// bunlar zod semasiyla AYNI dosyada durdugu icin zod kutuphanesinin TAMAMI
// tarayiciya iniyordu — ana sayfa JS'inin %35,5'i (283.405 bayt ham /
// 63.885 gzip) saf zoddu ve tarayicida tek bir sema calismiyordu (form
// dogrulamasi Server Action'da yapiliyor).
//
// KURAL: buraya zod import EDILMEZ. Yeni bir sabiti istemci bileseni
// kullanacaksa buraya, yalnizca sema kullanacaksa ./hero.ts icine yazilir.
// Asagidaki `import type` derlemede tamamen silinir, calisma zamani
// bagimliligi dogurmaz.

import type { HeroFormValues } from "./hero";

export const HERO_FIELD_LABELS: Record<keyof HeroFormValues, string> = {
  title: "Başlık",
  subtitle: "Alt Başlık",
  ctaText: "Buton Metni",
  ctaLink: "Buton Bağlantısı",
  secondaryCtaText: "İkinci Buton Metni",
  secondaryCtaLink: "İkinci Buton Bağlantısı",
};
