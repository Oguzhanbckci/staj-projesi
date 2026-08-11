-- SEO ayarları ekranı: anahtar kelimeler + sosyal medya paylaşım görseli.
-- seo_title/seo_description ZATEN var (bkz. 20260806120000) ve
-- generateMetadata()'da kullanılıyor — bu migration sadece eksik iki
-- alanı ekliyor.
-- Karar ve gerekçe: docs/KARAR-GUNLUGU.md, 2026-08-16.

alter table public.site_settings
  add column seo_keywords text,
  add column og_image_path text;

comment on column public.site_settings.seo_keywords is
  'Virgülle ayrılmış anahtar kelimeler, opsiyonel — <meta name="keywords"> için. Modern arama motorları büyük ölçüde yok sayar, panelde bu dürüstçe belirtilir.';
comment on column public.site_settings.og_image_path is
  'Storage (branding bucket) içindeki sosyal medya paylaşım görseli (Open Graph) yolu — boşsa paylaşımlarda görsel gösterilmez.';
