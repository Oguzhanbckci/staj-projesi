-- Projeler icin gorsel yukleme: "projects" Storage bucket'i + RLS.
-- Herkese acik (public=true) -- getPublicImageUrl() zaten
-- /storage/v1/object/public/... yolunu varsayiyor (bkz.
-- lib/supabase/storage.ts, components/site/projects/ProjectCard.tsx).
-- Bucket public olsa da .upload()/.remove() gibi SDK cagrilari YINE DE
-- storage.objects RLS'inden gecer -- bu yuzden yazma politikalari
-- kritik (KISITLAR: "yukleme yalniz giris yapmis kullaniciya acik").
insert into storage.buckets (id, name, public)
values ('projects', 'projects', true)
on conflict (id) do nothing;

-- Projedeki yerlesik 5-policy deseniyle (anon select + authenticated
-- select-all/insert/update/delete, bkz. 20260807130000_add_rls_policies.sql)
-- birebir ayni ilke, storage.objects'e bucket_id filtresiyle uygulandi.
create policy "projects_bucket_anon_select"
  on storage.objects for select
  to anon
  using (bucket_id = 'projects');

create policy "projects_bucket_authenticated_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'projects');

create policy "projects_bucket_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'projects');

create policy "projects_bucket_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'projects')
  with check (bucket_id = 'projects');

create policy "projects_bucket_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'projects');
