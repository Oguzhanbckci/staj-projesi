# Şu An Neredeyiz

Bu klasör (`docs/`), projede alınan kararları ve açıklamalarını tutar — kod içermez.
Yeni bir oturuma başlarken önce bu dosyayı (güncel durum), sonra `PRD.md`'yi
(özellik bazlı yapılacak/yapılmayacak referansı), `Mimari.md`'yi (teknik
mimari: framework/dil/stil/backend/hosting/render), `test-stratejisi.md`'yi
(test yaklaşımı, kalite eşikleri, "bitti" tanımı) ve `VERİ-MODELİ.md`'yi
(Supabase tablo/kolon tasarımı + gerekçeler), gerekirse `karar-gunlugu.md`'yi
(tarihli, hiç silinmeyen karar geçmişi) oku.

**Son güncelleme:** 2026-08-07

## Proje bağlamı

**Tek geliştirici, toplam ~32 iş günlük süre. Bu proje kapsamında gerçek bir
müşteriye canlıya alınmıyor** — staj/geliştirme amaçlı bir ürün/demo inşa
ediliyor. Bu kısıtlar, kapsamı sınırlayan birçok kararın (hazır bölüm
kütüphanesi, sınırlı sürükle-bırak, çoklu dilin ertelenmesi, pragmatik/hedefli
test stratejisi, Vercel Hobby plan seçimi) arka planındaki ortak sebep — bkz.
`karar-gunlugu.md`, 2026-08-06 ("Proje bağlamı netleşti...", "`docs/Mimari.md`
oluşturuldu...").

## Güncel aşama

Proje yeni başladı. `staj-projesi` klasörü ve `docs/` sistemi kuruldu (`durum.md`,
`karar-gunlugu.md`). Henüz kod/scaffold yok; teknoloji ve mimari kararları aşağıda.

Ayrıca `docs/kurumsal-site-standartlari.md` dosyasında iyi bir kurumsal site için
kriter/kontrol listesi hazırlandı (performans, erişilebilirlik, SEO, KVKK/güvenlik,
güven unsurları vb.) — ileride tasarlanacak site bu listeye göre değerlendirilecek.

Proje GitHub'a bağlandı: `https://github.com/Oguzhanbckci/staj-projesi` (public),
ilk commit push'landı.

**Teknoloji kararı verildi:** Next.js 16 (App Router) + TypeScript + Tailwind CSS +
Supabase. Detaylar `karar-gunlugu.md`'de (2026-08-05, "Teknoloji seçildi";
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
  bkz. `rakip-analizi.md`; **blog/haberler kavramı kapsam dışı**) sürükle-bırakla
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

Tüm gerekçe ve kronoloji için `karar-gunlugu.md`'deki 2026-08-06 tarihli
kayıtlara bakılabilir (en önemlisi: "Panel mimarisi düzeltildi: tek panel, tek
kullanıcı, tam yönetilen hizmet" — bu, aynı gün ve 2026-08-05'te alınan "iki
panel" / "tenant kendi admin'ine girer" fikirlerini geçersiz kılar). Özellik
bazlı güncel kapsam için tek referans `docs/PRD.md`'dir.

**Yeni:** Test stratejisi netleşti ve `docs/test-stratejisi.md`'ye taşındı
(staj yönergesi gereği e2e/unit/integration, ama tek geliştirici + 32 iş günü
kısıtıyla pragmatik/hedefli bir yaklaşımla). Unit sürekli, e2e/integration
sadece kritik akışlarda. "Bitti" tanımı (Definition of Done) da bu dosyada.
Lighthouse eşiği netleşti: Performance/Accessibility/Best Practices/SEO
dördünde de ≥90.

**Yeni:** `docs/Mimari.md` oluşturuldu — teknik mimari tek dosyada toplandı.
İki yeni karar: **Hosting = Vercel, Hobby plan** (proje gerçek müşteriye
canlıya alınmadığı için ücretsiz plan yeterli), **Render stratejisi = statik
üretim + panelden tetiklenen on-demand ISR** (`revalidatePath`/`revalidateTag`
ile panel kaydında ilgili sayfa yeniden üretilir; `/panel` tamamen SSR).

**Kod tarafı başladı (2026-08-06):** Next.js scaffold (`create-next-app`,
TypeScript + Tailwind + App Router) kuruldu — **Next.js 16.3.0** ile (bkz.
`karar-gunlugu.md`, "Next.js 16'ya güncellendi"). Yanlışlıkla
`C:\Users\toffe\staj-projesi` içine kurulmuştu, doğru konuma
(`C:\Users\toffe\Projects\staj-projesi`) taşındı; `.git` ve `docs/` sağlam
kaldığı doğrulandı, `npm run dev` çalıştığı teyit edildi. Kök dizindeki
`CLAUDE.md`, `docs/durum.md`'ye (ve diğer proje beyni dosyalarına) otomatik
işaret edecek şekilde genişletildi.

**Klasör yapısı oluşturuldu (2026-08-06):** `app/(site)/`, `app/panel/`
(placeholder sayfalarla), `components/ui/`, `components/site/`,
`lib/supabase/`, `lib/utils.ts`, `types/index.ts` — hepsi `npm run build` ile
doğrulandı (`/`, `/panel`, `/_not-found` hatasız derleniyor). Her klasörün
amacı `docs/Mimari.md` madde 8'de belgelendi. `app/api/` henüz yok, ilk
gerçek ihtiyaçta eklenecek.

**Veritabanı şeması netleşti + SQL yazıldı (2026-08-06):** İçerik envanteri
tablolara döküldü, platform sahibi `tenants` tablosunda özel bir satır
(`is_platform_owner`) olarak birleştirildi, sonra dışarıdan gelen bir
yönergeyle karşılaştırılıp revize edildi (bkz. `karar-gunlugu.md`, "Şema,
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
onayıyla yeni bölüm olarak eklendi (bkz. `karar-gunlugu.md`). 3 yeni tablo
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

## Sıradaki adım

1. Vitest ve Playwright'ı kur (bkz. `test-stratejisi.md`).
2. Panel auth'u (Supabase Auth, platform sahibi girişi) kodlanınca RLS
   policy'lerini ayrı bir migration'da ekle.
3. Hazır bölüm kütüphanesindeki ilk bileşenleri (Hero, İletişim gibi en sık
   görülenlerden başlayarak) `components/site/` altına kodla + birim
   testlerini yaz; en az bir örnek "demo" (bölüm kombinasyonu + örnek içerik)
   hazırla. Bu adımda `app/test-services/page.tsx` geçici sayfası silinecek.
4. Site tasarımı ilerledikçe `kurumsal-site-standartlari.md`'deki kontrol listesini
   madde madde işaretle.

## Açık sorular

Şu an aktif açık soru yok. Kullanıcı ürün mantığı hakkında birkaç ek nokta daha
paylaşacağını belirtti (2026-08-06) — gelince buraya ve `karar-gunlugu.md`'ye
işlenecek.

**Çözüldü:** `docs/rakip-analizi.md` eklendi — 8 gerçek inşaat/mimarlık sitesi
incelenerek çıkarılan bölüm karşılaştırma tablosu ve "olması gereken 6 bölüm"
listesi (İletişim, Hakkımızda, Hero, Projeler/Portföy, Blog/Haberler, Hizmetler).
Bu liste bölüm kütüphanesi için referans alındı — **tek istisna: Blog/Haberler
bilinçli olarak kapsam dışı bırakıldı** (2026-08-06, bkz. `karar-gunlugu.md`).
