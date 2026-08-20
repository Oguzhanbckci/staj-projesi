import { describe, it, expect } from "vitest";
import { coerceStoredRating, parseRatingInput, testimonialFormSchema } from "./testimonial";

// Bu dosya 2026-08-20 mentör denetiminde (bulgu 06) yazıldı. Gerekçe teorik
// değil: `rating` 2026-08-19'da `integer` → `numeric(2,1)` yapılmış ama şema
// `^[1-5]?$` olarak kalmıştı; DB'de 4.5 olan CANLI bir kayıt panelde
// düzenlenince puan SESSİZCE siliniyordu. Bu şemanın bir testi olsaydı hata
// yazıldığı gün yakalanırdı.
//
// Testin asıl koruduğu şey: şema ile DB kısıtının (`numeric(2,1)` +
// `check (rating between 1 and 5)`) UYUMU. Sınır değerler bilerek
// DB kısıtından alınıyor.

const validPayload = {
  authorName: "Ayşe Yılmaz",
  authorTitle: "Kaya Holding, Genel Müdür",
  quote: "Ekip işi zamanında ve söz verilen bütçeyle teslim etti.",
  rating: "5",
  isPublished: true,
};

describe("parseRatingInput", () => {
  it("tam sayıyı çevirir", () => {
    expect(parseRatingInput("4")).toBe(4);
  });

  it("nokta ile yazılan kesirli puanı çevirir", () => {
    expect(parseRatingInput("4.5")).toBe(4.5);
  });

  it("Türkçe ondalık ayıracını (virgül) kabul eder", () => {
    expect(parseRatingInput("4,5")).toBe(4.5);
  });

  it("baştaki/sondaki boşlukları yok sayar", () => {
    expect(parseRatingInput("  3,5  ")).toBe(3.5);
  });

  it("DB alt sınırını (1) kabul eder", () => {
    expect(parseRatingInput("1")).toBe(1);
  });

  it("DB üst sınırını (5) kabul eder", () => {
    expect(parseRatingInput("5")).toBe(5);
  });

  it("alt sınırın altını reddeder", () => {
    expect(parseRatingInput("0.9")).toBeNull();
  });

  it("üst sınırın üstünü reddeder", () => {
    expect(parseRatingInput("5.1")).toBeNull();
  });

  // numeric(2,1) yalnızca TEK ondalık basamak saklayabilir — iki basamaklı
  // bir değer DB'de sessizce yuvarlanırdı, bu yüzden şemada reddediliyor.
  it("birden fazla ondalık basamağı reddeder", () => {
    expect(parseRatingInput("4.25")).toBeNull();
  });

  it("sayı olmayan girdiyi reddeder", () => {
    expect(parseRatingInput("beş")).toBeNull();
  });

  it("boş dizeyi reddeder (boş = puan yok, şema ayrıca ele alıyor)", () => {
    expect(parseRatingInput("")).toBeNull();
  });
});

// İKİNCİ veri kaybı yolunun regresyon testi. `getTestimonialById` (panel)
// yalnızca `typeof === "number"` kabul ediyordu; PostgREST `numeric`
// kolonlarını hassasiyeti korumak için STRING olarak da döndürebildiği için
// string gelen bir puan panelde boş görünüp kaydedilince siliniyordu.
// Formun düzeltilmesi tek başına yetmezdi — kayıp burada da oluşuyordu.
describe("coerceStoredRating", () => {
  it("JSON sayısı olarak gelen puanı kabul eder", () => {
    expect(coerceStoredRating(4.5)).toBe(4.5);
  });

  // BU SATIR OLMADAN panelde puan sessizce siliniyordu.
  it("numeric-string olarak gelen puanı kabul eder", () => {
    expect(coerceStoredRating("4.5")).toBe(4.5);
  });

  it("tam sayı string'ini kabul eder", () => {
    expect(coerceStoredRating("5")).toBe(5);
  });

  it("null için null döner (puan girilmemiş kayıt)", () => {
    expect(coerceStoredRating(null)).toBeNull();
  });

  it("undefined için null döner", () => {
    expect(coerceStoredRating(undefined)).toBeNull();
  });

  it("sayıya çevrilemeyen string için null döner", () => {
    expect(coerceStoredRating("yok")).toBeNull();
  });

  it("NaN için null döner", () => {
    expect(coerceStoredRating(Number.NaN)).toBeNull();
  });

  // Okuma yönü BİLEREK gevşek: değer DB'nin CHECK kısıtından geçmiş bir
  // kayıt, kullanıcı girdisi değil. Aralık doğrulamasını burada tekrarlamak
  // geçerli ama beklenmedik bir değeri sessizce yok etmek olurdu.
  it("aralık doğrulaması YAPMAZ — okuma yönü bilerek gevşek", () => {
    expect(coerceStoredRating(7)).toBe(7);
  });
});

describe("testimonialFormSchema", () => {
  it("geçerli veriyi kabul eder", () => {
    expect(testimonialFormSchema.safeParse(validPayload).success).toBe(true);
  });

  // BULGU 06'NIN REGRESYON TESTİ — eski `^[1-5]?$` şeması burada düşerdi.
  it("kesirli puanı (4,5) kabul eder", () => {
    expect(testimonialFormSchema.safeParse({ ...validPayload, rating: "4,5" }).success).toBe(true);
  });

  it("nokta ile yazılan kesirli puanı kabul eder", () => {
    expect(testimonialFormSchema.safeParse({ ...validPayload, rating: "4.5" }).success).toBe(true);
  });

  it("puan boş bırakılabilir (opsiyonel alan)", () => {
    expect(testimonialFormSchema.safeParse({ ...validPayload, rating: "" }).success).toBe(true);
  });

  it("aralık dışı puanı reddeder", () => {
    expect(testimonialFormSchema.safeParse({ ...validPayload, rating: "6" }).success).toBe(false);
  });

  it("iki ondalık basamaklı puanı reddeder", () => {
    expect(testimonialFormSchema.safeParse({ ...validPayload, rating: "4.25" }).success).toBe(false);
  });

  it("2 karakterden kısa ad soyadı reddeder", () => {
    expect(testimonialFormSchema.safeParse({ ...validPayload, authorName: "A" }).success).toBe(false);
  });

  it("10 karakterden kısa yorumu reddeder", () => {
    expect(testimonialFormSchema.safeParse({ ...validPayload, quote: "Kısa" }).success).toBe(false);
  });

  it("unvan boş bırakılabilir (opsiyonel alan)", () => {
    expect(testimonialFormSchema.safeParse({ ...validPayload, authorTitle: "" }).success).toBe(true);
  });
});
