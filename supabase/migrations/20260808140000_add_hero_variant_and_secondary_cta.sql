-- Hero bölümü artık iki görsel varyant (a: tam genişlik arka plan görseli,
-- b: iki kolonlu metin+görsel) destekliyor; hangisinin kullanılacağı
-- panelden seçilecek bu kolondan okunur. Varyant A iki eylem butonu
-- gösterebildiği için ikinci (opsiyonel) bir CTA çifti de eklendi.
-- Bkz. components/site/hero/, docs/MIMARI.md.
alter table public.hero_sections
  add column variant text not null default 'a',
  add column secondary_cta_text text,
  add column secondary_cta_link text;

alter table public.hero_sections
  add constraint hero_sections_variant_check check (variant in ('a', 'b'));

comment on column public.hero_sections.variant is
  'Panelden secilen gorsel varyant (a | b) - bkz. components/site/hero/.';
comment on column public.hero_sections.secondary_cta_text is
  'Ikinci (opsiyonel) eylem butonu metni - varyant A iki buton gosterebilir.';
comment on column public.hero_sections.secondary_cta_link is
  'Ikinci (opsiyonel) eylem butonu linki.';
