# Rakip Analizi — İnşaat/Mimarlık Firma Siteleri (8 Örnek)

**Tarih:** 2026-08-05
**Yöntem:** Aşağıdaki 8 gerçek firma sitesi doğrudan ziyaret edilip (WebFetch ile)
ana sayfa ve üst menüde görünen bölümler tek tek not edildi. Gözlemler yalnızca
ana sayfa + üst menüye dayanır; site içinde daha derinde olup bu incelemede
görünmeyen bölümler olabilir — "—" işareti "yok" değil, "bu incelemede
gözlenmedi" anlamına gelir.

## İncelenen Siteler

| Kısaltma | Firma | Tür | URL |
|---|---|---|---|
| L | Limak Holding | İnşaat/Holding | limak.com.tr/homepage |
| Rİ | Rönesans İnşa | İnşaat | ronesansinsa.com.tr |
| N | Nurol İnşaat | İnşaat | nurolinsaat.com.tr/en |
| Fab | Fabrika Mimarlık | Mimarlık | fabrikamimarlik.com.tr |
| O | OSO Mimarlık | Mimarlık | osomimarlik.com/en |
| TP | Two Plus Architects | Mimarlık | twoplus.com.tr |
| Fe | FEINE Mimarlık | Mimarlık | feine.com.tr/en |
| Tab | Tabanlıoğlu Architects | Mimarlık | tabanlioglu.com |

## Karşılaştırma Tablosu

| Bölüm | L | Rİ | N | Fab | O | TP | Fe | Tab | Sıklık |
|---|---|---|---|---|---|---|---|---|---|
| Hero / Ana Banner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | 7/8 |
| Hakkımızda | ✓¹ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 8/8 |
| Projeler / Portföy | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 7/8 |
| Blog / Haberler | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | 7/8 |
| İletişim | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 8/8 |
| Hizmetler (açıkça adlandırılmış) | —² | — | — | ✓ | ✓ | ✓ | ✓ | — | 4/8 |
| Kariyer | ✓ | ✓ | ✓ | — | — | —³ | — | ✓ | 4/8 |
| Referanslar / Ödüller | — | — | — | — | —⁴ | ✓ | ✓ | ✓ | 3/8 |
| Ekip / Kadro (ayrı sayfa) | — | — | — | ✓ | — | — | — | ✓ | 2/8 |
| Sürdürülebilirlik | ✓ | — | ✓ | — | — | — | — | — | 2/8 |

**Notlar:**
1. Limak'ta ayrı bir "Hakkımızda" başlığı yok; "Kurumsal Liderlik" bölümü (yönetim
   kurulu, kurucu ortaklar, grup yapısı) bu işlevi görüyor.
2. Limak'ta "Hizmetler" yerine "Sektörler" (İnşaat, Enerji, Turizm, Çimento vb.)
   adında işlevsel olarak benzer ama farklı adlandırılmış bir bölüm var — tabloda
   ayrı sayıldığı için "—" işaretlendi.
3. Two Plus'ta kariyer sayfası yok, sadece genel bir e-posta adresi var.
4. OSO'da ödüller ayrı bir bölüm değil, "Latest News" (haberler) içinde geçiyor.

## Her Kurumsal Sitede Olması Gereken 6 Bölüm

Sıklık sırasına göre:

1. **İletişim** — 8/8 sitede var (L, Rİ, N, Fab, O, TP, Fe, Tab)
2. **Hakkımızda** — 8/8 sitede var (L, Rİ, N, Fab, O, TP, Fe, Tab)
3. **Hero / Ana Banner** — 7/8 sitede var (L, Rİ, N, Fab, O, TP, Fe)
4. **Projeler / Portföy** — 7/8 sitede var (Rİ, N, Fab, O, TP, Fe, Tab)
5. **Blog / Haberler** — 7/8 sitede var (L, Rİ, N, Fab, O, Fe, Tab)
6. **Hizmetler** — 4/8 sitede açıkça adlandırılmış (Fab, O, TP, Fe); "Kariyer" de
   4/8 ile aynı sıklıkta ama bir satış ürünü için "ne iş yaptığını anlatan"
   Hizmetler bölümü, işe alım amaçlı Kariyer'den daha temel — bu yüzden 6.
   sırayı Hizmetler'e verdim, Kariyer'i yedek/opsiyonel bölüm olarak not ediyorum.

**Gözlem:** Mimarlık firmalarında "Projeler/Portföy" neredeyse zorunlu (5/5),
büyük inşaat holdinglerinde ise "Sürdürülebilirlik" ve "Yatırımcı İlişkileri" gibi
kurumsal-holding'e özgü bölümler öne çıkıyor (L, N) — bunlar küçük/orta ölçekli
tek kurulumluk ürün için muhtemelen gereksiz kapsam.

---

# Görsel Tasarım Analizi — 93 Site *(2026-08-20 eklendi)*

**Tarih:** 2026-08-20
**Kapsam:** Yukarıdaki 2026-08-05 analizi "hangi BÖLÜMLER var" sorusunu
cevaplıyordu. Bu bölüm farklı bir soruyu cevaplıyor: **bu bölümler NASIL
GÖRÜNÜYOR.** Kullanıcının "ana sayfa çok basit ve sade kalmış" geri bildirimi
üzerine yapıldı.

**Yöntem:** Yedi ayrı kategoride, paralel olarak, siteler WebFetch ile
doğrudan açılıp HTML/metin yapısı, sınıf adları ve bölüm sırası incelendi.
Erişilemeyen siteler kayda "erişilemedi" olarak geçti ve uydurulmadı.
**93 siteye gerçekten erişildi.**

| Kategori | Site sayısı | Örnekler |
|---|---|---|
| Türkiye — büyük taahhüt | 9 | ENKA, Limak, Rönesans, Nurol, Yapı Merkezi, GAMA, Makyol, Doğuş, Kolin |
| Türkiye — konut/yerel müteahhit | 11 | Sinpaş, NEF, Teknik Yapı, Sur Yapı, Dumankaya + Konya/Ankara/Kayseri'den 6 yerel firma |
| Mimarlık ofisleri | 13 | Tabanlıoğlu, EAA, Autoban, GAD, BIG, ZHA, Snøhetta, MVRDV, Heatherwick |
| Uluslararası orta ölçekli müteahhit | 13 | Turner, Suffolk, McCarthy, Brasfield & Gorrie, JE Dunn, Mortenson, Toll Brothers |
| Ödüllü/öne çıkan | 16 | John Pawson, Walker Warner, Mesura, Morris Adjmi, Atelier Oslo, Reed Hilderbrand |
| Derinlemesine: hero | 14 | Turner, Skanska, Bechtel, SOM, Gensler, HOCHTIEF, Nef, Sinpaş |
| Derinlemesine: galeri + sayılar | 17 | Skender, Barrett Made, ARCO/Murray, Leopardo, Housebrand, F.H. Paschen |

## En Önemli Bulgu

**Gerçek inşaat siteleri bizimkinden daha SADE — daha süslü değil.**

Bu, araştırmanın başlangıç varsayımını tersine çevirdi. "Sitemiz basit
kalmış" şikayetinin cevabı "daha çok görsel öğe eklemek" değil. Kanıt:

- Ödüllü 16 sitenin **hiçbirinin** HTML'inde açıkta bir hex renk değeri
  yok; sayfanın tüm rengini fotoğraflar taşıyor.
- Hero'da CTA sayısı **0 veya 1**. Derinlemesine incelenen 13 sitenin
  hiçbirinde yan yana iki eşit ağırlıklı dolu buton yok.
- Mimarlık ofislerinin **hiçbirinde** "bir bölüm beyaz, sonraki gri"
  dönüşümlü zemin yok.
- Renkli tam genişlik bant, incelenen sitelerin **çoğunda hiç yok**.
- Sayı bloklarında **ikon yok** — Rönesans'ta açıkça "ikon yerine
  tipografi".
- Hero ile sonraki bölüm arasında **dekoratif geçiş şekli (dalga, eğik
  kesim, kavis) hiçbirinde yok**; geçiş düz kesim.

Yani sorun sadelik değil, **yanlış yerde sadelik ve yanlış yerde süs**:
onların hiç kullanmadığı şablon işaretlerini kullanıyoruz, hepsinin
kullandığı kanıt araçlarını kullanmıyoruz.

## Sektörün Ortak Kalıpları

### Hero
- Başlık 3-6 kelimelik **tek konumlandırma cümlesi**, hizmet listesi değil:
  "Engineering for a Better Future" (ENKA), "We Live for a Challenge"
  (Bechtel), "Builder. Innovator. Partner." (Mortenson), "Design for a
  changing world" (MVRDV).
- Uluslararası müteahhitlerde kalıp daha da dar: **iki kısa, noktalı,
  paralel yapılı cümle** — "Pride of Ownership. Peace of Mind." (Swinerton),
  "Built on commitment. Proven by performance." (Brasfield).
- Tek CTA varsa etiketi "İletişim" değil bir **keşif fiili**: "Explore",
  "Keşfet", "Experience more", "Learn More". İlk ekranda kimse satış
  yapmıyor, kaydırmaya davet ediyor.
- Buton yerine **çoklu yol sunma** yaygın: Turner üç niyet (Bir Proje / Bir
  Kariyer / Daha İyi Bir Gelecek), ENKA beş iş kolu.
- Fotoğrafa **proje künyesi bindiriliyor** (ENKA: "Tengiz Petrol Sahası,
  Kazakistan"; Mortenson: proje + şehir/eyalet). Fotoğraf dekor değil kanıt.
- Türkiye'de konut/yerel firmalarda hero neredeyse her zaman **2-6 slaytlık
  proje slider'ı** ve öznesi şirket sloganı değil **proje adı**.
- "Aşağı kaydır" işareti sitelerin yaklaşık yarısında var.

### Sayılar / güven
- Hero'nun **hemen altında** veya çok yakınında. Araştırmanın ifadesiyle:
  *"sektörde 'hero çok boş' hissini kıran en yaygın hamle bu."*
- Uluslararası müteahhitlerde **3-5 hücre**; üçten az, beşten çok olan yok.
- Rakamların hepsi **ölçek** bildiriyor, kalite iddia etmiyor: kuruluş yılı,
  ofis sayısı, çalışan sayısı, yıllık ciro, aktif proje sayısı. "Müşteri
  memnuniyeti %98" tipi uydurulabilir metrikler bu grupta **hiç yok**.
- Etiketler cümle değil, **iki-üç kelimelik isim tamlaması**.
- **İş güvenliği istatistiği (EMR/TRIR) ana sayfada gösterilmiyor** —
  beklentinin tersi. Güvenlik bir sayı değil, bir değer/kültür bölümü.
- Küçük ve orta ölçekli firmalar sayıyı ayrı bölüme koymuyor, **cümleye
  gömüyor**: "135+ years" (Skanska hero alt satırı), "50 years" (Harper).

### Proje galerisi
- **Proje detayı hiçbir sitede modal değil.** İncelenen tüm galerilerde kart
  gerçek bir detay sayfasına (`/projects/proje-adi`) bağlanıyor. Modal, bu
  kategoride hiç karşılaşılmayan bir kalıp.
- Ana sayfadaki galeri **tam liste değil, 4-6 seçilmiş proje**; tam katalog
  filtreli bir iç sayfada.
- Kart künyesi **en az iki, çoğu zaman üç bilgi**: kategori/sektör + başlık
  + konum (+ yıl). Açıklama paragrafı taşımıyor.
- **DURUM ekseni sektörün en evrensel bilgisi**: Devam Eden / Tamamlanan /
  Planlanan. Snøhetta'da ayrı bir filtre ekseni, Barrett Made'de kart
  etiketi, Türk konut firmalarının hepsinde ayrım kriteri.
- Filtre tek eksenli değil: Snøhetta dört eksen, Turner beş eksen.
- Büyük portfolyolarda kademeli yükleme kural ("LOAD MORE", sayfalama).
- Mozaik kullananlar büyük karoyu **öne çıkarılacak projeye** veriyor —
  sabit bir matematiksel ritme değil, editoryal bir karara bağlı.

### Tipografi ve bölüm ritmi
- Bölüm başlıkları **büyük harf, geniş harf aralığı ve KISA** — ve kritik
  olan şu: *"en büyük punto başlıkta değil, içeriktedir."* Hiyerarşi punto
  farkından çok harf biçiminden geliyor.
- Bölüm ayrımı zemin rengi değiştirilerek **değil**; ya geniş boşlukla, ya
  ince yatay ayraç çizgisiyle (Rönesans), ya da **içerik türü** değiştirilerek
  yapılıyor (ızgara → ham sayılar → ekip fotoğrafı → adresler).
- Üst menü **3-5 öğeye** indirilmiş; derinlik açılır menüye atılmış.
- Alt bilgi bir link listesi değil, sayfanın **son bölümü** gibi davranıyor ve
  büyük puntolu bir davet cümlesi taşıyor: "It would be a privilege to hear
  from you" (House of Honey), "Join the MA Community" (Morris Adjmi).

### Renk
- Açık zemin + koyu metin + **tek** marka vurgusu. İkinci bir dekoratif renk
  kullanan site yok.
- Marka rengi yalnızca **etkileşimli** öğelerde: buton dolgusu, bağlantı,
  ikon, küçük rozet, aktif filtre.
- Renk yükü tamamen **proje fotoğraflarına** bırakılmış.

## Bizim Siteye Doğrudan Değen Karşılaştırma

| Bizde var, 93 sitenin ~hiçbirinde yok | Hepsinde/çoğunda var, bizde yok |
|---|---|
| Hero altında dekoratif SVG dalga | Hero'nun hemen altında sayılar bloğu |
| Hero'da iki eşit ağırlıklı dolu buton | Küçük, büyük harfli, nötr bölüm etiketi |
| İki özdeş marka rengi bandı (Stats + CTA) | Proje durumu ekseni (Devam Eden/Tamamlandı) |
| Ortalanmış hero + ortalanmış Stats + ortalanmış CTA | Kenara yaslı kompozisyon, sert ölçek karşıtlığı |
| Dönüşümlü zemin (üstelik tutarsız) | Kapanışta tek büyük davet cümlesi |
| Proje detayı modal | Proje detayı gerçek sayfa (SEO'da her proje indekslenir) |

**Not:** `ProjectCard` künyemiz (kategori rozeti + başlık + şehir·yıl) zaten
sektör standardına uygun — orada bir eksik yok. `description` alanı ise
veritabanında, tipte ve sorguda var ama kartta hiç basılmıyor.

## Ürün Açısından İki Yan Bulgu

1. **Referanslar bölümü bu sektörde sıra dışı derecede nadir.** Onun yerine
   basın logosu duvarı ("AS SEEN IN"), ödül rozeti veya kurucu alıntısı
   kullanılıyor — güven üçüncü taraf rozetiyle kuruluyor. Bizim iki
   varyantlı Referanslar bölümümüz sektör kalıbının dışında; kaldırmak
   gerekmez ama tek güven aracı olmamalı.
2. **İncelenen 11 Türk yerel/orta ölçekli firmanın hiçbirinde koyu tema
   yok**; hepsi tek (açık) temaya sabitlenmiş. Açık/koyu tema desteğimiz
   gerçek bir farklılaştırıcı — `TESLIM-PAKETI.md`'de öne çıkarılmalı.
3. Yerel firmaların siteleri bakımsızlık izi biriktiriyor: temizlenmemiş
   `dummy.png` yer tutucuları, sabit yazılmış eski telif yılı (2023),
   anahtar kelime yığılmış `<title>`, hatta 500/503 dönen ana sayfa. Bunlar
   bizim ürünümüzün "tam yönetilen" vaadinin somut satış argümanları.

## Bu Analizden Çıkan Uygulama Kararları

Tam plan ve sıralama `DURUM.md`'de. Özet: kompozisyon (ölçek karşıtlığı +
kenar disiplini) ve kanıt katmanı (veritabanında olup ekrana ulaşmayan
içerik) birlikte yapılacak; "her bölüme yeni varyant" yönü ertelendi —
varyantlar hiçbir tek siteyi güzelleştirmez, yalnızca siteleri birbirinden
farklı kılar, dolayısıyla bu şikayetin doğru aracı değil.
