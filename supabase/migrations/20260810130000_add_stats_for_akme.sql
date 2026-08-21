-- Aktif site platform sahibinden Akme İnşaat'a çevrildi (bkz.
-- supabase/migrations/20260810120000_..., docs/KARAR-GUNLUGU.md 2026-08-10)
-- ama İstatistikler örnek verisi sadece platform tenant'ına seed'lenmişti
-- (bkz. supabase/migrations/20260808170000_...) — Akme'de hiç `stats`
-- satırı olmadığı için bölüm (doğru şekilde, "kayıt yoksa render etme"
-- ilkesiyle) hiç görünmüyordu. Akme için de örnek istatistikler ekleniyor.
-- Not: bu blok eskiden koşulsuz `insert ... values` idi ve boş bir
-- veritabanında (yeni müşteri kurulumu, `supabase db push`) tenants satırı
-- henüz var olmadığı için foreign key hatasıyla kurulumu ilk adımda
-- durduruyordu. `where exists` ile blok yalnızca ilgili tenant zaten varsa
-- çalışır; yeni kurulumda sessizce atlanır — demo veri zaten yeni müşteride
-- istenmiyor, o içerik supabase/setup/seed-template.sql'den gelir.
insert into public.stats (tenant_id, label, value, suffix, order_index, is_published)
select v.tenant_id, v.label, v.value, v.suffix, v.order_index, v.is_published
from (values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Tamamlanan Proje', 45, '+'::text, 10, true),
  ('11111111-1111-1111-1111-111111111111', 'Yıllık Deneyim', 30, '+', 20, true),
  ('11111111-1111-1111-1111-111111111111', 'Memnun Müşteri', 900, '+', 30, true)
) as v (tenant_id, label, value, suffix, order_index, is_published)
where exists (select 1 from public.tenants where id = v.tenant_id);
