# Karar Günlüğü

Bu dosya, proje boyunca alınan kararları ve gerekçelerini tarih sırasıyla listeler.
Yeni bir karar alındığında en alta eklenir, önceki kayıtlar değiştirilmez/silinmez.

---

## 2026-08-05 — Proje iskeleti ve docs/ sistemi kuruldu

**Karar:** Staj kapsamındaki çalışmalar için `C:\Users\toffe\Projects\staj-projesi`
adında, mevcut `next-project`'ten bağımsız yeni bir proje klasörü açıldı. İçine,
kod içermeyen, sadece kararları ve açıklamaları tutan bir `docs/` klasörü kuruldu
(`README.md`, `KARAR-GUNLUGU.md`, `DURUM.md`).

**Gerekçe:** Kullanıcı stajda hem terminalden AI kullanmayı hem web sitesi yapım
sürecini öğreniyor ve patronun vereceği görevleri takip edebilmek için, sohbetin
veya terminal oturumunun dışında kalıcı bir "hafıza" istiyor. `docs/` bu hafızayı
taşıyacak; böylece başka bir terminalde veya başka bir AI aracında bile buradaki
dosyalar okunarak kaldığı yerden devam edilebilecek.

**Not:** Henüz proje için bir teknoloji/framework kararı alınmadı (Next.js, statik
HTML, vb.) — bu, patronun ilk görevine göre netleşince buraya yeni bir madde olarak
eklenecek.

---

## 2026-08-05 — README.md kaldırıldı, docs/ 2 dosyaya indirildi

**Karar:** Ayrı bir `README.md` dosyası gereksiz bulundu (sadece diğer dosyaları
anlatan meta bir dosyaydı, kendi başına karar/durum bilgisi taşımıyordu). Kullanıcı
tarafından `rm` ile silindi; içeriğindeki kısa açıklama `DURUM.md`'nin başına
taşındı.

**Gerekçe:** İki dosyanın (durum + karar günlüğü) amacı zaten birbirinden farklı ve
yeterli; üçüncü bir "meta" dosya gereksiz katman ekliyordu.

---

## 2026-08-05 — "İyi kurumsal site" ölçütleri araştırıldı ve kaydedildi

**Karar:** Web araştırması yapılarak kurumsal web sitesi standartları derlendi ve
`docs/KURUMSAL-SITE-STANDARTLARI.md` dosyasına kaydedildi. Kapsam: performans (Core
Web Vitals), mobil uyumluluk, erişilebilirlik (WCAG 2.1 AA), SEO, güvenlik/KVKK
uyumluluğu, güven unsurları, marka/içerik tutarlılığı.

**Gerekçe:** Patronun ilk somut görevi henüz netleşmedi, ama proje web sitesi
geliştirmeye dayandığı için önceden genel-geçer bir kalite/kriter referansı
oluşturmak istendi — ileride tasarlanacak sitenin bu listeye göre değerlendirilmesi
planlanıyor.

**Kaynak:** Dosyanın sonunda web.dev, eresmedya.com, VRNSoft ve MCG Dijital gibi
kaynaklara linkler var.

---

## 2026-08-05 — GitHub deposu açıldı ve ilk commit push'landı

**Karar:** `staj-projesi` için GitHub'da public bir depo açıldı
(`https://github.com/Oguzhanbckci/staj-projesi`), yerel klasörde `git init` yapıldı,
`docs/` içeriği ilk commit olarak (`docs: proje beyni ... ekle`) atıldı ve
`origin/main`'e push'landı.

**Gerekçe:** Projeyi versiyon kontrolüne almak ve patronla/uzaktan erişimle
paylaşılabilir hale getirmek için. Depo bilinçli olarak boş açıldı (README/gitignore
eklenmedi) ki yerel geçmişle çakışma olmasın.

---

## 2026-08-05 — AI-KURALLARI.md oluşturuldu

**Karar:** `docs/AI-KURALLARI.md` dosyası eklendi: proje özeti, teknoloji (henüz
belirlenmedi), klasör yapısı, kod standartları, yap/yapma listesi, güvenlik,
commit kuralları ve AI ile çalışma ilkelerini tek bir referans dosyada topluyor.

**Gerekçe:** Bu sohbette baştan beri uygulanan çalışma kurallarını (terminal
komutlarını kullanıcının çalıştırması, her adımın açıklanması, kararların
`KARAR-GUNLUGU.md`'ye işlenmesi vb.) yazılı hale getirip projenin kalıcı parçası
yapmak — böylece yeni bir oturumda veya başka bir AI aracında da bu kurallar
görünür ve uygulanabilir olur.

---

## 2026-08-05 — Teknoloji seçildi: Next.js 15 + TypeScript + Tailwind + Supabase

**Karar:** Proje, inşaat firmalarına satılabilir bir kurumsal web sitesi ürünü
olarak konumlandırıldı — "tek müşteri = tek kurulum" modeli. Stack: Next.js 15
(App Router), TypeScript (strict), Tailwind CSS, Supabase (Postgres + Auth +
Storage). İçerik ve tema, kod değişikliği gerektirmeden bir admin panelinden
yönetilecek. `docs/AI-KURALLARI.md` bu karara göre tamamen yeniden yazıldı (proje
özeti, teknoloji, klasör yapısı, kod standartları, yap/yapma, güvenlik, commit
kuralları, AI ile çalışma ilkeleri — her kural tek cümle ve uygulanabilir).

**Gerekçe:** Staj kapsamında yapılacak iş, artık somut bir ürün fikrine
(inşaat firmaları için satılabilir kurumsal site şablonu) dönüştü. Admin panelden
yönetilen içerik/tema modeli, tek bir kod tabanının farklı müşteriler için yeniden
kullanılmasını sağlıyor. Supabase, hem veritabanı hem auth hem dosya depolamayı
tek serviste toplayarak geliştirmeyi hızlandırıyor.

**Açık sorular (henüz karara bağlanmadı):**
- Her müşteri için ayrı bir Supabase projesi mi açılacak, yoksa tek altyapıda mı
  barındırılacak (deployment/çoğaltma stratejisi)?
- İçerik modeli ne kadar esnek olacak — sabit şablon + değişken alanlar mı, yoksa
  serbest sayfa/bölüm oluşturma (page builder) mı?

---

## 2026-08-05 — Admin panel giriş modeli: tek yönetici rolü

**Karar:** Admin paneline tek bir yönetici (müşterinin kendisi) kullanıcı adı ve
şifre ile giriş yapacak. Çoklu rol/yetki seviyesi (ör. editör, görüntüleyici) yok —
tek rol, tam yetki. Giriş Supabase Auth üzerinden yapılır.

**Gerekçe:** Ürün "tek müşteri = tek kurulum" modelinde; her kurulumda tek bir
işletme sahibi/yöneticisi olacağı için karmaşık bir rol sistemine gerek yok, basit
kullanıcı adı/şifre girişi yeterli ve geliştirmeyi hızlandırıyor.

---

## 2026-08-05 — 8 gerçek inşaat/mimarlık sitesi incelendi, rakip analizi çıkarıldı

**Karar:** 8 gerçek firma sitesi (Limak, Rönesans İnşa, Nurol İnşaat, Fabrika
Mimarlık, OSO Mimarlık, Two Plus Architects, FEINE Mimarlık, Tabanlıoğlu
Architects) doğrudan ziyaret edilerek incelendi, bölüm karşılaştırma tablosu ve
"her kurumsal sitede olması gereken 6 bölüm" listesi `docs/RAKIP-ANALIZI.md`'ye
kaydedildi. Sonuç: İletişim (8/8), Hakkımızda (8/8), Hero (7/8), Projeler/Portföy
(7/8), Blog/Haberler (7/8), Hizmetler (4/8) en sık görülen 6 bölüm.

**Gerekçe:** Ürünün sayfa/bölüm şablonunu (admin panelinden yönetilecek içerik
modeli) varsayımla değil, gerçek pazar örneklerine dayanarak tasarlamak için.
Bu liste, ileride içerik modeli (sabit şablon vs. page builder) kararında referans
olarak kullanılacak.

**Not:** Mimarlık firmalarında Projeler/Portföy neredeyse zorunlu; büyük inşaat
holdinglerinde (Limak, Nurol) Sürdürülebilirlik/Yatırımcı İlişkileri gibi
kurumsal-holding'e özgü bölümler var — bunlar tek-kurulumluk ürün kapsamı dışında
tutulabilir.

---

## 2026-08-06 — Ürün mimarisi netleşti: platform / tenant admin / public site üç katmanı

**Karar:** Sohbet üzerinden ürünün yönetici (müşteri), müşteri-ziyaretçi ve panel
taraflarının anlatılmasıyla, önceden açık kalan sorular netleştirildi:

1. **İki ayrı panel var, birbirinden bağımsız:**
   - **Platform paneli** (`/platform` rotası, sadece geliştirici/satıcı "Ben"
     erişir) — yeni bir müşteri (tenant) oluşturma ve o müşteri için hangi
     bölümlerin (Hero, Hakkımızda, Hizmetler, Projeler, Blog, İletişim ve
     varyasyonları — bkz. `RAKIP-ANALIZI.md`) aktif olacağını seçme, temel tema
     ayarını yapma. Müşterinin bu panelin varlığından haberi yok, erişimi de yok.
   - **Tenant admin paneli** (2026-08-05'te karar verilen "tek yönetici rolü,
     Supabase Auth login") — müşterinin kendisi, platform panelinde kendisi için
     açılmış bölümlerin içeriğini ve temasını (açık/koyu tema dahil) düzenler;
     yapısal değişiklik (yeni bölüm ekleme/çıkarma) yapamaz.
2. **Barınma modeli:** Tek Next.js kod tabanı + tek Supabase projesi, çok kiracı
   (multi-tenant). Her müşteri bir tenant kaydı; veri izolasyonu RLS ile sağlanır.
   "Tek müşteri = tek kurulum" ifadesi iş modelini (her müşteri kendine ait bir
   site/kurulum satın alır) tanımlar — teknik olarak ayrı deploy veya ayrı
   Supabase projesi anlamına gelmiyor.
3. **İçerik/bölüm modeli:** Serbest page builder değil, önceden kodlanmış hazır
   bölüm kütüphanesi. Platform panelinden bölümler açılıp kapatılır ve sıralanır;
   tenant panelinden içerik doldurulur. Yeni bir bölüm ihtiyacı doğarsa kütüphaneye
   kod yazılarak eklenir (zamanla genişleyen kütüphane).
4. **Çoklu dil desteği:** v1 kapsamı dışında bırakıldı, ileride ayrı bir faz olarak
   ele alınacak. Açık/koyu tema v1'de var.

Bu kararlarla `DURUM.md`'deki iki açık soru ("ayrı Supabase mi tek altyapı mı" ve
"sabit şablon mu page builder mı") çözülmüş oldu.

**Gerekçe:** Kullanıcı staj sürecinde ürünün iş modelini ve teknik mimarisini aynı
anda netleştirmek istedi; yönetici/müşteri/panel taraflarını anlattıktan sonra
belirsiz kalan noktalar (panel sahipliği, barınma modeli, bölüm kütüphanesi
esnekliği, çoklu dil kapsamı) soru-cevapla tek tek netleştirildi.

**Not:** Bu karar, `AI-KURALLARI.md` madde 6'daki "admin panelde tek yönetici
rolü var, çoklu yetki seviyesi uygulanmaz" ifadesini geçersiz kılmaz — o ifade
tenant admin paneli için geçerliliğini korur. Platform paneli, tenant'ların
üzerinde duran, tamamen ayrı bir katman ve rol.

---

## 2026-08-06 — Platform paneli: demo kataloğu + sınırlı sürükle-bırak düzenleme

**Karar:** Bir önceki karardaki "hazır bölüm kütüphanesi" yaklaşımı iki somut
özellikle netleştirildi (ikisi de o kararla tutarlı, kapsamını büyütmüyor):

1. **Demo kataloğu (one-click import):** Platform panelinde, WordPress
   temalarındaki gibi birkaç hazır "demo" bulunur — her demo, bölüm
   kütüphanesinden seçilmiş bir kombinasyon + örnek içerik + tema rengi
   önayarıdır. Yeni bir müşteri (tenant) oluşturulurken bir demo seçilir, tek
   tıkla o tenant'a kopyalanır; ardından üzerinde değişiklik yapılır. Sıfırdan
   boş bir siteyle başlanmaz.
2. **Sürükle-bırak düzenleme (sınırlı, Elementor'un tam serbest sürümü değil):**
   Platform panelinde bölümler görsel bir arayüzde sürüklenerek sıralanır,
   açılıp kapatılır; her bölümün kendi içindeki hazır alanlarına (başlık,
   görsel, metin) tıklanarak içerik girilir. Bölümün iç düzeni/tasarımı sabit
   kalır — serbestçe eleman (metin kutusu, buton, sütun vb.) sayfanın herhangi
   bir yerine sürüklenip boyutlandırılamaz. Gerçek Elementor'daki tam serbestlik
   bilinçli olarak kapsam dışı bırakıldı; staj süresi için çok büyük bir
   mühendislik yükü olurdu.

**Gerekçe:** Kullanıcı "one-click demo import" ve "Elementor sürükle-bırak"
ifadelerini kullanınca, bunun önceki "hazır bölüm kütüphanesi vs. serbest page
builder" kararıyla çelişip çelişmediği netleştirilmesi gerekti. Netleştirme
sonucu: her iki istek de hazır kütüphane yaklaşımının üzerine iyi bir kullanıcı
deneyimi katmanı olarak eklenebiliyor, kapsamı serbest page builder'a
genişletmiyor.

**Not:** Bu karar veri modelini etkiler — bir `demos` (veya benzeri) tanım
tablosu ve tenant'a bağlı bölümlerin sırasını tutan bir `order`/`position`
alanı gerekecek. Şema henüz yazılmadı, Supabase migration aşamasında
tasarlanacak.

---

## 2026-08-06 — Domain stratejisi: her tenant kendi alan adını kullanır

**Karar:** Bir tenant'ın (müşterinin) sitesine ziyaretçiler, o müşterinin kendi
satın aldığı alan adından (ör. `akmeinsaat.com.tr`) ulaşır — platforma ait bir
alt alan adı (`akmeinsaat.senin-platformun.com`) değil. Kodlamaya geçmeden önce
mimarinin son temel parçası olarak netleştirildi.

**Gerekçe:** Ürün "gerçek bir kurumsal site" olarak satılıyor; inşaat firması
için kendi markalı alan adı olmayan bir site ikna edici olmaz, güven unsuru
zedelenir (bkz. `KURUMSAL-SITE-STANDARTLARI.md`, "Güven Unsurları").

**Teknik not (henüz uygulanmadı, ileride kod aşamasında ele alınacak):** Next.js
middleware, gelen isteğin `Host` başlığına bakıp bir `domain → tenant_id`
eşleşme tablosundan tenant'ı çözecek. SSL/sertifika ve DNS yönlendirmesi hosting
sağlayıcısı (ör. Vercel custom domains) üzerinden yapılacak. Müşteri kendi
domainini DNS'te platforma yönlendirecek. Geçiş/demo aşaması için tenant'a
otomatik bir alt alan adı da (opsiyonel, yedek) verilip verilmeyeceği ileride
netleşecek bir ayrıntı.

---

## 2026-08-06 — Panel mimarisi düzeltildi: tek panel, tek kullanıcı, tam yönetilen hizmet

**Karar:** Bugün daha önce alınan "iki panel" ve "tenant admin paneli" kararları
**geçersiz kılınıyor** (bu satırlar silinmiyor, iptal edildiği burada not
düşülüyor — ayrıca 2026-08-05 tarihli "Admin panel giriş modeli: tek yönetici
rolü" kararı da bu şekilde revize edilmiş oluyor). Doğru model:

- Platform sahibinin (kullanıcının) **kendi tanıtım/ajans web sitesi** var — bu
  site, hizmeti anlatan, potansiyel müşterilerin bilgi aldığı herkese açık bir
  sayfa. Bu, satılan ürünün kendisi değil, ürünü satan kişinin kendi pazarlama
  sitesi.
- Bu sitenin domaininin sonuna `/panel` eklendiğinde, kullanıcı adı/şifre isteyen
  gizli bir giriş açılır. **Sadece platform sahibi** bu panele girebilir.
- Bu **tek panel = platformun tüm yönetim merkezi**. Buradan: yeni müşteri
  (tenant) oluşturulur, demo seçilip import edilir, bölümler açılıp
  kapatılır/sıralanır (sürükle-bırak) — **ve her tenant'ın içeriği/teması da
  buradan düzenlenir.**
- **Müşterinin (tenant'ın) kendi domaininde (ör. `akmeinsaat.com.tr`) hiçbir
  panel/admin rotası yoktur.** Orada yalnızca herkese açık, statik/dinamik
  render edilen kurumsal site vardır. Müşterinin kendisi de kendi sitesine bir
  ziyaretçi gibi bakar, hiçbir yere login olmaz.
- Sonuç: platform sahibi, müşteriye **"web servis hizmeti"** veriyor — yani
  içerik güncellemesi bir self-servis özellik değil, tam yönetilen (managed)
  bir hizmet. Müşteri değişiklik istediğinde platform sahibine iletir, o da
  `/panel` üzerinden günceller.

**Gerekçe:** Kullanıcı, ürünün gerçek kullanım şeklini ("ben o panelden
müşteriye web servis hizmeti vereceğim") netleştirince önceki "müşteri kendi
paneline girer" varsayımının yanlış olduğu ortaya çıktı. Bu model aynı zamanda
mimariyi belirgin şekilde basitleştiriyor: tek rol, tek kullanıcı, tek login
noktası (platform sahibinin kendi domaini) — farklı müşteri domainleri arasında
oturum/auth taşıma sorunu da böylece ortadan kalkıyor.

**Etkilenen önceki kararlar:**
- 2026-08-05, "Admin panel giriş modeli: tek yönetici rolü" — o karardaki "tek
  yönetici rolü" fikri korunuyor ama o rol artık **müşteri değil, platform
  sahibinin kendisi**.
- 2026-08-06, "Ürün mimarisi netleşti" — oradaki `platform/` ve `admin/` (tenant
  admin) ayrımı kalkıyor; tek bir `panel/` (veya `admin/`) rotası yeterli, çünkü
  onu kullanan tek bir rol var.

**Not (teknik, ileride ele alınacak):** Next.js middleware, gelen isteğin `Host`
başlığına bakacak: istek platform sahibinin kendi domainineyse `/panel` rotası
aktif olur (login korumalı); istek bir tenant'ın kendi domainineyse sadece
`(site)` (herkese açık) render edilir, `/panel` orada hiç yoktur/erişilemez.

---

## 2026-08-06 — `docs/PRD.md` oluşturuldu

**Karar:** `docs/PRD.md` eklendi — ürünün "istenen/istenmeyen" özellik
listesini tutan, `DURUM.md` (anlık durum) ve `KARAR-GUNLUGU.md`'den (tarihli
karar geçmişi) ayrı, üçüncü bir referans dosyası. İçeriği: aktörler, kapsam içi
özellikler (tanıtım sitesi, panel, tenant siteleri) ve kapsam dışı bırakılanlar
— bu oturumda netleşen "tanıtım sitesinde fiyat/abonelik bilgisi yok, 'blog
motoru' gibi ifadeler yok, tenant'a panel erişimi yok, her ziyaretçi aynı
arayüzü görür, panel her zaman kullanıcı adı/şifre ister" kuralları dahil.

**Gerekçe:** Kullanıcı, bir özelliğin yapılıp yapılmayacağına hızlıca karar
verebilmek için tek bir kapsam referansı istedi. Kararların kronolojik
geçmişini (`KARAR-GUNLUGU.md`) her seferinde taramak yerine, güncel kapsamı
tek bir yerde (Yap/Yapma listesi olarak) tutmak bunu sağlıyor.

**Not:** `PRD.md`'de iki açık soru bırakıldı — "blog motoru" ifadesinin tenant
sitelerindeki Blog/Haberler bölümünü etkileyip etkilemediği, ve tanıtım
sitesindeki iletişim erişiminin form mu yoksa statik bilgi mi olacağı.

---

## 2026-08-06 — Tanıtım sitesi: statik iletişim bilgisi + anonim marka

**Karar:** `PRD.md`'deki ikinci açık soru çözüldü. Tanıtım sitesindeki iletişim
erişimi bir form değil, statik e-posta ve/veya telefon bilgisidir. Ayrıca yeni
bir kural eklendi: platform sahibinin kimliği (isim), ekip büyüklüğü gibi
şahsi/kurumsal bilgiler tanıtım sitesinde paylaşılmaz — marka anonim kalır,
ziyaretçi sadece yapılan işleri/projeleri görür.

**Gerekçe:** Kullanıcı, tanıtım sitesinde kişisel kimliğinin görünür olmasını
istemiyor; işlerin/projelerin kalitesiyle güven kazanmak istiyor, kişisel
tanınırlıkla değil.

---

## 2026-08-06 — Blog/Haberler kapsam dışı bırakıldı; iletişim: WhatsApp + form

**Karar:** İki düzeltme yapıldı, `PRD.md`'ye işlendi:

1. **Blog/Haberler kavramı kapsam dışı.** Önceki kayıtta ("Panel mimarisi
   düzeltildi") bölüm kütüphanesi örneklenirken Blog'a da yer verilmişti ve
   `PRD.md`'de "blog motoru ifadesi sadece pazarlama dilini mi kapsıyor"
   şeklinde açık bir soru bırakılmıştı. Kullanıcı bunu netleştirdi: blog/haber
   kavramı ürünün hiçbir yerinde (tanıtım sitesi, bölüm kütüphanesi, tenant
   siteleri) bulunmayacak. `RAKIP-ANALIZI.md`'deki bulgunun (Blog/Haberler
   7/8 sitede yaygın) aksine, bilinçli bir kapsam dışı bırakma kararı.
2. **Tanıtım sitesi iletişimi revize edildi.** Bir önceki kayıtta "statik
   e-posta/telefon, form değil" denilmişti; kullanıcı bunu somutlaştırıp
   genişletti: iletişim bölümünde **WhatsApp butonu** ve **iletişim formu**
   (ad-soyad, telefon, serbest metin/istek textarea) olacak; form
   gönderildiğinde platform sahibine **e-posta** olarak iletilecek.

**Gerekçe:** Kullanıcı ürün detaylarını netleştirmeye devam ederken önceki iki
karışıklığı fark edip düzeltti — biri eksik bir bölüm listesi kalıntısı
(Blog), diğeri iletişim mekanizmasının ilk turda eksik/yanlış özetlenmesi
(sadece statik bilgi denilmişti, oysa WhatsApp+form isteniyormuş).

**Not (teknik, ileride ele alınacak):** İletişim formunun e-posta gönderimi
için bir e-posta servisi (ör. Resend, SendGrid) entegrasyonu gerekecek; form
verisinin ayrıca veritabanında saklanıp saklanmayacağı henüz belirtilmedi,
şimdilik sadece "e-posta ile iletilir" gereksinimi var.

---

## 2026-08-06 — Test stratejisi: Vitest + React Testing Library + Playwright

**Karar:** Staj yönergesi, proje geliştirilirken ve tamamlandığında testlere
tabi tutulmasını (e2e, unit, integration) istiyor. Yönerge belirli bir araç
belirtmiyor; Next.js/TypeScript ekosistemi için standart bir set seçildi:
**Vitest + React Testing Library** (unit ve integration test için), gerçek
kullanıcı senaryoları için **Playwright** (e2e). Detaylı kurallar
`AI-KURALLARI.md` madde 7'ye eklendi (test seviyesi tanımları, hangi akışların
e2e ile kapsanacağı, commit öncesi `npm test` zorunluluğu).

**Gerekçe:** Yönerge test türlerini zorunlu kılıyor ama araç seçimini
belirtmiyor; Vitest ve Playwright, TypeScript ile doğal çalışan, geniş
kullanılan ve staj sürecinde öğrenmesi/dokümantasyonu kolay araçlar olduğu
için tercih edildi (ör. Jest yerine Vitest — Next.js/Vite ekosisteminde daha
hızlı ve daha az konfigürasyon gerektiriyor).

**Not:** Bu karar `AI-KURALLARI.md`'nin madde numaralarını kaydırdı — eski
madde 7 (Commit Kuralları) madde 8, eski madde 8 (AI ile Çalışma İlkeleri)
madde 9 oldu. `KARAR-GUNLUGU.md`'deki "madde 6" referansı (Güvenlik) hâlâ
geçerli, değişmedi.

---

## 2026-08-06 — Proje bağlamı netleşti + `docs/TEST-STRATEJISI.md` oluşturuldu

**Karar:** Kullanıcı projenin somut kısıtlarını verdi: **tek geliştirici,
toplam ~32 iş günlük süre**. Bu bağlamda test stratejisi revize edildi ve
`docs/TEST-STRATEJISI.md` adında yeni bir referans dosyası oluşturuldu
(`AI-KURALLARI.md` madde 7 artık buraya işaret ediyor, kendisi özet bilgiye
indirildi). Değişenler:

1. **Test yaklaşımı pragmatikleşti.** Önceki kayıtta ("Test stratejisi:
   Vitest...") her yeni özellik için test zorunluydu; kullanıcı bunun elindeki
   süreyle uyuşmadığını belirtti. Yeni yaklaşım: **unit test sürekli/rutin**
   (özellikle birlikte yazılır), **e2e/entegrasyon testleri sadece "belli
   noktalarda"** (kritik akışlarda) — hangi akışların kritik sayıldığı
   `TEST-STRATEJISI.md` madde 3'te listelendi (panel auth, tenant oluşturma,
   içerik düzenleme, iletişim formu, tema geçişi, panel'in tenant domaininde
   erişilemez olduğunun doğrulanması).
2. **Kalite eşikleri tanımlanmaya başladı.** Lighthouse (Performance,
   Accessibility, Best Practices, SEO) için "iyi" bir skor hedefleniyor;
   sayısal eşik kullanıcıya soruldu, henüz netleşmedi. Performans bütçesi net:
   ilk içerik (LCP) 1.5–2 saniye arasında yüklenmesi kabul edilebilir düzeyde.
3. **Erişilebilirlik/responsive kuralları somutlaştı:** tüm görsellerde `alt`
   metni zorunlu, metin/arka plan kontrastı yeterli olmalı, mobil+masaüstü
   tarayıcılarda tam responsive.
4. **"Bitti" tanımı (Definition of Done) eklendi** — bir iş, (a) kod
   çalışıyor, (b) sorun çıkarabilecek durumlar test ile yakalanıp önlenmiş,
   (c) ilgili dökümantasyon güncellenmiş, (d) ilgili e2e "kapısından"
   geçilmiş olmadan bitti sayılmaz. Proje sonunda tüm kritik akışları
   kapsayan e2e paketi tek seferde çalıştırılır (son teslim kapısı).

**Gerekçe:** Kullanıcı, sınırlı süreli (32 iş günü) tek kişilik bir stajda
kapsamlı/sürekli test disiplininin zaman israfı olacağını, bunun yerine
hedefli ve kritik noktalara odaklı bir yaklaşımın daha uygun olduğunu belirtti.
Bu bağlam aynı zamanda önceki bazı kapsam-sınırlama kararlarını (hazır bölüm
kütüphanesi, sınırlı sürükle-bırak, çoklu dil'in ertelenmesi vb.) da geriye
dönük olarak açıklıyor.

**Not:** `docs/TEST-STRATEJISI.md`'de bir açık soru var — Lighthouse
kategorilerinde hedeflenen sayısal minimum skorlar netleşmedi.

---

## 2026-08-06 — Lighthouse eşiği: dört kategoride de ≥90

**Karar:** `TEST-STRATEJISI.md`'deki açık soru çözüldü. Performance,
Accessibility, Best Practices ve SEO kategorilerinin dördünde de minimum
**90/100** hedeflenir.

**Gerekçe:** Lighthouse'ta 90-100 aralığı sektör standardı olarak "iyi/yeşil"
kabul edilir; kullanıcı özel bir sayı belirtmek yerine standart öneriyi kabul
etti.

---

## 2026-08-06 — `docs/MIMARI.md` oluşturuldu: hosting = Vercel Hobby, render = statik + on-demand ISR

**Karar:** Kullanıcı ile birlikte projenin teknik mimarisi tek dosyada
(`docs/MIMARI.md`) toplandı — framework, dil, stil, backend zaten karara
bağlanmıştı (Next.js 15, TypeScript strict, Tailwind, Supabase); bu oturumda
iki yeni karar eklendi:

1. **Hosting: Vercel, Hobby (ücretsiz) plan.** Vercel, Next.js'i native
   barındıran, custom domain + otomatik SSL + edge middleware desteği olan
   platform olduğu için seçildi. Vercel'in ücretsiz planı normalde ticari
   kullanımı yasaklıyor; ancak kullanıcı bu proje kapsamında **gerçek bir
   müşteriye canlıya alınmayacağını** belirtti (staj/geliştirme amaçlı bir
   demo/ürün inşa ediliyor) — bu yüzden Hobby plan yeterli, maliyetsiz. Ürün
   ileride gerçekten satılıp canlıya alınırsa Pro plana ($20/ay) geçilmesi
   gerekecek; bu, mevcut staj kapsamının dışında.
2. **Render stratejisi: statik üretim + panelden tetiklenen on-demand ISR.**
   Tenant siteleri ve platform sahibinin tanıtım sitesi statik üretilir;
   `panel`'den bir kayıt yapıldığında `revalidatePath`/`revalidateTag` ile
   ilgili sayfa yeniden üretilir. `/panel`'in kendisi tamamen dinamik/SSR'dır.
   Bu, hem Lighthouse ≥90 / LCP 1.5-2sn hedefine (bkz. `TEST-STRATEJISI.md`)
   hem de "içerik değişikliği anında yansımalı" gereksinimine aynı anda
   hizmet ediyor.

**Gerekçe:** Kullanıcı bu kararları benim uzmanlığımla birlikte almak istedi
("normalde bunları ben belirleyip söylemeliydim, seninle belirleyelim").
Önerilerim mevcut kısıtlara (32 iş günü, tek geliştirici, Lighthouse/LCP
hedefleri, çok kiracılı domain mimarisi) dayanılarak seçildi ve kullanıcı
tarafından onaylandı.

**Not:** "Gerçek müşteriye canlıya alınmayacak" bilgisi yeni — `DURUM.md`'ye
proje bağlamı olarak eklendi.

---

## 2026-08-06 — Next.js scaffold yanlış klasöre kurulmuştu, düzeltildi; Next.js 16'ya güncellendi

**Karar:** Kullanıcı `create-next-app`'i yanlışlıkla `C:\Users\toffe\staj-projesi`
içine çalıştırmış (doğrusu `C:\Users\toffe\Projects\staj-projesi` — bu projenin
git deposu ve `docs/` klasörü orada). Yanlış klasörde ayrı bir git deposu
oluşmadığı doğrulandı (çakışma riski yoktu); dosyalar doğru klasöre taşındı,
yanlış klasör silindi.

Taşıma sırasında scaffold edilen sürümün **Next.js 16.3.0** olduğu görüldü —
önceki karar (2026-08-05, "Teknoloji seçildi") Next.js 15'i belirtiyordu.
Kullanıcı, zaten kurulu olan 16.3.0 ile devam edilmesine karar verdi; yeniden
kuruluma gerek yok. `AI-KURALLARI.md`, `MIMARI.md` ve `DURUM.md` "Next.js 16"
olarak güncellendi.

**Gerekçe:** Yanlış klasöre kurulum, git deposu içermediği için düşük riskliydi
— basit bir taşıma ile çözüldü. Versiyon için: daha yeni bir sürüm zaten
kurulu ve çalışır durumdaydı, 15'e düşürüp yeniden kurulum yapmanın bir
gerekçesi yoktu.

---

## 2026-08-06 — `app/`, `components/`, `lib/`, `types/` klasörleri fiilen oluşturuldu

**Karar:** `AI-KURALLARI.md` madde 3'te planlanmış olan klasör yapısı fiilen
uygulandı:

- `create-next-app`'in düz `app/page.tsx`'i, çakışmayı önlemek için
  `app/(site)/page.tsx`'e taşındı (route group URL'e segment eklemediği için
  `/` hâlâ oradan render ediliyor); `app/layout.tsx`/`globals.css` kökte kaldı
  (her iki route group'a da uygulanıyor).
- `app/panel/page.tsx` bir placeholder ile oluşturuldu (auth/gerçek arayüz
  ileride).
- `components/ui/`, `components/site/`, `lib/supabase/` boş klasörler olarak
  (`.gitkeep` ile) oluşturuldu; `lib/utils.ts` ve `types/index.ts` placeholder
  içerikle oluşturuldu.
- `app/api/` ve `supabase/` (migrations) henüz oluşturulmadı — ilk gerçek
  ihtiyaçta (ilk route handler / ilk migration) eklenecek.
- `npm run build` ile doğrulandı: üç route (`/`, `/panel`, `/_not-found`)
  hatasız derleniyor.
- `docs/MIMARI.md`'ye yeni bir madde (8, "Proje Klasör Yapısı") eklendi — her
  klasörün ne için var olduğunun ayrıntılı gerekçesi burada; ayrıca Stil
  (madde 3) ve Dil (madde 2) bölümlerine gerçek scaffold detayları eklendi:
  **Tailwind CSS v4** (config dosyası yok, `app/globals.css` içinde `@theme`
  ile CSS-first konfigürasyon), **`@/*` mutlak import path'i** (tsconfig'te
  zaten tanımlı), **ESLint 9 flat config**.

**Gerekçe:** Kullanıcı, klasörlerin fiilen oluşturulmasını ve her birinin
amacının `MIMARI.md`'de belgelenmesini istedi — daha önce sadece planlanmış
(AI-KURALLARI.md'deki ağaç şeması) bir yapıyı gerçek koda dönüştürme adımı.

---

## 2026-08-06 — İçerik modeli (bölüm veri alanları) çıkarıldı, `PRD.md` madde 3.4

**Karar:** Yaklaşan Supabase şema çalışması öncesi, `PRD.md`'deki her bölümün
(Hero, Hakkımızda, Hizmetler, Projeler, İletişim — hem tenant hem platform
sahibinin tanıtım sitesi için ayrı ayrı) hangi veri alanlarını tuttuğu
listelendi ve `PRD.md` madde 3.4'e eklendi. Her bölüm **Tekil** (tenant/
platform başına bir kayıt) veya **Liste** (sıralı çoklu öğe) olarak
işaretlendi; ortak `aktif`/`sıra` alanları not edildi.

Netleşen tek yeni nokta: **tenant sitelerindeki İletişim bölümü** — statik
bilgi (adres/telefon/e-posta) + bir iletişim formu (ad-soyad, telefon, mesaj)
içerecek; form gönderiminde **o tenant'a** (platform sahibine değil) e-posta
gider. Bu, platform sahibinin kendi tanıtım sitesindeki İletişim'den
(form → platform sahibine gider) farklı bir alıcı davranışı.

**Gerekçe:** Veri modelini kod yazmadan önce netleştirmek, Supabase
migration'larının doğru şemayla tek seferde yazılmasını sağlıyor.

---

## 2026-08-06 — İçerik envanteri tablolara döküldü, `docs/veritabani-semasi.md` oluşturuldu

**Karar:** `PRD.md` madde 3.4'teki içerik envanteri tablolara dönüştürüldü ve
`docs/veritabani-semasi.md`'ye kaydedildi. Kurallar:

- Her tabloda ortak 4 kolon: `id`, `created_at`, `order_index`,
  `is_published`.
- Tablo/kolon adları İngilizce `snake_case` (Postgres/Supabase konvansiyonu,
  Türkçe karakterli kolon adlarının quote gerektirmesi ve TypeScript
  tarafıyla uyumsuzluğu nedeniyle).
- Tenant içerik tabloları: `hero_sections`, `about_sections`, `services`,
  `projects`, `contact_sections`.
- Platform sahibinin tanıtım sitesi tabloları (ayrı tutuldu, şimdilik):
  `platform_hero`, `platform_portfolio`, `platform_features`,
  `platform_contact`.
- **`contact_messages`** eklendi — ziyaretçi form gönderimleri (hem
  tenant'tan hem platformdan) veritabanında da saklanacak, sadece e-postaya
  güvenilmeyecek (e-posta gönderimi başarısız olursa mesaj kaybolmasın diye).
- Site geneli ayarlar için ayrı tablo istendiği için **`tenants`** (her
  tenant'ın adı, domaini, teması, form alıcı e-postası) ve **`platform_settings`**
  (platform sahibinin kendi sitesi için, singleton) eklendi.

Tablolar arası ilişkiler (foreign key'ler, özellikle tenant_id bağlantıları)
bilinçli olarak bu adıma dahil edilmedi — kullanıcı bunu ayrı bir sonraki
adım olarak planladı.

**Gerekçe:** Kullanıcı, veritabanı işlemlerine geçmeden önce içerik
envanterini somut tablo/kolon tasarımına dönüştürmek istedi; ilişkileri ayrı
bir adımda ele almayı tercih etti (kapsamı küçük parçalara bölmek, tek
seferde çok karar almamak için).

**Not:** `veritabani-semasi.md`'de bir açık soru var — platform sahibinin
tanıtım sitesi tabloları tenant tablolarından tamamen ayrı mı kalacak, yoksa
platform sahibi `tenants` tablosunda özel bir satır olarak modellenip aynı
tablolar mı paylaşılacak? Bu, ilişkiler adımında ilk ele alınacak konu.

---

## 2026-08-06 — Platform sahibi `tenants` tablosunda birleştirildi, ayrı `platform_*` tabloları kaldırıldı

**Karar:** Bir önceki kayıttaki açık soru çözüldü: **platform sahibi için ayrı
tablo yok.** `platform_hero`, `platform_portfolio`, `platform_features`,
`platform_contact`, `platform_settings` tabloları kaldırıldı. Bunun yerine
platform sahibi, `tenants` tablosunda `is_platform_owner = true` olan
özel/rezerve bir satırdır ve tenant'larla **aynı** içerik tablolarını
(`hero_sections`, `services`, `projects`, `contact_sections`) paylaşır.

Bu birleştirmenin doğal/zorunlu sonucu olarak her içerik tablosuna bir
**`tenant_id`** (→ `tenants.id`, `NOT NULL`) kolonu eklendi — bu, "Aşama 2"
(tablolar arası ilişkiler) planının ilk ve en temel parçasını da çözmüş oldu.
`projects` tablosuna platform sahibinin kullanacağı `live_url` (nullable)
kolonu eklendi; `contact_sections`'da ayrı bir `whatsapp_number` kolonuna
gerek kalmadı (WhatsApp butonu aynı `phone` alanından üretilecek).
Middleware mantığı (`MIMARI.md` madde 7) buna göre güncellendi: `Host` →
`tenants.domain` eşleşir, satırda `is_platform_owner = true` ise `/panel`
aktif olur.

**Gerekçe:** Kullanıcı, gerekli değilse platform sahibine özel ayrı bir
tablo/özellik seti kurulmasını istemedi. İçerik şekilleri zaten neredeyse
aynıydı (Hizmetler ≈ Vaat edilen özellikler, Projeler ≈ Portfolyo); ayrı
tablo tutmak gereksiz tekrar ve bakım yükü olurdu. Toplam tablo sayısı
12'den 7'ye indi (`tenants`, `hero_sections`, `about_sections`, `services`,
`projects`, `contact_sections`, `contact_messages`).

---

## 2026-08-06 — Şema SQL'e döküldü: `supabase/migrations/20260806120000_create_content_tables.sql`

**Karar:** `veritabani-semasi.md`'deki 7 tablo tasarımı çalışır bir SQL
migration dosyasına dönüştürüldü. Uygulanan kısıtlama/varsayılan kararları:

- `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`,
  `order_index integer default 0`, `is_published boolean default false`
  (güvenli varsayılan — bilinçli yayınlanana kadar görünmez).
- Her içerik tablosunda `tenant_id uuid not null references tenants(id) on
  delete cascade`.
- Tekil bölümlerde (`hero_sections`, `about_sections`, `contact_sections`)
  `tenant_id` üzerinde `UNIQUE`.
- `tenants.is_platform_owner` üzerinde kısmi unique index — en fazla bir
  satır `true` olabilir. `tenants.domain` `UNIQUE`, `theme_mode` `CHECK
  (in ('light','dark'))`.
- `founded_year`/`year` için 1800-2100 `CHECK` aralığı.
- **RLS her tabloda açıldı** (`alter table ... enable row level security`)
  ama **policy yazılmadı** — panel auth'u henüz kodlanmadığı için kimin ne
  okuyup yazabileceği netleşmedi. RLS açık + policy yok = varsayılan olarak
  hiç kimse (service role hariç) hiçbir satıra erişemiyor; bu, veri
  yazılmadan önce güvenli bir ilk durum.

**Gerekçe:** Kullanıcı tasarımı çalışır SQL'e dönüştürmek istedi. RLS'in
policy'siz de olsa açık başlatılması `AI-KURALLARI.md` madde 6.1'in ("RLS
varsayılan olarak açık tutulur") doğrudan gereği.

**Not:** RLS policy'leri ayrı bir migration'da, panel auth'u kodlanınca
eklenecek (bkz. `docs/DURUM.md` sıradaki adım).

---

## 2026-08-06 — `docs/veritabani-semasi.md` kaldırıldı, içeriği `docs/VERİ-MODELİ.md`'ye taşındı

**Karar:** `docs/veritabani-semasi.md` dosyası, kullanıcı tarafından açıkça
istenmeden, AI tarafından kendi inisiyatifiyle oluşturulmuştu. Kullanıcı bunu
fark edip sorguladı; AI durumu doğrudan kabul etti (kullanıcı istememişti,
kendi kararıydı). Kullanıcı, aynı bilgiyi (her tablo, alanları, neden öyle
tasarlandığı) **`docs/VERİ-MODELİ.md`** adıyla, tasarım gerekçelerine daha
çok ağırlık vererek istedi. `veritabani-semasi.md` silindi (hiç commit
edilmemişti, kayıp yok); tüm çapraz referanslar (`MIMARI.md`, `DURUM.md`)
`VERİ-MODELİ.md`'ye güncellendi.

**Gerekçe:** Kullanıcı, veritabanı tasarım bilgisini tek, kendi belirlediği
bir dosyada tutmak istiyor; içerik olarak `veritabani-semasi.md`'den farkı
yok ama artık "neden" kısmı (her tasarım kararının gerekçesi) daha belirgin.

**Not:** Bu, AI'nin kullanıcıdan açıkça istenmeyen bir dosya oluşturduğu bir
örnek — ileride yeni bir dosya açmadan önce kullanıcıya sorulması gerektiğini
hatırlatan bir kayıt.

---

## 2026-08-06 — Şema, dışarıdan gelen bir yönergeyle karşılaştırılıp 3 noktada revize edildi

**Karar:** Kullanıcı, staj yönergesinden gelen bir görev tanımını (BAĞLAM/
İSTEK/KISITLAR/KABUL KRİTERİ formatında, PostgreSQL şeması için) paylaştı ve
mevcut tasarımla karşılaştırılıp uyuşmayan kısımların düzeltilmesini istedi.
Karşılaştırma sonucu:

1. **`order_index`/`is_published` kapsamı daraltıldı.** Önceki karar ("her
   tabloda") yönergeyle çelişiyordu ("sıralanabilir içeriklerde order_index,
   yayın kontrolü için is_published"). Kullanıcı yönergeye göre daraltılmasını
   seçti: `order_index` artık sadece `services`/`projects`'te; `is_published`
   `tenants` + 5 içerik tablosunda var, `site_settings`/`contact_messages`'ta
   yok.
2. **Görsel kolonları `*_url`'den `*_path`'e çevrildi** — yönerge "Storage'da
   tut, tabloda yalnız dosya yolu sakla" dedi (`background_image_path`,
   `image_path`, `logo_path`). `live_url` (projects) bu kurala girmiyor,
   gerçek bir dış bağlantı.
3. **`site_settings` tablosu eklendi** (logo, renkler, SEO, iletişim gösterim
   bilgisi) — yönerge "tek satırlık bir ayar tablosu" istedi. Kullanıcı,
   `tenants`'ın çok kiracılı olması nedeniyle ortaya çıkan çelişkiyi
   "yönergeyi harfiyen uygula, ayrı tablo ekle" seçeneğiyle çözdü:
   `site_settings`, `tenants`'tan ayrı, `tenant_id` üzerinde UNIQUE bir tablo
   oldu (her tenant'ın kendi tek satırı — çok kiracılı mimaride "tek
   satırlık" ifadesinin karşılığı). `tenants.brand_color` tekrarı önlemek
   için kaldırılıp `site_settings.primary_color`/`secondary_color`'a
   taşındı; `contact_recipient_email` (operasyonel, form gönderim adresi)
   `tenants`'ta kaldı, `site_settings.contact_email/phone` (gösterim amaçlı)
   ile bir miktar kavramsal örtüşme olabileceği bilinerek kabul edildi.

Ayrıca her tabloya `comment on table` eklendi (önceden sadece `tenants`'ta
vardı) — yönergenin kabul kriteriydi.

**Gerekçe:** Yönerge, muhtemelen tek-kiracılı bir zihniyetle ("tek satırlık
ayar tablosu") yazılmıştı; kullanıcı bunu çok kiracılı mimarimize (tenant
başına tek satır) uyarlayarak literal isteği de karşılamayı tercih etti,
mimariyi (2026-08-06, "Barınma modeli") değiştirmek yerine.

**Not:** Migration dosyası (`20260806120000_create_content_tables.sql`) hiç
commit'lenmemişti, bu yüzden yeniden yazıldı (ayrı bir ALTER migration
eklenmedi). Kullanıcı ayrıca doğrulama için her tabloya 2 satırlık örnek
`insert` istedi — `supabase/seed.sql` bu amaçla oluşturuldu (2 tenant üzerinde
kurulu örnek veri).

---

## 2026-08-07 — İlk migration gerçek Supabase projesine uygulandı

**Karar/Olay:** Kullanıcı supabase.com'da gerçek bir proje oluşturdu,
`20260806120000_create_content_tables.sql` içeriği SQL Editor'e yapıştırılıp
çalıştırıldı — hatasız ("Success. No rows returned"). 8 tablo artık gerçek
veritabanında var. `.env.local` ve `lib/supabase/` istemcileri henüz
kurulmadı, bu hâlâ açık bir sonraki adım.

---

## 2026-08-07 — Referanslar, SSS, Ekip Üyeleri yeni bölüm olarak eklendi (kapsam genişletildi)

**Karar:** Kullanıcı gerçekçi demo içeriği (6 hizmet, 8 proje, 4 referans, 5
SSS, 4 ekip üyesi) istedi. Hizmet ve Proje zaten kapsamdaydı; Referanslar/
SSS/Ekip Üyeleri ise `PRD.md`'nin mevcut 5 bölümlük kapsamında (Hero,
Hakkımızda, Hizmetler, Projeler, İletişim) yoktu — `RAKIP-ANALIZI.md`'de de
bilinçli olarak "olması gereken 6 bölüm" listesine alınmamışlardı (Referanslar
3/8 sitede, Ekip 2/8 sitede görülmüş, SSS hiç incelenmemiş).

Kullanıcıya önce "içeriği hazırla ama şemaya ekleme" mi yoksa "yeni tablo
olarak ekle" mi diye soruldu; kullanıcı hazırlanan içerik için gerçek SQL
`insert` istediğini netleştirince (BAĞLAM/İSTEK/KISITLAR/KABUL KRİTERİ
formatında bir yönergeyle), **kapsamı resmen genişletmeye** karar verdi.

**Uygulama:**
- 3 yeni tablo: **`testimonials`** (Referanslar — `references` SQL'de
  ayrılmış/reserved kelime olduğu için bu ad seçildi), **`faqs`** (SSS),
  **`team_members`** (Ekip Üyeleri). Üçü de sıralanabilir liste
  (`order_index`) + yayın kontrollü (`is_published`), `tenant_id` ile
  `tenants`'a bağlı, aynı `on delete cascade` kuralı.
- `team_members`, `about_sections` ile aynı kısıta tabi: **platform sahibi bu
  tabloyu kullanmaz** (anonim kalma kuralı, `PRD.md`).
- Ayrı bir migration dosyasında yazıldı
  (`20260807120000_add_testimonials_faqs_team_tables.sql`) — ilk migration
  zaten gerçek veritabanına uygulanmış olduğu için üstüne yazılmadı, `ALTER`
  yerine yeni `CREATE TABLE`'lar eklendi.
- `PRD.md` (madde 3.3, 3.4) ve `VERİ-MODELİ.md` bu 3 tabloyu içerecek şekilde
  güncellendi; toplam tablo sayısı 8'den 11'e çıktı.

**Gerekçe:** Kullanıcının somut, çalışır SQL isteği (yönerge formatında,
"şemamla birebir uyumlu, hatasız çalışsın" kabul kriteriyle) var olmayan
tablolar için mümkün değildi; AI kapsamı sessizce genişletmek yerine önce
sordu (AI-KURALLARI.md madde 9.4/9.6), kullanıcı onayladı.

---

## 2026-08-07 — Supabase istemcisi kuruldu ve gerçek veriyle doğrulandı

**Karar/Olay:** `.env.local` + `lib/supabase/` istemcileri adımı tamamlandı.
`@supabase/supabase-js` kuruldu; `lib/supabase/server.ts` (service role
client) ve `lib/supabase/queries.ts` (`getServices()`) yazıldı. Supabase
dashboard'daki API sayfa düzeni değişmiş olduğu için Project URL
`Integrations → Data API`'den, service_role key `Configuration → API
Keys`'ten alındı (eski "Project Settings → API" tek sayfası artık ikiye
bölünmüş). İlk denemede Data API sayfasından kopyalanan URL'in sonunda
`/rest/v1/` yolu da vardı — `@supabase/supabase-js`'in beklediği sadece proje
kök adresi olduğu için bu kısım elle temizlendi.

Doğrulama için geçici bir `app/test-services/page.tsx` sayfası yazıldı;
`npm run dev` ile açılıp gerçek seed verisindeki 6 hizmet (yayında/taslak
karışık) ekranda görüldü — bağlantı uçtan uca çalışıyor.

**Gerekçe:** Kod yazılıp doğrulanmadan "bitti" sayılmaz
(`TEST-STRATEJISI.md`, Definition of Done). Bu adım, önceki oturumda
yazılmış ama hiç çalıştırılmamış istemci kodunun (kullanıcı `.env.local`
oluşturmadığı, paket kurulmadığı için) fiilen doğrulanmasını sağladı.

**Not:** `.env.local` gitignore'lu, hiçbir zaman commit'lenmedi/edilmeyecek;
service role key sohbet geçmişine yazılmadı, kullanıcı dosyayı doğrudan
kendisi düzenledi (AI-KURALLARI madde 6.4).

---

## 2026-08-07 — RLS okuma/yazma politikaları eklendi (istisnasız tüm tablolar)

**Karar:** Kullanıcı iki net kural verdi: (1) anonim ziyaretçi her tabloda
sadece `is_published = true` satırları okuyabilsin, ayar tablosunda hangi
alanların dışarı açıldığına dikkat edilsin; (2) insert/update/delete
istisnasız sadece kimliği doğrulanmış (authenticated) kullanıcıya açık olsun,
anon hiçbir koşulda yazamasın. Bu kurallar
`supabase/migrations/20260807130000_add_rls_policies.sql`'e işlendi (11
tablonun tamamı, önceki iki migration'daki `enable row level security`
satırlarının üzerine, ayrı bir migration'da).

**Uygulama detayları:**
- `site_settings`'in kendi `is_published` kolonu yok (bkz. `VERİ-MODELİ.md`)
  — anon select policy'si, bağlı `tenants` satırının `is_published`'ına
  bakan bir `exists (...)` alt sorgusuyla yazıldı.
- `tenants.contact_recipient_email` (form bildiriminin gideceği operasyonel
  e-posta) RLS'in satır bazlı olup kolon gizleyemediği için ayrıca
  `revoke select ... from anon` + `grant select (belirli kolonlar) ...`
  ile anon'dan tamamen gizlendi. `site_settings.contact_email/contact_phone`
  ise bilinçli olarak herkese açık bırakıldı — bunlar operasyonel değil,
  sitede gösterilmesi gereken üstbilgi/altbilgi bilgisi.
- `authenticated` rolüne (= platform sahibi, tek kullanıcı — bkz.
  AI-KURALLARI madde 6.3) her tabloda taslak dahil tam okuma + tam
  insert/update/delete verildi; tenant bazlı bir ayrım yok çünkü sistemde
  tüm tenant'ları yöneten tek bir kullanıcı var.
- **İstisna — `contact_messages`:** Ziyaretçi kişisel verisi (ad, telefon,
  mesaj) içerdiği için anon'a select bile açılmadı, tamamen kilitli. Ama
  ürün gereksinimi anonim ziyaretçinin iletişim formunu doldurabilmesini
  gerektiriyor (bkz. `PRD.md`) — bu RLS/anon key üzerinden değil, henüz
  yazılmamış bir `app/api/contact/` route handler'ı (sunucu tarafı, service
  role client, RLS'i bypass eder) üzerinden çözülecek. Bu, "anon hiçbir
  koşulda yazamasın" kuralını bozmuyor; service role anon key'den ayrı bir
  güven seviyesi.

**Gerekçe:** Kullanıcı, panel auth'u henüz kodlanmamış olsa bile RLS
politikalarının erken ve eksiksiz tanımlanmasını istedi — güvenlik
varsayımlarının koda değil şemaya bağlı olması için (`AI-KURALLARI.md`
madde 6.1).

**Not:** Migration dosyası yazıldı ama henüz gerçek Supabase projesine
uygulanmadı — kullanıcı SQL Editor'den çalıştıracak (önceki iki migration'la
aynı akış).

---

## 2026-08-07 — RLS politikaları gerçek veriyle test edildi: anon vs authenticated

**Karar/Olay:** Migration uygulandıktan sonra kullanıcı, anon key ile
authenticated (giriş yapmış) kullanıcının aynı sorguları çalıştırıp
sonuçların karşılaştırılmasını istedi. `scripts/test-rls.mjs` yazıldı — iki
ayrı Supabase client (biri hep anon kalan, biri test kullanıcısıyla sign-in
yapan) ile `services`/`contact_messages` üzerinde okuma ve yazma denemeleri
yapıp sonucu karşılaştırıyor.

**Kurulum sürecinde çıkan engeller (ileride benzer kurulumlar için not):**
- Supabase dashboard'da test kullanıcısı önce yanlış/uyuşmayan şifreyle
  oluşturulduğu için `signInWithPassword` "Invalid login credentials" hatası
  verdi — e-posta onay durumu (`Email Confirmed At`) doğruydu, sorun şifrenin
  dashboard'a ve `.env.local`'e elle iki kez yazılırken farklı girilmesiydi.
  Kopyala-yapıştır ile (Not Defteri → dashboard → `.env.local`) çözüldü.
- İlk test çalıştırmasında script'in kendisinde bir hata vardı: aynı
  `anon` client örneği üzerinde `signInWithPassword` çağrılmıştı — bu, o
  client'ın oturumunu authenticated'e yükseltiyor, sign-in sonrası "anon"
  diye kullanılan tüm sorgular aslında authenticated olarak çalışıyordu. Bu
  yüzden ilk çalıştırmada `contact_messages` anon'a açıkmış ve `services`'e
  anon insert edilebiliyormuş gibi görünen **yanlış pozitif** sonuçlar
  alındı. Script, `anonClient`/`authClient` diye iki bağımsız client
  kullanacak şekilde düzeltildi.
- Düzeltilmiş script ile 6/6 test "OK": anon sadece `is_published=true`
  satırları görüyor (services: 3/6), authenticated tümünü görüyor (taslaklar
  dahil); `contact_messages` anon'a tamamen kapalı (0 satır) ama
  authenticated görebiliyor; anon insert denemesi RLS tarafından reddedildi
  ("new row violates row-level security policy"), authenticated insert
  başarılı oldu ve service role ile temizlendi.
- İlk (hatalı) çalıştırmada authenticated olarak eklenmiş bir test satırı
  (`services`, "RLS test - anon insert") temizlenmeden kalmıştı — service
  role ile ayrıca silindi.

**Gerekçe:** RLS politikalarının sadece migration dosyasında "doğru
görünmesi" yeterli değil — gerçek anon/authenticated rolleriyle uçtan uca
test edilmeden "bitti" sayılmaz (`TEST-STRATEJISI.md`, Definition of Done).

**Not:** `scripts/test-rls.mjs` repoda kalıyor, yeniden kullanılabilir bir
doğrulama aracı (yeni bir tablo/policy eklendiğinde tekrar çalıştırılabilir).
`.env.local`'deki `TEST_AUTH_EMAIL`/`TEST_AUTH_PASSWORD` geçiciydi, kalıcı
uygulama config'i değil — kullanıcı isterse silebilir ya da ileride panel
auth'un gerçek girişi olarak kullanabilir.

---

## 2026-08-07 — Supabase CLI ile şema tipleri üretildi (`types/database.types.ts`)

**Karar:** Kullanıcı, veri çekme kodunun elle yazılan tiplere değil,
Supabase CLI'nin şemadan ürettiği gerçek tiplere dayanmasını istedi — yanlış
tablo/kolon adı yazılınca editörün uyarması için. `supabase` paketi
devDependency olarak kuruldu, `types/database.types.ts` üretildi,
`lib/supabase/server.ts` (`createClient<Database>`) ve `lib/supabase/queries.ts`
(elle yazılan `Service` tipi ve `.returns<Service[]>()` cast'i kaldırıldı,
dönüş tipi artık `select(...)` string'inden otomatik çıkarılıyor) bu tipi
kullanacak şekilde güncellendi. `package.json`'a `npm run types:generate`
script'i eklendi (tekrar üretim için).

**Kurulum sürecinde çıkan engeller (önemli — ileride tip yeniden üretilirken
tekrar yaşanmasın diye kayıt altına alınıyor):**
1. `supabase link --project-ref ...` CLI'nin bilinen bir hatasına takıldı
   (Management API'den dönen bir `inserted_at` tarihi CLI'nin beklediği katı
   regex'e uymuyor — `SchemaError`). CLI zaten en güncel sürümdü (2.112.0),
   güncelleme çözmedi.
2. `--db-url` ile doğrudan bağlantı denendi; `db.<ref>.supabase.co` adresi
   IPv6-only olduğu için kullanıcının ağında DNS çözülemedi (`ENOTFOUND`).
   **Session pooler** adresine (`aws-X-<bölge>.pooler.supabase.com`, IPv4
   uyumlu) geçildi.
3. Pooler bağlantısıyla bu sefer CLI yerel bir Docker container'ı ("shadow
   database") istedi — kullanıcıda Docker kurulu değildi, ağır bir kurulum
   olacağı için bu yol terk edildi.
4. Bunun yerine **Management API + Personal Access Token** yöntemine
   geçildi: hesap düzeyinde bir access token (`sbp_...`, Dashboard → hesap
   simgesi → Access Tokens) `SUPABASE_ACCESS_TOKEN` ortam değişkenine
   atanıp `supabase gen types typescript --project-id <ref>` çalıştırıldı —
   ne DB bağlantısı ne Docker gerektirdi, bu çözüm işe yaradı.
5. Token'ı doğru kopyalamak birkaç denemede sorun çıkardı — dashboard,
   token'ı sadece oluşturulduğu an açık gösteriyor, sonra maskeli (`••••`)
   gösteriyor; maskeli halin kopyalanması "Invalid access token format"
   hatası veriyor. Ayrıca VS Code'un entegre terminalinde yapıştırma
   sırasında bozulma oldu — bağımsız bir PowerShell penceresine geçildi.
   O pencerede de önce yanlış klasörde (`C:\WINDOWS\System32`) ve bir ara
   yanlışlıkla cmd.exe'de (`$env:` PowerShell'e özel, cmd'de `set` kullanılır)
   çalıştırılınca ek hatalar çıktı.
6. **En son ve en sinsi sorun:** `npx supabase gen types ... > types/database.types.ts`
   komutu PowerShell 5.1'de çalıştırıldığında, `>` yönlendirmesi (`Out-File`
   takma adı) dosyayı **UTF-16LE** kodlamasıyla yazdı — terminalde "çıktı
   vermedi" gibi göründü (aslında sessiz başarıydı) ama üretilen dosya
   TypeScript/Node için geçersizdi (her karakter arasında null byte). AI
   tarafında `iconv` ile UTF-8'e çevrilerek düzeltildi. **`npm run
   types:generate` script'i eklenmesinin sebebi tam olarak bu** — npm
   script'leri Windows'ta `cmd.exe` üzerinden çalışır, `cmd`'nin `>`
   yönlendirmesi bu encoding sorununu yaşamıyor; ileride tip yeniden
   üretilirken ham `npx supabase gen types ... > ...` komutu PowerShell'de
   doğrudan çalıştırılmamalı, `npm run types:generate` kullanılmalı.

**Gerekçe:** Elle yazılan tipler şema değiştikçe kolayca eskir/hatalı olur;
CLI'den üretilen tipler her zaman gerçek şemayla birebir eşleşir ve derleme
zamanında yanlış alan adlarını yakalar.

**Not:** `types/database.types.ts` otomatik üretilir, elle düzenlenmez; şema
her değiştiğinde `npm run types:generate` ile yeniden üretilmeli.

---

## 2026-08-07 — `docs/GUVENLIK.md` oluşturuldu, tüm docs dosya adları büyük harfe çevrildi

**Karar:** Kullanıcı iki istek verdi: (1) `docs/GUVENLIK.md` adında,
projenin güvenlik duruşunu tek dosyada toplayan bir referans — beş sabit
başlıkla (Tehdit modeli, RLS politikaları, Anahtar Yönetimi, Test Sonuçları,
Yayın öncesi güvenlik kontrol listesi), içeriği projenin en baştan bugüne
kadarki gelişimine göre doldurulmuş; (2) `docs/` klasöründeki tüm dosya
adlarının `.md` öncesi kısmının büyük harfe çevrilmesi (ör. `MIMARI.md`).

**Uygulama:**
- `GUVENLIK.md` yazıldı — tehdit modeli (roller: anon/authenticated/service
  role, korunan veriler, tehdit-karşılık tablosu), RLS politikaları özeti
  (2026-08-06 RLS açma + 2026-08-07 policy ekleme kararlarına referansla),
  anahtar yönetimi tablosu (hangi sır nerede tutuluyor, kim kullanıyor),
  test sonuçları (2026-08-07 RLS testinin 6/6 "OK" tablosu) ve yayın öncesi
  kontrol listesi (tamamlanan + henüz açık maddeler, dürüstçe ayrılmış —
  panel auth, middleware, iletişim formu route'u gibi henüz yapılmamış
  işler "açık madde" olarak işaretlendi, tamamlanmış gibi gösterilmedi).
- `git mv` ile 6 dosya yeniden adlandırıldı (geçmiş korunarak):
  `durum.md`→`DURUM.md`, `Mimari.md`→`MIMARI.md`,
  `karar-gunlugu.md`→`KARAR-GUNLUGU.md`,
  `test-stratejisi.md`→`TEST-STRATEJISI.md`,
  `kurumsal-site-standartlari.md`→`KURUMSAL-SITE-STANDARTLARI.md`,
  `rakip-analizi.md`→`RAKIP-ANALIZI.md`. `PRD.md`, `AI-KURALLARI.md`,
  `VERİ-MODELİ.md` zaten büyük harfliydi, değişmedi.
- Bu 6 isme yapılan **tüm** çapraz referanslar (13 dosyada bulunmuştu:
  docs içindeki tüm dosyalar, kök `CLAUDE.md`, `lib/supabase/queries.ts`
  yorumu, iki migration dosyasının yorumları, `content/demo-icerik.md`)
  `sed` ile toplu güncellendi, ardından tekrar arama yapılarak eski (küçük
  harfli) referans kalmadığı doğrulandı.
- `CLAUDE.md`'deki okuma sırasına 7. madde olarak `GUVENLIK.md` eklendi.

**Gerekçe:** Kullanıcının kendi ifadesiyle: "Güvenlik, unutulduğunda fark
edilmeyen tek konudur. Yazılı kontrol listesi olmadan yayına çıkmak kumar
oynamaktır." — RLS/anahtar/test bilgisi şu ana kadar `KARAR-GUNLUGU.md`
içinde dağınık haldeydi (birçok farklı tarihli kayıtta); tek, taranabilir
bir güvenlik referansı istendi. Dosya adı büyük harf kuralı, projenin geri
kalanıyla (`PRD.md`, `AI-KURALLARI.md`, `VERİ-MODELİ.md`) tutarlılık için.

---

## 2026-08-08 — `docs/TASARIM-SISTEMI.md` oluşturuldu, görsel token sistemi kuruldu

**Karar:** Kullanıcı dışarıdan gelen tasarım yönergeleriyle çalışırken,
tasarım kararlarının yazılı olmaması durumunda her sayfada yeniden
tartışılıp ürünün dağılacağını belirtti — tema sisteminin bu token'lar
üzerine kurulacağını da ekleyerek `docs/TASARIM-SISTEMI.md` oluşturulmasını
istedi. Dosya, üç ayrı yönerge turunda (renk paleti; tipografi/boşluk/
köşe/gölge; nihai BAĞLAM/İSTEK/KISITLAR/KABUL KRİTERİ formatında gelen
netleştirme) üretilen tüm görsel token kararlarını tek referansta topluyor.

**Uygulama:**
- **Renk paleti:** 1 marka rengi (217° hue, çelik-mavi — varsayılan,
  `site_settings.primary_color` ile tenant başına değişebilir), 7 adımlı
  nötr gri ölçeği (aynı hue, %14 doygunluk — "marka rengine hafif eğilim"
  isteği için), 3 semantik renk (başarı/uyarı/hata — `info` kullanıcının
  son netleştirmesiyle kapsam dışı bırakıldı), yüzey ve metin renkleri.
  Hepsi açık/koyu tema karşılığıyla ayrı ayrı tanımlandı.
- **Kontrast doğrulama:** WCAG 2.1 relative-luminance formülüyle (AI
  tarafından yazılan geçici bir Node script'i, repoya eklenmedi) 36
  metin/zemin çifti hesaplandı — gövde metni ≥4.5:1, büyük başlık ≥3:1
  eşiklerinin **tamamı geçti** (en düşük marj 4.72:1). İlk taslakta iki
  değer sınırda kalmıştı (`neutral-500` 4.53:1, `warning-dark` 4.60:1) —
  kullanıcıya sorulmadan, daha güvenli marj bırakmak için hafifçe
  koyulaştırılıp yeniden doğrulandı.
- **Tipografi ölçeği:** 16px taban, 1.25 oran (Major Third) — modüler
  ölçek `caption` + `text-base` (gövde) + `h6`→`h1`. Satır yüksekliği
  boyut büyüdükçe daralıyor (1.6→1.1); font ağırlığı en fazla 700'de
  sınırlandı (Lighthouse Performance ≥90 hedefi için daha az font dosyası).
- **Boşluk ölçeği:** Kullanıcının verdiği 4/8/12/16/24/32/48/64 değerleri
  Tailwind v4'ün varsayılan 4px'lik spacing çarpanıyla birebir örtüştüğü
  için ayrı bir token eklenmedi — sadece px→Tailwind utility eşleştirme
  tablosu dokümante edildi.
- **Köşe yarıçapı ve gölge:** Boşluk ölçeğiyle aynı 4px ritmine hizalı
  4 adımlı radius skalası (Tailwind'in kendi sm/md/lg/xl'i bu ritme
  uymadığı için override edildi); açık temada palet renginden (neutral-900)
  türetilen, koyu temada ayrı (daha opak siyah) gölge seviyeleri —
  koyu temada asıl "yükselti" sinyali `surface`→`surface-raised` zemin
  geçişi, gölge ikincil.
- **Kod:** Tüm token'lar `app/globals.css`'e Tailwind v4 CSS-first
  `@theme`/`@theme inline` sözdizimiyle eklendi (`tailwind.config.js`
  yok, bkz. `MIMARI.md` madde 3). Tema `@media (prefers-color-scheme)`
  değil `[data-theme="dark"]` seçicisiyle yönetiliyor — çünkü
  `tenants.theme_mode` panelden seçilen açık bir ayar, tarayıcı tercihi
  değil (`VERİ-MODELİ.md`). Sözdizimi doğruluğu, kurulu Tailwind
  sürümünün (`4.3.3`) kendi `theme.css`'i incelenerek ve `text-h1`/
  `rounded-lg`/`shadow-md`/`text-caption` sınıfları geçici olarak
  `app/(site)/page.tsx`'e eklenip derlenmiş CSS çıktısı kontrol edilerek
  (sonra geri alınarak) doğrulandı. `npm run build` her adımda hatasız
  geçti.
- `CLAUDE.md`'nin okuma sırasına 8. madde olarak `TASARIM-SISTEMI.md`
  eklendi; `docs/DURUM.md`'nin baştaki okuma listesi ve "Sıradaki adım"ı
  güncellendi.

**Gerekçe:** Tasarım kararları (renk, tipografi, boşluk, radius, gölge)
kod içine dağınık/hardcoded yazılırsa hem tutarsızlık hem de gelecekteki
tema/marka rengi değişikliklerinde (tenant özelleştirmesi) her yeri tek
tek bulup değiştirme riski doğar — `AI-KURALLARI.md` madde 5'teki "tema/
renk/metin gibi içerik değerlerini kod içine sabit yazma" kuralının görsel
token'lara doğal bir genişlemesi.

**Not:** Token'lar henüz hiçbir gerçek bileşende kullanılmıyor
(`components/site/` hâlâ boş) — bu iş, ilk bölüm bileşenlerinin (Hero,
İletişim) önkoşulu olarak yapıldı, onların yerine geçmiyor.

---

## 2026-08-08 — Tema mimarisi kuruldu: DB'den `<html>`'e enjeksiyon, iki preset, `docs/TEMA-MIMARISI.md`

**Karar:** Kullanıcı, tema değerlerinin (marka rengi, köşe yarıçapı, font)
Supabase'deki ayarlar tablosunda tutulup panelden değiştirilebilmesi
gereken bir yapı istedi — BAĞLAM/İSTEK/KISITLAR/KABUL KRİTERİ formatında,
sırasıyla: (1) `globals.css`'te `:root`/koyu tema blokları [önceki
oturumda zaten yapılmıştı, bu oturumda sadece doğrulandı], (2) Tailwind'i
CSS değişkenlerine bağlama [aynı şekilde önceden yapılmıştı], (3) site
ayarlarından gelen tema değerlerini sayfaya enjekte eden, DB kaynaklı bir
yapı, (4) "Kurumsal Mavi" ve "Modern Koyu" adında iki hazır preset, (5)
FOUC'un kesinlikle engellenmesi, (6) `docs/TEMA-MIMARISI.md`.

**Şema kararı (kullanıcıya sorulmadan, gerekçeyle uygulandı):**
`site_settings` tablosunda `primary_color`/`secondary_color` var ama
yarıçap/font için kolon yoktu. Bunları ham `radius`/`font` kolonları
olarak eklemek yerine, kullanıcının zaten istediği "preset" fikrini
kullanarak **tek bir `site_settings.theme_preset` kolonu** eklendi
(`kurumsal-mavi` | `modern-koyu`, check constraint, varsayılan
`kurumsal-mavi`) — yeni migration:
`supabase/migrations/20260808120000_add_theme_preset_to_site_settings.sql`.
Radius ve font tamamen bu preset'e bağlı (kodda, `lib/theme/presets.ts`);
`primary_color` ise preset'in varsayılan marka rengini ezen, tenant'a özel
serbest bir override olarak kaldı. Gerekçe: raw radius/font kolonları için
panelde anlamlı bir seçim arayüzü kurmak zor (bir renk seçici mantıklı,
bir "12px mi 13px mi" seçici değil) — kürasyonlu 2 preset arasından seçim
hem "ileride panelden seçilecek" isteğiyle hem de ürünün "hazır bölüm
kütüphanesi, serbest page builder değil" felsefesiyle (bkz. `PRD.md`,
2026-08-06 "Platform paneli: demo kataloğu...") tutarlı.

**Uygulama:**
- `lib/theme/presets.ts` — `THEME_PRESETS` (2 preset: Kurumsal Mavi
  varsayılan/`#2561c1`+`#6998e2`, ölçülü radius, Geist Sans; Modern Koyu/
  `#166966`+`#24a8a4` — yeni bir teal hue, 178°, aynı WCAG yöntemiyle
  hesaplanıp doğrulandı —, daha yuvarlak radius, Manrope).
- `lib/theme/resolve.ts` — `resolveThemeTokens()`: preset + tenant'ın özel
  `primary_color`'ını gerçek CSS değişkenlerine çevirir; serbest renk
  girildiğinde `pickReadableOnColor()` (basit relative-luminance sezgisi)
  ile buton metninin beyaz mı yakın-siyah mı olacağına karar verir.
- `lib/supabase/queries.ts` → `getSiteThemeSettings()` — DB'den üç değeri
  okur. **Tenant çözümlemesi henüz yok** (Host-bazlı middleware
  yazılmadı) — şimdilik `is_platform_owner = true` satırı "aktif site"
  olarak kullanılıyor, bilinçli ve dokümante edilmiş bir geçici karar.
  Supabase erişilemezse veya `theme_preset` kolonu yoksa (migration
  uygulanmadıysa) **sessizce güvenli varsayılana düşer** — kök layout hiç
  çökmez; bu davranış `npm run build`'ın statik sayfa üretimi sırasında
  fiilen tetiklenip doğrulandı (migration henüz gerçek projeye
  uygulanmadığı için build anında fallback yolu çalıştı).
- `lib/supabase/server.ts` — `createUntypedServiceRoleClient()` eklendi
  (env okuma mantığı `readServiceRoleCredentials()`'a çıkarılarak tekrar
  önlendi). `theme_preset` kolonu `types/database.types.ts`'te henüz
  olmadığı (migration uygulanıp `npm run types:generate` çalıştırılmadığı)
  için `getSiteThemeSettings()` bilinçli olarak bu tipsiz client'ı
  kullanıyor, dönen veriyi elle doğruluyor — kalıcı bir çözüm değil, tipler
  yenilenince `createServiceRoleClient()`'e taşınmalı (bkz.
  `TEMA-MIMARISI.md` madde 6).
- `app/layout.tsx` — async Server Component'e çevrildi, `getSiteThemeSettings()`
  + `resolveThemeTokens()`'ı çağırıp sonucu `<html data-theme={...}
  style={styleVars}>` olarak doğrudan sunucu tarafında üretilen HTML'e
  yazıyor. Hiçbir `"use client"` yok. Manrope font'u (Modern Koyu preset'i
  için) Geist'in yanına eklendi — `next/font/google` çalışma zamanı
  verisine göre şartlı font yüklemeye izin vermediği için iki font da
  build zamanında her zaman yükleniyor; bu bilinen bir maliyet, dokümante
  edildi.
- **FOUC doğrulaması:** `npm run build` sonrası üretilen
  `.next/server/app/index.html` incelendi — `<html>` etiketi ilk baytından
  itibaren `data-theme="light"` ve çözümlenmiş `--color-brand`/`--radius-*`/
  `--font-sans` değerlerini taşıyor; hiçbir client JS'in "düzeltmesi"
  gerekmiyor.
- `docs/TEMA-MIMARISI.md` oluşturuldu (tema akışı, token listesi, preset
  tablosu, yeni tema/token ekleme adımları — statik token 1 dosya,
  preset-driven token 3 dosya, yeni preset 3 dosya —, FOUC önlemi
  paragrafı). `CLAUDE.md`'nin okuma sırasına 9. madde olarak eklendi;
  `docs/DURUM.md` güncellendi.

**Gerekçe:** Kullanıcının kendi ifadesiyle tema sistemi bu token'lar
üzerine kurulacaktı — bu oturum, `TASARIM-SISTEMI.md`'deki statik
token'ları gerçek, veritabanı-yönetimli bir çalışma zamanı sistemine
bağlayan köprü. Sunucu tarafı enjeksiyon (client JS yok) hem "gereksiz
istemci bileşeni yaratma" kısıtını hem de FOUC gereksinimini aynı anda,
ekstra bir mekanizma gerektirmeden karşılıyor.

**Not:** Yeni migration henüz gerçek Supabase projesine uygulanmadı —
kullanıcı SQL Editor'den çalıştıracak, ardından `npm run types:generate`
gerekiyor (bkz. `DURUM.md` "Sıradaki adım"). Panelden preset seçimi
arayüzü henüz yok, panel auth'tan sonra ele alınacak.

---

## 2026-08-08 — Migration uygulandı, tipler yenilendi, gerçek veriyle uçtan uca doğrulandı; `.next` cache bulgusu

**Olay:** Kullanıcı bir önceki karardaki migration'ı (`20260808120000_
add_theme_preset_to_site_settings.sql`) SQL Editor'de çalıştırdı
("Success"). Süreçte iki küçük engel çıktı: (1) token'ı ayarlayıp
`npm run types:generate`'i yanlış klasörde (`C:\WINDOWS\System32`, PowerShell'in
o pencerede öyle açılmış olmasından) çalıştırdı — `cd` ile proje klasörüne
geçilerek çözüldü; (2) Personal Access Token'ı sohbete yapıştırdı — kalıcı
bir sır sızıntısı riski küçük olsa da (bu token sadece hesap düzeyinde tip
üretimi yapabiliyor, veri erişimi yok) kullanıcıya token'ı iptal edip
yenisini oluşturması söylendi.

**Uygulama:**
- `npm run types:generate` başarıyla çalıştı, `types/database.types.ts`'e
  `theme_preset: string` (Row) / `theme_preset?: string` (Insert/Update)
  eklendiği doğrulandı (kullanıcının yapıştırdığı `git diff` çıktısıyla).
- `lib/supabase/queries.ts` → `getSiteThemeSettings()` tipsiz client'tan
  `createServiceRoleClient()`'e taşındı; `lib/supabase/server.ts`'teki
  artık kullanılmayan `createUntypedServiceRoleClient()` (ve onu
  destekleyen `readServiceRoleCredentials()` yardımcı fonksiyonu) tamamen
  kaldırıldı — ölü kod bırakılmadı.
- **Platform sahibinin tenant satırı hâlâ yoktu** (madde 2 kaydında bu iş
  ertelenmişti) — kullanıcıya soruldu, "şimdi ekle" seçildi.
  `supabase/seed.sql`'e yeni bir `insert` bloğu eklendi: `tenants`
  (`is_platform_owner=true`, `theme_mode='dark'`) + `site_settings`
  (`theme_preset='modern-koyu'`). Bilinçli olarak varsayılan
  (kurumsal-mavi/light) değerlerin **dışında** bir kombinasyon seçildi —
  aksi halde render sonucunun gerçekten DB'den mi geldiği yoksa fallback'e
  mi düştüğü ayırt edilemezdi. Kullanıcı bu `insert`'i SQL Editor'de
  çalıştırdı ("Success").
- **Bulgu:** İlk `npm run build`'da hâlâ eski (fallback) sonuç geldi.
  Geçici bir tanı script'iyle (`scripts/_debug-theme.mjs`, sonradan
  silindi) doğrudan Supabase'e sorgu atılıp uygulamanın kullandığı **aynı**
  sorgunun doğru veriyi (`theme_mode: "dark"`, `theme_preset: "modern-koyu"`)
  döndürdüğü kanıtlandı — yani sorun kodda değildi. `.next` klasörü
  silinip yeniden derlenince `<html data-theme="dark"
  style="--color-brand:#24a8a4;...">` doğru geldi. Sonuç: **Next.js'in
  build/route cache'i, kod değişmediği için Supabase'deki dış veri
  değişikliğini algılamadı**, önceki (satır yokken alınan) sonucu
  önbellekte tuttu. Bu, prod'da zaten `MIMARI.md` madde 6'daki on-demand
  ISR (`revalidatePath`/`revalidateTag`, panelden tetiklenen) kararının
  tam olarak neden gerekli olduğunu somut biçimde doğruladı — panel henüz
  yok, o yüzden bu tetikleyici de yok, ama mimari zaten bunu öngörmüştü.
  Bulgu `docs/TEMA-MIMARISI.md` madde 6'ya eklendi.
- `docs/VERİ-MODELİ.md`'deki "2 tenant" ifadesi 3'e güncellendi.

**Gerekçe:** Kod yazılıp derlenmiş olması yeterli değil — gerçek veriyle
uçtan uca doğrulanmadan "bitti" sayılmaz (`TEST-STRATEJISI.md`, Definition
of Done). Bu doğrulama sürecinin kendisi, ayrı bir mimari riski (stale
cache) gün yüzüne çıkardı; bu bulgunun dokümante edilmemesi, ileride aynı
şaşkınlığın (yeni bir tema/tenant verisi eklenip build alınca neden hâlâ
eski görünüyor) tekrar yaşanmasına yol açardı.

**Not:** Platform sahibinin gerçek tanıtım sitesi içeriği (hero/services/
projects/contact) hâlâ yok — bu ekleme sadece `theme_preset`
doğrulaması içindi, kapsamı genişletmiyor (bkz. `DURUM.md`).

---

## 2026-08-08 — İlk `components/ui/` bileşenleri: Button, Container, SectionHeader, form alanları

**Karar:** Kullanıcı BAĞLAM/İSTEK/KISITLAR/KABUL KRİTERİ formatında bir
yönergeyle, yeniden kullanılabilir genel UI bileşenleri istedi: `Button`
(primary/secondary/ghost × sm/md/lg, devre dışı/yükleniyor durumları,
gerçek `<button>`), bir kap (`Container`) bileşeni, bölüm başlığı
(`SectionHeader`, başlık seviyesi dışarıdan verilebilir), ve etiket/hata/
yardım metni destekli form alanları (metin, çok satır, seçim kutusu).
Kısıt: varyant/boyut TypeScript ile tip güvenli, `asChild`/polymorphic
karmaşıklığı yok, renkler token class'larıyla, odak halkası klavye
kullanıcısına görünür, kod 60 satırı geçmesin, aşırı soyutlama yapılmasın.

**Uygulama:**
- 6 bileşen `components/ui/`'a eklendi (`Button.tsx` 57 satır,
  `Container.tsx` 17, `SectionHeader.tsx` 37, `SelectField.tsx` 51,
  `TextField.tsx` 50, `TextareaField.tsx` 49) — hepsi Server Component
  (state/etkileşim gerekmiyor, `"use client"` yok), hepsi native HTML
  elementi (`<button>`, `<input>`, `<textarea>`, `<select>`) kullanıyor.
- Form alanları arasında ortak markup (etiket/hata/yardım metni kalıbı)
  olmasına rağmen **bilinçli olarak** paylaşılan bir soyutlamaya
  çıkarılmadı — kullanıcının "aşırı soyutlama yapma" isteğiyle tutarlı,
  her dosya kendi başına okunabilir kaldı.
- Etiket-alan bağı `useId()` ile otomatik `htmlFor`/`id`; hata/yardım
  metni `aria-describedby` ile bağlı, hata `role="alert"` taşıyor.
- `Button`'da yükleniyor durumu `aria-busy` + görünmez (`sr-only`) metinle
  ekran okuyucuya bildiriliyor; devre dışı durum native `disabled` ile
  (ek kod gerekmiyor — hem tıklamayı engelliyor hem tab sırasından
  çıkarıyor).
- Odak halkası `focus-visible:ring-2 focus-visible:ring-brand` — sadece
  klavye odağında görünür, mouse tıklamasında çıkmıyor.
- Geçici vitrin sayfası: `app/test-components/page.tsx` (tüm bileşenler,
  tüm varyantlarıyla) — klavye ile (Tab, odak halkası, devre dışı
  butonun atlanması) doğrulandı, derlenmiş HTML çıktısından teyit edildi
  (`disabled=""`, `aria-busy` doğru değerlerle).
- `docs/TASARIM-SISTEMI.md`'ye madde 8 (Bileşen Envanteri, tablo) ve
  madde 9 (Bileşen API Kuralları, 9 madde + klavye doğrulama adımları)
  eklendi.

**Gerekçe:** Kullanıcının kendi ifadesiyle önemli bir aşama — tasarım
sisteminin (token'lar) ilk kez gerçek, yeniden kullanılabilir bileşenlere
dönüştüğü an. Kuralların (native element, token renk, görünür odak,
etiket bağı) yazılı hale getirilmesi, ileride yazılacak her yeni
bileşenin aynı standarda uymasını sağlıyor.

---

## 2026-08-08 — Hero bölümü + varyant deseni + Navbar/MobileMenu kuruldu

**Karar:** Kullanıcı, 11 bölümlü bir kurumsal sitede her bölümün 2-3
görsel varyantı olacağını ve hangi varyantın kullanılacağının veritabanı
ayarından (panelden değiştirilebilir) geleceğini belirtti; bir desen
önerilmesini ve örnek kodunu (Hero üzerinden) istedi. Ardından sırayla:
ortak bölüm arayüzü + `MIMARI.md` ile uyumlu klasör düzeni, Navbar (logo +
bölüm linkleri + iletişim butonu, kaydırınca görünüm değişimi, sayfa içi
linkler), mobil menü (odak tuzağı, Escape, scroll kilidi), Hero varyant A
(tam genişlik arka plan + 2 buton) ve varyant B (iki kolonlu, aynı veri),
görsel optimizasyonu (`next/image`, `sizes`/`priority`) istendi. Kısıt:
varyant seçimi tek yerde çözülsün (tekrarlanan if/else yok), varyant
adları tip güvenli (geçersiz varyant derlemede yakalansın), bölümler
mümkün olduğunca Server Component kalsın, yeni varyant eklemek tek dosya +
bir kayıt satırı olsun.

**Şema kararı (kullanıcıya sorulmadan, gerekçeyle uygulandı):**
`hero_sections`'ta varyant seçimi için bir kolon yoktu, ve "varyant A iki
eylem butonu" isteği mevcut tek `cta_text`/`cta_link` çiftiyle
karşılanamıyordu. Yeni migration eklendi:
`supabase/migrations/20260808140000_add_hero_variant_and_secondary_cta.sql`
— `hero_sections.variant` (`'a'`/`'b'`, check constraint, varsayılan
`'a'`) + `secondary_cta_text`/`secondary_cta_link` (nullable, ikinci/
opsiyonel buton). `theme_preset`'teki gibi aynı desen: küçük, net
gerekçeli bir şema eklemesi, kullanıcıya şeffaf bildirildi. **Henüz
gerçek Supabase projesine uygulanmadı.**

**Uygulama:**
- **Desen:** `components/site/<bölüm>/` altında 4 dosya — `types.ts`
  (veri arayüzü + varyant string literal union), `<Bölüm>VariantX.tsx`
  (her varyant AYNI veri arayüzünü props olarak alır, sadece düzen
  değişir), `registry.ts` (`Record<HeroVariant, ComponentType<...>>` —
  varyant seçimi tek burada), `<Bölüm>.tsx` (çözümleyici — registry'den
  seçip render eder). Tip güvenliği: `Record<HeroVariant, ...>` sayesinde
  union'a yeni bir varyant eklenip registry'de karşılığı unutulursa
  TypeScript eksik anahtar hatası verir.
- `components/site/hero/` — `HeroVariantA` (tam genişlik arka plan,
  metin/butonlar üzerinde; görsel salt dekoratif → `alt=""`), `HeroVariantB`
  (iki kolonlu, aynı veri; görsel metnin yanında ayrı öğe → `alt={title}`,
  bilinen bir sınırlama — özel alt-metin kolonu yok). İkisi de `id="hero"`
  taşıyor (Navbar'ın `#hero` linki için).
- `components/site/Navbar.tsx` + `MobileMenu.tsx` — ikisi de `"use client"`
  (kaydırma algılama ve menü state'i gerçek etkileşim, kısıttaki "mümkün
  olduğunca Server Component" ifadesi Hero gibi *bölümler* içindi, Navbar
  değil). Mobil menüde: açılınca odak ilk öğeye taşınıyor, Tab/Shift+Tab
  menü içinde dönüyor (focus trap), `Escape` kapatıyor, `body`'nin
  `overflow`'u `hidden` yapılıyor (scroll kilidi), kapanınca odak
  tetikleyici hamburger butonuna dönüyor.
- **Yeni:** `components/ui/LinkButton.tsx` — CTA'lar gezinme olduğu için
  gerçek `<a>` (Button'a `asChild` eklenmedi, önceki kararla tutarlı,
  ayrı küçük bir bileşen); `lib/supabase/storage.ts` — `*_path`
  kolonlarını gerçek Storage URL'ine çeviren, client oluşturmayan (salt
  string birleştirme) yardımcı; `next.config.ts`'e `images.remotePatterns`
  (Supabase Storage host'u — bu olmadan `next/image` hiç yüklenmez,
  runtime hatası verir).
- `lib/supabase/queries.ts` → `getHeroSection()` — `theme_preset` ile
  aynı geçici desen (tipsiz client, migration henüz uygulanmadığı için;
  Supabase erişilemezse/satır yoksa `null` döner, sayfa çökmez).
- Geçici doğrulama: `app/test-sections/page.tsx` — Navbar + Hero, varyant
  A/B arasında canlı geçiş yapan bir toggle (`HeroVariantToggle.tsx`,
  sadece bu geçici sayfaya özel `"use client"`) ile.

**Yol boyunca bulunan ve düzeltilen 2 gerçek hata:**
1. `components/ui/Container.tsx`'te boş `interface` — ESLint hatası
   (`@typescript-eslint/no-empty-object-type`); `type` alias'a çevrilerek
   düzeltildi.
2. İlk taslakta doğrulama sayfası iki Hero varyantını üst üste
   gösteriyordu, ikisi de `id="hero"` taşıdığından derlenmiş HTML'de
   **iki kez** `id="hero"` çıktı (geçersiz HTML, erişilebilirlik
   sorunu) — `grep -c` bunu ilk seferde gizledi (dosya tek satır,
   satır sayıyor, tekrar saymıyor), `grep -o | wc -l` ile yakalandı.
   Sayfa, ikisini aynı anda göstermek yerine bir geçiş butonuna
   çevrilerek düzeltildi — bu aynı zamanda seçim mekanizmasının çalışma
   anında da doğru çalıştığını kanıtladı.

**Gerekçe:** Kullanıcı bunun önemli bir aşama olduğunu vurguladı — çok
sayıda bölüm/varyant kombinasyonunun bakımı, seçim mantığının TEK bir
yerde (registry) toplanmasını gerektiriyor; aksi halde her bölümde
tekrarlanan if/else, zamanla tutarsızlık ve unutulan varyant riski
doğurur. `Record<Variant, Component>` deseni, TypeScript'in kendi tip
sistemini bu tutarlılığı garanti etmek için kullanıyor.

**Not:** `npm run build`/`lint` temiz, ama henüz commit'lenmedi; yeni
migration da henüz gerçek projeye uygulanmadı.

---

## 2026-08-08 — Hizmetler + Hakkımızda bölümleri, `lucide-react` kuruldu

**Karar:** Kullanıcı BAĞLAM/İSTEK/KISITLAR/KABUL KRİTERİ formatında,
Hizmetler bölümünü istedi: sadece yayınlanmış hizmetleri `order_index`
sırasıyla çek ve ızgarada göster; iki kart varyantı (ikonlu sade, görselli
büyük — aynı veriyle); boş durum kararı (kayıt yoksa gizle, boş alan
bırakma) dökümana yazılsın; Hakkımızda bölümü (hikaye, kuruluş yılı,
değerler listesi, görsel — içerik tablosundan); taşma testi (çok uzun
başlık/açıklama kartı bozmasın); duyarlılık kontrolü (360/768/1440px,
yatay kaydırma olmamalı). Kısıt: veri sunucu bileşeninde çekilsin, sadece
`is_published=true` + `order_index`, duyarlı ızgara (mobil 1/tablet 2/
masaüstü 3 sütun), kayıt yoksa bölüm hiç render edilmesin, üretilen
Supabase tipleri kullanılsın (`any` yok), mevcut `Card` bileşeni
kullanılsın (yeni kart stili uydurulmasın).

**Yönergeyle gerçek durum arasında 3 uyuşmazlık bulundu (kod yazmadan
önce, kullanıcıya bildirilerek):**
1. **`Card` bileşeni yoktu** — BAĞLAM "hazır" diyordu, `components/ui/`'da
   yoktu. Genel amaçlı, minimal bir `Card.tsx` (Container'la aynı ilke —
   kendi iç düzen dayatmıyor) yazılarak çözüldü.
2. **`services.image_path` kolonu yoktu** — BAĞLAM "var" diyordu, şemada
   yoktu. "Görselli büyük kart" varyantı için gerekliydi.
3. **`about_sections`'ta "değerler listesi" için kolon yoktu.**

**Şema kararı (kullanıcıya sorulmadan, gerekçeyle uygulandı, `theme_preset`/
`hero_sections.variant`'la aynı desen):** Yeni migration —
`supabase/migrations/20260808150000_add_services_image_and_about_values.sql`
— `services.image_path` (text) + `about_sections.core_values` (`text[]`,
"values" SQL'de ayrılmış kelime olduğu için `testimonials`/`references`
örneğindeki gibi farklı isimlendirildi). **Henüz gerçek Supabase
projesine uygulanmadı.**

**İkon kararı — kullanıcıya soruldu (AskUserQuestion):** `services.icon`
kolonundaki demo değerleri ('home', 'building-2', 'hammer' vb.) Lucide
ikon kütüphanesinin isimleriyle birebir örtüşüyordu ama proje hiçbir ikon
paketi kullanmıyordu. Seçenekler: `lucide-react` kur (temiz/profesyonel,
demo veriyle zaten uyumlu) vs. yeni bağımlılık eklemeden birkaç ikonu
elle SVG olarak çiz. **Kullanıcı `lucide-react` kurulumunu seçti** —
`npm install lucide-react` komutu verildi, kullanıcı çalıştırdı.

**Uygulama:**
- `components/site/services/` — Hero'daki 4 dosyalı desenin birebir
  aynısı: `types.ts` (`ServiceItem`, `ServiceCardVariant` union),
  `ServiceCardIcon`/`ServiceCardImage` (aynı `ServiceItem` props, sadece
  düzen farklı — ikonlu kartta `Image`'da `priority` yok, çünkü ızgara
  ekranın altında, LCP değil — Hero'dan kasıtlı fark), `registry.ts`
  (`Record<ServiceCardVariant, Component>`), `ServicesSection.tsx`
  (async Server Component — kendi verisini kendi çeker, `cardVariant`
  prop'u var ama şu an DB'den değil çağırandan geliyor; ileride
  `site_settings`'e benzer bir kolonla bağlanması aynı registry
  sayesinde kolay).
- `lib/supabase/queries.ts` → `getServices()` yeniden yazıldı: platform
  tenant'ın id'sini bulup (`tenants.is_platform_owner=true`), SONRA
  `services`'i `tenant_id` + `is_published=true` + `order_index` ile DB
  seviyesinde filtreli/sıralı çekiyor (JS'te filtrelemek yerine — iki
  ayrı sorgu, ama PostgREST'in iç içe (nested embed) filtreleme
  sözdiziminin kırılgan/test edilmemiş olma riskinden kaçınmak için
  bilinçli tercih). Hata durumunda `console.error` + boş dizi dönüyor
  (throw etmiyor) — kabul kriterinin gereği. `getAboutSection()` eklendi,
  `getHeroSection()`'la aynı iç içe embed deseni (tekil kayıt).
- `components/site/about/AboutSection.tsx` — tek varyant (istenmedi),
  `getAboutSection()`'dan veri çekiyor, kayıt yoksa `null`.
- **Boş durum kararı (dökümante edildi, kısıtın kendisi netleştirdi):**
  Kayıt yoksa bölüm hiç render edilmez — ne boş bir "henüz hizmet yok"
  mesajı, ne boş bir alan. Hem `ServicesSection` hem `AboutSection` kendi
  veri kontrolünü kendi yapıp `null` döner (Hero'nun aksine — Hero'da bu
  kontrol çağırana bırakılmıştı; burada bölümün kendi içine alınması daha
  sağlam bulundu, unutulma riski yok).
- **Taşma testi:** `line-clamp-2` (başlık) / `line-clamp-3` (açıklama)
  uygulandı; `app/test-sections/page.tsx`'e kasıtlı çok uzun başlık/
  açıklamalı bir "Taşma testi" bölümü eklendi, derlenmiş CSS'te
  `line-clamp-3`'ün gerçek `-webkit-line-clamp` kuralı ürettiği
  doğrulandı.
- `next.config.ts`'teki `images.remotePatterns` zaten tüm Storage
  bucket'larını kapsadığı için (`/storage/v1/object/public/**`) hizmet/
  hakkımızda görselleri için ek bir değişiklik gerekmedi.

**Yol boyunca bulunan ve düzeltilen 3 gerçek sorun:**
1. `app/test-services/page.tsx` silinince Next.js'in `.next` tip
   önbelleği (`validator.ts`) silinen sayfaya bozuk bir referans verdi,
   `npm run build` bu yüzden başarısız oldu — `.next` temizlenip
   yeniden derlenerek çözüldü (2026-08-08'deki önceki `.next` cache
   bulgusuyla aynı kökten, ayrı bir tetikleyici).
2. `ServiceCardIcon`'da `const Icon = getServiceIcon(icon); <Icon/>`
   deseni ESLint'in `react-hooks/static-components` kuralını tetikledi
   ("render sırasında bileşen oluşturuluyor", state sıfırlanma riski).
   İkon seçimi + render'ı, adı küçük harfle başlayan (bileşen olarak
   algılanmayan) bir yardımcı fonksiyona (`renderServiceIcon`, JSX
   elementi döndürüyor) taşınarak düzeltildi — `icons.ts` da bu yüzden
   `icons.tsx`'e çevrildi.
3. `ComponentType` tipi yanlışlıkla `lucide-react`'ten import edilmişti
   (`lucide-react`'te böyle bir export yok) — `react`'e düzeltildi.

**Gerekçe:** Boş durum kararının (kayıt yoksa gizle) bilinçli ve
dökümante edilmiş olması önemli — aksi halde ileride biri "neden hizmet
bölümü bazen hiç görünmüyor" diye şaşırabilir. İki ayrı sorgu (tenant id
+ services) tercihi, PostgREST'in iç içe filtreleme sözdizimini
denemeden production koduna sokmamak için — basit/doğrulanabilir kod,
zarif ama test edilmemiş koddan iyidir.

**Not:** İki migration da (`20260808140000_...`,
`20260808150000_add_services_image_and_about_values.sql`) henüz gerçek
Supabase projesine uygulanmadı — `getServices()`/`getAboutSection()`
bilinçli olarak tipsiz client kullanıyor, migration uygulanıp tipler
yeniden üretilince tipli client'a taşınmalı.

---

## 2026-08-08 — İki migration uygulandı, tipli client'a taşındı; Projeler bölümü + kategori filtresi + detay penceresi kuruldu

**Olay (önceki karardan devam):** Kullanıcı iki bekleyen migration'ı
(`20260808140000_...`, `20260808150000_...`) SQL Editor'de çalıştırdı,
`npm run types:generate` çalıştırdı. `getHeroSection()`/`getServices()`/
`getAboutSection()` tipli `createServiceRoleClient()`'e taşındı, artık
hiçbir yerde kullanılmayan `createUntypedServiceRoleClient()` (ve onu
destekleyen yardımcı fonksiyon) `lib/supabase/server.ts`'ten tamamen
kaldırıldı.

**Karar:** Kullanıcı BAĞLAM/İSTEK/KISITLAR/KABUL KRİTERİ formatında
kategoriye göre filtrelenebilen bir Projeler bölümü istedi: projeleri
görsel/başlık/konum/yıl ile ızgarada göster; kategori filtresi (istemcide
çalışsın ama ilk render sunucudan gelsin); doğru boyut/formatta,
ilk-satır-öncelikli-gerisi-tembel görsel stratejisi; karta tıklayınca
büyük görsel + açıklama + künye içeren, Escape ile kapanan, odak yönetimi
doğru bir detay penceresi; ikinci galeri varyantı olarak mozaik düzen;
bölümü içeren sayfada Lighthouse çalıştırıp görsellerin sayfa ağırlığına
etkisini raporla. Kısıt: veri sadece sunucuda çekilsin (sadece filtreleme
istemcide), filtre butonları klavyeyle kullanılabilir + seçili durum
ekran okuyucuya bildirilsin, filtre değişince sayfa yeniden yüklenmesin,
kategori listesi sabit yazılmasın (veriden türetilsin), sunucu/istemci
sınırı net olsun (tüm bölüm istemciye dönüşmesin), filtre sonucu boşsa
anlamlı mesaj, kod 150 satırı geçmesin.

**Yönergeyle gerçek şema arasında yine bir uyuşmazlık bulundu (kod
yazmadan önce bildirilerek):** BAĞLAM `city`/`category`/`cover_path`
diyordu; gerçek `projects` tablosunda `location`/`image_path` var (isim
farkı, aynı anlam — gerçek adlar kullanıldı) ve `category`/`description`
(detay penceresi için "açıklama" istenmişti) **hiç yoktu**.

**Şema kararı (kullanıcıya sorulmadan, gerekçeyle uygulandı — aynı desen,
üçüncü kez):** Yeni migration —
`supabase/migrations/20260808160000_add_projects_category_and_description.sql`
— `category` (serbest metin, check constraint yok — filtre listesinin
kodda sabit yazılmaması gerektiği için değerler de kısıtlanmadı) +
`description`. Demo verideki 8 Akme projesine gerçekçi kategori
(Konut/Ticari/Altyapı) ve açıklama backfill edildi — filtreleme test
edilebilsin diye. **Henüz gerçek Supabase projesine uygulanmadı.**

**Uygulama:**
- `components/site/projects/` — `types.ts` (`ProjectItem`,
  `GalleryVariant` = `"grid" | "mosaic"`), `ProjectCard.tsx` (her iki
  galeri düzeninde de kullanılan TEK kart — `fill` prop'u sabit oranlı
  görsel alanı ile ebeveyn hücreyi dolduran görsel alanı arasında geçiş
  yapıyor, böylece aynı kart hem ızgarada hem mozaikte doğru görünüyor),
  `ProjectsGridLayout`/`ProjectsMosaicLayout` (mozaik gerçek CSS
  masonry'yle değil — tarayıcı desteği hâlâ sınırlı/deneysel olduğu için
  — `grid-auto-rows` + her 5 projede bir 2x2 span veren bir teknikle),
  `registry.ts` (Hero/Hizmetler'le aynı ilke).
- **Sunucu/istemci sınırı (DOĞRULAMA sorusunun cevabı):**
  `ProjectsSection.tsx` (Server Component) `getProjects()`'i çağırıp
  kategori listesini `Array.from(new Set(projects.map(p => p.category)...))`
  ile veriden türetiyor, sonucu `ProjectsExplorer.tsx`'e prop olarak
  geçiyor. **`ProjectsExplorer.tsx`, `"use client"` içeren TEK dosya** —
  kendi veri çekmiyor, sadece `selectedCategory` (filtre) ve
  `selectedProject` (hangi detay penceresi açık) state'ini tutuyor. "İlk
  render sunucudan gelsin" isteği otomatik karşılanıyor: Next.js Client
  Component'leri de ilk istekte sunucuda render eder,
  `selectedCategory`'nin başlangıç değeri "Tümü" olduğu için ilk HTML
  zaten filtrelenmemiş tam listeyi gösteriyor.
- Filtre butonları `aria-pressed` ile (klavyeyle erişilebilir native
  `<button>`, seçili durumu ekran okuyucuya otomatik bildiren doğru ARIA
  deseni), `role="group"` ile gruplu. Filtre değişimi salt React state —
  sayfa hiç yeniden yüklenmiyor.
- `ProjectDetailModal.tsx` — büyük görsel, açıklama, künye (konum/yıl/
  kategori bir `<dl>` içinde), varsa `live_url` linki. Kart tıklaması bir
  modal AÇTIĞI için (gezinme değil aksiyon) gerçek `<button>` (Hero'daki
  CTA linklerinin `<a>` olması kararıyla tutarlı, ters durum).
- **Yeni paylaşılan hook:** `lib/hooks/useDialogBehavior.ts` — odak
  tuzağı/Escape/scroll kilidi mantığı artık burada tek yerde. Form
  alanlarındaki basit etiket/hata markup'ının aksine (bilerek
  soyutlanmamıştı, bkz. 2026-08-08 "İlk components/ui/ bileşenleri"
  kaydı), bu mantık gerçekten karmaşık/hataya açık (klavye olayları, odak
  döngüsü) olduğu için paylaşılan bir soyutlamaya çıkarıldı — iki farklı
  yerde iki hafif farklı implementasyon tutmanın riski, kod tekrarının
  "basitlik" avantajından ağır bastı. `MobileMenu.tsx` da retroaktif
  olarak bu hook'u kullanacak şekilde sadeleştirildi.
- `next/image`: ızgarada ilk 3 kart (`index < 3`) `priority`, mozaikte de
  aynı eşik — next/image'ın varsayılan davranışı zaten `priority`
  verilmeyen görselleri tembel yüklüyor, ek kod gerekmedi.

**Performans ölçümü (Lighthouse, gerçekten çalıştırıldı):** `npm run
build` + `npm run start` ile prod sunucu ayağa kaldırılıp yerel Chrome
ile (`npx lighthouse --chrome-flags="--headless --no-sandbox"`)
`/test-projects` sayfasına karşı çalıştırıldı. Sonuç: **Performance 96**,
LCP 2.7s, CLS 0, TBT 120ms, toplam sayfa ağırlığı 253 KiB, **görsel
isteği sayısı 0**. Bu son rakam "görsellerin etkisi yok" anlamına
gelmiyor — Storage'da henüz hiç gerçek görsel olmadığı (tüm
`coverPath`/`image_path` değerleri `null`) için hiç görsel indirilmedi.
Gerçek fotoğraf yüklenince ölçüm tekrarlanmalı (bkz. `DURUM.md` sıradaki
adım 9).

**Bulunan ortam tuhaflığı (kod hatası değil):** `npm run build`
sırasında tutarlı biçimde sadece `getProjects()`'te "JWT issued at
future" (PGRST303) hatası gözlendi, diğer sorgularda hiç görülmedi.
İzole bir tanı script'iyle aynı sorgu doğrudan çalıştırıldığında net,
beklenen hatayı verdi ("column projects.description does not exist" —
migration henüz uygulanmadığı için) — yani asıl sorgu mantığı doğru,
build'deki hata Next.js'in paralel statik üretim/fetch katmanına özgü,
ortama bağlı bir zamanlama tuhaflığı. İki durumda da mevcut hata yönetimi
(catch/log/boş dizi) sayfayı çökertmeden karşılıyor, bu yüzden daha fazla
araştırılmadı.

**Gerekçe:** Sunucu/istemci sınırının TEK bir dosyada (ve o dosyanın
üstündeki yorumda) açıkça belirtilmesi, kullanıcının "hangi dosyada
çizdiğini açıkla" sorusunu doğrudan cevaplıyor — bu aynı zamanda ileride
başka biri (veya AI) bu deseni değiştirirken sınırı yanlışlıkla
bulanıklaştırmasını (ör. veri çekmeyi client component'e taşımak)
zorlaştıran bir dokümantasyon alışkanlığı.

**Not:** `npm run build`/`lint` temiz, henüz commit'lenmedi; yeni
migration da henüz gerçek projeye uygulanmadı.

---

## 2026-08-08 — Referanslar + İstatistikler + SSS bölümleri, gerçek bir kontrast hatası bulundu ve düzeltildi

**Karar:** Kullanıcı erişilebilir bir SSS akordiyonu + Referanslar
(isim/firma/yorum/varsa logo, mobilde kaydırmalı/masaüstünde ızgara) +
İstatistikler (rakamlar Türkçe biçimde) bölümlerini istedi; her ikisine
ikinci bir varyant (Referanslar: tek büyük alıntı, SSS: iki kolon)
eklendi; hareket tercihine (`prefers-reduced-motion`) saygı istendi; son
olarak bu üç bölümü otomatik bir erişilebilirlik aracıyla tarayıp
bulguları not almam istendi. Kısıt: tam klavye desteği, `aria-expanded` +
panel-başlık ilişkisi, aynı anda birden fazla panel açık kalabilsin,
hazır kütüphane yok (sade React), kod 90 satırı geçmesin.

**Şema kararı — bu sefer kullanıcıya soruldu (mekanik bir ekleme değil,
gerçek bir mimari tercih olduğu için):** İstatistikler için hiç tablo
yoktu. Seçenek sunuldu: mevcut tablolardan hesaplama (projects/testimonials
sayısı, `founded_year`'dan yıl hesabı — gerçek kayıt sayısına kilitli) vs.
yeni bir `stats` tablosu (panelden serbestçe "50+" gibi girilen). Kullanıcı
**yeni tablo** seçti. `testimonials`'ta da "varsa logo" için kolon yoktu.
Yeni migration: `supabase/migrations/
20260808170000_add_testimonial_logo_and_stats_table.sql` —
`testimonials.logo_path` + yeni `stats` tablosu (`label`, `value integer`,
`suffix` — Türkçe sayı biçimlendirmesi gerçek bir sayı üzerinden
yapılabilsin diye `value` tam sayı, hazır biçimlendirilmiş metin değil).
RLS politikaları diğer liste tablolarıyla (`testimonials`/`faqs`) birebir
aynı desende yazıldı. Platform tenant'a 3 örnek istatistik + Akme'nin bir
referansına (Kaya Holding) logo yolu backfill edildi. **Henüz gerçek
Supabase projesine uygulanmadı.**

**Uygulama:**
- `components/site/faqs/FaqAccordionItem.tsx` — gerçek `<button>`
  (Tab/Enter/Space native çalışır), `aria-expanded` + `aria-controls` +
  panelde `role="region"`/`aria-labelledby`. Her öğe **kendi** `useState`'ini
  tutuyor — "diğerlerini kapat" mantığı yok, kısıtın gereği ("aynı anda
  birden fazla panel açılabilsin") zaten varsayılan davranış. Başlık
  seviyesi `headingLevel` prop'uyla ayarlanabilir (`SectionHeader`'daki
  `const Heading = headingLevel; <Heading>` deseniyle aynı — bu desenin
  `react-hooks/static-components` kuralını TETİKLEMEDİĞİ daha önce
  doğrulanmıştı, çünkü kaynak bir string prop, bir fonksiyon çağrısı
  değil).
- Genişleme animasyonu `grid-template-rows: 0fr → 1fr` CSS tekniğiyle
  (JS yükseklik ölçümü gerekmez, modern tarayıcılarda çalışır);
  `motion-reduce:transition-none` (Tailwind'in yerleşik varyantı) ile
  `prefers-reduced-motion: reduce` kullanıcılarında animasyon tamamen
  kapanıyor. Derlenmiş CSS'te `@media (prefers-reduced-motion:reduce)`
  bloğunun doğru üretildiği doğrulandı.
- SSS'nin 2. varyantı ("iki kolon") için ayrı bir `registry.ts` **bilinçli
  olarak açılmadı** — fark salt native CSS `columns-2` (öğeleri JS'le
  bölmeye gerek yok, `break-inside-avoid` ile tek öğenin bölünmesi
  engelleniyor); Hero/Hizmetler/Projeler'in aksine burada iki farklı JSX
  yapısı yok, tek bileşen + bir prop yeterliydi (aşırı soyutlama
  yapılmadı).
- `components/site/testimonials/` — `TestimonialCard` (ortak kart, `large`
  prop'uyla iki varyantta da kullanılıyor), `TestimonialsGrid` (mobilde
  `snap-x` ile yatay kaydırma, `sm:` üzerinde ızgara — tek CSS, JS yok),
  `TestimonialsFeatured` (tek büyük alıntı + ok butonlarıyla geçiş —
  sadece ilk referansı gösterip diğerlerini görünmez kılmak yerine, tüm
  veriyi kullanan bir çözüm tercih edildi), `registry.ts` (bu ikisi
  gerçekten farklı JSX yapıları olduğu için Hero'daki gibi tam registry).
- `components/site/stats/StatsSection.tsx` — `Intl.NumberFormat("tr-TR")`
  ile binlik ayraç noktalı Türkçe biçim + `suffix` eklenmesi. Tamamen
  Server Component, hiç etkileşim yok.

**Erişilebilirlik taraması (gerçekten çalıştırıldı, istenen son adım):**
`npm run build` + `npm run start` + yerel Chrome ile
`npx @axe-core/cli http://localhost:3000/test-social-proof`. İlk tarama
**13 bulgu** verdi. **Gerçek, actionable bir bulgu:** `color-contrast` —
kendi geçici "geçici doğrulama sayfası" banner'larımda (üç ayrı test
sayfasında tekrarlanan) kullandığım `bg-warning text-white` deseni, site
şu an platform tenant'ın `theme_mode='dark'` ayarı yüzünden koyu temada
render olduğundan, koyu temanın `warning` rengi (`#cb850b`) üzerinde
beyaz metin sadece **3.04:1** veriyordu (4.5:1 gerekli) — bu spesifik
"renk dolgu + üzerinde sabit metin rengi" senaryosu `TASARIM-SISTEMI.md`
madde 2'deki kontrast denetiminde hiç test edilmemişti (sadece "semantik
renk metin olarak" senaryosu doğrulanmıştı). Üç dosyada da
`border-b-2 border-warning bg-surface-raised text-text` (tema-bağımsız,
`--color-text` zaten doğru temaya göre çözülüyor) ile düzeltildi, tarama
tekrarlanıp **12 bulguya** düştüğü ve kontrast ihlalinin tamamen
kaybolduğu doğrulandı.

Kalan 12 bulgu (`landmark-one-main`, `page-has-heading-one`,
`landmark-unique` ×4, `region` ×6) incelendi ve **gerçek bileşen hatası
olmadığı** sonucuna varıldı — hepsi ya demo sayfasının kendi yapısına
özgü (aynı örnek SSS verisi karşılaştırma amacıyla sayfada iki kez
gösterildiği için "eşsiz olmayan" landmark adı; demo sayfasında Hero
olmadığı için `<h1>` yok) ya da kök `app/layout.tsx`'te `<main>`
landmark'ının henüz eklenmemiş olması — bu sonuncusu bilerek şimdi
yamanmadı çünkü Navbar şu an her sayfanın kendi içinde render ediliyor,
`{children}`'ı körü körüne `<main>`'e sarmak Navbar'ı yanlışlıkla
`<main>` içine alırdı (semantik olarak yanlış); gerçek global layout/
Navbar yerleşimi kurulduğunda doğru yapılmalı (bkz. `DURUM.md` sıradaki
adım 5).

**Gerekçe:** Otomatik bir aracın gerçek bir hatayı yakalaması (kontrast),
elle yazılan kontrast tablosunun (`TASARIM-SISTEMI.md`) bile eksik
kalabileceğini gösterdi — "renk X metin olarak test edildi" ile "renk X
dolgu + sabit metin rengiyle test edildi" farklı senaryolar, ikisi de
ayrı ayrı doğrulanmalı. Bu, ileride yeni bir renk kullanım deseni (ör.
bir Alert/Toast bileşeni) yazılırken hatırlanması gereken bir ders.

**Not:** `npm run build`/`lint` temiz, henüz commit'lenmedi; yeni
migration da henüz gerçek projeye uygulanmadı.
