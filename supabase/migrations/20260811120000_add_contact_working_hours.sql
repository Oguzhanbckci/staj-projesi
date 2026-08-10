-- İletişim formunun yanındaki bilgi bloğunda "çalışma saatleri" istendi
-- (bkz. docs/KARAR-GUNLUGU.md, 2026-08-11) — contact_sections'ta bu bilgi
-- yoktu, address/phone/email'e ek olarak eklendi.
alter table public.contact_sections
  add column working_hours text;

comment on column public.contact_sections.working_hours is
  'Serbest metin çalışma saatleri (ör. "Pazartesi - Cuma: 09:00 - 18:00"), opsiyonel.';

update public.contact_sections set
  working_hours = 'Pazartesi - Cuma: 09:00 - 18:00' || chr(10) || 'Cumartesi: 09:00 - 13:00' || chr(10) || 'Pazar: Kapalı'
where tenant_id = '11111111-1111-1111-1111-111111111111';
