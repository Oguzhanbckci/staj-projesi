-- Projelere DURUM ekseni (2026-08-21).
--
-- Gerekçe: docs/RAKIP-ANALIZI.md, incelenen sitelerde "devam eden / tamamlanan"
-- ayrımını sektörün en evrensel bilgisi olarak kaydediyor ve "bizde yok"
-- sütununa yazmıştı; bulgu bugüne kadar iş maddesine dönüşmemişti. Bugün
-- elimizdeki tek eksen serbest metin `category` (Konut/Ticari/Altyapı) ve bu
-- bir müteahhit için satış sinyali olarak çok daha zayıf: devam eden proje
-- CANLILIK, tamamlanan proje GÜVEN gösterir. Bu ayrım olmadan 2018'de bitmiş
-- bir proje ile şu an inşa edilen proje sitede birebir aynı görünüyor.
--
-- Kolon NULLABLE ve varsayılanı yok — mevcut kayıtlar dokunulmadan geçerli
-- kalır ve rozet basılmaz. "Durum belirtilmemiş" geçerli bir durumdur; her
-- projenin durumunu girmeye zorlamak, panelde yalnızca başlık/görsel girip
-- hızla yayına almak isteyen kullanıcıyı engellerdi.
--
-- Değerler İngilizce anahtar, Türkçe etiket ayrı (lib/validation/projectFields.ts):
-- DB'de görünen metin saklamak, ileride etiket değişirse veriyi de değiştirmeyi
-- gerektirirdi. Aynı ayrım `page_sections.variant`/`section_key` gibi diğer
-- sabit listelerde de kullanılıyor.
alter table public.projects
  add column status text;

alter table public.projects
  add constraint projects_status_check
    check (status is null or status in ('devam', 'tamamlandi', 'planlanan'));

comment on column public.projects.status is
  'Proje durumu: devam | tamamlandi | planlanan. NULL = belirtilmemiş (rozet gösterilmez). Türkçe etiketler lib/validation/projectFields.ts içinde.';
