# Mimari

Bu dosya, projenin teknik mimarisini tek yerde toplar: framework, dil, stil,
backend, hosting, render stratejisi ve klasör yapısı. `PRD.md` "ne
yapılacağını" (özellik kapsamı), bu dosya "nasıl yapılacağını" (teknik
seçimler) tanımlar. Kod içermez. Karar değişirse önce `KARAR-GUNLUGU.md`'ye
kayıt düşülür, sonra bu dosya güncellenir.

**Son güncelleme:** 2026-08-17 — `ACTIVE_TENANT_DOMAIN` kaynak koddan
ortam değişkenine taşındı (madde 7), yeni müşteri kurulum kılavuzu için
(bkz. `KURULUM.md`)

## 0. Bağlam

Tek geliştirici, ~32 iş günlük süre (bkz. `DURUM.md`, "Proje bağlamı"). Bu
proje kapsamında **gerçek bir müşteriye canlıya alınmıyor** — geliştirme ve
staj değerlendirmesi amaçlı bir ürün/demo inşa ediliyor. Bu, aşağıdaki hosting
kararını doğrudan etkiliyor (madde 5).

## 1. Framework

**Next.js 16, App Router.**

- Server Component varsayılan; proxy (Next.js 16'da `middleware`'in yeni
  adı, bkz. `KARAR-GUNLUGU.md` 2026-08-10) ile `Host` başlığına göre istek
  bir tenant domainine mi yoksa platform sahibinin kendi domainine mi
  geldiğini ayırt eder (bkz. madde 7).
- API route handler'ları (`app/api/`) — iletişim formu gönderimi gibi sunucu
  taraflı işlemler için.
- Karar ve gerekçe: `KARAR-GUNLUGU.md`, 2026-08-05 ("Teknoloji seçildi");
  versiyon 16'ya güncellendi — bkz. `KARAR-GUNLUGU.md`, 2026-08-06 ("Next.js
  16'ya güncellendi").

## 2. Dil

**TypeScript, strict mode.** `any` tipi kullanılmaz (bkz. `AI-KURALLARI.md`
madde 4). Çok kiracılı veri modelinde (tenant/bölüm/tema) tip güvenliği,
hataların derleme zamanında yakalanmasını sağlar.

Mutlak import path'i `@/*` proje köküne eşlenmiş durumda (`tsconfig.json`,
`compilerOptions.paths`) — ör. `import { cn } from "@/lib/utils"`,
`import type { Tenant } from "@/types"`. Bağıl (`../../..`) import zinciri
kullanılmaz. Kod kalitesi ESLint 9 (flat config, `eslint-config-next`) ile
denetlenir (bkz. `AI-KURALLARI.md` madde 4: "Commit öncesi ESLint ve Prettier
hatasız geçmeli").

## 3. Stil

**Tailwind CSS v4**, utility-first. `globals.css` dışında ayrı CSS dosyası
açılmaz (bkz. `AI-KURALLARI.md` madde 4). Bölüm kütüphanesi bileşenleri
(`components/site/`) ve panel arayüzü bu şekilde yazılır; tema (açık/koyu,
renk) verisi Tailwind class'larına `panel`'den gelen ayarlarla eşlenir.

Tailwind v4, v3'ten farklı çalışır — **`tailwind.config.js` yok**;
konfigürasyon `app/globals.css` içinde `@import "tailwindcss";` ve `@theme`
direktifiyle CSS üzerinden yapılır (renk/font değişkenleri `--color-*`,
`--font-*` gibi CSS custom property'leri olarak tanımlanır). PostCSS eklentisi
`@tailwindcss/postcss` (`postcss.config.mjs`). Yeni bir tema/renk sistemi
kurulurken bu `@theme` bloğu genişletilir.

## 4. Backend

**Supabase** — tek serviste üç katman:

- **Postgres** — tenant, bölüm, içerik, tema verisi. Her tabloda `tenant_id`;
  RLS ile bir tenant'ın verisi başka bir tenant'a asla sızmaz (bkz.
  `AI-KURALLARI.md` madde 6).
- **Auth** — tek kullanıcı: platform sahibi. `/panel` girişi bununla korunur;
  tenant'ların kendi Auth hesabı yoktur (bkz. `KARAR-GUNLUGU.md`, 2026-08-06,
  "Panel mimarisi düzeltildi").
- **Storage** — proje/portfolyo görselleri, tenant site görselleri.

Sorgular bileşen içine yazılmaz, `lib/supabase/` altındaki fonksiyonlar
üzerinden çağrılır (bkz. `AI-KURALLARI.md` madde 4).

Tablo/kolon tasarımı için tek referans: **`docs/VERİ-MODELİ.md`**.

### 4.1 Ortam Değişkenleri

Şablon dosya: **`.env.local.example`** (commit'li, sadece değişken adlarını
gösterir). Gerçek değerleri içeren **`.env.local`** `.gitignore`'da (`.env*`
kuralı) — **asla commit'lenmez**, her geliştirici kendi makinesinde kendisi
oluşturur.

| Değişken | Nereden alınır | Not |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → **Integrations → Data API** → Project URL | Kopyalanan adresin sonunda `/rest/v1/` geliyorsa silinmeli — `@supabase/supabase-js` sadece kök adresi bekler, yolu kendisi ekler. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → **Configuration → API Keys** → `service_role` (secret) | RLS'i bypass eder, yalnızca `lib/supabase/server.ts` gibi sunucu tarafı kodda kullanılır; `NEXT_PUBLIC_` öneki yoktur, tarayıcıya asla gönderilmez (bkz. `AI-KURALLARI.md` madde 6.4). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → **Configuration → API Keys** → `anon`/`public` | RLS'e tabidir (bypass etmez), tarayıcıya gönderilmesi güvenlidir. Panel auth (Supabase Auth oturumu) ve RLS testleri (`scripts/test-rls.mjs`) için kullanılır. |

**Not:** Supabase, panel arayüzünü yakın zamanda değiştirdi — eski
"Project Settings → API" tek sayfası artık "Integrations → Data API"
(URL için) ve "Configuration → API Keys" (anahtarlar için) olarak ikiye
bölünmüş durumda.

### 4.2 Şema Tipleri (Supabase CLI)

`types/database.types.ts`, Supabase CLI ile `supabase/migrations/`'daki
gerçek şemadan **otomatik üretilir** — elle düzenlenmez. `lib/supabase/`
altındaki sorgu fonksiyonları bu tipi kullanır (`createClient<Database>`),
bu sayede `select("yanlis_kolon_adi")` gibi bir yazım hatası derleme
zamanında yakalanır.

Şema her değiştiğinde (yeni migration eklendiğinde) yeniden üretmek için:
```
npm run types:generate
```
(`package.json`'daki script, `supabase gen types typescript --project-id
<ref> --schema public > types/database.types.ts` komutunu çalıştırır.)

**Önemli:** Bu komut ham haliyle (`npx supabase gen types ...`) doğrudan
Windows PowerShell'de çalıştırılırsa, `>` yönlendirmesi dosyayı **UTF-16**
kodlamasıyla yazar (TypeScript için geçersiz) — `npm run types:generate`
kullanılmalı, çünkü npm script'leri Windows'ta `cmd.exe` üzerinden çalışır
ve bu sorunu yaşamaz. Ayrıca komut `SUPABASE_ACCESS_TOKEN` ortam
değişkenini (hesap düzeyinde bir Personal Access Token, Dashboard → hesap
simgesi → Access Tokens) gerektirir — kalıcı olarak `.env.local`'e
eklenmedi, gerektiğinde geçici olarak `$env:SUPABASE_ACCESS_TOKEN="..."`
ile o oturuma özel ayarlanır. Detay ve karşılaşılan CLI sorunları:
`KARAR-GUNLUGU.md`, 2026-08-07 ("Supabase CLI ile şema tipleri üretildi").

## 5. Hosting

**Vercel, Hobby (ücretsiz) plan.**

Next.js'i native barındıran, custom domain + otomatik SSL + edge middleware
desteği olan platform. Vercel'in ücretsiz planı ticari kullanımı yasaklıyor,
ama bu proje kapsamında **gerçek bir müşteriye canlıya alınmıyor** (madde 0)
— bu nedenle Hobby plan yeterli ve maliyetsiz. Ürün ileride gerçek bir
müşteriye satılıp canlıya alınacaksa, o aşamada Pro plana ($20/ay) geçilmesi
gerekir; bu, staj kapsamının dışında bir gelecek adımdır.

**İlk gerçek canlı yayın (2026-08-17):** Proje `staj-projesi-olive.
vercel.app` adresine yayınlandı — bu, mimarinin (statik üretim, ISR,
proxy tabanlı auth, güvenlik başlıkları) ilk defa gerçek bir Vercel
ortamında çalıştığı doğrulamadır. Bu süreçte, yerel geliştirmede/kod
incelemesinde yakalanamayan 2 gerçek hata bulunup düzeltildi (CSP
`script-src`, tenant-domain/gerçek-yayın-adresi karışıklığı) — detay:
`KARAR-GUNLUGU.md` "sekizinci oturum", `TEST-STRATEJISI.md` madde 13,
madde 7 (aşağıda).

## 6. Render Stratejisi

**Statik üretim + panelden tetiklenen on-demand ISR (Incremental Static
Regeneration).**

- Tenant siteleri ve platform sahibinin tanıtım sitesi **statik üretilir** —
  ziyaretçi neredeyse-statik hızında bir sayfa görür (Lighthouse ≥90, LCP
  1.5-2sn hedefine uygun, bkz. `TEST-STRATEJISI.md`).
- `panel`'den bir içerik/tema kaydı yapıldığında, Next.js'in
  `revalidatePath`/`revalidateTag` mekanizmasıyla **ilgili sayfa yeniden
  üretilir** — yeni bir deploy beklemeden değişiklik anında yansır.
- **`/panel`'in kendisi tamamen dinamik/SSR'dır** — auth korumalı, her
  istekte taze veri; statik üretime dahil edilmez.

**Somut örnek (2026-08-10, `page_sections`):** Panelden bir bölümün
sırası/görünürlüğü/varyantı değiştirildiğinde, o kaydı yazan sunucu
eylemi/route handler'ı `revalidatePath("/")` çağırmalı — bu, sayfanın bir
sonraki istekte yeniden üretilmesini tetikler. `page_sections`'ı okuyan
`getPageSections()` (bkz. `lib/supabase/queries.ts`) React'in `cache()`
fonksiyonuyla sarılı (tek istek içindeki tekrarı önlemek için), Next'in
kendi veri önbelleğini değil — bu yüzden `revalidatePath`/`revalidateTag`
davranışını etkilemez. Panel henüz kodlanmadığı için bu çağrı da henüz
yok; kodlandığında eklenmesi gereken tek satır bu.

## 7. Domain & Tenant Çözümleme

Platform sahibi için ayrı bir tablo/altyapı yok — o da `tenants` tablosunda
`is_platform_owner = true` olan özel/rezerve bir satırdır ve diğer
tenant'larla **aynı içerik tablolarını** paylaşır (bkz.
`VERİ-MODELİ.md`).

Next.js proxy'si (eski adıyla middleware), gelen isteğin `Host` başlığını `tenants.domain` ile
eşleştirir:

- Eşleşen satırda `is_platform_owner = true` ise → `/panel` rotası aktif olur
  (login korumalı) + o satırın içerik/tanıtım sitesi render edilir.
- Eşleşen satırda `is_platform_owner = false` ise (normal bir tenant) →
  sadece o tenant'ın herkese açık `(site)` sayfaları render edilir; `panel`
  orada hiç yoktur/erişilemez.

Karar ve gerekçe: `KARAR-GUNLUGU.md`, 2026-08-06 ("Domain stratejisi: her
tenant kendi alan adını kullanır", "Panel mimarisi düzeltildi",
"Platform sahibi tenants tablosunda birleştirildi").

**Geçici (2026-08-10, 2026-08-17'de env değişkenine taşındı):** Tenant
çözümleyen proxy mantığı henüz yazılmadığı için `lib/supabase/queries.ts`'teki
`getActiveTenantId()`, Host header yerine sabit bir domain'e göre tek bir
tenant hedefliyor — tüm sorgu fonksiyonları (`getServices`, `getHeroSection`,
`getPageSections` vb.) ve tema çözümlemesi (`getSiteThemeSettings`) bu tek
fonksiyona bağlı. Bu domain artık kaynak kodda sabit DEĞİL,
`process.env.ACTIVE_TENANT_DOMAIN`'den okunuyor (yoksa `akmeinsaat.com.tr`'ye
düşer) — "tek müşteri = tek kurulum" modelinde (bkz. `PRD.md`,
`docs/KURULUM.md`) her müşterinin kendi Vercel projesinde bu değişkeni
kendi alan adına ayarlaması yeterli, kaynak kodda satır değiştirip
yeniden deploy etmeye gerek kalmıyor. Host header'a göre GERÇEK/otomatik
çözümleme (çok kiracılı TEK deploy senaryosu için) hâlâ yazılmadı — bu
mantık yazıldığında `getActiveTenantId()` bir `tenantDomain` parametresi
alacak şekilde genişletilmeli (Host header → proxy → sayfa/layout → bu
fonksiyona parametre olarak akmalı) — kök `proxy.ts` zaten var (panel auth
için, bkz. `GUVENLIK.md` madde 5), tenant çözümleme AYNI dosyaya
eklenmeli (Next.js proje başına tek proxy dosyasına
izin veriyor). Detay ve gerekçe (neden platform sahibinin satırı değil):
`KARAR-GUNLUGU.md`, 2026-08-10.

**Önemli kavram ayrımı (2026-08-17'de canlıda bulunan bir hatadan
sonra netleşti):** `ACTIVE_TENANT_DOMAIN`/`tenants.domain` ("tenant
kimliği" — DB'de hangi tenant'ın verisi gösterilsin sorusuna cevap) ile
sitenin gerçekte hangi adresten yayınlandığı ("gerçek yayın adresi")
FARKLI kavramlardır — bir demo/geliştirme deploy'unda ikisi
uyuşmayabilir. `lib/seo/getSiteUrl.ts`, sadece ikincisini (gerçek yayın
adresi) çözer: `NEXT_PUBLIC_SITE_URL` (elle ayarlanan, en güvenilir),
sonra `VERCEL_PROJECT_PRODUCTION_URL` (Vercel'in projeye atadığı kalıcı
üretim adresi), sonra tenant domain'i (son çare). `VERCEL_URL` BİLİNÇLİ
OLARAK kullanılmaz — deploy'a özel, her yayında değişen bir hash adresi
verir, yanlış sonuca götürür (bkz. `KARAR-GUNLUGU.md` "sekizinci
oturum"). `sitemap.ts`/`robots.ts`/`generateMetadata`/
`getLocalBusinessData` hep bu fonksiyonu kullanır, asla ham
`tenants.domain`'i site adresi olarak varsaymaz.

**Kanonik adrese yönlendirme:** `lib/supabase/proxy.ts`'teki
`updateSession()`, kanonik adres (`NEXT_PUBLIC_SITE_URL`/
`VERCEL_PROJECT_PRODUCTION_URL`) KESİN olarak biliniyorsa ve istek
başka bir host'tan (Vercel'in git-dalı önizleme adresi, deploy'a özel
adresi vb.) geliyorsa, 308 (kalıcı) yönlendirmeyle kanonik adrese
yönlendirir — hem SEO (tek bir "gerçek" adres) hem panel oturum
çerezlerinin her zaman aynı origin'de kalması için. Detay:
`GUVENLIK.md` madde 8.

## 8. Proje Klasör Yapısı

`AI-KURALLARI.md` madde 3'teki ağaç şemasının detaylı gerekçesi. Next.js
scaffold'ı (`create-next-app`, 2026-08-06) kurulduktan sonra oluşturuldu.

- **`app/`** — Next.js App Router. Kök `layout.tsx` ve `globals.css` burada
  (her iki alt rotaya da uygulanır). İçinde iki route group var:
  - **`app/(site)/`** — herkese açık kurumsal site sayfaları. Route group
    olduğu için `page.tsx` (`/`) URL'e segment eklemez. Proxy (madde 7,
    henüz tenant çözümleme kısmı yok) buraya sadece istek bir tenant
    domaininden veya platform sahibinin kendi domaininden geldiğinde
    yönlendirir. *(2026-08-13)* `ekip/` ve `iletisim/` — Ekip/İletişim
    artık ana sayfanın `page_sections`'a bağlı bölümleri değil, bu iki
    gerçek alt rota (bkz. `KARAR-GUNLUGU.md`); `layout.tsx`'i (Navbar/
    Footer) diğer `(site)` sayfalarıyla aynen paylaşırlar.
    *(2026-08-21)* `projeler/` ve `projeler/[slug]/` eklendi: proje
    kataloğu ve her yayınlanmış projenin kendi STATİK detay sayfası
    (`generateStaticParams`). Öncesinde proje detayı yalnızca bir
    modaldı — adresi yoktu, indekslenemiyordu. `dynamicParams`
    varsayılanı (true) bilinçli korunuyor: build'den sonra panelden
    eklenen bir proje ilk istekte üretilir, 404 dönmez. Ziyaretçi
    rotalarının tamamı artık: `/`, `/projeler`, `/projeler/[slug]`,
    `/ekip`, `/iletisim`.
  - **`app/panel/`** — tek yönetim paneli (madde 4, 7). *(2026-08-10)*
    Auth kuruldu: `giris/page.tsx` (herkese açık giriş sayfası, "next"
    parametresiyle geri dönüş) + `(protected)/` route group'u
    (`layout.tsx` — oturum kontrolü + `PanelShell` kabuğu). *(2026-08-12)*
    `page.tsx` artık gerçek bir özet ekranı (hizmet/proje/okunmamış mesaj
    sayıları), `mesajlar/page.tsx` gerçek mesaj listesi, `medya/`/`tema/`/
    `ayarlar/` basit "yakında" placeholder'ları. Detay: `docs/GUVENLIK.md`
    madde 5-9. *(2026-08-14)* `icerikler/` artık bir dizin sayfası +
    `hizmetler/` ve `projeler/` — her ikisi de liste tablosu + ekleme
    formu + sunucu eylemi (bkz. madde 9-10, "İçerik Yönetimi Deseni" /
    "Sunucu Eylemleri Kuralları").
  - **`app/api/`** — henüz oluşturulmadı; ilk route handler (ör. iletişim
    formu → e-posta gönderimi, bkz. `PRD.md`) eklendiğinde açılacak.
  - **`app/test-services/`** — geçici doğrulama sayfası (2026-08-07), Supabase
    bağlantısının gerçek veriyle çalıştığını göstermek için yazıldı. Gerçek
    Hizmetler bölüm bileşeni (`components/site/`) yazılınca silinecek.
- **`components/`** — React bileşenleri, üçe ayrılır:
  - **`components/ui/`** — sayfa/tema bağımsız genel UI parçaları (buton,
    input, kart vb.) — hem `(site)` hem `panel` bunları kullanır.
  - **`components/panel/`** *(2026-08-12 eklendi)* — sadece panele özel
    bileşenler: `PanelShell.tsx` (kenar menü + üst başlık + mobil açılır
    menü kabuğu), `navItems.ts` (menü öğeleri). *(2026-08-14)*
    `AdminListTable.tsx` + `StatusBadge.tsx` — içerik yönetim
    tablolarının paylaşılan bileşenleri (bkz. madde 9). *(2026-08-14,
    aynı gün genişletildi)* `ConfirmDeleteDialog.tsx` (özel silme onayı),
    `PublishToggleButton.tsx` (listeden tek tık yayınla/taslağa al),
    `ReorderButtons.tsx` (yukarı/aşağı sıralama) — üçü de `DeleteButton.tsx`
    ile aynı "client adacığı" deseninde. `components/ui/`'daki
    genel bileşenleri (Button, Card) kullanır ama kendi başına
    `components/site/`'tan tamamen bağımsız — ikisi asla birbirini
    import etmez (bkz. `AI-KURALLARI.md` madde 3).
  - **`components/site/`** — hazır bölüm kütüphanesi (Hero, Hakkımızda,
    Hizmetler, Projeler, Referanslar, İstatistikler, SSS, Ekip, Eylem
    Çağrısı, İletişim, Footer — bkz. `PRD.md` madde 3.3, `RAKIP-ANALIZI.md`).
    Her bölüm kendi alt klasöründe (`types.ts` + varyant(lar) + kendi
    verisini kendi çeken `<X>Section.tsx`); `PageSections.tsx`,
    `page_sections`'a göre hepsini sıraya dizen üst düzey bileşen
    (2026-08-10).
- **`lib/`** — sunucu/iş mantığı yardımcıları:
  - **`lib/supabase/`** — client/server Supabase istemcileri ve sorgu
    fonksiyonları (bkz. madde 4). `server.ts` (`createServiceRoleClient` —
    herkese açık içerik sorguları; `createServerSupabaseClient` —
    *(2026-08-10)* panel auth için, oturum çerezini okur/yazar) ve
    `queries.ts` (tüm `getXSection()` fonksiyonları) yazıldı ve gerçek
    veriyle doğrulandı. `client.ts` *(2026-08-10)* — tarayıcı tarafı
    (`"use client"`) istemcisi, panel giriş/çıkış için. `proxy.ts`
    *(2026-08-10)* — kök `proxy.ts`'in çağırdığı oturum tazeleme +
    `/panel` koruma mantığı (bkz. `GUVENLIK.md` madde 5, 8). `panelQueries.ts`
    *(2026-08-12)* — sadece `app/panel/(protected)/` içinden çağrılan,
    `createServerSupabaseClient` kullanan (service role DEĞİL) panel
    özeti/mesaj/liste sorguları (`getAllServices`, `getNextOrderIndex`
    vb., *(2026-08-14)* genişletildi) — herkese açık içerik sorgularından bilinçli
    olarak ayrı bir dosyada.
  - **`lib/sections/`** *(2026-08-10)* — `config.ts` (tip güvenli
    `SectionKey` union'ı + anchor/nav etiket eşlemeleri) ve `registry.tsx`
    (`SectionKey` → doğru bölüm bileşeni dizici, `renderSection()`).
  - **`lib/validation/`** *(2026-08-11 eklendi, 2026-08-14 genişledi)* —
    saf zod şemaları (`contact.ts`, `service.ts`, `project.ts`) — hem
    istemci formunda hem sunucu eyleminde AYNI şema (bkz. madde 9).
  - **`lib/panel/`** *(2026-08-14 eklendi)* — `actionResult.ts`:
    `ActionResult<T>` (panel sunucu eylemlerinin ortak tipli dönüş şekli)
    + `requireAdminUser()` (bkz. madde 10).
  - **`lib/utils.ts`** — genel yardımcı fonksiyonlar. *(2026-08-12)*
    `getSafeRedirectPath()` eklendi — panel girişindeki açık yönlendirme
    (open redirect) koruması (bkz. `GUVENLIK.md` madde 8).
- **`types/`** — paylaşılan TypeScript tipleri. `database.types.ts`,
  Supabase CLI ile gerçek şemadan otomatik üretilir (bkz. madde 4.2),
  elle düzenlenmez. `index.ts` henüz placeholder.
- **`scripts/`** — tek seferlik/geçici geliştirme araçları (uygulamanın
  parçası değil). `test-rls.mjs` — RLS politikalarını anon/authenticated
  rolleriyle karşılaştırmalı test eden doğrulama script'i (bkz.
  `KARAR-GUNLUGU.md`, 2026-08-07).
- **`supabase/migrations/`** — iki dosya: `20260806120000_create_content_tables.sql`
  (8 tablo) ve `20260807120000_add_testimonials_faqs_team_tables.sql`
  (`testimonials`, `faqs`, `team_members` — bkz. `KARAR-GUNLUGU.md`,
  2026-08-07). Toplam 11 tablo, RLS açık ama henüz policy yok (bkz.
  `VERİ-MODELİ.md`). Her ikisi de gerçek Supabase projesine uygulandı;
  `supabase/seed.sql` (11 tablonun tamamı için gerçekçi demo veri) de
  çalıştırıldı — veritabanı dolu.
- **`public/`** — statik dosyalar. Şu an sadece `create-next-app`'in
  varsayılan SVG'leri var (`next.svg`, `vercel.svg` vb.); gerçek
  marka/portfolyo görselleri eklenince temizlenecek.

## 9. İçerik Yönetimi Deseni *(2026-08-14 eklendi, aynı gün genişletildi)*

Panelden içerik ekleme (Hizmetler, Projeler, Referanslar, SSS, Ekip — 5
içerik türünün hepsi birebir aynı deseni kullanıyor) hep aynı 5 parçadan
oluşur:

1. **Doğrulama şeması** (`lib/validation/<varlık>.ts`) — saf bir zod
   şeması, React'e/Next.js'e bağımlı değil. Hem formda (istemci, canlı
   hata metni) hem sunucu eyleminde (gerçek doğrulama) AYNI şema
   kullanılır — kural iki yerde ayrı ayrı yazılıp birbirinden sapmaz.
2. **Okuma sorgusu** (`lib/supabase/panelQueries.ts`) — `getAllX()`,
   `createServerSupabaseClient()` (authenticated, service role DEĞİL)
   kullanır, `is_published` filtresi YOK (admin taslakları da görmeli).
3. **Sunucu eylemi** (`app/panel/(protected)/icerikler/<varlık>/actions.ts`)
   — bkz. madde 10, "Sunucu Eylemleri Kuralları".
4. **Form** (`.../<Varlık>Form.tsx`, `"use client"`) — `useActionState` +
   paylaşılan `components/ui/SubmitButton.tsx` (gönderiliyor durumu) ve
   `components/ui/FormErrorSummary.tsx` (hata özeti, `role="alert"`,
   alanlara linkli). Hata varsa form alanları DOM'da olduğu gibi kalır
   (React `defaultValue`'yu var olan bir DOM node'da yeniden zorlamaz) —
   ayrıca "values" taşımaya gerek yok.
5. **Liste tablosu** (`components/panel/AdminListTable.tsx`, paylaşılan) —
   başlık/durum/sıra/işlem sütunları. "Düzenle" gerçek bir sayfaya
   (`[id]/page.tsx` — kayıt bulunamazsa `notFound()`) giden link. Durum
   sütunu *(2026-08-14, aynı gün genişletildi)* artık salt-okunur değil:
   `components/panel/PublishToggleButton.tsx` — `StatusBadge` (salt
   gösterim, değişmedi) yanında, TIKLANINCA NE OLACAĞINI söyleyen bir
   buton ("Yayınla"/"Taslağa Al" — durumun kendisini değil eylemi
   anlatıyor, teknik olmayan kullanıcı için belirsizliği azaltır). Sıra
   sütununda `components/panel/ReorderButtons.tsx` — yukarı/aşağı
   butonlarıyla komşu kayıtla `order_index` takası (bkz.
   `swapOrderIndex()`, `lib/supabase/panelQueries.ts`; sınırda buton
   `disabled`). "Sil" `components/panel/DeleteButton.tsx` — artık
   `window.confirm()` DEĞİL, `components/panel/ConfirmDeleteDialog.tsx`
   (kaydın adını gösteren, `useDialogBehavior` tabanlı özel dialog —
   native confirm'ün butonları stillenemediği için değiştirildi, bkz.
   `KARAR-GUNLUGU.md`). Yıkıcı butonlar `Button`'ın yeni `"danger"`
   varyantıyla (kenarlık+metin, dolgu değil) görsel olarak ayrışıyor.

**Düzenleme formu, ekleme formuyla AYNI bileşen** (`<X>Form.tsx`) — bir
`service`/`project` prop'u verilirse düzenleme moduna geçer: alanlar
mevcut değerlerle doldurulur, `updateXAction`'a `id`
`.bind(null, id)` ile önceden bağlanır (Next.js'in Server Action'lara ekstra
bağlam geçirme yöntemi — `useActionState`'in `(prevState, formData)`
imzasından ÖNCE bağlanır). Silme ve güncelleme eylemleri de `.eq("tenant_id",
tenantId)` ile ekstra bir tenant kontrolü yapar — RLS zaten
authenticated'e tam yetki veriyor, bu ONA GÜVENMEK YERİNE bilinçli bir
ek savunma katmanı.

**Yeni bir içerik türü eklemek** bu 5 parçayı aynı isimlendirme/dosya
yerleşimiyle tekrarlamak demektir — `AdminListTable`,
`SubmitButton`/`FormErrorSummary`, `ConfirmDeleteDialog`,
`PublishToggleButton`, `ReorderButtons` zaten paylaşılan, sadece
şema/sorgu/eylem/form o varlığa özel yazılır. Referanslar/SSS/Ekip
(2026-08-14) bu deseni harfiyen izleyerek eklendi, hiçbir yeni migration
gerekmedi (RLS/şema zaten hazırdı).

**"Değişiklik yoksa yazma yapma"** *(2026-08-14, aynı gün eklendi)* —
her `update*Action`, DB'ye yazmadan ÖNCE mevcut kaydı (zaten var olan
`get*ById`) çekip doğrulanmış yeni değerlerle alan alan karşılaştırır;
fark yoksa `.update()` VE `revalidatePath()` hiç çağrılmaz. Bu
karşılaştırma paylaşılan bir yardımcıya ÇIKARILMADI — her varlığın
alanları farklı, birkaç satırlık kod her `actions.ts`'de tekrarlanıyor
(bilinçli, bkz. `TASARIM-SISTEMI.md` madde 9.8).

**Sıra numarası** (`order_index`) admin'den ham bir sayı olarak
istenmiyor — `getNextOrderIndex()` (panelQueries.ts) mevcut en büyük
değer + 10'u otomatik hesaplıyor (çakışma riski yok, seed verisindeki
10'ar artış deseniyle tutarlı, bkz. `VERİ-MODELİ.md`).

## 10. Sunucu Eylemleri Kuralları *(2026-08-14 eklendi)*

Paneldeki her yazma işlemi (`"use server"` fonksiyonu) şu sırayı TAKİP
ETMEK ZORUNDADIR:

1. **Oturum kontrolü İLK satır olmalı** (`requireAdminUser()`, bkz.
   `lib/panel/actionResult.ts`). Sayfa zaten panel auth'un arkasında
   (`app/panel/(protected)/layout.tsx`) ama Next.js Server Action'ları
   sayfadan bağımsız, doğrudan çağrılabilir uç noktalar olarak da
   yayınlanır — bu kontrol olmadan biri sayfayı hiç açmadan eylemi
   çağırabilir. Bkz. `docs/GUVENLIK.md` madde 5, aynı ilke panel formu
   Server Action'ları için de geçerli.
2. **İstemciden gelen veriye asla güvenilmez** — `FormData`'dan çıkarılan
   ham veri, istemcideki AYNI zod şemasıyla sunucuda TEKRAR doğrulanır.
   İstemci tarafı doğrulama sadece UX içindir (hızlı geri bildirim),
   güvenlik sınırı değildir.
3. **Dönüş tipi her zaman `ActionResult<TFields>`** (bkz.
   `lib/panel/actionResult.ts`) — `{success:true}` ya da
   `{success:false, fieldErrors, formError?}`. Çağıran taraf (form)
   `if (state.success)` ile dallanabilir, `undefined`/`any` yok.
4. **Veritabanı hatası asla ham olarak kullanıcıya dönmez** —
   `console.error()` ile sunucuya loglanır, kullanıcıya sabit, Türkçe,
   ne yapması gerektiğini söyleyen bir mesaj döner (ör. "Hizmet
   kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.") — asla
   "Bir hata oluştu" gibi belirsiz bir mesaj değil, ama Postgres/Supabase
   hata detayı da değil (bilgi sızıntısı riski).
5. **Başarıda `revalidatePath()` ile DOĞRU yol tazelenir** — hangi yolun
   tazeleneceği, o içeriğin ziyaretçi sitesinde NEREDE render edildiğine
   bakılarak belirlenir. Hizmetler/Projeler/Referanslar/SSS → `"/"`,
   çünkü `page_sections`'a göre ana sayfada render ediliyorlar (bkz.
   `components/site/services/ServicesSection.tsx`). **İstisna — Ekip →
   `"/ekip"`** *(2026-08-14, aynı gün eklendi)*: 2026-08-13'te
   `page_sections`'tan çıkarılıp ayrı bir sayfaya taşındığı için (bkz.
   `KARAR-GUNLUGU.md`, 2026-08-13), `"/"`'i tazelemek hiçbir işe
   yaramaz — bu, yeni bir içerik türü eklerken kolay gözden kaçabilecek
   bir ayrıntı, her seferinde ilgili sayfanın gerçekten nerede render
   edildiği kontrol edilmeli. `/panel`'in kendisi zaten `force-dynamic`
   (bkz. madde 8, `(protected)/layout.tsx`) — panel sayfaları için
   ayrıca revalidate GEREKMEZ, her istekte zaten taze veri okur.

**Doğrulama (2026-08-14, gerçek — kod incelemesi değil):** Bir hizmet
gerçek Supabase Auth oturumuyla eklenip, `revalidatePath("/")`
çağrılmadan ÖNCE ana sayfanın hâlâ eski (statik) hâli gösterdiği, çağrıdan
SONRA ise yeni hizmetin anında göründüğü `curl` ile kanıtlandı — bu, hem
doğru yolun seçildiğini hem statik+on-demand ISR mimarisinin
(`docs/MIMARI.md` madde 6) gerçekten çalıştığını gösterdi. Test verisi
ve geçici test route'u/script'leri doğrulama sonrası silindi.

## 11. Görsel Yükleme Deseni *(2026-08-14 eklendi)*

Panelden Storage'a görsel yükleme (şu an sadece Projeler) — güvenlik
kuralları için tek referans **`docs/GUVENLIK.md` madde 11-12**, burada
sadece dosya yerleşimi/mimari:

- `lib/supabase/imageValidation.ts` — saf, hem istemci hem sunucuda
  kullanılan doğrulama (magic-byte tür tespiti + boyut sabiti) —
  `lib/validation/*.ts`'teki zod şemalarıyla AYNI ilke (tek doğrulama
  mantığı, iki yerde tekrar edilmez).
- `app/panel/(protected)/icerikler/projeler/imageActions.ts` —
  `uploadProjectImageAction`/`deleteProjectImageAction`, madde 10'daki
  "Sunucu Eylemleri Kuralları"na tabi (auth ilk satır, hata mesajları
  Türkçe/anlamlı, `revalidatePath("/")`) ama metin alanlarını kaydeden
  `actions.ts`'ten BİLİNÇLİ olarak ayrı bir dosya — görsel yükleme kendi
  başına bir yan etki, form kaydetmeyle karışmıyor.
- `app/panel/(protected)/icerikler/projeler/ProjectImageUploader.tsx` —
  sadece düzenleme modunda (`[id]/page.tsx`), `ProjectForm`'un YANINDA
  ayrı bir bileşen.
- `app/panel/(protected)/medya/` — Medya Kütüphanesi, `/panel`'in eskiden
  placeholder olan rotası artık gerçek. Silme, `DeleteButton`/
  `ConfirmDeleteDialog`'u (bkz. madde 9) HİÇ DEĞİŞTİRMEDEN yeniden
  kullanıyor — `id` prop'una bir DB satırı yerine Storage path'i
  veriliyor, bileşenler generic olduğu için farkı bilmiyor.
- **Kapsam *(güncellendi: 2026-08-21)*:** Bu paragraf 2026-08-14'te
  yazıldı ve o gün doğruydu — ama 2026-08-18'de kalan 5 bucket
  (`services`/`hero`/`about`/`testimonials`/`team`) migration'la kuruldu
  ve yükleme akışı 8 panel ekranına yayıldı. Yani **6 bucket'ın hepsi
  kurulu**; bu maddedeki desen artık "ileride tekrarlanabilir" değil,
  fiilen tekrarlanmış durumda. Aynı tekrar 2026-08-20 denetiminde mimari
  borç olarak da kaydedildi (9 kopyalı `imageActions`, bkz. `DURUM.md`
  "Sıradaki adım" madde 15) — desen çalışıyor ama tek bir fabrikaya
  indirilmeyi bekliyor.

## 12. Mesajlar: CRUD-Dışı Bir Varlık İçin Uyarlanmış Desen *(2026-08-14 eklendi)*

`contact_messages`, madde 9'daki 5-parçalı içerik yönetimi deseninin
UYMADIĞI ilk varlık — mesajların "ekleme"si (ziyaretçi formu, anonim,
service role ile) ve "yayınlama"sı yok, sadece okuma + tek yönlü bir
durum değişikliği (okundu işaretleme) var. Bu yüzden:

- Liste (`app/panel/(protected)/mesajlar/MessageListTable.tsx`)
  `AdminListTable`'ı ZORLA kullanmadı — görsel dili (tablo/başlık/hücre
  CSS'i) kopyaladı ama veri şekli farklı olduğu için ayrı bir bileşen.
- **"Görüntüleyince okundu işaretle" — sayfa RENDER'ında değil, bir
  Server Action'la, istemci tarafında otomatik tetiklenir.** Detay
  sayfası (`mesajlar/[id]/page.tsx`) salt-okunur render eder; görünmez
  bir client bileşen (`MarkMessageReadOnView.tsx`) mount olunca
  `markMessageReadAction`'ı (mesajlar/actions.ts) bir kez çağırır (ref
  korumalı — React Strict Mode'un dev'de çift çalıştırmasına karşı).
  Bu, madde 10'daki "her yazma bir Server Action, `requireAdminUser()`
  ile başlar" kuralını KORUYOR — bir Server Component'in render'ı
  içine çıplak bir DB yazması gömülmedi.
- `getUnreadMessagesCount()` artık SADECE özet ekranında değil,
  `app/panel/(protected)/layout.tsx`'te (her sayfada çalışan koruma
  katmanı) çağrılıp `PanelShell`'e prop olarak akıyor — "müşteri panele
  girer girmez görsün" gereksinimi bunu gerektirdi (özet ekranı sadece
  `/panel`'in kendisinde render olur, diğer sayfalarda değil).

## 13. Açık Sorular

Şu an aktif açık soru yok.
