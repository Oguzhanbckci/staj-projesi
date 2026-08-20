import { z } from "zod";

// DB kısıtıyla birebir aynı sınırlar — `testimonials.rating` kolonu
// `numeric(2,1)` ve `check (rating between 1 and 5)`
// (bkz. 20260806120000_create_content_tables.sql,
// 20260819120000_allow_fractional_testimonial_rating.sql). Şema ile CHECK
// arasındaki uyum bilinçli: uyuşmadıklarında doğrulama "tamam" der, INSERT
// patlar ve kullanıcı alan-bazlı hata yerine genel bir hata görür.
export const MIN_TESTIMONIAL_RATING = 1;
export const MAX_TESTIMONIAL_RATING = 5;

/**
 * FORMDAN GELEN ham puan metnini DB'ye yazılabilir bir sayıya çevirir
 * (yazma yönü). Geçersizse (aralık dışı, birden fazla ondalık, harf, boş)
 * `null` döner — hem şema doğrulaması hem sunucu eylemi AYNI fonksiyonu
 * kullanır, böylece "doğrulamadan geçti ama farklı çevrildi" sınıfı bir
 * sapma oluşamaz.
 *
 * Türkçe klavyede ondalık ayıracı virgül olduğu için "4,5" de kabul edilir.
 */
export function parseRatingInput(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!/^\d+(\.\d)?$/.test(normalized)) return null;

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  if (value < MIN_TESTIMONIAL_RATING || value > MAX_TESTIMONIAL_RATING) return null;

  return value;
}

/**
 * VERİTABANINDAN GELEN puanı güvenli biçimde çözer (okuma yönü).
 * Geçersiz/boş değer `null` döner — kartta yıldızlar hiç gösterilmez.
 *
 * `parseRatingInput`'tan BİLEREK ayrı ve daha gevşek: buradaki değer
 * kullanıcı girdisi değil, DB'nin kendi CHECK kısıtından geçmiş bir
 * kayıttır; aralık doğrulamasını burada tekrarlamak, geçerli ama beklenmedik
 * bir değeri sessizce yok etmek olurdu.
 *
 * `typeof === "number"` kontrolü TEK BAŞINA YETMEZ: PostgREST `numeric`
 * kolonlarını hassasiyeti korumak için duruma göre JSON sayısı YA DA string
 * olarak döndürebilir. Bu ayrım 2026-08-19'da ziyaretçi sorgusunda
 * (getTestimonials) doğru ele alınmış ama panel sorgusuna
 * (getTestimonialById) taşınmamıştı — sonuç: string dönen bir puan panelde
 * boş görünüyor, kaydedilince SESSİZCE siliniyordu. Yani kesirli puan veri
 * kaybının İKİNCİ yolu buydu (2026-08-20 mentör denetimi, bulgu 06).
 * Fonksiyon artık tek yerde ve iki sorgu da onu kullanıyor.
 */
export function coerceStoredRating(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

// lib/validation/service.ts ile aynı ilke: saf modül, panel formunda VE
// sunucu eyleminde (app/panel/(protected)/icerikler/referanslar/actions.ts)
// AYNI şema kullanılır.
export const testimonialFormSchema = z.object({
  authorName: z
    .string({ error: "Ad Soyad zorunludur." })
    .trim()
    .min(2, { error: "Ad Soyad en az 2 karakter olmalıdır." })
    .max(120, { error: "Ad Soyad en fazla 120 karakter olabilir." }),

  authorTitle: z
    .string()
    .trim()
    .max(120, { error: "Unvan/Firma en fazla 120 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  quote: z
    .string({ error: "Yorum metni zorunludur." })
    .trim()
    .min(10, { error: "Yorum en az 10 karakter olmalıdır." })
    .max(1000, { error: "Yorum en fazla 1000 karakter olabilir." }),

  // 1.0-5.0 arası, tek ondalık basamak, opsiyonel.
  //
  // 2026-08-20 mentör denetimi (bulgu 06) — GERÇEK VERİ KAYBI düzeltildi:
  // 2026-08-19'da kolon `integer` → `numeric(2,1)` yapıldı (migration
  // 20260819120000) ve TestimonialCard yarım yıldız çizmeye başladı, ama
  // BU ŞEMA `^[1-5]?$` olarak kaldı ve form yalnızca 1-5 tam sayı
  // <option>'ı taşıyordu. Sonuç: DB'de 4.5 olan bir kayıt panelde
  // açıldığında select hiçbir seçenekle eşleşmeyip "Belirtilmedi"ye
  // düşüyor, kaydedilince `rating` SESSİZCE null oluyordu — ne hata, ne
  // uyarı. Artık serbest metin alanı + bu şema kullanılıyor, yani DB'deki
  // her geçerli değer (4.3 dahil, kart onu da çizebiliyor) kayıpsız
  // gidip geliyor.
  //
  // Neden `type="number"` DEĞİL: geçersiz girişte tarayıcı `value`'yu boş
  // string olarak gönderir — bu da aynı sınıf "sessizce silinme" hatasını
  // geri getirirdi. Serbest metinde ham değer sunucuya ulaşır ve kullanıcı
  // alan-bazlı bir hata mesajı görür. Türkçe ondalık ayıracı (virgül) de
  // bilerek kabul ediliyor, normalleştirme parseRatingInput'ta.
  rating: z
    .string()
    .trim()
    .refine((value) => value === "" || parseRatingInput(value) !== null, {
      error: "Puan 1 ile 5 arasında, en fazla bir ondalık basamakla girilmelidir (ör. 4,5).",
    })
    .optional()
    .or(z.literal("")),

  isPublished: z.boolean(),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export const TESTIMONIAL_FIELD_LABELS: Record<keyof TestimonialFormValues, string> = {
  authorName: "Ad Soyad",
  authorTitle: "Unvan / Firma",
  quote: "Yorum",
  rating: "Puan",
  isPublished: "Yayın Durumu",
};
