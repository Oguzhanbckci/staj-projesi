-- Doğrulama amaçlı örnek veri (bkz. docs/VERİ-MODELİ.md).
-- tenant_id üzerinde UNIQUE olan tablolarda (site_settings, hero_sections,
-- about_sections, contact_sections) 2 satır = 2 farklı tenant.
-- contact_messages'ta 2 satır aynı tenant altında.
-- services (6) ve projects (8) Akme İnşaat altında, gerçekçi demo içeriği
-- olarak hazırlandı (bkz. content/demo-icerik.md) — order_index 10'ar
-- artıyor (araya ekleme payı için), yarısı is_published=true yarısı false
-- (yayın filtresi test edilebilsin diye).

insert into public.tenants (id, name, domain, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Akme İnşaat', 'akmeinsaat.com.tr', true),
  ('22222222-2222-2222-2222-222222222222', 'Yıldız Yapı', 'yildizyapi.com.tr', true);

insert into public.site_settings (tenant_id, logo_path, primary_color, seo_title) values
  ('11111111-1111-1111-1111-111111111111', 'akme/logo.png', '#0f172a', 'Akme İnşaat | Kurumsal Web Sitesi'),
  ('22222222-2222-2222-2222-222222222222', 'yildiz/logo.png', '#1e3a8a', 'Yıldız Yapı | Kurumsal Web Sitesi');

insert into public.hero_sections (tenant_id, title, subtitle, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Güvenle İnşa Ediyoruz', '30 yıllık tecrübe', true),
  ('22222222-2222-2222-2222-222222222222', 'Geleceğin Yapıları', 'Modern ve sürdürülebilir mimari', true);

insert into public.about_sections (tenant_id, title, description, founded_year, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Hakkımızda', 'Akme İnşaat 1995 yılından beri hizmet vermektedir.', 1995, true),
  ('22222222-2222-2222-2222-222222222222', 'Hakkımızda', 'Yıldız Yapı, konut ve ticari projeler geliştirir.', 2008, true);

-- Hizmetler: 6 satır, order_index 10'ar artıyor (araya ekleme payı bırakmak
-- için), 3'ü yayında (true) 3'ü değil (false) — yayın filtresi test edilebilsin.
insert into public.services (tenant_id, title, description, icon, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Konut İnşaatı', 'Anahtar teslim müstakil ev ve toplu konut projelerinde temelden teslime kadar tüm süreci yönetiyoruz.', 'home', 10, true),
  ('11111111-1111-1111-1111-111111111111', 'Ticari Yapı İnşaatı', 'Ofis binası, alışveriş merkezi ve iş merkezi gibi ticari yapılarda zamanında teslim ve bütçe disiplini sağlıyoruz.', 'building-2', 20, false),
  ('11111111-1111-1111-1111-111111111111', 'Renovasyon ve Tadilat', 'Mevcut yapıların güçlendirme, tadilat ve modernizasyon ihtiyaçlarını minimum kesintiyle tamamlıyoruz.', 'hammer', 30, true),
  ('11111111-1111-1111-1111-111111111111', 'Mimari Proje ve Tasarım', 'Konsept tasarımdan uygulama projesine kadar mimari süreçlerin tamamını kendi ekibimizle yürütüyoruz.', 'pencil-ruler', 40, false),
  ('11111111-1111-1111-1111-111111111111', 'Altyapı ve Zemin Etüdü', 'İnşaata başlamadan önce zemin etüdü ve statik analizle projenin sağlam bir temele oturmasını garanti ediyoruz.', 'layers', 50, true),
  ('11111111-1111-1111-1111-111111111111', 'Proje Yönetimi ve Danışmanlık', 'Maliyet kontrolü, süre planlaması ve saha denetimi konusunda uçtan uca danışmanlık hizmeti veriyoruz.', 'clipboard-check', 60, false);

-- Projeler: 8 satır, order_index 10'ar artıyor, 4'ü yayında 4'ü değil.
-- image_path: tutarlı isimlendirme (projects/<slug>.jpg) — gerçek dosya
-- henüz Storage'a yüklenmedi, sadece yer tutucu yol.
-- `slug`: proje detay sayfasının adresi (/projeler/<slug>), NOT NULL ve
-- tenant içinde benzersiz (bkz. migration 20260821130000). Değerler
-- lib/slug.ts kurallarıyla üretildi: Türkçe harfler ASCII, boşluklar tire.
insert into public.projects (tenant_id, slug, title, image_path, location, year, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'vadi-konutlari', 'Vadi Konutları', 'projects/vadi-konutlari.jpg', 'Ankara, Çankaya', 2023, 10, true),
  ('11111111-1111-1111-1111-111111111111', 'marina-rezidans', 'Marina Rezidans', 'projects/marina-rezidans.jpg', 'İzmir, Karşıyaka', 2022, 20, false),
  ('11111111-1111-1111-1111-111111111111', 'akme-kule-ofis-binasi', 'Akme Kule Ofis Binası', 'projects/akme-kule.jpg', 'İstanbul, Ümraniye', 2021, 30, true),
  ('11111111-1111-1111-1111-111111111111', 'yesil-vadi-toplu-konut', 'Yeşil Vadi Toplu Konut', 'projects/yesil-vadi-toplu-konut.jpg', 'Bursa, Nilüfer', 2024, 40, false),
  ('11111111-1111-1111-1111-111111111111', 'merkez-is-merkezi', 'Merkez İş Merkezi', 'projects/merkez-is-merkezi.jpg', 'Ankara, Kızılay', 2020, 50, true),
  ('11111111-1111-1111-1111-111111111111', 'sahil-konutlari', 'Sahil Konutları', 'projects/sahil-konutlari.jpg', 'Antalya, Konyaaltı', 2023, 60, false),
  ('11111111-1111-1111-1111-111111111111', 'endustri-parki-depo-kompleksi', 'Endüstri Parkı Depo Kompleksi', 'projects/endustri-parki-depo.jpg', 'Kocaeli, Gebze', 2019, 70, true),
  ('11111111-1111-1111-1111-111111111111', 'kultur-ve-kongre-merkezi', 'Kültür ve Kongre Merkezi', 'projects/kultur-kongre-merkezi.jpg', 'Konya, Selçuklu', 2022, 80, false);

-- Referanslar: 4 satır, order_index 10'ar artıyor, 2'si yayında 2'si değil.
insert into public.testimonials (tenant_id, author_name, author_title, quote, rating, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Mehmet Yılmaz', 'Vadi Konutları Site Yönetimi', 'Akme İnşaat ile çalışmak süreci çok kolaylaştırdı; teslim tarihine sadık kaldılar ve malzeme kalitesinden hiç ödün vermediler.', 5, 10, true),
  ('11111111-1111-1111-1111-111111111111', 'Ayşe Demir', 'Marina Rezidans, Daire Sahibi', 'Anahtar teslim aldığımız dairemizde tadilat ihtiyacı bile çıkmadı, işçilik gerçekten özenliydi.', 5, 20, false),
  ('11111111-1111-1111-1111-111111111111', 'Kaya Holding A.Ş.', 'Akme Kule Yatırımcısı', 'Ticari bir yapıda bütçe ve süre disiplini en kritik konu; Akme bu ikisini de sözleşmeye birebir uydurdu.', 4, 30, true),
  ('11111111-1111-1111-1111-111111111111', 'Selim Arslan', 'Endüstri Parkı, Operasyon Müdürü', 'Depo kompleksimizin zemin etüdünden teslimine kadar her aşamada şeffaf bir iletişim vardı, sürpriz maliyetle karşılaşmadık.', 5, 40, false);

-- SSS: 5 satır, order_index 10'ar artıyor, 3'ü yayında 2'si değil.
insert into public.faqs (tenant_id, question, answer, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'İnşaat süreci ortalama ne kadar sürer?', 'Proje büyüklüğüne göre değişir; ortalama bir konut projesi 12-18 ay, ticari yapılar 18-30 ay arasında tamamlanır. Kesin süre sözleşme aşamasında proje bazlı belirlenir.', 10, true),
  ('11111111-1111-1111-1111-111111111111', 'Fiyat teklifi nasıl alabilirim?', 'İletişim formundan proje bilgilerinizi (arsa/bina büyüklüğü, konum, kullanım amacı) ilettiğinizde, ekibimiz sizinle iletişime geçip yerinde keşif sonrası detaylı teklif hazırlar.', 20, true),
  ('11111111-1111-1111-1111-111111111111', 'Ruhsat ve izin işlemlerini siz mi takip ediyorsunuz?', 'Evet, yapı ruhsatı, iskân ve ilgili belediye/kurum izin süreçlerinin tamamı proje kapsamına dahildir, ayrıca bir danışmanlık ücreti alınmaz.', 30, false),
  ('11111111-1111-1111-1111-111111111111', 'Tamamlanan işler için garanti veriyor musunuz?', 'Tüm projelerde yapısal işler için yasal 5 yıllık ayıp garantisi uygulanır; ayrıca ince işçilikte 2 yıllık ek garanti sağlıyoruz.', 40, true),
  ('11111111-1111-1111-1111-111111111111', 'Hangi bölgelerde hizmet veriyorsunuz?', 'Şu an Ankara, İstanbul, İzmir, Bursa, Antalya, Kocaeli ve Konya illerinde aktif proje yürütüyoruz; diğer bölgeler için önce fizibilite değerlendirmesi yapılır.', 50, false);

-- Ekip Üyeleri: 4 satır, order_index 10'ar artıyor, 2'si yayında 2'si değil.
insert into public.team_members (tenant_id, full_name, role, bio, photo_path, order_index, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Ahmet Kara', 'Genel Müdür', '18 yıllık sektör deneyimiyle şirketin kuruluşundan bu yana tüm büyük ölçekli projelerin genel koordinasyonunu yürütüyor.', 'team/ahmet-kara.jpg', 10, true),
  ('11111111-1111-1111-1111-111111111111', 'Elif Şahin', 'Tasarım Direktörü', 'Konsept tasarımdan uygulama projesine kadar mimari süreçlerin başında; sürdürülebilir ve enerji verimli tasarım konusunda uzmanlaşmış.', 'team/elif-sahin.jpg', 20, false),
  ('11111111-1111-1111-1111-111111111111', 'Burak Öztürk', 'Proje Yöneticisi', 'Saha planlaması, alt yüklenici koordinasyonu ve zaman çizelgesi yönetiminden sorumlu; 10 yılı aşkın proje yönetimi tecrübesi var.', 'team/burak-ozturk.jpg', 30, true),
  ('11111111-1111-1111-1111-111111111111', 'Hüseyin Aydın', 'Uygulama Sorumlusu (Saha Şefi)', 'Şantiye güvenliği, kalite kontrol ve günlük uygulama denetiminden sorumlu; sahada 20 yıla yakın tecrübesi bulunuyor.', 'team/huseyin-aydin.jpg', 40, false);

insert into public.contact_sections (tenant_id, address, phone, email, is_published) values
  ('11111111-1111-1111-1111-111111111111', 'Merkez Mah. No:1, İstanbul', '+90 212 000 00 00', 'info@akmeinsaat.com.tr', true),
  ('22222222-2222-2222-2222-222222222222', 'Örnek Cad. No:5, Ankara', '+90 312 000 00 00', 'info@yildizyapi.com.tr', true);

insert into public.contact_messages (tenant_id, sender_name, sender_phone, message) values
  ('11111111-1111-1111-1111-111111111111', 'Mehmet Yılmaz', '+90 532 000 00 00', 'Konut projeniz hakkında bilgi almak istiyorum.'),
  ('11111111-1111-1111-1111-111111111111', 'Ayşe Demir', '+90 533 000 00 00', 'Teklif almak için görüşmek isteriz.');

-- Platform sahibinin kendi tenant satırı (2026-08-08) — is_platform_owner
-- kısmi unique index'e göre en fazla 1 satırda true olabilir, bu o satır.
-- Bilinçli olarak sadece tenants + site_settings ekleniyor; hero/services/
-- projects/contact gibi gerçek tanıtım sitesi içeriği ayrı bir iş (bkz.
-- docs/DURUM.md "Sıradaki adım") — burada amaç sadece lib/theme/
-- (getSiteThemeSettings) sorgusunun gerçek veriyle çalıştığını doğrulamak.
-- domain, gerçek alan adı alınana kadar bir yer tutucu.
-- theme_mode=dark + theme_preset=modern-koyu bilinçli seçildi: varsayılan
-- (kurumsal-mavi/light) değerlerle aynı olsaydı, render sonucu gerçekten
-- DB'den mi geldiği yoksa fallback'e mi düştüğü ayırt edilemezdi.
insert into public.tenants (id, name, domain, is_published, is_platform_owner, theme_mode) values
  ('33333333-3333-3333-3333-333333333333', 'Platform', 'platform-sitesi.local', true, true, 'dark');

insert into public.site_settings (tenant_id, seo_title, theme_preset) values
  ('33333333-3333-3333-3333-333333333333', 'Kurumsal Web Sitesi Hizmeti', 'modern-koyu');
