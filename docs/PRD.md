# PRD — Ürün Gereksinimleri (İstenen / İstenmeyen)

Bu dosya, `durum.md` (anlık durum) ve `karar-gunlugu.md`'den (tarihli karar
geçmişi) farklı bir iş görür: **bir özelliğin yapılıp yapılmayacağına hızlıca
karar vermek için tek referans**. Yeni bir özellik önerisi geldiğinde önce
buraya bakılır. Kod içermez.

**Son güncelleme:** 2026-08-06

## 1. Ürün Tanımı (tek cümle)

İnşaat firmalarına satılan, platform sahibi tarafından tam yönetilen (managed)
bir kurumsal web sitesi hizmeti — "tek müşteri = tek kurulum" iş modelinde.

## 2. Aktörler

- **Platform sahibi** — tek kullanıcı/rol. Satıcı + geliştirici + içerik
  yöneticisi aynı kişi.
- **Tenant / Müşteri** (inşaat firması) — siteyi satın alır, hiçbir panele
  girmez.
- **Ziyaretçi** — iki farklı bağlamda aynı rol: (a) platform sahibinin kendi
  tanıtım sitesine gelen potansiyel müşteri, (b) bir tenant'ın kendi sitesine
  gelen kişi.

## 3. İstenen (Kapsam İçi)

### 3.1 Platform sahibinin tanıtım sitesi

- Herkese açık, gezinilebilir bir ana sayfa.
- Yapılan projelerin/örnek web sitelerinin gösterildiği bir bölüm (portfolyo).
- Hizmetin vaat ettiği özelliklerin anlatıldığı bir bölüm (SEO, responsive,
  sade/abartısız tasarım, güvenlik vb. — bkz. `kurumsal-site-standartlari.md`).
- İletişim bölümünde iki kanal: (1) **WhatsApp butonu**, (2) **iletişim formu**
  (ad-soyad, telefon numarası, serbest metin/istek textarea alanları). Form
  gönderildiğinde platform sahibine **e-posta** olarak iletilir.
- Marka **anonim** kalır: kimlik (isim), ekip büyüklüğü gibi şahsi/kurumsal
  bilgiler paylaşılmaz. Ziyaretçi sadece yapılan işleri/projeleri görür, kim
  yaptığını bilmez.
- Gizli, "kapı" gibi çalışan `/panel` girişi — kullanıcı adı/şifre ister.

### 3.2 Panel (tek kullanıcı: platform sahibi)

- Yeni tenant oluşturma.
- Demo kataloğundan tek tıkla import (one-click demo import).
- Bölüm kütüphanesinden bölüm açma/kapatma/sıralama (sınırlı sürükle-bırak —
  bölümün içi sabit tasarım, serbest eleman yerleştirme değil).
- Herhangi bir tenant'ın içerik ve temasını (açık/koyu) düzenleme.

### 3.3 Tenant siteleri

- Kendi alan adında yayınlanan, herkese açık kurumsal site.
- Hazır bölüm kütüphanesinden seçilmiş bölümler (Hero, Hakkımızda, Hizmetler,
  Projeler, İletişim vb. — bkz. `rakip-analizi.md`; blog/haberler bölümü
  kapsam dışı, bkz. madde 4).
- Açık/koyu tema desteği.
- SEO, responsive, performans, KVKK uyumluluğu (bkz.
  `kurumsal-site-standartlari.md`).

### 3.4 İçerik Modeli (Veri Alanları)

Veritabanı şeması tasarlanırken referans alınacak alan listesi. **TEKİL** =
tenant/platform başına bir kayıt; **LİSTE** = birden çok öğe (her öğenin kendi
`sıra` alanı var). Her bölümde ayrıca ortak iki alan bulunur: `aktif` (panelden
aç/kapat) ve bölüm `sıra`sı (bölümler arası sürükle-bırak sıralama).

**Tenant siteleri:**

| Bölüm | Tip | Alanlar |
|---|---|---|
| Hero | Tekil | başlık, alt başlık, arka plan görseli, CTA metni, CTA linki |
| Hakkımızda | Tekil | başlık, açıklama, görsel (opsiyonel), kuruluş/deneyim yılı (opsiyonel) |
| Hizmetler | Liste | başlık, açıklama, ikon, sıra |
| Projeler | Liste | başlık, görsel, konum, yıl, sıra |
| İletişim | Tekil | adres, telefon, e-posta (statik gösterim) + form (ad-soyad, telefon, mesaj) — form gönderiminde **o tenant'a** e-posta gider (alıcı adresi tenant ayarlarında tutulur, içerik verisi değil) |

Tenant başına ayrıca (bölüm değil, tenant meta verisi): **tema** (açık/koyu
tercih, marka rengi), **domain**, **iletişim formu alıcı e-postası**.

**Platform sahibinin tanıtım sitesi** (ayrı, tek kurulum — tenant değil):

| Bölüm | Tip | Alanlar |
|---|---|---|
| Hero/Ana sayfa | Tekil | başlık, alt başlık, arka plan görseli, CTA metni, CTA linki |
| Portfolyo/Örnekler | Liste | başlık, görsel, sıra, canlı link (opsiyonel) |
| Vaat edilen özellikler | Liste | başlık, açıklama, ikon, sıra |
| İletişim | Tekil | WhatsApp numarası + form (ad-soyad, telefon, mesaj) — form gönderiminde **platform sahibine** e-posta gider |

## 4. İstenmeyen (Kapsam Dışı) — Yapma

- Tanıtım sitesinde fiyatlandırma, abonelik veya ödeme bilgisi ya da herhangi
  bir ücret ifadesi göstermek. Fiyat platform sahibi tarafından talebe göre
  sözlü/özel olarak bildirilir.
- **Blog / Haberler kavramı hiçbir yerde kullanılmaz** — ne tanıtım sitesinde
  (pazarlama dilinde "blog motoru" gibi ifadeler dahil), ne de bölüm
  kütüphanesinde/tenant sitelerinde. Ürün "kurumsal site hizmeti" olarak
  konumlanır, bir blog/CMS platformu değildir. (`rakip-analizi.md`'deki
  bölüm sıklığı tablosunda Blog/Haberler 7/8 site ile yaygın görünüyor olsa da,
  bu üründe bilinçli olarak dışarıda bırakıldı.)
- Tenant'a (müşteriye) herhangi bir panel/login erişimi vermek. Tenant kendi
  sitesine sadece bir ziyaretçi gibi bakar, değişiklik isteğini platform
  sahibine iletir.
- Herhangi bir ziyaretçi/kullanıcıya platform paneline erişim vermek — her
  ziyaretçi birbirinin aynısı, tek bir (herkese açık) arayüz görür.
- Panel'e kullanıcı adı/şifre olmadan erişim (auth'suz erişim asla açık
  bırakılmaz; bir tenant domaininde `panel` middleware seviyesinde tamamen
  erişilemez olur).
- Gerçek Elementor tarzı tam serbest sürükle-bırak / page builder (sadece
  hazır bölümlerin sıralanması/aç-kapatılması var, serbest eleman/sütun
  yerleştirme yok).
- Çoklu dil desteği (v1 kapsamında yok, ileride ayrı bir faz olarak ele
  alınabilir).
- Çoklu yetki seviyesi / rol sistemi (editör, görüntüleyici vb.) — platformda
  tek rol var.
- Her tenant için ayrı deploy / ayrı Supabase projesi — tek kod tabanı + tek
  Supabase projesi, çok kiracı (multi-tenant) mimari kullanılıyor.
- Tanıtım sitesinde platform sahibinin kimliği, ekip büyüklüğü gibi şahsi/
  kurumsal bilgileri paylaşmak — marka anonim kalır, sadece iletişim (e-posta/
  telefon) ve yapılan işler görünür.

## 5. Açık Sorular / Netleştirilmesi Gereken

Şu an aktif açık soru yok.

**Çözüldü (2026-08-06):** "Blog motoru gibi ifadeler bulunmayacak" — blog/
haberler kavramı ürünün hiçbir yerinde (tanıtım sitesi, bölüm kütüphanesi,
tenant siteleri) kullanılmayacak şekilde netleşti.

**Çözüldü (2026-08-06, revize edildi):** Tanıtım sitesindeki iletişim WhatsApp
butonu + iletişim formu (ad-soyad, telefon, mesaj → platform sahibine e-posta)
üzerinden sağlanır. Marka anonim kalır (platform sahibinin kimliği, ekip
büyüklüğü gibi bilgiler paylaşılmaz, sadece yapılan işler görünür).

## 6. Bu Dosyanın Kullanımı

Yeni bir özellik önerisi/isteği geldiğinde önce madde 4'teki (İstenmeyen)
listeye bakılır. Listede açıkça yasaklanmış bir şeyse, uygulanmadan önce
kullanıcıya sorulur — varsayım yapılmaz. Kapsam değişirse önce
`karar-gunlugu.md`'ye tarihli bir kayıt eklenir, sonra bu dosya güncellenir.
