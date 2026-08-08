-- Hizmet kartının "görselli büyük kart" varyantı için görsel yolu.
alter table public.services
  add column image_path text;

comment on column public.services.image_path is
  'Storage yolu - "gorselli buyuk kart" varyanti icin (bkz. components/site/services/).';

-- Hakkımızda bölümünün kısa değerler listesi (ör. Kaliteli Isçilik,
-- Zamaninda Teslim, Seffaf Iletisim). "values" SQL'de ayrılmış/reserved
-- kelime olduğu için (testimonials'ta "references" için yapıldığı gibi,
-- bkz. VERİ-MODELİ.md) "core_values" adı seçildi.
alter table public.about_sections
  add column core_values text[];

comment on column public.about_sections.core_values is
  'Kisa degerler listesi - bkz. components/site/about/.';
