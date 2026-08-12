# SEO ve Performans

Bu dosya, sitenin arama motorları tarafından doğru bulunup/anlaşılıp
zengin biçimde gösterilmesi için yapılanları anlatır: meta veri, site
haritası/robots, ve Google'ın "zengin sonuç" (rich result) gösterebilmesi
için gereken yapısal veri (JSON-LD). Kod içermez — gerçek implementasyon
`app/(site)/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`,
`app/api/og/route.tsx`, `lib/seo/`, `components/site/LocalBusinessJsonLd.tsx`.

**Önemli çerçeve:** Bu dosyanın amacı "SEO uyumlu" demek değil — hangi
somut şeyin yapıldığını, hangi somut şeyin gerçek yayın (deploy) sonrasına
kaldığını ve **müşterinin kendisinin yapması gereken adımları** açıkça
ayırmaktır. "Yapısal Veri" bölümündeki testler bile dev ortamında (gerçek
canlı bir domain olmadan) yapıldı — bu, aşağıdaki kontrol listesinde
açıkça not edilmiştir.

**Son güncelleme:** 2026-08-17 (2. güncelleme aynı gün — `getSiteUrl()`
ile gerçek yayın adresi/tenant kimlik domain'i ayrımı, canlı Lighthouse
SEO 92→58 hatasının kök sebebi ve düzeltmesi)

## Meta Veri Stratejisi

`app/(site)/layout.tsx`'teki `generateMetadata()` (2026-08-16'da SEO
Ayarları ekranıyla birlikte kodlandı, bu oturumda paylaşım görseli
tarafı genişletildi) her sayfa için şu öncelik sırasıyla çalışır:

- **Başlık:** `site_settings.seo_title` doluysa o, boşsa
  `tenants.name`, o da yoksa sabit "Kurumsal Web Sitesi" — hiçbir zaman
  create-next-app'in yer tutucu başlığı görünmez.
- **Açıklama:** `seo_description` doluysa o, boşsa hiç eklenmez
  (`undefined` — Next.js kendi varsayılanına düşer, uydurma bir metin
  YAZILMAZ).
- **Anahtar kelimeler:** `seo_keywords` doluysa eklenir. Panelde dürüst
  bir notla sunuluyor: modern arama motorları bu alanı büyük ölçüde
  sıralamada kullanmıyor, yine de bazı arama motorları/araçlar için
  zararsız olduğu için saklanıyor.
- **Simge (favicon):** `favicon_path` doluysa panelden yüklenen görsel,
  boşsa Next.js'in statik `app/favicon.ico`'suna sessizce düşer.
- **Paylaşım görseli (`openGraph.images`) — bu oturumda garanti altına
  alındı:** `og_image_path` doluysa panelden yüklenen gerçek görsel;
  **boşsa artık `undefined` DEĞİL**, `/api/og`'dan otomatik üretilen bir
  görsel (bkz. "Yapısal Veri" altındaki OG Görsel bölümü). Önceki
  davranışta paylaşım görseli hiç yüklenmemişse WhatsApp/LinkedIn gibi
  platformlarda görselsiz/varsayılan bir kart görünürdü.

Karakter sınırları (60/160) panelde **yumuşak bir UI uyarısı** —
`lib/validation/seo.ts`'teki gerçek zod tavanı çok daha yüksek
(200/500/300, kötüye kullanıma karşı). Gerekçe: 60/160'ı aşan bir başlık/
açıklama SEO açısından HATA değil, sadece arama sonucunda kesilme
anlamına gelir — panel bunu engellemek değil, göstermek için var (bkz.
`docs/KARAR-GUNLUGU.md`, 2026-08-15).

**Müşterinin yapması gereken:** `/panel/ayarlar`'dan gerçek bir sayfa
başlığı ve açıklaması girilmeli — ikisi de boş kalırsa site yine
çalışır ama arama sonucunda sadece firma adı görünür, rakip
firmalardan ayrışmaz. İyi bir başlık genelde firma adı + sektör + şehir
içerir (ör. "Akme İnşaat — İstanbul İnşaat ve Yapı Firması").

## Site Haritası ve Robots

`app/sitemap.ts` ve `app/robots.ts` — **`app/` kökünde**, `(site)` route
group'unun içinde değil (Next.js'in dosya kuralı böyle gerektiriyor,
`(site)/sitemap.ts` yazılsa sessizce hiç çalışmaz).

- **`sitemap.xml`:** Sadece **gerçek sayfalar** — `/`, `/ekip`,
  `/iletisim`. Bölüm çapaları (`/#hizmetler` gibi) sitemap'e BİLEREK
  girmez — bunlar ayrı bir sayfa değil, aynı ana sayfanın bir parçası;
  sitemap'te tekrar tekrar listelemek arama motoruna yanlış/şişirilmiş
  bir sinyal verirdi. Ana sayfa `priority=1`/`monthly`, diğer ikisi
  `priority=0.6` (Ekip `monthly`, İletişim `yearly` — iletişim bilgisi
  değişim sıklığı daha düşük varsayıldı).
- **`robots.txt`:** `Allow: /`, **`Disallow: /panel`** (panelin tüm alt
  ağacı — giriş sayfası dahil), `Sitemap: https://[domain]/sitemap.xml`.
  **Önemli:** Bu bir güvenlik sınırı DEĞİL, sadece uyumlu botları
  paneli taramaktan caydıran bir ek katman — panelin gerçek erişim
  koruması hâlâ ve sadece `proxy.ts` + oturum kontrolü (bkz.
  `docs/GUVENLIK.md` madde 13, orada bu ayrım daha ayrıntılı açıklanıyor).
- **Domain kaynağı:** İkisi de yeni `lib/seo/getSiteUrl.ts`'teki
  `getSiteUrl()`'ü kullanıyor — `getActiveTenantDomain()`'i (`lib/
  supabase/queries.ts`) DEĞİL. **Gerçek bir hata bulunup düzeltildi
  (2026-08-17):** İlk yazımda ikisi de doğrudan `getActiveTenantDomain()`
  kullanıyordu — bu, "hangi tenant'ın verisi gösterilsin" sorusuna cevap
  veren bir iş/kimlik kavramı (`tenants.domain` kolonu), sitenin GERÇEKTE
  hangi adresten yayında olduğuyla aynı şey DEĞİL. Bir Vercel önizleme
  deploy'unda (`*.vercel.app`, özel alan adı henüz bağlanmamışken) tenant
  domain'i (`akmeinsaat.com.tr`) gerçek yayın adresinden (`staj-projesi-
  olive.vercel.app`) FARKLI olduğu için `robots.txt`'teki sitemap
  referansı ve JSON-LD'nin `url`/`@id` alanı yanlış/erişilemez bir adresi
  gösteriyordu — canlı Lighthouse SEO skoru bu yüzden **92'den 58'e**
  düştü. `getSiteUrl()` önce `NEXT_PUBLIC_SITE_URL` (elle ayarlanmışsa),
  sonra Vercel'in otomatik sağladığı `VERCEL_URL`'i, en son tenant
  domain'ini dener — bu demo deploy'unda elle bir şey ayarlamaya gerek
  kalmadan `VERCEL_URL` üzerinden kendiliğinden düzeliyor. `npm run
  build` çıktısında ikisi de **statik (○)** üretiliyor — istek başına
  yeniden hesaplanmıyor (yani `VERCEL_URL`/`NEXT_PUBLIC_SITE_URL` BUILD
  ZAMANINDA okunuyor, bu bilinçli/beklenen bir davranış, Vercel'in build
  ortamında bu değişkenler zaten dolu).

**Müşterinin/yayıncının yapması gereken:** Gerçek domain'e deploy
edildikten SONRA, alan adının sahibi olan Google hesabıyla Google
Search Console'a mülk eklenip sitemap URL'si gönderilmeli — bu platform
tarafından otomatik yapılamaz, alan adı/Search Console erişimi
müşteriye/yayıncıya ait bir adımdır. Detay: aşağıdaki kontrol listesi.

## Yapısal Veri

**Seçilen tip: `GeneralContractor`.** Schema.org hiyerarşisi: `Thing` →
`Organization` → `LocalBusiness` → `HomeAndConstructionBusiness` →
`GeneralContractor`. Google'ın kendi yapısal veri rehberi "mümkün olan
en spesifik tipi kullanın" diyor — platform inşaat firmalarına
satıldığı için (`docs/DURUM.md`, "Proje bağlamı") generic
`LocalBusiness` yerine bu en uç/spesifik tip seçildi; bu, Google'ın
firmayı doğru kategoride göstermesi ve ileride inşaat firmalarına özel
zengin sonuç biçimleri çıkarsa bunlara otomatik uygun olması için daha
isabetli.

**Veri akışı:** panel (`/panel/tema`, İletişim Bilgileri) →
`contact_sections`/`site_settings`/`tenants` → `getLocalBusinessData()`
(`lib/supabase/queries.ts`, DB'ye bağımlı, `cache()`'li) →
`buildLocalBusinessJsonLd()` (`lib/seo/localBusiness.ts`, **saf
fonksiyon** — DB'den tamamen bağımsız, girdi/çıktısı test edilebilir) →
`<LocalBusinessJsonLd>` (`components/site/LocalBusinessJsonLd.tsx`,
Server Component) → `app/(site)/layout.tsx` üzerinden **her sayfada**
render edilir (tek sayfaya özel değil, firma bilgisi site-geneli kabul
edildi).

**KISITLAR gereği — eksik alan hiç eklenmiyor (boş string DEĞİL):**
Aşağıdaki alanların HER BİRİ, kaynak veri boşsa JSON-LD nesnesinden
tamamen çıkarılıyor: `description`, `image`, `telephone`, `email`,
`openingHoursSpecification` (hafta içi/hafta sonu çiftleri BAĞIMSIZ —
biri doluyken diğeri boş olabilir), `areaServed`, `sameAs`. Bu, gerçek
DB verisiyle test edildi (aşağıdaki "Doğrulama" bölümü).

**Alan bazlı kararlar:**
- **`telephone`:** `lib/seo/formatPhone.ts`'teki `toE164TR()` ile
  uluslararası (`+90...`) biçime normalize edilir — panelde
  görüntülenen/kaydedilen biçim DEĞİŞMEZ, sadece JSON-LD çıktısı
  normalize edilir. Tanınmayan bir biçim gelirse (`null` döner) alan
  hiç eklenmez.
- **`address` (`PostalAddress`) — bilinçli basitleştirme:** Paneldeki
  tek "Adres" alanının TAMAMI `streetAddress`'e yazılır,
  `addressCountry` sabit `"TR"` (platform sadece Türkiye'de faaliyet
  gösteren firmalar için — `docs/DURUM.md`'deki BAĞLAM). Adres
  il/ilçe/posta kodu gibi ayrı alanlara BÖLÜNMÜYOR — bu, Google'ın
  testinde `postalCode`/`addressLocality` için "isteğe bağlı alan
  eksik" notuna yol açıyor (aşağıya bkz.), hata değil. İleride gerçek
  bir ihtiyaç çıkarsa adres ayrı alanlara bölünüp bu basitleştirme
  gözden geçirilebilir.
- **`openingHoursSpecification`:** Yeni yapısal alanlardan
  (`weekday_opens/closes`, `weekend_opens/closes`) geliyor —
  `working_hours` (serbest metin, İletişim sayfasında görüntüleme için)
  YERİNE değil, YANINDA; serbest metni ayrıştırmak riskli olduğu için
  ayrı yapısal alanlar eklendi (kullanıcıyla netleştirildi, bkz.
  `docs/KARAR-GUNLUGU.md`). **Bilinçli basitleştirme:** hafta sonu TEK
  bir çift — Cumartesi ve Pazar aynı saatleri paylaşır, ayrı ayrı
  girilemez.
- **`areaServed`:** Yeni `service_areas` alanından (virgülle ayrılmış
  serbest metin) `split/trim/filter` ile diziye çevriliyor — 81 illik
  bir çoklu-seçim yerine basit metin kutusu (kullanıcıyla netleştirildi).
- **`priceRange` hiç YOK:** Veri modelinde fiyat aralığı kavramı yok
  (inşaat firmaları genelde özel teklif/keşif usulü çalışır, sabit bir
  "$$" gibi aralık yanıltıcı olurdu) — bilinçli olarak eklenmedi.

**Doğrulama (gerçek, tamamlandı — 2026-08-17):**
1. Gerçek `npm run dev` sunucusuna karşı ana sayfa `curl` ile çekildi,
   `<script type="application/ld+json">` içeriği çıkarılıp
   `JSON.parse` ile geçerliliği doğrulandı.
2. **Eksik alan senaryosu** (migration sonrası taze kolonlar, hepsi
   `null`): `openingHoursSpecification`/`areaServed` JSON-LD'de HİÇ
   görünmedi (boş dizi/boş string değil, alan yok) — KISITLAR'a birebir
   uyum.
3. **Dolu alan senaryosu** (servis-rolü script'iyle geçici test verisi
   yazıldı: hafta içi 09:00-18:00, hafta sonu 10:00-14:00, "İstanbul,
   Kocaeli, Bursa"): 2 `OpeningHoursSpecification` girdisi (doğru
   `dayOfWeek` dizileriyle) + 3 elemanlı `areaServed` doğru üretildi.
4. **Kısmi alan senaryosu** (sadece hafta içi dolu): sadece 1
   `OpeningHoursSpecification` girdisi üretildi, hafta sonu ve
   `areaServed` yok — çift-bağımsız omisyon doğrulandı.
5. **DB seviyesi format koruması:** `weekday_opens` için geçersiz bir
   değer (`"25:99"`) yazılmaya çalışıldı, Postgres CHECK constraint'i
   reddetti — uygulama/panel katmanındaki zod doğrulamasının (KABUL
   KRİTERİ: "doğru formatta olsun") ARKASINDA ikinci bir gerçek engel
   olduğu teyit edildi.
6. Test verisi orijinal (tamamı `null`) haline geri alındı.
7. **Google Zengin Sonuçlar Testi** (search.google.com/test/rich-results,
   "Kod" sekmesi — bu ortamda tarayıcı `localhost`'a erişemediği için
   gerçek üretilen JSON-LD bir HTML sayfasına sarılıp doğrudan
   yapıştırıldı): **0 hata, 2 geçerli öğe algılandı** ("Yerel
   İşletmeler" ve "Kuruluş" grupları). Toplam **3 "kritik olmayan
   sorun"** — hepsi isteğe bağlı alan eksikliği, hepsi yukarıda
   gerekçelendirilen bilinçli kararların doğrudan sonucu:
   - `priceRange` eksik (isteğe bağlı) — veri modelinde yok, kasıtlı.
   - `postalCode` eksik (isteğe bağlı) — adres bölünmedi, kasıtlı.
   - `addressLocality` eksik (isteğe bağlı) — aynı gerekçe.

   **KABUL KRİTERİ "hatasız geçsin" karşılandı** — Google'ın kendi
   ayrımında "hata" (kritik, zengin sonucu engeller) ile "kritik olmayan
   sorun" (isteğe bağlı alan önerisi, zengin sonucu ENGELLEMEZ) farklı
   kategoriler; bu testte hata sayısı sıfır.

### OG Görsel (Paylaşım Görseli) Otomatik Üretimi

`app/api/og/route.tsx` — Next.js'in `next/og` (`ImageResponse`) ile,
panelden hiçbir paylaşım görseli yüklenmemişse devreye giren otomatik
yedek. **Neden dosya kuralı (`opengraph-image.tsx`) değil, özel bir
Route Handler:** Next.js dokümantasyonu dosya-tabanlı metadata'nın HER
ZAMAN `generateMetadata()`'daki değeri EZDİĞİNİ belirtiyor — bir
`opengraph-image.tsx` eklenmiş olsaydı, panelden GERÇEK bir görsel
yüklenmiş olsa bile o dosya her zaman kazanırdı (istenenin tam tersi).
Bunun yerine `generateMetadata()` şartlı olarak ya gerçek görseli ya
`/api/og`'u seçiyor.

Üretilen görsel: 1200×630, tenant'ın **gerçek marka rengini** (`site_settings.primary_color`
→ `resolveThemeTokens()`) arka plan yapıyor, üzerine firma adı + varsa
slogan — metin rengi `lib/theme/contrast.ts`'teki (Tema Ayarları
ekranından, WCAG-doğru) `pickReadableTextColor()` ile hesaplanıyor,
yani panelin canlı önizlemesindeki AYNI okunabilirlik garantisi burada
da geçerli. Girdi/parametre almıyor (`GET`, sabit) — enjeksiyon/kötüye
kullanım yüzeyi yok (bkz. `docs/GUVENLIK.md` madde 13).

**Doğrulama:** `curl` ile `content-type: image/png`, gerçek ~24 KB'lık
bir PNG döndüğü ve içeriğin (firma adı, doğru marka rengi, okunaklı
beyaz metin) doğru render edildiği görsel olarak teyit edildi.

## Yayın Sonrası SEO Kontrol Listesi

Bu liste, bu oturumda **yapılan** işi tekrar etmiyor — sadece gerçek bir
domain'e deploy edildikten SONRA yapılması gereken, bu geliştirme
ortamında yapılamayan/anlamsız olan adımları listeliyor. Hiçbiri
otomatik değildir, elle işaretlenmelidir.

- [ ] Gerçek domain'e deploy sonrası `https://[domain]/robots.txt` ve
      `https://[domain]/sitemap.xml`'in tarayıcıdan gerçekten
      erişilebilir olduğu kontrol edilmeli (bu oturumda sadece
      `localhost`'a karşı doğrulandı).
- [ ] Alan adının sahibi olan Google hesabıyla **Google Search
      Console**'a mülk eklenmeli, sitemap URL'si gönderilmeli — bu adım
      platform tarafından otomatik yapılamaz, kimin yapacağı (müşteri mi
      yayıncı/ajans mı) netleştirilmeli.
- [ ] Google Zengin Sonuçlar Testi, bu kez **gerçek yayınlanmış URL**
      ile (Kod yapıştırma değil, URL sekmesiyle) TEKRAR çalıştırılmalı —
      bu oturumdaki test üretilen JSON-LD'nin KENDİSİNİ doğruladı, ama
      gerçek deploy ortamının (env değişkenleri, gerçek domain) aynı
      sonucu verdiğini garanti etmez.
- [ ] **WhatsApp ve LinkedIn paylaşım önizlemesi** gerçek canlı URL ile
      test edilmeli — bu oturumda yapılamadı (dev ortamı herkese açık
      değil). LinkedIn'in kendi "Post Inspector" aracı genel kullanıma
      açık ama public bir URL istiyor.
- [ ] Panelden **gerçek müşteri bilgileri** girilmeli: adres, telefon,
      en az bir çalışma saati çifti, hizmet verilen iller. Şu an demo
      tenant'ta (Akme İnşaat) bu alanlar kısmen/tamamen boş — JSON-LD
      bu durumda hata VERMEZ (KISITLAR gereği alanlar sessizce
      atlanır) ama zengin sonuç daha az bilgi taşır.
- [ ] `/panel/ayarlar`'dan gerçek bir **paylaşım görseli** yüklenmeli —
      yüklenmezse her zaman çalışan ama sade (sadece firma adı yazan)
      otomatik görsel kullanılmaya devam eder.
- [ ] `/panel/ayarlar`'dan gerçek bir **sayfa başlığı/açıklaması**
      girilmeli — boşsa arama sonucunda sadece firma adı görünür.
- [ ] `sitemap.xml` **otomatik güncellenmez** — ileride yeni bir statik
      sayfa (ör. `/blog`, `/kariyer`) eklenirse `app/sitemap.ts`'e elle
      bir girdi eklenmelidir (bilinçli tasarım: sadece gerçek sayfalar
      listelenir, bölüm çapaları asla eklenmez).
- [ ] Lighthouse SEO skoru (hedef ≥90, bkz. `docs/TEST-STRATEJISI.md`)
      gerçek deploy sonrası tekrar ölçülmeli — bu oturumda ayrıca
      koşulmadı, önceki ölçümler bu SEO değişikliklerinden ÖNCEydi.
