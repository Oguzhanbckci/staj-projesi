-- İletişim formuna sunucu tarafı IP-bazlı hız sınırı eklenmesi kararının
-- (bkz. docs/KARAR-GUNLUGU.md, 2026-08-17 "Spam koruması") bir parçası —
-- rate limit sayacı contact_messages'ın kendisi sorgulanarak tutulacak
-- (ayrı bir servis/bağımlılık yok), bu yüzden gönderenin IP'sini
-- saklamak gerekiyor. `inet` — Postgres'in yerel IP tipi, IPv4/IPv6
-- ikisini de destekler.
--
-- KVKK notu: IP adresi kişisel veri sayılır — sadece spam/kötüye
-- kullanım tespiti amacıyla, sadece service role (RLS bypass) tarafından
-- yazılıyor/okunuyor, anon'a hiçbir zaman açılmıyor (contact_messages
-- zaten anon'a tamamen kapalı, bkz. docs/GUVENLIK.md madde 2). Nullable —
-- IP başlığı okunamazsa (ör. yerel geliştirmede x-forwarded-for hiç
-- gelmez) hız sınırı o istek için atlanır, form yine de çalışır.
alter table public.contact_messages
  add column sender_ip inet;

comment on column public.contact_messages.sender_ip is
  'Gönderenin IP adresi (x-forwarded-for) — SADECE hız sınırı/spam tespiti için, panelde gösterilmiyor. Nullable: IP okunamazsa hız sınırı o istek için atlanır.';

-- Hız sınırı sorgusu her gönderimde (tenant_id, sender_ip, created_at)
-- ile çalışacağı için indeks — sorgu deseni: "bu tenant'ta bu IP'den son
-- N dakikada kaç satır var".
create index contact_messages_tenant_ip_created_idx
  on public.contact_messages (tenant_id, sender_ip, created_at);
