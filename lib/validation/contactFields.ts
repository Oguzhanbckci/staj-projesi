// Bu modul BILEREK zod'a dokunmuyor. Sebebi olculdu (2026-08-21 denetimi):
// istemci bilesenleri (ContactForm, NewMessageNotifier) yalnizca asagidaki
// duz sabitleri kullaniyor, ama bunlar zod semasiyla AYNI dosyada durdugu
// icin zod kutuphanesinin TAMAMI ziyaretcinin tarayicisina iniyordu — ana
// sayfa JS'inin %35,5'i (283.405 bayt ham / 63.885 gzip) saf zoddu ve
// tarayicida tek bir sema calismiyordu (form dogrulamasi Server Action'da
// yapiliyor).
//
// KURAL: buraya zod import EDILMEZ. Yeni bir sabiti istemci bileseni
// kullanacaksa buraya, yalnizca sema kullanacaksa ./contact.ts icine
// yazilir. Asagidaki `import type` derlemede tamamen silinir, calisma
// zamani bagimliligi dogurmaz.

import type { ContactFormValues } from "./contact";

export const CONTACT_SUBJECTS = [
  "genel-bilgi",
  "proje-teklifi",
  "is-birligi",
  "sikayet-oneri",
  "diger",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const CONTACT_SUBJECT_LABELS: Record<ContactSubject, string> = {
  "genel-bilgi": "Genel Bilgi",
  "proje-teklifi": "Proje Teklifi",
  "is-birligi": "İş Birliği",
  "sikayet-oneri": "Şikayet / Öneri",
  diger: "Diğer",
};

// DB'den gelen `subject` sütunu serbest `text` (bilerek CHECK constraint
// yok, bkz. supabase/migrations/20260814130000_...) — panelde gösterirken
// bilinmeyen/eski bir değer sayfayı çökertmesin diye güvenli bir
// eşleme. `components/panel/mesajlar/` ekranlarında kullanılır.
export function getContactSubjectLabel(subject: string | null): string {
  if (!subject) return "—";
  return subject in CONTACT_SUBJECT_LABELS
    ? CONTACT_SUBJECT_LABELS[subject as ContactSubject]
    : subject;
}

// 2026-08-18: Serbest metin telefon alanı SADECE RAKAM kabul edecek
// şekilde sıkılaştırıldı (kullanıcı bulgusu — eski serbest alan hem harf
// girişine hem sınırsız rakam girişine izin veriyordu, ör. 50-60 haneli
// anlamsız bir dizi kabul ediliyordu). Ayrıca WhatsApp tarzı bir ülke
// kodu `<select>`'i denendi ama kaldırıldı — native `<select>` kapalıyken
// her zaman seçili seçeneğin TAM metnini gösteriyor, "sadece bayrak"
// görünümü özel bir açılır menü gerektirirdi; kullanıcı bunu orantısız
// bulup sadece rakam/uzunluk doğrulamasını istedi (bkz. KARAR-GUNLUGU.md).
export const PHONE_MIN_DIGITS = 4;

export const PHONE_MAX_DIGITS = 12;

// Form alanı adı -> ekranda gösterilecek Türkçe etiket. Hata özetinde
// ("Formda şu hatalar var: Ad Soyad: ...") ve <label>'larla tutarlı
// kalması için tek yerde tutuluyor.
export const CONTACT_FIELD_LABELS: Record<keyof ContactFormValues, string> = {
  fullName: "Ad Soyad",
  email: "E-posta",
  phoneNumber: "Telefon",
  subject: "Konu",
  message: "Mesaj",
};
