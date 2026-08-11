-- Tema Ayarları ekranı: marka/ikincil renk artık panelden düzenlenebilir,
-- hazır köşe yarıçapı ölçeği + font ailesi override kolonları, site kimliği
-- (slogan, favicon), "branding" Storage bucket'ı, ve hiç kullanılmayan
-- contact_email/contact_phone kolonlarının temizliği.
-- Karar ve gerekçe: docs/KARAR-GUNLUGU.md, 2026-08-15.

-- ============================================================================
-- site_settings — primary_color'la AYNI ilke: nullable, preset'in
-- varsayılanını ezer (bkz. lib/theme/resolve.ts).
-- ============================================================================
alter table public.site_settings
  add column border_radius_scale text,
  add column font_family_key text,
  add column slogan text,
  add column favicon_path text;

alter table public.site_settings
  add constraint site_settings_border_radius_scale_check
  check (border_radius_scale in ('keskin', 'dengeli', 'yuvarlak'));

alter table public.site_settings
  add constraint site_settings_font_family_key_check
  check (font_family_key in ('geist-sans', 'manrope', 'inter', 'poppins', 'work-sans'));

comment on column public.site_settings.border_radius_scale is
  'Panelden seçilen hazır köşe yarıçapı ölçeği (keskin|dengeli|yuvarlak) — null ise theme_preset''in kendi radius''u kullanılır. Değerler lib/theme/radiusScales.ts içinde.';
comment on column public.site_settings.font_family_key is
  'Panelden seçilen font ailesi — null ise theme_preset''in kendi fontu kullanılır. Değerler lib/theme/fonts.ts + app/layout.tsx içinde (next/font/google, build-time yüklü).';
comment on column public.site_settings.slogan is
  'Firma sloganı — Footer''da firma adının altında gösterilir, opsiyonel.';
comment on column public.site_settings.favicon_path is
  'Storage (branding bucket) içindeki favicon dosya yolu — boşsa statik app/favicon.ico kullanılır.';
comment on column public.site_settings.secondary_color is
  'İkincil (accent) renk — --color-accent/--color-accent-on token çiftini besler. Boşsa CTA''daki "accent" buton app/globals.css''teki nötr varsayılanı (surface-raised/text) kullanır.';

-- ============================================================================
-- Hiçbir yerde okunmayan (dead) kolonlar kaldırıldı — gösterim amaçlı
-- iletişim bilgisi zaten contact_sections'ta (Footer/İletişim sayfası
-- ORADAN okuyor, bkz. lib/supabase/queries.ts getContactSection). Bu iki
-- kolon 2026-08-06'dan beri hiç yazılmadı/okunmadı (grep ile doğrulandı).
-- ============================================================================
alter table public.site_settings
  drop column contact_email,
  drop column contact_phone;

-- ============================================================================
-- "branding" Storage bucket — logo + favicon. "projects" bucket'ının
-- birebir aynı 5-policy deseni (bkz. 20260814120000_create_projects_storage_bucket.sql).
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

create policy "branding_bucket_anon_select"
  on storage.objects for select
  to anon
  using (bucket_id = 'branding');

create policy "branding_bucket_authenticated_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'branding');

create policy "branding_bucket_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'branding');

create policy "branding_bucket_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'branding')
  with check (bucket_id = 'branding');

create policy "branding_bucket_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'branding');
