# Veri Modeli

Bu dosya, Supabase (Postgres) veritabanındaki her tabloyu, alanlarını ve
**neden** öyle tasarlandığını anlatır. `PRD.md` madde 3.4'teki içerik
modelinin (hangi bölüm hangi veri alanlarını tutar) somut tablo tasarımıdır.
Kod içermez — gerçek çalışır SQL
`supabase/migrations/20260806120000_create_content_tables.sql`'de. Şema
değişirse önce `KARAR-GUNLUGU.md`'ye tarihli bir kayıt düşülür, sonra hem bu
dosya hem migration güncellenir.

**Son güncelleme:** 2026-08-07

**Durum:** Tablolar + kolonlar + kısıtlamalar tasarlandı ve SQL'e döküldü.
2026-08-06'da dışarıdan gelen bir yönergeyle (BAĞLAM/İSTEK/KISITLAR/KABUL
KRİTERİ formatında) karşılaştırılıp üç noktada revize edildi (aşağıda
"Yönergeyle Karşılaştırma" bölümünde). RLS her tabloda açık ama policy'ler
henüz yazılmadı. **İlk 8 tablo 2026-08-07'de gerçek Supabase projesine
uygulandı** (bkz. `KARAR-GUNLUGU.md`, "İlk migration gerçek Supabase
projesine uygulandı"). Aynı gün, demo içerik ihtiyacıyla **3 yeni tablo**
(`testimonials`, `faqs`, `team_members`) eklendi — toplam **11 tablo**; bu
üçü ayrı bir migration'da (`20260807120000_add_testimonials_faqs_team_tables.sql`)
yazıldı, henüz gerçek projeye uygulanmadı (bkz. `docs/DURUM.md`).

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

### `about_sections` — Hakkımızda (Tekil)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `is_published` | — | ortak |
| `tenant_id` | uuid, not null, → tenants.id, **unique** | |
| `title` | text, not null | |
| `description` | text, nullable | |
| `image_path` | text, nullable | Storage yolu |
| `founded_year` | integer, nullable, check (1800-2100) | |

Platform sahibi bu tabloyu kullanmaz (anonim kalma kuralı, bkz. `PRD.md`).

### `services` — Hizmetler / Vaat Edilen Özellikler (Liste)

| Kolon | Tip | Açıklama |
|---|---|---|
| `id`, `created_at`, `order_index`, `is_published` | — | ortak, `order_index` burada gerçekten işlevsel |
| `tenant_id` | uuid, not null, → tenants.id | UNIQUE değil |
| `title` | text, not null | |
| `description` | text, nullable | |
| `icon` | text, nullable | |

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

## SQL Migration

İki migration dosyası var:

1. `supabase/migrations/20260806120000_create_content_tables.sql` — ilk 8
   tablo (`tenants`, `site_settings`, `hero_sections`, `about_sections`,
   `services`, `projects`, `contact_sections`, `contact_messages`). **Gerçek
   Supabase projesine uygulandı** (2026-08-07).
2. `supabase/migrations/20260807120000_add_testimonials_faqs_team_tables.sql`
   — sonradan eklenen 3 tablo (`testimonials`, `faqs`, `team_members`).
   Henüz gerçek projeye uygulanmadı.

Her ikisinde de `create table`, `check`/`unique` kısıtlamaları, `default`
değerleri, her tabloya `comment on table` ve `enable row level security`
satırları var. Bu dosya güncellenirse ilgili migration da eşlenik olarak
güncellenmeli.

## Örnek Veri (Doğrulama)

`supabase/seed.sql` — 2 tenant (Akme İnşaat, Yıldız Yapı) üzerinden kurulu.
`tenant_id` UNIQUE olan tablolarda (site_settings, hero_sections,
about_sections, contact_sections) 2 satır = 2 farklı tenant. Liste
tablolarında `contact_messages` 2 satır aynı tenant altında; `services` (6),
`projects` (8), `testimonials` (4), `faqs` (5), `team_members` (4) ise
Akme İnşaat için hazırlanmış gerçekçi demo içeriği (bkz.
`content/demo-icerik.md`) — `order_index` 10'ar artıyor, her tabloda yaklaşık
yarısı `is_published = true` yarısı `false`.

## Açık Sorular

Şu an aktif açık soru yok. RLS policy metinleri, panel auth'u kodlanınca ayrı
bir migration'da yazılacak (bkz. `docs/DURUM.md` sıradaki adım).
