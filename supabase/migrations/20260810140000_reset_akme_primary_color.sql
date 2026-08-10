-- Akme İnşaat'ın site_settings.primary_color'ı ('#0f172a', neredeyse
-- siyah) tasarım sistemi (docs/TASARIM-SISTEMI.md, 2026-08-08) kurulmadan
-- ÖNCE, 2026-08-06'da seed'lenmiş bir yer tutucuydu — kurumsal-mavi
-- preset'inin özenle seçilmiş, WCAG doğrulanmış marka mavisini (#2561c1)
-- eziyordu (bkz. lib/theme/resolve.ts, primary_color varsa preset'in
-- rengini her zaman ezer). Kullanıcı gerçek sayfayı incelerken "renk
-- teması garip duruyor" diye fark etti; NULL'a çekilerek preset'in kendi
-- (kontrastı doğrulanmış) rengi devreye giriyor.
update public.site_settings set primary_color = null
where tenant_id = '11111111-1111-1111-1111-111111111111';
