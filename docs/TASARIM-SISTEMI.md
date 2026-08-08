# Tasarım Sistemi

Bu dosya, sitenin (hem platform sahibinin tanıtım sitesi hem tenant siteleri)
görsel dilini oluşturan tüm temel değerleri (renk, tipografi, boşluk, köşe
yarıçapı, gölge) ve bunların **neden** öyle seçildiğini tek yerde toplar.
Yazılı olmayan tasarım kararları her yeni sayfada/bileşende yeniden
tartışılır ve ürün zamanla dağılır — bu dosya, o tartışmanın bir daha
yapılmamasını sağlayan referans. Kod içermez; gerçek implementasyon tek
yerde: **`app/globals.css`** (Tailwind CSS v4, CSS-first `@theme`
konfigürasyonu — bkz. `MIMARI.md` madde 3). Bu dosya "neden", `globals.css`
"nasıl"dır — biri değişirse diğeri güncel tutulmalı.

**Son güncelleme:** 2026-08-08

## 0. İlkeler

1. **Her görsel değer bir token'dır, hiçbir bileşende hardcode edilmez.**
   `AI-KURALLARI.md` madde 5'teki "tema/renk/metin gibi içerik değerlerini
   kod içine sabit yazma" kuralı, bu dosyadaki renk/tipografi/boşluk/radius/
   gölge token'larının tamamına genişletilmiş sayılır — bir bileşen
   `#2561c1` yazmaz, `text-brand`/`bg-brand` yazar.
2. **Marka rengi sabit değil, tenant başına değişir.** `--color-brand`
   burada bir _varsayılan_ — gerçek değer `site_settings.primary_color`'dan
   gelir (bkz. `VERİ-MODELİ.md`). Diğer tüm token'lar (nötr gri, semantik,
   tipografi, boşluk, radius, gölge) tüm tenant'larda ortaktır, değişmez.
3. **Tema, tarayıcı tercihine değil `tenants.theme_mode`'a bağlıdır**
   (`light`/`dark`, panelden seçilir — bkz. `VERİ-MODELİ.md`). Bu yüzden
   CSS'te `@media (prefers-color-scheme)` değil `[data-theme="dark"]`
   seçicisi kullanılır; `<html data-theme="...">` ileride sunucu tarafında
   tenant kaydına göre set edilecek (henüz kodlanmadı, bkz. madde 7).
4. **Her metin/zemin çifti WCAG AA doğrulanmadan kullanılmaz** — gövde
   metni ≥4.5:1, büyük başlık (≥24px veya ≥19px kalın) ≥3:1. Sonuçlar
   madde 2'de.
5. Yeni bir token ihtiyacı doğarsa önce bu dosyaya eklenir/gerekçelendirilir,
   sonra `app/globals.css`'e kodlanır — tersi değil.

## 1. Renk Token'ları

### 1.1 Marka ve nötr gri ölçeği

Nötr gri ölçeği tamamen achromatic değil — marka rengiyle aynı ton
(217°, çelik-mavi) üzerinde, düşük doygunlukla (%14) kuruldu. Bu, arayüzün
tamamında (gri yüzeyler dahil) tek bir renk ailesi hissi verir ve KISITLAR
gereği "nötr griler marka rengine hafif eğilim taşısın" isteğini karşılar.

| Token                 | Hex       | Kullanım amacı                                                   |
| --------------------- | --------- | ---------------------------------------------------------------- |
| `--color-neutral-50`  | `#f0f2f4` | Açık tema sayfa zemini                                           |
| `--color-neutral-100` | `#e2e5e9` | Açık tema hafif bölücü/arka plan tonu; koyu temada ikincil metin |
| `--color-neutral-300` | `#a8b0bd` | Açık temada dekoratif kenarlık; koyu temada ikincil/muted metin  |
| `--color-neutral-500` | `#5e6a7d` | Açık temada muted (üçüncül) metin                                |
| `--color-neutral-700` | `#373e49` | Açık temada ikincil metin/dekoratif kenarlık                     |
| `--color-neutral-800` | `#21252c` | Koyu tema kart/panel zemini (`surface-raised`)                   |
| `--color-neutral-900` | `#16191d` | Açık temada birincil metin; koyu tema sayfa zemini               |

| Token              | Açık tema | Koyu tema | Kullanım amacı                                                                     |
| ------------------ | --------- | --------- | ---------------------------------------------------------------------------------- |
| `--color-brand`    | `#2561c1` | `#6998e2` | Vurgu rengi — CTA buton, link, aktif durum. **Varsayılan**; tenant'a göre değişir. |
| `--color-brand-on` | `#ffffff` | `#16191d` | `--color-brand` dolgusu üzerindeki metin/ikon rengi (buton etiketi)                |

**Gerekçe (sektöre uygunluk):** 217° hue'daki mavi, mühendislik/inşaat
sektöründe küresel olarak güven ve profesyonellik çağrıştırır (teknik
çizim/"blueprint" mavisi), abartısız ve "ciddi ama modern" bir izlenim
bırakır; ayrıca uyarı semantiğinde kullanılan amber/turuncudan (inşaatın
"hi-vis" rengi) net biçimde ayrışır — marka vurgusuyla uyarı durumu
karışmaz.

### 1.2 Semantik renkler

| Token             | Açık tema | Koyu tema | Kullanım amacı                                            |
| ----------------- | --------- | --------- | --------------------------------------------------------- |
| `--color-success` | `#227745` | `#34b268` | Başarılı işlem, onay mesajı                               |
| `--color-warning` | `#915f08` | `#cb850b` | Dikkat gerektiren durum, uyarı mesajı                     |
| `--color-error`   | `#af1d26` | `#e6656e` | Hata mesajı, form validasyon hatası, silme/kritik aksiyon |

### 1.3 Yüzey ve metin renkleri

| Token                    | Açık tema                 | Koyu tema                 | Kullanım amacı                                      |
| ------------------------ | ------------------------- | ------------------------- | --------------------------------------------------- |
| `--color-surface`        | `#f0f2f4` (`neutral-50`)  | `#16191d` (`neutral-900`) | Sayfa zemini                                        |
| `--color-surface-raised` | `#ffffff`                 | `#21252c` (`neutral-800`) | Kart/panel zemini — sayfadan bir seviye "yükselti"  |
| `--color-text`           | `#16191d` (`neutral-900`) | `#f0f2f4` (`neutral-50`)  | Birincil/gövde metni                                |
| `--color-text-muted`     | `#5e6a7d` (`neutral-500`) | `#a8b0bd` (`neutral-300`) | İkincil/daha az önemli metin (meta bilgi, açıklama) |

## 2. Kontrast Ölçüm Sonuçları

WCAG 2.1 relative-luminance formülüyle hesaplandı (sRGB → luminance →
contrast ratio). Eşik: gövde metni ≥4.5:1, büyük başlık/UI dolgu metni
≥3:1. **36 çiftin tamamı geçti**, en düşük marj 4.72:1 — hiçbiri sınırda
bırakılmadı.

| Çift                                     | Açık tema     | Koyu tema     | Eşik  | Sonuç |
| ---------------------------------------- | ------------- | ------------- | ----- | ----- |
| `text` / `surface`                       | 15.71:1       | 15.71:1       | 4.5:1 | ✅    |
| `text` / `surface-raised`                | 17.63:1       | 13.70:1       | 4.5:1 | ✅    |
| `text-muted` / `surface`                 | 4.88:1        | 8.07:1        | 4.5:1 | ✅    |
| `text-muted` / `surface-raised`          | 5.48:1        | 7.04:1        | 4.5:1 | ✅    |
| `brand` metin/link / `surface`           | 5.26:1        | 6.04:1        | 4.5:1 | ✅    |
| `brand` metin/link / `surface-raised`    | 5.90:1        | 5.26:1        | 4.5:1 | ✅    |
| `brand-on` / `brand` (buton dolgusu)     | 5.90:1        | 6.04:1        | 4.5:1 | ✅    |
| `brand` / `surface` (büyük başlık)       | 5.26:1        | 6.04:1        | 3:1   | ✅    |
| `success` / `surface` + `surface-raised` | 4.93 / 5.54:1 | 6.48 / 5.65:1 | 4.5:1 | ✅    |
| `warning` / `surface` + `surface-raised` | 4.87 / 5.46:1 | 5.79 / 5.05:1 | 4.5:1 | ✅    |
| `error` / `surface` + `surface-raised`   | 6.18 / 6.94:1 | 5.42 / 4.72:1 | 4.5:1 | ✅    |

**Not:** Hesaplama, AI tarafından yazılan tek seferlik bir Node script'iyle
yapıldı (repoya eklenmedi, geçiciydi). Kullanıcı bağımsız bir kontrast
aracıyla da doğrulayacağını belirtti; küçük yuvarlama farkları (±0.01-0.02)
dışında sonuç değişmemesi beklenir.

**Kapsam dışı bırakılan:** `info` semantik rengi (yönerge sadece 3 semantik
renk — başarı/uyarı/hata — istedi) ve kenarlık (border) token'ları için
ayrı bir UI-bileşen kontrast kontrolü (WCAG 1.4.11, ≥3:1) — bu dosyanın
kapsamındaki yönergede istenmedi, sadece metin/zemin çiftleri
doğrulandı. Form alanı/focus ring gibi anlamlı kenarlıklar
gerektiğinde ayrıca ele alınmalı.

## 3. Tipografi Ölçeği

Taban: gövde metni **16px (1rem)**. Oran: **1.25** (Major Third).
Formül: `boyut(n) = 16px × 1.25ⁿ`.

| Seviye  | Token          | Boyut            | Satır yüksekliği | Ağırlık        | Kullanım amacı                       |
| ------- | -------------- | ---------------- | ---------------- | -------------- | ------------------------------------ |
| Caption | `text-caption` | 13px (0.8125rem) | 1.5              | 400 (normal)   | Küçük not, form yardım metni, footer |
| Gövde   | `text-base`    | 16px (1rem)      | 1.6              | 400 (normal)   | Paragraf, gövde metni                |
| H6      | `text-h6`      | 20px (1.25rem)   | 1.5              | 500 (medium)   | En küçük alt başlık                  |
| H5      | `text-h5`      | 25px (1.5625rem) | 1.4              | 600 (semibold) | Alt başlık                           |
| H4      | `text-h4`      | 31px (1.9375rem) | 1.3              | 600 (semibold) | Bölüm başlığı                        |
| H3      | `text-h3`      | 39px (2.4375rem) | 1.25             | 700 (bold)     | Bölüm başlığı (orta-büyük)           |
| H2      | `text-h2`      | 49px (3.0625rem) | 1.15             | 700 (bold)     | Sayfa alt başlığı                    |
| H1      | `text-h1`      | 61px (3.8125rem) | 1.1              | 700 (bold)     | Hero / ana başlık                    |

**Gerekçe:** Boyut büyüdükçe satır yüksekliği daralır (büyük başlıkta
gevşek satır aralığı dağınık görünür), küçüldükçe genişler (paragraf
okunurluğu için WCAG ≥1.5 önerisi). Ağırlık en fazla **700**'de sınırlı
tutuldu (800/900 kullanılmadı) — Lighthouse Performance ≥90 hedefi
(`TEST-STRATEJISI.md`) için daha az font-weight dosyası daha hızlı yükleme
sağlar.

## 4. Boşluk Ölçeği

4px taban ritmi. Tailwind v4'ün varsayılan boşluk çarpanıyla (`--spacing:
0.25rem`) birebir örtüştüğü için ayrı bir token tanımlanmadı — aşağıdaki
eşleştirme, doğrudan Tailwind'in `p-*`/`gap-*`/`m-*` gibi utility'lerinde
kullanılır.

| px   | Tailwind utility sayısı | Kullanım amacı (öneri)                   |
| ---- | ----------------------- | ---------------------------------------- |
| 4px  | `-1`                    | En küçük iç boşluk (ikon-metin arası)    |
| 8px  | `-2`                    | Küçük bileşen içi boşluk                 |
| 12px | `-3`                    | Form alanı iç boşluğu                    |
| 16px | `-4`                    | Standart bileşen içi boşluk              |
| 24px | `-6`                    | Kart iç boşluğu, bileşenler arası boşluk |
| 32px | `-8`                    | Bölüm içi büyük boşluk                   |
| 48px | `-12`                   | Bölümler arası boşluk (mobil)            |
| 64px | `-16`                   | Bölümler arası boşluk (masaüstü)         |

**Dikkat:** Tailwind'de sayı doğrudan piksel değildir — `4 × 4px`'lik bir
çarpandır (`p-4` = 16px, 4px değil).

## 5. Köşe Yarıçapları

Boşluk ölçeğiyle aynı 4px ritmine hizalı. Tailwind'in kendi varsayılan
`sm`/`md`/`lg`/`xl` değerleri (4/6/8/12px) bu ritme uymadığı için
`app/globals.css`'te override edildi.

| Token       | Değer | Kullanım amacı                        |
| ----------- | ----- | ------------------------------------- |
| `radius-sm` | 4px   | Küçük buton, badge, form input        |
| `radius-md` | 8px   | Varsayılan buton/kart                 |
| `radius-lg` | 12px  | Büyük kart, panel                     |
| `radius-xl` | 16px  | Hero görsel çerçevesi, öne çıkan kart |

**Gerekçe:** "Ciddi/kurumsal" ton için üst sınır 16px'te tutuldu — aşırı
yuvarlak (bubbly, tüketici-uygulaması hissi veren) bir görünümden
kaçınıldı. `rounded-full` (pill/avatar) Tailwind varsayılanında bırakıldı,
override edilmedi.

## 6. Gölge Seviyeleri

| Token       | Açık tema                                                        | Koyu tema                                                  |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `shadow-sm` | `0 1px 2px rgb(22 25 29 / .06)`                                  | `0 1px 2px rgb(0 0 0 / .3)`                                |
| `shadow-md` | `0 4px 8px rgb(22 25 29 / .08), 0 1px 2px rgb(22 25 29 / .06)`   | `0 4px 8px rgb(0 0 0 / .36), 0 1px 2px rgb(0 0 0 / .24)`   |
| `shadow-lg` | `0 8px 16px rgb(22 25 29 / .1), 0 2px 4px rgb(22 25 29 / .06)`   | `0 8px 16px rgb(0 0 0 / .4), 0 2px 4px rgb(0 0 0 / .28)`   |
| `shadow-xl` | `0 16px 32px rgb(22 25 29 / .12), 0 4px 8px rgb(22 25 29 / .08)` | `0 16px 32px rgb(0 0 0 / .46), 0 4px 8px rgb(0 0 0 / .32)` |

**Kullanım amacı:** Kart/panel/modal gibi bileşenlerde derinlik/öncelik
katmanı belirtmek (`sm` en hafif, `xl` en belirgin).

**Gerekçe:** Açık temada gölge rengi keyfi siyah değil, palettin kendi
`neutral-900`'ü — rengin tamamı tek bir sistemden geliyor. Koyu temada
siyah gölge zaten koyu zeminde neredeyse görünmez olduğu için opaklık
artırıldı, ama koyu temada asıl "yükselti" sinyali gölge değil
`surface` → `surface-raised` zemin geçişi (madde 1.3); gölge orada
ikincil/destekleyici.

## 7. Kod Karşılığı ve Kapsam Dışı Bırakılanlar

- Tüm token'lar `app/globals.css`'te tanımlı (`:root`, `[data-theme="dark"]`,
  `@theme inline`, `@theme` blokları) — Tailwind v4 CSS-first konfigürasyon,
  ayrı bir `tailwind.config.js` yok (bkz. `MIMARI.md` madde 3).
- Token'lar henüz hiçbir gerçek bileşende kullanılmıyor —
  `components/site/` hâlâ boş (bkz. `DURUM.md`, "Sıradaki adım"). Bu dosya,
  o bileşenler yazılırken referans alınacak temel altyapı.
- `<html data-theme="...">`'ın tenant'ın `theme_mode` kaydına göre
  sunucu tarafında set edilmesi henüz kodlanmadı — panel/middleware
  çalışmasıyla birlikte ele alınacak.
- Marka rengi tenant özelleştirmesi (`site_settings.primary_color`'ın
  `--color-brand`'ı runtime'da override etmesi) henüz kodlanmadı.
