-- Kullanıcı "Ekip ve İletişim bölümleri ayrı sekme/sayfa olsun" istedi
-- (bkz. docs/KARAR-GUNLUGU.md, 2026-08-13) — tek sayfalı ana sayfa akışı
-- karmaşık hissettiriyordu. Ekip ve İletişim artık page_sections'a bağlı
-- ana sayfa bölümleri değil, ayrı rotalar (/ekip, /iletisim — bkz.
-- app/(site)/ekip/, app/(site)/iletisim/).
delete from public.page_sections
where tenant_id = '11111111-1111-1111-1111-111111111111'
  and section_key in ('team', 'contact');

-- Eylem Çağrısı butonu artık ana sayfadaki bir çapaya (#iletisim) değil,
-- gerçek İletişim sayfasına gitmeli.
update public.site_settings set cta_button_link = '/iletisim'
where tenant_id = '11111111-1111-1111-1111-111111111111';
