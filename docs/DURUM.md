# Şu An Neredeyiz

Bu klasör (`docs/`), projede alınan kararları ve açıklamalarını tutar — kod içermez.
Yeni bir oturuma başlarken önce bu dosyayı (güncel durum), sonra `PRD.md`'yi
(özellik bazlı yapılacak/yapılmayacak referansı), `MIMARI.md`'yi (teknik
mimari: framework/dil/stil/backend/hosting/render), `TEST-STRATEJISI.md`'yi
(test yaklaşımı, kalite eşikleri, "bitti" tanımı) ve `VERİ-MODELİ.md`'yi
(Supabase tablo/kolon tasarımı + gerekçeler), `GUVENLIK.md`'yi (tehdit
modeli, RLS politikaları, anahtar yönetimi, güvenlik kontrol listesi) ve
`TASARIM-SISTEMI.md`'yi (renk/tipografi/boşluk/köşe/gölge token'ları,
kontrast doğrulaması, bileşen envanteri/API kuralları) ve `TEMA-MIMARISI.md`'yi
(tema değerlerinin DB'den `<html>`'e akışı, tema ön ayarları, FOUC
önlemi), gerekirse `KARAR-GUNLUGU.md`'yi (tarihli, hiç silinmeyen karar
geçmişi) oku.

**Son güncelleme:** 2026-08-17 — Erişilebilirlik denetimi: atlama bağlantısı
eklendi, gereksiz canlı bölge (role="status") kaldırıldı

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
sıradaki adım 3'ün (ilk bölüm bileşenleri) önkoşulu. Bu oturumda
commit'lendi.

**Tema mimarisi kuruldu (2026-08-08):** `docs/TEMA-MIMARISI.md` oluşturuldu
ve DB'den `<html>`'e tema enjeksiyonu koda döküldü. Yeni: `lib/theme/
presets.ts` (iki hazır ön ayar — "Kurumsal Mavi" varsayılan, "Modern Koyu"
— her ikisi de marka rengi/köşe yarıçapı/font taşıyor, ikisi de WCAG AA
doğrulandı), `lib/theme/resolve.ts` (preset + tenant'ın `site_settings.
primary_color` override'ını gerçek CSS değişkenlerine çevirir, serbest
renk için otomatik okunabilir metin rengi seçer), `lib/supabase/queries.ts`
→ `getSiteThemeSettings()` (şu an platform sahibinin tenant kaydını okuyor
— gerçek Host-bazlı tenant çözümlemesi yok, bilinçli geçici; Supabase
erişilemezse/`theme_preset` kolonu yoksa güvenli varsayılana sessizce
düşer). `app/layout.tsx` async Server Component'e çevrildi, `<html
data-theme style={...}>` olarak inline enjeksiyon yapıyor — FOUC yok,
`npm run build` sonrası üretilen HTML'de doğrulandı.

**Migration uygulandı, tipler yenilendi, uçtan uca doğrulandı (2026-08-08,
aynı gün):** Kullanıcı `20260808120000_add_theme_preset_to_site_settings.sql`'i
SQL Editor'de çalıştırdı ("Success"), sonra `npm run types:generate` ile
`types/database.types.ts`'e `theme_preset` alanı eklendi.
`getSiteThemeSettings()` bu yüzden tipsiz client'tan `createServiceRoleClient()`'e
taşındı, artık kullanılmayan `createUntypedServiceRoleClient()`
(`lib/supabase/server.ts`) kaldırıldı. Ayrıca `supabase/seed.sql`'e
platform sahibinin kendi tenant satırı eklendi (`is_platform_owner=true`,
bilinçli olarak `theme_mode='dark'` + `theme_preset='modern-koyu'` — varsayılan
değerlerle aynı olsaydı gerçek veri mi fallback mi geldiği ayırt
edilemezdi); toplam tenant sayısı 3 oldu (bkz. `VERİ-MODELİ.md`).

İlk `npm run build`'da hâlâ eski (fallback) sonuç geldi — sorun kodda değil,
**Next.js'in `.next` build cache'inin** DB'deki dış değişikliği
algılamamasıydı; `.next` silinip yeniden derlenince `<html
data-theme="dark" style="--color-brand:#24a8a4;...">` doğru şekilde geldi,
gerçek veriden geldiği doğrulandı (bir tanı script'iyle DB'nin doğru veriyi
döndürdüğü de ayrıca teyit edildi, sonra script silindi). Bu bulgu ve
prod'daki karşılığı (mimaride zaten var olan on-demand ISR,
`revalidatePath`/`revalidateTag`) `TEMA-MIMARISI.md` madde 6'ya eklendi. Bu
iş commit'lendi (`edac6ac`).

**İlk `components/ui/` bileşenleri kuruldu (2026-08-08):** `Button`
(primary/secondary/ghost × sm/md/lg, `disabled`/`isLoading`, gerçek
`<button>`), `Container`, `SectionHeader` (`headingLevel` dışarıdan
verilir), `TextField`/`TextareaField`/`SelectField` (label/hata/yardım
metni, `useId()` ile otomatik `htmlFor`/`id` bağı). Hepsi Server Component,
≤60 satır, token class'larıyla (hardcoded renk yok). Geçici vitrin:
`app/test-components/page.tsx`. Klavye ile doğrulandı (Tab sırası, odak
halkası, devre dışı buton atlanıyor). Kod ve kurallar
`docs/TASARIM-SISTEMI.md` madde 8-9'a işlendi. Bu iş commit'lendi.

**Hero bölümü + varyant deseni + Navbar kuruldu (2026-08-08, aynı gün):**
`components/site/hero/` — `types.ts` (veri arayüzü + `HeroVariant` union),
`HeroVariantA`/`B` (aynı veri, farklı düzen), `registry.ts`
(`Record<HeroVariant, Component>` — varyant seçimi tek burada çözülüyor),
`Hero.tsx` (çözümleyici). Yeni bölüm eklemek: 4 adım (types → varyant
bileşeni → registry satırı → resolver/sorgu), bkz. sohbet geçmişi.
`components/site/Navbar.tsx` + `MobileMenu.tsx` (kaydırınca zemin
değişimi, mobilde hamburger menü — odak tuzağı, Escape ile kapanma, body
scroll kilidi, kapanınca odak tetikleyiciye döner). Yeni:
`components/ui/LinkButton.tsx` (CTA'lar gezinme olduğu için gerçek `<a>`,
`Button`'a asChild eklenmedi), `lib/supabase/storage.ts` (`*_path` →
gerçek Storage URL'i), `next.config.ts`'e `images.remotePatterns`
(Supabase Storage host'u, `next/image` için zorunlu). Geçici doğrulama:
`app/test-sections/page.tsx` (Navbar + Hero, varyant A/B arası canlı geçiş
butonu). Yol boyunca 2 gerçek hata bulundu ve düzeltildi: `Container`'da
boş interface (ESLint), demo sayfasında iki varyantı üst üste
gösterirken oluşan `id="hero"` çakışması (geçersiz HTML — toggle'a
çevrilerek çözüldü). Bu iş commit'lendi (`b28dafe`).

Yeni bir migration yazıldı: `supabase/migrations/
20260808140000_add_hero_variant_and_secondary_cta.sql`
(`hero_sections.variant` + `secondary_cta_text`/`secondary_cta_link`) —
**henüz gerçek Supabase projesine uygulanmadı.**

**Hizmetler + Hakkımızda bölümleri kuruldu (2026-08-08, aynı gün):**
`components/site/services/` — Hero'daki 4 dosyalı desenle aynı
(`types.ts`, `ServiceCardIcon`/`ServiceCardImage` varyantları — aynı
veriyle, sadece düzen farklı —, `registry.ts`, `ServicesSection.tsx`).
`ServicesSection` kendi verisini kendi çeker (Server Component), sadece
`is_published=true` + `order_index` sırasıyla (DB sorgusunda, JS'te
değil); **kayıt yoksa `null` döner, bölüm hiç render edilmez** — bilinçli
tasarım kararı (boş alan bırakmak yerine). Veri çekme hatasında sayfa
çökmez, `console.error` ile sunucuya loglanır, boş dizi döner — bu,
gerçek migration henüz uygulanmadığı için build sırasında fiilen
tetiklendi ve doğrulandı ("column services.image_path does not exist"
hatası loglandı, sayfa yine de hatasız üretildi). Uzun başlık/açıklamada
kart bozulmasın diye `line-clamp-2`/`line-clamp-3` uygulandı, kasıtlı
aşırı-uzun bir örnek veriyle (`app/test-sections/page.tsx`, "Taşma
testi" bölümü) doğrulandı. Işıldayan ikonlar için **`lucide-react`
kuruldu** (kullanıcı onayıyla — demo verideki ikon isimleri zaten bu
kütüphaneyle birebir örtüşüyordu); `components/site/services/icons.tsx`
ikon adını bileşene eşliyor, bilinmeyen isim için `Wrench` yedek.

`components/site/about/AboutSection.tsx` — firma hikayesi, kuruluş yılı,
kısa değerler listesi, görsel; `about_sections`'tan geliyor, aynı
"kayıt yoksa render etme" ilkesiyle.

**Yol boyunca bulunan ve düzeltilen 3 gerçek sorun:** (1) `test-services`
silinince Next.js'in `.next` tip önbelleği bozuk referans verdi —
`.next` temizlenip çözüldü (aynı türden önceki `.next` cache bulgusuyla
tutarlı). (2) `ServiceCardIcon`'da `const Icon = ...; <Icon/>` deseni
`react-hooks/static-components` ESLint kuralını tetikledi (render
sırasında bileşen oluşturma riski) — ikon seçimi/render'ı küçük harfli
bir yardımcı fonksiyona (`renderServiceIcon`) taşınarak düzeltildi.
(3) `ComponentType` yanlışlıkla `lucide-react`'ten import edilmişti,
`react`'e düzeltildi.

**Şema kararı (kullanıcıya sorulmadan, gerekçeyle uygulandı):**
`services.image_path` ve `about_sections.core_values` (`text[]`) yoktu —
yeni migration: `supabase/migrations/
20260808150000_add_services_image_and_about_values.sql`. **Henüz gerçek
Supabase projesine uygulanmadı.**

Ayrıca yeni: `components/ui/Card.tsx` (genel amaçlı kart zemini —
Container'la aynı minimalist ilke, kendi iç düzen dayatmıyor).
`app/test-services/page.tsx` silindi (yerini gerçek `ServicesSection`
aldı). Bu iş commit'lendi (`010f607`) ve push'landı; migration'lar
uygulandı, tipler yenilendi, `getHeroSection()`/`getServices()`/
`getAboutSection()` tipli client'a taşındı (`createUntypedServiceRoleClient`
tamamen kaldırıldı).

**Projeler bölümü + kategori filtresi + detay penceresi kuruldu
(2026-08-08, aynı gün):** `components/site/projects/` — `types.ts`
(`ProjectItem`, `GalleryVariant` union: ızgara/mozaik), `ProjectCard.tsx`
(her iki galeri düzeninde de kullanılan TEK kart — `fill` prop'uyla sabit
oran/hücre-doldurma arasında geçiş), `ProjectsGridLayout`/
`ProjectsMosaicLayout` (mozaik gerçek CSS masonry değil, `auto-rows` +
her 5 projede bir 2x2 span veren, tüm tarayıcılarda çalışan bir grid
tekniği), `registry.ts`, `ProjectsSection.tsx` (Server Component — veriyi
çeker, kategori listesini `Array.from(new Set(...))` ile veriden türetir,
sabit yazılmaz), `ProjectsExplorer.tsx` (**"use client" — sunucu/istemci
sınırının çizildiği dosya**, sadece filtre + hangi projenin detay
penceresinde açık olduğu state'ini tutuyor, kendi veri çekmiyor),
`ProjectDetailModal.tsx` (büyük görsel, açıklama, künye — konum/yıl/
kategori — ve varsa `live_url` linki).

Filtre butonları `aria-pressed` ile seçili durumu ekran okuyucuya
bildiriyor, `role="group"` ile gruplanıyor; filtre değişince sayfa hiç
yeniden yüklenmiyor (React state). Kayıt yoksa/filtre sonucu boşsa
anlamlı mesaj var. `next/image`'da ilk 3 kart `priority`, gerisi
varsayılan (lazy).

**Yeni paylaşılan hook:** `lib/hooks/useDialogBehavior.ts` — odak tuzağı/
Escape/scroll kilidi mantığı `MobileMenu`'den çıkarılıp
`ProjectDetailModal`'la paylaşılan tek bir hook'a taşındı (bu ikisi
arasındaki tekrar, form alanlarındaki basit markup'ın aksine, karmaşık/
hataya açık olduğu için bilinçli olarak soyutlandı — `MobileMenu` de
retroaktif olarak buna geçirildi).

**Şema kararı (kullanıcıya sorulmadan, gerekçeyle uygulandı):**
`projects.category` ve `projects.description` yoktu (BAĞLAM "category,
cover_path, city" diyordu, gerçek şema `location`/`image_path` kullanıyor
ve kategori/açıklama hiç yoktu) — yeni migration: `supabase/migrations/
20260808160000_add_projects_category_and_description.sql`, ayrıca demo
verideki 8 Akme projesine gerçekçi kategori/açıklama backfill edildi
(filtreleme test edilebilsin diye). **Henüz gerçek Supabase projesine
uygulanmadı.**

**Lighthouse ölçümü yapıldı:** `npm run build` + `npm run start` ile
prod sunucu ayağa kaldırılıp `npx lighthouse` (yerel Chrome ile, headless)
`/test-projects` sayfasına karşı çalıştırıldı — Performance skoru **96**,
LCP 2.7s, CLS 0, toplam sayfa ağırlığı 253 KiB. **Önemli not:** görsel
isteği sayısı **0** çıktı çünkü Storage'da henüz hiç gerçek görsel yok
(`coverPath`/`image_path` hep `null`) — yani bu ölçüm şu an "görsellerin
etkisi yok" demiyor, "henüz hiç görsel yüklenmedi" diyor. Gerçek fotoğraf
eklenince yeniden ölçülmeli.

`npm run build`'da tutarlı biçimde sadece `getProjects()`'te (diğerlerinde
değil) bir "JWT issued at future" hatası gözlendi — izole bir script'le
doğrulandı, bu ortama özgü/geçici bir zamanlama tuhaflığı, kod hatası
değil (script'te aynı sorgu net/beklenen "column does not exist" hatasını
veriyor). Her iki durumda da mevcut hata yönetimi (catch/log/boş dön)
sayfayı çökertmeden karşılıyor.

**Migration uygulandı, tipler yenilendi, tipli client'a taşındı
(2026-08-08, aynı gün):** Kullanıcı `20260808160000_...` migration'ını
SQL Editor'de çalıştırdı, `npm run types:generate` çalıştırdı (bu sefer
bir token sorunu çıktı — `Unauthorized` hatası, sebebi eski/iptal
edilmiş token'ın veya token'ın yeni pencerede yeniden ayarlanmamasıydı;
yeni token oluşturulup çözüldü). `getProjects()` tipli
`createServiceRoleClient()`'e taşındı, `createUntypedServiceRoleClient()`
tekrar (üçüncü kez) tamamen kaldırıldı.

`npm run build`/`lint` temiz. Bu iş commit'lendi (`9b65905`) ve push'landı.

**Referanslar + İstatistikler + SSS bölümleri kuruldu (2026-08-08, aynı
gün):** `components/site/testimonials/` — 2 varyant: `TestimonialsGrid`
(mobilde yatay kaydırmalı/`snap-x`, masaüstünde ızgara — tek CSS düzeni,
JS yok) ve `TestimonialsFeatured` (tek büyük alıntı, ok butonlarıyla
referanslar arasında geçiş — veri kaybolmasın diye sadece ilkini
göstermek yerine). `components/site/stats/StatsSection.tsx` — sayılar
`Intl.NumberFormat("tr-TR")` ile Türkçe biçimde (binlik ayraç ".");
tamamen Server Component, etkileşim yok. `components/site/faqs/` —
`FaqAccordionItem` (gerçek `<button>`, `aria-expanded`/`aria-controls`/
`role="region"`, her öğe kendi state'ini tutar — birden fazla panel aynı
anda açık kalabilir; genişleme animasyonu `grid-template-rows` fr-birimi
tekniğiyle, JS yükseklik ölçümü gerekmez; `motion-reduce:` varyantı
`prefers-reduced-motion`'a saygı gösterir), `FaqList` (2. varyant —
"iki kolon" — native CSS `columns-2` ile, ayrı bir registry açılmadı
çünkü fark salt bir CSS class'ı, bkz. `TASARIM-SISTEMI.md` madde 9.8).
Hazır kütüphane kullanılmadı, sade React.

**Şema kararı (kullanıcıya soruldu, bu sefer gerçek bir mimari tercih
olduğu için — theme_preset/hero.variant gibi mekanik eklemelerden
farklı):** İstatistikler için hiç tablo yoktu. İki seçenek sunuldu:
mevcut tablolardan hesaplama (gerçek kayıt sayısına kilitli) vs. yeni bir
`stats` tablosu (panelden serbestçe girilen etiket+değer). **Kullanıcı
yeni tablo seçti** — gerçek kurumsal sitelerde bu rakamların genelde
pazarlama amaçlı yuvarlak sayılar olduğu, DB'deki gerçek kayıt sayısıyla
birebir örtüşmesi gerekmediği gerekçesiyle. Yeni migration:
`supabase/migrations/20260808170000_add_testimonial_logo_and_stats_table.sql`
— `testimonials.logo_path` (opsiyonel) + yeni `stats` tablosu (`label`,
`value` integer, `suffix` — RLS politikaları diğer liste tablolarıyla
birebir aynı desende). Platform tenant'a 3 örnek istatistik seed'lendi.
**Henüz gerçek Supabase projesine uygulanmadı.**

**Performans/erişilebilirlik ölçümü tamamlandı (gerçekten çalıştırıldı):**
`npm run build` + `npm run start` + yerel Chrome ile `npx @axe-core/cli`
`/test-social-proof` sayfasına karşı çalıştırıldı. **Gerçek bir kontrast
hatası bulundu ve düzeltildi:** kendi geçici "geçici doğrulama sayfası"
banner'larımda (`test-sections`/`test-projects`/`test-social-proof`)
kullandığım `bg-warning text-white` deseni, site şu an koyu temada
render olduğu için (`--color-warning` koyu değeri `#cb850b`'ye çözülüyor)
sadece **3.04:1** kontrast veriyordu (4.5:1 gerekli) — daha önce sadece
"warning metin olarak" senaryosu doğrulanmıştı, "warning dolgu + beyaz
metin" hiç test edilmemişti. Üç dosyada da `bg-warning`/`text-white` →
`border-b-2 border-warning bg-surface-raised text-text` yapılarak
düzeltildi (tema-bağımsız güvenli desen), tarama tekrarlanıp
doğrulandı (13 → 12 bulgu, kontrast ihlali kayboldu).

Kalan 12 bulgu (`landmark-one-main`, `page-has-heading-one`,
`landmark-unique` ×4, `region` ×6) **gerçek bileşen hatası değil, demo
sayfasının kendi yapısına özgü**: kök `app/layout.tsx`'te hiç `<main>`
yok (bilerek şimdi yamanmadı — Navbar şu an her sayfanın kendi içinde
render ediliyor, `<main>`'i `{children}`'a sarmak Navbar'ı yanlışlıkla
`<main>` içine alırdı; gerçek sayfa kompozisyonu/global layout
kurulduğunda doğru yapılmalı), demo sayfasında Hero olmadığı için `<h1>`
yok, ve aynı örnek SSS verisi karşılaştırma amacıyla sayfada İKİ KEZ
gösterildiği için (tek sütun + iki sütun varyant demosu) aynı soru
metnine sahip `role="region"` panelleri "eşsiz değil" olarak işaretlendi
— gerçek kullanımda bir SSS verisi sayfada bir kez görünür, bu sorun
oluşmaz.

**Lighthouse (önceki oturumdan, karşılaştırma için hatırlatma):**
Performance 96, görsel isteği 0 (henüz gerçek görsel yok) — bkz. önceki
kayıt.

**Migration uygulandı, tipler yenilendi, tipli client'a taşındı, gerçek
veriyle doğrulandı (2026-08-08, aynı gün, günün son işlemi):** Kullanıcı
`20260808170000_...` migration'ını SQL Editor'de çalıştırdı, `npm run
types:generate` hatasız tamamlandı. `getTestimonials()`/`getStats()`
tipli `createServiceRoleClient()`'e taşındı, `createUntypedServiceRoleClient()`
(ve onu kullanan import'lar) tamamen kaldırıldı — şu an hiçbir sorgu
fonksiyonu tipsiz client kullanmıyor. `npm run build` sonrası üretilen
`/test-social-proof` HTML'inde platform tenant'a seed'lenen 3 istatistik
gerçek veriden geldiği doğrulandı: "50+", "12+", **"1.200+"** (1200
değerinin Türkçe binlik ayraçla — nokta — doğru biçimlendiği görüldü).
`npm run build`/`lint` temiz.

**Bölüm sıralama/görünürlük sistemi + Ekip/Eylem Çağrısı/Footer + gerçek ana
sayfa kompozisyonu (2026-08-10):** Dışarıdan gelen bir yönerge üzerine:

- Yeni **`page_sections`** tablosu (sıra/görünürlük/varyant, tek kaynak —
  panel Faz 5'te buradan yazacak) + `lib/sections/config.ts` (tip güvenli
  `SectionKey` union'ı) + `lib/sections/registry.tsx` (`renderSection()` —
  bilinmeyen anahtar gelirse atlanır, sayfa çökmez).
- Yeni bölümler: **Ekip** (`components/site/team/`, 4 üye — 3 bilgisayar
  mühendisi + 1 elektrik mühendisi), **Eylem Çağrısı** (`components/site/
  cta/`, içerik `site_settings`'ten), **İletişim** (`components/site/
  contact/`, sadece statik bilgi — form yok, `app/api/contact/` beklemede),
  **Footer** (`components/site/Footer.tsx` — iletişim + bölüm linkleri +
  sosyal medya + telif, tel/mailto tıklanabilir).
- **`app/(site)/layout.tsx` eklendi** — Navbar+`<main>`+Footer artık burada
  (kök layout'ta değil), 2026-08-08'de bilerek ertelenen axe bulgusu
  (`landmark-one-main`) çözüldü. `generateMetadata()` ile `<title>`
  `site_settings.seo_title`'dan geliyor, create-next-app'in yer tutucu
  başlığı temizlendi. `app/(site)/page.tsx` artık gerçek `PageSections`
  bileşenini render ediyor (scaffold kaldırıldı).
- Eski geçici test sayfaları silindi: `app/test-sections/`,
  `app/test-social-proof/`, `app/test-projects/`.
- **Önemli mimari değişiklik:** Tüm `getXSection()` sorguları artık
  platform sahibinin satırı yerine **Akme İnşaat**'ı hedefliyor
  (`getActiveTenantId()`, domain'e göre sabit) — gerekçe: platform satırında
  gerçek demo içeriği hiç yok, Referanslar/SSS/Ekip/İstatistikler zaten
  PRD'ye göre sadece tenant sitelerinde bulunuyor. Detay: `KARAR-GUNLUGU.md`,
  2026-08-10.
- **Yapılmadı/soruldu:** Ekip fotoğrafları için gerçek/AI-üretilmiş insan
  görseli kullanılmadı (diğer tüm görseller gibi Storage yer tutucu yolu) —
  kullanıcıya soruldu.

**Doğrulama:** `npm run build`/`lint` temiz. Kullanıcı migration'ı
(`20260810120000_...`) Supabase SQL Editor'de çalıştırdı,
`npm run types:generate` yapıldı, `getPageSections()` tipli client'a
taşındı, geçici `createUntypedServiceRoleClient()` kaldırıldı — gerçek ana
sayfa (tüm 10 bölüm, Akme İnşaat verisiyle) gözle doğrulandı. Ayrıca aynı
oturumda gerçek sayfa incelenirken 2 gerçek hata daha bulunup düzeltildi:
Akme'nin `site_settings.primary_color`'ı (tasarım sisteminden ÖNCEKİ bir
yer tutucu, neredeyse siyah `#0f172a`) tasarlanan marka mavisini
eziyordu — `null`'a çekildi (migration:
`20260810140000_reset_akme_primary_color.sql`); `app/globals.css`'teki
`body` seçicisi hâlâ create-next-app'in `font-family: Arial...` varsayılanını
kullanıyordu, tasarlanan Geist Sans/Manrope hiç devrede değildi — `var(--font-sans)`
kullanacak şekilde düzeltildi. İstatistikler bölümü için de Akme'ye örnek
veri eklendi (`20260810130000_add_stats_for_akme.sql`) — eski örnek veri
sadece platform tenant'ındaydı.

**Panel kimlik doğrulaması kuruldu (2026-08-10, aynı gün, dışarıdan gelen
ikinci bir yönerge üzerine):** Supabase Auth, e-posta/şifre, kayıt kapalı,
tek admin hesabı (Dashboard'dan elle oluşturulan/kullanılan
`oguzhanbckc@gmail.com`). Üç ayrı istemci —
`lib/supabase/client.ts` (tarayıcı), `lib/supabase/server.ts`'e eklenen
`createServerSupabaseClient()` (sunucu), `lib/supabase/proxy.ts` +
kök **`proxy.ts`** (Next.js 16'da `middleware.ts`'in yeni adı — bkz.
`KARAR-GUNLUGU.md`). `app/panel/giris/page.tsx` (herkese açık giriş
sayfası, tasarım sistemi bileşenleriyle) + `app/panel/(protected)/`
route group'u (`layout.tsx` — bağımsız ikinci bir `getUser()` kontrolü +
e-posta/çıkış göstergesi, `page.tsx` — eski `app/panel/page.tsx`
placeholder'ının yeni yeri). `docs/GUVENLIK.md`'ye Kimlik Doğrulama Akışı/
Oturum Yönetimi/Admin Hesabı Yönetimi bölümleri eklendi. 3 doğrulama testi
(girişsiz erişim engeli, yanlış şifre, tam giriş+çıkış akışı) elle
çalıştırılıp geçti. `npm run build`/`lint` temiz.

**İletişim formu + doğrulama şeması + duyarlı tasarım denetimi
(2026-08-11):** `lib/validation/contact.ts` — zod ile tek doğrulama
şeması (ad soyad/e-posta/telefon [opsiyonel]/konu/mesaj, PRD'nin ötesine
genişledi — bkz. `KARAR-GUNLUGU.md`), React'ten bağımsız, hem
`ContactForm.tsx` (istemci) hem `actions.ts` (Server Action, gerçek
sunucu doğrulaması) aynı şemayı kullanıyor. Form durumları
(`useActionState`): gönderiliyor (buton devre dışı + metin değişir),
başarılı (form temizlenir + teşekkür mesajı), başarısız (alan bazlı hata
+ ekranın üstünde bir hata ÖZETİ, ikisi de `role="alert"`/
`aria-describedby` ile duyurulur, hata rengi her zaman metinle birlikte).
`ContactSection` iki sütuna bölündü: iletişim bilgisi (adres+harita linki,
telefon, e-posta, çalışma saatleri — yeni `working_hours` kolonu) +
form. **Harita gömülmedi** (performans/KVKK gerekçesiyle, bkz.
`KARAR-GUNLUGU.md`) — sadece Google Maps'e giden bir link var; ileride
görsel bir "tat" isteniyorsa JS'siz bir statik harita görseli (Google/
Mapbox Static Maps API, tek `<img>`) değerlendirilebilir.

Ayrıca site geneli 3 ekran boyutunda (mobil/tablet/masaüstü) kod
seviyesinde bir duyarlı tasarım denetimi yapıldı (gerçek tarayıcı testi
değil — bu ortamda tarayıcı aracı `localhost`'a erişemiyor). 2 sorun
bulunup düzeltildi (`Navbar`'ın masaüstü menüsü `sm:`→`lg:` breakpoint'ine
taşındı — 7 bağlantıya kadar çıkabildiği için tablet genişliğinde taşma
riski vardı; proje detay penceresindeki 3 sütunlu ızgara dar telefonlarda
tek sütuna düşecek şekilde düzeltildi). Detay: `TEST-STRATEJISI.md` madde
8 (yeni "Ziyaretçi Sitesi Manuel Test Kontrol Listesi").

**Doğrulama:** `zod` kuruldu, migration (`20260811120000_...`) uygulandı,
duyarlı tasarım bulguları kullanıcı tarafından gerçek tarayıcıda teyit
edildi ("çalışıyor, sorun yok").

**Rota koruma katmanları + panel kabuğu + özet ekranı (2026-08-12):**
`proxy.ts`'e "next" parametresi (girişten sonra asıl istenen sayfaya
dönüş) + `lib/utils.ts`'teki `getSafeRedirectPath()` ile açık yönlendirme
koruması eklendi. `components/panel/PanelShell.tsx` — kenar menüsü
(masaüstü sabit, mobilde açılır) + üst başlık; ziyaretçi sitesinden
Navbar/Footer olmadan, sadece yapısal olarak ayrı ama aynı tasarım
token'larıyla (bkz. `KARAR-GUNLUGU.md`). `app/panel/(protected)/page.tsx`
artık gerçek bir özet ekranı (hizmet/proje/okunmamış mesaj sayıları),
`mesajlar/page.tsx` gerçek mesaj listesi; `icerikler/medya/tema/ayarlar`
Faz 5'e bırakılan placeholder'lar. Yeni `lib/supabase/panelQueries.ts` —
panel sorguları için ayrı dosya, `createServiceRoleClient` değil
`createServerSupabaseClient` kullanıyor (en az yetki ilkesi). Migration:
`20260812120000_add_contact_messages_is_read.sql`.

**Gerçek yetkisiz erişim testi (curl ile, kod incelemesi değil):** Çalışan
sunucuya çerezsiz istekler atıldı — 4/4 test geçti (girişsiz `/panel` ve
`/panel/mesajlar` sıfır veri sızdırmadan `/panel/giris`'e yönlendiriyor,
giriş sayfası kendi kendine döngü yapmıyor, `next` parametresi doğru
taşınıyor). Detay: `GUVENLIK.md` madde 8-9.

`npm run build`/`lint` temiz, `is_read` migration'ı kullanıcı tarafından
uygulandı.

**Ekip ve İletişim ayrı sayfalara taşındı (2026-08-13):** Kullanıcı tek
sayfalı ana sayfanın karmaşık hissettirdiğini belirtti. Akme'nin
`page_sections`'ından `team`/`contact` satırları silindi (migration:
`20260813120000_split_team_contact_into_pages.sql`), yeni
`app/(site)/ekip/page.tsx` ve `app/(site)/iletisim/page.tsx` eklendi
(bileşenlerin kendisi değişmedi, sadece konumları). Eylem Çağrısı
butonu artık `/iletisim`'e gidiyor. Navbar/Footer'ın ortak
`buildSectionNavLinks()`'i artık karışık bir liste üretiyor: ana sayfada
kalan bölümler için `/#çapa` (başka sayfadan tıklanınca da çalışsın diye
sadece `#çapa` değil), Ekip/İletişim için gerçek `/ekip`/`/iletisim`
linkleri. `Navbar`/`MobileMenu`'deki iç linkler `next/link`'in `Link`'ine
çevrildi (Next.js'in `no-html-link-for-pages` kuralı gerçek bir sayfaya
giden düz `<a>`'yı yakaladı — artık kısmen çok sayfalı bir site).
Gerçek sunucuda `curl` ile doğrulandı (bkz. `KARAR-GUNLUGU.md`).

**Hizmet/Proje ekleme: sunucu eylemi, doğrulama, önbellek tazeleme
(2026-08-14):** `app/panel/(protected)/icerikler/` artık gerçek —
Hizmetler ve Projeler için liste tablosu (başlık/durum/sıra, "Düzenle"
bilinçli olarak devre dışı) + ekleme formu + sunucu eylemi. Şema
(`lib/validation/service.ts`/`project.ts`, zod) hem istemcide hem
sunucuda aynı; eylemler oturumu kendi içinde kontrol ediyor
(`requireAdminUser()`), DB hatasını ham göstermeden loglayıp Türkçe bir
mesaja çeviriyor, başarıda `revalidatePath("/")` çağırıyor. Paylaşılan
parçalar (`SubmitButton`, `FormErrorSummary`, `AdminListTable`,
`StatusBadge`, `ActionResult<T>`) İletişim formuyla da (retroaktif
refactor) ortak. Şema değişikliği yok, migration gerekmedi. Uçtan uca
gerçek bir `curl` testiyle doğrulandı (revalidate öncesi/sonrası fark
gösterildi) — detay `MIMARI.md` madde 9-10, `KARAR-GUNLUGU.md`.

**Hizmetler/Projeler'e düzenleme ve silme eklendi (2026-08-14, aynı
gün):** `getServiceById`/`getProjectById` + `update*Action`/
`delete*Action` (aynı auth/doğrulama/hata kuralları) +
`components/panel/DeleteButton.tsx` (onaylı silme). "Düzenle" artık
gerçek bir sayfa (`[id]/page.tsx`), aynı `<X>Form.tsx` bileşeni hem
ekleme hem düzenleme modunda çalışıyor. Script + `curl` ile doğrulandı;
yeni `[id]` rotalarının da mevcut proxy korumasından otomatik geçtiği
ayrıca teyit edildi. Detay: `KARAR-GUNLUGU.md`.

**Silme onayı güçlendirildi, yayınla/sırala eklendi, Referanslar/SSS/Ekip
için panel CRUD tamamlandı (2026-08-14, aynı gün, üçüncü oturum):**
Dışarıdan gelen bir yönerge üzerine, Hizmetler/Projeler'deki içerik
yönetimi deseni hem güçlendirildi hem 3 yeni içerik türüne genişletildi:

- **Silme onayı** artık native `window.confirm()` değil, yeni
  `components/panel/ConfirmDeleteDialog.tsx` — kaydın gerçek adını
  gösteren, `useDialogBehavior` (MobileMenu/ProjectDetailModal ile
  paylaşılan) ile odak tuzağı/Escape'i olan, kazara silmeyi azaltan 2
  önlemli (adı gösteren metin + varsayılan odağın "Vazgeç"te olması) özel
  bir dialog. `Button`'a yeni bir `danger` varyantı eklendi (kenarlık+metin,
  dolgu değil — "ayrışsın ama korkutmasın").
- **Yayınla/Taslağa Al**, listeden tek tıkla (`components/panel/
  PublishToggleButton.tsx`, her varlık için `toggleXPublishedAction`).
- **Sıralama**, yukarı/aşağı butonlarıyla (`components/panel/
  ReorderButtons.tsx`, paylaşılan `swapOrderIndex()` — `lib/supabase/
  panelQueries.ts`), sürükle-bırak yok.
- **"Değişiklik yoksa yazma yapma"** — her `update*Action` artık mevcut
  kaydı çekip karşılaştırıyor, fark yoksa DB'ye hiç yazmıyor.
- **Referanslar/SSS/Ekip** için panel CRUD (liste + ekle + düzenle + sil +
  yayınla + sırala) Hizmetler/Projeler'le birebir aynı 5 parçalı desende
  tamamlandı (`app/panel/(protected)/icerikler/{referanslar,sss,ekip}/`)
  — **hiçbir yeni migration gerekmedi**, RLS/şema zaten 2026-08-07'den
  beri hazırdı. **Ekip'in revalidate hedefi `/ekip`** (diğerleri `"/"`) —
  2026-08-13'te ayrı sayfaya taşındığı için, kolay gözden kaçan bir
  ayrıntı, bilerek doğru yapıldı. `icerikler/page.tsx` artık 5 kart
  gösteriyor.

**Doğrulama (gerçek, servis-rolü script + `npm run dev` + `curl` ile):**
Ekip'te iki üyenin sırası değiştirilip `/ekip`'te gösterim sırasının
gerçekten değiştiği, bir referans taslağa alınıp ana sayfadan kaybolup
tekrar yayınlanınca geri geldiği, geçici bir SSS kaydının eklenip
görünüp silinince kaybolduğu doğrulandı — hepsi sonra orijinal veriye
geri alındı. Yeni panel rotalarının proxy korumasından geçtiği de
teyit edildi. `npm run build`/`lint` tamamen temiz (0 hata, 0 uyarı).
Detay: `KARAR-GUNLUGU.md`.

**Yapılamayan:** Tarayıcı aracı bu ortamdan `localhost`'a erişemediği
için dialog'un gerçek görsel/klavye davranışı tarayıcıda elle
doğrulanmadı — kullanıcıdan panelde kısa bir deneme rica ediliyor.
Ziyaretçi sitesi (`components/site/`) hiç değişmediği için
`TEST-STRATEJISI.md` madde 8'deki duyarlı tasarım kontrol listesi
yeniden koşulmadı (regresyon riski yoktu, gerekçe `KARAR-GUNLUGU.md`'de).

**`docs/MUSTERİ-KILAVUZU.md` oluşturuldu (2026-08-14, aynı gün, dördüncü
oturum):** Panelin gerçek kullanıcısına (teknik olmayan) yönelik, geliştirici
terimi içermeyen bir kullanım kılavuzu — İçerik Ekleme, İçerik Düzenleme,
Yayınlama ve Taslak, Sıralama Değiştirme ve Silme başlıklarıyla + bölüm
bazlı alan farkları tablosu. İçerik, bir önceki oturumda yazılan gerçek
UI metinleriyle (buton etiketleri, onay mesajları) birebir eşleşecek
şekilde yazıldı — uydurulmadı. Detay ve gerekçe: `KARAR-GUNLUGU.md`.

**Navbar'daki çift "İletişim" düzeltildi (2026-08-14, aynı gün):**
Kullanıcı arayüzde fark etti — nav linkleri listesindeki sade "İletişim"
metni ile yanındaki dolgulu CTA butonu aynı adrese (`/iletisim`)
gidiyordu, görsel tekrar. `components/site/Navbar.tsx`'te, CTA
butonuyla aynı `href`'e sahip link menü listesinden filtrelendi
(`menuLinks`) — hem masaüstü hem mobil menüde (aynı listeyi paylaşıyor)
düzeldi. `lib/sections/config.ts`/`Footer.tsx`'e dokunulmadı (Footer'da
bu tekrar yok, kapsam dışı). `npm run build`/`lint` temiz, gerçek
sunucuda `curl` ile doğrulandı (header'da tek "İletişim" kaldı).

**Proje görselleri: Storage bucket + yükleme akışı + medya kütüphanesi
(2026-08-14, aynı gün, beşinci oturum):** Dışarıdan gelen bir yönerge üzerine, panelde Projeler için
gerçek görsel yükleme kuruldu. Araştırmada önemli bir bulgu ortaya
çıktı: **hiçbir Storage bucket'ı kurulmamıştı** — DB'deki 6 farklı
`*_path` kolonu ve site tarafındaki 8 görüntüleme bileşeni zaten 6 ayrı
bucket adı (`projects`/`services`/`hero`/`about`/`testimonials`/`team`)
bekliyordu ama hiçbiri Supabase'de yoktu. Bu görev **sadece
`"projects"` bucket'ını** kurdu (kullanıcının açık talebi Projeler'e
özeldi), diğer 5'i açık madde (bkz. aşağıda).

- Yeni `supabase/migrations/20260814120000_create_projects_storage_bucket.sql`
  — bucket (public) + `storage.objects` RLS (mevcut 5-policy desenle
  birebir aynı, bkz. `GUVENLIK.md` madde 11).
- `lib/supabase/imageValidation.ts` — tür kontrolü SADECE dosyanın
  gerçek baytlarına (magic number) bakıyor, uzantıya/MIME header'ına
  güvenmiyor; 5 MB boyut sınırı.
- `app/panel/(protected)/icerikler/projeler/imageActions.ts` —
  `uploadProjectImageAction`/`deleteProjectImageAction`: benzersiz
  (`crypto.randomUUID()`) ve kullanıcı girdisinden tamamen bağımsız
  dosya adı (path traversal yapısal olarak imkansız), DB yazması
  başarısız olursa yüklenen dosya geri silinir (yarım kayıt kalmaz).
- `ProjectImageUploader.tsx` — sadece proje DÜZENLEME sayfasında (dosya
  seç → önizle → yükle, durum göstergesi).
- `app/panel/(protected)/medya/` — eski placeholder artık gerçek Medya
  Kütüphanesi (önizleme + dosya adı + kullanıldığı proje + Sil — mevcut
  `DeleteButton`/`ConfirmDeleteDialog` hiç değiştirilmeden yeniden
  kullanıldı).
- `next.config.ts`'e **iki** transport-katmanı ayarı eklendi —
  `experimental.serverActions.bodySizeLimit: "15mb"` VE
  `experimental.proxyClientMaxBodySize: "15mb"` (ikincisi ilk denemede
  unutulmuştu, aşağıdaki bulguya bakın).
- Docs güncellendi: `GUVENLIK.md` (yeni madde 11-12, kullanıcının önceki
  oturumdaki "Storage politikaları/dosya yükleme kuralları başlığı ekle"
  isteği de böylece karşılandı), `VERİ-MODELİ.md`, `MIMARI.md` (yeni
  madde 11), `MUSTERİ-KILAVUZU.md` ("Görsel Ekleme" başlığı).

**Test sırasında bulunan ve düzeltilen gerçek bir hata:** Gerçek
~10MB'lık bir test dosyasıyla (kullanıcının açık isteği) denendiğinde,
ilk seferde `HTTP 500` + bozuk gövde hatası çıktı — sebep,
`serverActions.bodySizeLimit`'ten TAMAMEN BAĞIMSIZ çalışan, kök
`proxy.ts`'in kendi 10MB'lık istek gövdesi tamponlama sınırıydı
(`experimental.proxyClientMaxBodySize`, unutulmuştu). İkisi de 15mb'a
çekilince düzeldi — detay `GUVENLIK.md` madde 12.4, `KARAR-GUNLUGU.md`.

**Doğrulama (gerçek, tamamlandı):** Kullanıcı migration'ı SQL Editor'de
çalıştırdı. RLS testi (anon reddedildi, authenticated başarılı) + 5
senaryolu uygulama testi (geçerli ~2MB görsel → başarı; gerçek ~10MB
görsel → net red mesajı; sahte uzantı → red; kötü niyetli dosya adı →
path'e hiç karışmadı; DB yazma hatası → Storage'da yetim kalmadı) hepsi
gerçek Supabase Storage'a karşı geçti. Test verileri temizlendi, geçici
route/script'ler silindi. `npm run build`/`lint` temiz. Detay:
`KARAR-GUNLUGU.md`.

**İletişim formu gerçek kayıt + Mesajlar ekranı genişletmesi (2026-08-14,
aynı gün, altıncı oturum):** Dışarıdan gelen bir yönerge `leads` adında
var olmayan bir tablodan bahsediyordu — araştırmayla doğrulanıp gerçek
`contact_messages` tablosuna (mekanik reconciliation, projenin
tekrarlayan bir deseni) yönlendirildi:

- Yeni migration `20260814130000_add_contact_message_email_subject.sql`
  — `contact_messages`'a nullable `sender_email`/`subject` kolonları
  ekliyor + mevcut 2 demo satırı gerçekçi değerlerle dolduruyor. **Henüz
  kullanıcı tarafından SQL Editor'de çalıştırılmadı** (bekleme noktası,
  önceki büyük görevlerle aynı desen).
- `components/site/contact/actions.ts`'teki `submitContactForm` artık
  doğrulama sonrası `contact_messages`'a gerçek bir `insert` yapıyor
  (route handler değil, mevcut Server Action deseni — `GUVENLIK.md`'nin
  eski notu düzeltildi, bkz. `KARAR-GUNLUGU.md`).
- `app/panel/(protected)/mesajlar/[id]/page.tsx` — mesaj detayı (tam
  metin, gönderen bilgileri, "E-posta ile Yanıtla" `mailto:` linki) +
  yeni `MarkMessageReadOnView.tsx` (görünmez client bileşen, sayfa
  açılınca `markMessageReadAction`'ı bir kez tetikleyip otomatik okundu
  işaretliyor — çıplak DB yazması yerine yine auth kontrollü bir Server
  Action üzerinden).
- Panel menüsünde (`PanelShell`/`NavList`) okunmamış mesaj sayacı —
  `(protected)/layout.tsx` her sayfada `getUnreadMessagesCount()`'u
  çekip prop olarak geçiyor, kullanıcı panele hangi sayfadan girerse
  girsin görüyor.
- **Geçici tipsiz Supabase client'lar** — kullanıcı migration'ı çalıştırdı,
  `npm run types:generate` ile tipler yenilendi, `createUntypedServiceRoleClient`/
  `createUntypedServerSupabaseClient` kaldırıldı, 3 kullanım yeri gerçek
  tipli client'lara geri taşındı (bkz. `KARAR-GUNLUGU.md`).

**Uçtan uca akış testi (tamamlandı):** `curl` + geçici bir ayna rota +
servis-rolü script'leriyle gerçek Supabase'e karşı doğrulandı: ziyaretçi
gönderimi → `contact_messages`'ta gerçek satır → okunmamış sayısı arttı
→ okundu işaretleme → okunmamış sayısı 2'den 1'e düştü. Panelin gerçek
arayüzünden tıklayarak test edilemedi (bu ortamda tarayıcı aracı
`localhost`'a erişemiyor, test admin şifresi de yok) — bunun yerine
`markMessageReadAction`'ın birebir aynı DB sorgusu doğrulandı, auth
kapısı (`requireAdminUser`) ayrıca kod incelemesiyle teyit edildi.
Detay: `KARAR-GUNLUGU.md`.

**Panel gözden geçirmesi (aynı gün, workflow ile çok boyutlu tarama):**
Panelin 19 sayfası buton/link tutarlılığı, boş durumlar, kırık linkler
ve erişilebilirlik açısından tarandı (11 ajan, keşif + bağımsız
doğrulama). 7 olası bulgudan 5'i gerçek çıktı, hepsi bu oturumda
doğrudan düzeltildi:

- Özet ekranındaki "Tema ayarlarını değiştir →" linki → "Tema ayarları
  (yakında) →" (hedef sayfa hâlâ placeholder, "değiştir" fiili boş bir
  vaat veriyordu).
- `navItems.ts`'teki eski yorum ("sayfaların çoğu placeholder") güncel
  duruma göre düzeltildi — panelin 6 nav öğesinden artık sadece 2'si
  (Tema, Ayarlar) placeholder.
- **Erişilebilirlik:** `PublishToggleButton`/`ReorderButtons`'taki sabit
  `aria-label`'lar, Button.tsx'in pending sırasında eklediği "Yükleniyor"
  sr-only metnini ekran okuyucudan tamamen gizliyordu (ARIA accname
  kuralı gereği aria-label her zaman içeriği ezer). Tek noktadan
  (`components/ui/SubmitButton.tsx`) düzeltildi: pending iken gelen
  aria-label bastırılıp accessible name içerikten (pendingLabel +
  sr-only metin) türetiliyor — iki bileşenin de ayrı ayrı değişmesine
  gerek kalmadı.
- Mobil panel menüsü (`PanelShell.tsx`) `role="dialog" aria-modal="true"`
  taşıyordu ama arka plandaki sayfa içeriği ekran okuyucunun tarama
  modundan (sanal imleç) gizlenmiyordu — `inert` attribute'u eklendi.
- (Reddedilen 2 bulgu: Mesajlar/Medya sayfalarındaki boş-durum
  metinlerinin fiil seçimi diğer listelerden farklıydı ama anlamca doğru
  ve kasıtlıydı — kozmetik, düzeltilmedi.)

**Mentör gibi proje değerlendirmesi (aynı gün, ayrı bir workflow ile):**
Kullanıcının isteğiyle kod tabanı + docs bütünlüğü + güvenlik + kapsam
açısından geniş bir değerlendirme yapıldı, kullanıcıya doğrudan
raporlandı. İki sistemik bulgu: **test altyapısı hâlâ sıfır** (Vitest/
Playwright kurulu değil, yukarıdaki "Sıradaki adım" madde 2 ile aynı,
öncelik yüksek) ve docs-kod senkron borcu (bu oturumda kısmen kapatıldı).
Küçük-orta bulgular (kullanıcıya karar için sunuldu, henüz uygulanmadı):
`ActionResult<T>` tipinin `toggle*/move*` eylemlerinde kullanılmaması
tutarsızlığı, `panelQueries.ts`'in büyümesi (~706 satır), geçici tipsiz
client'lar. İyi yapılmış bulunanlar: RLS/auth tutarlılığı, kapsam
disiplini (spekülatif genelleme yok).

**Tema Ayarları ekranı: marka rengi, WCAG kontrast koruması, canlı
önizleme, logo/favicon, site kimliği (2026-08-15, yeni oturum):**
`/panel/tema` artık gerçek bir form — dışarıdan gelen bir yönerge üzerine,
`/panel/tema`'nın statik placeholder'ı gerçek bir tema editörüne
dönüştürüldü. Kapsamlı bir özellik, plan modunda tasarlandı (kullanıcıyla
2 mimari kararı netleştirdikten sonra: köşe yarıçapı serbest piksel değil
hazır ölçek seçimi, font ailesi 2 yerine 5 seçenekli next/font yüklemesi).

- **`lib/theme/contrast.ts` (yeni, saf modül):** WCAG kontrast oranına
  dayalı `pickReadableTextColor`/`getContrastRatio`/`checkContrastWarning`
  — eski `pickReadableOnColor` (kaba luminance sezgisi) silindi. **Gerçek
  bir hata bulundu ve düzeltildi:** eski kod `#808080` orta gri için
  yanlışlıkla beyaz metin öneriyordu (gerçek oran 3.95:1, AA eşiğinin
  altında); yeni kod doğru şekilde siyahı seçiyor (5.32:1). KABUL
  KRİTERİ'ndeki 3 renk gerçek hesapla doğrulandı (bkz. `KARAR-GUNLUGU.md`).
- **Köşe yarıçapı/font artık `theme_preset`'ten BAĞIMSIZ, `primary_color`
  ile aynı override deseninde** (`site_settings.border_radius_scale`/
  `font_family_key`, nullable) — 3 hazır radius ölçeği, 5 font (Inter/
  Poppins/Work Sans yeni eklendi, `app/layout.tsx`'e build-time).
- **Canlı önizleme:** `ThemeEditor.tsx` (client, form state) + gerçek
  `resolveThemeTokens()`'ı kullanan `ThemePreview.tsx` — izole bir
  `<div style>` içinde gerçek `Button`/kart/başlık render ediyor, gerçek
  `<html>`'e dokunmadan.
- **İkincil renk artık kullanılıyor:** yeni `--color-accent`/`-on` token
  çifti (boşken nötr, sıfır regresyon), `Button`/`LinkButton`'a `accent`
  varyantı, `CtaSection`'ın butonu buna geçirildi.
- **Logo/favicon:** yeni `"branding"` Storage bucket'ı (`"projects"`in
  aynısı), `BrandImageUploader.tsx` (generic markup, ayrı sunucu
  eylemleri). Navbar logosuz kurulumda AYNEN eski (sadece metin) davranışı
  koruyor — regresyon yok.
- **Site kimliği:** firma adı (`tenants.name`, zaten vardı) + yeni
  `slogan` + iletişim (`contact_sections` — Footer/İletişim'in ZATEN
  okuduğu tablo, form BURAYA yazıyor) + sosyal medya (`site_settings.*`,
  zaten vardı/render ediliyordu, sadece form eklendi).
- **Temizlik:** `site_settings.contact_email`/`contact_phone` — 2026-08-06'dan
  beri hiç okunmayan ölü kolonlar, aynı migration'da düşürüldü.
- Migration `20260815120000_add_theme_settings_and_branding.sql` —
  kullanıcı tarafından SQL Editor'de çalıştırıldı, `npm run
  types:generate` ile tipler yenilendi, geçici tipsiz client'lar
  kaldırılıp gerçek tipli client'lara geri taşındı.

**Uçtan uca akış testi (tamamlandı):** `curl` + servis-rolü script'iyle
gerçek dev sunucusuna karşı doğrulandı — marka rengi/ikincil renk/köşe
yarıçapı/font/slogan değiştirildi, `curl` ile site yeniden çekilip
`<html style>`'ın ve Footer/CTA'nın gerçekten değiştiği teyit edildi
(`--color-brand`, `--radius-*`, `--font-sans`, `--color-accent` hepsi
doğru), kontrast hesapları bağımsız olarak da doğrulandı, test verisi
orijinaline geri alındı. Detay: `KARAR-GUNLUGU.md`.

`npm run lint`/`npx tsc --noEmit`/`npm run build` hepsi temiz.

**Bölüm Yönetimi ("Sayfa Düzeni") ekranı (2026-08-15, aynı gün, yeni
oturum):** `/panel/sayfa-duzeni` (yeni rota — `/panel/tema` zaten marka
rengi/radius/font ekranı olduğu için bu, Faz 5'in "bölüm sırası/görünürlük/
varyant" kısmına AYRI bir yeni rota) artık `page_sections`'ı gerçekten
yönetiyor:

- Her bölüm kendi kartında: yukarı/aşağı sıralama (`ReorderButtons`, hiç
  değişmeden yeniden kullanıldı), "Gizle"/"Göster" görünürlük butonu
  (yeni `SectionVisibilityToggleButton`), ve (varsa) varyant seçimi.
- **Varyant seçimi:** Sadece 5/10 bölümün (hero/services/projects/
  testimonials/faq) gerçekten birden fazla görünümü olduğu KOD OKUNARAK
  doğrulandı (seed verisine güvenilmedi — 3 bölümün "gizli" ikinci
  varyantı vardı: projects="mosaic", testimonials="featured",
  faq="two-column", hiçbiri seed'de kullanılmıyordu). Her seçenek küçük
  bir inline SVG şema + müşteri dilinde etiket (ör. "Tam Ekran Görsel")
  ile gösteriliyor, tıklanınca anında kaydediliyor.
- **Navbar/Footer** gerçek `page_sections` satırı DEĞİL (PRD.md'nin
  bilinçli kararı — chrome, bölüm kütüphanesinin parçası değil) — ekranda
  sadece görsel/statik, devre dışı butonlu iki "sözde satır" olarak
  gösteriliyor, şemaya hiç dokunulmadı.
- **"Siteyi Önizle"** linki, yeni sekmede ziyaretçi sitesini açıyor.
- **Gerçek bir bug bulundu ve düzeltildi:** `testimonials` varyantı DB'den
  hiç doğrulanmadan (`lib/sections/registry.tsx`'te ham cast) kullanılıyordu
  — hero'nun aksine, geçersiz bir değer (elle DB düzenlemesi) anasayfayı
  çökertebilirdi (registry lookup `undefined` component döner). Yeni
  `isTestimonialsVariant()` eklendi (hero'daki desenle aynı).
- **5 kombinasyon testi** (gerçek dev sunucusu + `fetch`, servis-rolü
  script'iyle): orijinal seed, tüm varyantlar alternatifte, yarısı gizli +
  sıra tersine, tüm varyantlar `null`, ve **whitelist-dışı bir varyant
  değeri (`"legacy-carousel"`) doğrudan DB'ye yazılıp** — 5/5 senaryoda
  `/` (ve bir senaryoda `/ekip`/`/iletisim`) 200 döndü, son senaryo bug
  fix'ini gerçek bir HTTP isteğiyle kanıtladı. Test verisi orijinaline
  geri alındı.

`npm run lint`/`npx tsc --noEmit`/`npm run build` hepsi temiz.
`docs/MUSTERİ-KILAVUZU.md`'ye "Sayfa Düzeni Değiştirme"/"Bölüm
Varyantları"/"Tema Ayarları" başlıkları eklendi (sonuncusu: önceki
oturumda kodlanan Tema ekranı hiç dokümante edilmemişti, bu görev o
eksiği de kapattı).

**Tema önayarları + Varsayılana Dön + SEO Ayarları ekranı (2026-08-16,
aynı gün, yeni oturum):** Faz 5'in son açık maddesi (preset SEÇİMİ
arayüzü) kapandı, artık `/panel/tema`'da:

- **Tema Önayarları:** "Kurumsal Mavi"/"Modern Koyu" için birer "Uygula"
  butonu (küçük renk örneği önizlemeli) — onay penceresi ("mevcut
  ayarlarınız silinecek" uyarısıyla) sonrası `applyThemePresetAction`
  `theme_preset`'i değiştirip 4 override kolonunu (primary_color,
  secondary_color, border_radius_scale, font_family_key) null'a çekiyor
  — override'lar temizlenmezse önayar seçimi görünürde hiçbir şey
  değiştirmezdi (hâlâ dolu override'lar tarafından gölgelenirdi).
- **Varsayılana Dön:** Aynı eylemi `kurumsal-mavi` (`DEFAULT_THEME_PRESET`)
  ile çağıran, "kurtarma" çerçeveli ayrı bir buton — sadece Marka
  alanlarını sıfırlıyor, Site Kimliği/İletişim/Sosyal Medya/Logo/Favicon'a
  dokunmuyor.
- Yeni genel `components/panel/ConfirmActionDialog.tsx` —
  `ConfirmDeleteDialog`'un "Sil" diline kilitli OLMAYAN, genel onaylı-eylem
  hâli (title/description/confirmLabel/confirmVariant).
- **Gerçek bir React tuzağı çözüldü:** `ThemeEditor.tsx`'in renk/radius/
  font `useState`'leri sadece ilk mount'ta okunuyor, bir Server Action
  sonrası kendiliğinden güncellenmiyor — önayar/varsayılan uygulanınca
  `window.location.reload()` ile tam sayfa yenileme yapılıyor (state
  senkronizasyon karmaşıklığı yerine, nadir/kasıtlı bir eylem için kabul
  edilebilir bir basitlik).

**SEO Ayarları — `/panel/ayarlar`'ın eski placeholder'ı artık gerçek**
(placeholder metni zaten "SEO... Faz 5'te" diyordu, bu görev o sözü
kapattı — yeni bir rota AÇILMADI):

- Sayfa başlığı/açıklama alanlarında canlı karakter sayacı (60/160 —
  Google'ın fiili kesme noktalarına yakın, SERT bir engelleme değil,
  sadece görsel uyarı — KISITLAR "uyar" dedi "engelle" demedi).
- Canlı Google arama sonucu önizlemesi.
- Anahtar kelimeler (dürüst bir notla: modern arama motorları büyük
  ölçüde yok sayıyor, yine de saklanıyor).
- Paylaşım görseli (Open Graph) — mevcut `BrandImageUploader.tsx`
  (logo/favicon'la aynı, `"branding"` bucket'ı) yeniden kullanıldı.
- Yeni migration: `20260816120000_add_seo_keywords_and_og_image.sql` —
  `site_settings.seo_keywords`/`og_image_path`.

**Test 1 (ayar ekranları denetimi):** Bir ajanla Tema/Sayfa Düzeni/
Ayarlar/Mesajlar ekranları taratıldı — eksik alan/kaydedilmeyen değer
bulunamadı, 2 gerçek etiket tutarsızlığı bulunup düzeltildi (Köşe
Yarıçapı/Font Ailesi'nde eksik "(opsiyonel)" eklendi; mesaj listesindeki
"Yeni" rozeti panelin geri kalanıyla ["Okunmamış Mesaj" özet kartı,
menü rozeti] tutarlı olsun diye "Okunmamış" yapıldı).

**Test 2 ("yeni müşteri" dogfood testi):** Gerçek dev sunucusuna karşı,
2 aşamalı: (1) `applyThemePresetAction`'ın gerçek mantığıyla "Modern
Koyu" uygulandı, `<html style>` doğrulandı; (2) üzerine tamamen farklı
bir marka (terrakota `#c1502e` + orman yeşili `#2d6a4f`, "keskin" radius,
Poppins font), yeni bölüm sırası (Referanslar hero'dan hemen sonra),
5 varyantlı bölümün hepsi alternatif varyantında, İstatistikler gizli,
yeni SEO başlık/açıklama/anahtar kelime uygulandı — **15/15 doğrulama
noktası geçti**, `/ekip`/`/iletisim` dahil. Bağımsız kontrast hesabı
`#c1502e`'nin AA eşiğine ÇOK yakın (4.71:1, sınır 4.5:1) ama geçtiğini
doğruladı — `<html style>`'daki gerçek çıktıyla birebir örtüştü. Test
verisi (kullanıcının panelden kendi denediği GERÇEK ara durum dahil)
orijinaline tam olarak geri alındı.

`npm run lint`/`npx tsc --noEmit`/`npm run build` hepsi temiz.
`docs/MUSTERİ-KILAVUZU.md`'ye "Tema Önayarları"/"Varsayılana Dönme"/
"SEO Ayarları" başlıkları eklendi.

**JSON-LD yapısal veri, site haritası/robots, paylaşım görseli garantisi
(2026-08-17):** Dışarıdan gelen bir yönergeyle, SEO'nun üç eksik temeli
tamamlandı:

- **`LocalBusiness` (`GeneralContractor`) JSON-LD'si** — her sayfada
  render edilen yeni `components/site/LocalBusinessJsonLd.tsx`, saf
  `lib/seo/localBusiness.ts`'teki `buildLocalBusinessJsonLd()`'den
  besleniyor. Eksik alanlar (telefon/adres/çalışma saati/hizmet ili/
  sosyal medya) JSON-LD'den TAMAMEN çıkarılıyor, boş string olarak
  kalmıyor. Telefon `lib/seo/formatPhone.ts` ile uluslararası (`+90...`)
  biçime normalize ediliyor.
- **Panelde yeni yapısal alanlar** — `/panel/tema`'nın İletişim
  Bilgileri bölümüne Çalışma Saatleri (serbest metin, artık İLK KEZ
  panelden düzenlenebiliyor), 4 yapısal saat kutusu (hafta içi/hafta
  sonu açılış-kapanış) ve Hizmet Verilen İller eklendi — yeni migration
  `20260817120000_add_working_hours_structured_and_service_areas.sql`
  (`contact_sections`'a 5 kolon, saat kolonları `HH:MM` CHECK
  constraint'li).
- **`app/sitemap.ts`/`app/robots.ts`** — sadece gerçek sayfalar (`/`,
  `/ekip`, `/iletisim`), `/panel` tamamen Disallow.
- **`app/api/og/route.tsx`** — panelden paylaşım görseli yüklenmemişse
  devreye giren, gerçek marka rengini/WCAG-doğru metin rengini kullanan
  otomatik görsel üretimi (`next/og` `ImageResponse`) — dosya kuralı
  (`opengraph-image.tsx`) BİLEREK kullanılmadı (Next.js'te dosya-tabanlı
  metadata her zaman `generateMetadata()`'yı ezdiği için gerçek bir
  görsel varken bile onu gölgelerdi).

**Doğrulama (gerçek):** Gerçek `curl` ile 4 rota (`/robots.txt`,
`/sitemap.xml`, `/api/og`, ana sayfanın JSON-LD'si) test edildi; JSON-LD
için 3 DB senaryosu (boş/dolu/kısmi) servis-rolü script'iyle doğrulandı;
DB'nin geçersiz saat formatını CHECK constraint'iyle reddettiği
doğrulandı; **Google Zengin Sonuçlar Testi'nde 0 hata** ile geçti (3
isteğe bağlı alan notu — `priceRange`/`postalCode`/`addressLocality` —
hepsi bilinçli kapsam kararlarının beklenen sonucu). `npm run lint`/
`npx tsc --noEmit`/`npm run build` hepsi temiz. Yeni
`docs/SEO-PERFORMANS.md` (4 başlık) + `VERİ-MODELİ.md`/`GUVENLIK.md`/
`MUSTERİ-KILAVUZU.md`/`CLAUDE.md` güncellemeleri. Detay:
`KARAR-GUNLUGU.md`, 2026-08-17.

**Lighthouse performans denetimi: gereksiz font indirmeleri temizlendi
(2026-08-17, aynı gün, yeni oturum):** Kullanıcı gerçek bir Lighthouse
raporu (mobil+masaüstü, sadece 4 kategori skoru) paylaştı; rapor
detayları (Opportunities/metrikler) olmadığı için, kod tabanı dışarıdan
gelen bir yönergedeki 4 kategori (görsel, font, istemci JS, CLS) için
statik olarak tarandı. `next/font`'un resmi "Preloading" davranışı
(`node_modules/next/dist/docs/01-app/03-api-reference/02-components/
font.md`) doğrulanarak gerçek bir sorun bulundu: **`app/layout.tsx`
(root layout) 6 font ailesini (Geist Sans, Geist Mono, Manrope, Inter,
Poppins×4 ağırlık, Work Sans) TÜM rotalarda otomatik preload ediyordu**,
ama `resolveThemeTokens()` (`lib/theme/resolve.ts`) aynı anda sadece TEK
`--font-sans` kullanıyor — font seçimi tenant bazlı, `site_settings.
font_family_key`'e göre.

- **Geist Mono komple kaldırıldı** — kodda `font-mono` class'ı hiçbir
  yerde kullanılmadığı grep ile doğrulandı, %100 ölü ağırlıktı.
- **`manrope`/`inter`/`poppins`/`workSans`'a `preload: false` eklendi**
  — Geist Sans (`kurumsal-mavi` varsayılan preset'in fontu) `preload:
  true` (varsayılan) kaldı. Bu, next/font'un otomatik `<link
  rel="preload">` enjeksiyonunu o 4 font için kapatıyor; tarayıcı artık
  sadece `--font-sans` gerçekten o fonta çözüldüğünde indiriyor.
- `app/globals.css`'teki artık boşta kalan `--font-mono: var(--font-
  geist-mono);` token'ı silindi.
- **Görsel boyutlandırma/priority** (her yerde `next/image`, `sizes`
  gerçek render genişlikleriyle eşleşiyor, `priority` sadece Hero + ilk
  3 proje kartında), **font `display`** (next/font varsayılanı zaten
  `swap`) ve **CLS** (her görsel `aspect-[...]`/sabit boyut container
  kullanıyor, `adjustFontFallback` varsayılan `true`) kod incelemesinde
  zaten sorunsuz bulundu — ekstra iş yapılmadı, uydurma bulgu
  eklenmedi.
- **Projeler galerisinin client-boundary'si** (`ProjectsExplorer.tsx`
  tüm galeriyi kendi içinde render ediyor, "Server Component'i children
  geçme" deseni kullanılmıyor) düşük/belirsiz kazanç + yüksek efor
  (URL/arama-parametresi tabanlı modal mimarisi gerektirir) gerekçesiyle
  bilinçli olarak ertelendi.

**Doğrulama (gerçek, kullanıcı tarafından):** `npm run build` + `npm run
start` sonrası Chrome DevTools Lighthouse aynı iki profilde (mobil +
masaüstü) tekrar çalıştırıldı:

| Kategori | Mobil (önce → sonra) | Masaüstü (önce → sonra) |
|---|---|---|
| Performance | 88 → **96** | 99 → **100** |
| Accessibility | 100 → 100 | 100 → 100 |
| Best Practices | 96 → 96 | 96 → 96 |
| SEO | 92 → 92 | 92 → 92 |

Mobil Performance artık `TEST-STRATEJISI.md` madde 4 eşiğinin (≥90)
üzerinde — düzeltme öncesi tek eksik kalem buydu, font preload
optimizasyonuyla kapandı. Diğer 3 kategori beklenildiği gibi
değişmedi (font önceliklendirmesi sadece Performance metriklerini
etkiler). `npm run build`/`lint` bu oturumda ayrıca doğrulanmadı —
kullanıcı sıradaki oturumda teyit edebilir.

**Erişilebilirlik denetimi: atlama bağlantısı + gereksiz canlı bölge
düzeltmesi (2026-08-17, aynı gün, yeni oturum):** Dışarıdan gelen bir
yönergeyle site+panel için erişilebilirlik denetimi istendi. Bu ortamda
tarayıcı aracı `localhost`'a erişemediği için otomatik tarama/klavye
turu/ekran okuyucu dinlemesi AI tarafından gerçek zamanlı yapılamadı —
hedefli bir kod incelemesi yapıldı, kapsam 2026-08-14'teki son
kapsamlı panel taramasından SONRA eklenen yüzeylere (Tema Ayarları,
Sayfa Düzeni, SEO Ayarları, marka görseli yükleme) daraltıldı. Detaylı
bulgu tablosu, test yöntemleri ve yanlış pozitif değerlendirmesi:
`TEST-STRATEJISI.md` madde 9.

- **Yeni `components/ui/SkipLink.tsx`** — `app/(site)/layout.tsx` ve
  `components/panel/PanelShell.tsx`'e eklendi, hedef `<main>`'ler
  `id`+`tabIndex={-1}` aldı (Kritik bulgu — hiçbir yerde atlama
  bağlantısı yoktu).
- **`role="status"` kaldırıldı** — `SeoEditor.tsx`'teki karakter
  sayacından ve `ThemeEditor.tsx`'teki 2 kontrast geri bildirim
  paragrafından (Yüksek bulgu — her tuş vuruşunda/renk değişiminde
  ekran okuyucuyu kesiyordu). Form gönderim sonrası tek seferlik
  "Değişiklikler kaydedildi" mesajlarına dokunulmadı.
- **Düşük öncelikli not (düzeltilmedi):** `BrandImageUploader`'daki
  seçili-dosya önizlemesinin `alt` metni jenerik, dosya adını
  içermiyor.
- **Yanlış pozitif olarak elendi:** `ColorPickerField`'daki native
  renk seçici + metin kutusu ikilisi — incelemede ikisinin de doğru
  isimlendirildiği görüldü.

**Kullanıcı tarafından tamamlandı:** Klavye turu (site + panel) ve
Windows Narrator ile ekran okuyucu denemesi gerçek tarayıcıda elle
yapıldı — hiçbir yeni sorun bulunmadı, 2 düzeltmenin (atlama
bağlantısı, canlı bölge) gerçek kullanımda işe yaradığı doğrulandı.
`npm run build`/`lint` bu oturumda ayrıca doğrulanmadı, henüz
commit'lenmedi.

## Sıradaki adım

1. Diğer 5 bucket (`services`/`hero`/`about`/`testimonials`/`team`) için
   de aynı desenle bucket+RLS+yükleme akışı kurulmalı — şu an bu
   tablolardaki `*_path` kolonlarına değer girilse bile görsel 404 verir.
2. Vitest ve Playwright'ı kur (bkz. `TEST-STRATEJISI.md`) — hâlâ yarım
   kalmış bir kurulum, `npm install` adımları henüz çalıştırılmadı;
   mentör değerlendirmesinde de en yüksek öncelikli sistemik eksik
   olarak işaretlendi. `lib/theme/contrast.ts` gibi yeni saf fonksiyonlar
   da hâlâ gerçek Vitest testi olmadan (sadece elle doğrulanmış) duruyor.
3. İletişim formuna bir e-posta bildirimi eklenmeli (kayıt artık gerçek,
   bildirim hâlâ yok — bkz. `GUVENLIK.md` madde 10).
4. Site tasarımı ilerledikçe `KURUMSAL-SITE-STANDARTLARI.md`'deki kontrol listesini
   madde madde işaretle.
5. Gerçek görsel(ler) Storage'a yüklenince Lighthouse'u tekrar çalıştırıp
   sayfa ağırlığındaki gerçek görsel etkisini ölç — artık **5 font**
   build-time yüklendiği için (2026-08-15) bu ölçüm eskisinden daha da
   önemli.
6. Host header'a göre gerçek tenant çözümleyen `proxy.ts` mantığı yazılınca
   (a) `getActiveTenantId()`'i sabit domain yerine parametreye çevir, (b)
   aynı `proxy.ts`'e tenant/domain bazlı panel erişim engelini de ekle —
   Next.js proje başına tek proxy dosyasına izin veriyor, ikisi birleşecek
   (bkz.
   `MIMARI.md` madde 7).
7. Mentör değerlendirmesindeki küçük-orta bulgular (`ActionResult<T>`
   tutarsızlığı, `panelQueries.ts` bölünmesi) — kullanıcı isterse ele
   alınacak, şu an açık karar bekliyor.
8. Gerçek domain'e deploy sonrası SEO doğrulama adımları — Google Search
   Console'a sitemap gönderimi, gerçek URL ile Zengin Sonuçlar Testi
   tekrarı, WhatsApp/LinkedIn paylaşım önizlemesi. Tam liste:
   `docs/SEO-PERFORMANS.md`, "Yayın Sonrası SEO Kontrol Listesi".

## Açık sorular

Şu an aktif açık soru yok. Kullanıcı ürün mantığı hakkında birkaç ek nokta daha
paylaşacağını belirtti (2026-08-06) — gelince buraya ve `KARAR-GUNLUGU.md`'ye
işlenecek.

**Çözüldü:** `docs/RAKIP-ANALIZI.md` eklendi — 8 gerçek inşaat/mimarlık sitesi
incelenerek çıkarılan bölüm karşılaştırma tablosu ve "olması gereken 6 bölüm"
listesi (İletişim, Hakkımızda, Hero, Projeler/Portföy, Blog/Haberler, Hizmetler).
Bu liste bölüm kütüphanesi için referans alındı — **tek istisna: Blog/Haberler
bilinçli olarak kapsam dışı bırakıldı** (2026-08-06, bkz. `KARAR-GUNLUGU.md`).
