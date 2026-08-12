// İstemci-güvenli (server-only bağımlılık YOK — next/headers vb.) —
// bilerek ayrı bir dosyada: hem ContactForm.tsx (Client Component) hem
// actions.ts (Server Action) buradan import ediyor. Sunucuya özel hız
// sınırı mantığı (next/headers kullanır) lib/security/contactRateLimit.ts'te,
// AYRI tutuluyor — aksi halde bir Client Component'in bu dosyayı import
// etmesi next/headers'ı da tarayıcı paketine sürüklemeye çalışır ve
// build hatası verir (gerçek bir hatadan öğrenildi, bkz.
// docs/KARAR-GUNLUGU.md 2026-08-17).
//
// KISITLAR: "gizli alan ekran okuyucudan da gizlensin ve odak almasın" —
// gerçek gizleme components/site/contact/ContactForm.tsx'te (aria-hidden +
// tabIndex=-1 + ekran dışına konumlandırma). Burada sadece alan adı ve
// kontrol mantığı — "website" bilinçli seçildi: spam botları genelde tam
// olarak bu isimdeki alanlara kendi reklam linklerini yazar.
export const HONEYPOT_FIELD_NAME = "website";

// Bir bot'un (ya da form'u client-side JS olmadan taklit eden bir script'in)
// gizli alanı doldurup doldurmadığını kontrol eder. Gerçek bir ziyaretçi
// bu alanı GÖRMEZ (aria-hidden + ekran dışı), bu yüzden dolu gelmesi neredeyse
// kesin bir bot işareti — false positive riski çok düşük (bkz. GUVENLIK.md,
// "ne kadar etkili/nasıl atlatılır" dürüst değerlendirmesi).
export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD_NAME);
  return typeof value === "string" && value.trim().length > 0;
}
