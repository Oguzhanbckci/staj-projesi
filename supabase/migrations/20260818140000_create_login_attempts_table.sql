-- Panel giriş ekranına IP bazlı hız sınırı/kilitleme eklenmesi kararının
-- (bkz. docs/KARAR-GUNLUGU.md, 2026-08-18 dokuzuncu oturum) bir parçası —
-- contact_messages.sender_ip'nin hız sınırı için kullanılmasıyla AYNI
-- desen: ayrı bir servis (Redis vb.) yerine bu iş için özel, küçük bir
-- tablo. `login_attempts`'e SADECE başarısız giriş denemeleri yazılır
-- (bkz. lib/security/loginRateLimit.ts) — bu yüzden "başarılı mı" gibi bir
-- kolona gerek yok, tablodaki her satır zaten başarısız bir denemedir.
--
-- KVKK notu: IP adresi kişisel veri sayılır — sadece kötüye kullanım
-- tespiti amacıyla, sadece service role (RLS bypass) tarafından
-- yazılıyor/okunuyor (bkz. aşağıdaki RLS notu), hiçbir panel ekranında
-- gösterilmiyor.
create table public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ip inet not null
);

comment on table public.login_attempts is
  'Panel girişindeki BAŞARISIZ deneme kayıtları — sadece hız sınırı/kilitleme için, hiçbir panel ekranında gösterilmez.';
comment on column public.login_attempts.ip is
  'x-forwarded-for''den tespit edilen istemci IP''si (bkz. lib/security/getClientIp.ts).';

-- Sorgu deseni: "bu IP'den son N dakikada kaç başarısız deneme var" —
-- bkz. lib/security/loginRateLimit.ts, checkLoginRateLimit.
create index login_attempts_ip_created_idx
  on public.login_attempts (ip, created_at);

alter table public.login_attempts enable row level security;

-- BİLİNÇLİ OLARAK HİÇ POLICY YOK — ne anon ne authenticated bu tabloya
-- erişebilir (contact_messages'ın anon için tamamen kapalı olmasıyla AYNI
-- gerekçe, ama burada authenticated için de kapalı: panelde "başarısız
-- giriş denemeleri" diye bir ekran yok, bu tabloyu sadece sunucu tarafı
-- hız sınırı mantığı service role client ile okuyor/yazıyor — bkz.
-- docs/GUVENLIK.md madde 19). İleride bir "güvenlik günlüğü" panel ekranı
-- istenirse, o zaman authenticated için ayrı bir select policy eklenir.
