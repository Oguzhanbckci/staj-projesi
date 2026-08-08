-- Kategori filtresi ve proje detay açıklaması için. category serbest metin
-- (check constraint yok) — filtre listesi kodda sabit yazılmıyor, mevcut
-- yayınlanmış projelerdeki farklı değerlerden türetiliyor (bkz.
-- components/site/projects/).
alter table public.projects
  add column category text,
  add column description text;

comment on column public.projects.category is
  'Serbest metin kategori (or. Konut, Ticari, Altyapi) - filtre listesi kod icin sabit degil, veriden turetilir.';
comment on column public.projects.description is
  'Proje detay penceresinde gosterilen aciklama metni.';

-- Demo verideki mevcut 8 Akme projesine gerçekçi kategori/açıklama ata
-- (filtreleme ve detay penceresi test edilebilsin diye).
update public.projects set
  category = 'Konut',
  description = 'Modern mimari anlayışla tasarlanan, aile yaşamına uygun geniş bahçeli konut projesidir.'
  where title = 'Vadi Konutları';
update public.projects set
  category = 'Konut',
  description = 'Sahil şeridine yakın, deniz manzaralı rezidans projesi; sosyal alanları ve güvenlikli site konseptiyle öne çıkar.'
  where title = 'Marina Rezidans';
update public.projects set
  category = 'Ticari',
  description = 'Şehrin merkezinde konumlanan, A sınıfı ofis standartlarında modern bir iş merkezi.'
  where title = 'Akme Kule Ofis Binası';
update public.projects set
  category = 'Konut',
  description = 'Sürdürülebilir malzemeler ve enerji verimli tasarımla hayata geçirilen toplu konut projesi.'
  where title = 'Yeşil Vadi Toplu Konut';
update public.projects set
  category = 'Ticari',
  description = 'Şehir merkezinde, farklı ölçeklerde işletmelere hitap eden çok katlı iş merkezi.'
  where title = 'Merkez İş Merkezi';
update public.projects set
  category = 'Konut',
  description = 'Kıyı şeridinde, doğayla iç içe tatil/yazlık konut projesi.'
  where title = 'Sahil Konutları';
update public.projects set
  category = 'Altyapı',
  description = 'Lojistik ihtiyaçlara yönelik geniş kapasiteli, modern depolama ve dağıtım kompleksi.'
  where title = 'Endüstri Parkı Depo Kompleksi';
update public.projects set
  category = 'Ticari',
  description = 'Şehrin kültürel etkinliklerine ev sahipliği yapan çok amaçlı kongre ve kültür merkezi.'
  where title = 'Kültür ve Kongre Merkezi';
