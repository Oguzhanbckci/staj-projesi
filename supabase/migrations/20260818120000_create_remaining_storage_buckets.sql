-- Kalan 5 icerik gorseli icin Storage bucket'lari + RLS: services, hero,
-- about, testimonials, team. 20260814120000_create_projects_storage_bucket.sql
-- ile BIREBIR ayni desen (herkese acik/public=true, 5-policy). Bucket
-- adlari lib/supabase/storage.ts cagrilarindaki (ServiceCardImage,
-- HeroVariantA/B, AboutSection, TestimonialCard, TeamMemberCard) sabit
-- string'lerle birebir eslesmeli.
--
-- "drop policy if exists" + "on conflict do nothing" ile bastan sona
-- YENIDEN CALISTIRILABILIR (idempotent) yazildi -- SQL Editor'de kismi
-- bir calisma/cift tiklama sonrasi guvenle tekrar calistirilabilir.
insert into storage.buckets (id, name, public)
values
  ('services', 'services', true),
  ('hero', 'hero', true),
  ('about', 'about', true),
  ('testimonials', 'testimonials', true),
  ('team', 'team', true)
on conflict (id) do nothing;

drop policy if exists "services_bucket_anon_select" on storage.objects;
create policy "services_bucket_anon_select"
  on storage.objects for select
  to anon
  using (bucket_id = 'services');

drop policy if exists "services_bucket_authenticated_select" on storage.objects;
create policy "services_bucket_authenticated_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'services');

drop policy if exists "services_bucket_authenticated_insert" on storage.objects;
create policy "services_bucket_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'services');

drop policy if exists "services_bucket_authenticated_update" on storage.objects;
create policy "services_bucket_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'services')
  with check (bucket_id = 'services');

drop policy if exists "services_bucket_authenticated_delete" on storage.objects;
create policy "services_bucket_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'services');

drop policy if exists "hero_bucket_anon_select" on storage.objects;
create policy "hero_bucket_anon_select"
  on storage.objects for select
  to anon
  using (bucket_id = 'hero');

drop policy if exists "hero_bucket_authenticated_select" on storage.objects;
create policy "hero_bucket_authenticated_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'hero');

drop policy if exists "hero_bucket_authenticated_insert" on storage.objects;
create policy "hero_bucket_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'hero');

drop policy if exists "hero_bucket_authenticated_update" on storage.objects;
create policy "hero_bucket_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'hero')
  with check (bucket_id = 'hero');

drop policy if exists "hero_bucket_authenticated_delete" on storage.objects;
create policy "hero_bucket_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'hero');

drop policy if exists "about_bucket_anon_select" on storage.objects;
create policy "about_bucket_anon_select"
  on storage.objects for select
  to anon
  using (bucket_id = 'about');

drop policy if exists "about_bucket_authenticated_select" on storage.objects;
create policy "about_bucket_authenticated_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'about');

drop policy if exists "about_bucket_authenticated_insert" on storage.objects;
create policy "about_bucket_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'about');

drop policy if exists "about_bucket_authenticated_update" on storage.objects;
create policy "about_bucket_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'about')
  with check (bucket_id = 'about');

drop policy if exists "about_bucket_authenticated_delete" on storage.objects;
create policy "about_bucket_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'about');

drop policy if exists "testimonials_bucket_anon_select" on storage.objects;
create policy "testimonials_bucket_anon_select"
  on storage.objects for select
  to anon
  using (bucket_id = 'testimonials');

drop policy if exists "testimonials_bucket_authenticated_select" on storage.objects;
create policy "testimonials_bucket_authenticated_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'testimonials');

drop policy if exists "testimonials_bucket_authenticated_insert" on storage.objects;
create policy "testimonials_bucket_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'testimonials');

drop policy if exists "testimonials_bucket_authenticated_update" on storage.objects;
create policy "testimonials_bucket_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'testimonials')
  with check (bucket_id = 'testimonials');

drop policy if exists "testimonials_bucket_authenticated_delete" on storage.objects;
create policy "testimonials_bucket_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'testimonials');

drop policy if exists "team_bucket_anon_select" on storage.objects;
create policy "team_bucket_anon_select"
  on storage.objects for select
  to anon
  using (bucket_id = 'team');

drop policy if exists "team_bucket_authenticated_select" on storage.objects;
create policy "team_bucket_authenticated_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'team');

drop policy if exists "team_bucket_authenticated_insert" on storage.objects;
create policy "team_bucket_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'team');

drop policy if exists "team_bucket_authenticated_update" on storage.objects;
create policy "team_bucket_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'team')
  with check (bucket_id = 'team');

drop policy if exists "team_bucket_authenticated_delete" on storage.objects;
create policy "team_bucket_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'team');
