// Saf fonksiyon — panelde SERBEST biçimde girilen bir telefon numarasını
// (ör. "0212 555 12 34", "+90 532 555 12 34", "532 555 12 34") JSON-LD'nin
// `telephone` alanı için E.164 biçimine (+90XXXXXXXXXX) çevirir. KAYDEDİLEN/
// GÖRÜNTÜLENEN değeri DEĞİŞTİRMEZ — sadece yapısal veri çıktısı için
// kullanılır (bkz. lib/seo/localBusiness.ts).
//
// Tanınmayan bir biçimde `null` döner — KISITLAR: "eksik alan JSON-LD'ye
// hiç eklenmesin" ilkesiyle tutarlı, YANLIŞ bir numara üretmek (ör. rakam
// sayısı tutmayan bir string'i olduğu gibi "+90" ile birleştirmek) eksik
// bırakmaktan daha kötü.
export function toE164TR(rawPhone: string): string | null {
  const trimmed = rawPhone.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  // +90 5XX XXX XX XX / +90 2XX XXX XX XX — zaten doğru, sadece boşluk/
  // ayraç temizlendi.
  if (hasPlus && digits.startsWith("90") && digits.length === 12) {
    return `+${digits}`;
  }

  // 90 5XX... (ülke kodu var ama + işareti yok).
  if (!hasPlus && digits.startsWith("90") && digits.length === 12) {
    return `+${digits}`;
  }

  // 0532 555 12 34 gibi — yerel biçim, baştaki 0 ülke koduyla değişir.
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+90${digits.slice(1)}`;
  }

  // 532 555 12 34 — baştaki 0/ülke kodu hiç girilmemiş, 10 haneli.
  if (digits.length === 10) {
    return `+90${digits}`;
  }

  return null;
}
