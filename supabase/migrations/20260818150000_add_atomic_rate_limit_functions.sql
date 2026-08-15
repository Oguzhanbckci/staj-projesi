-- 2026-08-18 (dokuzuncu oturum, çok-ajanlı review) — GERÇEK bir güvenlik
-- açığı bulundu: hem panel giriş hız sınırı (login_attempts) hem iletişim
-- formu hız sınırı (contact_messages.sender_ip), "önce SELECT COUNT ile
-- say, sonra AYRI bir adımda INSERT et" (check-then-act) deseni
-- kullanıyordu. Bu ATOMIK DEĞİL: eşzamanlı (paralel) istekler hepsi aynı
-- (düşük) sayımı görüp hepsi "izin verildi" alabiliyor — bir saldırgan
-- 20-50 paralel istek göndererek "15 dakikada 5 deneme" ya da
-- "15 dakikada 3 mesaj" sınırını tek bir patlamada aşabiliyordu. Özellikle
-- panel girişi için bu, tek admin hesabına karşı brute-force korumasını
-- büyük ölçüde etkisizleştiriyordu.
--
-- Çözüm: sayım + (izinliyse) kayıt ekleme işlemini TEK bir Postgres
-- fonksiyonunda, `pg_advisory_xact_lock` ile aynı anahtar (IP, ya da
-- tenant+IP) için serileştirerek ATOMIK hale getir. Advisory lock
-- transaction ömürlü (`_xact_`) — fonksiyon çağrısı tek bir PostgREST
-- isteği/transaction'ı olduğu için kilit fonksiyon bitince otomatik
-- serbest kalır, ayrı bir "unlock" adımına gerek yok.
--
-- `security definer` — fonksiyon, çağıran rolün (service_role) RLS'ine
-- değil, fonksiyonu OLUŞTURAN rolün yetkisiyle çalışır; bu iki tablo zaten
-- service_role client'tan çağrıldığı için (RLS bypass) davranış değişmiyor,
-- sadece PostgREST RPC olarak çağrılabilmesi için gerekli.

-- ============================================================================
-- Panel girişi — check + reserve (insert) atomik.
-- ============================================================================
create or replace function public.check_and_reserve_login_attempt(
  p_ip inet,
  p_max_attempts integer,
  p_window_minutes integer
) returns table(allowed boolean, attempt_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('login_attempt:' || p_ip::text));

  select count(*) into v_count
  from public.login_attempts
  where ip = p_ip
    and created_at >= now() - make_interval(mins => p_window_minutes);

  if v_count >= p_max_attempts then
    return query select false, null::uuid;
    return;
  end if;

  insert into public.login_attempts (ip) values (p_ip) returning id into v_id;
  return query select true, v_id;
end;
$$;

comment on function public.check_and_reserve_login_attempt is
  'Panel giriş hız sınırı — sayım + rezervasyon TEK transaction''da, IP bazlı advisory lock ile serileştirilir. Kilitliyse attempt_id null döner, hiçbir satır eklenmez.';

grant execute on function public.check_and_reserve_login_attempt(inet, integer, integer)
  to service_role;

-- Başarılı girişte "rezervasyonu" kaldırmak için — doğru şifre girmek
-- kullanıcının kalan hakkını tüketmemeli, sadece GERÇEK başarısız
-- denemeler sayılmalı.
create or replace function public.delete_login_attempt(p_id uuid) returns void
language sql
security definer
set search_path = public
as $$
  delete from public.login_attempts where id = p_id;
$$;

comment on function public.delete_login_attempt is
  'Başarılı girişte check_and_reserve_login_attempt''in oluşturduğu rezervasyon satırını siler.';

grant execute on function public.delete_login_attempt(uuid) to service_role;

-- ============================================================================
-- İletişim formu — check + gerçek insert atomik (AYNI TOCTOU açığı,
-- lib/security/loginRateLimit.ts'in birebir kopyaladığı orijinal desendi,
-- bkz. docs/KARAR-GUNLUGU.md 2026-08-17 "Spam koruması"). Burada rezervasyon
-- yok — mesajın kendisi zaten kalıcı, "başarılı" durumda silinecek bir şey
-- yok (contact_messages her zaman gerçek bir kayıt, login_attempts'teki
-- gibi geçici bir sayaç değil).
-- ============================================================================
create or replace function public.submit_contact_message_if_allowed(
  p_tenant_id uuid,
  p_ip inet,
  p_max_per_window integer,
  p_window_minutes integer,
  p_sender_name text,
  p_sender_email text,
  p_sender_phone text,
  p_subject text,
  p_message text
) returns table(allowed boolean, message_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_id uuid;
begin
  if p_ip is not null then
    perform pg_advisory_xact_lock(hashtext('contact_submit:' || p_tenant_id::text || ':' || p_ip::text));

    select count(*) into v_count
    from public.contact_messages
    where tenant_id = p_tenant_id
      and sender_ip = p_ip
      and created_at >= now() - make_interval(mins => p_window_minutes);

    if v_count >= p_max_per_window then
      return query select false, null::uuid;
      return;
    end if;
  end if;

  insert into public.contact_messages
    (tenant_id, sender_name, sender_email, sender_phone, sender_ip, subject, message)
  values
    (p_tenant_id, p_sender_name, p_sender_email, p_sender_phone, p_ip, p_subject, p_message)
  returning id into v_id;

  return query select true, v_id;
end;
$$;

comment on function public.submit_contact_message_if_allowed is
  'İletişim formu gönderimi — hız sınırı sayımı + contact_messages insert''i TEK transaction''da, (tenant_id, IP) bazlı advisory lock ile serileştirilir. IP null ise (yerel geliştirme vb.) hız sınırı atlanır, mesaj yine de kaydedilir.';

grant execute on function public.submit_contact_message_if_allowed(
  uuid, inet, integer, integer, text, text, text, text, text
) to service_role;
