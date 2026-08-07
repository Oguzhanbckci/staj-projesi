# Mimari

Bu dosya, projenin teknik mimarisini tek yerde toplar: framework, dil, stil,
backend, hosting, render stratejisi ve klasör yapısı. `PRD.md` "ne
yapılacağını" (özellik kapsamı), bu dosya "nasıl yapılacağını" (teknik
seçimler) tanımlar. Kod içermez. Karar değişirse önce `karar-gunlugu.md`'ye
kayıt düşülür, sonra bu dosya güncellenir.

**Son güncelleme:** 2026-08-07

## 0. Bağlam

Tek geliştirici, ~32 iş günlük süre (bkz. `durum.md`, "Proje bağlamı"). Bu
proje kapsamında **gerçek bir müşteriye canlıya alınmıyor** — geliştirme ve
staj değerlendirmesi amaçlı bir ürün/demo inşa ediliyor. Bu, aşağıdaki hosting
kararını doğrudan etkiliyor (madde 5).

## 1. Framework

**Next.js 16, App Router.**

- Server Component varsayılan; middleware ile `Host` başlığına göre istek
  bir tenant domainine mi yoksa platform sahibinin kendi domainine mi
  geldiğini ayırt eder (bkz. madde 7).
- API route handler'ları (`app/api/`) — iletişim formu gönderimi gibi sunucu
  taraflı işlemler için.
- Karar ve gerekçe: `karar-gunlugu.md`, 2026-08-05 ("Teknoloji seçildi");
  versiyon 16'ya güncellendi — bkz. `karar-gunlugu.md`, 2026-08-06 ("Next.js
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
  tenant'ların kendi Auth hesabı yoktur (bkz. `karar-gunlugu.md`, 2026-08-06,
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

**Not:** Supabase, panel arayüzünü yakın zamanda değiştirdi — eski
"Project Settings → API" tek sayfası artık "Integrations → Data API"
(URL için) ve "Configuration → API Keys" (anahtarlar için) olarak ikiye
bölünmüş durumda.

## 5. Hosting

**Vercel, Hobby (ücretsiz) plan.**

Next.js'i native barındıran, custom domain + otomatik SSL + edge middleware
desteği olan platform. Vercel'in ücretsiz planı ticari kullanımı yasaklıyor,
ama bu proje kapsamında **gerçek bir müşteriye canlıya alınmıyor** (madde 0)
— bu nedenle Hobby plan yeterli ve maliyetsiz. Ürün ileride gerçek bir
müşteriye satılıp canlıya alınacaksa, o aşamada Pro plana ($20/ay) geçilmesi
gerekir; bu, staj kapsamının dışında bir gelecek adımdır.

## 6. Render Stratejisi

**Statik üretim + panelden tetiklenen on-demand ISR (Incremental Static
Regeneration).**

- Tenant siteleri ve platform sahibinin tanıtım sitesi **statik üretilir** —
  ziyaretçi neredeyse-statik hızında bir sayfa görür (Lighthouse ≥90, LCP
  1.5-2sn hedefine uygun, bkz. `test-stratejisi.md`).
- `panel`'den bir içerik/tema kaydı yapıldığında, Next.js'in
  `revalidatePath`/`revalidateTag` mekanizmasıyla **ilgili sayfa yeniden
  üretilir** — yeni bir deploy beklemeden değişiklik anında yansır.
- **`/panel`'in kendisi tamamen dinamik/SSR'dır** — auth korumalı, her
  istekte taze veri; statik üretime dahil edilmez.

## 7. Domain & Tenant Çözümleme

Platform sahibi için ayrı bir tablo/altyapı yok — o da `tenants` tablosunda
`is_platform_owner = true` olan özel/rezerve bir satırdır ve diğer
tenant'larla **aynı içerik tablolarını** paylaşır (bkz.
`VERİ-MODELİ.md`).

Next.js middleware, gelen isteğin `Host` başlığını `tenants.domain` ile
eşleştirir:

- Eşleşen satırda `is_platform_owner = true` ise → `/panel` rotası aktif olur
  (login korumalı) + o satırın içerik/tanıtım sitesi render edilir.
- Eşleşen satırda `is_platform_owner = false` ise (normal bir tenant) →
  sadece o tenant'ın herkese açık `(site)` sayfaları render edilir; `panel`
  orada hiç yoktur/erişilemez.

Karar ve gerekçe: `karar-gunlugu.md`, 2026-08-06 ("Domain stratejisi: her
tenant kendi alan adını kullanır", "Panel mimarisi düzeltildi",
"Platform sahibi tenants tablosunda birleştirildi").

## 8. Proje Klasör Yapısı

`AI-KURALLARI.md` madde 3'teki ağaç şemasının detaylı gerekçesi. Next.js
scaffold'ı (`create-next-app`, 2026-08-06) kurulduktan sonra oluşturuldu.

- **`app/`** — Next.js App Router. Kök `layout.tsx` ve `globals.css` burada
  (her iki alt rotaya da uygulanır). İçinde iki route group var:
  - **`app/(site)/`** — herkese açık kurumsal site sayfaları. Route group
    olduğu için URL'e segment eklemez (`/` kökten render edilir). Middleware
    (madde 7) buraya sadece istek bir tenant domaininden veya platform
    sahibinin kendi domaininden geldiğinde yönlendirir.
  - **`app/panel/`** — tek yönetim paneli (madde 4, 7). Şu an sadece bir
    placeholder sayfa var; auth (Supabase) ve gerçek panel arayüzü ileride
    eklenecek.
  - **`app/api/`** — henüz oluşturulmadı; ilk route handler (ör. iletişim
    formu → e-posta gönderimi, bkz. `PRD.md`) eklendiğinde açılacak.
  - **`app/test-services/`** — geçici doğrulama sayfası (2026-08-07), Supabase
    bağlantısının gerçek veriyle çalıştığını göstermek için yazıldı. Gerçek
    Hizmetler bölüm bileşeni (`components/site/`) yazılınca silinecek.
- **`components/`** — React bileşenleri, ikiye ayrılır:
  - **`components/ui/`** — sayfa/tema bağımsız genel UI parçaları (buton,
    input, kart vb.) — henüz boş, `panel` ve `(site)` inşa edilirken
    doldurulacak.
  - **`components/site/`** — hazır bölüm kütüphanesi (Hero, Hakkımızda,
    Hizmetler, Projeler, İletişim — bkz. `PRD.md` madde 3.3, `rakip-analizi.md`).
    Henüz boş; `docs/durum.md`'deki sıradaki adımda ilk bileşenler buraya
    yazılacak.
- **`lib/`** — sunucu/iş mantığı yardımcıları:
  - **`lib/supabase/`** — client/server Supabase istemcileri ve sorgu
    fonksiyonları (bkz. madde 4). `server.ts` (service role client) ve
    `queries.ts` (`getServices()`) yazıldı ve gerçek veriyle doğrulandı
    (2026-08-07); tarayıcı tarafı client (`client.ts`, panel auth için)
    henüz yok.
  - **`lib/utils.ts`** — genel yardımcı fonksiyonlar (tarih/metin formatlama
    vb.). Henüz placeholder.
- **`types/`** — paylaşılan TypeScript tipleri (`Tenant`, `Section`, `Theme`
  vb. — veri modeli Supabase şeması tasarlanınca netleşecek). Henüz
  placeholder.
- **`supabase/migrations/`** — iki dosya: `20260806120000_create_content_tables.sql`
  (8 tablo) ve `20260807120000_add_testimonials_faqs_team_tables.sql`
  (`testimonials`, `faqs`, `team_members` — bkz. `karar-gunlugu.md`,
  2026-08-07). Toplam 11 tablo, RLS açık ama henüz policy yok (bkz.
  `VERİ-MODELİ.md`). Her ikisi de gerçek Supabase projesine uygulandı;
  `supabase/seed.sql` (11 tablonun tamamı için gerçekçi demo veri) de
  çalıştırıldı — veritabanı dolu.
- **`public/`** — statik dosyalar. Şu an sadece `create-next-app`'in
  varsayılan SVG'leri var (`next.svg`, `vercel.svg` vb.); gerçek
  marka/portfolyo görselleri eklenince temizlenecek.

## 9. Açık Sorular

Şu an aktif açık soru yok.
