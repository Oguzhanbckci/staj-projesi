-- Yeni bölümler: Referanslar, SSS, Ekip Üyeleri.
-- Karar ve gerekçe: docs/KARAR-GUNLUGU.md, 2026-08-07 ("Referanslar/SSS/Ekip
-- Üyeleri yeni bölüm olarak eklendi"). İlk migration
-- (20260806120000_create_content_tables.sql) zaten gerçek veritabanına
-- uygulanmıştı, bu yüzden üstüne yazılmadı — ayrı bir migration.
--
-- Aynı konvansiyon: id/created_at ortak, order_index (sıralanabilir liste) +
-- is_published (yayın kontrolü) üçünde de var, tenant_id → tenants.id,
-- on delete cascade. Detay ve gerekçe: docs/VERİ-MODELİ.md.
--
-- Tablo adı "testimonials" (Referanslar) — "references" SQL'de ayrılmış
-- (reserved) bir kelime olduğu için seçilmedi.

-- ============================================================================
-- testimonials — Referanslar/müşteri yorumları (Liste).
-- ============================================================================
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_index integer not null default 0,
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  author_name text not null,
  author_title text,
  quote text not null,
  rating integer,

  constraint testimonials_rating_check check (rating is null or rating between 1 and 5)
);

comment on table public.testimonials is
  'Müşteri referansları/yorumları. Sıralanabilir liste, yayın kontrolü var.';

create index testimonials_tenant_id_idx on public.testimonials (tenant_id);

alter table public.testimonials enable row level security;

-- ============================================================================
-- faqs — Sıkça Sorulan Sorular (Liste).
-- ============================================================================
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_index integer not null default 0,
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  question text not null,
  answer text not null
);

comment on table public.faqs is
  'Sıkça Sorulan Sorular. Sıralanabilir liste, yayın kontrolü var.';

create index faqs_tenant_id_idx on public.faqs (tenant_id);

alter table public.faqs enable row level security;

-- ============================================================================
-- team_members — Ekip Üyeleri (Liste). Platform sahibi bu tabloyu kullanmaz
-- (anonim kalma kuralı, bkz. docs/PRD.md — about_sections ile aynı kısıt).
-- ============================================================================
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_index integer not null default 0,
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  full_name text not null,
  role text not null,
  bio text,
  photo_path text
);

comment on table public.team_members is
  'Ekip üyeleri. Sıralanabilir liste, yayın kontrolü var. Platform sahibi kullanmaz (anonim kalma kuralı).';

create index team_members_tenant_id_idx on public.team_members (tenant_id);

alter table public.team_members enable row level security;
