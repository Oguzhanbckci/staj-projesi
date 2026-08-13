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
// tabIndex=-1 + ekran dışına konumlandırma).
//
// 2026-08-18 DÜZELTMESİ (kullanıcı bulgusu — gerçek mesajlar sessizce
// kayboluyordu, "gönderim yok sayıldı" logu görüldü): Alan adı önceden
// "website" idi, "spam botları genelde tam olarak bu isimdeki alanlara
// reklam linki yazar" gerekçesiyle seçilmişti — ama bu isim (ve
// ContactForm.tsx'teki "Web siteniz" etiketi) Chrome'un/parola
// yöneticilerinin (LastPass, 1Password vb.) OTOMATİK DOLDURMA
// sezgiselleriyle de birebir eşleşiyordu — `autocomplete="off"` bu
// araçların çoğu tarafından yok sayılıyor. Sonuç: GERÇEK bir ziyaretçi
// alanı hiç GÖRMESE/dokunmasa bile, tarayıcısı arka planda dolduruyordu
// — form "başarılı" gösteriyordu ama mesaj DB'ye hiç yazılmıyordu
// (bilerek "bot yakalandı" davranışı, bkz. actions.ts). Yanlış pozitif
// (gerçek müşteri kaybı) bottan gelen bir mesajı kaçırmaktan çok daha
// kötü — isim "website"den, hiçbir tanınır otomatik-doldurma
// kategorisiyle eşleşmeyen nötr bir isme değiştirildi. Genel/rastgele
// form-doldurma botlarına karşı koruma DEĞİŞMEDİ (onlar alan adından
// bağımsız her boş alanı doldurur) — sadece "bilerek website'e link
// yazan" dar bot türüne karşı koruma azaldı, kabul edilebilir bir
// ödünleşim.
export const HONEYPOT_FIELD_NAME = "iletisim_notu";

// Bir bot'un (ya da form'u client-side JS olmadan taklit eden bir script'in)
// gizli alanı doldurup doldurmadığını kontrol eder. Gerçek bir ziyaretçi
// bu alanı GÖRMEZ (aria-hidden + ekran dışı), bu yüzden dolu gelmesi neredeyse
// kesin bir bot işareti — false positive riski çok düşük (bkz. GUVENLIK.md,
// "ne kadar etkili/nasıl atlatılır" dürüst değerlendirmesi).
export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD_NAME);
  return typeof value === "string" && value.trim().length > 0;
}
