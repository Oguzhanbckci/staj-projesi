# Teslim Paketi — Kurumsal Web Sitesi Hizmeti

*Bu doküman, ürünü satın alacak/kullanacak müşteriyle veya karar vericiyle
paylaşılmak üzere hazırlanmıştır — teknik bilgi gerektirmez. Geliştirme
sürecinin teknik detayları için `docs/` klasöründeki diğer dosyalara
(`MIMARI.md`, `GUVENLIK.md` vb.) bakılabilir, bu doküman onların
yerine geçmez.*

**Hazırlanma tarihi:** 2026-08-17

---

## Ürün Özeti

İnşaat firmaları gibi, kurumsal bir web sitesine ihtiyacı olan ama
kendi teknik ekibi olmayan işletmeler için **tam yönetilen (managed)
bir kurumsal web sitesi hizmeti**.

"Tam yönetilen" ne demek: Müşteri bir web sitesi paketi satın alır,
biz kurar, yayına alır ve gerektiğinde bakımını yaparız — müşterinin
kod yazması, sunucu yönetmesi ya da teknik bir şey öğrenmesi gerekmez.
Sitenin içeriğini (hizmetler, projeler, referanslar, iletişim bilgileri
vb.) güncellemek için, tarayıcıdan girilen basit bir **yönetim
paneli** kullanılır — tıpkı bir e-posta hesabına giriş yapmak gibi.

Sitenin kendisi **11 farklı bölümden** oluşur (Ana Görsel, Hakkımızda,
Hizmetler, Projeler, Referanslar, İstatistikler, Sık Sorulan Sorular,
Ekip, Eylem Çağrısı, İletişim + otomatik oluşan üst menü/alt bilgi) —
her bölümün **2-3 farklı görsel düzeni (varyantı)** arasından seçim
yapılabilir, yani her müşteri sitesi aynı kalıptan çıkma değil, kendine
özgü bir görünüme sahip olabilir.

## Kapsam ve Kapsam Dışı

### Dahil Olan (Kapsam İçi)

- **Ziyaretçi sitesi** — yukarıda sayılan bölümlerin tamamı, açık/koyu
  tema desteğiyle, mobil ve masaüstünde düzgün görünecek şekilde
  (responsive tasarım).
- **Yönetim paneli** — gizli bir adresten (`/panel`), kullanıcı adı/
  şifreyle girilir. İçerik ekleme/düzenleme/silme/yayınlama, bölüm
  sırasını ve görünürlüğünü değiştirme, görsel yükleme, marka rengi/
  yazı tipi/logo ayarlama, arama motoru (SEO) ayarları, gelen iletişim
  formu mesajlarını görüntüleme.
- **İletişim formu** — ziyaretçiden gelen mesajlar panelde bir "gelen
  kutusu" gibi listelenir; **spam/bot koruması** dahildir (gizli tuzak
  alanı + otomatik hız sınırlama — bkz. "Kapsam Dışı" bölümündeki
  CAPTCHA notu).
- **Arama motoru optimizasyonu (SEO)** — sayfa başlığı/açıklaması,
  site haritası, arama motorlarının siteyi doğru okuması için gerekli
  teknik veri (yapısal veri/"structured data"), sosyal medyada
  paylaşılınca otomatik görsel oluşturma.
- **Güvenlik** — veriye kimin erişebileceği katı kurallarla sınırlanmış
  (bkz. aşağıda "Kapsam Dışı" — gelişmiş güvenlik konuları), giriş
  ekranı şifre korumalı, temel tarayıcı güvenlik ayarları aktif.
- **Kurulum ve kullanım kılavuzları** — sıfırdan kurulum için teknik
  bir kılavuz, panelin günlük kullanımı için teknik olmayan bir kılavuz
  (aşağıda "Teslim Edilenler"de detaylı).

### Kapsam Dışı (Bu Pakette YOK)

Dürüstçe: bu ürün her şeyi yapan bir platform değil, **bilinçli olarak
sınırlı tutulmuş, odaklı bir kurumsal site ürünü**. Aşağıdakiler
şu anki paketin İÇİNDE değildir — istenirse ayrı bir kapsam/ücret
konusu olarak konuşulabilir:

- **Fiyat/ödeme sayfası veya e-ticaret** — bu bir ürün/hizmet sitesi
  fiyatlandırmayı sitede göstermez.
- **Blog/haber sistemi** — bilinçli olarak yok (rakip analizimizde
  incelenen 8 firma sitesinin 7'sinde blog vardı, ama küçük/orta
  ölçekli bir firma için genelde düzenli içerik üretilmediği için
  zamanla "terk edilmiş" görünen bir bölüme dönüşüyor — bu riski almak
  yerine kapsam dışı bırakıldı).
- **Çoklu dil desteği** — site şu an sadece Türkçe.
- **Serbest sürükle-bırak sayfa tasarımı** — hazır bölüm kütüphanesinden
  seçim var (11 bölüm × 2-3 varyant), ama tam serbest bir sayfa
  düzenleyici (Wix/Elementor tarzı) değil.
- **İletişim formu için otomatik e-posta bildirimi** — mesajlar panelde
  görünür, ama şu an ayrıca bir e-posta ile "yeni mesaj geldi"
  bildirimi gönderilmiyor; panel düzenli kontrol edilmeli. (Bu, kolay
  eklenebilecek bir sonraki adım — bkz. "Bakım ve Destek".)
- **CAPTCHA/görsel doğrulama** — spam koruması var (yukarıda) ama
  görsel bulmaca tarzı bir CAPTCHA şu an yok; gerçek bir spam artışı
  görülürse eklenmesi önerilir (net bir eşik `GUVENLIK.md`'de
  tanımlı).
- **Aynı sunucuda birden fazla müşteri sitesi** — her müşteri kendi
  ayrı kurulumunu alır (bkz. "Kurulum Gereksinimleri") — bu bir
  kısıtlama değil, bilinçli bir mimari tercih (müşteriler arası veri
  karışması riski böylece yapısal olarak imkansız).
- **7/24 canlı destek hattı veya anlık müdahale garantisi** — bkz.
  "Bakım ve Destek".

## Teslim Edilenler

1. **Çalışan, test edilmiş kaynak kod** — GitHub deposu üzerinden tam
   erişimle.
2. **Ziyaretçi sitesi** — 11 bölüm, her biri 2-3 görsel varyantla,
   açık/koyu tema, mobil+masaüstü uyumlu.
3. **Yönetim paneli** — 7 ekran: Özet, İçerikler (5 içerik türü: Hizmet/
   Proje/Referans/SSS/Ekip Üyesi), Sayfa Düzeni, Medya, Tema, Mesajlar,
   Ayarlar (SEO).
4. **Otomatik testler** — 26 birim test + 3 uçtan uca senaryo testi
   (ziyaretçi akışı, yönetici akışı, yetkisiz erişim engeli) — her yeni
   değişiklikte tekrar çalıştırılıp ürünün bozulmadığından emin
   olunabilir.
5. **Güvenlik denetimi** — erişim kuralları gerçek testlerle
   doğrulandı, sır/şifre sızıntısı taraması yapıldı, temel güvenlik
   başlıkları aktif, bağımlılıklarda bilinen açık taraması (`npm
   audit`) temiz.
6. **Kurulum betiği ve kılavuzu** — yeni bir müşteri için veritabanı +
   içerik altyapısını tek bir komutla kuran bir betik + adım adım
   yazılı kılavuz (`docs/KURULUM.md`).
7. **Kullanım kılavuzu** — panelin GÜNLÜK kullanımını anlatan, teknik
   bilgi gerektirmeyen bir doküman (`docs/MUSTERİ-KILAVUZU.md`) —
   içerik ekleme, düzenleme, yayınlama, görsel yükleme, tema
   değiştirme, mesajları yönetme dahil, panelin tüm ekranlarını
   kapsar.
8. **Bu teslim paketi dokümanı.**

## Kurulum Gereksinimleri

**Süre:** İlk kurulum, kurulumu yapan kişi için **yaklaşık 28 dakika**
sürer (özel alan adı bağlama hariç — alan adının internette
"yayılması" birkaç saat sürebilir, bu ayrı/bekleyen bir adımdır).

**Müşteriden istenenler (kurulum başlamadan önce):**
- Firma adı ve tercih edilen alan adı (müşteri kendi alan adını
  sahip olmalı — bu paket alan adı satın almayı kapsamaz).
- İletişim bilgileri (adres/telefon/e-posta) — yoksa geçici yer
  tutucularla başlanır, panelden sonra eklenir.
- Panel girişi için kullanılacak bir e-posta adresi.
- (Opsiyonel) Logo, marka rengi tercihi, sosyal medya hesapları.

**Teknik gereksinimler (bizim tarafımızda, müşteriden bir şey
gerekmez):** Her müşteri için ayrı, ücretsiz başlanabilen bir Supabase
(veritabanı) hesabı ve Vercel (barındırma) hesabı. Detaylı, adım adım
teknik kurulum: `docs/KURULUM.md`.

## Bakım ve Destek

**Gerçekçi beklenti (abartısız):**

- **Dahil olan:** Kritik bir hata/çökme durumunda müdahale, güvenlik
  güncellemeleri takibi (`npm audit` periyodik kontrolü), yıllık bir
  bağımlılık/sürüm gözden geçirmesi.
- **Dahil OLMAYAN (ayrı görüşülür):** İçerik girişi/güncellemesi
  (panel müşteriye açık, bu onun kendi yapacağı iş — bkz.
  `MUSTERİ-KILAVUZU.md`), yeni özellik talepleri, e-posta bildirimi/
  CAPTCHA gibi "Kapsam Dışı" listesindeki eklemeler.
- **Yedekleme:** Kullanılan veritabanı hizmeti (Supabase) ücretsiz
  planda 7 günlük otomatik yedek tutar; bu süre yeterli
  görülmüyorsa (ör. sık ve büyük veri değişikliği olan bir müşteri)
  ücretli bir plana geçiş önerilir.
- **Yanıt süresi taahhüdü YOK** (7/24 destek hattı bu paketin içinde
  değil) — pratikte "birkaç iş günü içinde dönüş" makul bir
  varsayımdır, ama bu resmi bir SLA (hizmet seviyesi taahhüdü)
  değildir; müşteriyle ayrı bir bakım anlaşması yapılacaksa orada
  netleştirilmelidir.
- **Anahtar/şifre yenileme:** Bir güvenlik anahtarının sızması
  durumunda (nadir ama olabilir), yenileme birkaç dakika sürer ama
  siteyi geçici olarak etkileyebilir — detay `docs/KURULUM.md`
  "Bakım ve Yedekleme" bölümünde.

## Fiyatlandırma Önerisi

*(Bu bölüm, işletmenin kendi maliyet/kâr hedeflerine göre
ayarlanmalıdır — aşağıdaki rakamlar bir BAŞLANGIÇ ÖNERİSİ, kesin bir
karar değil. Türkiye küçük/orta ölçekli kurumsal web sitesi piyasasına
kabaca uygun, mütevazı bir başlangıç noktası olarak hazırlandı.)*

**Önerilen model: kurulum ücreti + opsiyonel aylık bakım paketi**

| Kalem | Öneri | Not |
|---|---|---|
| **Kurulum (tek seferlik)** | 15.000 – 25.000 TL | Müşteriye özel kurulum + gerçek içeriğin (metin/görsel) panelden girilmesine yardım (müşteri kendisi de girebilir, ücreti düşürür) |
| **Aylık bakım (opsiyonel)** | 500 – 1.000 TL/ay | "Bakım ve Destek" bölümündeki "Dahil olan" kapsam — bu paket YOKSA müşteri kendi başınadır, kritik bir sorunda ayrı ücretlendirilir |
| **Barındırma (hosting)** | 0 TL (başlangıçta) | Supabase + Vercel ücretsiz planları küçük/orta trafikli bir kurumsal site için yeterli; trafik/veri artarsa (ör. çok sayıda görsel, yoğun ziyaretçi) ücretli plana geçiş gerekebilir — bu maliyet müşteriye mi yoksa size mi ait olacağı baştan netleştirilmeli |
| **Ek özellik/kapsam genişletme** | Saatlik/proje bazlı, ayrı teklif | "Kapsam Dışı" listesindeki herhangi bir madde (e-posta bildirimi, CAPTCHA, çoklu dil vb.) |

**Fiyatlandırma gerekçesi:** Bu ürün 7 iş gününde geliştirildi ama her
yeni müşteri kurulumu (kod tekrar yazılmadığı için) çok daha kısa
sürer (~28 dakika teknik kurulum + içerik girişi) — bu, kurulum
ücretini düşük tutup hacimle (birden fazla müşteri) kazanmayı
mantıklı kılar. Aylık bakım paketi, tek seferlik satıştan sürekli
gelire geçişin standart yoludur.

---

## Ürünün Rakiplerden Farkı (3 Madde)

Gerçek bir rakip analizine dayanıyor (8 inşaat/mimarlık firma sitesi
incelendi, bkz. `docs/rakip-analizi.md`):

1. **Kendi kendine yönetilebilir** — Küçük/orta ölçekli firma
   sitelerinin çoğu statiktir; her içerik değişikliği için bir
   ajansa/geliştiriciye ihtiyaç duyulur. Bu üründe müşteri (veya siz)
   panelden içeriği anında değiştirebilir, kod bilgisi gerekmez.
2. **İncelenen rakiplerin çoğunda olmayan güven unsurları standart
   olarak var** — Referanslar bölümü incelenen 8 siteden sadece
   3'ünde, ayrı bir Ekip/Kadro sayfası sadece 2'sinde vardı; bu
   üründe ikisi de her kurulumda hazır geliyor.
3. **Teknik SEO baştan hazır** — Arama motorlarının işletmeyi doğru
   anlaması için gereken yapısal veri (structured data), site
   haritası ve otomatik paylaşım görseli gibi teknik detaylar çoğu
   küçük ajans sitesinde ek ücretli bir hizmet olarak sunulur; bu
   pakette dahildir.
