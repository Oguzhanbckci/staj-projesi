// URL parçası (slug) üretimi — saf fonksiyonlar, testli (bkz. slug.test.ts).
//
// Neden ayrı bir modül: slug hem panelde (kayıt oluşturulurken) hem
// migration'daki geri doldurmada (SQL karşılığıyla) hem de testlerde
// kullanılıyor; kuralın tek bir yerde yazılı olması şart.

// Türkçe harflerin ASCII karşılıkları. Bu eşlemeyi `toLowerCase()`'ten ÖNCE
// uygulamak gerekiyor, çünkü "I" harfi kritik: Türkçe yerelde "I" küçüğü
// "ı"dır, İngilizce yerelde "i". Eşlemeyi önce yapınca bu belirsizlik
// tamamen ortadan kalkıyor ve sonuç, çalıştığı yerelden BAĞIMSIZ oluyor —
// aynı başlık her ortamda aynı slug'ı üretir.
const TURKCE_HARFLER: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  Ç: "c",
  Ğ: "g",
  İ: "i",
  Ö: "o",
  Ş: "s",
  Ü: "u",
  I: "i",
};

/** Slug uzunluk sınırı — çok uzun URL'ler paylaşımda kırpılıyor. */
export const SLUG_MAX_LENGTH = 80;

/**
 * Başlıktan URL parçası üretir: "Vadi Konutları 2. Etap" -> "vadi-konutlari-2-etap".
 *
 * Alfanümerik olmayan her şey tek bir tireye iner, baştaki/sondaki tireler
 * atılır. Kırpma sonrası oluşabilecek sondaki tire de temizlenir — yoksa
 * "…-" gibi çirkin bir adres kalırdı.
 *
 * Hiç harf/rakam içermeyen bir başlıkta (ör. "***") BOŞ string döner;
 * çağıran taraf bu durumu ele almalı (bkz. ensureUniqueSlug).
 */
export function slugify(input: string): string {
  const asciiye = input.replace(/[çğıöşüÇĞİÖŞÜI]/g, (harf) => TURKCE_HARFLER[harf] ?? harf);

  return asciiye
    .toLowerCase()
    // Kalan aksanlı Latin harfleri (é, â, ñ …) ayrıştırılıp işaretleri atılır.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}

/**
 * Slug'ı bir tenant içinde benzersizleştirir. Çakışma varsa "-2", "-3" …
 * eklenir (ilk kayıt sade slug'ı korur — mevcut bir adres, yeni bir kayıt
 * yüzünden asla değişmemeli).
 *
 * `kullanilan` içine DÜZENLENEN kaydın kendi slug'ı verilmemeli, yoksa
 * kayıt kendi kendisiyle çakışıp her kaydedişte "-2" ekler.
 *
 * Boş taban (hiç alfanümerik içermeyen başlık) için `yedek` kullanılır.
 */
export function ensureUniqueSlug(
  taban: string,
  kullanilan: Iterable<string>,
  yedek = "proje"
): string {
  const temizTaban = taban || yedek;
  const kume = new Set(kullanilan);

  if (!kume.has(temizTaban)) return temizTaban;

  // 2'den başlar: "-1" eki kullanıcıya "birincisi hangisi?" sorusunu
  // sordurur, oysa sade slug zaten birincisidir.
  for (let ek = 2; ek < 1000; ek++) {
    const aday = `${temizTaban}-${ek}`;
    if (!kume.has(aday)) return aday;
  }

  // Pratikte ulaşılamaz (aynı tenant'ta 999 aynı isimli kayıt) ama sessizce
  // yanlış bir değer döndürmektense açık bir hata daha iyi.
  throw new Error(`Benzersiz slug üretilemedi: ${temizTaban}`);
}
