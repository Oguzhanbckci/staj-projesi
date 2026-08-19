# Veri Modeli

Bu dosya, Supabase (Postgres) veritabanındaki her tabloyu, alanlarını ve
**neden** öyle tasarlandığını anlatır. `PRD.md` madde 3.4'teki içerik
modelinin (hangi bölüm hangi veri alanlarını tutar) somut tablo tasarımıdır.
Kod içermez — gerçek çalışır SQL
`supabase/migrations/20260806120000_create_content_tables.sql`'de. Şema
değişirse önce `KARAR-GUNLUGU.md`'ye tarihli bir kayıt düşülür, sonra hem bu
dosya hem migration güncellenir.

**Son güncelleme:** 2026-08-17 (2. güncelleme aynı gün — `sender_ip`
kolonu, migration sayısı 20'ye çıktı, yeni müşteri kurulum şablonu notu)

**Durum:** Tablolar + kolonlar + kısıtlamalar tasarlandı ve SQL'e döküldü.
2026-08-06'da dışarıdan gelen bir yönergeyle (BAĞLAM/İSTEK/KISITLAR/KABUL
KRİTERİ formatında) karşılaştırılıp üç noktada revize edildi (aşağıda
"Yönergeyle Karşılaştırma" bölümünde). **RLS her tabloda açık VE
okuma/yazma politikaları da yazılıp gerçek veriyle test edildi** (bkz.
`GUVENLIK.md`, `KARAR-GUNLUGU.md` 2026-08-07). Toplam **13 tablo**, hepsi
gerçek Supabase projesine uygulandı; en son kolon eklemesi
(`contact_sections`'a `weekday_opens`/`weekday_closes`/`weekend_opens`/
`weekend_closes`/`service_areas`, 2026-08-17 — JSON-LD yapısal veri
için, bkz. `SEO-PERFORMANS.md`) uygulandı ve tipler yenilendi.
Bu dosyanın en güncel/otoriter kaynak olduğu unutulmamalı — bazı kolonlar
(bkz. her tablonun altındaki "2026-08-08 eklendi" notları) tasarım
aşamasından SONRA, gerçek bileşen/sayfa yazımı sırasında ortaya çıkan
ihtiyaçlarla eklendi.

## Genel Kararlar ve Gerekçeleri

**Tablo/kolon adları İngilizce, `snake_case`, tablo adları çoğul.**
Neden: Postgres'te Türkçe karakterli kolon adları quote gerektirir ve
TypeScript tarafındaki değişken adlarıyla doğal eşleşmez; çoğul tablo adı
(`tenants`, `projects`) yaygın SQL konvansiyonu. Türkçe karşılıkları bu
dosyada parantez içinde belirtiliyor.

**Ortak kolonlar tablonun türüne göre değişir — "her tabloda aynı 4 kolon"
kuralı revize edildi (bkz. Yönergeyle Karşılaştırma madde 1).**
- `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`
  — gerçekten her tabloda.
- `order_index integer default 0` — **sadece gerçekten sıralanabilir liste
  içeriklerde** (`services`, `projects`, `testimonials`, `faqs`,
  `team_members`). Tekil bölümlerde (bir tenant'ta bir tane olan) sıralamanın
  hiçbir anlamı yok, o yüzden artık yok.
- `is_published boolean default false` — yayın kontrolü gereken içerik
  tablolarında (`tenants`, `hero_sections`, `about_sections`, `services`,
  `projects`, `contact_sections`, `testimonials`, `faqs`, `team_members`) var;
  ayar tablosunda (`site_settings`) ve mesaj kaydında (`contact_messages`)
  yok — ikisi de "yayınlanan içerik" kavramına girmiyor.

**Görseller Supabase Storage'da, tabloda yalnız dosya yolu (`*_path`,
text).**
Neden: Tam URL değil, sadece path saklamak; bucket/CDN değişse veya
public/private/imzalı URL stratejisi değişse bile veritabanı etkilenmez,
gerçek URL kod tarafında (`supabase.storage.from(bucket).getPublicUrl(path)`
vb.) üretilir. `live_url` (projects) bu kurala girmiyor çünkü Storage'da
tutulan bir görsel değil, dışarıya (canlı bir web sitesine) giden gerçek bir
bağlantı.

**Platform sahibi için ayrı tablo yok — `tenants` tablosunda
`is_platform_owner = true` olan özel bir satır.**
Neden: İlk tasarımda platform sahibinin kendi tanıtım sitesi için ayrı
`platform_hero`, `platform_portfolio`, `platform_features`, `platform_contact`
tabloları vardı. Ama içerik şekilleri tenant'larla neredeyse birebir aynıydı
(Hizmetler ≈ Vaat edilen özellikler, Projeler ≈ Portfolyo) — ayrı tablo
tutmak gereksiz tekrar ve iki kat bakım yükü olurdu. Kullanıcı bunu
onaylayınca platform sahibi, `tenants` tablosunda özel bir satır olarak
birleştirildi ve tenant'larla **aynı** içerik tablolarını paylaşıyor.

**Her içerik tablosunda `tenant_id` (→ `tenants.id`, `NOT NULL`, `ON DELETE
CASCADE`).**
Neden: Yukarıdaki birleştirmenin doğrudan/zorunlu sonucu — bir satırın hangi
tenant'a (veya platform sahibinin rezerve satırına) ait olduğu bilinmeden
tablolar paylaşılamaz. `ON DELETE CASCADE`: bir tenant silinirse içerik
satırları da otomatik silinir, yetim veri kalmaz.

**RLS her tabloda açık, ama henüz policy yok.**
Neden: `AI-KURALLARI.md` madde 6.1 ("RLS varsayılan olarak açık tutulur")
kuralı, veri yazılmadan önce bile geçerli. Panel auth'u (Supabase Auth) henüz
kodlanmadığı için gerçek policy'ler henüz yazılamıyor. RLS açık + policy yok
= service role dışında hiç kimse hiçbir satıra erişemez — veri yazılmadan
önceki bu ara dönem için güvenli bir varsayılan (fail-closed).

## Yönergeyle Karşılaştırma (2026-08-06)

Dışarıdan (staj yönergesi) gelen bir görev tanımı, aynı şemayı BAĞLAM/İSTEK/
KISITLAR/KABUL KRİTERİ formatında istedi. Karşılaştırma sonucu üç değişiklik
yapıldı:

1. **`order_index`/`is_published` kapsamı daraltıldı** — önceden "her
   tabloda" idi (kullanıcının ilk talimatı), yönerge "sıralanabilirlerde
   order_index, yayın kontrolü gerekenlerde is_published" dedi. Yukarıdaki
   "Genel Kararlar" bölümüne taşındı.
2. **Görsel kolonları `*_url`'den `*_path`'e çevrildi** — yönerge "yalnız
   dosya yolu sakla" dedi, önceki isimlendirme (`background_image_url` vb.)
   tam URL çağrıştırıyordu.
3. **`site_settings` tablosu eklendi** — yönerge "site geneli ayarlar (logo,
   renkler, SEO, iletişim bilgileri) için tek satırlık bir ayar tablosu"
   istedi. Bizim `tenants` tablomuz çok kiracılı (her tenant için bir satır)
   olduğu için literal "tek satır" değil; **`tenants`'tan ayrı, `tenant_id`
   üzerinde UNIQUE olan yeni bir `site_settings` tablosu** eklendi — her
   tenant'ın kendi tek satırı var, bu da yönergenin "tek satırlık" sözünü
   (çok kiracılı mimaride "tenant başına tek satır" olarak yorumlanmış
   haliyle) karşılıyor. `brand_color`, tekrarı önlemek için `tenants`'tan
   çıkarılıp `site_settings.primary_color`/`secondary_color`'a taşındı.
   `contact_recipient_email` (form gönderim adresi, operasyonel bir alan)
   `tenants`'ta kaldı — `site_settings.contact_email`/`contact_phone`
   (üstbilgi/altbilgi/SEO amaçlı gösterim bilgisi) ile karışmasın diye ayrı
   tutuldu; bir miktar kavramsal örtüşme olabileceği bilinerek kabul edildi.

## Tablolar

### `tenants` — Kimlik / Operasyon

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | uuid, PK | |
| `created_at` | timestamptz | |
| `is_published` | boolean, default false | tenant'ın sitesi yayında mı |
| `name` | text, not null | firma/site adı |
| `domain` | text, not null, unique | tenant'ın kendi alan adı |
| `is_platform_owner` | boolean, default false | en fazla 1 satırda true (kısmi unique index) |
| `theme_mode` | text, default 'light', check | `light`\|`dark` |
| `contact_recipient_email` | text, nullable | iletişim formu bu adrese gider (operasyonel) |

### `site_settings` — Logo / Renkler / SEO / İletişim (Tenant Başına Tek Satır)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | uuid, PK | |
| `created_at` | timestamptz | |
| `tenant_id` | uuid, not null, → tenants.id, **unique** | |
| `logo_path` | text, nullable | Storage'daki logo dosya yolu — *(2026-08-15)* `"branding"` bucket'ında, panelden yükleniyor (bkz. `TEMA-MIMARISI.md` madde 7) |
| `primary_color` | text, nullable | marka ana rengi |
| `secondary_color` | text, nullable | marka ikincil (accent) rengi — *(2026-08-15)* artık panelden düzenlenebiliyor, `--color-accent`'i besliyor |
| `seo_title` | text, nullable | varsayılan sayfa başlığı |
| `seo_description` | text, nullable | varsayılan meta açıklama |
| ~~`contact_email`~~ | — | *(2026-08-15'te DÜŞÜRÜLDÜ)* 2026-08-06'dan beri kod tabanının hiçbir yerinde okunmuyordu — gerçek iletişim kaynağı her zaman `contact_sections` idi, ölü kolon temizlendi |
| ~~`contact_phone`~~ | — | *(2026-08-15'te DÜŞÜRÜLDÜ)* aynı gerekçe |
| `theme_preset` | text, not null, default 'kurumsal-mavi', check | *(2026-08-08 eklendi)* `kurumsal-mavi`\|`modern-koyu` — hazır tema ön ayarı (marka rengi/radius/font kombinasyonu), bkz. `TEMA-MIMARISI.md` |
| `cta_title` | text, nullable | *(2026-08-10 eklendi)* Eylem Çağrısı başlığı — boşsa bölüm hiç render edilmez |
| `cta_description` | text, nullable | *(2026-08-10 eklendi)* Eylem Çağrısı kısa açıklama |
| `cta_button_text` | text, nullable | *(2026-08-10 eklendi)* Eylem Çağrısı buton metni |
| `cta_button_link` | text, nullable | *(2026-08-10 eklendi)* Eylem Çağrısı buton linki |
| `facebook_url` | text, nullable | *(2026-08-10 eklendi)* Footer sosyal medya linki |
| `instagram_url` | text, nullable | *(2026-08-10 eklendi)* Footer sosyal medya linki |
| `linkedin_url` | text, nullable | *(2026-08-10 eklendi)* Footer sosyal medya linki |
| `slogan` | text, nullable | *(2026-08-15 eklendi)* Footer'da firma adının altında gösterilir |
| `favicon_path` | text, nullable | *(2026-08-15 eklendi)* Storage (`"branding"` bucket) yolu — boşsa statik `app/favicon.ico` |
| `border_radius_scale` | text, nullable, check | *(2026-08-15 eklendi)* `keskin`\|`dengeli`\|`yuvarlak` — `theme_preset`'ten BAĞIMSIZ köşe yarıçapı override'ı, boşsa preset'in kendi değeri (bkz. `TEMA-MIMARISI.md` madde 5, `lib/theme/radiusScales.ts`) |
| `font_family_key` | text, nullable, check | *(2026-08-15 eklendi)* `geist-sans`\|`manrope`\|`inter`\|`poppins`\|`work-sans` — `theme_preset`'ten BAĞIMSIZ font override'ı, boşsa preset'in kendi değeri (bkz. `TEMA-MIMARISI.md` madde 5, `lib/theme/fonts.ts`) |
| `seo_keywords` | text, nullable | *(2026-08-16 eklendi)* virgülle ayrılmış anahtar kelimeler, `<meta name="keywords">` için — modern arama motorları büyük ölçüde yok sayar, yine de saklanır |
| `og_image_path` | text, nullable | *(2026-08-16 eklendi)* Storage (`"branding"` bucket) yolu — sosyal medya paylaşım görseli (Open Graph), boşsa paylaşımlarda görsel gösterilmez |

### `hero_sections` — Hero (Tekil)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id, **unique** | |
| `title` | text, not null | |
| `subtitle` | text, nullable | |
| `background_image_path` | text, nullable | Storage yolu |
| `cta_text` | text, nullable | |
| `cta_link` | text, nullable | |
| `variant` | text, not null, default 'a', check | *(2026-08-08 eklendi)* `a`\|`b` — görsel varyant (a: tam genişlik arka plan, b: iki kolonlu), bkz. `components/site/hero/` |
| `secondary_cta_text` | text, nullable | *(2026-08-08 eklendi)* ikinci/opsiyonel eylem butonu metni |
| `secondary_cta_link` | text, nullable | *(2026-08-08 eklendi)* ikinci/opsiyonel eylem butonu linki |

### `about_sections` — Hakkımızda (Tekil)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id, **unique** | |
| `title` | text, not null | |
| `description` | text, nullable | |
| `image_path` | text, nullable | Storage yolu |
| `founded_year` | integer, nullable, check (1800-2100) | |
| `core_values` | text[], nullable | *(2026-08-08 eklendi)* kısa değerler listesi (ör. "Kalite", "Şeffaflık") |

Platform sahibi bu tabloyu kullanmaz (anonim kalma kuralı, bkz. `PRD.md`).

### `services` — Hizmetler / Vaat Edilen Özellikler (Liste)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `order_index`, `is_published` | — | ortak, `order_index` burada gerçekten işlevsel |
| `tenant_id` | uuid, not null, → tenants.id | UNIQUE değil |
| `title` | text, not null | |
| `description` | text, nullable | |
| `icon` | text, nullable | Lucide ikon adı (ör. `home`, `hammer`) — bkz. `components/site/services/icons.tsx` |
| `image_path` | text, nullable | *(2026-08-08 eklendi)* Storage yolu — "görselli büyük kart" varyantı için |

### `projects` — Projeler / Portfolyo (Liste)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `order_index`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id | |
| `title` | text, not null | |
| `image_path` | text, nullable | Storage yolu — *(2026-08-14)* `"projects"` bucket'ında, panelden gerçekten yükleniyor (bkz. `GUVENLIK.md` madde 11-12); değer her zaman sunucu tarafında üretilen `${tenant_id}/${uuid}.${uzantı}` biçiminde, elle/panelden serbest metin girilmez |
| `location` | text, nullable | tenant kullanımı |
| `year` | integer, nullable, check (1800-2100) | tenant kullanımı |
| `live_url` | text, nullable | platform sahibi kullanımı — gerçek URL, Storage path değil |
| `category` | text, nullable | *(2026-08-08 eklendi)* serbest metin kategori (ör. "Konut", "Ticari", "Altyapı") — check constraint yok, filtre listesi kodda sabit yazılmıyor, veriden türetiliyor |
| `description` | text, nullable | *(2026-08-08 eklendi)* proje detay penceresinde gösterilen açıklama |

### `contact_sections` — İletişim (Tekil, Statik Bilgi)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id, **unique** | |
| `address` | text, nullable | |
| `phone` | text, nullable | WhatsApp butonu da bu alandan üretilir |
| `email` | text, nullable | |
| `working_hours` | text, nullable | *(2026-08-11 eklendi)* serbest metin çalışma saatleri, İletişim bölümünde form yanında gösteriliyor |
| `weekday_opens` / `weekday_closes` | text, nullable, check `HH:MM` (24 saat) | *(2026-08-17 eklendi)* hafta içi (Pzt-Cuma) yapısal açılış/kapanış — `working_hours`'un YERİNE değil, YANINA: serbest metin görüntüleme için kalıyor, bu ikisi `LocalBusiness` JSON-LD'sinin `openingHoursSpecification`'ı için (serbest metni ayrıştırmak riskli, bkz. `KARAR-GUNLUGU.md`) |
| `weekend_opens` / `weekend_closes` | text, nullable, check `HH:MM` | *(2026-08-17 eklendi)* hafta sonu için TEK çift — Cumartesi ve Pazar aynı saatleri paylaşır (bilinçli basitleştirme, bkz. `SEO-PERFORMANS.md`) |
| `service_areas` | text, nullable | *(2026-08-17 eklendi)* hizmet verilen iller, virgülle ayrılmış serbest metin (ör. "İstanbul, Kocaeli") — JSON-LD `areaServed` için |

**Not — form verisi burada değil:** Bu tablo sadece *statik gösterim*
bilgisini tutar. Ziyaretçinin doldurduğu form `contact_messages`'ta.

### `contact_messages` — İletişim Formu Mesajları

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at` | — | ortak (order_index/is_published yok — mesaj sıralanmaz/yayınlanmaz) |
| `tenant_id` | uuid, not null, → tenants.id | mesaj hangi siteden gönderildi |
| `sender_name` | text, not null | |
| `sender_email` | text, **nullable** | *(2026-08-14 eklendi)* yanıtlamak için — DB seviyesinde nullable ama uygulama katmanında (zod) zorunlu, bkz. `KARAR-GUNLUGU.md` |
| `sender_phone` | text, nullable | *(2026-08-18)* Artık sadece rakam (4-12 hane) — form eskiden serbest metindi (harf/sembol de kabul ediyordu), şimdi `lib/validation/contact.ts`'teki `phoneNumber` alanı sadece rakama izin veriyor. Ülke kodu seçici denendi ama kaldırıldı (native `<select>`'in kapalıyken tam metin göstermesi istenmedi) |
| `subject` | text, **nullable**, CHECK yok | *(2026-08-14 eklendi)* `lib/validation/contact.ts` `CONTACT_SUBJECTS` sabit listesinden biri — DB'de kısıtlanmadı, tek doğruluk kaynağı kod |
| `message` | text, not null | |
| `is_read` | boolean, not null, default false | *(2026-08-12 eklendi)* panelde okundu işaretlendi mi — panel menüsü/özet ekranındaki "okunmamış mesaj" sayısı bu alandan |
| `sender_ip` | inet, nullable | *(2026-08-17 eklendi)* gönderenin IP'si — SADECE sunucu tarafı hız sınırı/spam tespiti için (bkz. `GUVENLIK.md` madde 14), panelde gösterilmiyor, anon'a hiç açılmıyor. IP okunamazsa (ör. yerel geliştirme) `null` — hız sınırı o istekte atlanır |

**Gerçek kayıt artık çalışıyor** *(2026-08-14)* — `components/site/contact/actions.ts`'teki
`submitContactForm`, doğrulama sonrası `contact_messages`'a gerçekten
insert yapıyor (`createServiceRoleClient()` — anon'un bu tabloya HİÇ RLS
izni olmadığı için bilinçli, dokümante edilmiş bir istisna, bkz.
`GUVENLIK.md` madde 2). E-posta bildirimi (SMTP/üçüncü taraf servis) hâlâ
yok — sadece DB kaydı. **Spam koruması** *(2026-08-17)* — gizli tuzak
alanı + `sender_ip` bazlı sunucu tarafı hız sınırı, bkz. `GUVENLIK.md`
madde 14.

### `testimonials` — Referanslar (Liste)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `order_index`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id | |
| `author_name` | text, not null | referans veren kişi/firma adı |
| `author_title` | text, nullable | unvan/pozisyon veya firma bilgisi |
| `quote` | text, not null | yorum metni |
| `rating` | **numeric(2,1)**, nullable, check (1-5) | opsiyonel puan. *(2026-08-19)* `integer`'dan `numeric(2,1)`'e çevrildi (migration `20260819120000_...`) — kart artık kesirli puanı yarım yıldız olarak gösterebiliyor (ör. 4.5 → 4 tam + 1 yarım, bkz. `TestimonialCard.renderRating`). `real`/`float` bilinçli olarak seçilmedi: kayan nokta 4.5'i tam temsil etmeyebilir, `numeric` kesin bir tiptir. **Dikkat:** PostgREST `numeric` değerleri JSON'a **string** olarak döndürebiliyor (`"4.5"`) — okuyan taraf bunu hesaba katmalı (bkz. `parseRating()`, `lib/supabase/queries.ts`) |
| `logo_path` | text, nullable | *(2026-08-08 eklendi)* Storage yolu — müşteri/firma logosu, opsiyonel |

Tablo adı **`testimonials`** — `references` SQL'de ayrılmış (reserved) bir
kelime olduğu için (foreign key tanımlarında kullanılıyor) tablo adı olarak
seçilmedi.

### `faqs` — SSS (Liste)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `order_index`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id | |
| `question` | text, not null | |
| `answer` | text, not null | |

### `team_members` — Ekip Üyeleri (Liste)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `order_index`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id | |
| `full_name` | text, not null | |
| `role` | text, not null | unvan |
| `bio` | text, nullable | kısa biyografi |
| `photo_path` | text, nullable | Storage yolu |

Platform sahibi bu tabloyu kullanmaz (anonim kalma kuralı, bkz. `PRD.md`) —
`about_sections` ile aynı kısıt.

### `stats` — İstatistikler (Liste) *(2026-08-08 eklendi)*

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `order_index`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id | |
| `label` | text, not null | ör. "Tamamlanan Proje" |
| `value` | integer, not null | ham sayısal değer — Türkçe biçimlendirme (`Intl.NumberFormat("tr-TR")`) gerçek bir sayı üzerinden yapılabilsin diye hazır biçimlendirilmiş metin değil, tam sayı |
| `suffix` | text, nullable | ör. "+", "%" |

**Neden ayrı bir tablo, mevcut tablolardan hesaplama değil (kullanıcıya
soruldu, bkz. `KARAR-GUNLUGU.md`):** "Tamamlanan proje" = yayınlanmış
`projects` sayısı, "yıllık deneyim" = `about_sections.founded_year`'dan
hesap gibi seçenekler vardı, ama gerçek kurumsal sitelerde bu rakamlar
genelde pazarlama amaçlı yuvarlak sayılardır (ör. dijitalleşmeden önceki
projeler DB'de yok) — panelden serbestçe girilebilen bir tablo tercih
edildi.

### `page_sections` — Bölüm Sırası/Görünürlüğü/Varyantı (Liste) *(2026-08-10 eklendi)*

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id | |
| `section_key` | text, not null, check | `hero`\|`about`\|`services`\|`projects`\|`testimonials`\|`stats`\|`faq`\|`team`\|`cta`\|`contact` — `lib/sections/config.ts`'teki `SectionKey` union'ıyla birebir eşleşmeli |
| `order_index` | integer, not null, default 0 | bölümler arası sıra |
| `is_visible` | boolean, not null, default true | panelden aç/kapat (Faz 5) |
| `variant` | text, nullable | bölüme özel varyant (ör. hero: `a`/`b`) — doğrulaması burada değil, ilgili bölümün kendi registry'sinde |

**Neden `is_published` değil `is_visible`:** Bu satırlar "içerik" değil,
bir bölümün sayfadaki durumu — `is_published` diğer tablolarda "taslak mı
yayında mı" anlamına geliyor, burada anlamı farklı olduğu için ayrı bir
isim seçildi. `unique (tenant_id, section_key)` — bir tenant'ın aynı
bölümden iki kaydı olamaz.

## SQL Migration

Yirmi migration dosyası var, sırayla:

1. `20260806120000_create_content_tables.sql` — ilk 8 tablo (`tenants`,
   `site_settings`, `hero_sections`, `about_sections`, `services`,
   `projects`, `contact_sections`, `contact_messages`).
2. `20260807120000_add_testimonials_faqs_team_tables.sql` — 3 tablo daha
   (`testimonials`, `faqs`, `team_members`) → toplam 11 tablo.
3. `20260807130000_add_rls_policies.sql` — RLS okuma/yazma politikaları
   (bkz. `GUVENLIK.md`).
4. `20260808120000_add_theme_preset_to_site_settings.sql` —
   `site_settings.theme_preset`.
5. `20260808140000_add_hero_variant_and_secondary_cta.sql` —
   `hero_sections.variant`/`secondary_cta_text`/`secondary_cta_link`.
6. `20260808150000_add_services_image_and_about_values.sql` —
   `services.image_path`, `about_sections.core_values`.
7. `20260808160000_add_projects_category_and_description.sql` —
   `projects.category`/`description` (+ Akme demo verisine backfill).
8. `20260808170000_add_testimonial_logo_and_stats_table.sql` —
   `testimonials.logo_path` + yeni `stats` tablosu (RLS dahil) → toplam
   **12 tablo**.
9. `20260810120000_add_page_sections_and_settings_extensions.sql` — yeni
   `page_sections` tablosu (RLS dahil) + `site_settings`'e Eylem Çağrısı
   (`cta_*`) ve sosyal medya (`facebook_url`/`instagram_url`/
   `linkedin_url`) kolonları + Akme için `page_sections` seed'i/CTA
   içeriği + `team_members` içerik yenileme → toplam **13 tablo**.
10. `20260810130000_add_stats_for_akme.sql` — Akme için örnek istatistikler
    (eskiden sadece platform tenant'ındaydı).
11. `20260810140000_reset_akme_primary_color.sql` — Akme'nin tasarım
    sisteminden önceki yer tutucu `primary_color`'ı `null`'a çekildi.
12. `20260811120000_add_contact_working_hours.sql` —
    `contact_sections.working_hours` + Akme için demo veri.
13. `20260812120000_add_contact_messages_is_read.sql` —
    `contact_messages.is_read` (panel özet ekranı için) + demo veriye
    backfill.
14. `20260813120000_split_team_contact_into_pages.sql` — Akme'nin
    `page_sections`'ından `team`/`contact` satırları silindi (artık ayrı
    sayfa, bkz. `KARAR-GUNLUGU.md`) + `site_settings.cta_button_link`
    `/iletisim`'e güncellendi. Şema değişikliği yok, sadece veri —
    `types:generate` gerekmez.
15. `20260814120000_create_projects_storage_bucket.sql` — tablo şeması
    değil, Supabase **Storage** şeması: `"projects"` bucket'ı (public) +
    `storage.objects` RLS. Detay: `GUVENLIK.md` madde 11.
16. `20260814130000_add_contact_message_email_subject.sql` —
    `contact_messages.sender_email`/`subject` (nullable) + demo veriye
    backfill.
17. `20260815120000_add_theme_settings_and_branding.sql` — `site_settings`e
    `border_radius_scale`/`font_family_key`/`slogan`/`favicon_path` (ilk
    ikisi check constraint'li) eklendi, kullanılmayan `contact_email`/
    `contact_phone` düşürüldü, `"branding"` Storage bucket'ı (RLS dahil)
    kuruldu.
18. `20260816120000_add_seo_keywords_and_og_image.sql` — `site_settings`e
    `seo_keywords`/`og_image_path` (ikisi de nullable) eklendi.
19. `20260817120000_add_working_hours_structured_and_service_areas.sql` —
    `contact_sections`e `weekday_opens`/`weekday_closes`/`weekend_opens`/
    `weekend_closes` (hepsi `HH:MM` check constraint'li) +
    `service_areas` eklendi — `LocalBusiness` JSON-LD'si için, bkz.
    `SEO-PERFORMANS.md`.
20. `20260817130000_add_contact_message_sender_ip.sql` —
    `contact_messages.sender_ip` (inet, nullable) + sorgu indeksi
    (`tenant_id, sender_ip, created_at`) — sunucu tarafı iletişim formu
    hız sınırı için, bkz. `GUVENLIK.md` madde 14.

Migration 1-20 gerçek Supabase projesine uygulandı (20 —
`sender_ip` — 2026-08-17'de uygulandı). Şu an uygulanmayı bekleyen
migration yok.
Her migration'da `create table`/`alter table`, `check`/`unique`
kısıtlamaları, `default` değerleri, `comment on table`/`comment on
column` ve (ilgili olanlarda) `enable row level security` + politikalar
var. Bu dosya güncellenirse ilgili migration da eşlenik olarak
güncellenmeli — sıra bu tabloda korunmalı, her yeni şema değişikliği bu
listeye eklenmeli (silinmez).

## Örnek Veri (Doğrulama)

`supabase/seed.sql` + `20260808160000`/`20260808170000` migration'larının
içindeki `update`/`insert` satırları — 2 müşteri tenant'ı (Akme İnşaat,
Yıldız Yapı) + platform sahibinin kendi tenant satırı (`is_platform_owner
= true`) üzerinden kurulu, toplam **3 tenant**. `tenant_id` UNIQUE olan
tablolarda (site_settings, hero_sections, about_sections, contact_sections)
Akme/Yıldız için 2 satır; platform tenant'ı için `site_settings` +
`stats` (3 örnek istatistik) var, ama **hero/services/projects/
about_sections/testimonials/faqs içeriği hâlâ yok** — bu yüzden geçici
önizleme sayfaları (`app/test-*`) bu bölümler için örnek/mock veriye
düşüyor (bkz. `DURUM.md`). Liste tablolarında `contact_messages` 2 satır
aynı tenant altında; `services` (6, artık kategorize + backfill'li),
`projects` (8, artık kategori/açıklamalı), `testimonials` (4, biri logo
yolu backfill'li), `faqs` (5), `team_members` (4, 2026-08-10'da 3
bilgisayar mühendisi + 1 elektrik mühendisi personasıyla yenilendi) ise
Akme İnşaat için hazırlanmış gerçekçi demo içeriği (bkz. `content/
demo-icerik.md` — team_members kısmı artık bu dosyayla birebir örtüşmüyor,
güncel içerik için migration 9'a bakılmalı) —
`order_index` 10'ar artıyor, her tabloda yaklaşık yarısı
`is_published = true` yarısı `false`.

**Yeni müşteri kurulumu için AYRI bir şablon var** *(2026-08-17
eklendi):* `supabase/setup/seed-template.sql` — yukarıdaki `seed.sql`
ile KARIŞTIRILMAMALI. `seed.sql` bu geliştirme/demo Supabase
projesine özel (Akme İnşaat markalı, sabit UUID'ler); `seed-template.sql`
ise her yeni müşteri kurulumunda `scripts/setup-new-customer.sh`
tarafından `sed` ile doldurulup çalıştırılan, jenerik/markasız,
`on conflict do nothing` ile tekrar-çalıştırılabilir bir şablondur —
`page_sections` seed'ini de (madde 9'daki migration'ın aksine) İÇERİR,
çünkü yeni bir tenant için bu tablo ayrı bir migration'a değil, kurulum
akışının kendisine ait. Detay: `docs/KURULUM.md`.

## Açık Sorular

Şu an aktif açık soru yok. Platform sahibinin gerçek tanıtım sitesi
içeriği (hero/services/about/projects/testimonials/faqs) henüz girilmedi
— panel auth'u kodlanınca bu içeriğin nasıl gireceği netleşecek (bkz.
`DURUM.md` sıradaki adım).
