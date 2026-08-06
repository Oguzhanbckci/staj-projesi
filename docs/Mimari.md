# Mimari

Bu dosya, projenin teknik mimarisini tek yerde toplar: framework, dil, stil,
backend, hosting ve render stratejisi. `PRD.md` "ne yapılacağını" (özellik
kapsamı), bu dosya "nasıl yapılacağını" (teknik seçimler) tanımlar. Kod
içermez. Karar değişirse önce `karar-gunlugu.md`'ye kayıt düşülür, sonra bu
dosya güncellenir.

**Son güncelleme:** 2026-08-06

## 0. Bağlam

Tek geliştirici, ~32 iş günlük süre (bkz. `durum.md`, "Proje bağlamı"). Bu
proje kapsamında **gerçek bir müşteriye canlıya alınmıyor** — geliştirme ve
staj değerlendirmesi amaçlı bir ürün/demo inşa ediliyor. Bu, aşağıdaki hosting
kararını doğrudan etkiliyor (madde 5).

## 1. Framework

**Next.js 15, App Router.**

- Server Component varsayılan; middleware ile `Host` başlığına göre istek
  bir tenant domainine mi yoksa platform sahibinin kendi domainine mi
  geldiğini ayırt eder (bkz. madde 7).
- API route handler'ları (`app/api/`) — iletişim formu gönderimi gibi sunucu
  taraflı işlemler için.
- Karar ve gerekçe: `karar-gunlugu.md`, 2026-08-05 ("Teknoloji seçildi").

## 2. Dil

**TypeScript, strict mode.** `any` tipi kullanılmaz (bkz. `AI-KURALLARI.md`
madde 4). Çok kiracılı veri modelinde (tenant/bölüm/tema) tip güvenliği,
hataların derleme zamanında yakalanmasını sağlar.

## 3. Stil

**Tailwind CSS**, utility-first. `globals.css` dışında ayrı CSS dosyası
açılmaz (bkz. `AI-KURALLARI.md` madde 4). Bölüm kütüphanesi bileşenleri
(`components/site/`) ve panel arayüzü bu şekilde yazılır; tema (açık/koyu,
renk) verisi Tailwind class'larına `panel`'den gelen ayarlarla eşlenir.

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

Next.js middleware, gelen isteğin `Host` başlığına bakar:

- İstek platform sahibinin kendi domainineyse → `/panel` rotası aktif olur
  (login korumalı) + platform sahibinin tanıtım sitesi render edilir.
- İstek bir tenant'ın kendi domainineyse (ör. `akmeinsaat.com.tr`) → sadece o
  tenant'ın herkese açık `(site)` sayfaları render edilir; `panel` orada hiç
  yoktur/erişilemez.

Domain → tenant eşlemesi bir veritabanı tablosunda tutulur. Karar ve gerekçe:
`karar-gunlugu.md`, 2026-08-06 ("Domain stratejisi: her tenant kendi alan
adını kullanır", "Panel mimarisi düzeltildi").

## 8. Açık Sorular

Şu an aktif açık soru yok.
