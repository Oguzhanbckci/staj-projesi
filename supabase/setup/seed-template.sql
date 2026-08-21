-- YENİ MÜŞTERİ KURULUM ŞABLONU — docs/KURULUM.md'deki adım adım akışın
-- parçası. Bu dosya ELLE DÜZENLENMEZ — scripts/setup-new-customer.sh
-- aşağıdaki 3 yer tutucuyu (__TENANT_NAME__, __TENANT_DOMAIN__,
-- __CONTACT_EMAIL__) `sed` ile
-- gerçek müşteri bilgisiyle değiştirip SQL Editor'e yapıştırılacak/psql
-- ile çalıştırılacak GEÇİCİ bir kopya üretir (asıl dosya bozulmaz).
--
-- TEKRAR ÇALIŞTIRILABİLİR (KISITLAR): Her insert `on conflict do nothing`
-- ile korunuyor — bu betiği yanlışlıkla iki kez çalıştırırsanız (ör.
-- bağlantı koptu, emin olamadınız) veri ikiye katlanmaz, sadece "0 rows"
-- döner. Tenant, `domain` sütununun UNIQUE kısıtına (tenants_domain_key)
-- göre bulunur/oluşturulur — script boyunca "bu tenant" hep bu satırdan
-- gelir.
--
-- Bu, GERÇEK müşteri içeriği DEĞİL — panelden düzenlenecek bir BAŞLANGIÇ
-- şablonu (KISITLAR: "demo içeriği yükleyen bir akış"). Hizmet/proje/
-- referans metinleri bilinçli olarak jenerik bırakıldı, müşteri adına
-- özel değil — ilk kurulum sonrası platform sahibi panelden gerçek
-- içerikle değiştirmeli (bkz. docs/MUSTERİ-KILAVUZU.md).

do $$
declare
  v_tenant_id uuid;
begin
  -- 1) Tenant — yoksa oluştur, varsa mevcut id'yi kullan (idempotent).
  insert into public.tenants (name, domain, is_published, theme_mode)
  values ('__TENANT_NAME__', '__TENANT_DOMAIN__', true, 'light')
  on conflict (domain) do nothing;

  select id into v_tenant_id from public.tenants where domain = '__TENANT_DOMAIN__';

  if v_tenant_id is null then
    raise exception 'Tenant oluşturulamadı/bulunamadı — domain eşleşmesini kontrol edin.';
  end if;

  -- 2) Site ayarları (tek satır/tenant — tenant_id UNIQUE).
  insert into public.site_settings (
    tenant_id, seo_title, seo_description, slogan,
    cta_title, cta_description, cta_button_text, cta_button_link
  ) values (
    v_tenant_id,
    '__TENANT_NAME__ | Kurumsal Web Sitesi',
    '__TENANT_NAME__ — güvenilir, zamanında teslim odaklı inşaat hizmetleri.',
    'Güvenle inşa ediyoruz',
    'Projenizi Birlikte Hayata Geçirelim',
    'İhtiyaçlarınızı dinleyip size özel bir teklif hazırlayalım.',
    'Teklif Al',
    '/iletisim'
  )
  on conflict (tenant_id) do nothing;

  -- 3) Hero.
  -- cta_* / secondary_cta_* olmadan HeroVariantA'daki eylem çağrısı
  -- bloğunun TAMAMI render edilmez (koşul: ctaText || secondaryCtaText),
  -- yani yeni müşterinin hero'su butonsuz açılırdı. İkincil çağrı
  -- bilinçli olarak ikinci bir buton değil, alt çizgili metin bağlantısı
  -- olarak gösterilir (bkz. docs/RAKIP-ANALIZI.md — incelenen sitelerde
  -- hero'da CTA sayısı 0 veya 1).
  insert into public.hero_sections (
    tenant_id, title, subtitle,
    cta_text, cta_link, secondary_cta_text, secondary_cta_link, is_published
  )
  values (
    v_tenant_id, '__TENANT_NAME__', 'Konut ve ticari yapılarda uçtan uca inşaat hizmeti',
    'Teklif Al', '/iletisim', 'Projelerimizi İnceleyin', '/#projeler', true
  )
  on conflict (tenant_id) do nothing;

  -- 4) Hakkımızda.
  -- core_values boş kalırsa AboutSection'daki Değerler bloğu hiç
  -- render edilmez (koşul: coreValues.length > 0). Buradaki maddeler
  -- aynı zamanda BİÇİM ÖRNEĞİDİR: "Başlık — tek cümle açıklama".
  -- Panel bu ayracı ("—", "–" veya "-") kalın başlık / soluk açıklama
  -- olarak ayrıştırır, müşteri kalıbı önünde görerek düzenler.
  -- Metinler sıfat değil FİİL kuruyor (bkz. docs/RAKIP-ANALIZI.md).
  insert into public.about_sections (
    tenant_id, title, description, core_values, founded_year, is_published
  )
  values (
    v_tenant_id, 'Hakkımızda',
    'Bu metni panelden düzenleyip firmanızın gerçek hikayesini yazın — kuruluş yılı, uzmanlık alanı ve farkınızı anlatan 2-3 cümle yeterli.',
    array[
      'Zamanında Teslim — Sözleşmede yazan teslim tarihini taahhüt sayarız.',
      'Şeffaf Bütçe — İş kalemlerini ve maliyet değişikliklerini önceden paylaşırız.',
      'Sahada Denetim — Uygulamayı kendi mühendisimiz yerinde denetler.',
      'İş Güvenliği — Şantiye güvenlik kurallarını istisnasız uygularız.'
    ],
    2010, true
  )
  on conflict (tenant_id) do nothing;

  -- 5) İletişim.
  -- working_hours ziyaretçiye gösterilen SERBEST METİN; weekday_opens/
  -- weekday_closes ise arama motoruna giden YAPISAL veri
  -- (LocalBusiness JSON-LD openingHoursSpecification, bkz.
  -- lib/seo/localBusiness.ts). İkincisi boş kalırsa blok hiç üretilmez
  -- ve Google sonuçlarında "Açık/Kapalı" bilgisi çıkmaz — TESLIM-PAKETI.md'nin
  -- "teknik SEO baştan hazır" vaadinin en görünür parçası budur.
  -- İki alan TUTARLI kalmalı: aynı saatleri söylüyorlar.
  insert into public.contact_sections (
    tenant_id, address, phone, email, working_hours,
    weekday_opens, weekday_closes, is_published
  )
  values (
    v_tenant_id, '[Adres — panelden güncelleyin]', '[Telefon]', '__CONTACT_EMAIL__',
    'Hafta içi 08:00 - 18:00', '08:00', '18:00', true
  )
  on conflict (tenant_id) do nothing;

  -- 6) Formdan gelen mesajların bildirimi bu adrese gider (site_settings
  -- DEĞİL, tenants.contact_recipient_email — kolon seviyesinde anon'dan
  -- gizli, bkz. docs/GUVENLIK.md madde 2).
  update public.tenants
  set contact_recipient_email = '__CONTACT_EMAIL__'
  where id = v_tenant_id and contact_recipient_email is null;

  -- 7) Liste tabloları — hepsi TEK blokta, "services" sentinel olarak
  -- kullanılıyor (bu tenant'ta zaten hizmet varsa, tüm blok atlanır —
  -- yeniden çalıştırmada duplike liste satırı oluşmaz).
  if not exists (select 1 from public.services where tenant_id = v_tenant_id) then

    insert into public.services (tenant_id, title, description, icon, order_index, is_published) values
      (v_tenant_id, 'Konut İnşaatı', 'Anahtar teslim müstakil ev ve toplu konut projelerinde temelden teslime kadar tüm süreci yönetiyoruz.', 'home', 10, true),
      (v_tenant_id, 'Ticari Yapı İnşaatı', 'Ofis binası ve iş merkezi gibi ticari yapılarda zamanında teslim ve bütçe disiplini sağlıyoruz.', 'building-2', 20, true),
      (v_tenant_id, 'Renovasyon ve Tadilat', 'Mevcut yapıların güçlendirme ve modernizasyon ihtiyaçlarını minimum kesintiyle tamamlıyoruz.', 'hammer', 30, true),
      (v_tenant_id, 'Proje Yönetimi ve Danışmanlık', 'Maliyet kontrolü ve saha denetimi konusunda uçtan uca danışmanlık hizmeti veriyoruz.', 'clipboard-check', 40, false);

    -- `status`: devam | tamamlandi | planlanan (bkz. migration
    -- 20260821120000). Şablonda bilerek KARIŞIK: yeni müşteri hem
    -- rozetin nasıl göründüğünü hem durum filtresinin ne işe yaradığını
    -- ilk açılışta görür. Boş bırakılan bir proje rozet göstermez.
    -- `slug`: projenin detay sayfası adresi (/projeler/<slug>), NOT NULL
    -- ve tenant içinde benzersiz. Panelden proje eklenince başlıktan
    -- otomatik üretilir (lib/slug.ts); burada elle veriliyor çünkü şablon
    -- doğrudan SQL ile yükleniyor.
    insert into public.projects (tenant_id, slug, title, description, location, year, category, status, order_index, is_published) values
      (v_tenant_id, 'ornek-konut-projesi', 'Örnek Konut Projesi', 'Bu açıklamayı gerçek proje bilgisiyle değiştirin.', '[Şehir, İlçe]', 2023, 'Konut', 'devam', 10, true),
      (v_tenant_id, 'ornek-ticari-proje', 'Örnek Ticari Proje', 'Bu açıklamayı gerçek proje bilgisiyle değiştirin.', '[Şehir, İlçe]', 2022, 'Ticari', 'tamamlandi', 20, true),
      (v_tenant_id, 'ornek-renovasyon-projesi', 'Örnek Renovasyon Projesi', 'Bu açıklamayı gerçek proje bilgisiyle değiştirin.', '[Şehir, İlçe]', 2021, 'Renovasyon', 'tamamlandi', 30, false),
      (v_tenant_id, 'ornek-altyapi-projesi', 'Örnek Altyapı Projesi', 'Bu açıklamayı gerçek proje bilgisiyle değiştirin.', '[Şehir, İlçe]', 2020, 'Altyapı', 'planlanan', 40, false);

    insert into public.testimonials (tenant_id, author_name, author_title, quote, rating, order_index, is_published) values
      (v_tenant_id, 'Örnek Müşteri Adı', 'Proje/Firma', 'Bu alanı gerçek bir müşteri yorumuyla değiştirin — panelden Referanslar bölümünden düzenlenir.', 5, 10, true),
      (v_tenant_id, 'Örnek Müşteri Adı 2', 'Proje/Firma', 'Bu alanı gerçek bir müşteri yorumuyla değiştirin.', 5, 20, false);

    insert into public.faqs (tenant_id, question, answer, order_index, is_published) values
      (v_tenant_id, 'İnşaat süreci ortalama ne kadar sürer?', 'Bu cevabı firmanızın gerçek süreçlerine göre düzenleyin.', 10, true),
      (v_tenant_id, 'Fiyat teklifi nasıl alabilirim?', 'İletişim formundan proje bilgilerinizi iletirseniz size dönüş yaparız.', 20, true),
      (v_tenant_id, 'Hangi bölgelerde hizmet veriyorsunuz?', 'Bu cevabı firmanızın hizmet bölgesine göre düzenleyin.', 30, false);

    insert into public.team_members (tenant_id, full_name, role, bio, order_index, is_published) values
      (v_tenant_id, '[Ad Soyad]', 'Genel Müdür', 'Bu alanı gerçek ekip bilgisiyle değiştirin — panelden Ekip bölümünden düzenlenir.', 10, true),
      (v_tenant_id, '[Ad Soyad]', 'Proje Yöneticisi', 'Bu alanı gerçek ekip bilgisiyle değiştirin.', 20, false);

    insert into public.stats (tenant_id, label, value, suffix, order_index, is_published) values
      (v_tenant_id, 'Tamamlanan Proje', 25, '+', 10, true),
      (v_tenant_id, 'Yıllık Deneyim', 10, '+', 20, true),
      (v_tenant_id, 'Memnun Müşteri', 100, '+', 30, true);

  end if;

  -- 8) Bölüm sırası/görünürlüğü — page_sections BİLEREK seed.sql'de DEĞİL
  -- (Akme'nin kendi migration'ında, 20260810120000) — bu, yeni bir
  -- kurulumda EN ÇOK atlanan adımdır: bu tablo boşsa ana sayfa TAMAMEN
  -- BOŞ görünür (hiçbir bölüm render edilmez), hata da vermez, sessizce
  -- boş kalır. unique(tenant_id, section_key) sayesinde idempotent.
  insert into public.page_sections (tenant_id, section_key, order_index, is_visible, variant) values
    (v_tenant_id, 'hero', 10, true, 'a'),
    (v_tenant_id, 'about', 20, true, null),
    (v_tenant_id, 'services', 30, true, 'icon'),
    (v_tenant_id, 'projects', 40, true, 'grid'),
    (v_tenant_id, 'testimonials', 50, true, 'grid'),
    (v_tenant_id, 'stats', 60, true, null),
    (v_tenant_id, 'faq', 70, true, 'single'),
    (v_tenant_id, 'cta', 90, true, null)
  on conflict (tenant_id, section_key) do nothing;

  -- 'team' ve 'contact' BİLEREK YOK — 2026-08-13'te ana sayfadan çıkarılıp
  -- kendi sayfalarına taşındılar (/ekip, /iletisim; bkz. migration
  -- 20260813120000_split_team_contact_into_pages.sql ve docs/PRD.md madde
  -- 3.3). Bu şablon onları 2026-08-20'ye kadar hâlâ page_sections'a
  -- `is_visible = true` ile ekliyordu; yani her YENİ müşteri kurulumunda
  -- Ekip ve İletişim hem ana sayfada hem kendi sayfasında görünecek,
  -- içerik ikiye katlanacaktı (2026-08-20 mentör denetimi, bulgu 07).
  -- Kodun tamamı (lib/sections/config.ts STATIC_NAV_LINKS,
  -- buildSectionNavLinks) bu iki bölümün ana sayfada OLMADIĞINI varsayıyor.
  --
  -- Not: order_index'te 80 ve 100 bilerek boş bırakıldı — mevcut
  -- kurulumların sıralamasıyla karşılaştırma yapmak kolay kalsın diye.

  raise notice 'Kurulum tamamlandı — tenant_id: %', v_tenant_id;
end $$;
