-- Referans puanı (testimonials.rating) 2026-08-07'den beri `integer` idi —
-- yani sadece tam yıldız (1,2,3,4,5) saklanabiliyordu. Kullanıcı isteği
-- üzerine (2026-08-19) kart artık KESİRLİ puanı da gösterebiliyor
-- ("4 tam + 5. yıldız yarım" = 4.5, bkz. components/site/testimonials/
-- TestimonialCard.tsx içindeki renderRating). Görsel taraf hazır olsa da
-- veri katmanı 4.5'i saklayamıyordu — bu migration onu açıyor.
--
-- numeric(2,1): toplam 2 basamak, 1'i ondalık → 0.0 ile 9.9 arası, bize
-- gereken 1.0-5.0 aralığını 0.1 hassasiyetle kapsıyor. `real`/`float`
-- BİLİNÇLİ OLARAK kullanılmadı: kayan nokta değerleri 4.5'i tam olarak
-- temsil etmeyebilir ve karşılaştırmalarda sürprize yol açar; numeric
-- kesin (exact) bir tiptir.
--
-- Mevcut CHECK kısıtı (rating between 1 and 5) korunuyor — sadece tip
-- değişiyor, iş kuralı değil. Mevcut tam sayı değerler (5, 4) kayıpsız
-- dönüşür (5 → 5.0).

alter table public.testimonials
  alter column rating type numeric(2, 1) using rating::numeric(2, 1);

comment on column public.testimonials.rating is
  'Referans puanı, 1.0-5.0 arası, 0.1 adımlarla. Kesirli değerler kartta yarım yıldız olarak gösterilir (bkz. TestimonialCard.renderRating). Boş bırakılabilir — o zaman yıldızlar hiç gösterilmez.';
