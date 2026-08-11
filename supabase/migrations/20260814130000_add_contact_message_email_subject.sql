-- İletişim formu şu ana kadar sadece doğruluyordu, DB'ye yazmıyordu
-- (bkz. components/site/contact/actions.ts). Form zaten e-posta ve konu
-- topluyor (lib/validation/contact.ts) ama contact_messages'ta bu ikisi
-- için kolon yoktu.
--
-- Nullable bırakıldı (NOT NULL değil) — projedeki diğer sonradan eklenen
-- kolonlarla (testimonials.rating, hero_sections.secondary_cta_text vb.)
-- aynı ilke: DB permissive, gerçek zorunluluk uygulama katmanında (zod,
-- lib/validation/contact.ts) zaten var. subject için CHECK constraint
-- YOK — sabit seçenek listesi (CONTACT_SUBJECTS) zaten tek doğruluk
-- kaynağı olarak kodda tutuluyor (projects.category ile aynı ilke).
alter table public.contact_messages
  add column sender_email text,
  add column subject text;

comment on column public.contact_messages.sender_email is
  'Gönderenin e-posta adresi (yanıtlamak için) — form alanı zorunlu, DB seviyesinde nullable.';
comment on column public.contact_messages.subject is
  'Konu — lib/validation/contact.ts CONTACT_SUBJECTS sabit listesinden biri (genel-bilgi, proje-teklifi, is-birligi, sikayet-oneri, diger).';

-- Mevcut demo satırları (kayıt öncesi seed'lenmiş) boş görünmesin diye
-- gerçekçi bir e-posta/konu ile dolduruluyor.
update public.contact_messages
set
  sender_email = coalesce(sender_email, lower(replace(sender_name, ' ', '.')) || '@ornek.com'),
  subject = coalesce(subject, 'genel-bilgi')
where sender_email is null or subject is null;
