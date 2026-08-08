-- Panelden seçilecek hazır tema ön ayarını tutan kolon. Marka rengi/köşe
-- yarıçapı/font tek tek ham kolonlar olarak değil, kürasyonlu bir "preset"
-- referansı olarak saklanıyor — gerçek değerler kodda (lib/theme/presets.ts,
-- bkz. docs/TEMA-MIMARISI.md). primary_color/secondary_color mevcut
-- kolonları, preset'in varsayılan marka rengini ezen (override eden)
-- serbest tenant özelleştirmesi olarak kalmaya devam ediyor.
alter table public.site_settings
  add column theme_preset text not null default 'kurumsal-mavi';

alter table public.site_settings
  add constraint site_settings_theme_preset_check
  check (theme_preset in ('kurumsal-mavi', 'modern-koyu'));

comment on column public.site_settings.theme_preset is
  'Panelden secilen hazir tema on ayari (kurumsal-mavi | modern-koyu) - brand/radius/font kombinasyonunu belirler. Gercek degerler lib/theme/presets.ts icinde.';
