# Şu An Neredeyiz

Bu klasör (`docs/`), projede alınan kararları ve açıklamalarını tutar — kod içermez.
Yeni bir oturuma başlarken önce bu dosyayı (güncel durum), sonra `PRD.md`'yi
(özellik bazlı yapılacak/yapılmayacak referansı), `MIMARI.md`'yi (teknik
mimari: framework/dil/stil/backend/hosting/render), `TEST-STRATEJISI.md`'yi
(test yaklaşımı, kalite eşikleri, "bitti" tanımı) ve `VERİ-MODELİ.md`'yi
(Supabase tablo/kolon tasarımı + gerekçeler), `GUVENLIK.md`'yi (tehdit
modeli, RLS politikaları, anahtar yönetimi, güvenlik kontrol listesi) ve
`TASARIM-SISTEMI.md`'yi (renk/tipografi/boşluk/köşe/gölge token'ları,
kontrast doğrulaması), gerekirse `KARAR-GUNLUGU.md`'yi (tarihli, hiç
silinmeyen karar geçmişi) oku.

**Son güncelleme:** 2026-08-08

## Proje bağlamı

**Tek geliştirici, toplam ~32 iş günlük süre. Bu proje kapsamında gerçek bir
müşteriye canlıya alınmıyor** — staj/geliştirme amaçlı bir ürün/demo inşa
ediliyor. Bu kısıtlar, kapsamı sınırlayan birçok kararın (hazır bölüm
kütüphanesi, sınırlı sürükle-bırak, çoklu dilin ertelenmesi, pragmatik/hedefli
test stratejisi, Vercel Hobby plan seçimi) arka planındaki ortak sebep — bkz.
`KARAR-GUNLUGU.md`, 2026-08-06 ("Proje bağlamı netleşti...", "`docs/MIMARI.md`
oluşturuldu...").

## Güncel aşama

Proje yeni başladı. `staj-projesi` klasörü ve `docs/` sistemi kuruldu (`DURUM.md`,
`KARAR-GUNLUGU.md`). Henüz kod/scaffold yok; teknoloji ve mimari kararları aşağıda.

Ayrıca `docs/KURUMSAL-SITE-STANDARTLARI.md` dosyasında iyi bir kurumsal site için
kriter/kontrol listesi hazırlandı (performans, erişilebilirlik, SEO, KVKK/güvenlik,
güven unsurları vb.) — ileride tasarlanacak site bu listeye göre değerlendirilecek.

Proje GitHub'a bağlandı: `https://github.com/Oguzhanbckci/staj-projesi` (public),
ilk commit push'landı.

**Teknoloji kararı verildi:** Next.js 16 (App Router) + TypeScript + Tailwind CSS +
Supabase. Detaylar `KARAR-GUNLUGU.md`'de (2026-08-05, "Teknoloji seçildi";
2026-08-06, "Next.js 16'ya güncellendi"), kod kuralları `docs/AI-KURALLARI.md`'de.

## Ürünün güncel mimarisi (2026-08-06'da netleşti)

Ürün, inşaat firmalarına satılan **tam yönetilen (managed) bir web servis
hizmeti**:

- **Platform sahibinin kendi tanıtım/ajans sitesi var** — hizmeti anlatan,
  herkese açık bir sayfa. Bu sitenin domaininin sonuna `/panel` eklendiğinde,
  kullanıcı adı/şifre isteyen gizli bir giriş açılır. **Sadece platform sahibi**
  buraya girer.
- Bu **tek panel = platformun tüm yönetim merkezi**: yeni müşteri (tenant)
  oluşturma, hazır bir **demo**yu tek tıkla import etme (WordPress temaları
  gibi), bölümleri (Hero, Hakkımızda, Hizmetler, Projeler, İletişim —
  bkz. `RAKIP-ANALIZI.md`; **blog/haberler kavramı kapsam dışı**) sürükle-bırakla
  açma/kapatma/sıralama, ve **her tenant'ın içeriğini/temasını da buradan
  düzenleme**.
- **Müşterinin kendi domaininde (ör. `akmeinsaat.com.tr`) hiçbir panel/login
  yoktur** — sadece herkese açık site vardır. Müşteri de kendi ziyaretçisi gibi
  siteyi görür, değişiklik isteğini platform sahibine iletir.
- Platform sahibinin kendi tanıtım sitesindeki iletişim bölümü: **WhatsApp
  butonu** + **iletişim formu** (ad-soyad, telefon, mesaj) — form platform
  sahibine e-posta olarak iletilir. Marka anonim kalır, kimlik/ekip bilgisi
  paylaşılmaz.
- Barınma: tek Next.js kod tabanı + tek Supabase projesi, çok kiracı
  (multi-tenant); her tenant `tenant_id` + RLS ile izole. Her tenant kendi alan
  adını kullanır (platforma ait alt alan adı değil).
- Bölüm/sayfa modeli: serbest page builder değil, önceden kodlanmış hazır bölüm
  kütüphanesi (sürükle-bırak sadece sıralama/aç-kapat için, bölümün içi sabit
  tasarım). Çoklu dil v1 kapsamı dışında, açık/koyu tema v1'de var.

Tüm gerekçe ve kronoloji için `KARAR-GUNLUGU.md`'deki 2026-08-06 tarihli
kayıtlara bakılabilir (en önemlisi: "Panel mimarisi düzeltildi: tek panel, tek
kullanıcı, tam yönetilen hizmet" — bu, aynı gün ve 2026-08-05'te alınan "iki
panel" / "tenant kendi admin'ine girer" fikirlerini geçersiz kılar). Özellik
bazlı güncel kapsam için tek referans `docs/PRD.md`'dir.

**Yeni:** Test stratejisi netleşti ve `docs/TEST-STRATEJISI.md`'ye taşındı
(staj yönergesi gereği e2e/unit/integration, ama tek geliştirici + 32 iş günü
kısıtıyla pragmatik/hedefli bir yaklaşımla). Unit sürekli, e2e/integration
sadece kritik akışlarda. "Bitti" tanımı (Definition of Done) da bu dosyada.
Lighthouse eşiği netleşti: Performance/Accessibility/Best Practices/SEO
dördünde de ≥90.

**Yeni:** `docs/MIMARI.md` oluşturuldu — teknik mimari tek dosyada toplandı.
İki yeni karar: **Hosting = Vercel, Hobby plan** (proje gerçek müşteriye
canlıya alınmadığı için ücretsiz plan yeterli), **Render stratejisi = statik
üretim + panelden tetiklenen on-demand ISR** (`revalidatePath`/`revalidateTag`
ile panel kaydında ilgili sayfa yeniden üretilir; `/panel` tamamen SSR).

**Kod tarafı başladı (2026-08-06):** Next.js scaffold (`create-next-app`,
TypeScript + Tailwind + App Router) kuruldu — **Next.js 16.3.0** ile (bkz.
`KARAR-GUNLUGU.md`, "Next.js 16'ya güncellendi"). Yanlışlıkla
`C:\Users\toffe\staj-projesi` içine kurulmuştu, doğru konuma
(`C:\Users\toffe\Projects\staj-projesi`) taşındı; `.git` ve `docs/` sağlam
kaldığı doğrulandı, `npm run dev` çalıştığı teyit edildi. Kök dizindeki
`CLAUDE.md`, `docs/DURUM.md`'ye (ve diğer proje beyni dosyalarına) otomatik
işaret edecek şekilde genişletildi.

**Klasör yapısı oluşturuldu (2026-08-06):** `app/(site)/`, `app/panel/`
(placeholder sayfalarla), `components/ui/`, `components/site/`,
`lib/supabase/`, `lib/utils.ts`, `types/index.ts` — hepsi `npm run build` ile
doğrulandı (`/`, `/panel`, `/_not-found` hatasız derleniyor). Her klasörün
amacı `docs/MIMARI.md` madde 8'de belgelendi. `app/api/` henüz yok, ilk
gerçek ihtiyaçta eklenecek.

**Veritabanı şeması netleşti + SQL yazıldı (2026-08-06):** İçerik envanteri
tablolara döküldü, platform sahibi `tenants` tablosunda özel bir satır
(`is_platform_owner`) olarak birleştirildi, sonra dışarıdan gelen bir
yönergeyle karşılaştırılıp revize edildi (bkz. `KARAR-GUNLUGU.md`, "Şema,
dışarıdan gelen bir yönergeyle karşılaştırılıp 3 noktada revize edildi").
Sonuç: **8 tablo** (`tenants`, `site_settings`, `hero_sections`,
`about_sections`, `services`, `projects`, `contact_sections`,
`contact_messages`) — `order_index` sadece `services`/`projects`'te,
`is_published` yalnızca yayın kontrolü gereken tablolarda, görsel kolonları
`*_path` (Storage yolu, tam URL değil). Çalışır SQL migration'ı yazıldı:
`supabase/migrations/20260806120000_create_content_tables.sql` (RLS her
tabloda açık, policy henüz yok) + `supabase/seed.sql` (her tabloya 2 satırlık
doğrulama verisi). Detay: `docs/VERİ-MODELİ.md`.

**Gerçek Supabase projesi kuruldu + ilk migration uygulandı (2026-08-07):**
Kullanıcı supabase.com'da gerçek bir proje oluşturdu, `supabase/migrations/
20260806120000_create_content_tables.sql` içeriği SQL Editor'e yapıştırılıp
çalıştırıldı — hatasız ("Success. No rows returned"), 8 tablo artık gerçek
veritabanında var. `.env.local` ve `lib/supabase/` istemcileri henüz kurulmadı.

**Kapsam genişletildi: Referanslar, SSS, Ekip Üyeleri (2026-08-07):**
Kullanıcı gerçekçi demo içeriği istedi (6 hizmet, 8 proje, 4 referans, 5 SSS,
4 ekip üyesi) — Referanslar/SSS/Ekip Üyeleri PRD kapsamında yoktu, kullanıcı
onayıyla yeni bölüm olarak eklendi (bkz. `KARAR-GUNLUGU.md`). 3 yeni tablo
(`testimonials`, `faqs`, `team_members`) ayrı bir migration'da yazıldı:
`supabase/migrations/20260807120000_add_testimonials_faqs_team_tables.sql`.
Toplam tablo sayısı: **11**.

**Migration + demo verisi gerçek projeye uygulandı (2026-08-07):** İki
migration da (8 tablo + 3 tablo) ve güncellenmiş `supabase/seed.sql` (11
tablonun tamamı, Akme İnşaat için gerçekçi içerik — 6 hizmet, 8 proje, 4
referans, 5 SSS, 4 ekip üyesi; insan-okunur hâli `content/demo-icerik.md`'de)
SQL Editor'den sırayla çalıştırıldı, sonunda "Success". Veritabanı artık
gerçek/gerçekçi demo veriyle dolu.

**Supabase istemcisi kuruldu + gerçek veriyle doğrulandı (2026-08-07):**
`@supabase/supabase-js` paketi kuruldu (`package.json`'a `^2.112.2` olarak
eklendi). `lib/supabase/server.ts` (service role client — RLS bypass eder,
yalnızca sunucu tarafında kullanılır) ve `lib/supabase/queries.ts`
(`getServices()` sorgu fonksiyonu) yazıldı. `.env.local` (gitignore'lu, gerçek
Supabase Project URL + service_role key ile) ve `.env.local.example` (şablon,
commit'li) oluşturuldu. Doğrulama için geçici bir `app/test-services/page.tsx`
sayfası yazıldı — `npm run dev` ile açılıp gerçek seed verisi (6 hizmet,
yayında/taslak karışık) ekranda görüldü, bağlantı çalışıyor. Bu test sayfası
geçici; gerçek Hizmetler bölüm bileşeni (`components/site/`) yazılınca
silinecek.

**RLS okuma/yazma politikaları yazıldı (2026-08-07):** İstisnasız 11 tabloda
anon sadece `is_published = true` okuyabiliyor (`site_settings` bağlı
`tenants` satırından türetiliyor), `tenants.contact_recipient_email` kolon
seviyesinde anon'dan gizlendi, yazma (insert/update/delete) sadece
`authenticated`'e açık. `contact_messages` istisna — anon'a hiç açık değil,
anonim iletişim formu ileride `app/api/contact/` route handler'ı (service
role) üzerinden çözülecek. Detay: `KARAR-GUNLUGU.md`. Migration dosyası
(`supabase/migrations/20260807130000_add_rls_policies.sql`) gerçek Supabase
projesine uygulandı (2026-08-07, SQL Editor'de "Success").

**RLS politikaları anon/authenticated ile uçtan uca test edildi (2026-08-07):**
`scripts/test-rls.mjs` yazıldı, `NEXT_PUBLIC_SUPABASE_ANON_KEY` `.env.local`'e
eklendi, Supabase Auth'ta bir test kullanıcısı oluşturuldu. 6/6 test "OK":
anon sadece `is_published=true` satırları görüyor, `contact_messages` anon'a
tamamen kapalı, anon insert RLS tarafından reddediliyor, authenticated hem
tam okuyor hem yazabiliyor. Detay ve karşılaşılan sorunlar (yanlış şifre,
script'te client paylaşım hatası): `KARAR-GUNLUGU.md`.

**Supabase CLI ile şema tipleri üretildi (2026-08-07):** `types/database.types.ts`
gerçek şemadan otomatik üretildi, `lib/supabase/server.ts`/`queries.ts` bu
tipi kullanacak şekilde güncellendi (elle yazılan `Service` tipi kaldırıldı).
`npm run types:generate` script'i eklendi. Süreçte birkaç CLI engeli aşıldı
(link komutu hatası, IPv6/DNS, Docker gereksinimi, PowerShell'in dosyayı
UTF-16 yazması) — hepsi `KARAR-GUNLUGU.md`'de kayıtlı, ileride tip yeniden
üretilirken tekrar yaşanmaması için.

**`docs/GUVENLIK.md` oluşturuldu, tüm docs dosya adları büyük harfe çevrildi
(2026-08-07):** `GUVENLIK.md` — tehdit modeli, RLS politikaları özeti,
anahtar yönetimi, test sonuçları (madde 4'teki 6/6 test) ve yayın öncesi
güvenlik kontrol listesini tek dosyada topluyor. Ayrıca `docs/` içindeki
küçük harfli dosya adları (`durum.md`, `Mimari.md`, `karar-gunlugu.md`,
`test-stratejisi.md`, `kurumsal-site-standartlari.md`, `rakip-analizi.md`)
büyük harfe çevrildi (`git mv` ile, geçmiş korunarak) ve tüm çapraz
referanslar (bu dosya dahil, `CLAUDE.md`, kod içindeki yorumlar) güncellendi.
`PRD.md`, `AI-KURALLARI.md`, `VERİ-MODELİ.md` zaten büyük harfliydi,
değişmedi.

**2026-08-07 oturumu commit'lenip push'landı:** Bugünkü tüm iş (RLS
politikaları, Supabase şema tipleri, `GUVENLIK.md`, docs isimlendirme) 3
ayrı commit'te (`90fcd9c`, `f5c6c3b`, `bd87ec6`) `main`'e push'landı,
`git status` temiz. `npm run build` hatasız geçti — bu doğrulama tamamlandı.

**Tasarım sistemi kuruldu (2026-08-08):** Dışarıdan gelen tasarım
yönergeleri (renk paleti + tipografi/boşluk/köşe/gölge ölçekleri) üzerine
`docs/TASARIM-SISTEMI.md` oluşturuldu ve `app/globals.css`'e kodlandı
(Tailwind v4 `@theme`/`@theme inline`, config dosyası yok). Kapsam: 1 marka
rengi (varsayılan, tenant'a göre değişebilir) + 7 adımlı nötr gri ölçeği +
3 semantik renk (başarı/uyarı/hata), hepsi açık/koyu tema karşılığıyla;
16px taban + 1.25 oranlı tipografi ölçeği (caption + gövde + h1-h6); 4px
ritimli boşluk ölçeği (Tailwind varsayılanıyla zaten örtüşüyor, ek kod
gerekmedi); köşe yarıçapı ve gölge seviyeleri (açık/koyu tema ayrı gölge
değerleriyle). Tüm metin/zemin çiftleri WCAG AA (gövde ≥4.5:1, büyük
başlık ≥3:1) için hesaplanıp doğrulandı — 36/36 çift geçti, detay ve
gerekçe `TASARIM-SISTEMI.md`'de. Tema, `prefers-color-scheme` yerine
`[data-theme="dark"]`'a bağlandı çünkü `tenants.theme_mode` panelden
seçilen açık bir ayar (VERİ-MODELİ.md), tarayıcı tercihi değil.

Token'lar henüz hiçbir gerçek bileşende kullanılmıyor — `components/site/`
hâlâ boş, `app/(site)/page.tsx` hâlâ `create-next-app` scaffold'ı. Bu iş,
sıradaki adım 3'ün (ilk bölüm bileşenleri) önkoşulu; `npm run build`
hatasız geçti, henüz commit'lenmedi.

## Sıradaki adım

1. Bugünkü tasarım sistemi işini (`TASARIM-SISTEMI.md` + `globals.css` +
   bu dosya + `CLAUDE.md`) commit'le.
2. Vitest ve Playwright'ı kur (bkz. `TEST-STRATEJISI.md`).
3. Panel auth'u (Supabase Auth, platform sahibi girişi) kodla — test için
   oluşturulan kullanıcı bunun için gerçek giriş olarak kullanılabilir veya
   silinip yeniden oluşturulabilir.
4. Hazır bölüm kütüphanesindeki ilk bileşenleri (Hero, İletişim gibi en sık
   görülenlerden başlayarak) `components/site/` altına, artık kurulu olan
   `TASARIM-SISTEMI.md` token'larını kullanarak kodla + birim testlerini
   yaz; en az bir örnek "demo" (bölüm kombinasyonu + örnek içerik) hazırla.
   Bu adımda `app/test-services/page.tsx` geçici sayfası silinecek.
5. İletişim formu için `app/api/contact/` route handler'ı yaz (service role
   ile `contact_messages`'a insert + e-posta gönderimi).
6. Site tasarımı ilerledikçe `KURUMSAL-SITE-STANDARTLARI.md`'deki kontrol listesini
   madde madde işaretle.

## Açık sorular

Şu an aktif açık soru yok. Kullanıcı ürün mantığı hakkında birkaç ek nokta daha
paylaşacağını belirtti (2026-08-06) — gelince buraya ve `KARAR-GUNLUGU.md`'ye
işlenecek.

**Çözüldü:** `docs/RAKIP-ANALIZI.md` eklendi — 8 gerçek inşaat/mimarlık sitesi
incelenerek çıkarılan bölüm karşılaştırma tablosu ve "olması gereken 6 bölüm"
listesi (İletişim, Hakkımızda, Hero, Projeler/Portföy, Blog/Haberler, Hizmetler).
Bu liste bölüm kütüphanesi için referans alındı — **tek istisna: Blog/Haberler
bilinçli olarak kapsam dışı bırakıldı** (2026-08-06, bkz. `KARAR-GUNLUGU.md`).
