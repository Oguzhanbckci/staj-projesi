-- Aktif site platform sahibinden Akme İnşaat'a çevrildi (bkz.
-- supabase/migrations/20260810120000_..., docs/KARAR-GUNLUGU.md 2026-08-10)
-- ama İstatistikler örnek verisi sadece platform tenant'ına seed'lenmişti
-- (bkz. supabase/migrations/20260808170000_...) — Akme'de hiç `stats`
-- satırı olmadığı için bölüm (doğru şekilde, "kayıt yoksa render etme"
-- ilkesiyle) hiç görünmüyordu. Akme için de örnek istatistikler ekleniyor.
insert into public.stats (tenant_id, label, value, suffix, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Tamamlanan Proje', 45, '+', 10, true),
  ('11111111-1111-1111-1111-111111111111', 'Yıllık Deneyim', 30, '+', 20, true),
  ('11111111-1111-1111-1111-111111111111', 'Memnun Müşteri', 900, '+', 30, true);
