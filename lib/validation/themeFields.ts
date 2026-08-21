// Bu modul BILEREK zod'a dokunmuyor. Sebebi olculdu (2026-08-21 denetimi):
// istemci bilesenleri yalnizca asagidaki duz sabitleri kullaniyor, ama
// bunlar zod semasiyla AYNI dosyada durdugu icin zod kutuphanesinin TAMAMI
// tarayiciya iniyordu — ana sayfa JS'inin %35,5'i (283.405 bayt ham /
// 63.885 gzip) saf zoddu ve tarayicida tek bir sema calismiyordu (form
// dogrulamasi Server Action'da yapiliyor).
//
// KURAL: buraya zod import EDILMEZ. Yeni bir sabiti istemci bileseni
// kullanacaksa buraya, yalnizca sema kullanacaksa ./theme.ts icine yazilir.
// Asagidaki `import type` derlemede tamamen silinir, calisma zamani
// bagimliligi dogurmaz.

import type { ThemeSettingsFormValues } from "./theme";

export const THEME_FIELD_LABELS: Record<keyof ThemeSettingsFormValues, string> = {
  themeMode: "Varsayılan Tema",
  companyName: "Firma Adı",
  slogan: "Slogan",
  primaryColor: "Marka Rengi",
  secondaryColor: "İkincil Renk",
  borderRadiusScale: "Köşe Yarıçapı",
  fontFamilyKey: "Font Ailesi",
  address: "Adres",
  phone: "Telefon",
  email: "E-posta",
  workingHours: "Çalışma Saatleri",
  weekdayOpens: "Hafta İçi Açılış",
  weekdayCloses: "Hafta İçi Kapanış",
  weekendOpens: "Hafta Sonu Açılış",
  weekendCloses: "Hafta Sonu Kapanış",
  serviceAreas: "Hizmet Verilen İller",
  facebookUrl: "Facebook",
  instagramUrl: "Instagram",
  linkedinUrl: "LinkedIn",
};
