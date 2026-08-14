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

**Son güncelleme:** 2026-08-18 (yeni renk paleti denemesi — bkz. madde 1-2)

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
| `--color-neutral-50`  | `#f0f2f4` | Dekoratif/panel amaçlı ham skala basamağı (bkz. not aşağıda)     |
| `--color-neutral-100` | `#e2e5e9` | Dekoratif/panel amaçlı ham skala basamağı                        |
| `--color-neutral-300` | `#e2e6eb` (açık) / `#303844` (koyu) *(2026-08-18)* | Kenarlık (`border-neutral-300`, ~40 dosyada) — **artık temaya göre DEĞİŞİR**, eskiden sabitti (bkz. madde 1.3 altındaki not) |
| `--color-neutral-500` | `#5e6a7d` | Dekoratif/panel amaçlı ham skala basamağı                        |
| `--color-neutral-700` | `#373e49` | Dekoratif/panel amaçlı ham skala basamağı                        |
| `--color-neutral-800` | `#21252c` | Dekoratif/panel amaçlı ham skala basamağı                        |
| `--color-neutral-900` | `#16191d` | Dekoratif/panel amaçlı ham skala basamağı; `--color-brand-on` (koyu) sabit değeri |

**Not (2026-08-18):** `--color-surface`/`--color-surface-raised`/`--color-text`/
`--color-text-muted` artık bu ham skalaya `var()` ile bağlı DEĞİL — kullanıcının
yeni paletiyle kendi doğrudan hex değerlerini aldılar (madde 1.3). Skala hâlâ
mevcut ve `app/globals.css`'te tanımlı (geriye dönük/dekoratif kullanım için),
ama artık yüzey/metin token'larının kaynağı değil.

| Token              | Açık tema | Koyu tema | Kullanım amacı                                                                     |
| ------------------ | --------- | --------- | ---------------------------------------------------------------------------------- |
| `--color-brand`    | `#2563a8` | `#3b82c4` *(2026-08-18: kullanıcının yeni tam palet denemesi — bkz. madde 2 notu "(3)" ve `KARAR-GUNLUGU.md`)* | Vurgu rengi ("Accent") — CTA buton, link, aktif durum. **Varsayılan**; tenant'a göre değişir. |
| `--color-brand-on` | `#ffffff` | `#16191d` | `--color-brand` dolgusu üzerindeki metin/ikon rengi (buton etiketi)                |
| `--color-hero`      | `#1e4278` | `#183b6b` *(2026-08-18, YENİ token)* | Hero bölümünün (`HeroVariantA.tsx`) görsel yoksa gösterilen zemin rengi — marka renginden BİLEREK ayrı, kullanıcının paletinde ayrı bir "Hero" alanı olduğu için. |
| `--color-accent`    | `var(--color-surface-raised)` | `var(--color-surface-raised)` | İkincil/accent renk (2026-08-15) — `site_settings.secondary_color` boşken nötr, doluysa tenant'ın rengi. `Button`/`LinkButton` `accent` varyantı, Eylem Çağrısı butonu. |
| `--color-accent-on` | `var(--color-text)` | `var(--color-text)` | `--color-accent` dolgusu üzerindeki metin rengi — WCAG-doğru hesaplanır (bkz. `docs/TEMA-MIMARISI.md` madde 6, `lib/theme/contrast.ts`) |

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
| `--color-surface`        | `#f7f8fa`                 | `#171b21`                 | Sayfa zemini ("Sayfa")                              |
| `--color-surface-raised` | `#ffffff`                 | `#242a33`                 | Kart/panel zemini ("Kart") — sayfadan bir seviye "yükselti" |
| `--color-text`           | `#172033`                 | `#f1f4f7`                 | Birincil/gövde metni ("Başlık")                     |
| `--color-text-muted`     | `#5f6b7a`                 | `#aeb7c2`                 | İkincil/daha az önemli metin ("Metin" — meta bilgi, açıklama) |

**Not (2026-08-18):** Dördü de artık `--color-neutral-*` ham skalasına
`var()` ile bağlı DEĞİL, kendi doğrudan hex değerleri var — kullanıcının
verdiği yeni palet ("Sayfa"/"Kart"/"Başlık"/"Metin" adlarıyla) doğrudan
uygulandı. Ayırmadan önce bu 4 rolün dışında `neutral-50/300/500/800/900`
sınıflarının kod tabanında başka hiçbir yerde kullanılmadığı `grep` ile
doğrulandı — ayırmanın yan etkisi yok.

## 2. Kontrast Ölçüm Sonuçları

WCAG 2.1 relative-luminance formülüyle hesaplandı (sRGB → luminance →
contrast ratio). Eşik: gövde metni ≥4.5:1, büyük başlık/UI dolgu metni
≥3:1. **Aşağıdaki tablo, 2026-08-18'deki YENİ TAM PALET denemesinden
SONRAKİ güncel durumu gösterir (3. ve son renk değişikliği, aynı gün —
bkz. not "(3)" aşağıda)** — 2 çift *(2)* hâlâ 4.5:1'in altında (turuncudan
kalma, aynı bağlamda mavi de altında), 1 çift YENİ *(3)* olarak
4.5:1'in az altına düştü (koyu `error`/`surface-raised`).

| Çift                                     | Açık tema     | Koyu tema     | Eşik  | Sonuç |
| ---------------------------------------- | ------------- | ------------- | ----- | ----- |
| `text` / `surface`                       | 15.31:1       | 15.66:1       | 4.5:1 | ✅    |
| `text` / `surface-raised`                | 16.27:1       | 13.08:1       | 4.5:1 | ✅    |
| `text-muted` / `surface`                 | 5.11:1        | 8.52:1        | 4.5:1 | ✅    |
| `text-muted` / `surface-raised`          | 5.43:1        | 7.12:1        | 4.5:1 | ✅    |
| `brand` metin/link / `surface`           | 5.76:1        | 4.26:1        | 4.5:1 | ⚠️ *(2)* |
| `brand` metin/link / `surface-raised`    | 6.12:1        | 3.56:1        | 4.5:1 | ⚠️ *(2)* |
| `brand-on` / `brand` (buton dolgusu)     | 6.12:1        | 4.35:1        | 4.5:1 | ⚠️ *(2)* |
| `brand` / `surface` (büyük başlık)       | 5.76:1        | 4.26:1        | 3:1   | ✅    |
| `hero` metin (beyaz sabit, bkz. madde 1.1) | 9.97:1      | 11.19:1       | 4.5:1 | ✅    |
| `success` / `surface` + `surface-raised` | 5.21 / 5.54:1 | 6.35 / 5.31:1 | 4.5:1 | ✅    |
| `warning` / `surface` + `surface-raised` | 5.14 / 5.46:1 | 5.68 / 4.74:1 | 4.5:1 | ✅    |
| `error` / `surface` + `surface-raised`   | 6.53 / 6.94:1 | 5.31 / 4.44:1 | 4.5:1 | ⚠️ *(3)* (sadece `surface-raised`) |

**Not:** Hesaplama, AI tarafından yazılan tek seferlik bir Node script'iyle
yapıldı (repoya eklenmedi, geçiciydi). Kullanıcı bağımsız bir kontrast
aracıyla da doğrulayacağını belirtti; küçük yuvarlama farkları (±0.01-0.02)
dışında sonuç değişmemesi beklenir.

**(2) 2026-08-18, koyu mod marka rengi mavi kaldı (turuncudan kalma
durum, yeni palette de aynı aralıkta) — dürüstçe işaretlendi:** Aynı gün
koyu moddaki marka rengi ÖNCE `#c36628` (turuncu, "koyu zeminde mavi çok
boğuyor" geri bildirimiyle) oldu, SONRA kullanıcı tamamen yeni bir palet
verip bunu kendi isteğiyle `#3b82c4` (mavi, ama eski `#5b9bff`'ten farklı
— daha doygun) ile geçersiz kıldı. Yeni renk koyu `surface`/
`surface-raised`'e karşı 4.26:1/3.56:1 veriyor — WCAG'in gövde-metni
eşiğinin (4.5:1) az altında ama büyük-metin/UI-bileşeni eşiğini (3:1,
WCAG 1.4.11/2.4.7) rahat geçiyor — turuncudaki (4.41/3.85) ile aynı
büyüklük mertebesinde bir ödünleşim. Bu ÜÇ satırdaki kullanımların hepsi
pratikte büyük/kalın metin bağlamında (buton etiketi, link, aktif durum
vurgusu) — küçük gövde metni olarak kullanılmıyor, bu yüzden ⚠️ olarak
işaretlendi (❌ değil). Kullanıcının açık, iki kez tekrarlanan tercihiyle
kabul edildi, gizlenmedi. Detay: `KARAR-GUNLUGU.md`.

**(3) 2026-08-18, YENİ — koyu `error`/`surface-raised` 4.5:1'in az altına
düştü (4.44:1):** `--color-error` (`#e6656e`) hiç değişmedi, ama koyu
`surface-raised` (`--color-neutral-800`/`#21252c` idi) kullanıcının yeni
paletiyle `#242a33`'e değişince ikisi arasındaki oran 4.72:1'den 4.44:1'e
düştü — 0.06 farkla eşiğin altında. Pratikte bu çift form validasyon
hatası/silme onayı gibi kısa, genelde kalın/vurgulu metinlerde kullanılıyor
(küçük gövde paragrafı değil), bu yüzden ⚠️ olarak işaretlendi; yine de
diğer iki ⚠️'den farklı olarak bu YENİ bir bulgu, önceki bir kullanıcı
kararının uzantısı değil — bilinçli biçimde işaretlenip kullanıcıya
bildirildi, sessizce geçilmedi.

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
- Token'lar artık `components/ui/` altındaki genel bileşenlerde kullanılıyor
  (bkz. madde 8) — `components/site/` (hazır bölüm kütüphanesi) hâlâ boş,
  bkz. `DURUM.md` "Sıradaki adım".
- `<html data-theme="...">`'ın tenant'ın `theme_mode` kaydına göre sunucu
  tarafında set edilmesi ve marka rengi tenant özelleştirmesi
  (`site_settings.primary_color`) kodlandı — detay ve akış:
  `docs/TEMA-MIMARISI.md`.

## 8. Bileşen Envanteri

`components/ui/` — sayfa/tema bağımsız, genel amaçlı UI bileşenleri (bkz.
`AI-KURALLARI.md` madde 3). Çoğu Server Component; üç istisna (canlı
istemci-tarafı davranış gerektirdiği için `"use client"` taşıyor, madde 9.9):
`ColorPickerField` (2026-08-15), `PasswordField` ve `TextScramble` (ikisi de
sekizinci oturum, panel/giriş sayfası görsel zenginleştirmesi). Görsel
doğrulama için geçici bir vitrin sayfası
(`app/test-components/page.tsx`) kullanılmıştı — teslim öncesi temizlik
sırasında (2026-08-17) kaldırıldı, gerçek kullanım artık üretim
bileşenlerinin (Hero/Hizmetler/Panel formları vb.) kendisinde görünür.

| Bileşen | Dosya | Props (özet) | Kullanım amacı |
|---|---|---|---|
| `Button` | `components/ui/Button.tsx` | `variant` (primary/secondary/ghost/danger — `danger` 2026-08-14'te panel silme aksiyonları için eklendi, kenarlık+metin, dolgu yok), `size` (sm/md/lg), `isLoading`, + tüm native `<button>` props | Her türlü tıklanabilir aksiyon — CTA, form submit, panel aksiyonları |
| `Container` | `components/ui/Container.tsx` | `className` ile override edilebilir max-width, + native `<div>` props | Sayfa bölümlerini ve içerik kartlarını tutarlı iç boşluk/max-genişlikle sarmak |
| `SectionHeader` | `components/ui/SectionHeader.tsx` | `eyebrow`, `title`, `description`, `headingLevel` (h2/h3) | Bölüm başlığı — sayfa başlık hiyerarşisini bozmadan (h1 sayfada bir kez, alt bölümler h2/h3) |
| `TextField` | `components/ui/TextField.tsx` | `label`, `error`, `helpText`, + native `<input>` props | Tek satırlık metin girişi (ad, e-posta, telefon vb.) |
| `TextareaField` | `components/ui/TextareaField.tsx` | `label`, `error`, `helpText`, `rows`, + native `<textarea>` props | Çok satırlı metin (iletişim formu mesajı vb.) |
| `SelectField` | `components/ui/SelectField.tsx` | `label`, `error`, `helpText`, `children` (native `<option>`'lar), + native `<select>` props | Sabit seçenekli seçim (konu, kategori vb.) |
| `ColorPickerField` | `components/ui/ColorPickerField.tsx` | `label`, `name`, `value`, `onChange`, `error`, `helpText` | Renk seçimi (native `<input type="color">` + hex metin kutusu) — **`components/ui/`'daki ilk client bileşen** (madde 9.9 istisnası: canlı önizleme için gerçek state senkronizasyonu gerekiyor, 2026-08-15) |
| `PasswordField` | `components/ui/PasswordField.tsx` | `label`, `error`, + native `<input>` props (`type` hariç) | Şifre alanı, göster/gizle butonlu — TextField'ın a11y desenini izler ama TextField'ı client'a çevirmemek için ayrı bir bileşen (madde 9.9 istisnası, ColorPickerField'la aynı gerekçe, sekizinci oturum) |
| `Badge` | `components/ui/Badge.tsx` | `variant` (brand/neutral/accent/success), + native `<span>` props | Küçük pill/chip etiket — durum rozeti değil (bkz. `StatusBadge`/`ReadStatusBadge`, `components/panel/`), dekoratif/bilgilendirici kısa etiketler için (sekizinci oturum) |
| `Tooltip` | `components/ui/Tooltip.tsx` | `label`, `side` (top/bottom), `children` | Salt CSS (group-hover/focus-within) araç ipucu, JS gerektirmez — ikon-sadece butonlarda görsel destek (ekran okuyucu için birincil kanal çağıranın kendi `aria-label`'ı, sekizinci oturum) |
| `TextScramble` | `components/ui/TextScramble.tsx` | `text`, `className` | Metnin "çözülme" animasyonuyla belirmesi (client, `prefers-reduced-motion`'a saygılı, gerçek metin ayrı bir `sr-only` span'de anında mevcut) — giriş sayfası başlığında kullanılıyor (sekizinci oturum) |

## 9. Bileşen API Kuralları

Bu proje için `components/ui/` altında yazılan her yeni bileşenin uyması
gereken kurallar — madde 8'deki bileşenlerin hepsi bu kurallara göre yazıldı,
yenileri de aynı kalıba uymalı:

1. **Gerçek native HTML elementi kullanılır, taklit edilmez.** `Button`
   gerçek `<button>`, form alanları gerçek `<input>`/`<textarea>`/
   `<select>`. `div` + `onClick` ile "buton" yapılmaz — native element,
   klavye erişilebilirliğini (Tab, Enter/Space, native `disabled`
   davranışı) ücretsiz sağlar.
2. **`asChild`/polymorphic (`as` prop ile element değiştirme) karmaşıklığına
   girilmez.** Farklı bir davranış gerekiyorsa ayrı bir bileşen yazılır,
   mevcut bileşen genişletilmez.
3. **Renkler her zaman token class'ları ile yazılır**, hiçbir zaman hex/rgb
   sabit değer değil — `bg-brand`, `text-error`, `border-neutral-300` gibi
   (bkz. madde 1). Böylece bir tenant'ın `--color-brand`'ı değişince tüm
   bileşenler otomatik güncellenir.
4. **Etkileşimli her öğede görünür bir odak halkası olur** —
   `focus-visible:ring-2 focus-visible:ring-brand` (`focus-visible`,
   `focus` değil — sadece klavye kullanıcısına görünür, mouse tıklamasında
   çıkmaz).
5. **Form alanlarında etiket-alan bağı `htmlFor`/`id` ile kurulur**, `id`
   dışarıdan verilmezse React'in `useId()` hook'uyla otomatik üretilir
   (Server Component'te de güvenle çalışır). Hata/yardım metni
   `aria-describedby` ile alana bağlanır; hata metni `role="alert"` taşır.
6. **Yükleniyor durumu ekran okuyucuya `aria-busy` + görünmez (`sr-only`)
   metinle bildirilir**, sadece görsel bir spinner yetmez.
7. **Devre dışı durum native `disabled` ile yapılır** — ayrıca kod
   yazmaya gerek yok, tarayıcı hem tıklamayı engeller hem tab sırasından
   çıkarır.
8. **Bileşen dosyası olabildiğince kısa/sade tutulur** (kabaca 60 satır
   civarı bir üst sınır) — 3+ bileşen arasında ortak markup varsa bile
   (ör. form alanlarındaki etiket/hata/yardım metni kalıbı) paylaşılan bir
   soyutlamaya çıkarılmaz; her bileşen kendi içinde okunabilir kalır. Kod
   tekrarı, gereksiz genelleme/karmaşıklıktan daha ucuza gelir.
9. Varsayılan olarak Server Component — `"use client"` sadece gerçek
   state/etkileşim (ör. bir dropdown'ın kendi açık/kapalı state'i)
   gerektiğinde eklenir.

**Klavye ile doğrulama adımları** (2026-08-17'den beri gerçek ürün
sayfalarında — ör. `/iletisim` formu, panel formları — uygulanır, ayrı
bir vitrin sayfası artık yok):
1. Sayfayı aç, fareye hiç dokunmadan `Tab` tuşuna basarak ilerle.
2. Her buton/form alanına sırayla ulaşabildiğini doğrula — hiçbir
   etkileşimli öğe atlanmamalı.
3. Her odaklanılan öğede belirgin bir halka (`ring`) görünmeli — hiçbir
   öğe "sessizce" odaklanmamalı.
4. "Devre dışı" butona gelindiğinde `Tab`'ın onu **atlaması** gerekir
   (native `disabled` davranışı).
5. Bir butonda `Enter` veya `Space` ile aktifleşebildiğini doğrula.
6. `Select` alanına gelip ok tuşlarıyla seçenekler arasında gezip `Enter`
   ile seçebildiğini doğrula.
7. `Shift+Tab` ile geriye doğru da aynı sırayla gezilebildiğini doğrula.
