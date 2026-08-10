# Veri Modeli

Bu dosya, Supabase (Postgres) veritabanındaki her tabloyu, alanlarını ve
**neden** öyle tasarlandığını anlatır. `PRD.md` madde 3.4'teki içerik
modelinin (hangi bölüm hangi veri alanlarını tutar) somut tablo tasarımıdır.
Kod içermez — gerçek çalışır SQL
`supabase/migrations/20260806120000_create_content_tables.sql`'de. Şema
değişirse önce `KARAR-GUNLUGU.md`'ye tarihli bir kayıt düşülür, sonra hem bu
dosya hem migration güncellenir.

**Son güncelleme:** 2026-08-08

**Durum:** Tablolar + kolonlar + kısıtlamalar tasarlandı ve SQL'e döküldü.
2026-08-06'da dışarıdan gelen bir yönergeyle (BAĞLAM/İSTEK/KISITLAR/KABUL
KRİTERİ formatında) karşılaştırılıp üç noktada revize edildi (aşağıda
"Yönergeyle Karşılaştırma" bölümünde). **RLS her tabloda açık VE
okuma/yazma politikaları da yazılıp gerçek veriyle test edildi** (bkz.
`GUVENLIK.md`, `KARAR-GUNLUGU.md` 2026-08-07). Toplam **13 tablo** (12'si
gerçek Supabase projesine uygulandı; `page_sections`, 2026-08-10'da
eklendi, **henüz uygulanmadı** — bkz. madde "SQL Migration").
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
| `logo_path` | text, nullable | Storage'daki logo dosya yolu |
| `primary_color` | text, nullable | marka ana rengi |
| `secondary_color` | text, nullable | marka ikincil rengi |
| `seo_title` | text, nullable | varsayılan sayfa başlığı |
| `seo_description` | text, nullable | varsayılan meta açıklama |
| `contact_email` | text, nullable | üstbilgi/altbilgi/SEO gösterim amaçlı |
| `contact_phone` | text, nullable | üstbilgi/altbilgi/SEO gösterim amaçlı |
| `theme_preset` | text, not null, default 'kurumsal-mavi', check | *(2026-08-08 eklendi)* `kurumsal-mavi`\|`modern-koyu` — hazır tema ön ayarı (marka rengi/radius/font kombinasyonu), bkz. `TEMA-MIMARISI.md` |
| `cta_title` | text, nullable | *(2026-08-10 eklendi)* Eylem Çağrısı başlığı — boşsa bölüm hiç render edilmez |
| `cta_description` | text, nullable | *(2026-08-10 eklendi)* Eylem Çağrısı kısa açıklama |
| `cta_button_text` | text, nullable | *(2026-08-10 eklendi)* Eylem Çağrısı buton metni |
| `cta_button_link` | text, nullable | *(2026-08-10 eklendi)* Eylem Çağrısı buton linki |
| `facebook_url` | text, nullable | *(2026-08-10 eklendi)* Footer sosyal medya linki |
| `instagram_url` | text, nullable | *(2026-08-10 eklendi)* Footer sosyal medya linki |
| `linkedin_url` | text, nullable | *(2026-08-10 eklendi)* Footer sosyal medya linki |

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
| `image_path` | text, nullable | Storage yolu |
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

**Not — form verisi burada değil:** Bu tablo sadece *statik gösterim*
bilgisini tutar. Ziyaretçinin doldurduğu form `contact_messages`'ta.

### `contact_messages` — İletişim Formu Mesajları

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at` | — | ortak (order_index/is_published yok — mesaj sıralanmaz/yayınlanmaz) |
| `tenant_id` | uuid, not null, → tenants.id | mesaj hangi siteden gönderildi |
| `sender_name` | text, not null | |
| `sender_phone` | text, nullable | |
| `message` | text, not null | |

E-posta gönderimi başarısız olsa bile mesaj kaybolmasın diye DB'ye de
kaydediliyor (bkz. `KARAR-GUNLUGU.md`, 2026-08-06).

### `testimonials` — Referanslar (Liste)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `order_index`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id | |
| `author_name` | text, not null | referans veren kişi/firma adı |
| `author_title` | text, nullable | unvan/pozisyon veya firma bilgisi |
| `quote` | text, not null | yorum metni |
| `rating` | integer, nullable, check (1-5) | opsiyonel puan |
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

Altı migration dosyası var, sırayla:

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
   **Henüz gerçek Supabase projesine uygulanmadı.**

Migration 1-8 gerçek Supabase projesine uygulandı (2026-08-08 itibarıyla).
Her migration'da `create table`/`alter table`, `check`/`unique`
kısıtlamaları, `default` değerleri, `comment on table`/`comment on
column` ve (4-9 için) ilgili `enable row level security` + politikalar
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

## Açık Sorular

Şu an aktif açık soru yok. Platform sahibinin gerçek tanıtım sitesi
içeriği (hero/services/about/projects/testimonials/faqs) henüz girilmedi
— panel auth'u kodlanınca bu içeriğin nasıl gireceği netleşecek (bkz.
`DURUM.md` sıradaki adım).
