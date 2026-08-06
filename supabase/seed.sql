-- Doğrulama amaçlı örnek veri: her tablo için 2 satır (bkz. docs/VERİ-MODELİ.md).
-- tenant_id üzerinde UNIQUE olan tablolarda (site_settings, hero_sections,
-- about_sections, contact_sections) "2 satır" = 2 farklı tenant. Liste
-- tablolarında (services, projects, contact_messages) 2 satır aynı tenant
-- altında, gerçek liste/sıralama davranışını göstermek için.

insert into public.tenants (id, name, domain, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Akme İnşaat', 'akmeinsaat.com.tr', true),
  ('22222222-2222-2222-2222-222222222222', 'Yıldız Yapı', 'yildizyapi.com.tr', true);

insert into public.site_settings (tenant_id, logo_path, primary_color, seo_title) values
  ('11111111-1111-1111-1111-111111111111', 'akme/logo.png', '#0f172a', 'Akme İnşaat | Kurumsal Web Sitesi'),
  ('22222222-2222-2222-2222-222222222222', 'yildiz/logo.png', '#1e3a8a', 'Yıldız Yapı | Kurumsal Web Sitesi');

insert into public.hero_sections (tenant_id, title, subtitle, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Güvenle İnşa Ediyoruz', '30 yıllık tecrübe', true),
  ('22222222-2222-2222-2222-222222222222', 'Geleceğin Yapıları', 'Modern ve sürdürülebilir mimari', true);

insert into public.about_sections (tenant_id, title, description, founded_year, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Hakkımızda', 'Akme İnşaat 1995 yılından beri hizmet vermektedir.', 1995, true),
  ('22222222-2222-2222-2222-222222222222', 'Hakkımızda', 'Yıldız Yapı, konut ve ticari projeler geliştirir.', 2008, true);

insert into public.services (tenant_id, title, description, icon, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Konut İnşaatı', 'Anahtar teslim konut projeleri.', 'home', 0, true),
  ('11111111-1111-1111-1111-111111111111', 'Ticari Yapılar', 'Ofis ve AVM inşaatları.', 'building', 1, true);

insert into public.projects (tenant_id, title, location, year, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Akme Rezidans', 'İstanbul', 2022, 0, true),
  ('11111111-1111-1111-1111-111111111111', 'Akme Plaza', 'Ankara', 2023, 1, true);

insert into public.contact_sections (tenant_id, address, phone, email, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Merkez Mah. No:1, İstanbul', '+90 212 000 00 00', 'info@akmeinsaat.com.tr', true),
  ('22222222-2222-2222-2222-222222222222', 'Örnek Cad. No:5, Ankara', '+90 312 000 00 00', 'info@yildizyapi.com.tr', true);

insert into public.contact_messages (tenant_id, sender_name, sender_phone, message) values
  ('11111111-1111-1111-1111-111111111111', 'Mehmet Yılmaz', '+90 532 000 00 00', 'Konut projeniz hakkında bilgi almak istiyorum.'),
  ('11111111-1111-1111-1111-111111111111', 'Ayşe Demir', '+90 533 000 00 00', 'Teklif almak için görüşmek isteriz.');
