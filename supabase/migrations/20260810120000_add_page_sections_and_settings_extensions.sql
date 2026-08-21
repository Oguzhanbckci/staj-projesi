-- Bölüm sırası/görünürlüğü/varyantı (page_sections) + site_settings'e
-- Eylem Çağrısı ve sosyal medya kolonları.
-- Karar ve gerekçe: docs/KARAR-GUNLUGU.md, 2026-08-10 ("Bölüm sıralama/
-- görünürlük sistemi ve yeni bölümler eklendi").

-- ============================================================================
-- page_sections — tenant başına, hangi bölümün hangi sırada/görünürlükte/
-- varyantla render edileceğini tutan tek kaynak. Panelden (Faz 5) buradan
-- yönetilecek; şimdilik sadece veri modeli + migration'daki seed var.
-- section_key, lib/sections/config.ts'teki SectionKey union'ıyla birebir
-- eşleşmeli (orada değişirse burada da check constraint güncellenmeli).
-- ============================================================================
create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  tenant_id uuid not null references public.tenants (id) on delete cascade,
  section_key text not null check (
    section_key in (
      'hero', 'about', 'services', 'projects', 'testimonials',
      'stats', 'faq', 'team', 'cta', 'contact'
    )
  ),
  order_index integer not null default 0,
  is_visible boolean not null default true,
  -- Bölüme özel varyant (ör. hero: 'a'/'b', services: 'icon'/'image').
  -- Boş bırakılırsa ilgili bölüm bileşeni kendi varsayılanını kullanır.
  -- Gerçek varyant doğrulaması burada değil, her bölümün kendi registry'sinde
  -- yapılır (bkz. components/site/hero/Hero.tsx) — burada sadece serbest metin.
  variant text,

  unique (tenant_id, section_key)
);

comment on table public.page_sections is
  'Bir tenant sitesindeki bölümlerin sırası, görünürlüğü ve varyantı — panelin (Faz 5) yazacağı tek kaynak.';

alter table public.page_sections enable row level security;

-- Diğer liste tablolarıyla (testimonials/faqs/stats) birebir aynı RLS deseni,
-- is_published yerine is_visible kullanılıyor.
create policy "page_sections_anon_select_visible"
  on public.page_sections for select
  to anon
  using (is_visible = true);

create policy "page_sections_authenticated_select_all"
  on public.page_sections for select
  to authenticated
  using (true);

create policy "page_sections_authenticated_insert"
  on public.page_sections for insert
  to authenticated
  with check (true);

create policy "page_sections_authenticated_update"
  on public.page_sections for update
  to authenticated
  using (true)
  with check (true);

create policy "page_sections_authenticated_delete"
  on public.page_sections for delete
  to authenticated
  using (true);

-- ============================================================================
-- site_settings — Eylem Çağrısı içeriği + sosyal medya linkleri.
-- CTA "ayarlardan gelsin" istendiği için (yönerge), Hero/Hakkımızda gibi ayrı
-- bir tekil tablo yerine bilinçli olarak site_settings'e eklendi.
-- ============================================================================
alter table public.site_settings
  add column cta_title text,
  add column cta_description text,
  add column cta_button_text text,
  add column cta_button_link text,
  add column facebook_url text,
  add column instagram_url text,
  add column linkedin_url text;

comment on column public.site_settings.cta_title is
  'Eylem Çağrısı bölümü başlığı — boşsa bölüm hiç render edilmez.';
comment on column public.site_settings.cta_description is
  'Eylem Çağrısı bölümü kısa açıklama metni, opsiyonel.';
comment on column public.site_settings.cta_button_text is
  'Eylem Çağrısı buton metni (ör. "Teklif Al").';
comment on column public.site_settings.cta_button_link is
  'Eylem Çağrısı buton linki (ör. "#iletisim").';
comment on column public.site_settings.facebook_url is
  'Footer sosyal medya linki, opsiyonel.';
comment on column public.site_settings.instagram_url is
  'Footer sosyal medya linki, opsiyonel.';
comment on column public.site_settings.linkedin_url is
  'Footer sosyal medya linki, opsiyonel.';

-- ============================================================================
-- Akme İnşaat için: bölüm sırası/görünürlüğü seed'i + CTA/sosyal içerik.
-- Sıra: Hero -> Hakkımızda -> Hizmetler -> Projeler -> Referanslar ->
-- İstatistikler -> SSS -> Ekip -> Eylem Çağrısı -> İletişim (bkz.
-- docs/KARAR-GUNLUGU.md gerekçe).
-- ============================================================================
-- Not: bu blok eskiden koşulsuz `insert ... values` idi ve boş bir
-- veritabanında (yeni müşteri kurulumu, `supabase db push`) tenants satırı
-- henüz var olmadığı için foreign key hatasıyla kurulumu ilk adımda
-- durduruyordu. `where exists` ile blok yalnızca ilgili tenant zaten varsa
-- çalışır; yeni kurulumda sessizce atlanır — demo veri zaten yeni müşteride
-- istenmiyor, o içerik supabase/setup/seed-template.sql'den gelir.
insert into public.page_sections (tenant_id, section_key, order_index, is_visible, variant)
select v.tenant_id, v.section_key, v.order_index, v.is_visible, v.variant
from (values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'hero'::text, 10, true, 'a'::text),
  ('11111111-1111-1111-1111-111111111111', 'about', 20, true, null),
  ('11111111-1111-1111-1111-111111111111', 'services', 30, true, 'icon'),
  ('11111111-1111-1111-1111-111111111111', 'projects', 40, true, 'grid'),
  ('11111111-1111-1111-1111-111111111111', 'testimonials', 50, true, 'grid'),
  ('11111111-1111-1111-1111-111111111111', 'stats', 60, true, null),
  ('11111111-1111-1111-1111-111111111111', 'faq', 70, true, 'single'),
  ('11111111-1111-1111-1111-111111111111', 'team', 80, true, null),
  ('11111111-1111-1111-1111-111111111111', 'cta', 90, true, null),
  ('11111111-1111-1111-1111-111111111111', 'contact', 100, true, null)
) as v (tenant_id, section_key, order_index, is_visible, variant)
where exists (select 1 from public.tenants where id = v.tenant_id);

update public.site_settings set
  cta_title = 'Bir Sonraki Projenizi Birlikte İnşa Edelim',
  cta_description = 'İster konut ister ticari yapı olsun, ihtiyaçlarınızı dinleyip size özel bir teklif hazırlayalım.',
  cta_button_text = 'Teklif Al',
  cta_button_link = '#iletisim',
  facebook_url = 'https://facebook.com/akmeinsaat',
  instagram_url = 'https://instagram.com/akmeinsaat',
  linkedin_url = 'https://linkedin.com/company/akmeinsaat'
where tenant_id = '11111111-1111-1111-1111-111111111111';

-- ============================================================================
-- Ekip Üyeleri içeriği yenilendi (yönerge: 4 kişi, 3 bilgisayar mühendisi +
-- 1 elektrik mühendisi). Eski 4 satır (Genel Müdür/Tasarım Direktörü/Proje
-- Yöneticisi/Saha Şefi) silinip yeni personayla değiştirildi — inşaat
-- firmasında bu rollerin gerekçesi: şirket içi saha takip/raporlama
-- yazılımları (bilgisayar müh.) ve elektrik tesisat/enerji verimliliği
-- tasarımı (elektrik müh.). photo_path diğer tüm görseller gibi henüz
-- Storage'a yüklenmemiş bir yer tutucu yol (bkz. docs/DURUM.md, Lighthouse
-- notu "Storage'da henüz hiç gerçek görsel yok").
delete from public.team_members where tenant_id = '11111111-1111-1111-1111-111111111111';

insert into public.team_members (tenant_id, full_name, role, bio, photo_path, order_index, is_published)
select v.tenant_id, v.full_name, v.role, v.bio, v.photo_path, v.order_index, v.is_published
from (values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Zeynep Aksoy', 'Bilgisayar Mühendisi · Dijital Sistemler', 'Şantiye ilerleme takibini ve iç proje yönetim yazılımını geliştirip ekiplerin sahadan gelen veriyi anlık görebilmesini sağlıyor.', 'team/zeynep-aksoy.jpg', 10, true),
  ('11111111-1111-1111-1111-111111111111', 'Caner Yıldırım', 'Bilgisayar Mühendisi · Yazılım Geliştirme', 'Müşteri portalı ve iç raporlama sistemlerinin yazılım altyapısını kuruyor, panel ve saha ekipleri arasındaki veri akışını tasarlıyor.', 'team/caner-yildirim.jpg', 20, true),
  ('11111111-1111-1111-1111-111111111111', 'Deniz Koç', 'Bilgisayar Mühendisi · Veri ve Otomasyon', 'Şantiye verilerinin toplanmasını ve raporlanmasını otomatikleştiren araçlar geliştirerek proje yöneticilerinin karar sürecini hızlandırıyor.', 'team/deniz-koc.jpg', 30, true),
  ('11111111-1111-1111-1111-111111111111', 'Emre Polat', 'Elektrik Mühendisi', 'Projelerin elektrik tesisat tasarımını ve enerji verimliliği planlamasını yürütüyor, uygulamayı sahada denetliyor.', 'team/emre-polat.jpg', 40, true)
) as v (tenant_id, full_name, role, bio, photo_path, order_index, is_published)
where exists (select 1 from public.tenants where id = v.tenant_id);
