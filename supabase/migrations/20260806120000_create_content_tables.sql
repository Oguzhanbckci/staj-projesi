-- Şema kaynağı: docs/VERİ-MODELİ.md
-- 8 tablo: tenants (kimlik/operasyon) + site_settings (logo/renk/SEO/iletişim,
-- tenant başına tek satır) + 5 içerik tablosu (tenant_id ile tenants'a bağlı;
-- platform sahibi de tenants.is_platform_owner = true olan satırla aynı
-- tabloları paylaşır) + contact_messages.
--
-- order_index: yalnızca gerçekten sıralanabilir liste içeriklerde (services,
-- projects) — tekil bölümlerde veya ayar tablolarında yok.
-- is_published: yayın kontrolü gereken içerik tablolarında ve tenants'ta
-- ("site yayında mı") — ayar tablosunda (site_settings) ve mesajlarda yok.
--
-- Görseller Supabase Storage'da tutulur; tablolarda yalnızca dosya yolu
-- (*_path, text) saklanır — tam URL değil.
--
-- RLS her tabloda açılıyor (AI-KURALLARI.md madde 6.1); gerçek politikalar
-- (kim okuyabilir/yazabilir) panel auth'u kodlanınca ayrı bir migration'da
-- eklenecek — şimdilik hiçbir policy yok, yani RLS açıkken service role
-- dışında hiçbir istemci hiçbir satıra erişemez (fail-closed, güvenli varsayılan).

create extension if not exists "pgcrypto";

-- ============================================================================
-- tenants — kimlik/operasyon bilgisi. Platform sahibi de burada,
-- is_platform_owner = true olan tek satırla temsil edilir.
-- ============================================================================
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  is_published boolean not null default false,

  name text not null,
  domain text not null,
  is_platform_owner boolean not null default false,
  theme_mode text not null default 'light',
  contact_recipient_email text,

  constraint tenants_domain_key unique (domain),
  constraint tenants_theme_mode_check check (theme_mode in ('light', 'dark'))
);

comment on table public.tenants is
  'Her satır bir tenant (müşteri) veya platform sahibinin kendi sitesi (is_platform_owner = true). is_published: tenant''ın sitesi yayında mı.';

-- is_platform_owner = true olan en fazla bir satır olabilir.
create unique index tenants_single_platform_owner_idx
  on public.tenants (is_platform_owner)
  where is_platform_owner = true;

alter table public.tenants enable row level security;

-- ============================================================================
-- site_settings — logo, renkler, SEO, iletişim bilgileri. Tenant başına tek
-- satır (tenant_id UNIQUE) — "tek satırlık ayar tablosu" gereksinimi, çok
-- kiracılı mimaride her tenant için tek satır olarak karşılanıyor.
-- ============================================================================
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  logo_path text,
  primary_color text,
  secondary_color text,
  seo_title text,
  seo_description text,
  contact_email text,
  contact_phone text,

  constraint site_settings_tenant_id_key unique (tenant_id)
);

comment on table public.site_settings is
  'Site geneli ayarlar: logo, marka renkleri, SEO başlık/açıklama, üstbilgi/altbilgi iletişim bilgisi. Tenant başına tek satır.';

alter table public.site_settings enable row level security;

-- ============================================================================
-- hero_sections — tekil (tenant başına en fazla bir satır).
-- ============================================================================
create table public.hero_sections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  title text not null,
  subtitle text,
  background_image_path text,
  cta_text text,
  cta_link text,

  constraint hero_sections_tenant_id_key unique (tenant_id)
);

comment on table public.hero_sections is
  'Ana sayfa Hero (banner) bölümü. Tenant başına tek satır.';

alter table public.hero_sections enable row level security;

-- ============================================================================
-- about_sections — tekil. Platform sahibi bu tabloyu kullanmaz (anonim kalma
-- kuralı, bkz. PRD.md).
-- ============================================================================
create table public.about_sections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  title text not null,
  description text,
  image_path text,
  founded_year integer,

  constraint about_sections_tenant_id_key unique (tenant_id),
  constraint about_sections_founded_year_check
    check (founded_year is null or founded_year between 1800 and 2100)
);

comment on table public.about_sections is
  'Hakkımızda bölümü. Tenant başına tek satır; platform sahibi kullanmaz.';

alter table public.about_sections enable row level security;

-- ============================================================================
-- services — liste (Hizmetler / Vaat edilen özellikler ortak).
-- ============================================================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_index integer not null default 0,
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  title text not null,
  description text,
  icon text
);

comment on table public.services is
  'Hizmetler (tenant) veya vaat edilen özellikler (platform sahibi) — sıralanabilir liste.';

create index services_tenant_id_idx on public.services (tenant_id);

alter table public.services enable row level security;

-- ============================================================================
-- projects — liste (Projeler / Portfolyo ortak). location/year tenant
-- kullanımı için, live_url platform sahibinin kendi portfolyosu için.
-- ============================================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_index integer not null default 0,
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  title text not null,
  image_path text,
  location text,
  year integer,
  live_url text,

  constraint projects_year_check check (year is null or year between 1800 and 2100)
);

comment on table public.projects is
  'Projeler (tenant) veya portfolyo (platform sahibi) — sıralanabilir liste.';

create index projects_tenant_id_idx on public.projects (tenant_id);

alter table public.projects enable row level security;

-- ============================================================================
-- contact_sections — tekil, statik gösterim bilgisi. WhatsApp butonu aynı
-- `phone` alanından üretilir, ayrı bir kolon yok.
-- ============================================================================
create table public.contact_sections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  address text,
  phone text,
  email text,

  constraint contact_sections_tenant_id_key unique (tenant_id)
);

comment on table public.contact_sections is
  'İletişim bölümü: statik adres/telefon/e-posta gösterimi. Tenant başına tek satır.';

alter table public.contact_sections enable row level security;

-- ============================================================================
-- contact_messages — ziyaretçilerin gönderdiği iletişim formu mesajları.
-- E-posta gönderimi başarısız olursa mesaj kaybolmasın diye burada da saklanır.
-- Sıralama/yayın kavramı uygulanmaz (order_index, is_published yok).
-- ============================================================================
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  sender_name text not null,
  sender_phone text,
  message text not null
);

comment on table public.contact_messages is
  'Ziyaretçilerin iletişim formundan gönderdiği mesajlar (e-postaya ek olarak burada da saklanır).';

create index contact_messages_tenant_id_idx on public.contact_messages (tenant_id);

alter table public.contact_messages enable row level security;
