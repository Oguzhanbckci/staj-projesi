# Demo İçerik — Akme İnşaat

Bu dosya, geliştirme ve demo amaçlı hazırlanmış **gerçekçi ama kurgusal**
inşaat firması içeriğidir. Tenant olarak `supabase/seed.sql`'deki mevcut
"Akme İnşaat" kaydı temel alındı. Beş kategori de (Hizmetler, Projeler,
Referanslar, SSS, Ekip Üyeleri) artık `docs/PRD.md` kapsamında ve
veritabanı şemasında var (bkz. `docs/VERİ-MODELİ.md`, `docs/karar-gunlugu.md`
2026-08-07) — çalışır SQL karşılığı `supabase/seed.sql`'de.

Görsel alanları (`image_path`, `photo_path`) gerçek dosya yolu değil,
yer tutucu (placeholder) — gerçek görseller Storage'a yüklenince güncellenir.

---

## Hizmetler (6) — `services` tablosuna uyar

1. **Konut İnşaatı**
   Anahtar teslim müstakil ev ve toplu konut projelerinde temelden teslime
   kadar tüm süreci yönetiyoruz — statik projeden iç mekân uygulamalarına
   kadar tek elden.
   *İkon: `home`*

2. **Ticari Yapı İnşaatı**
   Ofis binası, alışveriş merkezi ve iş merkezi gibi ticari yapılarda
   zamanında teslim ve bütçe disiplinine odaklanan bir inşaat süreci
   sunuyoruz.
   *İkon: `building-2`*

3. **Renovasyon ve Tadilat**
   Mevcut yapıların güçlendirme, tadilat ve modernizasyon ihtiyaçlarını,
   yapı ruhsatından uygulamaya kadar minimum kesinti ile tamamlıyoruz.
   *İkon: `hammer`*

4. **Mimari Proje ve Tasarım**
   Konsept tasarımdan uygulama projesine, iç mimariden 3D görselleştirmeye
   kadar mimari süreçlerin tamamını kendi ekibimizle yürütüyoruz.
   *İkon: `pencil-ruler`*

5. **Altyapı ve Zemin Etüdü**
   İnşaata başlamadan önce zemin etüdü, altyapı bağlantıları ve statik
   analizle projenin sağlam bir temele oturmasını garanti ediyoruz.
   *İkon: `layers`*

6. **Proje Yönetimi ve Danışmanlık**
   Kendi yürütmediğimiz projelerde de maliyet kontrolü, süre planlaması ve
   saha denetimi konusunda danışmanlık hizmeti veriyoruz.
   *İkon: `clipboard-check`*

---

## Projeler (8) — `projects` tablosuna uyar

| # | Başlık | Konum | Yıl | Açıklama |
|---|---|---|---|---|
| 1 | Vadi Konutları | Ankara, Çankaya | 2023 | 120 bağımsız birimlik, yeşil alan ağırlıklı toplu konut projesi. |
| 2 | Marina Rezidans | İzmir, Karşıyaka | 2022 | Deniz manzaralı 8 katlı rezidans, sosyal tesis ve kapalı otopark dahil. |
| 3 | Akme Plaza | İstanbul, Ümraniye | 2021 | A sınıfı ofis binası, 14 kat, LEED sertifikası hedefiyle inşa edildi. |
| 4 | Yeşil Vadi Toplu Konut | Bursa, Nilüfer | 2024 | 200 üniteli, enerji verimli izolasyon sistemine sahip toplu konut. |
| 5 | Merkez İş Merkezi | Ankara, Kızılay | 2020 | Şehir merkezinde 10 katlı karma kullanım (ofis + mağaza) binası. |
| 6 | Sahil Konutları | Antalya, Konyaaltı | 2023 | Sahile 300 metre mesafede, havuzlu site konsepti 60 villa. |
| 7 | Endüstri Parkı Depo Kompleksi | Kocaeli, Gebze | 2019 | 15.000 m² kapalı alanlı lojistik ve depo tesisi. |
| 8 | Kültür ve Kongre Merkezi | Konya, Selçuklu | 2022 | 1200 kişilik çok amaçlı salon ve fuaye alanlarından oluşan kompleks. |

(`image_path`: her proje için `projects/<slug>.jpg` formatında yer tutucu
kullanılabilir, ör. `projects/vadi-konutlari.jpg`. `live_url` bu projeler
için boş bırakıldı — tenant kullanımında genelde doldurulmaz, platform
sahibinin kendi portfolyosunda kullanılır.)

---

## Referanslar (4) — `testimonials` tablosuna uyar

1. **Mehmet Yılmaz** — Vadi Konutları Site Yönetimi
   "Akme İnşaat ile çalışmak süreci çok kolaylaştırdı; teslim tarihine
   sadık kaldılar ve malzeme kalitesinden hiç ödün vermediler."
   ⭐⭐⭐⭐⭐

2. **Ayşe Demir** — Marina Rezidans, Daire Sahibi
   "Anahtar teslim aldığımız dairemizde tadilat ihtiyacı bile çıkmadı,
   işçilik gerçekten özenliydi."
   ⭐⭐⭐⭐⭐

3. **Kaya Holding A.Ş.** — Akme Plaza Yatırımcısı
   "Ticari bir yapıda bütçe ve süre disiplini en kritik konu; Akme bu ikisini
   de sözleşmeye birebir uydurdu."
   ⭐⭐⭐⭐

4. **Selim Arslan** — Endüstri Parkı, Operasyon Müdürü
   "Depo kompleksimizin zemin etüdünden teslimine kadar her aşamada şeffaf
   bir iletişim vardı, sürpriz maliyetle karşılaşmadık."
   ⭐⭐⭐⭐⭐

---

## SSS (5) — `faqs` tablosuna uyar

1. **İnşaat süreci ortalama ne kadar sürer?**
   Proje büyüklüğüne göre değişir; ortalama bir konut projesi 12-18 ay,
   ticari yapılar 18-30 ay arasında tamamlanır. Kesin süre, sözleşme
   aşamasında proje bazlı belirlenir.

2. **Fiyat teklifi nasıl alabilirim?**
   İletişim formundan proje bilgilerinizi (arsa/bina büyüklüğü, konum,
   kullanım amacı) ilettiğinizde, ekibimiz sizinle iletişime geçip yerinde
   keşif sonrası detaylı teklif hazırlar.

3. **Ruhsat ve izin işlemlerini siz mi takip ediyorsunuz?**
   Evet, yapı ruhsatı, iskân ve ilgili belediye/kurum izin süreçlerinin
   tamamı proje kapsamına dahildir, ayrıca bir danışmanlık ücreti alınmaz.

4. **Tamamlanan işler için garanti veriyor musunuz?**
   Tüm projelerde yapısal işler için yasal 5 yıllık ayıp garantisi
   uygulanır; ayrıca ince işçilikte 2 yıllık ek garanti sağlıyoruz.

5. **Hangi bölgelerde hizmet veriyorsunuz?**
   Şu an Ankara, İstanbul, İzmir, Bursa, Antalya, Kocaeli ve Konya
   illerinde aktif proje yürütüyoruz; diğer bölgeler için önce fizibilite
   değerlendirmesi yapılır.

---

## Ekip Üyeleri (4) — `team_members` tablosuna uyar

1. **İnşaat Mühendisi Ahmet Kara** — Genel Müdür
   18 yıllık sektör deneyimiyle şirketin kuruluşundan bu yana tüm büyük
   ölçekli projelerin genel koordinasyonunu yürütüyor.
   *Fotoğraf: `team/ahmet-kara.jpg`*

2. **Mimar Elif Şahin** — Tasarım Direktörü
   Konsept tasarımdan uygulama projesine kadar mimari süreçlerin başında;
   sürdürülebilir ve enerji verimli tasarım konusunda uzmanlaşmış.
   *Fotoğraf: `team/elif-sahin.jpg`*

3. **İnşaat Mühendisi Burak Öztürk** — Proje Yöneticisi
   Saha planlaması, alt yüklenici koordinasyonu ve zaman çizelgesi
   yönetiminden sorumlu; 10 yılı aşkın proje yönetimi tecrübesi var.
   *Fotoğraf: `team/burak-ozturk.jpg`*

4. **Saha Şefi Hüseyin Aydın** — Uygulama Sorumlusu
   Şantiye güvenliği, kalite kontrol ve günlük uygulama denetiminden
   sorumlu; sahada 20 yıla yakın tecrübesi bulunuyor.
   *Fotoğraf: `team/huseyin-aydin.jpg`*
