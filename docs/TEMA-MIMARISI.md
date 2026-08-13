# Tema Mimarisi

`docs/TASARIM-SISTEMI.md` token'ların **neye karar verildiğini** (renk,
tipografi, boşluk, radius, gölge — sabit değerler) anlatır. Bu dosya ise o
token'lardan hangilerinin **tenant'a göre çalışma anında (runtime) nasıl
değiştiğini** — veritabanı → sunucu bileşeni → CSS değişkeni → Tailwind
sınıfı akışını — anlatır. İkisi birlikte okunmalı; kod içermez, gerçek
implementasyon `app/globals.css`, `lib/theme/`, `app/layout.tsx`'te.

**Son güncelleme:** 2026-08-08

## 1. Tema Akışı

```
tenants.theme_mode ──┐
site_settings        ├─→ getSiteThemeSettings()  ─→ resolveThemeTokens()  ─→ <html data-theme style>
  .theme_preset       │      (lib/supabase/            (lib/theme/               (app/layout.tsx)
  .primary_color ─────┘        queries.ts)                resolve.ts)
```

1. **`getSiteThemeSettings()`** (`lib/supabase/queries.ts`) — veritabanından
   üç değeri okur: `tenants.theme_mode` (açık/koyu), `site_settings.
   theme_preset` (hangi hazır ön ayar) ve `site_settings.primary_color`
   (varsa, ön ayarı ezen serbest marka rengi). Şu an "aktif site" olarak
   platform sahibinin kendi tenant kaydı (`is_platform_owner = true`)
   kullanılıyor — Host başlığına göre gerçek tenant çözümlemesi yapan
   middleware henüz yok (bkz. `DURUM.md`, "Sıradaki adım"). Supabase'e
   erişilemezse veya `theme_preset` kolonu henüz yoksa (migration
   uygulanmadıysa) **sessizce güvenli varsayılana düşer** — kök layout
   asla çökmez.
2. **`resolveThemeTokens()`** (`lib/theme/resolve.ts`) — bu üç değeri, o
   preset'in tanımına (`lib/theme/presets.ts`) göre gerçek CSS değerlerine
   çevirir: marka rengi (açık/koyu varyantından doğru olanı seçer, ya da
   `primary_color` varsa onu kullanır), köşe yarıçapı skalası, font
   değişkeni referansı. Serbest `primary_color` girildiğinde, buton
   metninin (beyaz mı yakın-siyah mı) okunur kalması için basit bir
   luminance sezgisiyle (`pickReadableOnColor`) otomatik seçilir.
3. **`app/layout.tsx`** (async Server Component) — bu iki fonksiyonu
   çağırır, sonucu `<html data-theme="..." style={{...}}>` olarak doğrudan
   sunucu tarafında üretilen HTML'e yazar. Hiçbir client bileşeni yok.
4. **Tailwind sınıfları** (`bg-brand`, `rounded-lg`, `text-text` vb.)
   `app/globals.css`'teki `@theme inline` eşlemesi sayesinde bu CSS
   değişkenlerini okur — `<html>`'deki inline `style` en yüksek CSS
   önceliğine sahip olduğu için, bir bileşen `bg-brand` yazdığında o anki
   tenant'ın gerçek marka rengi devreye girer.

## 2. Token Listesi

Token'ların tam listesi, kullanım amaçları ve WCAG kontrast doğrulaması:
**`docs/TASARIM-SISTEMI.md`**. Bu dosyanın ilgilendiği alt küme — **runtime'da
DB'den enjekte edilebilen** token'lar:

| Token | Kaynak | Varsayılan (statik, `globals.css`) | Runtime'da nereden gelir |
|---|---|---|---|
| `--color-brand` | `lib/theme/presets.ts` + `site_settings.primary_color` | `#2561c1` (açık) / `#6998e2` (koyu) | Preset veya tenant'ın özel rengi |
| `--color-brand-on` | `lib/theme/presets.ts` + hesaplanan | `#ffffff` (açık) / `#16191d` (koyu) | Preset veya `pickReadableTextColor()` (bkz. madde 6, "Kontrast Güvenliği") |
| `--color-accent` | `site_settings.secondary_color` | `var(--color-surface-raised)` (nötr, "secondary" buton görünümüyle aynı) | Sadece `secondary_color` doluysa enjekte edilir |
| `--color-accent-on` | hesaplanan | `var(--color-text)` | `secondary_color` doluysa `pickReadableTextColor()` |
| `--radius-sm/md/lg/xl` | `lib/theme/presets.ts` + `site_settings.border_radius_scale` | 4/8/12/16px | Preset VEYA panelden seçilen bağımsız ölçek (bkz. madde 5) |
| `--font-sans` | `lib/theme/presets.ts` + `site_settings.font_family_key` | `var(--font-geist-sans)` | Preset VEYA panelden seçilen bağımsız font (bkz. madde 5) |

Diğer tüm token'lar (nötr gri ölçeği, semantik renkler, tipografi, boşluk,
gölge) **sabittir** — hiçbir tenant/preset'e göre değişmez, sadece
`app/globals.css`'te tanımlıdır (`docs/TASARIM-SISTEMI.md`).

## 3. Tema Ön Ayarları

İki hazır preset (`lib/theme/presets.ts`), ileride panelden bir seçim
listesi olarak sunulacak (`site_settings.theme_preset` kolonuna yazılır —
bkz. `supabase/migrations/20260808120000_add_theme_preset_to_site_settings.sql`):

| Preset | Marka (açık) | Marka (koyu) | Radius | Font |
|---|---|---|---|---|
| **Kurumsal Mavi** (`kurumsal-mavi`, varsayılan) | `#2561c1` | `#6998e2` | 4/8/12/16px (ölçülü) | Geist Sans |
| **Modern Koyu** (`modern-koyu`) | `#166966` | `#24a8a4` | 6/12/20/28px (daha yuvarlak) | Manrope |

Her iki preset'in marka rengi de açık **ve** koyu zeminde ≥4.5:1 (gövde) /
buton dolgusu üzerinde ≥4.5:1 olacak şekilde doğrulandı (aynı yöntem:
`docs/TASARIM-SISTEMI.md` madde 2) — "Modern Koyu" ismine rağmen açık temada
da kullanılabilir, isim sadece görsel karakterini (daha yuvarlak, farklı
marka rengi) tanımlıyor.

`site_settings.primary_color`/`secondary_color` kolonları kaldırılmadı —
tenant, seçtiği preset'in üzerine kendi marka rengini girip preset'in
varsayılan rengini **override edebilir**; radius ve font tamamen preset'e
bağlı kalır (ayrı ham kolonları yok, bilinçli — bkz. madde 5).

## 4. Yeni Tema Nasıl Eklenir

**Yeni bir preset** (ör. "Sıcak Toprak") eklemek için:

1. `lib/theme/presets.ts` — `THEME_PRESETS`'e yeni bir anahtar ekle (marka
   açık/koyu, brandOn açık/koyu — kontrastı elle doğrula, bkz.
   `docs/TASARIM-SISTEMI.md` madde 2 — radius skalası, font referansı).
   `THEME_PRESET_KEYS`'e de ekle.
2. Yeni bir font kullanılacaksa `app/layout.tsx`'e `next/font/google`
   ile yükle, `--font-*` değişken adını preset'teki `fontVariable`'a yaz.
3. `supabase/migrations/` altına yeni bir migration ekle —
   `site_settings_theme_preset_check` constraint'ini yeni anahtarı
   içerecek şekilde güncelle (`alter table ... drop constraint ...`,
   `add constraint ... check (theme_preset in (...))`).

**3 dosya** (`lib/theme/presets.ts`, gerekiyorsa `app/layout.tsx`, gerekiyorsa
yeni bir migration). `lib/theme/resolve.ts` ve `app/layout.tsx`'in enjeksiyon
mantığına dokunulmaz — ikisi de preset anahtarından bağımsız, generic çalışır.

**Yeni bir DB'den enjekte edilebilir token** (ör. ileride "buton yüksekliği")
eklemek için **3 dosya**: `app/globals.css` (statik varsayılan/fallback
değeri tanımla), `lib/theme/presets.ts` (her preset için değeri ekle),
`lib/theme/resolve.ts` (`styleVars` nesnesine yeni `--` anahtarını ekle).
`app/layout.tsx`'e dokunulmaz — `styleVars` zaten olduğu gibi `<html>`'e
aktarılıyor.

**Yeni, tenant'a göre hiç değişmeyen statik bir token** (ör. yeni bir
semantik renk) eklemek için **1 dosya**: sadece `app/globals.css`.

## 5. Tema Düzenleyici (Panel)

**2026-08-15'te eklendi** — `/panel/tema`, artık gerçek bir form: marka
rengi, ikincil (accent) renk, köşe yarıçapı, font ailesi + site kimliği
(firma adı, slogan, iletişim, sosyal medya) + logo/favicon yükleme.

**Köşe yarıçapı ve font, preset'e BAĞIMLI değil — bağımsız override.**
Bilinçli bir karar (kullanıcıyla netleştirildi, bkz. `KARAR-GUNLUGU.md`
2026-08-15): `theme_preset` seçimi için panelde hâlâ bir arayüz yok (açık
madde, aşağıda), ama radius/font artık `primary_color`'la AYNI "override"
deseniyle bağımsız ayarlanabiliyor —

- `site_settings.border_radius_scale` (nullable) — `lib/theme/
  radiusScales.ts`'teki 3 hazır ölçekten biri (`keskin`/`dengeli`/
  `yuvarlak`; `dengeli`/`yuvarlak` mevcut 2 preset'in radius değerleriyle
  birebir aynı, `keskin` yeni bir üçüncü seçenek). **Serbest piksel girişi
  YOK** — next/font/google build-time yüklendiği gibi, radius de
  isimlendirilmiş, önceden tasarlanmış bir küçük seçenek kümesinden
  seçiliyor, tutarsız/aşırı değerlere kapı açılmıyor.
- `site_settings.font_family_key` (nullable) — `lib/theme/fonts.ts`'teki
  5 anahtardan biri (`geist-sans`/`manrope`/`inter`/`poppins`/`work-sans`).
  **Serbest metin girişi YOK** — next/font/google runtime'da şartlı font
  yüklemeyi desteklemiyor (madde 8'deki "İki font her zaman yükleniyor"
  kısıtının doğal uzantısı), bu yüzden 3 yeni font (Inter, Poppins, Work
  Sans) `app/layout.tsx`'e build-time eklendi — artık **5 font her zaman
  yükleniyor**, hangisi seçili olursa olsun.

Her ikisi de null iken preset'in kendi değeri geçerli kalır (`lib/theme/
resolve.ts`) — tam olarak `primary_color`'ın çalışma şekli.

**Renk seçici:** Yeni `components/ui/ColorPickerField.tsx` — native
`<input type="color">` (gerçek bir renk seçici, yeni bağımlılık yok) +
eşlenik hex metin kutusu, ikisi aynı state'i paylaşıyor. `components/ui/`
altındaki **ilk client bileşen** (madde 9.9'un "gerçek state
senkronizasyonu" istisnası — canlı önizleme her tuş vuruşunda
güncellenmeli).

**Canlı önizleme, gerçek `<html>`'e DOKUNMUYOR.** `ThemeEditor.tsx`
(client) form state'ini tutuyor, `ThemePreview.tsx`'e geçiriyor —
önizleme kutusu `resolveThemeTokens()`'ın (gerçek `app/layout.tsx`'in
kullandığı AYNI fonksiyon) ürettiği `styleVars`'ı KENDİ `<div style>`'ına
yazıyor. Bu, madde 1'deki mekanizmanın (CSS özel değişkenleri herhangi
bir DOM scope'unda override edilebilir, sadece `<html>`'e özgü değil)
doğal bir sonucu — ek kod gerekmedi. Kaydetme ayrı bir Server Action
(`updateThemeSettingsAction`); önizleme sadece client state, kaydedilmeden
gerçek siteyi hiç etkilemiyor.

**İkincil renk → `--color-accent`.** `secondary_color` boşken bu token
`app/globals.css`'te statik olarak nötr (`Button`/`LinkButton`'ın eski
"secondary" görünümüyle birebir aynı — sıfır regresyon) bir varsayılana
işaret ediyor; doluysa `resolve.ts` gerçek rengi + hesaplanan okunabilir
metin rengini enjekte ediyor. İlk görünür kullanım yeri: `CtaSection.tsx`
(Eylem Çağrısı butonu, `variant="accent"`).

## 6. Kontrast Güvenliği

**Yeni, saf modül: `lib/theme/contrast.ts`.** Eskiden `lib/theme/
resolve.ts` içinde gömülü, kaba bir luminance sezgisi (`pickReadableOnColor`,
`luminance > 0.35 ise koyu metin`) vardı — bu **gerçek bir hataya**
sahipti: `#808080` (orta gri) için beyaz metin öneriyordu, oysa gerçek
WCAG hesabı **siyahın** kazandığını gösteriyor (5.32:1 vs 3.95:1 — beyaz
AA eşiğinin (4.5:1) ALTINDA kalıyor). Bu, "göz kararı yerine WCAG kontrast
oranına dayan" isteğinin somut, ölçülebilir karşılığı.

- `getRelativeLuminance(hex)` — WCAG sRGB→linear→luminance formülü.
- `getContrastRatio(hexA, hexB)` — iki rengin WCAG kontrast oranı (sayı,
  ör. `4.52`).
- `pickReadableTextColor(backgroundHex)` — siyah/beyazdan HANGİSİ bu
  arka plan üzerinde GERÇEKTEN daha yüksek kontrast veriyorsa onu döner
  (`#000000` | `#ffffff`) — iki gerçek oranı hesaplayıp karşılaştırır,
  sabit bir luminance eşiği KULLANMAZ.
- `checkContrastWarning(backgroundHex, foregroundHex?, threshold=4.5)` —
  `{ ratio, passes, recommendedTextColor }` döner; `ratio` her zaman
  sayısal, arayüzde doğrudan gösterilebilir (panelde marka/ikincil renk
  alanlarının altında canlı gösteriliyor, eşiğin altındaysa görünür bir
  uyarı satırı çıkıyor).

**Saf, bağımsız, test edilebilir** — React'e/Next.js'e bağımlı değil,
throw eden tek hata yolu (geçersiz hex) `lib/theme/resolve.ts`'te tek bir
noktada (`safeReadableTextColor`) yakalanıp kök layout'un "asla çökmez"
ilkesi korunuyor (bkz. madde 8). Vitest bu projede henüz kurulu değil
(bkz. `DURUM.md` açık madde) — bu görev kapsamında kurulmadı; doğrulama
gerçek hesaplarla yapıldı (bkz. `KARAR-GUNLUGU.md`, 2026-08-15: açık
sarı/koyu lacivert/orta gri için sonuçlar).

`resolve.ts`, hem `primary_color` hem `secondary_color` için AYNI
fonksiyonu kullanıyor — kod tekrarı yok, marka rengi ve ikincil renk
üzerindeki metin her zaman aynı kurala göre hesaplanıyor.

## 7. Site Kimliği Alanları

Firma adı/slogan/iletişim/sosyal medya/logo/favicon — panelin Tema
ekranındaki "Site Kimliği" bölümü. **Yeni tablolar İCAT EDİLMEDİ**,
mevcut, zaten Footer/İletişim tarafından okunan tablolara yazılıyor:

| Alan | Kaynak | Not |
|---|---|---|
| Firma adı | `tenants.name` | Zaten vardı, sadece forma eklendi |
| Slogan | `site_settings.slogan` (yeni) | Footer'da firma adının altında |
| Adres/telefon/e-posta | `contact_sections.*` | Footer VE `/iletisim` ZATEN buradan okuyor — form BURAYA yazıyor |
| Sosyal medya | `site_settings.facebook_url/instagram_url/linkedin_url` | Zaten vardı ve render ediliyordu, sadece form eklendi |
| Logo | `site_settings.logo_path` (yeni Storage bucket: `"branding"`) | Navbar'da, yoksa sadece metin (regresyon yok) |
| Favicon | `site_settings.favicon_path` (yeni) | `app/(site)/layout.tsx`'in `generateMetadata()`'sında, yoksa statik `app/favicon.ico` |

**Temizlenen ölü kolonlar:** `site_settings.contact_email`/`contact_phone`
2026-08-06'dan beri kod tabanının hiçbir yerinde okunmuyordu (gerçek
kaynak her zaman `contact_sections` idi) — 2026-08-15 migration'ında
düşürüldü, karışıklık kaynağı ortadan kaldırıldı.

**Logo/favicon yükleme**, Projeler'deki görsel yükleme deseninin
(`lib/supabase/imageValidation.ts` — magic-byte tür kontrolü, 10MB sınır,
benzersiz dosya adı, atomik temizlik) birebir tekrarı, sadece `"branding"`
adında yeni bir Storage bucket'ında (`"projects"`in 5-policy RLS deseninin
aynısı). Panel tarafında tek generic `BrandImageUploader.tsx` (markup
paylaşılıyor) ama sunucu eylemleri (`uploadLogoAction`/`uploadFaviconAction`/
`deleteLogoAction`/`deleteFaviconAction`) bilerek ayrı — her biri farklı
DB kolonuna yazıyor.

## 8. FOUC Önlemi

FOUC (yanlış renkle boyanıp sonradan düzelme), genellikle tema değerinin
sayfa tarayıcıda boyandıktan **sonra** client-side JS ile (ör. `useEffect`
içinde `localStorage` okuyup `document.documentElement`'e class ekleme)
uygulanmasından kaynaklanır — ilk boyama varsayılan/yanlış değerle olur,
JS çalışınca "zıplama" görünür. Bu projede tema tamamen **sunucu
tarafında**, veritabanından `RootLayout`'ta (async Server Component)
okunup `<html>` etiketinin `style` özniteliğine ve `data-theme`'ine satır
içi (inline) olarak yazılıyor — yani tarayıcıya ulaşan **ilk HTML
baytlarında** zaten doğru marka rengi/radius/font tanımlı; hiçbir client
JS'in "düzeltmesi" gerekmiyor. Bu, sadece bir optimizasyon değil, mimarinin
doğal sonucu: `getSiteThemeSettings()`/`resolveThemeTokens()` hiçbir
`"use client"` içermeyen saf sunucu kodu olduğu için, yanlış renkle
render olup sonradan değişme durumu **mimari olarak mümkün değil** —
`npm run build` sonrası üretilen statik HTML çıktısında bu doğrulandı
(`<html data-theme="light" style="--color-brand:...">` baştan itibaren
mevcut).

## 9. Açık Sorular / Bilinen Sınırlar

- **Tenant çözümlemesi henüz yok.** `getSiteThemeSettings()` şu an sabit
  olarak platform sahibinin kendi kaydını okuyor; Host başlığına göre
  gerçek tenant çözümleyen middleware yazılınca bu fonksiyon bir tenant id
  parametresi almalı (bkz. `DURUM.md`).
- **Beş font her zaman yükleniyor** (Geist Sans, Manrope, Inter, Poppins,
  Work Sans — 2026-08-15'te 2'den 5'e çıktı), hangi preset/seçim aktif
  olursa olsun — `next/font/google` çalışma zamanı verisine göre şartlı
  font yüklemeye izin vermiyor, font seçimi build zamanında sabitleniyor.
  Lighthouse Performance ≥90 hedefi (`TEST-STRATEJISI.md`) için henüz
  yeniden ölçülmedi — bu bir açık madde.
- ~~Panelden preset (`theme_preset`) SEÇİMİ arayüzü yok~~ — **2026-08-16'da
  kapandı.** `/panel/tema`'daki `ThemePresetPicker.tsx`, "Kurumsal Mavi"/
  "Modern Koyu" için onaylı bir "Uygula" butonu sunuyor (`theme_preset`'i
  değiştirip 4 override kolonunu — primary_color/secondary_color/
  border_radius_scale/font_family_key — null'a çekiyor, aksi halde
  override'lar preset seçimini gölgelerdi) + ayrı bir "Varsayılana Dön"
  (kurtarma) butonu. Detay: `KARAR-GUNLUGU.md`, 2026-08-16.
- **Yerel derleme cache'i bayat veri gösterebilir.** `theme_preset`
  migration'ı uygulanıp platform tenant satırı eklendikten sonra
  `npm run build` ilk seferde hâlâ eski (bulunamadı → fallback) sonucu
  verdi; `.next` klasörü silinip yeniden derlenince gerçek veri geldi
  (2026-08-08, doğrulandı). Bu, Next.js'in build/route cache'inin dış bir
  veri kaynağındaki (Supabase) değişikliği otomatik algılamamasından
  kaynaklanıyor — kod değişmediği için Next "yeniden render etmeye gerek
  yok" varsayıyor. **Yerelde** bunun çözümü `.next`'i silip yeniden
  derlemek; **prod'da** bu sorunun kalıcı çözümü zaten mimaride var:
  panelden bir kayıt yapıldığında `revalidatePath`/`revalidateTag` ile
  ilgili sayfanın yeniden üretilmesi (bkz. `MIMARI.md` madde 6,
  "Render Stratejisi") — panel henüz kodlanmadığı için bu tetikleyici de
  henüz yok, ama mimari karar zaten bu senaryoyu öngörmüştü.
