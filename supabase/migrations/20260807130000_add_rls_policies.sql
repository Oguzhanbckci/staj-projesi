-- RLS okuma/yazma politikaları — istisnasız her tabloda.
-- Karar ve gerekçe: docs/KARAR-GUNLUGU.md, 2026-08-07 ("RLS okuma/yazma
-- politikaları eklendi").
--
-- OKUMA (SELECT):
--   - anon (kimliği doğrulanmamış ziyaretçi): sadece is_published = true olan
--     satırlar. Kendi is_published kolonu olmayan site_settings'te, bağlı
--     olduğu tenant'ın is_published durumuna bakılır (aşağıda ayrıca açıklandı).
--   - authenticated (= platform sahibi, tek kullanıcı — bkz. AI-KURALLARI.md
--     madde 6.3): taslak dahil TÜM satırlar (panelde düzenleyebilmesi için).
--   - contact_messages İSTİSNASI: is_published kavramı yok, ziyaretçi kişisel
--     verisi (ad, telefon, mesaj) içeriyor — anon için HİÇBİR select policy
--     tanımlanmadı, sadece authenticated okuyabilir.
--
-- YAZMA (INSERT/UPDATE/DELETE):
--   - Sadece authenticated. anon için hiçbir yazma policy'si YOK — RLS açıkken
--     policy'si olmayan komut varsayılan olarak reddedilir, yani anon hiçbir
--     tabloda hiçbir koşulda insert/update/delete yapamaz.
--   - contact_messages İSTİSNASI: iletişim formunu dolduran ziyaretçi anonim
--     olsa da mesaj kaydedilebilmeli — ama bu RLS/anon key üzerinden DEĞİL,
--     ileride yazılacak app/api/contact/ Route Handler'ı üzerinden olacak:
--     sunucu tarafında girdi doğrulanır, ardından service role client (RLS'i
--     bypass eder) satırı ekler. Bu, "anon hiçbir koşulda yazamaz" kuralını
--     bozmaz — service role, anon key'den tamamen ayrı bir güven seviyesi
--     (bkz. AI-KURALLARI.md madde 6.1/6.5).
--
-- KOLON SEVİYESİNDE GİZLİLİK:
--   RLS satır bazlıdır, kolon gizleyemez. tenants.contact_recipient_email
--   operasyonel bir bilgi (iletişim formu bildiriminin gideceği adres),
--   herkese açık sitede hiç render edilmiyor — bu yüzden anon'un bu kolonu
--   SELECT edebilmesi ayrıca REVOKE/GRANT ile engellendi (aşağıda). site_settings
--   içindeki contact_email/contact_phone ise bilinçli olarak herkese açık
--   (gösterim amaçlı üstbilgi/altbilgi bilgisi, bkz. VERİ-MODELİ.md) — o yüzden
--   site_settings'te kolon kısıtlaması yok.

-- ============================================================================
-- tenants
-- ============================================================================
revoke select on public.tenants from anon;
grant select (id, created_at, is_published, name, domain, is_platform_owner, theme_mode)
  on public.tenants to anon;

create policy "tenants_anon_select_published"
  on public.tenants for select
  to anon
  using (is_published = true);

create policy "tenants_authenticated_select_all"
  on public.tenants for select
  to authenticated
  using (true);

create policy "tenants_authenticated_insert"
  on public.tenants for insert
  to authenticated
  with check (true);

create policy "tenants_authenticated_update"
  on public.tenants for update
  to authenticated
  using (true)
  with check (true);

create policy "tenants_authenticated_delete"
  on public.tenants for delete
  to authenticated
  using (true);

-- ============================================================================
-- site_settings — kendi is_published kolonu yok, bağlı tenant'a bakılır.
-- ============================================================================
create policy "site_settings_anon_select_published"
  on public.site_settings for select
  to anon
  using (
    exists (
      select 1 from public.tenants t
      where t.id = site_settings.tenant_id and t.is_published = true
    )
  );

create policy "site_settings_authenticated_select_all"
  on public.site_settings for select
  to authenticated
  using (true);

create policy "site_settings_authenticated_insert"
  on public.site_settings for insert
  to authenticated
  with check (true);

create policy "site_settings_authenticated_update"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

create policy "site_settings_authenticated_delete"
  on public.site_settings for delete
  to authenticated
  using (true);

-- ============================================================================
-- hero_sections
-- ============================================================================
create policy "hero_sections_anon_select_published"
  on public.hero_sections for select
  to anon
  using (is_published = true);

create policy "hero_sections_authenticated_select_all"
  on public.hero_sections for select
  to authenticated
  using (true);

create policy "hero_sections_authenticated_insert"
  on public.hero_sections for insert
  to authenticated
  with check (true);

create policy "hero_sections_authenticated_update"
  on public.hero_sections for update
  to authenticated
  using (true)
  with check (true);

create policy "hero_sections_authenticated_delete"
  on public.hero_sections for delete
  to authenticated
  using (true);

-- ============================================================================
-- about_sections
-- ============================================================================
create policy "about_sections_anon_select_published"
  on public.about_sections for select
  to anon
  using (is_published = true);

create policy "about_sections_authenticated_select_all"
  on public.about_sections for select
  to authenticated
  using (true);

create policy "about_sections_authenticated_insert"
  on public.about_sections for insert
  to authenticated
  with check (true);

create policy "about_sections_authenticated_update"
  on public.about_sections for update
  to authenticated
  using (true)
  with check (true);

create policy "about_sections_authenticated_delete"
  on public.about_sections for delete
  to authenticated
  using (true);

-- ============================================================================
-- services
-- ============================================================================
create policy "services_anon_select_published"
  on public.services for select
  to anon
  using (is_published = true);

create policy "services_authenticated_select_all"
  on public.services for select
  to authenticated
  using (true);

create policy "services_authenticated_insert"
  on public.services for insert
  to authenticated
  with check (true);

create policy "services_authenticated_update"
  on public.services for update
  to authenticated
  using (true)
  with check (true);

create policy "services_authenticated_delete"
  on public.services for delete
  to authenticated
  using (true);

-- ============================================================================
-- projects
-- ============================================================================
create policy "projects_anon_select_published"
  on public.projects for select
  to anon
  using (is_published = true);

create policy "projects_authenticated_select_all"
  on public.projects for select
  to authenticated
  using (true);

create policy "projects_authenticated_insert"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "projects_authenticated_update"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

create policy "projects_authenticated_delete"
  on public.projects for delete
  to authenticated
  using (true);

-- ============================================================================
-- contact_sections
-- ============================================================================
create policy "contact_sections_anon_select_published"
  on public.contact_sections for select
  to anon
  using (is_published = true);

create policy "contact_sections_authenticated_select_all"
  on public.contact_sections for select
  to authenticated
  using (true);

create policy "contact_sections_authenticated_insert"
  on public.contact_sections for insert
  to authenticated
  with check (true);

create policy "contact_sections_authenticated_update"
  on public.contact_sections for update
  to authenticated
  using (true)
  with check (true);

create policy "contact_sections_authenticated_delete"
  on public.contact_sections for delete
  to authenticated
  using (true);

-- ============================================================================
-- testimonials
-- ============================================================================
create policy "testimonials_anon_select_published"
  on public.testimonials for select
  to anon
  using (is_published = true);

create policy "testimonials_authenticated_select_all"
  on public.testimonials for select
  to authenticated
  using (true);

create policy "testimonials_authenticated_insert"
  on public.testimonials for insert
  to authenticated
  with check (true);

create policy "testimonials_authenticated_update"
  on public.testimonials for update
  to authenticated
  using (true)
  with check (true);

create policy "testimonials_authenticated_delete"
  on public.testimonials for delete
  to authenticated
  using (true);

-- ============================================================================
-- faqs
-- ============================================================================
create policy "faqs_anon_select_published"
  on public.faqs for select
  to anon
  using (is_published = true);

create policy "faqs_authenticated_select_all"
  on public.faqs for select
  to authenticated
  using (true);

create policy "faqs_authenticated_insert"
  on public.faqs for insert
  to authenticated
  with check (true);

create policy "faqs_authenticated_update"
  on public.faqs for update
  to authenticated
  using (true)
  with check (true);

create policy "faqs_authenticated_delete"
  on public.faqs for delete
  to authenticated
  using (true);

-- ============================================================================
-- team_members
-- ============================================================================
create policy "team_members_anon_select_published"
  on public.team_members for select
  to anon
  using (is_published = true);

create policy "team_members_authenticated_select_all"
  on public.team_members for select
  to authenticated
  using (true);

create policy "team_members_authenticated_insert"
  on public.team_members for insert
  to authenticated
  with check (true);

create policy "team_members_authenticated_update"
  on public.team_members for update
  to authenticated
  using (true)
  with check (true);

create policy "team_members_authenticated_delete"
  on public.team_members for delete
  to authenticated
  using (true);

-- ============================================================================
-- contact_messages — İSTİSNA: anon için ne select ne de yazma policy'si var.
-- Ziyaretçi PII'si içerir, herkese açık okunamaz; anonim iletişim formu
-- gönderimi RLS'i bypass eden service role client üzerinden (app/api/contact/,
-- henüz yazılmadı) yapılacak.
-- ============================================================================
create policy "contact_messages_authenticated_select_all"
  on public.contact_messages for select
  to authenticated
  using (true);

create policy "contact_messages_authenticated_insert"
  on public.contact_messages for insert
  to authenticated
  with check (true);

create policy "contact_messages_authenticated_update"
  on public.contact_messages for update
  to authenticated
  using (true)
  with check (true);

create policy "contact_messages_authenticated_delete"
  on public.contact_messages for delete
  to authenticated
  using (true);
