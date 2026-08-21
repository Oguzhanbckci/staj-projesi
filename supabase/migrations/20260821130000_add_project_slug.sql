-- Projelere URL parçası (slug) — proje detay SAYFASI için (2026-08-21).
--
-- Gerekçe: proje detayı bugüne kadar yalnızca bir modaldı — adresi yok,
-- paylaşılamıyor, arama motoru tarafından indekslenmiyor. `sitemap.xml`
-- sitenin TAMAMI için 3 URL bildiriyordu; 25 projesi olan bir müşteride bile
-- aranabilir sayfa sayısı 3'te kalıyordu. Oysa bir inşaat firmasının
-- sitesinde arama trafiğinin ana kapısı proje adlarıdır ("Vadi Konutları
-- Konya"). Bu madde, `TESLIM-PAKETI.md`'nin sattığı "teknik SEO baştan
-- hazır" vaadini gerçek içerikle buluşturuyor.
--
-- Kolon NOT NULL: "her projenin bir sayfası vardır" bu özelliğin tamamı.
-- Nullable bırakılsaydı slug'ı olmayan bir kayıt sessizce tıklanamaz bir
-- karta dönüşürdü — bu projede tekrar eden "sessizce farklı davranış" hata
-- sınıfının ta kendisi. Üç insert yolunun üçü de slug yazıyor: panel eylemi
-- (lib/slug.ts ile), supabase/seed.sql ve supabase/setup/seed-template.sql.
--
-- Benzersizlik TENANT BAŞINA: iki farklı müşterinin ikisinde de
-- "vadi-konutlari" olabilir, çünkü siteler ayrı alan adlarında.

alter table public.projects
  add column slug text;

-- ---------------------------------------------------------------------------
-- Mevcut kayıtları geri doldur.
--
-- SQL tarafındaki üretim lib/slug.ts ile AYNI kuralları izler: Türkçe
-- harfler ASCII'ye iner, alfanümerik olmayan her şey tek tireye döner,
-- baş/son tireler atılır, 80 karaktere kırpılır ve kırpma sonrası kalan
-- tire de temizlenir.
--
-- `translate()` karakter bazlı çalışır (bayt değil), yani çok baytlı Türkçe
-- harflerde doğru sonuç verir. Türkçe BÜYÜK harfler doğrudan KÜÇÜK ASCII
-- karşılığına eşleniyor (Ç->c, İ->i, I->i) ve bu bilinçli: Postgres'in
-- `lower()` sonucu veritabanı yereline bağlıdır ve Türkçe yerelde
-- lower('I') = 'ı'. Eşlemeyi önce ve doğrudan küçük harfe yapmak sonucu
-- yerelden BAĞIMSIZ kılıyor. lib/slug.ts aynı ayrımı aynı gerekçeyle
-- yapıyor; iki taraf farklı slug üretseydi geri doldurulan adresler
-- panelden üretilenlerle tutmazdı.
-- ---------------------------------------------------------------------------
with tabanlar as (
  select
    id,
    tenant_id,
    order_index,
    created_at,
    nullif(
      regexp_replace(
        left(
          regexp_replace(
            regexp_replace(
              lower(
                translate(
                  title,
                  'çğıöşüÇĞİÖŞÜIàâäéèêëîïôöûüÿñ',
                  'cgiosucgiosuiaaaeeeeiioouuyn'
                )
              ),
              '[^a-z0-9]+', '-', 'g'
            ),
            '(^-+|-+$)', '', 'g'
          ),
          80
        ),
        '-+$', '', 'g'
      ),
      ''
    ) as taban
  from public.projects
),
numaralanmis as (
  select
    id,
    -- Hiç alfanümerik içermeyen başlık için (ör. "***") kimlikten türetilmiş
    -- bir yedek; NOT NULL kısıtı bu sayede güvenle konulabiliyor.
    coalesce(taban, 'proje-' || left(id::text, 8)) as taban,
    row_number() over (
      partition by tenant_id, coalesce(taban, 'proje-' || left(id::text, 8))
      order by order_index, created_at, id
    ) as sira
  from tabanlar
)
update public.projects p
set slug = case
  when n.sira = 1 then n.taban
  else n.taban || '-' || n.sira
end
from numaralanmis n
where p.id = n.id;

-- Kısıtlar geri doldurmadan SONRA ekleniyor; sırası önemli, aksi hâlde
-- mevcut satırlar yüzünden düşerdi.
alter table public.projects
  alter column slug set not null;

alter table public.projects
  add constraint projects_tenant_slug_key unique (tenant_id, slug);

comment on column public.projects.slug is
  'Proje detay sayfasının URL parçası (/projeler/<slug>). Tenant başına benzersiz. Panelde boş bırakılırsa başlıktan üretilir (lib/slug.ts).';
