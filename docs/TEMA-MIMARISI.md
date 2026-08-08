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
| `--color-brand-on` | `lib/theme/presets.ts` + hesaplanan | `#ffffff` (açık) / `#16191d` (koyu) | Preset veya `pickReadableOnColor()` |
| `--radius-sm/md/lg/xl` | `lib/theme/presets.ts` | 4/8/12/16px | Seçili preset |
| `--font-sans` | `lib/theme/presets.ts` | `var(--font-geist-sans)` | Seçili preset |

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

## 5. FOUC Önlemi

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

## 6. Açık Sorular / Bilinen Sınırlar

- **Tenant çözümlemesi henüz yok.** `getSiteThemeSettings()` şu an sabit
  olarak platform sahibinin kendi kaydını okuyor; Host başlığına göre
  gerçek tenant çözümleyen middleware yazılınca bu fonksiyon bir tenant id
  parametresi almalı (bkz. `DURUM.md`).
- **İki font her zaman yükleniyor** (Geist Sans + Manrope), hangi preset
  seçili olursa olsun — `next/font/google` çalışma zamanı verisine göre
  şartlı font yüklemeye izin vermiyor, font seçimi build zamanında
  sabitleniyor. 2 preset için kabul edilebilir bir maliyet; preset sayısı
  artarsa (Lighthouse Performance ≥90 hedefi için, bkz.
  `TEST-STRATEJISI.md`) yeniden değerlendirilmeli.
- Panelden preset seçimi arayüzü henüz yok — `site_settings.theme_preset`
  şu an sadece seed/migration değeriyle var (bkz. `VERİ-MODELİ.md`).
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
