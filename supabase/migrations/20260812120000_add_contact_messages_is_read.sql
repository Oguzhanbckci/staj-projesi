-- Panel özet ekranında "kaç okunmamış mesaj var" gösterilecek (bkz.
-- docs/KARAR-GUNLUGU.md, 2026-08-12) — contact_messages'ta bunu ayırt
-- edecek bir kolon yoktu.
alter table public.contact_messages
  add column is_read boolean not null default false;

comment on column public.contact_messages.is_read is
  'Panelde bu mesajın okundu olarak işaretlenip işaretlenmediği.';

-- Demo verideki 2 mesajdan birini "okundu" yapıp gerçekçi bir karışım
-- oluşturuyoruz (ikisi de okunmamış olsaydı panel her zaman aynı sayıyı
-- gösterirdi, test için anlamsız olurdu).
update public.contact_messages set is_read = true
where sender_name = 'Mehmet Yılmaz';
