-- JSON-LD (LocalBusiness) yapısal verisi için: openingHoursSpecification
-- YAPISAL veri ister (serbest metin working_hours bunun için kullanılamaz,
-- ayrıştırmak riskli — kullanıcıyla netleştirildi, bkz. docs/KARAR-GUNLUGU.md
-- 2026-08-17). Mevcut working_hours (serbest metin, görüntüleme için)
-- DEĞİŞMİYOR, yanına yapısal saat çiftleri ekleniyor. Ayrıca areaServed
-- için hiç var olmayan hizmet illeri alanı ekleniyor.
-- Karar ve gerekçe: docs/KARAR-GUNLUGU.md, 2026-08-17.

alter table public.contact_sections
  add column weekday_opens text,
  add column weekday_closes text,
  add column weekend_opens text,
  add column weekend_closes text,
  add column service_areas text;

alter table public.contact_sections
  add constraint contact_sections_weekday_opens_check
    check (weekday_opens is null or weekday_opens ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  add constraint contact_sections_weekday_closes_check
    check (weekday_closes is null or weekday_closes ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  add constraint contact_sections_weekend_opens_check
    check (weekend_opens is null or weekend_opens ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  add constraint contact_sections_weekend_closes_check
    check (weekend_closes is null or weekend_closes ~ '^([01]\d|2[0-3]):[0-5]\d$');

comment on column public.contact_sections.weekday_opens is
  'Hafta içi (Pazartesi-Cuma) açılış saati, HH:MM (24 saat) — JSON-LD openingHoursSpecification için. Boşsa hafta içi saatleri yapısal veriye hiç eklenmez.';
comment on column public.contact_sections.weekday_closes is
  'Hafta içi kapanış saati, HH:MM.';
comment on column public.contact_sections.weekend_opens is
  'Hafta sonu (Cumartesi+Pazar, TEK çift — bilinçli basitleştirme, bkz. docs/SEO-PERFORMANS.md) açılış saati, HH:MM.';
comment on column public.contact_sections.weekend_closes is
  'Hafta sonu kapanış saati, HH:MM.';
comment on column public.contact_sections.service_areas is
  'Hizmet verilen iller, virgülle ayrılmış serbest metin (ör. "İstanbul, Kocaeli, Bursa") — JSON-LD areaServed için.';
