-- Referans kartında "varsa logo" için Storage yolu.
alter table public.testimonials
  add column logo_path text;

comment on column public.testimonials.logo_path is
  'Storage yolu - musteri/firma logosu, opsiyonel.';

-- İstatistikler bölümü (ör. "50+ Tamamlanan Proje"). value tam sayı
-- (Türkçe biçimde göstermek için — bkz. components/site/stats/), suffix
-- "+"/"%"/"yıl" gibi serbest bir ek. Panelden serbestçe girilir; bu
-- yüzden mevcut tablolardan (projects/testimonials sayısı vb.) otomatik
-- hesaplanmıyor — gerçek dünyada bu rakamlar genelde pazarlama amaçlı
-- yuvarlak sayılardır, DB'deki gerçek kayıt sayısıyla birebir örtüşmesi
-- gerekmez (ör. dijitalleşmeden önceki projeler).
create table public.stats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_index integer not null default 0,
  is_published boolean not null default false,

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  label text not null,
  value integer not null,
  suffix text
);

comment on table public.stats is
  'İstatistik/rakam bölümü (ör. "50+ Tamamlanan Proje"). Sıralanabilir liste, yayın kontrolü var.';

alter table public.stats enable row level security;

-- ============================================================================
-- stats — diğer liste tablolarıyla (testimonials/faqs) birebir aynı RLS deseni
-- ============================================================================
create policy "stats_anon_select_published"
  on public.stats for select
  to anon
  using (is_published = true);

create policy "stats_authenticated_select_all"
  on public.stats for select
  to authenticated
  using (true);

create policy "stats_authenticated_insert"
  on public.stats for insert
  to authenticated
  with check (true);

create policy "stats_authenticated_update"
  on public.stats for update
  to authenticated
  using (true)
  with check (true);

create policy "stats_authenticated_delete"
  on public.stats for delete
  to authenticated
  using (true);

-- Demo verideki 4 Akme referansına logo yolu backfill (opsiyonel alan
-- test edilebilsin diye — yer tutucu path, gerçek dosya henüz Storage'da
-- değil, bkz. docs/DURUM.md).
update public.testimonials set logo_path = 'testimonials/kaya-holding.png'
  where author_name = 'Kaya Holding A.Ş.';

-- Platform sahibi için örnek istatistikler (diğer bölümlerdeki gibi
-- test edilebilsin diye).
-- Not: bu blok eskiden koşulsuz `insert ... values` idi ve boş bir
-- veritabanında (yeni müşteri kurulumu, `supabase db push`) tenants satırı
-- henüz var olmadığı için foreign key hatasıyla kurulumu ilk adımda
-- durduruyordu. `where exists` ile blok yalnızca ilgili tenant zaten varsa
-- çalışır; yeni kurulumda sessizce atlanır — demo veri zaten yeni müşteride
-- istenmiyor, o içerik supabase/setup/seed-template.sql'den gelir.
insert into public.stats (tenant_id, label, value, suffix, order_index, is_published)
select v.tenant_id, v.label, v.value, v.suffix, v.order_index, v.is_published
from (values
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Tamamlanan Proje', 50, '+'::text, 10, true),
  ('33333333-3333-3333-3333-333333333333', 'Yıllık Deneyim', 12, '+', 20, true),
  ('33333333-3333-3333-3333-333333333333', 'Mutlu Müşteri', 1200, '+', 30, true)
) as v (tenant_id, label, value, suffix, order_index, is_published)
where exists (select 1 from public.tenants where id = v.tenant_id);
