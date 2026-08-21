# Şu An Neredeyiz

Bu klasör (`docs/`), projede alınan kararları ve açıklamalarını tutar — kod içermez.
Yeni bir oturuma başlarken önce bu dosyayı (güncel durum), sonra `PRD.md`'yi
(özellik bazlı yapılacak/yapılmayacak referansı), `MIMARI.md`'yi (teknik
mimari: framework/dil/stil/backend/hosting/render), `TEST-STRATEJISI.md`'yi
(test yaklaşımı, kalite eşikleri, "bitti" tanımı) ve `VERİ-MODELİ.md`'yi
(Supabase tablo/kolon tasarımı + gerekçeler), `GUVENLIK.md`'yi (tehdit
modeli, RLS politikaları, anahtar yönetimi, güvenlik kontrol listesi) ve
`TASARIM-SISTEMI.md`'yi (renk/tipografi/boşluk/köşe/gölge token'ları,
kontrast doğrulaması, bileşen envanteri/API kuralları) ve `TEMA-MIMARISI.md`'yi
(tema değerlerinin DB'den `<html>`'e akışı, tema ön ayarları, FOUC
önlemi), gerekirse `KARAR-GUNLUGU.md`'yi (tarihli, hiç silinmeyen karar
geçmişi) oku. Yeni bir müşteri kurulumu yapılacaksa `KURULUM.md`'ye
(sıfırdan kurulum, geliştirici için), panelin günlük kullanımı için
`MUSTERİ-KILAVUZU.md`'ye (teknik olmayan okuyucu için) bakılır.

**Son güncelleme:** 2026-08-21 (on ikinci oturum) — **İkinci kapsamlı
denetim koşuldu ve çıkan 10 iş paketinin tamamı bitirildi.**

**Denetim:** 8 boyutta paralel tarama (regresyon, mobil, koyu tema,
performans, ürün boşluğu, teslim hazırlığı, veri bütünlüğü, açık madde
doğrulama) + her bulgu, varsayılanı "bu bulgu yanlış" olan şüpheci bir
ajandan geçti. **77 bulgu üretildi, 62'si sağ çıktı, 15'i çürütüldü.**
Workflow `.claude/workflows/kapsamli-proje-denetimi-2.js` olarak kayıtlı
(bir önceki oturumda başlatılmış ama terminal kapandığı için sıfır sonuç
üretmişti; bu oturumda baştan koşuldu).

**Denetimin iki önemli özelliği:** (a) mobil ve koyu tema bugüne kadar
HİÇ denetlenmemişti — mobil bulguları tahminle değil, projenin kendi
derlenmiş CSS'i ve gerçek Geist fontuyla Chromium'da 320-1280px arası
ölçülerek üretildi; (b) denetimin bir önerisi YANLIŞ çıktı ve kontrol
edilerek yakalandı (aşağıda, madde 7).

**Bitirilen 10 iş paketi:**

1. **Kurulum artık gerçekten çalışıyor.** `supabase db push` boş bir
   Supabase projesinde foreign key hatasıyla düşüyordu: üç migration'daki
   dört demo-veri insert'i sabit tenant UUID'lerine FK'liydi ve o
   satırları yaratan tek yer `seed.sql`, `db push` ise onu çalıştırmıyor.
   Bugüne kadar görünmemesinin sebebi, 2026-08-19'daki "sıfırdan
   kurulum"un yeni bir MAKİNE kurulumu olması — yeni bir veritabanı değil.
   Bloklar `where exists (select 1 from public.tenants ...)` ile tenant
   varlığına bağlandı; yeni kurulumda sessizce atlanıyorlar (demo veri
   zaten yeni müşteride istenmiyor).
2. **`next.config.ts` görsel host'u env'den türetiliyor.** Eski
   müşterinin Supabase ref'i sabit yazılıydı; yeni müşteride panelden ilk
   logo yüklendiği an `next/image` "hostname is not configured" fırlatıyordu
   ve logo Navbar'da olduğu için etki TÜM sayfalardı. Aynı env varsayımı
   2026-08-19'da CSP satırında düzeltilmiş, bu satır o düzeltmenin dışında
   kalmıştı — projenin tekrar eden kalıbı.
3. **Kurulum belgesi ve şablon paketi (9 düzeltme).** `KURULUM.md`'de
   `page_sections` sayısı 10 → 8, Adım 8.2'ye `RESEND_API_KEY` +
   `CONTACT_NOTIFICATION_FROM_EMAIL`, doğrulama listesine e-posta ve görsel
   yükleme kontrolleri, "görsel yükleme desteklenmiyor" satırı tersine
   çevrildi (`GUVENLIK.md` madde 11'deki aynı eskimiş bilgiyle birlikte).
   `setup-new-customer.sh` firma adındaki kesme işareti ve ampersandı
   kaçırıyor — öncesinde "Kaya & Ortakları" adı veritabanına
   "Kaya __TENANT_NAME__ Ortakları" olarak SESSİZCE yazılıyordu; kaçırma
   gerçek girdilerle test edildi. `types:generate` sabit proje ref'inden
   kurtarıldı: yeni `scripts/generate-types.mjs` ref'i
   `NEXT_PUBLIC_SUPABASE_URL`'den türetiyor ve çıktıyı yalnızca komut
   BAŞARILIYSA yazıyor (eski `>` yönlendirmesi, CLI hata verdiğinde geriye
   boş bir tip dosyası bırakıyordu).
4. **Sessiz veri kaybının beş yolu kapatıldı.**
   `contact_sections.is_published` hiçbir kod yolundan yazılmıyordu ama
   ziyaretçi sorgusu ona bakıyordu — panelden oluşturulan bir iletişim
   kaydı Footer'da ve /iletisim'de HİÇ görünmüyor, panelden de
   düzeltilemiyordu. Logo/favicon/OG yüklemeleri hâlâ `.update()`
   kullanıyordu (2026-08-20'deki upsert düzeltmesi bu üçüne taşınmamıştı;
   üstelik onları koruduğu sanılan `if (!current)` bekçisi, sorgu nested
   embed yaptığı için hiç işlemiyordu). Hero varyant seçimi ölüydü
   (`page_sections.variant` her zaman kazanıyor) — seçim kaldırıldı, tek
   doğruluk kaynağı Sayfa Düzeni oldu. `tenants.theme_mode` panelden
   yazılamıyordu — Tema ekranına "Sitenin Varsayılan Teması" kontrolü
   eklendi ve önizleme sabit "light" yerine gerçek değeri kullanıyor.
   Hakkımızda değerlerindeki ayraç normalizasyonu yazılan metni
   değiştiriyordu ("2010 - 2024" → "2010 — 2024"); artık yalnızca İLK
   ayraçta bölünüyor.
5. **Mobil paketi (9 düzeltme).** En ağırı: `PanelShell`'in içerik
   sütununda `min-w-0` olmadığı için üç tablonun `overflow-x-auto`
   sarmalayıcısı HİÇ devreye girmiyordu — 320px'de sütun 628.7px'e çıkıp
   sayfayı 309px yatay kaydırıyordu. Ayrıca sabit başlık ölçekleri
   kademelendi (SectionHeader/CtaSection/HeroVariantB), İstatistikler'in
   sütun tabanı 12rem'e çıktı (gerçek "1.200+" değeri komşu sütunla
   çakışıyordu), mozaik satır yüksekliği dar ekranda büyütüldü (fotoğraf
   55px'lik bir şeride iniyordu), proje modalı `vh` yerine `svh`,
   Navbar'da uzun firma adı için `truncate`, proje filtre şeridi mobilde
   kaydırmalı hâle geldi.
6. **Zod ziyaretçinin tarayıcısından çıkarıldı.** Ana sayfa JS'inin
   %35,5'i (283.405 bayt ham / 63.885 gzip) saf zoddu ve tarayıcıda tek
   bir şema çalışmıyordu — doğrulama modülleri zod şemasıyla düz etiket
   sabitlerini aynı dosyada tutuyor, istemci bileşenleri yalnızca
   sabitleri alıyor ama zod da beraberinde geliyordu. 11 modül `<ad>.ts`
   (şema) ve `<ad>Fields.ts` (zod'suz sabitler) olarak ayrıldı.
   **Doğrulandı:** `.next/static` altındaki HİÇBİR istemci parçasında
   artık zod yok.
7. **Koyu tema kontrastı.** Kök sorun tek token'ın iki iş yapmasıydı:
   `--color-neutral-300` hem ince bölüm ayraçlarını (bilinçli olarak
   sessiz) hem form/buton kenarlarını (WCAG 1.4.11: 3:1 şart) çiziyordu.
   Rol ikiye ayrıldı; yeni `--color-control` (açık `#828d9e`, koyu
   `#6b7688`) iki temada da her iki yüzeye karşı 3:1'i geçiyor. Sayfa
   Düzeni şemalarındaki `neutral-200/400` ise TANIMSIZ tonlardı ve
   Tailwind'in sabit gri skalasına düşüp temadan bağımsız kalıyordu;
   giriş sayfasının token override listesinde `--color-brand` eksikti
   (buton "modern-koyu" ön ayarında 1.90:1 ile okunmuyordu).
   **Denetimin yanlış önerisi burada çıktı:** odak halkası offseti için
   "`:root`'a `--tw-ring-offset-color` yaz" deniyordu; build çıktısındaki
   `@property` tanımı `inherits: false` olduğu için bu hiçbir öğeye
   ulaşmazdı. Doğru çözüm `ring-offset-surface` yardımcı sınıfı.
8. **Regresyon cilası.** Panelin hero varyant açıklaması ve şeması hâlâ
   "ortalanmış başlık" diyordu (site 2026-08-21'de sol-alta alınmıştı);
   İstatistikler'in tam genişlik `border-y`si ile Container içindeki
   ayraç çizgisi arka arkaya iki farklı genişlikte çizgi üretiyordu;
   ayraç çizgisi bölümün KONUMUNU bilmiyordu (ilk sıraya gelince navbar
   altında sahipsiz bir çizgi kalıyordu) — `data-section-rule` + tek CSS
   kuralıyla çözüldü, 10 bileşene prop threadlemeye gerek kalmadı.
   HeroVariantB bu tasarım turunun hiçbir iyileştirmesini almamıştı.
9. **Proje durum ekseni.** `projects.status`
   (`devam`/`tamamlandi`/`planlanan`, nullable + check) — rakip
   analizinin "sektörün en evrensel bilgisi" dediği ama hiç iş maddesine
   dönüşmemiş eksen. Kart rozeti, filtre şeridi, panel alanı ve detay
   künyesi birlikte eklendi.
10. **Proje detay sayfası + katalog.** `projects.slug` (not null, tenant
    başına unique; mevcut kayıtlar migration'da geri dolduruldu) ve
    `/projeler/<slug>` statik detay sayfası. Modal SİLİNDİ, kartlar gerçek
    `<Link>` oldu. Ana sayfa artık ilk 6 projeyi gösteriyor + "Tüm
    projeleri gör" bağlantısı; filtreler `/projeler` katalog sayfasında —
    yan kazanç olarak ana sayfa bu bölüm için hiç istemci JS'i indirmiyor.
    `sitemap.xml` 3 URL'den 4 + proje sayısı kadar URL'ye çıktı. Ayrıca
    panele **kurulum kontrol listesi** eklendi: Özet ekranı artık şablondan
    gelen yer tutucuların hangilerinin HÂLÂ yayında olduğunu söylüyor
    (kurallar `lib/panel/setupChecklist.ts`'te saf fonksiyon, testli).

**Slug üretimi iki yerde, aynı kuralla:** `lib/slug.ts` (panel) ve
migration'daki SQL (geri doldurma). İkisinde de Türkçe büyük harfler
DOĞRUDAN küçük ASCII'ye eşleniyor, `lower()`/`toLowerCase()`'e
bırakılmıyor — Türkçe yerelde `lower('I')` = `'ı'` olduğu için sonuç
aksi hâlde yerele bağlı olurdu.

**Ayrıca:** `priority` prop'u Next.js 16.0.0'da kullanımdan kaldırılmış
(belge sürüm tablosundan doğrulandı) — hero ve proje detay görseli
`preload`'a, kart ızgaraları ise `loading="eager"`e çevrildi. İkinci
ayrım denetim bulgusuydu: kartlar `<head>`'e preload bağlantısı koyup
sayfanın gerçek LCP öğesiyle yarışıyordu.

**Kural değişikliği:** Kullanıcı isteğiyle commit granülerliği değişti —
iş commit'leri artık alt-değişiklik başına değil **iş paketi başına** tek
commit. `AI-KURALLARI.md` madde 8.2 güncellendi, gerekçe
`KARAR-GUNLUGU.md`'de (2026-08-21).

**Yeni testler:** `lib/theme/globalsTokens.test.ts` (token kontrast
değişmezleri — ayracın 3:1'in ALTINDA kalmasını da şart koşuyor, biri
"kontrastı düzeltiyorum" diye sessiz ayraç tasarımını bozmasın),
`lib/panel/setupChecklist.test.ts`, `lib/slug.test.ts`. Birim test 95 →
**120**, test dosyası 10 → 13.

**Doğrulama:** Her iş paketinden sonra `npm run lint`, `npx tsc --noEmit`,
`npm run build` ve `npm test` kullanıcı tarafından çalıştırıldı, hepsi
temiz geçti. İki migration (`20260821120000_add_project_status`,
`20260821130000_add_project_slug`) Supabase'e uygulandı ve
`npm run types:generate` ile tipler yenilendi.

**BİR SONRAKİ OTURUM İÇİN:** Denetimden çıkan iş listesi bitti. Açık
duranlar aşağıdaki "Sıradaki adım" madde 11-21'de — özellikle **madde 11**
(panel giriş hız sınırının Supabase Auth üzerinden atlatılabilmesi +
`requireAdminUser`'ın admin doğrulamaması), **madde 13** (KVKK paketi),
**madde 14** (İstatistikler/Eylem Çağrısı panelden düzenlenemiyor, Medya
Kütüphanesi 6 bucket'tan 1'ini listeliyor), **madde 15** (mimari borç:
~2.600 satır kopya kod) ve **madde 20** (Vercel'de `RESEND_API_KEY` ve
`ACTIVE_TENANT_DOMAIN` hâlâ tanımlı değil — kullanıcı eylemi).

**Önceki güncelleme:** 2026-08-20/21 (on birinci oturum, ikinci yarı) — **Ziyaretçi
sitesi tasarımı, 93 gerçek site incelenerek yeniden kuruldu.** Kullanıcı "ana
sayfa çok basit ve sade kalmış" dedi ve gerçek inşaat sitelerinin gezilmesini
istedi. **8 commit atıldı ve `origin/main`'e push'landı.**

**Araştırma:** 7 ayrı kategoride paralel tarama — Türkiye'den büyük taahhüt
firmaları (9), konut geliştiricileri ve yerel müteahhitler (11), mimarlık
ofisleri (13), uluslararası orta ölçekli müteahhitler (13), ödüllü siteler
(16), artı hero ve galeri için ayrı derinlemesine taramalar. **93 siteye
gerçekten erişildi.** Tam bulgu listesi `RAKIP-ANALIZI.md`'ye "Görsel Tasarım
Analizi" başlığıyla eklendi (o dosya önceden yalnızca "hangi bölümler var"
tablosuydu).

**ARAŞTIRMANIN TERSİNE ÇEVİRDİĞİ VARSAYIM — bu oturumun en önemli çıktısı:**
Gerçek inşaat siteleri bizimkinden **daha sade**, daha süslü değil. Ödüllü 16
sitenin hiçbirinin HTML'inde açık bir vurgu rengi yok; hero'da CTA sayısı 0
veya 1; mimarlık ofislerinin hiçbirinde dönüşümlü zemin yok; sayı bloklarında
ikon yok. Yani "basit kalmış" şikayetinin cevabı görsel öğe eklemek DEĞİLDİ.
Gerçek teşhis: **onların hiç kullanmadığı şablon işaretlerini kullanıyorduk
(dekoratif dalga, iki eşit hero butonu, iki özdeş marka bandı, ortalanmış
kompozisyon), hepsinin kullandığı kanıt araçlarını kullanmıyorduk.**

**Uygulanan 8 değişiklik (hepsi migration'sız ve `use client`'sız):**
1. **Hero yeniden kompoze edildi** — metin ortadan sol-alta (`Container`
   içinde, yani sol kenarı diğer TÜM bölümlerle hizalı), `min-h-[80vh]` →
   `85svh`, düz `bg-black/40` → alta doğru koyulaşan degrade, ikinci CTA
   butondan alt çizgili metin bağlantısına indirildi, **dekoratif SVG dalga
   silindi.** Dalga aynı zamanda gizli bir hataydı: `text-surface-raised` ile
   boyanıp "sonraki bölüm mutlaka surface-raised" varsayıyordu, oysa bölüm
   sırası panelden değiştirilebiliyor.
2. **Zemin sistemi tek yüzeye indi** — 7 bölümde `bg-surface-raised` →
   `bg-surface`. Bunun görünürden önemli sonucu: `Card` da `bg-surface-raised`
   kullanıyordu, yani **kartlar bölüm zeminiyle birebir aynı renkti ve nesne
   olarak okunmuyordu.** Dönüşümlü zemin ayrıca zaten tutarsızdı (Projeler ve
   Referanslar arka arkaya aynı zeminde) ve sıra değişince tamamen bozuluyordu.
   Yerine `SectionHeader`'a `rule` prop'u ile ince ayraç çizgisi geldi —
   **sıradan bağımsız.**
3. **`SectionHeader` tipografisi** — eyebrow `text-brand` → `text-text-muted` +
   geniş harf aralığı; başlık `font-bold` → `font-semibold` + `tracking-tight`.
4. **İstatistikler marka bandından çıktı** — `bg-brand` tam genişlik bant →
   nötr zemin + üst/alt ince çizgi, rakamlar 49→61px, `<p>` çiftleri gerçek
   `<dl>/<dt>/<dd>` oldu. Sayfada artık TEK marka bandı var (Eylem Çağrısı).
5. **Fotoğraf oranları 3:2'ye eşitlendi** (5 kap). Kullanıcı "resimler aşırı
   büyütülmüş" dedi; sebep `object-cover`'ın kabı doldurmak için görseli
   büyütüp kırpmasıydı — yüklenen fotoğraflar 3:2 (1264×848), kaplar 4:3 ve
   16:9'du. Karar `TASARIM-SISTEMI.md` madde 5.1'e yazıldı.
6. **Hakkımızda yeniden yapılandırıldı** — değerler listesi iki sütunlu
   ızgaranın DIŞINA, tam genişliğe alındı (içerideyken sol sütun ~675px,
   görsel ~350px oluyordu: "yamuk duruyor" geri bildirimi), `items-center` →
   `items-start`, `line-clamp-6` ve `line-clamp-1` kaldırıldı, değerler
   "başlık kalın / açıklama soluk / her maddeye üst çizgi" biçimine geçti.
7. **Ekip kartı unvanı** — `text-brand` 13px metinde koyu temada 3.56:1
   veriyordu (AA eşiği 4.5:1). Marka rengi artık yalnızca etkileşimli
   öğelerde ve WCAG "büyük metin" (3:1) eşiğine giren 61px rakamlarda.
8. **CI/panel düzeltmeleri** — aşağıdaki veri kaybı hatası.

**BU OTURUMDA BULUNAN GERÇEK VERİ KAYBI HATASI:** Panel → Tema → Çalışma
Saatleri alanı tek satırlık bir `<input>`'tu. `working_hours` migration'da
satır sonlarıyla dolduruluyor (`chr(10)`) ve İletişim sayfası
`whitespace-pre-line` ile 3 satır basıyor — ama **HTML'de bir input satır sonu
taşıyamaz.** Tema ekranı bir kez kaydedildiği anda, bu alana hiç dokunulmasa
bile satır sonları siliniyor ve değer "…18:00Cumartesi: 09:00 - 13:00Pazar:
Kapalı" gibi yapışık tek satıra dönüşüyordu. Canlıda gerçekten olmuştu, ekran
görüntüsünde görüldü. `TextareaField`'a çevrildi. **Kesirli referans puanı
hatasıyla aynı sınıf: panel gidiş-dönüşü veriyi sessizce bozuyor** — bu
desene karşı uyanık olunmalı.

**Hakkımızda metni yazıldı.** İkinci bir araştırma turuyla (38 gerçek
"Hakkımızda" sayfası: yerel/orta ölçekli 12, büyük 9, konut geliştirici 8,
uluslararası 9) sektörün metin kalıbı çıkarıldı ve Akme'nin GERÇEK verilerine
sadık bir metin + 5 maddelik değerler listesi önerildi, kullanıcı panele
girdi. Kalıbın özü: **sıfat iddiadır, fiil taahhüttür**; her iddia bir çapaya
(yıl, şehir adı, sayı) bağlanır; şehir saymak sayı saymaktan ikna edicidir;
ENKA'nın metni 110 kelimedir. Kaçınılan klişelerin tam listesi
`RAKIP-ANALIZI.md`'de — incelenen 10 büyük firmanın hiçbiri "müşteri
memnuniyeti odaklı", "kaliteden ödün vermeden", "sektörün öncüsü" veya
"hayallerinizi gerçekleştiriyoruz" kullanmıyor.

**Kullanıcının kendi yaptıkları (panelden, kod değil):** Hero'ya fotoğraf ve
buton, Hakkımızda'ya fotoğraf + metin + değerler, İstatistikler'i Hero'nun
hemen altına taşıma (araştırmanın "hero çok boş hissini kıran en yaygın
hamle" dediği şey), Hizmetler'i "İkonlu Kart" varyantına alma.

**Hizmetler varyantı neden değişti:** Kullanıcı hizmetlere görsel yükledi ama
yüklenenler 20-37 KB'lık **çizgi ikon PNG'leriydi**, fotoğraf değil.
`object-cover` şeffaf zeminli bir ikonu kabı doldurmak için ~300px'e
büyütüyordu. Kod doğru çalışıyordu; yanlış olan fotoğraf yuvasına ikon
konmasıydı. Çözüm olarak bölüm "İkonlu Kart" varyantına alındı — o varyant
görsel kullanmaz, her hizmetin kendi `icon` alanını gösterir.

**Doğrulama:** `npm run lint`, `npm run build` (10/10 sayfa), `npm test`
(95 birim + 3 e2e) — hepsi temiz. Tasarım her adımda kullanıcının gerçek
tarayıcı ekran görüntüleriyle doğrulandı (bu ortamda `localhost`'a
erişilemiyor, bilinen sınırlama — 11 ekran görüntüsü tek tek incelendi).

**BİR SONRAKİ OTURUM İÇİN:** Tasarım tarafında planlanan iş kalmadı. Açık
duran işler: (a) denetimden kalan 42 madde, `DURUM.md` madde 11-19; (b)
`MUSTERİ-KILAVUZU.md` bu oturumda değişen üç panel akışını (değerler
biçimi, çalışma saatleri textarea'sı, hizmet varyantı) henüz anlatmıyor —
teslim öncesi güncellenmeli; (c) Vercel'de `RESEND_API_KEY` ve
`ACTIVE_TENANT_DOMAIN` tanımlı değil (bkz. madde 20-21).

**Bu oturumda ERTELENEN, tekrar gündeme getirilebilecek fikirler:** Bölüm
varyantı kütüphanesini genişletmek (about/stats/cta/team'e ikinci varyant) —
üç tasarım yönünden biriydi, **bilinçli olarak elendi**: varyantlar hiçbir
TEK siteyi güzelleştirmez, yalnızca siteleri birbirinden farklı kılar; ayrıca
500+ kombinasyon WCAG doğrulamasını imkânsızlaştırırdı. Proje detayının
modal yerine gerçek sayfa olması (incelenen 93 sitenin hiçbiri modal
kullanmıyor, ayrıca her proje ayrı indekslenebilir sayfa demek — SEO kazancı).

**Önceki güncelleme:** 2026-08-20 (on birinci oturum) — **Baştan aşağı mentör
denetimi.** Kullanıcının isteğiyle depo sekiz boyutta (güvenlik, Next.js 16
uyumu, mantık doğruluğu, erişilebilirlik, test, mimari/kod tekrarı,
doküman-kod tutarlılığı, SEO/performans/KVKK) paralel tarandı ve **her bulgu,
varsayılanı "bu bulgu yanlış" olan ayrı bir çürütücü ajana verildi.**
**107 bulgu üretildi, 105'i sağ çıktı, 2'si çürütüldü; tekilleştirilince 52
madde kaldı.** Manşet bulgular ajan raporuna güvenilmeden ELLE teyit edildi
(migration SQL'i, `.next/server/app/*.html` build çıktısı, kaynak kod).
Tam liste ve öncelik sırası bir Artifact olarak yayımlandı.

**Bu oturumda düzeltilenler (kullanıcı "hızlı kazanımlar" paketini seçti — 8
düzeltme + 2 yeni test dosyası):** (1) `<html lang="en">` → `lang="tr"`;
(2) koyu temada tanımsız kalan `--color-neutral-100` (kontrast 1.14:1'e
düşüyordu); (3) **hiçbir sayfada `<meta name="description">` yoktu** —
`description: undefined` kök layout'un yedeğini siliyordu, build HTML'i ile
kanıtlandı; (4) kanonik adres + `/ekip` ve `/iletisim` için kendi açıklamaları
(**canonical yalnızca `getKnownSiteUrl()` dolu olduğunda üretiliyor** —
ilk hâli `tenants.domain`'e düşüp var olmayan bir adrese işaret ediyordu,
bu eksik canonical'dan daha zararlı olurdu; build çıktısı incelenirken
yakalandı);
(5) **kesirli referans puanı panelden düzenlenince SESSİZCE siliniyordu**
(gerçek veri kaybı — şema ve form 2026-08-19'daki `numeric(2,1)` geçişine
güncellenmemişti; düzeltirken **İKİNCİ bir kayıp yolu daha bulundu:**
`getTestimonialById` PostgREST'in string dönebilen `numeric` değerlerini
kabul etmiyordu, yani formu düzeltmek tek başına yetmezdi — puan çevirme
mantığı `parseRatingInput` / `coerceStoredRating` olarak tek modülde
toplandı, `queries.ts`'teki yerel kopya silindi);
(6) `project.ts`'teki `year` alanı DB CHECK kısıtıyla
uyuşmuyordu; (7) Tema/Ayarlar'daki 3 `.update()` çağrısı `.upsert()`'e
çevrildi (dokuzuncu oturumda Hero/Hakkımızda'da düzeltilmiş ama buraya
taşınmamış hata); (8) **`seed-template.sql` yeni müşteri kurulumunu
bozuyordu** — `team` ve `contact` bölümlerini hâlâ ana sayfaya ekliyordu;
(9) CI'a `permissions` + `timeout-minutes`. Yeni testler:
`lib/validation/testimonial.test.ts` ve `project.test.ts` — ikisi de 5. ve
6. maddedeki hataların regresyon koruması.

**Denetimden çıkan asıl ders:** 52 bulgunun büyük çoğunluğu tek bir kalıptan
doğuyor — **bir yerde verilen doğru karar, aynı kalıbın diğer kopyalarına
yayılmamış.** Yukarıdaki 5, 6 ve 7. maddelerin üçünde de doğru çözüm zaten
projede vardı, gerekçesi bile yorumla yazılıydı; sadece ikinci/üçüncü kopyaya
taşınmamıştı. Bu yüzden mimari bölümündeki kod tekrarı maddeleri (9 kopyalı
`imageActions`, 4 kopyalı görsel yükleyici, 5 kopyalı toggle/move/delete) bir
"temizlik" değil, **hata önleme** işi.

**BU OTURUMDAN SONRAKİ OTURUM İÇİN:** `npm run lint`, `npx tsc --noEmit`,
`npm test` ve `npm run build` bu oturumda HENÜZ ÇALIŞTIRILMADI (komutlar
kullanıcıya verildi, bkz. `AI-KURALLARI.md` madde 9.2) — bir sonraki oturum
önce bunların temiz geçtiğini teyit etmeli. En yüksek öncelikli açık madde
aşağıdaki **madde 10** (anon'a açık RPC yetkileri).

**Önceki güncelleme (2026-08-19, onuncu oturum):** Uzun bir oturum; beş ana iş
yapıldı. **12 commit atıldı ve hepsi `origin/main`'e push'landı.**

**(1) Proje yeni bir makineye taşındı ve sıfırdan kuruldu**
(`C:\Users\234410084\staj-projesi`; `node_modules`/`.env.local`/`.next`
yoktu). Böylece `KURULUM.md`'nin adımları ilk defa GERÇEKTEN sıfırdan koşuldu
ve **ortam değişkeni varsayımına dayanan 2 gerçek hata** ortaya çıkardı — ikisi
de dolu bir `.env.local`'i olan hiçbir oturumda görülemezdi:
`lib/supabase/queries.ts`'te `ACTIVE_TENANT_DOMAIN` yedeği `??` ile yazılmıştı
(`.env`'de boş bırakılan değişken `undefined` değil BOŞ STRING olduğu için
yedek hiç devreye girmiyordu, build tamamen düşüyordu → `||`); ve
`next.config.ts`'te `process.env.NEXT_PUBLIC_SUPABASE_URL!` yoksa `.replace()`
anlamsız bir `TypeError`'la build'i düşürüyordu (→ CSP'den o origin'i
çıkarıyor; bu **güvenli**, çünkü `connect-src`'den origin çıkarmak politikayı
daha KATI yapar). Kurulum tam: `npm install` (482 paket, Node 26.4),
Playwright Chromium, `.env.local` dolduruldu, `npm run types:generate`
çalıştırıldı (`Functions` bloğu dokuzuncu oturumdan beri eksikti, artık 3
RPC'yi içeriyor).

**(2) E2E testleri 2 oturum sonra ilk kez koşuldu ve 2 GERÇEK hata buldu:**
`/panel/giris` sayfasında **hiç `<h1>` yoktu** (`TextScramble` `<span>` render
ediyor — 2026-08-18'de `/ekip`+`/iletisim`'de düzeltilen hatanın aynısı, o
taramada giriş sayfası kapsam dışıydı) ve `e2e/admin-service-flow.spec.ts`'teki
`getByLabel("Şifre")` seçicisi `PasswordField`'ın göster/gizle butonuyla
çakışıyordu (`exact: true`). İkisi de `3c15629` (sekizinci oturum)
commit'inden geliyordu ve **e2e hiç koşulmadığı için** iki oturum gizli
kalmıştı — `AI-KURALLARI.md` madde 8.4 fiilen ihlal edilmişti. **Bir YANLIŞ
ALARM da düzeltildi:** oturum başında "migration `20260818150000`
uygulanmamış, canlı iletişim formu kırık" denmişti; hatalı tespit yöntemiydi
(fonksiyonlar parametresiz `rpc()` ile denenmiş, PostgREST'in imza-eşleştirme
davranışı "fonksiyon yok" sanılmıştı). `pg_proc` doğrudan sorgulanınca üçünün
de zaten var olduğu görüldü.

**(3) Ziyaretçi sitesi görsel zenginleştirmesi TAMAMLANDI (madde 0d kapandı)**
— iki oturumdur bekliyordu. Sıra: Hizmetler → Projeler →
Referanslar/İstatistikler/SSS/CTA → Footer → Ekip; her bölüm ayrı ayrı
kullanıcıya gösterilip onaylandı. Yeni paylaşılan
`components/ui/ImagePlaceholder.tsx`, site geneline yayılan ortak hover dili,
**iki "veri var ama ekranda yok" bulgusu** (`projects.category` ve
`testimonials.rating` — ikincisi sorguda bile seçilmiyordu). Kullanıcı
isteğiyle `rating` kesirli hâle getirildi (migration `20260819120000_...`,
integer → numeric(2,1), yarım yıldız — UYGULANDI). **Madde 9 (çift-önek
Storage hatası) da bu iş sırasında tamamen çözüldü:** kök neden DB kaydı (seed
yer tutucuları), 9 kolon/6 bucket tarandı, **7 kırık yol** bulunup temizlendi
(4'ü Ekip'te ve YAYINDAYDI).

**(4) CI kuruldu** (`.github/workflows/ci.yml`) — `TEST-STRATEJISI.md` madde
12'de açık duran madde kapandı. Her push/PR'da `npm ci` → lint → **`next
typegen`** → `tsc --noEmit` → 54 birim testi → build; ayrı ve bloklamayan bir
`npm audit` job'ı. **Hiçbir gizli anahtar gerektirmiyor** (yukarıdaki iki env
düzeltmesi sayesinde). **İlk koşu KIRMIZI döndü** — `Cannot find name
'LayoutProps'`: bu tip Next.js'in otomatik ürettiği global bir tip ve
`.next/types/`'ta yaşıyor; yerel simülasyon `.next` silinmeden yapıldığı için
hatayı kaçırmıştı. `npx next typegen` adımı eklenip düzeltildi, action'lar
`@v5`'e yükseltildi.

**(5) Kullanıcı istekli iki küçük düzeltme:** Hizmetler'deki "Konut İnşaatı"
kartının görseli kaldırıldı (artık diğer ikisi gibi kendi `home` ikonunu
gösteriyor — sadece VERİ değişikliği, kod değişmedi); SSS'nin iki sütunlu
varyantı `columns-2`'den `grid-cols-2`'ye çevrildi (sütunların bitiş hizaları
tutmuyordu).

**Ayrıca:** `nanoid` güvenlik açığı kapatıldı (`npm audit` 1 high → **0**);
commit kuralları genişletildi (emir kipli mesaj, Türkçe karaktersiz, doküman
commit'lerinin gün sonunda toplanması — `AI-KURALLARI.md` madde 8.5-8.7);
madde **0b (panelin gerçek çok-kiracılılığı) kullanıcı kararıyla
önceliksizleştirildi**; Ayarlar'daki "tofe İnşaat" başlığı kullanıcı kararıyla
**bilinçli olarak korunuyor** (ikisi de tekrar gündeme GETİRİLMEMELİ).

**Doğrulama:** `npm run build` (10/10 sayfa), `npm test` **54/54 birim + 3/3
e2e**, `npm run lint`, `npx tsc --noEmit` — hepsi temiz. Ekran görüntüsü
alınamadı (Claude in Chrome bu ortamda `localhost`'a erişemiyor, bilinen
sınırlama); doğrulama her adımda üretilen HTML'in `curl` ile çekilip beklenen
sınıf/ikon/metin sayılarının sayılmasıyla + kullanıcının gözle onayıyla
yapıldı.

**BİR SONRAKİ OTURUM BURADAN BAŞLASIN:** Ortam kurulu ve çalışır durumda —
`npm run dev` yeterli, yeniden kurulum gerekmiyor. `.env.local` dolu ve
`.gitignore`'da. Açık iş kalmadı: "Sıradaki adım" listesindeki 0d, 0b, 9 ve CI
maddeleri bu oturumda kapandı. **Kullanıcıya sunulmuş ama henüz seçilmemiş
seçenekler:** (a) **KVKK aydınlatma metni + çerez politikası** —
`GUVENLIK.md` madde 10'un açık maddesi, `KURUMSAL-SITE-STANDARTLARI.md` şart
koşuyor, iletişim formu zaten IP ve kişisel veri saklıyor; (b) **test
kapsamını genişletmek** — 6 doğrulama şeması ve bileşen render testleri hâlâ
yok, bugün dokunulan hiçbir bileşenin testi yok; (c) **panelin iç ekranlarının
görsel devamı** — ziyaretçi sitesi bitti ama panel içeriği sekizinci oturumdaki
kabuk yenilemesinden sonra aynı kaldı. **Bugün ertelenen iki fikir:** bölüm
başlıklarına panelden yönetilen açıklama alanı (`page_sections`'a yeni kolon —
şu an başlıklar kodda sabit, `AI-KURALLARI.md` madde 5.5 gereği metin
eklenmedi) ve scroll ile beliren animasyon (client bileşeni gerektirir, Server
Component'ten çıkarır).

**Önceki güncelleme (2026-08-18, dokuzuncu oturum):** Kullanıcı
önceliği değiştirdi: sekizinci oturumda ertelenen ziyaretçi sitesi görsel
zenginleştirmesi (Hizmetler→Footer) yerine, bu oturumda (1) iletişim formuna
**Resend** ile e-posta bildirimi ve (2) panele **Hero/Hakkımızda** düzenleme
ekranları eklendi. Mimari karar (Resend seçimi, gerekçe) önce
`KARAR-GUNLUGU.md`'ye yazıldı, sonra uygulandı (bkz. "dokuzuncu oturum").
`tenants.contact_recipient_email` (2026-08-06'dan beri var ama hiç
kullanılmayan bir kolon) artık hem gerçek amacına hizmet ediyor (bildirim
alıcısı) hem panelde (Ayarlar → Bildirimler) düzenlenebiliyor. Hero/Hakkımızda
ekranları, `tenant_id` UNIQUE tekil kayıt oldukları için Hizmetler'in
liste-CRUD deseni değil, Tema/SEO Ayarları'nın "tek kayıt + Kaydet" desenini
kullanıyor; `BrandImageUploader.tsx` bunun için "branding" bucket'ına sabit
kodlu olmaktan çıkıp bir `bucket` prop'u aldı. Doğrulandı: `npm install
resend` + `npm run lint`/`build` kullanıcı tarafından çalıştırıldı; yol
boyunca sekizinci oturumdan kalma 2 gerçek bug bulunup düzeltildi
(`TextScramble.tsx`'teki `react-hooks/set-state-in-effect`, giriş
sayfasındaki gereksiz `forceLightScript` — ikincisi tamamen kaldırıldı,
bkz. `KARAR-GUNLUGU.md`). **(3) Kullanıcının doğrudan sorusu üzerine panel
girişine IP bazlı hız sınırı/kilitleme eklendi:** 15 dakikada 5 başarısız
denemeden sonra kilitleniyor (yeni `login_attempts` tablosu,
`lib/security/loginRateLimit.ts`) — kullanıcı gerçek tarayıcıda test edip
ÇALIŞTIĞINI doğruladı. **(4) Ziyaretçi sitesine (Ekip/İletişim) ve panele
(neredeyse tüm sayfalar) breadcrumb eklendi**, ziyaretçi tarafında ayrıca
`BreadcrumbList` JSON-LD (SEO) ile. **(5) Kullanıcı "çok yüzeysel
çalışıyorsun" diye haklı bir eleştiri yaptı** — bunun üzerine bu oturumun
TÜM diff'i (52 dosya) adversarial-doğrulamalı çok-ajanlı bir review'a
verildi VE Claude in Chrome ile gerçek tarayıcıda doğrulama yapıldı. Review
**6 gerçek sorun buldu, hepsi düzeltildi** — en önemlisi: **login VE
iletişim formu hız sınırlayıcıları ATOMİK DEĞİLDİ** (paralel isteklerle
atlatılabiliyordu, klasik TOCTOU), artık Postgres advisory lock'lu atomik
fonksiyonlarla düzeltildi (yeni migration `20260818150000_...`, henüz
Supabase'e uygulanmadı); ayrıca `/ekip`/`/iletisim`'de hiç `<h1>` yoktu,
düzeltildi. Detay: `KARAR-GUNLUGU.md`, "Kullanıcı geri bildirimi: 'çok
yüzeysel'"; `docs/DURUM.md` "Sıradaki adım" madde 0h.
Ziyaretçi sitesi görsel zenginleştirmesi (madde 0d, Hizmetler→Footer)
hâlâ bekliyor, bu oturumda ele alınmadı.

**Önceki güncelleme (2026-08-18, sekizinci oturum):** İki ayrı
konu işlendi. **(1) GitHub "claude" contributor sorunu araştırıldı:** mevcut
commit geçmişinde (55 commit) `Co-Authored-By` izi kalmadığı `git
filter-branch` denemesiyle doğrulandı (sonuç: "Ref unchanged", hiçbir şey
değişmedi çünkü zaten temizdi) — sorun artık koddan değil, GitHub'ın
force-push öncesi geçmişten kalma contributor önbelleğinden kaynaklanıyor
(GitHub'ın kendi dokümantasyonu: yenilenmesi ~24 saat sürebilir, hâlâ
yanlışsa Destek'e yazılmalı). Destek talebi taslağı hazır ama gönderilmedi;
~24 saat sonrasına otomatik kontrol için bir bulut ajanı (routine)
zamanlandı (`claude.ai/code/routines/trig_0142kwKQGVBw7PiZ9tS6tTPB`) —
**sonucu bekleniyor.** **(2) Panel + giriş sayfası + Navbar/Hero görsel
olarak zenginleştirildi** (kullanıcı geri bildirimi: "tasarım basit/
yüzeysel kalmış, div yazıp geçmişim gibi"): 4 yeni paylaşılan bileşen
(`Badge`, `Tooltip`, `TextScramble`, `PasswordField`), panel header'ında
`UserMenu` (avatar+açılır panel), kenar menüsünde aktif sayfa vurgusu,
panel VE site mobil menüsü artık sağdan kayan çekmece (tam ekran kaplayan
eski halinden). Giriş sayfası kullanıcı geri bildirimiyle İKİ KEZ
tasarlandı — ilk halinde split-screen (sol/sağ ayrı blok) yapıldı,
kullanıcı "iç içe olsa daha güzel, ortada orantısız duruyor" dedi, son
hali: tek "iç içe" mavi kompozisyon, form kartı camsı/yarı saydam bir
katman olarak sayfanın İÇİNE oturuyor (yerel CSS custom property override
tekniğiyle, TextField/Button gibi paylaşılan bileşenlere dokunmadan). Test
sırasında gerçek bir Tailwind sınıf-önceliği hatası bulunup düzeltildi
(buton metni beyaz zemin üzerinde beyaz kalıp görünmez oluyordu). Detay:
`KARAR-GUNLUGU.md`, "sekizinci oturum". **Kapsam bilinçli ikiye bölündü:**
ziyaretçi sitesinin geri kalanı (Hizmetler/Projeler/Referanslar/
İstatistikler/SSS/CTA/Footer) HENÜZ ELE ALINMADI — bkz. aşağıda "Sıradaki
adım", bir sonraki oturum buradan devam etmeli. `npm run lint`/`build`
HENÜZ çalıştırılmadı, hiçbir şey commit'lenmedi — oturum sonunda toplu
commit planlanıyor (bu notun kendisi commit'ten önce yazıldı, bir sonraki
oturumda gerçekten commit'lenip lint/build'in temiz geçtiği teyit
edilmeliyse burada hâlâ "commit'lenmedi" yazıyorsa dikkat).

**Önceki güncelleme (aynı gün, yedinci oturum):** Altıncı oturumun sonunda
açık bırakılan panel mesaj bildirimi sorunu çözüldü. Kök neden:
`NewMessageNotifier.tsx`, Realtime kanalına istemci oturumu tarayıcıda
(asenkron) yüklenmeden önce senkron abone oluyordu, bu yüzden ilk katılım
"anon" rolüyle kuruluyor ve RLS tüm INSERT olaylarını SESSİZCE eliyordu
(`CHANNEL_ERROR`/`TIMED_OUT` logu da hiç tetiklenmiyordu, kanal "SUBSCRIBED"
dönüyordu — beşinci oturumdaki backend testleri bu senaryoyu yakalayamamıştı
çünkü onlar kanalı doğrudan authenticated rolüyle kuruyordu). Düzeltme: abone
olmadan önce `supabase.auth.getSession()` bekleniyor,
`supabase.realtime.setAuth()` ile token elle veriliyor, ancak sonra kanal
kuruluyor. Aynı işte `router.refresh()` eklenerek Mesajlar listesi (Server
Component) de sayfa yenilenmeden güncel kalır hale getirildi. Kullanıcı
iki-sekmeli gerçek tarayıcı testiyle doğruladı: ÇALIŞIYOR. Detay:
`KARAR-GUNLUGU.md`, "yedinci oturum". **Düzeltme (sekizinci oturum):** bu
madde önceden "henüz commit'lenmedi" diyordu — GitHub'da kontrol edildi,
aslında commit'lenmiş (`fix: panel mesaj bildirimini gerçek zamanlı
çalıştır` + `fix: CSP connect-src'e Supabase origin ekle`), `npm run lint`/
`build` teyidi hâlâ kullanıcıdan bekleniyor ama commit durumu yanlış
yazılmıştı, düzeltildi.

**Önceki güncelleme (aynı gün, beşinci oturum):** Kullanıcının
verdiği tamamen yeni bir açık+koyu renk paleti (Sayfa/Kart/Hero/Başlık/
Metin/Accent/Border) **deneme olarak** projeye uygulandı — kullanıcının
kendi çerçevesi: "ya bu haliyle devam ederim ya da eskiye dönerim".
`--color-surface`/`-surface-raised`/`-text`/`-text-muted`/`-brand`
kullanıcının değerleriyle güncellendi ve artık ham `--color-neutral-*`
skalasına bağlı DEĞİL (kendi doğrudan değerleri var); YENİ `--color-hero`
token'ı eklendi (`HeroVariantA.tsx`'in görselsiz zemin rengi, marka
renginden ayrı); kenarlık rengi (`--color-neutral-300`) artık açık/koyu
temada FARKLI (eskiden sabitti). **Bulunan ve kullanıcıya açıkça
bildirilen bir çelişki:** yeni paletin koyu Accent'i MAVİ — kullanıcı
bu oturumun başında (3. oturum) koyu marka rengini BİLEREK turuncuya
çevirmişti ("koyu zeminde mavi çok boğuyor"); kullanıcı kendi yeni
talebiyle bu kararı bilerek geçersiz kılıyor, AI soru sormadan harfiyen
uyguladı ama çelişkiyi kodda/dokümanda gizlemedi. Kontrast yeniden
hesaplandı: 2 çift hâlâ (turuncudaki gibi) 4.5:1'in az altında (koyu
brand/surface — 3:1 UI eşiğini geçiyor), 1 YENİ çift az altına düştü
(koyu error/surface-raised, 4.44:1) — dürüstçe işaretlendi. Detay:
`KARAR-GUNLUGU.md`, "beşinci oturum"; `TASARIM-SISTEMI.md` madde 1-2
tamamen güncellendi. `npm run build`/`lint` AI tarafından çalıştırılıp
temiz doğrulandı.

**Karar (altıncı oturum):** Kullanıcı yeni paleti tarayıcıda inceledi ve
**kalıcı olarak tutmaya karar verdi** — deneme durumu sona erdi, bu artık
sitenin güncel renk paleti. Geri dönüş seçeneği yok sayıldı, ek bir kod
değişikliği gerekmedi (palet zaten tam uygulanmış ve commit'lenmişti).

**Önceki güncelleme (aynı gün, üçüncü-dördüncü oturumlar):** Ziyaretçi
açık/koyu tema switch'i (site tüm sayfalarda + panel + giriş sayfası,
Next.js'in resmi FOUC-önleme deseniyle) kuruldu; kullanıcı bulgusuyla
koyu mod paleti canlandırıldı (metin/marka rengi WCAG kontrastı
YÜKSELTİLEREK, Footer + 6 görsel placeholder tema-duyarlı hale
getirildi, marka rengi kullanıcı tercihiyle turuncuya çevrildi — bu
karar 5. oturumda kullanıcının kendi yeni talebiyle bilerek geçersiz
kılındı, yukarı bakın); panel başlık hizası ve `ThemeToggle`'daki
gerçek bir hydration hatası (`useSyncExternalStore`'a geçilerek)
düzeltildi; İstatistikler bölümündeki ortalama/boşluk/font sorunu (sabit
grid-cols(4) ama 3 kayıt olduğu için grup sola kayıyordu) flex+
justify-center'a çevrilerek düzeltildi; iletişim formunun telefon
alanı sadece-rakam + uzunluk sınırına kavuştu (ülke kodu seçici
denenip kullanıcı geri bildirimiyle geri alındı); panel Mesajlar'a
onaylı silme eklendi (gerçek bug: dialog otomatik kapanmıyordu —
`state.success` başlangıcı `false`'a çekilerek düzeltildi); okunmamış
mesaj sayacı artık CANLI (`revalidatePath(..., "layout")` + Supabase
Realtime `postgres_changes` ile — panel açıkken yeni mesaj geldiğinde
sayfa yenilenmeden toast bildirimi + anlık sayaç artışı, YENİ
`components/ui/Toast.tsx`/`ToastContainer.tsx` + `components/panel/
NewMessageNotifier.tsx`); **kritik bir üretim hatası bulunup
düzeltildi:** honeypot alanının adı/etiketi ("website"/"Web siteniz")
tarayıcı/şifre yöneticisi otomatik doldurma sezgileriyle çakışıp GERÇEK
müşteri mesajlarını sessizce spam sayıyordu — **kullanıcının 2 gerçek
test mesajı geri getirilemez şekilde kayboldu**, alan adı nötr bir
değere (`iletisim_notu`) çevrilerek kalıcı olarak düzeltildi. Tüm
detay: `KARAR-GUNLUGU.md`, "üçüncü/dördüncü oturum". `npm run build`/
`lint`/`test:unit` kullanıcı tarafından doğrulandı, hepsi temiz —
Realtime migration'ı (`20260818130000_...`) henüz Supabase'e
uygulanmadı, iki-sekmeli canlı test henüz yapılmadı, commit'lenmeyi
bekliyor. Ayrıca ilgisiz ama gerçek bir bug flag'lendi (ele alınmadı):
proje görselleri "projects/projects/..." şeklinde iki kez tekrarlanan
bir Storage yolu 400 hatası veriyor.

**Önceki güncelleme (aynı gün, ilk-ikinci oturumlar):** Önceki oturumun "madde 0"ı (commit/push
+ canlı doğrulama) fiilen tamamlanmış bulundu: `git status` temiz,
`origin/main` güncel, panel `noindex` meta etiketi canlıda `curl` ile
doğrulandı. Ardından kullanıcı isteğiyle **mentör tarzı, koda dayalı,
bağımsız bir tam proje incelemesi** yapıldı (3 paralel araştırma ajanı —
dokümandaki açık maddeler, kod/doküman tutarlılığı, güvenlik/kod
kalitesi). **Yeni ve önemli bir güvenlik açığı bulunup düzeltildi:**
iletişim formu IP hız sınırı (`lib/security/contactRateLimit.ts`),
`x-forwarded-for` zincirinin İLK (sahtelenebilir) değerini
kullanıyordu — SON (Vercel'in gerçekten gözlemlediği) değere
düzeltildi, regresyon testi eklendi. Detay: `KARAR-GUNLUGU.md`,
"2026-08-18". Bu iş commit'lenip push'landı (`36ea9f6`), 42/42 test ve
lint yeşil doğrulandı.

**Aynı gün, ikinci oturum — 5 Storage bucket'ı + 3 tabloya görsel
yükleme:** Kullanıcı mentör bulgularından "5 bucket + e-posta
bildirimi"ni seçti. Uygulamaya başlamadan önce kapsamın beklenenden
büyük olduğu görüldü (sadece Projeler'de gerçek yükleme akışı vardı,
Hizmetler/Referanslar/Ekip'te form alanı bile yoktu, Hero/Hakkımızda'nın
hiç içerik düzenleme ekranı yoktu) — kullanıcıya bildirilip
"Hizmetler/Referanslar/Ekip'i tamamla, Hero/Hakkımızda'yı ayrı bırak"
seçildi. 5 bucket'ın hepsi migration'a eklendi, 3 tabloya (Hizmetler/
Referanslar/Ekip) Projeler'deki desenle birebir aynı yükleme UI'ı
kuruldu. Migration uygulandı, kullanıcı gerçek tarayıcıda uçtan uca
doğruladı, commit'lendi/push'landı. Aynı oturumda görsel boyut sınırı
da 5MB'dan **10MB**'a çıkarıldı. Detay: `KARAR-GUNLUGU.md`, "ikinci
oturum".

İncelemede ayrıca daha büyük, henüz ele alınmamış bir boşluk ortaya
çıktı: panel PRD'nin tanımladığı gibi gerçekten çok-kiracılı değil —
yeni tenant oluşturma/seçme arayüzü yok, tek bir sabit tenant'a kilitli
(bkz. "Sıradaki adım" madde 6, artık daha yüksek öncelikli olarak
yeniden çerçevelendi). **Bu bulgu bu oturumda ele alınmadı, hâlâ açık.**

**Aynı gün, üçüncü oturum — ziyaretçi açık/koyu tema switch'i + koyu
mod paleti canlandırma:** Kullanıcı yeni bir özellik istedi: Navbar'da
(tüm site sayfalarında), panelde ve giriş sayfasında güneş/ay ikonlu
bir açık/koyu tema switch'i. `next/dist/docs/.../preventing-flash-
before-hydration.md`'deki resmi Next.js deseniyle kuruldu (FOUC yok,
`localStorage`'da kalıcı). Ardından kullanıcı koyu moddaki bazı
renklerin "soluk" durduğunu bildirdi — inceleme 2 gerçek bug buldu
(`Footer.tsx` temadan bağımsız sabit koyu renkteydi, 6 görsel
placeholder'ı sabit `bg-neutral-300` kullanıyordu) ve `--color-text`/
`--color-text-muted`/`--color-brand`'ın koyu mod değerleri WCAG
kontrastı YÜKSELTEREK canlandırıldı. Detay: `KARAR-GUNLUGU.md`,
"üçüncü oturum". **Kod henüz `npm run build`/`lint` ile doğrulanmadı,
yeni palet tarayıcıda henüz teyit edilmedi, commit'lenmedi.**

**Önceki güncelleme (2026-08-17):** **Vercel'e ilk yayın yapıldı**
(`staj-projesi-olive.vercel.app`), canlıda 2 gerçek hata bulunup
düzeltildi (CSP hydration engeli, yanlış domain'le SEO 92→58). Düzeltme
sonrası canlı uçtan uca testler 3/3 yeşil, kanonik adreste Lighthouse
**mobil/masaüstü Performance 97-100, Accessibility 100, Best Practices
96, SEO 92** doğrulandı (dördü de ≥90 hedefinin üzerinde). Kanonik
adrese otomatik yönlendirme (`proxy.ts`) ve panel `noindex` meta
etiketi eklendi — ikisi de bir sonraki oturumda commit'lenmiş/push'lanmış
ve canlıda çalıştığı doğrulanmış olarak bulundu (yukarıya bakın). Gün
sonu dokümantasyon taraması yapıldı (bkz. `KARAR-GUNLUGU.md`, "dokuzuncu
oturum").

## Proje bağlamı

**Tek geliştirici, toplam ~32 iş günlük süre. Bu proje kapsamında gerçek bir
müşteriye canlıya alınmıyor** — staj/geliştirme amaçlı bir ürün/demo inşa
ediliyor. Bu kısıtlar, kapsamı sınırlayan birçok kararın (hazır bölüm
kütüphanesi, sınırlı sürükle-bırak, çoklu dilin ertelenmesi, pragmatik/hedefli
test stratejisi, Vercel Hobby plan seçimi) arka planındaki ortak sebep — bkz.
`KARAR-GUNLUGU.md`, 2026-08-06 ("Proje bağlamı netleşti...", "`docs/MIMARI.md`
oluşturuldu...").

## Güncel aşama

Proje yeni başladı. `staj-projesi` klasörü ve `docs/` sistemi kuruldu (`DURUM.md`,
`KARAR-GUNLUGU.md`). Henüz kod/scaffold yok; teknoloji ve mimari kararları aşağıda.

Ayrıca `docs/KURUMSAL-SITE-STANDARTLARI.md` dosyasında iyi bir kurumsal site için
kriter/kontrol listesi hazırlandı (performans, erişilebilirlik, SEO, KVKK/güvenlik,
güven unsurları vb.) — ileride tasarlanacak site bu listeye göre değerlendirilecek.

Proje GitHub'a bağlandı: `https://github.com/Oguzhanbckci/staj-projesi` (public),
ilk commit push'landı.

**Teknoloji kararı verildi:** Next.js 16 (App Router) + TypeScript + Tailwind CSS +
Supabase. Detaylar `KARAR-GUNLUGU.md`'de (2026-08-05, "Teknoloji seçildi";
2026-08-06, "Next.js 16'ya güncellendi"), kod kuralları `docs/AI-KURALLARI.md`'de.

## Ürünün güncel mimarisi (2026-08-06'da netleşti)

Ürün, inşaat firmalarına satılan **tam yönetilen (managed) bir web servis
hizmeti**:

- **Platform sahibinin kendi tanıtım/ajans sitesi var** — hizmeti anlatan,
  herkese açık bir sayfa. Bu sitenin domaininin sonuna `/panel` eklendiğinde,
  kullanıcı adı/şifre isteyen gizli bir giriş açılır. **Sadece platform sahibi**
  buraya girer.
- Bu **tek panel = platformun tüm yönetim merkezi**: yeni müşteri (tenant)
  oluşturma, hazır bir **demo**yu tek tıkla import etme (WordPress temaları
  gibi), bölümleri (Hero, Hakkımızda, Hizmetler, Projeler, İletişim —
  bkz. `RAKIP-ANALIZI.md`; **blog/haberler kavramı kapsam dışı**) sürükle-bırakla
  açma/kapatma/sıralama, ve **her tenant'ın içeriğini/temasını da buradan
  düzenleme**.
- **Müşterinin kendi domaininde (ör. `akmeinsaat.com.tr`) hiçbir panel/login
  yoktur** — sadece herkese açık site vardır. Müşteri de kendi ziyaretçisi gibi
  siteyi görür, değişiklik isteğini platform sahibine iletir.
- Platform sahibinin kendi tanıtım sitesindeki iletişim bölümü: **WhatsApp
  butonu** + **iletişim formu** (ad-soyad, telefon, mesaj) — form platform
  sahibine e-posta olarak iletilir. Marka anonim kalır, kimlik/ekip bilgisi
  paylaşılmaz.
- Barınma: tek Next.js kod tabanı + tek Supabase projesi, çok kiracı
  (multi-tenant); her tenant `tenant_id` + RLS ile izole. Her tenant kendi alan
  adını kullanır (platforma ait alt alan adı değil).
- Bölüm/sayfa modeli: serbest page builder değil, önceden kodlanmış hazır bölüm
  kütüphanesi (sürükle-bırak sadece sıralama/aç-kapat için, bölümün içi sabit
  tasarım). Çoklu dil v1 kapsamı dışında, açık/koyu tema v1'de var.

Tüm gerekçe ve kronoloji için `KARAR-GUNLUGU.md`'deki 2026-08-06 tarihli
kayıtlara bakılabilir (en önemlisi: "Panel mimarisi düzeltildi: tek panel, tek
kullanıcı, tam yönetilen hizmet" — bu, aynı gün ve 2026-08-05'te alınan "iki
panel" / "tenant kendi admin'ine girer" fikirlerini geçersiz kılar). Özellik
bazlı güncel kapsam için tek referans `docs/PRD.md`'dir.

**Yeni:** Test stratejisi netleşti ve `docs/TEST-STRATEJISI.md`'ye taşındı
(staj yönergesi gereği e2e/unit/integration, ama tek geliştirici + 32 iş günü
kısıtıyla pragmatik/hedefli bir yaklaşımla). Unit sürekli, e2e/integration
sadece kritik akışlarda. "Bitti" tanımı (Definition of Done) da bu dosyada.
Lighthouse eşiği netleşti: Performance/Accessibility/Best Practices/SEO
dördünde de ≥90.

**Yeni:** `docs/MIMARI.md` oluşturuldu — teknik mimari tek dosyada toplandı.
İki yeni karar: **Hosting = Vercel, Hobby plan** (proje gerçek müşteriye
canlıya alınmadığı için ücretsiz plan yeterli), **Render stratejisi = statik
üretim + panelden tetiklenen on-demand ISR** (`revalidatePath`/`revalidateTag`
ile panel kaydında ilgili sayfa yeniden üretilir; `/panel` tamamen SSR).

**Kod tarafı başladı (2026-08-06):** Next.js scaffold (`create-next-app`,
TypeScript + Tailwind + App Router) kuruldu — **Next.js 16.3.0** ile (bkz.
`KARAR-GUNLUGU.md`, "Next.js 16'ya güncellendi"). Yanlışlıkla
`C:\Users\toffe\staj-projesi` içine kurulmuştu, doğru konuma
(`C:\Users\toffe\Projects\staj-projesi`) taşındı; `.git` ve `docs/` sağlam
kaldığı doğrulandı, `npm run dev` çalıştığı teyit edildi. Kök dizindeki
`CLAUDE.md`, `docs/DURUM.md`'ye (ve diğer proje beyni dosyalarına) otomatik
işaret edecek şekilde genişletildi.

**Klasör yapısı oluşturuldu (2026-08-06):** `app/(site)/`, `app/panel/`
(placeholder sayfalarla), `components/ui/`, `components/site/`,
`lib/supabase/`, `lib/utils.ts`, `types/index.ts` — hepsi `npm run build` ile
doğrulandı (`/`, `/panel`, `/_not-found` hatasız derleniyor). Her klasörün
amacı `docs/MIMARI.md` madde 8'de belgelendi. `app/api/` henüz yok, ilk
gerçek ihtiyaçta eklenecek.

**Veritabanı şeması netleşti + SQL yazıldı (2026-08-06):** İçerik envanteri
tablolara döküldü, platform sahibi `tenants` tablosunda özel bir satır
(`is_platform_owner`) olarak birleştirildi, sonra dışarıdan gelen bir
yönergeyle karşılaştırılıp revize edildi (bkz. `KARAR-GUNLUGU.md`, "Şema,
dışarıdan gelen bir yönergeyle karşılaştırılıp 3 noktada revize edildi").
Sonuç: **8 tablo** (`tenants`, `site_settings`, `hero_sections`,
`about_sections`, `services`, `projects`, `contact_sections`,
`contact_messages`) — `order_index` sadece `services`/`projects`'te,
`is_published` yalnızca yayın kontrolü gereken tablolarda, görsel kolonları
`*_path` (Storage yolu, tam URL değil). Çalışır SQL migration'ı yazıldı:
`supabase/migrations/20260806120000_create_content_tables.sql` (RLS her
tabloda açık, policy henüz yok) + `supabase/seed.sql` (her tabloya 2 satırlık
doğrulama verisi). Detay: `docs/VERİ-MODELİ.md`.

**Gerçek Supabase projesi kuruldu + ilk migration uygulandı (2026-08-07):**
Kullanıcı supabase.com'da gerçek bir proje oluşturdu, `supabase/migrations/
20260806120000_create_content_tables.sql` içeriği SQL Editor'e yapıştırılıp
çalıştırıldı — hatasız ("Success. No rows returned"), 8 tablo artık gerçek
veritabanında var. `.env.local` ve `lib/supabase/` istemcileri henüz kurulmadı.

**Kapsam genişletildi: Referanslar, SSS, Ekip Üyeleri (2026-08-07):**
Kullanıcı gerçekçi demo içeriği istedi (6 hizmet, 8 proje, 4 referans, 5 SSS,
4 ekip üyesi) — Referanslar/SSS/Ekip Üyeleri PRD kapsamında yoktu, kullanıcı
onayıyla yeni bölüm olarak eklendi (bkz. `KARAR-GUNLUGU.md`). 3 yeni tablo
(`testimonials`, `faqs`, `team_members`) ayrı bir migration'da yazıldı:
`supabase/migrations/20260807120000_add_testimonials_faqs_team_tables.sql`.
Toplam tablo sayısı: **11**.

**Migration + demo verisi gerçek projeye uygulandı (2026-08-07):** İki
migration da (8 tablo + 3 tablo) ve güncellenmiş `supabase/seed.sql` (11
tablonun tamamı, Akme İnşaat için gerçekçi içerik — 6 hizmet, 8 proje, 4
referans, 5 SSS, 4 ekip üyesi; insan-okunur hâli `content/demo-icerik.md`'de)
SQL Editor'den sırayla çalıştırıldı, sonunda "Success". Veritabanı artık
gerçek/gerçekçi demo veriyle dolu.

**Supabase istemcisi kuruldu + gerçek veriyle doğrulandı (2026-08-07):**
`@supabase/supabase-js` paketi kuruldu (`package.json`'a `^2.112.2` olarak
eklendi). `lib/supabase/server.ts` (service role client — RLS bypass eder,
yalnızca sunucu tarafında kullanılır) ve `lib/supabase/queries.ts`
(`getServices()` sorgu fonksiyonu) yazıldı. `.env.local` (gitignore'lu, gerçek
Supabase Project URL + service_role key ile) ve `.env.local.example` (şablon,
commit'li) oluşturuldu. Doğrulama için geçici bir `app/test-services/page.tsx`
sayfası yazıldı — `npm run dev` ile açılıp gerçek seed verisi (6 hizmet,
yayında/taslak karışık) ekranda görüldü, bağlantı çalışıyor. Bu test sayfası
geçici; gerçek Hizmetler bölüm bileşeni (`components/site/`) yazılınca
silinecek.

**RLS okuma/yazma politikaları yazıldı (2026-08-07):** İstisnasız 11 tabloda
anon sadece `is_published = true` okuyabiliyor (`site_settings` bağlı
`tenants` satırından türetiliyor), `tenants.contact_recipient_email` kolon
seviyesinde anon'dan gizlendi, yazma (insert/update/delete) sadece
`authenticated`'e açık. `contact_messages` istisna — anon'a hiç açık değil,
anonim iletişim formu ileride `app/api/contact/` route handler'ı (service
role) üzerinden çözülecek. Detay: `KARAR-GUNLUGU.md`. Migration dosyası
(`supabase/migrations/20260807130000_add_rls_policies.sql`) gerçek Supabase
projesine uygulandı (2026-08-07, SQL Editor'de "Success").

**RLS politikaları anon/authenticated ile uçtan uca test edildi (2026-08-07):**
`scripts/test-rls.mjs` yazıldı, `NEXT_PUBLIC_SUPABASE_ANON_KEY` `.env.local`'e
eklendi, Supabase Auth'ta bir test kullanıcısı oluşturuldu. 6/6 test "OK":
anon sadece `is_published=true` satırları görüyor, `contact_messages` anon'a
tamamen kapalı, anon insert RLS tarafından reddediliyor, authenticated hem
tam okuyor hem yazabiliyor. Detay ve karşılaşılan sorunlar (yanlış şifre,
script'te client paylaşım hatası): `KARAR-GUNLUGU.md`.

**Supabase CLI ile şema tipleri üretildi (2026-08-07):** `types/database.types.ts`
gerçek şemadan otomatik üretildi, `lib/supabase/server.ts`/`queries.ts` bu
tipi kullanacak şekilde güncellendi (elle yazılan `Service` tipi kaldırıldı).
`npm run types:generate` script'i eklendi. Süreçte birkaç CLI engeli aşıldı
(link komutu hatası, IPv6/DNS, Docker gereksinimi, PowerShell'in dosyayı
UTF-16 yazması) — hepsi `KARAR-GUNLUGU.md`'de kayıtlı, ileride tip yeniden
üretilirken tekrar yaşanmaması için.

**`docs/GUVENLIK.md` oluşturuldu, tüm docs dosya adları büyük harfe çevrildi
(2026-08-07):** `GUVENLIK.md` — tehdit modeli, RLS politikaları özeti,
anahtar yönetimi, test sonuçları (madde 4'teki 6/6 test) ve yayın öncesi
güvenlik kontrol listesini tek dosyada topluyor. Ayrıca `docs/` içindeki
küçük harfli dosya adları (`durum.md`, `Mimari.md`, `karar-gunlugu.md`,
`test-stratejisi.md`, `kurumsal-site-standartlari.md`, `rakip-analizi.md`)
büyük harfe çevrildi (`git mv` ile, geçmiş korunarak) ve tüm çapraz
referanslar (bu dosya dahil, `CLAUDE.md`, kod içindeki yorumlar) güncellendi.
`PRD.md`, `AI-KURALLARI.md`, `VERİ-MODELİ.md` zaten büyük harfliydi,
değişmedi.

**2026-08-07 oturumu commit'lenip push'landı:** Bugünkü tüm iş (RLS
politikaları, Supabase şema tipleri, `GUVENLIK.md`, docs isimlendirme) 3
ayrı commit'te (`90fcd9c`, `f5c6c3b`, `bd87ec6`) `main`'e push'landı,
`git status` temiz. `npm run build` hatasız geçti — bu doğrulama tamamlandı.

**Tasarım sistemi kuruldu (2026-08-08):** Dışarıdan gelen tasarım
yönergeleri (renk paleti + tipografi/boşluk/köşe/gölge ölçekleri) üzerine
`docs/TASARIM-SISTEMI.md` oluşturuldu ve `app/globals.css`'e kodlandı
(Tailwind v4 `@theme`/`@theme inline`, config dosyası yok). Kapsam: 1 marka
rengi (varsayılan, tenant'a göre değişebilir) + 7 adımlı nötr gri ölçeği +
3 semantik renk (başarı/uyarı/hata), hepsi açık/koyu tema karşılığıyla;
16px taban + 1.25 oranlı tipografi ölçeği (caption + gövde + h1-h6); 4px
ritimli boşluk ölçeği (Tailwind varsayılanıyla zaten örtüşüyor, ek kod
gerekmedi); köşe yarıçapı ve gölge seviyeleri (açık/koyu tema ayrı gölge
değerleriyle). Tüm metin/zemin çiftleri WCAG AA (gövde ≥4.5:1, büyük
başlık ≥3:1) için hesaplanıp doğrulandı — 36/36 çift geçti, detay ve
gerekçe `TASARIM-SISTEMI.md`'de. Tema, `prefers-color-scheme` yerine
`[data-theme="dark"]`'a bağlandı çünkü `tenants.theme_mode` panelden
seçilen açık bir ayar (VERİ-MODELİ.md), tarayıcı tercihi değil.

Token'lar henüz hiçbir gerçek bileşende kullanılmıyor — `components/site/`
hâlâ boş, `app/(site)/page.tsx` hâlâ `create-next-app` scaffold'ı. Bu iş,
sıradaki adım 3'ün (ilk bölüm bileşenleri) önkoşulu. Bu oturumda
commit'lendi.

**Tema mimarisi kuruldu (2026-08-08):** `docs/TEMA-MIMARISI.md` oluşturuldu
ve DB'den `<html>`'e tema enjeksiyonu koda döküldü. Yeni: `lib/theme/
presets.ts` (iki hazır ön ayar — "Kurumsal Mavi" varsayılan, "Modern Koyu"
— her ikisi de marka rengi/köşe yarıçapı/font taşıyor, ikisi de WCAG AA
doğrulandı), `lib/theme/resolve.ts` (preset + tenant'ın `site_settings.
primary_color` override'ını gerçek CSS değişkenlerine çevirir, serbest
renk için otomatik okunabilir metin rengi seçer), `lib/supabase/queries.ts`
→ `getSiteThemeSettings()` (şu an platform sahibinin tenant kaydını okuyor
— gerçek Host-bazlı tenant çözümlemesi yok, bilinçli geçici; Supabase
erişilemezse/`theme_preset` kolonu yoksa güvenli varsayılana sessizce
düşer). `app/layout.tsx` async Server Component'e çevrildi, `<html
data-theme style={...}>` olarak inline enjeksiyon yapıyor — FOUC yok,
`npm run build` sonrası üretilen HTML'de doğrulandı.

**Migration uygulandı, tipler yenilendi, uçtan uca doğrulandı (2026-08-08,
aynı gün):** Kullanıcı `20260808120000_add_theme_preset_to_site_settings.sql`'i
SQL Editor'de çalıştırdı ("Success"), sonra `npm run types:generate` ile
`types/database.types.ts`'e `theme_preset` alanı eklendi.
`getSiteThemeSettings()` bu yüzden tipsiz client'tan `createServiceRoleClient()`'e
taşındı, artık kullanılmayan `createUntypedServiceRoleClient()`
(`lib/supabase/server.ts`) kaldırıldı. Ayrıca `supabase/seed.sql`'e
platform sahibinin kendi tenant satırı eklendi (`is_platform_owner=true`,
bilinçli olarak `theme_mode='dark'` + `theme_preset='modern-koyu'` — varsayılan
değerlerle aynı olsaydı gerçek veri mi fallback mi geldiği ayırt
edilemezdi); toplam tenant sayısı 3 oldu (bkz. `VERİ-MODELİ.md`).

İlk `npm run build`'da hâlâ eski (fallback) sonuç geldi — sorun kodda değil,
**Next.js'in `.next` build cache'inin** DB'deki dış değişikliği
algılamamasıydı; `.next` silinip yeniden derlenince `<html
data-theme="dark" style="--color-brand:#24a8a4;...">` doğru şekilde geldi,
gerçek veriden geldiği doğrulandı (bir tanı script'iyle DB'nin doğru veriyi
döndürdüğü de ayrıca teyit edildi, sonra script silindi). Bu bulgu ve
prod'daki karşılığı (mimaride zaten var olan on-demand ISR,
`revalidatePath`/`revalidateTag`) `TEMA-MIMARISI.md` madde 6'ya eklendi. Bu
iş commit'lendi (`edac6ac`).

**İlk `components/ui/` bileşenleri kuruldu (2026-08-08):** `Button`
(primary/secondary/ghost × sm/md/lg, `disabled`/`isLoading`, gerçek
`<button>`), `Container`, `SectionHeader` (`headingLevel` dışarıdan
verilir), `TextField`/`TextareaField`/`SelectField` (label/hata/yardım
metni, `useId()` ile otomatik `htmlFor`/`id` bağı). Hepsi Server Component,
≤60 satır, token class'larıyla (hardcoded renk yok). Geçici vitrin:
`app/test-components/page.tsx`. Klavye ile doğrulandı (Tab sırası, odak
halkası, devre dışı buton atlanıyor). Kod ve kurallar
`docs/TASARIM-SISTEMI.md` madde 8-9'a işlendi. Bu iş commit'lendi.

**Hero bölümü + varyant deseni + Navbar kuruldu (2026-08-08, aynı gün):**
`components/site/hero/` — `types.ts` (veri arayüzü + `HeroVariant` union),
`HeroVariantA`/`B` (aynı veri, farklı düzen), `registry.ts`
(`Record<HeroVariant, Component>` — varyant seçimi tek burada çözülüyor),
`Hero.tsx` (çözümleyici). Yeni bölüm eklemek: 4 adım (types → varyant
bileşeni → registry satırı → resolver/sorgu), bkz. sohbet geçmişi.
`components/site/Navbar.tsx` + `MobileMenu.tsx` (kaydırınca zemin
değişimi, mobilde hamburger menü — odak tuzağı, Escape ile kapanma, body
scroll kilidi, kapanınca odak tetikleyiciye döner). Yeni:
`components/ui/LinkButton.tsx` (CTA'lar gezinme olduğu için gerçek `<a>`,
`Button`'a asChild eklenmedi), `lib/supabase/storage.ts` (`*_path` →
gerçek Storage URL'i), `next.config.ts`'e `images.remotePatterns`
(Supabase Storage host'u, `next/image` için zorunlu). Geçici doğrulama:
`app/test-sections/page.tsx` (Navbar + Hero, varyant A/B arası canlı geçiş
butonu). Yol boyunca 2 gerçek hata bulundu ve düzeltildi: `Container`'da
boş interface (ESLint), demo sayfasında iki varyantı üst üste
gösterirken oluşan `id="hero"` çakışması (geçersiz HTML — toggle'a
çevrilerek çözüldü). Bu iş commit'lendi (`b28dafe`).

Yeni bir migration yazıldı: `supabase/migrations/
20260808140000_add_hero_variant_and_secondary_cta.sql`
(`hero_sections.variant` + `secondary_cta_text`/`secondary_cta_link`) —
**henüz gerçek Supabase projesine uygulanmadı.**

**Hizmetler + Hakkımızda bölümleri kuruldu (2026-08-08, aynı gün):**
`components/site/services/` — Hero'daki 4 dosyalı desenle aynı
(`types.ts`, `ServiceCardIcon`/`ServiceCardImage` varyantları — aynı
veriyle, sadece düzen farklı —, `registry.ts`, `ServicesSection.tsx`).
`ServicesSection` kendi verisini kendi çeker (Server Component), sadece
`is_published=true` + `order_index` sırasıyla (DB sorgusunda, JS'te
değil); **kayıt yoksa `null` döner, bölüm hiç render edilmez** — bilinçli
tasarım kararı (boş alan bırakmak yerine). Veri çekme hatasında sayfa
çökmez, `console.error` ile sunucuya loglanır, boş dizi döner — bu,
gerçek migration henüz uygulanmadığı için build sırasında fiilen
tetiklendi ve doğrulandı ("column services.image_path does not exist"
hatası loglandı, sayfa yine de hatasız üretildi). Uzun başlık/açıklamada
kart bozulmasın diye `line-clamp-2`/`line-clamp-3` uygulandı, kasıtlı
aşırı-uzun bir örnek veriyle (`app/test-sections/page.tsx`, "Taşma
testi" bölümü) doğrulandı. Işıldayan ikonlar için **`lucide-react`
kuruldu** (kullanıcı onayıyla — demo verideki ikon isimleri zaten bu
kütüphaneyle birebir örtüşüyordu); `components/site/services/icons.tsx`
ikon adını bileşene eşliyor, bilinmeyen isim için `Wrench` yedek.

`components/site/about/AboutSection.tsx` — firma hikayesi, kuruluş yılı,
kısa değerler listesi, görsel; `about_sections`'tan geliyor, aynı
"kayıt yoksa render etme" ilkesiyle.

**Yol boyunca bulunan ve düzeltilen 3 gerçek sorun:** (1) `test-services`
silinince Next.js'in `.next` tip önbelleği bozuk referans verdi —
`.next` temizlenip çözüldü (aynı türden önceki `.next` cache bulgusuyla
tutarlı). (2) `ServiceCardIcon`'da `const Icon = ...; <Icon/>` deseni
`react-hooks/static-components` ESLint kuralını tetikledi (render
sırasında bileşen oluşturma riski) — ikon seçimi/render'ı küçük harfli
bir yardımcı fonksiyona (`renderServiceIcon`) taşınarak düzeltildi.
(3) `ComponentType` yanlışlıkla `lucide-react`'ten import edilmişti,
`react`'e düzeltildi.

**Şema kararı (kullanıcıya sorulmadan, gerekçeyle uygulandı):**
`services.image_path` ve `about_sections.core_values` (`text[]`) yoktu —
yeni migration: `supabase/migrations/
20260808150000_add_services_image_and_about_values.sql`. **Henüz gerçek
Supabase projesine uygulanmadı.**

Ayrıca yeni: `components/ui/Card.tsx` (genel amaçlı kart zemini —
Container'la aynı minimalist ilke, kendi iç düzen dayatmıyor).
`app/test-services/page.tsx` silindi (yerini gerçek `ServicesSection`
aldı). Bu iş commit'lendi (`010f607`) ve push'landı; migration'lar
uygulandı, tipler yenilendi, `getHeroSection()`/`getServices()`/
`getAboutSection()` tipli client'a taşındı (`createUntypedServiceRoleClient`
tamamen kaldırıldı).

**Projeler bölümü + kategori filtresi + detay penceresi kuruldu
(2026-08-08, aynı gün):** `components/site/projects/` — `types.ts`
(`ProjectItem`, `GalleryVariant` union: ızgara/mozaik), `ProjectCard.tsx`
(her iki galeri düzeninde de kullanılan TEK kart — `fill` prop'uyla sabit
oran/hücre-doldurma arasında geçiş), `ProjectsGridLayout`/
`ProjectsMosaicLayout` (mozaik gerçek CSS masonry değil, `auto-rows` +
her 5 projede bir 2x2 span veren, tüm tarayıcılarda çalışan bir grid
tekniği), `registry.ts`, `ProjectsSection.tsx` (Server Component — veriyi
çeker, kategori listesini `Array.from(new Set(...))` ile veriden türetir,
sabit yazılmaz), `ProjectsExplorer.tsx` (**"use client" — sunucu/istemci
sınırının çizildiği dosya**, sadece filtre + hangi projenin detay
penceresinde açık olduğu state'ini tutuyor, kendi veri çekmiyor),
`ProjectDetailModal.tsx` (büyük görsel, açıklama, künye — konum/yıl/
kategori — ve varsa `live_url` linki).

Filtre butonları `aria-pressed` ile seçili durumu ekran okuyucuya
bildiriyor, `role="group"` ile gruplanıyor; filtre değişince sayfa hiç
yeniden yüklenmiyor (React state). Kayıt yoksa/filtre sonucu boşsa
anlamlı mesaj var. `next/image`'da ilk 3 kart `priority`, gerisi
varsayılan (lazy).

**Yeni paylaşılan hook:** `lib/hooks/useDialogBehavior.ts` — odak tuzağı/
Escape/scroll kilidi mantığı `MobileMenu`'den çıkarılıp
`ProjectDetailModal`'la paylaşılan tek bir hook'a taşındı (bu ikisi
arasındaki tekrar, form alanlarındaki basit markup'ın aksine, karmaşık/
hataya açık olduğu için bilinçli olarak soyutlandı — `MobileMenu` de
retroaktif olarak buna geçirildi).

**Şema kararı (kullanıcıya sorulmadan, gerekçeyle uygulandı):**
`projects.category` ve `projects.description` yoktu (BAĞLAM "category,
cover_path, city" diyordu, gerçek şema `location`/`image_path` kullanıyor
ve kategori/açıklama hiç yoktu) — yeni migration: `supabase/migrations/
20260808160000_add_projects_category_and_description.sql`, ayrıca demo
verideki 8 Akme projesine gerçekçi kategori/açıklama backfill edildi
(filtreleme test edilebilsin diye). **Henüz gerçek Supabase projesine
uygulanmadı.**

**Lighthouse ölçümü yapıldı:** `npm run build` + `npm run start` ile
prod sunucu ayağa kaldırılıp `npx lighthouse` (yerel Chrome ile, headless)
`/test-projects` sayfasına karşı çalıştırıldı — Performance skoru **96**,
LCP 2.7s, CLS 0, toplam sayfa ağırlığı 253 KiB. **Önemli not:** görsel
isteği sayısı **0** çıktı çünkü Storage'da henüz hiç gerçek görsel yok
(`coverPath`/`image_path` hep `null`) — yani bu ölçüm şu an "görsellerin
etkisi yok" demiyor, "henüz hiç görsel yüklenmedi" diyor. Gerçek fotoğraf
eklenince yeniden ölçülmeli.

`npm run build`'da tutarlı biçimde sadece `getProjects()`'te (diğerlerinde
değil) bir "JWT issued at future" hatası gözlendi — izole bir script'le
doğrulandı, bu ortama özgü/geçici bir zamanlama tuhaflığı, kod hatası
değil (script'te aynı sorgu net/beklenen "column does not exist" hatasını
veriyor). Her iki durumda da mevcut hata yönetimi (catch/log/boş dön)
sayfayı çökertmeden karşılıyor.

**Migration uygulandı, tipler yenilendi, tipli client'a taşındı
(2026-08-08, aynı gün):** Kullanıcı `20260808160000_...` migration'ını
SQL Editor'de çalıştırdı, `npm run types:generate` çalıştırdı (bu sefer
bir token sorunu çıktı — `Unauthorized` hatası, sebebi eski/iptal
edilmiş token'ın veya token'ın yeni pencerede yeniden ayarlanmamasıydı;
yeni token oluşturulup çözüldü). `getProjects()` tipli
`createServiceRoleClient()`'e taşındı, `createUntypedServiceRoleClient()`
tekrar (üçüncü kez) tamamen kaldırıldı.

`npm run build`/`lint` temiz. Bu iş commit'lendi (`9b65905`) ve push'landı.

**Referanslar + İstatistikler + SSS bölümleri kuruldu (2026-08-08, aynı
gün):** `components/site/testimonials/` — 2 varyant: `TestimonialsGrid`
(mobilde yatay kaydırmalı/`snap-x`, masaüstünde ızgara — tek CSS düzeni,
JS yok) ve `TestimonialsFeatured` (tek büyük alıntı, ok butonlarıyla
referanslar arasında geçiş — veri kaybolmasın diye sadece ilkini
göstermek yerine). `components/site/stats/StatsSection.tsx` — sayılar
`Intl.NumberFormat("tr-TR")` ile Türkçe biçimde (binlik ayraç ".");
tamamen Server Component, etkileşim yok. `components/site/faqs/` —
`FaqAccordionItem` (gerçek `<button>`, `aria-expanded`/`aria-controls`/
`role="region"`, her öğe kendi state'ini tutar — birden fazla panel aynı
anda açık kalabilir; genişleme animasyonu `grid-template-rows` fr-birimi
tekniğiyle, JS yükseklik ölçümü gerekmez; `motion-reduce:` varyantı
`prefers-reduced-motion`'a saygı gösterir), `FaqList` (2. varyant —
"iki kolon" — native CSS `columns-2` ile, ayrı bir registry açılmadı
çünkü fark salt bir CSS class'ı, bkz. `TASARIM-SISTEMI.md` madde 9.8).
Hazır kütüphane kullanılmadı, sade React.

**Şema kararı (kullanıcıya soruldu, bu sefer gerçek bir mimari tercih
olduğu için — theme_preset/hero.variant gibi mekanik eklemelerden
farklı):** İstatistikler için hiç tablo yoktu. İki seçenek sunuldu:
mevcut tablolardan hesaplama (gerçek kayıt sayısına kilitli) vs. yeni bir
`stats` tablosu (panelden serbestçe girilen etiket+değer). **Kullanıcı
yeni tablo seçti** — gerçek kurumsal sitelerde bu rakamların genelde
pazarlama amaçlı yuvarlak sayılar olduğu, DB'deki gerçek kayıt sayısıyla
birebir örtüşmesi gerekmediği gerekçesiyle. Yeni migration:
`supabase/migrations/20260808170000_add_testimonial_logo_and_stats_table.sql`
— `testimonials.logo_path` (opsiyonel) + yeni `stats` tablosu (`label`,
`value` integer, `suffix` — RLS politikaları diğer liste tablolarıyla
birebir aynı desende). Platform tenant'a 3 örnek istatistik seed'lendi.
**Henüz gerçek Supabase projesine uygulanmadı.**

**Performans/erişilebilirlik ölçümü tamamlandı (gerçekten çalıştırıldı):**
`npm run build` + `npm run start` + yerel Chrome ile `npx @axe-core/cli`
`/test-social-proof` sayfasına karşı çalıştırıldı. **Gerçek bir kontrast
hatası bulundu ve düzeltildi:** kendi geçici "geçici doğrulama sayfası"
banner'larımda (`test-sections`/`test-projects`/`test-social-proof`)
kullandığım `bg-warning text-white` deseni, site şu an koyu temada
render olduğu için (`--color-warning` koyu değeri `#cb850b`'ye çözülüyor)
sadece **3.04:1** kontrast veriyordu (4.5:1 gerekli) — daha önce sadece
"warning metin olarak" senaryosu doğrulanmıştı, "warning dolgu + beyaz
metin" hiç test edilmemişti. Üç dosyada da `bg-warning`/`text-white` →
`border-b-2 border-warning bg-surface-raised text-text` yapılarak
düzeltildi (tema-bağımsız güvenli desen), tarama tekrarlanıp
doğrulandı (13 → 12 bulgu, kontrast ihlali kayboldu).

Kalan 12 bulgu (`landmark-one-main`, `page-has-heading-one`,
`landmark-unique` ×4, `region` ×6) **gerçek bileşen hatası değil, demo
sayfasının kendi yapısına özgü**: kök `app/layout.tsx`'te hiç `<main>`
yok (bilerek şimdi yamanmadı — Navbar şu an her sayfanın kendi içinde
render ediliyor, `<main>`'i `{children}`'a sarmak Navbar'ı yanlışlıkla
`<main>` içine alırdı; gerçek sayfa kompozisyonu/global layout
kurulduğunda doğru yapılmalı), demo sayfasında Hero olmadığı için `<h1>`
yok, ve aynı örnek SSS verisi karşılaştırma amacıyla sayfada İKİ KEZ
gösterildiği için (tek sütun + iki sütun varyant demosu) aynı soru
metnine sahip `role="region"` panelleri "eşsiz değil" olarak işaretlendi
— gerçek kullanımda bir SSS verisi sayfada bir kez görünür, bu sorun
oluşmaz.

**Lighthouse (önceki oturumdan, karşılaştırma için hatırlatma):**
Performance 96, görsel isteği 0 (henüz gerçek görsel yok) — bkz. önceki
kayıt.

**Migration uygulandı, tipler yenilendi, tipli client'a taşındı, gerçek
veriyle doğrulandı (2026-08-08, aynı gün, günün son işlemi):** Kullanıcı
`20260808170000_...` migration'ını SQL Editor'de çalıştırdı, `npm run
types:generate` hatasız tamamlandı. `getTestimonials()`/`getStats()`
tipli `createServiceRoleClient()`'e taşındı, `createUntypedServiceRoleClient()`
(ve onu kullanan import'lar) tamamen kaldırıldı — şu an hiçbir sorgu
fonksiyonu tipsiz client kullanmıyor. `npm run build` sonrası üretilen
`/test-social-proof` HTML'inde platform tenant'a seed'lenen 3 istatistik
gerçek veriden geldiği doğrulandı: "50+", "12+", **"1.200+"** (1200
değerinin Türkçe binlik ayraçla — nokta — doğru biçimlendiği görüldü).
`npm run build`/`lint` temiz.

**Bölüm sıralama/görünürlük sistemi + Ekip/Eylem Çağrısı/Footer + gerçek ana
sayfa kompozisyonu (2026-08-10):** Dışarıdan gelen bir yönerge üzerine:

- Yeni **`page_sections`** tablosu (sıra/görünürlük/varyant, tek kaynak —
  panel Faz 5'te buradan yazacak) + `lib/sections/config.ts` (tip güvenli
  `SectionKey` union'ı) + `lib/sections/registry.tsx` (`renderSection()` —
  bilinmeyen anahtar gelirse atlanır, sayfa çökmez).
- Yeni bölümler: **Ekip** (`components/site/team/`, 4 üye — 3 bilgisayar
  mühendisi + 1 elektrik mühendisi), **Eylem Çağrısı** (`components/site/
  cta/`, içerik `site_settings`'ten), **İletişim** (`components/site/
  contact/`, sadece statik bilgi — form yok, `app/api/contact/` beklemede),
  **Footer** (`components/site/Footer.tsx` — iletişim + bölüm linkleri +
  sosyal medya + telif, tel/mailto tıklanabilir).
- **`app/(site)/layout.tsx` eklendi** — Navbar+`<main>`+Footer artık burada
  (kök layout'ta değil), 2026-08-08'de bilerek ertelenen axe bulgusu
  (`landmark-one-main`) çözüldü. `generateMetadata()` ile `<title>`
  `site_settings.seo_title`'dan geliyor, create-next-app'in yer tutucu
  başlığı temizlendi. `app/(site)/page.tsx` artık gerçek `PageSections`
  bileşenini render ediyor (scaffold kaldırıldı).
- Eski geçici test sayfaları silindi: `app/test-sections/`,
  `app/test-social-proof/`, `app/test-projects/`.
- **Önemli mimari değişiklik:** Tüm `getXSection()` sorguları artık
  platform sahibinin satırı yerine **Akme İnşaat**'ı hedefliyor
  (`getActiveTenantId()`, domain'e göre sabit) — gerekçe: platform satırında
  gerçek demo içeriği hiç yok, Referanslar/SSS/Ekip/İstatistikler zaten
  PRD'ye göre sadece tenant sitelerinde bulunuyor. Detay: `KARAR-GUNLUGU.md`,
  2026-08-10.
- **Yapılmadı/soruldu:** Ekip fotoğrafları için gerçek/AI-üretilmiş insan
  görseli kullanılmadı (diğer tüm görseller gibi Storage yer tutucu yolu) —
  kullanıcıya soruldu.

**Doğrulama:** `npm run build`/`lint` temiz. Kullanıcı migration'ı
(`20260810120000_...`) Supabase SQL Editor'de çalıştırdı,
`npm run types:generate` yapıldı, `getPageSections()` tipli client'a
taşındı, geçici `createUntypedServiceRoleClient()` kaldırıldı — gerçek ana
sayfa (tüm 10 bölüm, Akme İnşaat verisiyle) gözle doğrulandı. Ayrıca aynı
oturumda gerçek sayfa incelenirken 2 gerçek hata daha bulunup düzeltildi:
Akme'nin `site_settings.primary_color`'ı (tasarım sisteminden ÖNCEKİ bir
yer tutucu, neredeyse siyah `#0f172a`) tasarlanan marka mavisini
eziyordu — `null`'a çekildi (migration:
`20260810140000_reset_akme_primary_color.sql`); `app/globals.css`'teki
`body` seçicisi hâlâ create-next-app'in `font-family: Arial...` varsayılanını
kullanıyordu, tasarlanan Geist Sans/Manrope hiç devrede değildi — `var(--font-sans)`
kullanacak şekilde düzeltildi. İstatistikler bölümü için de Akme'ye örnek
veri eklendi (`20260810130000_add_stats_for_akme.sql`) — eski örnek veri
sadece platform tenant'ındaydı.

**Panel kimlik doğrulaması kuruldu (2026-08-10, aynı gün, dışarıdan gelen
ikinci bir yönerge üzerine):** Supabase Auth, e-posta/şifre, kayıt kapalı,
tek admin hesabı (Dashboard'dan elle oluşturulan/kullanılan
`oguzhanbckc@gmail.com`). Üç ayrı istemci —
`lib/supabase/client.ts` (tarayıcı), `lib/supabase/server.ts`'e eklenen
`createServerSupabaseClient()` (sunucu), `lib/supabase/proxy.ts` +
kök **`proxy.ts`** (Next.js 16'da `middleware.ts`'in yeni adı — bkz.
`KARAR-GUNLUGU.md`). `app/panel/giris/page.tsx` (herkese açık giriş
sayfası, tasarım sistemi bileşenleriyle) + `app/panel/(protected)/`
route group'u (`layout.tsx` — bağımsız ikinci bir `getUser()` kontrolü +
e-posta/çıkış göstergesi, `page.tsx` — eski `app/panel/page.tsx`
placeholder'ının yeni yeri). `docs/GUVENLIK.md`'ye Kimlik Doğrulama Akışı/
Oturum Yönetimi/Admin Hesabı Yönetimi bölümleri eklendi. 3 doğrulama testi
(girişsiz erişim engeli, yanlış şifre, tam giriş+çıkış akışı) elle
çalıştırılıp geçti. `npm run build`/`lint` temiz.

**İletişim formu + doğrulama şeması + duyarlı tasarım denetimi
(2026-08-11):** `lib/validation/contact.ts` — zod ile tek doğrulama
şeması (ad soyad/e-posta/telefon [opsiyonel]/konu/mesaj, PRD'nin ötesine
genişledi — bkz. `KARAR-GUNLUGU.md`), React'ten bağımsız, hem
`ContactForm.tsx` (istemci) hem `actions.ts` (Server Action, gerçek
sunucu doğrulaması) aynı şemayı kullanıyor. Form durumları
(`useActionState`): gönderiliyor (buton devre dışı + metin değişir),
başarılı (form temizlenir + teşekkür mesajı), başarısız (alan bazlı hata
+ ekranın üstünde bir hata ÖZETİ, ikisi de `role="alert"`/
`aria-describedby` ile duyurulur, hata rengi her zaman metinle birlikte).
`ContactSection` iki sütuna bölündü: iletişim bilgisi (adres+harita linki,
telefon, e-posta, çalışma saatleri — yeni `working_hours` kolonu) +
form. **Harita gömülmedi** (performans/KVKK gerekçesiyle, bkz.
`KARAR-GUNLUGU.md`) — sadece Google Maps'e giden bir link var; ileride
görsel bir "tat" isteniyorsa JS'siz bir statik harita görseli (Google/
Mapbox Static Maps API, tek `<img>`) değerlendirilebilir.

Ayrıca site geneli 3 ekran boyutunda (mobil/tablet/masaüstü) kod
seviyesinde bir duyarlı tasarım denetimi yapıldı (gerçek tarayıcı testi
değil — bu ortamda tarayıcı aracı `localhost`'a erişemiyor). 2 sorun
bulunup düzeltildi (`Navbar`'ın masaüstü menüsü `sm:`→`lg:` breakpoint'ine
taşındı — 7 bağlantıya kadar çıkabildiği için tablet genişliğinde taşma
riski vardı; proje detay penceresindeki 3 sütunlu ızgara dar telefonlarda
tek sütuna düşecek şekilde düzeltildi). Detay: `TEST-STRATEJISI.md` madde
8 (yeni "Ziyaretçi Sitesi Manuel Test Kontrol Listesi").

**Doğrulama:** `zod` kuruldu, migration (`20260811120000_...`) uygulandı,
duyarlı tasarım bulguları kullanıcı tarafından gerçek tarayıcıda teyit
edildi ("çalışıyor, sorun yok").

**Rota koruma katmanları + panel kabuğu + özet ekranı (2026-08-12):**
`proxy.ts`'e "next" parametresi (girişten sonra asıl istenen sayfaya
dönüş) + `lib/utils.ts`'teki `getSafeRedirectPath()` ile açık yönlendirme
koruması eklendi. `components/panel/PanelShell.tsx` — kenar menüsü
(masaüstü sabit, mobilde açılır) + üst başlık; ziyaretçi sitesinden
Navbar/Footer olmadan, sadece yapısal olarak ayrı ama aynı tasarım
token'larıyla (bkz. `KARAR-GUNLUGU.md`). `app/panel/(protected)/page.tsx`
artık gerçek bir özet ekranı (hizmet/proje/okunmamış mesaj sayıları),
`mesajlar/page.tsx` gerçek mesaj listesi; `icerikler/medya/tema/ayarlar`
Faz 5'e bırakılan placeholder'lar. Yeni `lib/supabase/panelQueries.ts` —
panel sorguları için ayrı dosya, `createServiceRoleClient` değil
`createServerSupabaseClient` kullanıyor (en az yetki ilkesi). Migration:
`20260812120000_add_contact_messages_is_read.sql`.

**Gerçek yetkisiz erişim testi (curl ile, kod incelemesi değil):** Çalışan
sunucuya çerezsiz istekler atıldı — 4/4 test geçti (girişsiz `/panel` ve
`/panel/mesajlar` sıfır veri sızdırmadan `/panel/giris`'e yönlendiriyor,
giriş sayfası kendi kendine döngü yapmıyor, `next` parametresi doğru
taşınıyor). Detay: `GUVENLIK.md` madde 8-9.

`npm run build`/`lint` temiz, `is_read` migration'ı kullanıcı tarafından
uygulandı.

**Ekip ve İletişim ayrı sayfalara taşındı (2026-08-13):** Kullanıcı tek
sayfalı ana sayfanın karmaşık hissettirdiğini belirtti. Akme'nin
`page_sections`'ından `team`/`contact` satırları silindi (migration:
`20260813120000_split_team_contact_into_pages.sql`), yeni
`app/(site)/ekip/page.tsx` ve `app/(site)/iletisim/page.tsx` eklendi
(bileşenlerin kendisi değişmedi, sadece konumları). Eylem Çağrısı
butonu artık `/iletisim`'e gidiyor. Navbar/Footer'ın ortak
`buildSectionNavLinks()`'i artık karışık bir liste üretiyor: ana sayfada
kalan bölümler için `/#çapa` (başka sayfadan tıklanınca da çalışsın diye
sadece `#çapa` değil), Ekip/İletişim için gerçek `/ekip`/`/iletisim`
linkleri. `Navbar`/`MobileMenu`'deki iç linkler `next/link`'in `Link`'ine
çevrildi (Next.js'in `no-html-link-for-pages` kuralı gerçek bir sayfaya
giden düz `<a>`'yı yakaladı — artık kısmen çok sayfalı bir site).
Gerçek sunucuda `curl` ile doğrulandı (bkz. `KARAR-GUNLUGU.md`).

**Hizmet/Proje ekleme: sunucu eylemi, doğrulama, önbellek tazeleme
(2026-08-14):** `app/panel/(protected)/icerikler/` artık gerçek —
Hizmetler ve Projeler için liste tablosu (başlık/durum/sıra, "Düzenle"
bilinçli olarak devre dışı) + ekleme formu + sunucu eylemi. Şema
(`lib/validation/service.ts`/`project.ts`, zod) hem istemcide hem
sunucuda aynı; eylemler oturumu kendi içinde kontrol ediyor
(`requireAdminUser()`), DB hatasını ham göstermeden loglayıp Türkçe bir
mesaja çeviriyor, başarıda `revalidatePath("/")` çağırıyor. Paylaşılan
parçalar (`SubmitButton`, `FormErrorSummary`, `AdminListTable`,
`StatusBadge`, `ActionResult<T>`) İletişim formuyla da (retroaktif
refactor) ortak. Şema değişikliği yok, migration gerekmedi. Uçtan uca
gerçek bir `curl` testiyle doğrulandı (revalidate öncesi/sonrası fark
gösterildi) — detay `MIMARI.md` madde 9-10, `KARAR-GUNLUGU.md`.

**Hizmetler/Projeler'e düzenleme ve silme eklendi (2026-08-14, aynı
gün):** `getServiceById`/`getProjectById` + `update*Action`/
`delete*Action` (aynı auth/doğrulama/hata kuralları) +
`components/panel/DeleteButton.tsx` (onaylı silme). "Düzenle" artık
gerçek bir sayfa (`[id]/page.tsx`), aynı `<X>Form.tsx` bileşeni hem
ekleme hem düzenleme modunda çalışıyor. Script + `curl` ile doğrulandı;
yeni `[id]` rotalarının da mevcut proxy korumasından otomatik geçtiği
ayrıca teyit edildi. Detay: `KARAR-GUNLUGU.md`.

**Silme onayı güçlendirildi, yayınla/sırala eklendi, Referanslar/SSS/Ekip
için panel CRUD tamamlandı (2026-08-14, aynı gün, üçüncü oturum):**
Dışarıdan gelen bir yönerge üzerine, Hizmetler/Projeler'deki içerik
yönetimi deseni hem güçlendirildi hem 3 yeni içerik türüne genişletildi:

- **Silme onayı** artık native `window.confirm()` değil, yeni
  `components/panel/ConfirmDeleteDialog.tsx` — kaydın gerçek adını
  gösteren, `useDialogBehavior` (MobileMenu/ProjectDetailModal ile
  paylaşılan) ile odak tuzağı/Escape'i olan, kazara silmeyi azaltan 2
  önlemli (adı gösteren metin + varsayılan odağın "Vazgeç"te olması) özel
  bir dialog. `Button`'a yeni bir `danger` varyantı eklendi (kenarlık+metin,
  dolgu değil — "ayrışsın ama korkutmasın").
- **Yayınla/Taslağa Al**, listeden tek tıkla (`components/panel/
  PublishToggleButton.tsx`, her varlık için `toggleXPublishedAction`).
- **Sıralama**, yukarı/aşağı butonlarıyla (`components/panel/
  ReorderButtons.tsx`, paylaşılan `swapOrderIndex()` — `lib/supabase/
  panelQueries.ts`), sürükle-bırak yok.
- **"Değişiklik yoksa yazma yapma"** — her `update*Action` artık mevcut
  kaydı çekip karşılaştırıyor, fark yoksa DB'ye hiç yazmıyor.
- **Referanslar/SSS/Ekip** için panel CRUD (liste + ekle + düzenle + sil +
  yayınla + sırala) Hizmetler/Projeler'le birebir aynı 5 parçalı desende
  tamamlandı (`app/panel/(protected)/icerikler/{referanslar,sss,ekip}/`)
  — **hiçbir yeni migration gerekmedi**, RLS/şema zaten 2026-08-07'den
  beri hazırdı. **Ekip'in revalidate hedefi `/ekip`** (diğerleri `"/"`) —
  2026-08-13'te ayrı sayfaya taşındığı için, kolay gözden kaçan bir
  ayrıntı, bilerek doğru yapıldı. `icerikler/page.tsx` artık 5 kart
  gösteriyor.

**Doğrulama (gerçek, servis-rolü script + `npm run dev` + `curl` ile):**
Ekip'te iki üyenin sırası değiştirilip `/ekip`'te gösterim sırasının
gerçekten değiştiği, bir referans taslağa alınıp ana sayfadan kaybolup
tekrar yayınlanınca geri geldiği, geçici bir SSS kaydının eklenip
görünüp silinince kaybolduğu doğrulandı — hepsi sonra orijinal veriye
geri alındı. Yeni panel rotalarının proxy korumasından geçtiği de
teyit edildi. `npm run build`/`lint` tamamen temiz (0 hata, 0 uyarı).
Detay: `KARAR-GUNLUGU.md`.

**Yapılamayan:** Tarayıcı aracı bu ortamdan `localhost`'a erişemediği
için dialog'un gerçek görsel/klavye davranışı tarayıcıda elle
doğrulanmadı — kullanıcıdan panelde kısa bir deneme rica ediliyor.
Ziyaretçi sitesi (`components/site/`) hiç değişmediği için
`TEST-STRATEJISI.md` madde 8'deki duyarlı tasarım kontrol listesi
yeniden koşulmadı (regresyon riski yoktu, gerekçe `KARAR-GUNLUGU.md`'de).

**`docs/MUSTERİ-KILAVUZU.md` oluşturuldu (2026-08-14, aynı gün, dördüncü
oturum):** Panelin gerçek kullanıcısına (teknik olmayan) yönelik, geliştirici
terimi içermeyen bir kullanım kılavuzu — İçerik Ekleme, İçerik Düzenleme,
Yayınlama ve Taslak, Sıralama Değiştirme ve Silme başlıklarıyla + bölüm
bazlı alan farkları tablosu. İçerik, bir önceki oturumda yazılan gerçek
UI metinleriyle (buton etiketleri, onay mesajları) birebir eşleşecek
şekilde yazıldı — uydurulmadı. Detay ve gerekçe: `KARAR-GUNLUGU.md`.

**Navbar'daki çift "İletişim" düzeltildi (2026-08-14, aynı gün):**
Kullanıcı arayüzde fark etti — nav linkleri listesindeki sade "İletişim"
metni ile yanındaki dolgulu CTA butonu aynı adrese (`/iletisim`)
gidiyordu, görsel tekrar. `components/site/Navbar.tsx`'te, CTA
butonuyla aynı `href`'e sahip link menü listesinden filtrelendi
(`menuLinks`) — hem masaüstü hem mobil menüde (aynı listeyi paylaşıyor)
düzeldi. `lib/sections/config.ts`/`Footer.tsx`'e dokunulmadı (Footer'da
bu tekrar yok, kapsam dışı). `npm run build`/`lint` temiz, gerçek
sunucuda `curl` ile doğrulandı (header'da tek "İletişim" kaldı).

**Proje görselleri: Storage bucket + yükleme akışı + medya kütüphanesi
(2026-08-14, aynı gün, beşinci oturum):** Dışarıdan gelen bir yönerge üzerine, panelde Projeler için
gerçek görsel yükleme kuruldu. Araştırmada önemli bir bulgu ortaya
çıktı: **hiçbir Storage bucket'ı kurulmamıştı** — DB'deki 6 farklı
`*_path` kolonu ve site tarafındaki 8 görüntüleme bileşeni zaten 6 ayrı
bucket adı (`projects`/`services`/`hero`/`about`/`testimonials`/`team`)
bekliyordu ama hiçbiri Supabase'de yoktu. Bu görev **sadece
`"projects"` bucket'ını** kurdu (kullanıcının açık talebi Projeler'e
özeldi), diğer 5'i açık madde (bkz. aşağıda).

- Yeni `supabase/migrations/20260814120000_create_projects_storage_bucket.sql`
  — bucket (public) + `storage.objects` RLS (mevcut 5-policy desenle
  birebir aynı, bkz. `GUVENLIK.md` madde 11).
- `lib/supabase/imageValidation.ts` — tür kontrolü SADECE dosyanın
  gerçek baytlarına (magic number) bakıyor, uzantıya/MIME header'ına
  güvenmiyor; 5 MB boyut sınırı.
- `app/panel/(protected)/icerikler/projeler/imageActions.ts` —
  `uploadProjectImageAction`/`deleteProjectImageAction`: benzersiz
  (`crypto.randomUUID()`) ve kullanıcı girdisinden tamamen bağımsız
  dosya adı (path traversal yapısal olarak imkansız), DB yazması
  başarısız olursa yüklenen dosya geri silinir (yarım kayıt kalmaz).
- `ProjectImageUploader.tsx` — sadece proje DÜZENLEME sayfasında (dosya
  seç → önizle → yükle, durum göstergesi).
- `app/panel/(protected)/medya/` — eski placeholder artık gerçek Medya
  Kütüphanesi (önizleme + dosya adı + kullanıldığı proje + Sil — mevcut
  `DeleteButton`/`ConfirmDeleteDialog` hiç değiştirilmeden yeniden
  kullanıldı).
- `next.config.ts`'e **iki** transport-katmanı ayarı eklendi —
  `experimental.serverActions.bodySizeLimit: "15mb"` VE
  `experimental.proxyClientMaxBodySize: "15mb"` (ikincisi ilk denemede
  unutulmuştu, aşağıdaki bulguya bakın).
- Docs güncellendi: `GUVENLIK.md` (yeni madde 11-12, kullanıcının önceki
  oturumdaki "Storage politikaları/dosya yükleme kuralları başlığı ekle"
  isteği de böylece karşılandı), `VERİ-MODELİ.md`, `MIMARI.md` (yeni
  madde 11), `MUSTERİ-KILAVUZU.md` ("Görsel Ekleme" başlığı).

**Test sırasında bulunan ve düzeltilen gerçek bir hata:** Gerçek
~10MB'lık bir test dosyasıyla (kullanıcının açık isteği) denendiğinde,
ilk seferde `HTTP 500` + bozuk gövde hatası çıktı — sebep,
`serverActions.bodySizeLimit`'ten TAMAMEN BAĞIMSIZ çalışan, kök
`proxy.ts`'in kendi 10MB'lık istek gövdesi tamponlama sınırıydı
(`experimental.proxyClientMaxBodySize`, unutulmuştu). İkisi de 15mb'a
çekilince düzeldi — detay `GUVENLIK.md` madde 12.4, `KARAR-GUNLUGU.md`.

**Doğrulama (gerçek, tamamlandı):** Kullanıcı migration'ı SQL Editor'de
çalıştırdı. RLS testi (anon reddedildi, authenticated başarılı) + 5
senaryolu uygulama testi (geçerli ~2MB görsel → başarı; gerçek ~10MB
görsel → net red mesajı; sahte uzantı → red; kötü niyetli dosya adı →
path'e hiç karışmadı; DB yazma hatası → Storage'da yetim kalmadı) hepsi
gerçek Supabase Storage'a karşı geçti. Test verileri temizlendi, geçici
route/script'ler silindi. `npm run build`/`lint` temiz. Detay:
`KARAR-GUNLUGU.md`.

**İletişim formu gerçek kayıt + Mesajlar ekranı genişletmesi (2026-08-14,
aynı gün, altıncı oturum):** Dışarıdan gelen bir yönerge `leads` adında
var olmayan bir tablodan bahsediyordu — araştırmayla doğrulanıp gerçek
`contact_messages` tablosuna (mekanik reconciliation, projenin
tekrarlayan bir deseni) yönlendirildi:

- Yeni migration `20260814130000_add_contact_message_email_subject.sql`
  — `contact_messages`'a nullable `sender_email`/`subject` kolonları
  ekliyor + mevcut 2 demo satırı gerçekçi değerlerle dolduruyor. **Henüz
  kullanıcı tarafından SQL Editor'de çalıştırılmadı** (bekleme noktası,
  önceki büyük görevlerle aynı desen).
- `components/site/contact/actions.ts`'teki `submitContactForm` artık
  doğrulama sonrası `contact_messages`'a gerçek bir `insert` yapıyor
  (route handler değil, mevcut Server Action deseni — `GUVENLIK.md`'nin
  eski notu düzeltildi, bkz. `KARAR-GUNLUGU.md`).
- `app/panel/(protected)/mesajlar/[id]/page.tsx` — mesaj detayı (tam
  metin, gönderen bilgileri, "E-posta ile Yanıtla" `mailto:` linki) +
  yeni `MarkMessageReadOnView.tsx` (görünmez client bileşen, sayfa
  açılınca `markMessageReadAction`'ı bir kez tetikleyip otomatik okundu
  işaretliyor — çıplak DB yazması yerine yine auth kontrollü bir Server
  Action üzerinden).
- Panel menüsünde (`PanelShell`/`NavList`) okunmamış mesaj sayacı —
  `(protected)/layout.tsx` her sayfada `getUnreadMessagesCount()`'u
  çekip prop olarak geçiyor, kullanıcı panele hangi sayfadan girerse
  girsin görüyor.
- **Geçici tipsiz Supabase client'lar** — kullanıcı migration'ı çalıştırdı,
  `npm run types:generate` ile tipler yenilendi, `createUntypedServiceRoleClient`/
  `createUntypedServerSupabaseClient` kaldırıldı, 3 kullanım yeri gerçek
  tipli client'lara geri taşındı (bkz. `KARAR-GUNLUGU.md`).

**Uçtan uca akış testi (tamamlandı):** `curl` + geçici bir ayna rota +
servis-rolü script'leriyle gerçek Supabase'e karşı doğrulandı: ziyaretçi
gönderimi → `contact_messages`'ta gerçek satır → okunmamış sayısı arttı
→ okundu işaretleme → okunmamış sayısı 2'den 1'e düştü. Panelin gerçek
arayüzünden tıklayarak test edilemedi (bu ortamda tarayıcı aracı
`localhost`'a erişemiyor, test admin şifresi de yok) — bunun yerine
`markMessageReadAction`'ın birebir aynı DB sorgusu doğrulandı, auth
kapısı (`requireAdminUser`) ayrıca kod incelemesiyle teyit edildi.
Detay: `KARAR-GUNLUGU.md`.

**Panel gözden geçirmesi (aynı gün, workflow ile çok boyutlu tarama):**
Panelin 19 sayfası buton/link tutarlılığı, boş durumlar, kırık linkler
ve erişilebilirlik açısından tarandı (11 ajan, keşif + bağımsız
doğrulama). 7 olası bulgudan 5'i gerçek çıktı, hepsi bu oturumda
doğrudan düzeltildi:

- Özet ekranındaki "Tema ayarlarını değiştir →" linki → "Tema ayarları
  (yakında) →" (hedef sayfa hâlâ placeholder, "değiştir" fiili boş bir
  vaat veriyordu).
- `navItems.ts`'teki eski yorum ("sayfaların çoğu placeholder") güncel
  duruma göre düzeltildi — panelin 6 nav öğesinden artık sadece 2'si
  (Tema, Ayarlar) placeholder.
- **Erişilebilirlik:** `PublishToggleButton`/`ReorderButtons`'taki sabit
  `aria-label`'lar, Button.tsx'in pending sırasında eklediği "Yükleniyor"
  sr-only metnini ekran okuyucudan tamamen gizliyordu (ARIA accname
  kuralı gereği aria-label her zaman içeriği ezer). Tek noktadan
  (`components/ui/SubmitButton.tsx`) düzeltildi: pending iken gelen
  aria-label bastırılıp accessible name içerikten (pendingLabel +
  sr-only metin) türetiliyor — iki bileşenin de ayrı ayrı değişmesine
  gerek kalmadı.
- Mobil panel menüsü (`PanelShell.tsx`) `role="dialog" aria-modal="true"`
  taşıyordu ama arka plandaki sayfa içeriği ekran okuyucunun tarama
  modundan (sanal imleç) gizlenmiyordu — `inert` attribute'u eklendi.
- (Reddedilen 2 bulgu: Mesajlar/Medya sayfalarındaki boş-durum
  metinlerinin fiil seçimi diğer listelerden farklıydı ama anlamca doğru
  ve kasıtlıydı — kozmetik, düzeltilmedi.)

**Mentör gibi proje değerlendirmesi (aynı gün, ayrı bir workflow ile):**
Kullanıcının isteğiyle kod tabanı + docs bütünlüğü + güvenlik + kapsam
açısından geniş bir değerlendirme yapıldı, kullanıcıya doğrudan
raporlandı. İki sistemik bulgu: **test altyapısı hâlâ sıfır** (Vitest/
Playwright kurulu değil, yukarıdaki "Sıradaki adım" madde 2 ile aynı,
öncelik yüksek) ve docs-kod senkron borcu (bu oturumda kısmen kapatıldı).
Küçük-orta bulgular (kullanıcıya karar için sunuldu, henüz uygulanmadı):
`ActionResult<T>` tipinin `toggle*/move*` eylemlerinde kullanılmaması
tutarsızlığı, `panelQueries.ts`'in büyümesi (~706 satır), geçici tipsiz
client'lar. İyi yapılmış bulunanlar: RLS/auth tutarlılığı, kapsam
disiplini (spekülatif genelleme yok).

**Tema Ayarları ekranı: marka rengi, WCAG kontrast koruması, canlı
önizleme, logo/favicon, site kimliği (2026-08-15, yeni oturum):**
`/panel/tema` artık gerçek bir form — dışarıdan gelen bir yönerge üzerine,
`/panel/tema`'nın statik placeholder'ı gerçek bir tema editörüne
dönüştürüldü. Kapsamlı bir özellik, plan modunda tasarlandı (kullanıcıyla
2 mimari kararı netleştirdikten sonra: köşe yarıçapı serbest piksel değil
hazır ölçek seçimi, font ailesi 2 yerine 5 seçenekli next/font yüklemesi).

- **`lib/theme/contrast.ts` (yeni, saf modül):** WCAG kontrast oranına
  dayalı `pickReadableTextColor`/`getContrastRatio`/`checkContrastWarning`
  — eski `pickReadableOnColor` (kaba luminance sezgisi) silindi. **Gerçek
  bir hata bulundu ve düzeltildi:** eski kod `#808080` orta gri için
  yanlışlıkla beyaz metin öneriyordu (gerçek oran 3.95:1, AA eşiğinin
  altında); yeni kod doğru şekilde siyahı seçiyor (5.32:1). KABUL
  KRİTERİ'ndeki 3 renk gerçek hesapla doğrulandı (bkz. `KARAR-GUNLUGU.md`).
- **Köşe yarıçapı/font artık `theme_preset`'ten BAĞIMSIZ, `primary_color`
  ile aynı override deseninde** (`site_settings.border_radius_scale`/
  `font_family_key`, nullable) — 3 hazır radius ölçeği, 5 font (Inter/
  Poppins/Work Sans yeni eklendi, `app/layout.tsx`'e build-time).
- **Canlı önizleme:** `ThemeEditor.tsx` (client, form state) + gerçek
  `resolveThemeTokens()`'ı kullanan `ThemePreview.tsx` — izole bir
  `<div style>` içinde gerçek `Button`/kart/başlık render ediyor, gerçek
  `<html>`'e dokunmadan.
- **İkincil renk artık kullanılıyor:** yeni `--color-accent`/`-on` token
  çifti (boşken nötr, sıfır regresyon), `Button`/`LinkButton`'a `accent`
  varyantı, `CtaSection`'ın butonu buna geçirildi.
- **Logo/favicon:** yeni `"branding"` Storage bucket'ı (`"projects"`in
  aynısı), `BrandImageUploader.tsx` (generic markup, ayrı sunucu
  eylemleri). Navbar logosuz kurulumda AYNEN eski (sadece metin) davranışı
  koruyor — regresyon yok.
- **Site kimliği:** firma adı (`tenants.name`, zaten vardı) + yeni
  `slogan` + iletişim (`contact_sections` — Footer/İletişim'in ZATEN
  okuduğu tablo, form BURAYA yazıyor) + sosyal medya (`site_settings.*`,
  zaten vardı/render ediliyordu, sadece form eklendi).
- **Temizlik:** `site_settings.contact_email`/`contact_phone` — 2026-08-06'dan
  beri hiç okunmayan ölü kolonlar, aynı migration'da düşürüldü.
- Migration `20260815120000_add_theme_settings_and_branding.sql` —
  kullanıcı tarafından SQL Editor'de çalıştırıldı, `npm run
  types:generate` ile tipler yenilendi, geçici tipsiz client'lar
  kaldırılıp gerçek tipli client'lara geri taşındı.

**Uçtan uca akış testi (tamamlandı):** `curl` + servis-rolü script'iyle
gerçek dev sunucusuna karşı doğrulandı — marka rengi/ikincil renk/köşe
yarıçapı/font/slogan değiştirildi, `curl` ile site yeniden çekilip
`<html style>`'ın ve Footer/CTA'nın gerçekten değiştiği teyit edildi
(`--color-brand`, `--radius-*`, `--font-sans`, `--color-accent` hepsi
doğru), kontrast hesapları bağımsız olarak da doğrulandı, test verisi
orijinaline geri alındı. Detay: `KARAR-GUNLUGU.md`.

`npm run lint`/`npx tsc --noEmit`/`npm run build` hepsi temiz.

**Bölüm Yönetimi ("Sayfa Düzeni") ekranı (2026-08-15, aynı gün, yeni
oturum):** `/panel/sayfa-duzeni` (yeni rota — `/panel/tema` zaten marka
rengi/radius/font ekranı olduğu için bu, Faz 5'in "bölüm sırası/görünürlük/
varyant" kısmına AYRI bir yeni rota) artık `page_sections`'ı gerçekten
yönetiyor:

- Her bölüm kendi kartında: yukarı/aşağı sıralama (`ReorderButtons`, hiç
  değişmeden yeniden kullanıldı), "Gizle"/"Göster" görünürlük butonu
  (yeni `SectionVisibilityToggleButton`), ve (varsa) varyant seçimi.
- **Varyant seçimi:** Sadece 5/10 bölümün (hero/services/projects/
  testimonials/faq) gerçekten birden fazla görünümü olduğu KOD OKUNARAK
  doğrulandı (seed verisine güvenilmedi — 3 bölümün "gizli" ikinci
  varyantı vardı: projects="mosaic", testimonials="featured",
  faq="two-column", hiçbiri seed'de kullanılmıyordu). Her seçenek küçük
  bir inline SVG şema + müşteri dilinde etiket (ör. "Tam Ekran Görsel")
  ile gösteriliyor, tıklanınca anında kaydediliyor.
- **Navbar/Footer** gerçek `page_sections` satırı DEĞİL (PRD.md'nin
  bilinçli kararı — chrome, bölüm kütüphanesinin parçası değil) — ekranda
  sadece görsel/statik, devre dışı butonlu iki "sözde satır" olarak
  gösteriliyor, şemaya hiç dokunulmadı.
- **"Siteyi Önizle"** linki, yeni sekmede ziyaretçi sitesini açıyor.
- **Gerçek bir bug bulundu ve düzeltildi:** `testimonials` varyantı DB'den
  hiç doğrulanmadan (`lib/sections/registry.tsx`'te ham cast) kullanılıyordu
  — hero'nun aksine, geçersiz bir değer (elle DB düzenlemesi) anasayfayı
  çökertebilirdi (registry lookup `undefined` component döner). Yeni
  `isTestimonialsVariant()` eklendi (hero'daki desenle aynı).
- **5 kombinasyon testi** (gerçek dev sunucusu + `fetch`, servis-rolü
  script'iyle): orijinal seed, tüm varyantlar alternatifte, yarısı gizli +
  sıra tersine, tüm varyantlar `null`, ve **whitelist-dışı bir varyant
  değeri (`"legacy-carousel"`) doğrudan DB'ye yazılıp** — 5/5 senaryoda
  `/` (ve bir senaryoda `/ekip`/`/iletisim`) 200 döndü, son senaryo bug
  fix'ini gerçek bir HTTP isteğiyle kanıtladı. Test verisi orijinaline
  geri alındı.

`npm run lint`/`npx tsc --noEmit`/`npm run build` hepsi temiz.
`docs/MUSTERİ-KILAVUZU.md`'ye "Sayfa Düzeni Değiştirme"/"Bölüm
Varyantları"/"Tema Ayarları" başlıkları eklendi (sonuncusu: önceki
oturumda kodlanan Tema ekranı hiç dokümante edilmemişti, bu görev o
eksiği de kapattı).

**Tema önayarları + Varsayılana Dön + SEO Ayarları ekranı (2026-08-16,
aynı gün, yeni oturum):** Faz 5'in son açık maddesi (preset SEÇİMİ
arayüzü) kapandı, artık `/panel/tema`'da:

- **Tema Önayarları:** "Kurumsal Mavi"/"Modern Koyu" için birer "Uygula"
  butonu (küçük renk örneği önizlemeli) — onay penceresi ("mevcut
  ayarlarınız silinecek" uyarısıyla) sonrası `applyThemePresetAction`
  `theme_preset`'i değiştirip 4 override kolonunu (primary_color,
  secondary_color, border_radius_scale, font_family_key) null'a çekiyor
  — override'lar temizlenmezse önayar seçimi görünürde hiçbir şey
  değiştirmezdi (hâlâ dolu override'lar tarafından gölgelenirdi).
- **Varsayılana Dön:** Aynı eylemi `kurumsal-mavi` (`DEFAULT_THEME_PRESET`)
  ile çağıran, "kurtarma" çerçeveli ayrı bir buton — sadece Marka
  alanlarını sıfırlıyor, Site Kimliği/İletişim/Sosyal Medya/Logo/Favicon'a
  dokunmuyor.
- Yeni genel `components/panel/ConfirmActionDialog.tsx` —
  `ConfirmDeleteDialog`'un "Sil" diline kilitli OLMAYAN, genel onaylı-eylem
  hâli (title/description/confirmLabel/confirmVariant).
- **Gerçek bir React tuzağı çözüldü:** `ThemeEditor.tsx`'in renk/radius/
  font `useState`'leri sadece ilk mount'ta okunuyor, bir Server Action
  sonrası kendiliğinden güncellenmiyor — önayar/varsayılan uygulanınca
  `window.location.reload()` ile tam sayfa yenileme yapılıyor (state
  senkronizasyon karmaşıklığı yerine, nadir/kasıtlı bir eylem için kabul
  edilebilir bir basitlik).

**SEO Ayarları — `/panel/ayarlar`'ın eski placeholder'ı artık gerçek**
(placeholder metni zaten "SEO... Faz 5'te" diyordu, bu görev o sözü
kapattı — yeni bir rota AÇILMADI):

- Sayfa başlığı/açıklama alanlarında canlı karakter sayacı (60/160 —
  Google'ın fiili kesme noktalarına yakın, SERT bir engelleme değil,
  sadece görsel uyarı — KISITLAR "uyar" dedi "engelle" demedi).
- Canlı Google arama sonucu önizlemesi.
- Anahtar kelimeler (dürüst bir notla: modern arama motorları büyük
  ölçüde yok sayıyor, yine de saklanıyor).
- Paylaşım görseli (Open Graph) — mevcut `BrandImageUploader.tsx`
  (logo/favicon'la aynı, `"branding"` bucket'ı) yeniden kullanıldı.
- Yeni migration: `20260816120000_add_seo_keywords_and_og_image.sql` —
  `site_settings.seo_keywords`/`og_image_path`.

**Test 1 (ayar ekranları denetimi):** Bir ajanla Tema/Sayfa Düzeni/
Ayarlar/Mesajlar ekranları taratıldı — eksik alan/kaydedilmeyen değer
bulunamadı, 2 gerçek etiket tutarsızlığı bulunup düzeltildi (Köşe
Yarıçapı/Font Ailesi'nde eksik "(opsiyonel)" eklendi; mesaj listesindeki
"Yeni" rozeti panelin geri kalanıyla ["Okunmamış Mesaj" özet kartı,
menü rozeti] tutarlı olsun diye "Okunmamış" yapıldı).

**Test 2 ("yeni müşteri" dogfood testi):** Gerçek dev sunucusuna karşı,
2 aşamalı: (1) `applyThemePresetAction`'ın gerçek mantığıyla "Modern
Koyu" uygulandı, `<html style>` doğrulandı; (2) üzerine tamamen farklı
bir marka (terrakota `#c1502e` + orman yeşili `#2d6a4f`, "keskin" radius,
Poppins font), yeni bölüm sırası (Referanslar hero'dan hemen sonra),
5 varyantlı bölümün hepsi alternatif varyantında, İstatistikler gizli,
yeni SEO başlık/açıklama/anahtar kelime uygulandı — **15/15 doğrulama
noktası geçti**, `/ekip`/`/iletisim` dahil. Bağımsız kontrast hesabı
`#c1502e`'nin AA eşiğine ÇOK yakın (4.71:1, sınır 4.5:1) ama geçtiğini
doğruladı — `<html style>`'daki gerçek çıktıyla birebir örtüştü. Test
verisi (kullanıcının panelden kendi denediği GERÇEK ara durum dahil)
orijinaline tam olarak geri alındı.

`npm run lint`/`npx tsc --noEmit`/`npm run build` hepsi temiz.
`docs/MUSTERİ-KILAVUZU.md`'ye "Tema Önayarları"/"Varsayılana Dönme"/
"SEO Ayarları" başlıkları eklendi.

**JSON-LD yapısal veri, site haritası/robots, paylaşım görseli garantisi
(2026-08-17):** Dışarıdan gelen bir yönergeyle, SEO'nun üç eksik temeli
tamamlandı:

- **`LocalBusiness` (`GeneralContractor`) JSON-LD'si** — her sayfada
  render edilen yeni `components/site/LocalBusinessJsonLd.tsx`, saf
  `lib/seo/localBusiness.ts`'teki `buildLocalBusinessJsonLd()`'den
  besleniyor. Eksik alanlar (telefon/adres/çalışma saati/hizmet ili/
  sosyal medya) JSON-LD'den TAMAMEN çıkarılıyor, boş string olarak
  kalmıyor. Telefon `lib/seo/formatPhone.ts` ile uluslararası (`+90...`)
  biçime normalize ediliyor.
- **Panelde yeni yapısal alanlar** — `/panel/tema`'nın İletişim
  Bilgileri bölümüne Çalışma Saatleri (serbest metin, artık İLK KEZ
  panelden düzenlenebiliyor), 4 yapısal saat kutusu (hafta içi/hafta
  sonu açılış-kapanış) ve Hizmet Verilen İller eklendi — yeni migration
  `20260817120000_add_working_hours_structured_and_service_areas.sql`
  (`contact_sections`'a 5 kolon, saat kolonları `HH:MM` CHECK
  constraint'li).
- **`app/sitemap.ts`/`app/robots.ts`** — sadece gerçek sayfalar (`/`,
  `/ekip`, `/iletisim`), `/panel` tamamen Disallow.
- **`app/api/og/route.tsx`** — panelden paylaşım görseli yüklenmemişse
  devreye giren, gerçek marka rengini/WCAG-doğru metin rengini kullanan
  otomatik görsel üretimi (`next/og` `ImageResponse`) — dosya kuralı
  (`opengraph-image.tsx`) BİLEREK kullanılmadı (Next.js'te dosya-tabanlı
  metadata her zaman `generateMetadata()`'yı ezdiği için gerçek bir
  görsel varken bile onu gölgelerdi).

**Doğrulama (gerçek):** Gerçek `curl` ile 4 rota (`/robots.txt`,
`/sitemap.xml`, `/api/og`, ana sayfanın JSON-LD'si) test edildi; JSON-LD
için 3 DB senaryosu (boş/dolu/kısmi) servis-rolü script'iyle doğrulandı;
DB'nin geçersiz saat formatını CHECK constraint'iyle reddettiği
doğrulandı; **Google Zengin Sonuçlar Testi'nde 0 hata** ile geçti (3
isteğe bağlı alan notu — `priceRange`/`postalCode`/`addressLocality` —
hepsi bilinçli kapsam kararlarının beklenen sonucu). `npm run lint`/
`npx tsc --noEmit`/`npm run build` hepsi temiz. Yeni
`docs/SEO-PERFORMANS.md` (4 başlık) + `VERİ-MODELİ.md`/`GUVENLIK.md`/
`MUSTERİ-KILAVUZU.md`/`CLAUDE.md` güncellemeleri. Detay:
`KARAR-GUNLUGU.md`, 2026-08-17.

**Lighthouse performans denetimi: gereksiz font indirmeleri temizlendi
(2026-08-17, aynı gün, yeni oturum):** Kullanıcı gerçek bir Lighthouse
raporu (mobil+masaüstü, sadece 4 kategori skoru) paylaştı; rapor
detayları (Opportunities/metrikler) olmadığı için, kod tabanı dışarıdan
gelen bir yönergedeki 4 kategori (görsel, font, istemci JS, CLS) için
statik olarak tarandı. `next/font`'un resmi "Preloading" davranışı
(`node_modules/next/dist/docs/01-app/03-api-reference/02-components/
font.md`) doğrulanarak gerçek bir sorun bulundu: **`app/layout.tsx`
(root layout) 6 font ailesini (Geist Sans, Geist Mono, Manrope, Inter,
Poppins×4 ağırlık, Work Sans) TÜM rotalarda otomatik preload ediyordu**,
ama `resolveThemeTokens()` (`lib/theme/resolve.ts`) aynı anda sadece TEK
`--font-sans` kullanıyor — font seçimi tenant bazlı, `site_settings.
font_family_key`'e göre.

- **Geist Mono komple kaldırıldı** — kodda `font-mono` class'ı hiçbir
  yerde kullanılmadığı grep ile doğrulandı, %100 ölü ağırlıktı.
- **`manrope`/`inter`/`poppins`/`workSans`'a `preload: false` eklendi**
  — Geist Sans (`kurumsal-mavi` varsayılan preset'in fontu) `preload:
  true` (varsayılan) kaldı. Bu, next/font'un otomatik `<link
  rel="preload">` enjeksiyonunu o 4 font için kapatıyor; tarayıcı artık
  sadece `--font-sans` gerçekten o fonta çözüldüğünde indiriyor.
- `app/globals.css`'teki artık boşta kalan `--font-mono: var(--font-
  geist-mono);` token'ı silindi.
- **Görsel boyutlandırma/priority** (her yerde `next/image`, `sizes`
  gerçek render genişlikleriyle eşleşiyor, `priority` sadece Hero + ilk
  3 proje kartında), **font `display`** (next/font varsayılanı zaten
  `swap`) ve **CLS** (her görsel `aspect-[...]`/sabit boyut container
  kullanıyor, `adjustFontFallback` varsayılan `true`) kod incelemesinde
  zaten sorunsuz bulundu — ekstra iş yapılmadı, uydurma bulgu
  eklenmedi.
- **Projeler galerisinin client-boundary'si** (`ProjectsExplorer.tsx`
  tüm galeriyi kendi içinde render ediyor, "Server Component'i children
  geçme" deseni kullanılmıyor) düşük/belirsiz kazanç + yüksek efor
  (URL/arama-parametresi tabanlı modal mimarisi gerektirir) gerekçesiyle
  bilinçli olarak ertelendi.

**Doğrulama (gerçek, kullanıcı tarafından):** `npm run build` + `npm run
start` sonrası Chrome DevTools Lighthouse aynı iki profilde (mobil +
masaüstü) tekrar çalıştırıldı:

| Kategori | Mobil (önce → sonra) | Masaüstü (önce → sonra) |
|---|---|---|
| Performance | 88 → **96** | 99 → **100** |
| Accessibility | 100 → 100 | 100 → 100 |
| Best Practices | 96 → 96 | 96 → 96 |
| SEO | 92 → 92 | 92 → 92 |

Mobil Performance artık `TEST-STRATEJISI.md` madde 4 eşiğinin (≥90)
üzerinde — düzeltme öncesi tek eksik kalem buydu, font preload
optimizasyonuyla kapandı. Diğer 3 kategori beklenildiği gibi
değişmedi (font önceliklendirmesi sadece Performance metriklerini
etkiler). `npm run build`/`lint` bu oturumda ayrıca doğrulanmadı —
kullanıcı sıradaki oturumda teyit edebilir.

**Erişilebilirlik denetimi: atlama bağlantısı + gereksiz canlı bölge
düzeltmesi (2026-08-17, aynı gün, yeni oturum):** Dışarıdan gelen bir
yönergeyle site+panel için erişilebilirlik denetimi istendi. Bu ortamda
tarayıcı aracı `localhost`'a erişemediği için otomatik tarama/klavye
turu/ekran okuyucu dinlemesi AI tarafından gerçek zamanlı yapılamadı —
hedefli bir kod incelemesi yapıldı, kapsam 2026-08-14'teki son
kapsamlı panel taramasından SONRA eklenen yüzeylere (Tema Ayarları,
Sayfa Düzeni, SEO Ayarları, marka görseli yükleme) daraltıldı. Detaylı
bulgu tablosu, test yöntemleri ve yanlış pozitif değerlendirmesi:
`TEST-STRATEJISI.md` madde 9.

- **Yeni `components/ui/SkipLink.tsx`** — `app/(site)/layout.tsx` ve
  `components/panel/PanelShell.tsx`'e eklendi, hedef `<main>`'ler
  `id`+`tabIndex={-1}` aldı (Kritik bulgu — hiçbir yerde atlama
  bağlantısı yoktu).
- **`role="status"` kaldırıldı** — `SeoEditor.tsx`'teki karakter
  sayacından ve `ThemeEditor.tsx`'teki 2 kontrast geri bildirim
  paragrafından (Yüksek bulgu — her tuş vuruşunda/renk değişiminde
  ekran okuyucuyu kesiyordu). Form gönderim sonrası tek seferlik
  "Değişiklikler kaydedildi" mesajlarına dokunulmadı.
- **Düşük öncelikli not (düzeltilmedi):** `BrandImageUploader`'daki
  seçili-dosya önizlemesinin `alt` metni jenerik, dosya adını
  içermiyor.
- **Yanlış pozitif olarak elendi:** `ColorPickerField`'daki native
  renk seçici + metin kutusu ikilisi — incelemede ikisinin de doğru
  isimlendirildiği görüldü.

**Kullanıcı tarafından tamamlandı:** Klavye turu (site + panel) ve
Windows Narrator ile ekran okuyucu denemesi gerçek tarayıcıda elle
yapıldı — hiçbir yeni sorun bulunmadı, 2 düzeltmenin (atlama
bağlantısı, canlı bölge) gerçek kullanımda işe yaradığı doğrulandı.
`npm run build`/`lint` bu oturumda ayrıca doğrulanmadı, henüz
commit'lenmedi.

**Vitest + Playwright kuruldu, 3 birim + 3 uçtan uca kritik akış testi
yazıldı (2026-08-17, aynı gün, yeni oturum):** Dışarıdan gelen bir
yönergeyle, `Sıradaki adım` listesinin en yüksek öncelikli maddesi
(mentör değerlendirmesinde de işaretlenmişti) kapandı. Detay, kapsam ve
çalıştırma talimatları: `TEST-STRATEJISI.md` madde 10-12.

- **Birim (Vitest):** `lib/theme/contrast.test.ts` (WCAG kontrast
  hesabı, 2026-08-15'teki gerçek #808080 hatasının regresyon testi
  dahil), `lib/validation/contact.test.ts`, `lib/seo/formatPhone.test.ts`
  — üçü de saf fonksiyon, DOM'a ihtiyaç duymuyor.
- **Uçtan uca (Playwright):** `e2e/visitor-flow.spec.ts` (ana sayfa →
  proje filtresi → iletişim formu), `e2e/admin-service-flow.spec.ts`
  (giriş → hizmet ekle/yayınla → sitede doğrula → sil —
  `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` yoksa otomatik atlanır),
  `e2e/unauthorized-access.spec.ts` (2026-08-12'deki `curl` testinin
  otomatikleştirilmiş hâli).
- Seçiciler `getByRole`/`getByLabel` (erişilebilir rol/etiket) — CSS
  class'ı veya kırılgan metin eşleşmesi yok. Her test `Date.now()` ile
  kendi verisini üretir, `test.afterEach`'te service-role client'la
  siler (`e2e/helpers/supabaseAdmin.ts`) — admin akışında bu aynı
  zamanda bir başarısızlık güvenlik ağı. Sabit `sleep` hiç kullanılmadı.
  `playwright.config.ts`: `retries: 0` (bilinçli — idempotency framework
  retry'ıyla maskelenmiyor), `timeout: 60_000`.
- `package.json`'a `test:unit`/`test:unit:watch`/`test:e2e`/`test`
  script'leri eklendi (`npm test` = ikisi birden — `AI-KURALLARI.md`
  madde 8.4'ün beklediği komut buydu). `.env.local.example`'a
  `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` eklendi. `.gitignore`'a
  Playwright'ın ürettiği `test-results/`/`playwright-report/` eklendi.

**Doğrulama (gerçek, kullanıcı tarafından tamamlandı):** Paketler
kuruldu, `npx playwright install chromium` yapıldı,
`E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` `.env.local`'e eklendi (yol
boyunca gerçek bir sorun bulundu: bu iki değişken önce yanlışlıkla
farklı bir isimle — `TEST_AUTH_EMAIL`/`PASSWORD`, `scripts/test-rls.mjs`'in
kullandığı ayrı bir çift — sanılmıştı, düzeltildi). `npm test`
(`test:unit` + `test:e2e`) **art arda 3 kez** çalıştırıldı, hepsi yeşil:
26/26 birim test, 3/3 e2e test (en uzunu 11.5s — 60s sınırının içinde).
KABUL KRİTERİ'nin tamamı karşılandı. `npm run build`/`lint` bu
oturumda ayrıca doğrulanmadı.

**Spam koruması, hata sayfaları, güvenlik başlıkları, sır taraması ve
RLS/Storage denetimi (2026-08-17, aynı gün, yeni oturum):** Dışarıdan
gelen bir yönergeyle, `GUVENLIK.md`'nin açık maddelerinden birkaçı
(rate limiting yok, güvenlik başlıkları yok) kapatıldı, ayrıca 2 gerçek
denetim (sır taraması, RLS/Storage) yapıldı. Detay, kanıt ve dürüst
etkinlik/atlatma değerlendirmesi: `GUVENLIK.md` madde 14-17.

- **Spam koruması (2 katman):** Honeypot (`lib/security/
  contactHoneypot.ts`, `ContactForm.tsx`'teki gizli `website` alanı) +
  sunucu tarafı IP-bazlı hız sınırı (aynı tenant+IP için 15 dakikada en
  fazla 3 mesaj, Supabase'in kendisi sorgulanarak — bellek-içi sayaç
  BİLİNÇLİ OLARAK reddedildi, Vercel serverless'te güvenilmez olurdu).
  Kullanıcıya iki mimari/gizlilik kararı (anahtar: IP mi e-posta mı,
  sayaç: DB mi bellek mi) soruldu, **IP + Supabase** seçildi — yeni
  `contact_messages.sender_ip` kolonu (migration
  `20260817130000_add_contact_message_sender_ip.sql`, KVKK notuyla).
  Yanlış pozitifte (hız sınırına takılan gerçek kullanıcı) mesaj
  sessizce kaybolmuyor — dürüst bir hata + alternatif iletişim kanalı
  gösteriliyor. CAPTCHA'ya geçiş için net bir eşik tanımlandı (haftada
  10+ spam, dağıtık IP'li koordineli saldırı, ya da honeypot'un
  sistematik atlatıldığı tespit edilirse) — Cloudflare Turnstile önerisi
  ile, henüz kod olarak eklenmedi (KISITLAR: "CAPTCHA son çare").
  `lib/security/contactHoneypot.test.ts` — honeypot fonksiyonu için 4
  birim test. **Gerçek bir build hatası bulunup düzeltildi:** honeypot
  (istemci-güvenli) ve hız sınırı (`next/headers` kullanır, sunucuya
  özel) başta tek dosyaydı, `ContactForm.tsx`'in (Client Component) onu
  import etmesi `next/headers`'ı tarayıcı paketine sürüklemeye çalışıp
  `npm run build`'u durdurdu — dosya `contactHoneypot.ts` (istemci) /
  `contactRateLimit.ts` (sunucu) olarak ikiye bölünerek çözüldü. Detay:
  `GUVENLIK.md` madde 14.
- **Hata sayfaları:** `app/not-found.tsx`, `app/error.tsx`,
  `app/global-error.tsx` — hiçbiri teknik detay (stack/mesaj) göstermiyor,
  hepsi ana sayfaya dönüş sunuyor. `error.tsx`/`global-error.tsx`'in prop
  adının BU Next.js sürümünde `retry` olduğu (eski sürümlerdeki `reset`
  DEĞİL) gerçek dokümandan doğrulanarak yazıldı.
- **Güvenlik başlıkları:** `next.config.ts`'e CSP + X-Frame-Options +
  X-Content-Type-Options + Referrer-Policy + Permissions-Policy +
  Strict-Transport-Security eklendi. Nonce tabanlı strict CSP BİLİNÇLİ
  OLARAK reddedildi — Next'in kendi dokümanı nonce'ın TÜM sayfaları
  dinamik render'a zorladığını söylüyor, bu projenin statik+ISR
  mimarisini (`MIMARI.md`) bozardı. `style-src 'unsafe-inline'` tek
  gerekli gevşetme (tenant tema enjeksiyonu için). HSTS `preload`
  bilinçli olarak eklenmedi (geri alınması zor bir taahhüt, proje henüz
  canlı değil).
- **Sır taraması:** repo + TÜM git geçmişi (`git log --all`, pickaxe
  arama) + gerçek prod client bundle'ı (`.next/static`, önceki bir
  Lighthouse ölçümünden kalma) tarandı — **sızıntı bulunmadı**. `.env.local`
  hiç commit'lenmemiş, service role key client bundle'da hiç geçmiyor.
- **RLS/Storage denetimi:** 11 tablo + 2 kurulu bucket'ın (projects,
  branding) tüm migration SQL'i tek tek okunup "anon ne yapabilir"
  tablosu çıkarıldı — mevcut dokümantasyonla (madde 2/11) tutarlı,
  tutarsızlık bulunmadı. 5 eksik bucket (services/hero/about/
  testimonials/team) TEKRAR doğrulandı (zaten bilinen bir boşluk).
- **`GUVENLIK.md` madde 10 (yayın öncesi kontrol listesi) güncellendi**
  — 4 yeni madde işaretlendi, ama liste HÂLÂ tam değil: tenant/domain
  panel ayrımı, `npm audit`, e-posta bildirimi, güvenlik başlıklarının
  canlı `curl` doğrulaması gibi maddeler açık kaldı. **Doküman açıkça
  "canlıya çıkılmamalı" diyor** — bu dürüst, uydurulmuş bir "hazır"
  durumu yok.

**Doğrulama (gerçek, tamamlandı — kullanıcı tarafından):** Migration
SQL Editor'de çalıştırıldı, `npm run types:generate` yapıldı — bu
sırada gerçek bir build hatası bulunup düzeltildi (yukarıya bakın,
istemci/sunucu dosya ayrımı). `npm run build`/`lint` temiz, iletişim
formu ve 404 sayfası gerçek tarayıcıda denendi, `curl.exe -I` ile 6/6
güvenlik başlığı doğru geldi (bu sırada fark edilen `X-Powered-By`
sızıntısı `poweredByHeader: false` ile kapatıldı), `npm audit` **0
açık** verdi. `GUVENLIK.md` madde 10 son haliyle güncellendi.

**Yeni müşteri kurulum kılavuzu + kurulum betiği (2026-08-17, aynı gün,
yeni oturum):** Dışarıdan gelen bir yönergeyle, ürünün "tek müşteri =
tek kurulum" satış modeli (bkz. `PRD.md`) için gerçek bir sıfırdan-
kuruluma-yayına kılavuzu ve onu destekleyen kod yazıldı.

- **Yeni `docs/KURULUM.md`** — Ön Koşullar, Müşteriden Alınacak
  Bilgiler, Adım Adım Kurulum (9 numaralı adım, her birinde tahmini
  süre + "doğru yaptığını nasıl anlarsın" kontrolü, toplam ~28 dk),
  Doğrulama Kontrolleri, Sık Yapılan Hatalar (bu projenin GERÇEK
  geçmişinde yaşanmış hatalardan derlendi — SQL Editor'e kesik yapıştırma,
  `types:generate` unutma, PowerShell `curl -I` sorunu vb.), Bakım ve
  Yedekleme. **Ekran görüntüsü YOK** — AI gerçek bir Supabase/Vercel
  hesabına erişemediği için; bunun yerine her adımda tam menü yolu
  metin olarak yazıldı, gerçek ilk kurulumda ekran görüntüsü eklenmesi
  öneriliyor.
- **Gerçek bir mimari değişiklik:** `lib/supabase/queries.ts`'teki
  `ACTIVE_TENANT_DOMAIN` sabiti artık `process.env.ACTIVE_TENANT_DOMAIN`'den
  okunuyor (yoksa mevcut "akmeinsaat.com.tr"ye düşer — bu oturumun kendi
  `.env.local`'i etkilenmedi). Sebep: eskisi gibi her müşteri için kaynak
  kodda bir satır değiştirip yeniden deploy etmek yerine, sadece Vercel
  ortam değişkeni ayarlamak yeterli olsun diye.
- **Yeni `scripts/setup-new-customer.sh`** — `supabase db push` (şema+RLS,
  tüm migration'lar) + `supabase/setup/seed-template.sql`'i (yer
  tutucuları `sed` ile doldurup) `psql` ile uygulayan, sıralı ve tekrar
  çalıştırılabilir (`on conflict do nothing`, liste tabloları için
  `if not exists` sentinel) tek bir akış. psql yoksa elle SQL Editor'e
  yapıştırma alternatifi de kılavuzda var.
- **Gerçek bir kurulum boşluğu bulundu:** `page_sections` tablosunun
  seed'i `supabase/seed.sql`'de DEĞİL, ayrı bir migration'da
  (`20260810120000_...`) olduğu görüldü — bu tablo boşsa ana sayfa
  SESSİZCE tamamen boş render edilir (hata yok). Yeni müşteri şablonuna
  bu adım dahil edildi, `KURULUM.md`'de ayrıca vurgulandı.
- **`.env.local.example` tamamlandı** — her değişken için "ne işe
  yarar/nereden alınır" yorumları, yeni `ACTIVE_TENANT_DOMAIN`, ve
  `E2E_*` değişkenlerinin sadece yerel test için olduğu, üretim
  deploy'una eklenmemesi gerektiği notu.
- **`docs/MUSTERİ-KILAVUZU.md`'deki eksik bulundu ve kapatıldı:** panelin
  7 nav öğesinden biri (Özet/dashboard ekranı) hiç anlatılmamıştı — yeni
  bir "Özet Ekranı" başlığı eklendi.
- **Yol boyunca bulunan, ilgisiz ama gerçek bir bug düzeltildi:**
  `app/panel/(protected)/page.tsx`'teki "Hızlı Erişim" linki hâlâ "Tema
  ayarları (**yakında**) →" yazıyordu — Tema ekranı 2026-08-15'ten beri
  gerçek/tam çalışır durumda, "(yakında)" ibaresi 2026-08-14'teki panel
  incelemesinden kalma, o zamandan beri güncellenmemiş yanlış bir metin.

**Yapılamayan (kullanıcının/başka birinin yapması gereken, KISITLAR/
GÖREVLER'in kendi isteği):** Kılavuzun gerçek bir sıfırdan Supabase
projesiyle uçtan uca test edilmesi — AI bunu yapamaz (gerçek hesap
gerekir). `scripts/setup-new-customer.sh` da bu yüzden canlı test
edilmedi, sadece kod incelemesiyle doğrulandı.

**Teslim paketi, README, temizlik, canlı yayın hazırlığı (2026-08-17,
aynı gün, yedinci oturum):** Dışarıdan gelen bir yönergeyle, satışa/
teslime hazırlık yapıldı. **Vercel'e gerçek yayın, canlı uçtan uca
test ve canlı Lighthouse ölçümü AI TARAFINDAN YAPILAMADI** — bunlar
kullanıcının kendi Vercel/GitHub hesap erişimini gerektiriyor, adım
adım talimat sohbet geçmişinde verildi.

- **Yeni `docs/TESLIM-PAKETI.md`** — Ürün Özeti, Kapsam ve Kapsam Dışı
  (dürüstçe: e-posta bildirimi yok, CAPTCHA yok, çoklu dil yok vb.),
  Teslim Edilenler, Kurulum Gereksinimleri, Bakım ve Destek (gerçekçi
  beklenti — SLA taahhüdü yok), Fiyatlandırma Önerisi (açıkça "senin
  ayarlaman gereken bir başlangıç önerisi" olarak işaretlendi, kesin
  bir iddia değil). 3 maddelik rakip farkı `rakip-analizi.md`'deki
  GERÇEK verilere dayanıyor (Referanslar 8 siteden 3'ünde, Ekip
  sayfası 2'sinde vardı — uydurulmadı).
- **`README.md` tamamen yeniden yazıldı** — hâlâ `create-next-app`
  varsayılanıydı, hiç güncellenmemişti. Yeni başlıklar: Proje Nedir,
  Teknolojiler, Hızlı Başlangıç, Dokümantasyon Haritası (tüm `docs/`
  dosyalarına ne zaman bakılacağı tablosu), Testleri Çalıştırma.
- **Gereksiz dosyalar temizlendi:** `app/test-components/`,
  `app/test-theme/` (kendi dokümantasyonlarında "ürünle yayınlanmaz"
  yazan geçici vitrin sayfalarıydı — `TASARIM-SISTEMI.md` güncellendi)
  + `public/`'teki 5 kullanılmayan `create-next-app` varsayılan SVG'si
  (`file.svg`/`globe.svg`/`next.svg`/`vercel.svg`/`window.svg` —
  kodda hiç referans edilmediği grep ile doğrulandı).
- **`playwright.config.ts`** — `PLAYWRIGHT_BASE_URL` ortam değişkeni
  tanımlıysa canlı adrese karşı çalışacak şekilde güncellendi
  (webServer'ı hiç başlatmıyor). ⚠️ Admin akışı testi canlıda
  çalıştırılırsa GERÇEK siteye birkaç saniyeliğine görünür bir test
  kaydı ekleyip siliyor — bilerek yapılmalı.
- **`docs/VERİ-MODELİ.md`/`MIMARI.md`/`TASARIM-SISTEMI.md`** bugünkü
  değişikliklerle güncellendi (önceki oturumda unutulmuştu, kullanıcı
  sorunca fark edildi — bkz. yukarıdaki not).

**Kullanıcının yapması gereken (sırasıyla):** (1) Vercel'e GitHub
deposunu bağlayıp üretim ortam değişkenlerini girip yayınlamak, (2)
oluşan build hatalarını (varsa) bana getirmek, (3) canlı adrese karşı
`PLAYWRIGHT_BASE_URL=<adres> npm run test:e2e` çalıştırmak, (4) canlı
adreste Chrome DevTools Lighthouse çalıştırıp yerel sonuçlarla (mobil
88→96, masaüstü 99→100, bkz. bu dosyanın önceki bir kaydı)
karşılaştırmak. Tam talimat sohbet geçmişinde.

**Vercel'e ilk canlı yayın + 2 gerçek hata bulunup düzeltildi
(2026-08-17, aynı gün, sekizinci oturum):** Kullanıcı Vercel'e yayınladı
(`https://staj-projesi-olive.vercel.app`), canlıya karşı uçtan uca
testler + Lighthouse çalıştırıldı — ikisi de gerçek, ciddi hata buldu.

**Hata 1 — CSP hydration'ı tamamen bloke ediyordu:** Canlıya karşı ilk
Playwright koşusunda (1 geçti, 2 başarısız — kategori filtresi
tıklaması hiç etki etmiyordu, "Sil" onay penceresi hiç açılmıyordu),
15 saniyelik "tekrar dene" döngüsü bile hiçbir sonuç vermeyince gerçek
sebep bulundu: `next.config.ts`'teki CSP'de `script-src`'ye
`'unsafe-inline'` eklenmemişti (güvenlik görevinde `style-src`'ye
eklenmiş ama `script-src` unutulmuştu — Next'in kendi resmi örneğinde
ikisi de var). Next.js App Router hydration'ı gömülü `<script>`
etiketleriyle başlatıyor, CSP bunları sessizce engelliyordu — sayfa
görsel olarak tamamen normal görünüyordu ama HİÇBİR şey tıklanabilir
değildi. **Bu, güvenlik görevinden beri hem canlıda hem YEREL
geliştirmede bozuktu** — e2e testleri CSP eklendikten sonra yerelde bir
daha hiç çalıştırılmadığı için fark edilmemişti. Düzeltme: `script-src`e
`'unsafe-inline'` eklendi. Ayrıca 2 testin tıklama+kontrol adımı,
gerçek ağ gecikmesine karşı daha dayanıklı olsun diye "başarılı olana
kadar tekrar dene" (`toPass()`) desenine çevrildi; canlıya karşı
çalışırken Playwright işçi sayısı 1'e düşürüldü (Hobby plan'a gereksiz
yük bindirmesin diye). **Doğrulama: düzeltme sonrası canlıda 3/3 test
yeşil.**

**Hata 2 — sitemap/robots.txt/JSON-LD yanlış domain kullanıyordu:**
Canlı Lighthouse SEO skoru mobilde ve masaüstünde **92'den 58'e**
düştü (Performance/Accessibility/Best Practices etkilenmedi, hatta
Performance arttı — gerçek CDN yereldan hızlı). Kök sebep: canlı
`robots.txt`'in sitemap satırı `https://akmeinsaat.com.tr/sitemap.xml`
diyordu — ama site GERÇEKTE `staj-projesi-olive.vercel.app`'te yayında;
`akmeinsaat.com.tr` sadece demo tenant'ın veritabanındaki YER TUTUCU
isim. `app/robots.ts`/`app/sitemap.ts`/`lib/seo/localBusiness.ts`/
`app/(site)/layout.tsx` hepsi "hangi tenant'ın verisi gösterilsin"
sorusuna cevap veren `getActiveTenantDomain()`'i sitenin GERÇEK yayın
adresiymiş gibi kullanıyordu — iki farklı kavram birbirine
karıştırılmıştı. Düzeltme: yeni `lib/seo/getSiteUrl.ts` — öncelik sırası
`NEXT_PUBLIC_SITE_URL` (elle) → `VERCEL_URL` (Vercel'in otomatik
sağladığı, HER deploy'da doğru) → tenant domain'i (son çare). Bu demo
deploy'unda `VERCEL_URL` sayesinde elle bir ayar gerekmeden düzeliyor;
gerçek bir müşteri özel alan adı bağladığında `NEXT_PUBLIC_SITE_URL`'i
elle ayarlaması önerilir (`.env.local.example`'a eklendi).
`app/(site)/layout.tsx`'e ayrıca eksik olan `metadataBase` eklendi.
4 kullanım yeri güncellendi, `lib/seo/getSiteUrl.test.ts` (5 birim
test) eklendi.

**Düzeltme YANLIŞ çıktı (ilk seferde) — `VERCEL_URL` sanıldığı gibi
kalıcı değilmiş** (deploy'a özel, değişken bir hash içeriyormuş) —
`VERCEL_PROJECT_PRODUCTION_URL` (gerçekten kalıcı) araya eklendi,
kullanıcıdan `NEXT_PUBLIC_SITE_URL`'i Vercel'de ELLE ayarlaması
istendi. **Bu sefer doğrulandı: kanonik adres (`staj-projesi-
olive.vercel.app`) canlı Lighthouse'ta SEO 92 verdi.**

**Ek bulgu ve düzeltme (aynı gün):** Vercel'in aynı deploy için ürettiği
3 farklı adresin (kalıcı üretim adresi + git-dalı önizlemesi + deploy'a
özel adres) her biri farklı bir SEO skoru veriyordu — beklenen/doğru
davranış (sadece kanonik adres önemli) ama kafa karıştırıcı. Kalıcı bir
çözüm eklendi: `lib/supabase/proxy.ts`'e, kanonik OLMAYAN bir host'tan
gelen HER isteği 308 ile kanonik adrese yönlendiren bir kontrol
eklendi — hem SEO sinyallerini tek adreste toplar hem panel oturum
çerezlerinin her zaman aynı origin'de kurulmasını garanti eder. Detay:
`GUVENLIK.md` madde 8 "Kanonik adrese yönlendirme".

**Panel için `noindex` meta etiketi eklendi (aynı gün):** Kullanıcı
panelin (`/panel/giris`) canlı Lighthouse SEO skorunun düşük (63)
çıktığını paylaştı — bu bir hata DEĞİL, panel bilerek anonim/gizli
kalması gereken bir sayfa (bkz. `PRD.md`). Yine de gerçek bir eksik
bulundu: `robots.txt`'teki `Disallow: /panel` tek başına dizine
eklenmeyi engellemiyor, sadece taramayı caydırıyor. Yeni
`app/panel/layout.tsx` — panelin TÜM alt ağacını (giriş + korumalı
alan) tek noktadan `robots: { index: false, follow: false }` ile
işaretliyor, daha kesin bir ikinci katman. Detay: `SEO-PERFORMANS.md`.

## Sıradaki adım

0. ~~IP hız sınırı düzeltmesi + testi doğrulanmalı, commit'lenmeli~~ —
   2026-08-18'de tamamlandı: `npm test`/`npm run build`/`lint` yeşil,
   commit'lendi, push'landı. **Ek olay:** commit mesajlarındaki
   `Co-Authored-By` satırı kullanıcının GitHub Contributors listesinde
   istemeden görünmesine yol açtığı fark edildi — kullanıcının açık
   talebiyle (a) geçmiş 2 commit `git reset --hard` + `cherry-pick` +
   `push --force-with-lease` ile trailer'sız yeniden yazıldı (yeni
   hash'ler: `083c408`, `992fe9f`), (b) **bundan sonra commit/push'u AI
   çalıştırmayacak, sadece komutları verecek**, Co-Authored-By satırı da
   bir daha eklenmeyecek. Detay: `KARAR-GUNLUGU.md`, "üçüncü bir olay".
0c. **(ÇÖZÜLDÜ, sekizinci oturum — yeni en yüksek öncelik için 0d'ye bak)**
   ~~İki commit ("fix: panel mesaj silme ve okunmamis sayac hatalarini
   duzelt" `578ac58`, "feat: deneme icin yeni acik/koyu renk paletini
   uygula" `5582b2d`) push'landı, `git status` temiz, `origin/main` ile
   senkron.~~ ~~Yeni renk paleti tarayıcıda incelendi, kullanıcı KALICI
   olarak tutmaya karar verdi (altıncı oturum) — deneme durumu bitti.~~
   ~~`20260818130000_enable_realtime_contact_messages.sql` kullanıcı
   tarafından Supabase SQL Editor'de çalıştırıldı (altıncı oturum).~~
   ~~İki-sekmeli test AI tarafından (Chrome otomasyonuyla, `npm run dev`
   zaten çalışırken) yapıldı: form→DB→panel mesaj listesi ZİNCİRİ UÇTAN
   UCA ÇALIŞIYOR (yeni mesaj doğru tenant'a kaydoldu, panelde
   "Okunmamış" göründü, silme + anlık liste yenilemesi de doğru
   çalıştı).~~ ~~AI'ın test ortamında toast/anlık sayaç görülemedi ama
   sebep belirsizdi (test tarayıcısının genel internet erişimi yoktu).
   Kullanıcı KENDİ normal tarayıcısında tekrar denedi ve AYNI sorunu
   doğruladı — yani gerçek bir hataydı, test ortamı sınırlaması
   değildi.~~ ~~CSP `connect-src`'e Supabase origin'i eklendi (bir
   önceki gerçek bulgu), dev sunucusu yeniden başlatıldı.~~ **Kullanıcı
   yeniden başlatma SONRASI da tekrar test etti — HÂLÂ çalışmıyor**
   ("sayfayı yenileyince sadece mesaj sayısı artıyor, bildirime dair bi
   şey yok"). AI bunun üzerine backend'i (publication, RLS, filtre,
   kütüphane wiring'i) bu makinedeki gerçek internet erişimiyle
   (Bash + Node script'leri, tarayıcıya HİÇ güvenmeden) adım adım test
   etti — **hepsi ÇALIŞIYOR olarak doğrulandı** (bkz. `KARAR-GUNLUGU.md`,
   "altıncı oturum, beşinci konu" — 4 ayrı script testi + kütüphane
   kaynak kodu incelemesi). Yani sorun artık ne Supabase tarafında ne
   kütüphanede — kalan olası sebepler istemci/tarayıcı taraflı: (a)
   kullanıcının test ettiği sekme dev sunucusu yeniden başladıktan
   sonra SERT yenilenmedi (CSP sayfa yüklendiği anda sabitlenir), (b)
   bir tarayıcı eklentisi (reklam engelleyici vb.) WebSocket'i
   engelliyor, (c) bilinmeyen bir istemci sorunu. `NewMessageNotifier`'a
   artık `CHANNEL_ERROR`/`TIMED_OUT` durumunda `console.error` logu
   eklendi (önceden sessizdi) — **sıradaki adım: kullanıcı `/panel/
   mesajlar`'da Ctrl+Shift+R (sert yenileme) yapıp F12 konsolunu açık
   tutarak testi tekrarlamalı**, konsolda ne göründüğü (ya da hiçbir şey
   görünmediği) bir sonraki teşhis adımını belirleyecek.
   **Sonuç (yedinci oturum): kullanıcı sert yenileme sonrası tekrar denedi,
   konsolda `CHANNEL_ERROR`/`TIMED_OUT` logu HİÇ görünmedi** — yani sorun
   bağlantı hatası değil, tamamen sessiz bir RLS filtrelemesiydi. Kök neden
   bulundu: `NewMessageNotifier.tsx` istemciyi oluşturur oluşturmaz senkron
   `.subscribe()` çağırıyordu, oturum (JWT) çerezden asenkron okunduğu için
   ilk katılım "anon" rolüyle oluyor, `contact_messages`'ta anon'un hiç
   SELECT izni olmadığından olaylar sessizce eleniyordu. Düzeltme: abone
   olmadan önce oturum bekleniyor, `supabase.realtime.setAuth()` ile token
   elle veriliyor; ayrıca Mesajlar listesi için `router.refresh()` eklendi.
   Kullanıcı iki-sekmeli gerçek tarayıcı testiyle doğruladı — **ÇALIŞIYOR**,
   bu madde kapandı. Detay: `KARAR-GUNLUGU.md`, "yedinci oturum".
0e. **(Dokuzuncu oturumda kullanıcı önceliği değiştirdi — 0d yerine bu ikisi
   yapıldı)** İletişim formu e-posta bildirimi (Resend, bkz. madde 3'ün YENİ
   hâli) ve Hero/Hakkımızda panel ekranları (bkz. madde 1'in YENİ hâli)
   eklendi. `npm install resend` + `npm run build` kullanıcı tarafından
   çalıştırıldı, İLK denemede sorunsuz geçti. `npm run lint` bu oturumda hiç
   dokunulmamış `TextScramble.tsx`'te GERÇEK bir hata buldu
   (`react-hooks/set-state-in-effect`, sekizinci oturumdan kalma — o oturumda
   lint hiç çalıştırılmamıştı) — `ThemeToggle.tsx`'teki `useSyncExternalStore`
   deseniyle düzeltildi. Kullanıcı tarayıcıda `/panel/giris`'i test ederken
   İKİNCİ gerçek bug bulundu (aynı şekilde sekizinci oturumdan kalma, bu
   oturuma ait değil): konsolda "Encountered a script tag..." uyarısı —
   `forceLightScript`'in sayfa GÖVDESİNDE (kök `<head>` dışında) render
   edilmesinden kaynaklanıyordu. Next.js'in resmi kılavuzundaki
   `InlineScript` yardımcı deseniyle ilk denemede düzeltilmeye çalışıldı,
   ama kullanıcı GERÇEK tarayıcıda tekrar test edince uyarının AYNEN
   devam ettiği görüldü — bu teknik bu React/Next sürüm kombinasyonunda
   işe yaramadı. `ThemeToggle`'ın zaten `forceInitialMode="light"` ile
   AYNI işi yaptığı fark edildi (script sadece hydration öncesi
   milisaniyelik bir FOUC'u önlüyordu, kritik olmayan bir sayfa için) —
   kullanıcının onayıyla `forceLightScript`/`InlineScript` TAMAMEN
   kaldırıldı, konsol artık tamamen temiz. **Doğrulandı (kullanıcı,
   gerçek tarayıcı):** panel giriş hız sınırı çalışıyor — 5 yanlış
   denemeden sonra kilitleniyor. `npm run lint`/`build` bu oturumda TEKRAR
   çalıştırılıp (InlineScript kaldırıldıktan sonra) temiz geçtiği teyit
   edilmeli; ayrıca tarayıcıda `/panel/icerikler/hero`,
   `/panel/icerikler/hakkimizda`, `/panel/ayarlar` (Bildirimler bloğu) elle
   test edilmeli, gerçek bir Resend API anahtarıyla uçtan uca bir e-posta
   gönderimi henüz denenmedi. Detay: `KARAR-GUNLUGU.md`, "dokuzuncu oturum".
0f. **(ÇÖZÜLDÜ, sonra KRİTİK bir açık bulunup TEKRAR düzeltildi — bkz. 0h)**
   ~~Panel girişine IP bazlı hız sınırı/kilitleme~~ eklendi, kullanıcı ilk
   sürümü gerçek tarayıcıda (tek tarayıcı, sıralı deneme) doğruladı. Detay:
   `KARAR-GUNLUGU.md`, "dokuzuncu oturum devamı"; `GUVENLIK.md` madde 19.
0g. **(Kod tarafı tamamlandı, tarayıcıda kısmen doğrulandı — bkz. 0h'deki
   ek düzeltmeler)** Ziyaretçi sitesine (`/ekip`, `/iletisim`) ve panele
   (`/panel` Özet ve `/panel/giris` dışında neredeyse tüm sayfalar, 18
   sayfa) breadcrumb (yol izi) eklendi — `components/ui/Breadcrumbs.tsx`,
   [id] sayfalarında dinamik kaydın adını (ör. hizmet başlığı, SSS sorusu)
   gösteriyor. Ziyaretçi tarafında ayrıca `BreadcrumbList` JSON-LD (SEO
   bonusu). Kullanıcı, tarayıcıda kendim Claude in Chrome ile doğrulama
   yapmamı istedi — SSS'ye gerçekten uzun bir soru eklenip breadcrumb
   kırpmasının ÇALIŞTIĞI, koyu modda okunaklı olduğu, panel/giriş
   sayfalarında konsol hatası kalmadığı doğrulandı. Detay:
   `KARAR-GUNLUGU.md`, "dokuzuncu oturum devamı — breadcrumb".
0h. **(ÇÖZÜLDÜ — 2026-08-19'da migration'ın ZATEN uygulanmış olduğu
   doğrulandı, tipler yenilendi, `npm test` 54/54 + 3/3 yeşil.)**
   Kullanıcı "çok yüzeysel çalışıyorsun" diye haklı bir eleştiri yaptı — bu
   oturumun TÜM diff'i (52 dosya) 5 boyutlu, adversarial-doğrulamalı bir
   çok-ajanlı review'a verildi. **6 GERÇEK sorun bulundu ve DÜZELTİLDİ:**
   (1) **[YÜKSEK]** Login hız sınırı ATOMİK DEĞİLDİ — paralel istekler "5
   deneme/15 dakika" kilidini fiilen atlatabiliyordu (klasik TOCTOU); artık
   `check_and_reserve_login_attempt` Postgres fonksiyonuyla (advisory lock)
   gerçekten atomik. (2) **[ORTA]** Aynı açık iletişim formunda da vardı,
   `submit_contact_message_if_allowed` ile düzeltildi. (3-4) **[YÜKSEK]**
   `/ekip` ve `/iletisim` sayfalarında (2026-08-13'ten beri, bu oturumdan
   ÖNCE) hiç `<h1>` yoktu — `SectionHeader`/`TeamSection`/`ContactSection`'a
   `headingLevel="h1"` desteği eklenip bu iki sayfaya uygulandı. (5)
   **[DÜŞÜK]** `Breadcrumbs.tsx`'teki tek İngilizce `aria-label` Türkçeye
   çevrildi. 2 bulgu (breadcrumb hover kontrastı, coreValues test eksikliği)
   incelenip projenin kendi felsefesiyle tutarlı/kasıtlı bulunarak
   çürütüldü, düzeltme YAPILMADI. **Yeni migration:**
   `supabase/migrations/20260818150000_add_atomic_rate_limit_functions.sql`
   — ~~henüz gerçek Supabase projesine uygulanmadı~~ **(2026-08-19'da
   DÜZELTİLDİ: aslında uygulanmış. `pg_proc` doğrudan sorgulanarak üç
   fonksiyonun da var olduğu ve imzalarının koddaki çağrılarla birebir
   eşleştiği doğrulandı — bu not, uygulandıktan sonra güncellenmeyi
   unutmuş eski bir kayıttı. `npm run types:generate` ile
   `types/database.types.ts`'in `Functions` bloğu da yenilendi, artık üç
   fonksiyonu içeriyor. `npm test` 54/54 birim + 3/3 e2e ile iletişim
   formunun ve giriş akışının GERÇEKTEN çalıştığı doğrulandı.)** Detay:
   `KARAR-GUNLUGU.md`, "Kullanıcı geri bildirimi: 'çok yüzeysel'" ve
   2026-08-19 kayıtları.
0i. **(YENİ, `npm run lint`/`build` temiz — gerçek ekran görüntüsü
   doğrulaması hâlâ yapılmadı, araç bu ortamda arızalıydı)** Footer
   metinlerinin okunabilirliği artırıldı (kullanıcı isteği: "yazılar çok
   küçük, genişlik de az geldi") — firma adı 20→25px, adres/telefon/
   e-posta/bağlantılar 16→20px, alt başlıklar/telif 13→16px, sütun
   kırılması `md:`(768px)'e alındı, firma bilgisi sütunu daha geniş.
   Detay: `KARAR-GUNLUGU.md`, "Footer okunabilirliği artırıldı". **Ayrıca
   fark edilen ilgisiz bir konu:** Panel → Ayarlar → Sayfa Başlığı'nda
   muhtemelen yazım hatasıyla "tofe İnşaat" yazılı ("Akme İnşaat" yerine)
   — ~~kullanıcıya bildirildi, düzeltme onayı bekleniyor.~~ **(KAPANDI,
   2026-08-19: kullanıcıya canlı sitede hâlâ göründüğü [tarayıcı sekmesi +
   Google arama sonucu] tekrar hatırlatıldı, kullanıcı "tofe İnşaat olarak
   kalabilir, bir problem görmüyorum" dedi. BİLİNÇLİ BİR KARAR — bundan
   sonraki oturumlar bunu hata sanıp tekrar gündeme GETİRMEMELİ.
   Değiştirmek isterse: Panel → Ayarlar → Sayfa Başlığı, kod değişikliği
   gerekmez.)**
0d. **(TAMAMLANDI — 2026-08-19, onuncu oturum.** Sıra: Hizmetler → Projeler →
   Referanslar/İstatistikler/SSS/CTA → Footer → Ekip; her bölüm ayrı ayrı
   kullanıcıya gösterilip onaylandı. Yeni paylaşılan `components/ui/
   ImagePlaceholder.tsx` ("görsel yoksa" dekoratif yer tutucu, madde 0d'nin
   kendi önerisiydi); kişi kartlarında bilinçli olarak onun yerine baş harf
   rozeti kullanıldı. Ortak hover dili (yükselme + marka renkli ince çerçeve
   + görselde yakınlaşma) tüm kart bölümlerine yayıldı. **İki "veri var,
   ekranda yok" bulgusu kapatıldı:** `projects.category` kartta hiç
   gösterilmiyordu, `testimonials.rating` ise sorguda bile seçilmiyordu.
   Kullanıcı isteğiyle `rating` kesirli hale getirildi (yeni migration
   `20260819120000_...`, integer → numeric(2,1), yarım yıldız desteği —
   UYGULANDI). **Madde 9 da bu iş sırasında tamamen çözüldü**, aşağıya bak.
   `npm run build` + `npm test` (54/54 + 3/3) temiz. Detay:
   `KARAR-GUNLUGU.md`, 2026-08-19.) ~~Ziyaretçi
   sitesinin (inşaat firması sayfası) görsel zenginleştirmesi YARIM KALDI —~~
   kullanıcı "tasarım basit/yüzeysel, div yazıp geçmişim gibi" dedi, kapsam
   panel+giriş sayfası+Navbar/Hero (TAMAMLANDI, sekizinci oturum, bkz.
   `KARAR-GUNLUGU.md`) ve ziyaretçi sitesinin geri kalanı (HENÜZ
   BAŞLANMADI) olarak ikiye bölündü. Sırayla yapılacaklar: **Hizmetler →
   Projeler → Referanslar/İstatistikler/SSS/CTA → Footer.** Yeni
   `components/ui/` bileşenleri (Badge, Tooltip, TextScramble) ve
   `app/globals.css`'teki yeni animasyon utility'leri (`.animate-fade-in-up`
   vb.) zaten hazır, doğrudan kullanılabilir. Ayrıca fark edilen ama henüz
   ele alınmayan bir sistemik boşluk: gerçek görsel olmadığında bazı
   bölümler (ör. `AboutSection.tsx`'in görsel yer tutucusu) tamamen BOŞ
   render oluyor (`bg-surface-raised` renginde, görünmez bir kutu) — Hero'da
   yapılan degrade+ızgara deseni gibi paylaşılan bir "görsel yoksa" dekoratif
   yer tutucu bileşeni bu turda tasarlanabilir.
0b. **(ÖNCELİĞİ DÜŞÜRÜLDÜ — kullanıcı kararı, 2026-08-19.** Kullanıcıya
   doğrudan soruldu, cevabı: "şu an eksik olanlar dediklerinin ehemmiyeti çok
   değil". Karar tutarlı: `MIMARI.md` madde 0 bu projenin gerçek bir
   müşteriye canlıya ALINMADIĞINI, `KURULUM.md` ise satış modelinin "tek
   müşteri = tek kurulum" olduğunu söylüyor — her müşteri kendi Vercel
   projesinde kendi `ACTIVE_TENANT_DOMAIN`'iyle çalışıyor, dolayısıyla tek
   deploy içinde tenant seçen bir arayüz fiilen gerekmiyor. **Sonraki
   oturumlar bunu "en yüksek öncelik" diye tekrar gündeme GETİRMEMELİ**;
   PRD madde 3.2 ile kod arasındaki bu fark bilinen ve kabul edilmiş bir
   boşluktur. Gerçekten çok kiracılı TEK deploy senaryosuna geçilirse madde 6
   (host-header çözümlemesi) ile birlikte yeniden açılır.)
   ~~Panel gerçekte çok-kiracılı değil:~~ yeni tenant
   oluşturma, tenant seçme/listeleme, demo katalog import (PRD madde
   3.2) hiç yok — panel `getActiveTenantId()` üzerinden tek bir sabit
   tenant'a (Akme İnşaat) kilitli. Bu, madde 6'daki "host-header
   çözümlemesi" ile aynı kökten ama ondan daha büyük bir boşluk —
   teknik bir ayrıntı değil, ürünün "tek panel = platformun tüm
   yönetim merkezi" vaadinin eksik kalan çekirdeği.
1. ~~Diğer 5 bucket için bucket+RLS+yükleme akışı~~ — 2026-08-18'de
   Hizmetler/Referanslar/Ekip için TAMAMLANDI: 5 bucket + RLS uygulandı,
   Projeler'deki desenle birebir aynı yükleme UI'ı kuruldu, kullanıcı
   gerçek tarayıcıda uçtan uca doğruladı, commit'lendi/push'landı. Aynı
   oturumda görsel boyut sınırı da 5MB'dan **10MB**'a çıkarıldı
   (`MAX_IMAGE_SIZE_BYTES`) — kaliteli DSLR/drone fotoğraflarını
   kapsasın diye. ~~Hero ve Hakkımızda hâlâ açık — bu ikisinin panelde
   HİÇ içerik düzenleme ekranı yok~~ — **dokuzuncu oturumda eklendi:**
   `/panel/icerikler/hero` ve `/panel/icerikler/hakkimizda` (metin +
   `BrandImageUploader` genelleştirilip `hero`/`about` bucket'larına
   bağlandı), henüz `npm run lint`/`build` ile doğrulanmadı (bkz. madde 0e).
2. ~~Vitest/Playwright kur~~ — 2026-08-17'de tamamlandı, `npm test` 3x
   yeşil doğrulandı (bkz. `TEST-STRATEJISI.md` madde 10-12). Kapsanmayan
   alanlar (madde 12) için ayrı bir öncelik kararı bekliyor: bileşen
   render testleri, diğer 6 doğrulama şeması, Projeler/Referanslar/SSS/
   Ekip için ayrı e2e, açık/koyu tema geçişi, CI kurulumu.
3. ~~İletişim formuna bir e-posta bildirimi eklenmeli~~ — dokuzuncu
   oturumda Resend ile eklendi (`tenants.contact_recipient_email`, panel →
   Ayarlar → Bildirimler'den ayarlanır), henüz canlı doğrulanmadı (bkz.
   madde 0e).
4. Site tasarımı ilerledikçe `KURUMSAL-SITE-STANDARTLARI.md`'deki kontrol listesini
   madde madde işaretle.
5. Gerçek görsel(ler) Storage'a yüklenince Lighthouse'u tekrar çalıştırıp
   sayfa ağırlığındaki gerçek görsel etkisini ölç — artık **5 font**
   build-time yüklendiği için (2026-08-15) bu ölçüm eskisinden daha da
   önemli.
6. Host header'a göre gerçek tenant çözümleyen `proxy.ts` mantığı yazılınca
   (a) `getActiveTenantId()`'i sabit domain yerine parametreye çevir, (b)
   aynı `proxy.ts`'e tenant/domain bazlı panel erişim engelini de ekle —
   Next.js proje başına tek proxy dosyasına izin veriyor, ikisi birleşecek
   (bkz.
   `MIMARI.md` madde 7).
7. Mentör değerlendirmesindeki küçük-orta bulgular (`ActionResult<T>`
   tutarsızlığı, `panelQueries.ts` bölünmesi) — kullanıcı isterse ele
   alınacak, şu an açık karar bekliyor.
8. Gerçek domain'e deploy sonrası SEO doğrulama adımları — Google Search
   Console'a sitemap gönderimi, gerçek URL ile Zengin Sonuçlar Testi
   tekrarı, WhatsApp/LinkedIn paylaşım önizlemesi. Tam liste:
   `docs/SEO-PERFORMANS.md`, "Yayın Sonrası SEO Kontrol Listesi".
9. **(ÇÖZÜLDÜ — 2026-08-19.** Kök neden: **DB kaydı, fonksiyon değil.** Seed
   verisindeki `*_path` değerleri bucket adını ÖNEK olarak taşıyordu
   (`projects/vadi.jpg`), `getPublicImageUrl(bucket, path)` bir kez daha
   eklediği için yol ikileniyordu. Sadece bildirilen tabloya bakılmadı — 9
   kolon/6 bucket tarandı, **7 kırık yol** bulundu: `team_members.photo_path`
   ×4 (**hepsi yayındaydı**, ziyaretçi 4 kırık istek görüyordu),
   `projects.image_path` ×2 ve `testimonials.logo_path` ×1 (taslak). Yedisi
   de hiç var olmamış dosyalara işaret ediyordu → `null`'a çekildi, bileşenler
   artık yer tutucu gösteriyor. Panelden yüklenmiş gerçek yollara
   (`<tenant_id>/<uuid>.png`) dokunulmadı. Öncesinde ve sonrasında tarama
   koşuldu, sonuç: sıfır kırık yol. Detay: `KARAR-GUNLUGU.md`, 2026-08-19.)
   ~~Proje görselleri için~~
   `.../storage/v1/object/public/projects/projects/<dosya>.jpg` gibi
   "projects/" önekinin İKİ KEZ tekrarlandığı bir Storage yolu 400
   hatası veriyor — muhtemelen `getPublicImageUrl()` çağrısına zaten
   "projects/" önekli bir `image_path` veriliyor (bkz.
   `lib/supabase/storage.ts`). Kaynak DB kaydı mı yoksa fonksiyon mu
   hatalı, henüz belirlenmedi.

10. **(ÇÖZÜLDÜ — 2026-08-20, aynı gün. Açık GERÇEKTİ ve canlı veritabanında
    doğrulandı:** üç fonksiyon için de
    `has_function_privilege('anon', p.oid, 'execute')` → `true` döndü.
    Düzeltme migration'ı `20260820120000_revoke_rpc_execute_from_anon.sql`
    yazıldı, kullanıcı Supabase'de çalıştırdı, **doğrulama sorgusu tekrar
    koşuldu: anon/authenticated artık `false`, `service_role` `true`.**
    Revoke'tan ÖNCE kod okunarak her iki çağrının da service role
    istemcisiyle yapıldığı teyit edildi (`app/panel/giris/page.tsx:46`,
    `components/site/contact/actions.ts:84`) — bu kritikti: giriş hız sınırı
    kullanıcı henüz giriş yapmamışken, iletişim formu anonim ziyaretçiyle
    çalışıyor; anon istemcisi kullanılsaydı revoke ikisini de kırardı.
    `GUVENLIK.md` madde 17'ye "bu denetimin kör noktası vardı" başlıklı bir
    bölüm eklendi — asıl ders: "anon ne yapabilir" sorusu yalnızca
    `pg_policies` taranarak cevaplanamaz, fonksiyon yetkileri ayrı bir
    yüzeydir. **Kalan iki küçük iş:** `login_attempts` için TTL/temizlik
    (KVKK saklama süresi işiyle birlikte, madde 13) ve
    `scripts/test-rls.mjs`'e anon istemcisiyle RPC çağırma testi eklemek.)**

    ~~**(YENİ — 2026-08-20 mentör denetimi, EN YÜKSEK ÖNCELİK.)**~~
    `supabase/migrations/20260818150000_add_atomic_rate_limit_functions.sql`
    içindeki üç fonksiyon da `security definer` ve dosyada **hiç `revoke`
    yok** — yalnızca `grant execute … to service_role` var. PostgreSQL yeni
    fonksiyonlarda EXECUTE'u varsayılan olarak PUBLIC'e verir ve Supabase
    `public` şemasında anon/authenticated için ayrıca varsayılan yetki
    tanımlar; bu durumda `anon` üç RPC'yi de PostgREST üzerinden
    çağırabilir. Anon key zaten tasarım gereği herkese açık (site JS
    paketinde). Üstelik `submit_contact_message_if_allowed` içinde
    `if p_ip is not null then` bloğu hız sınırının TAMAMINI sarıyor, yani
    `p_ip: null` gönderen bir istek honeypot'u, zod doğrulamasını ve
    15dk/3 mesaj sınırını hep birden atlayıp doğrudan INSERT'e düşüyor.
    Bu, `GUVENLIK.md` madde 2/17'nin "anon istisnasız hiçbir tabloya
    yazamaz" iddiasını doğrudan çürütürdü — **madde 17'deki denetim yalnızca
    TABLO politikalarını taramış, fonksiyon yetkilerine hiç bakmamış.**

    **Önce DOĞRULA** (Supabase SQL Editor; düzeltmeden önce `true` dönerse
    açık gerçek, `false` dönerse zaten kapalıymış demektir):

    ```sql
    select has_function_privilege('anon',
      'public.submit_contact_message_if_allowed(uuid,inet,integer,integer,text,text,text,text,text)',
      'execute');
    ```

    **Sonra düzelt** (yeni migration, ör. `20260820120000_revoke_rpc_execute_from_anon.sql`):

    ```sql
    revoke execute on function public.check_and_reserve_login_attempt(inet, integer, integer)
      from public, anon, authenticated;
    revoke execute on function public.delete_login_attempt(uuid)
      from public, anon, authenticated;
    revoke execute on function public.submit_contact_message_if_allowed(
      uuid, inet, integer, integer, text, text, text, text, text
    ) from public, anon, authenticated;
    ```

    Aynı işte: `login_attempts` tablosuna bir TTL temizliği ekle (tabloda
    hiç silme politikası yok, anon tetiklemesiyle sınırsız büyüyebilir) ve
    `scripts/test-rls.mjs`'e anon istemcisiyle bu üç RPC'yi çağırma testi
    ekle — mevcut script yalnızca `services` ve `contact_messages`
    tablolarını sınıyor, RPC yüzeyini hiç test etmiyor. Düzeltmeden sonra
    `GUVENLIK.md` madde 17'ye "fonksiyon yetkileri de denetlendi" satırı
    eklenmeli.

11. **(YENİ — 2026-08-20 denetimi.)** Panel giriş hız sınırı, Supabase Auth
    uç noktasına doğrudan istek atılarak tamamen atlatılabiliyor:
    `login_attempts` sayacı yalnızca `/panel/giris`'ten geçen denemeleri
    sayıyor, ama `POST /auth/v1/token?grant_type=password` anon key'le
    dışarıdan doğrudan çağrılabiliyor. Asıl sınır Supabase katmanında olmalı
    (Dashboard → Authentication → Attack Protection: CAPTCHA + Auth rate
    limit). Mevcut mekanizma silinmemeli, ikinci katman olarak değerli.
    Ayrıca `GUVENLIK.md` madde 19'daki "bilinçli sınırlar" listesine bu
    baypas yazılmalı — şu an koruma, olduğundan güçlü dokümante edilmiş
    durumda. **İlgili:** `requireAdminUser()` yalnızca "oturum var mı" diye
    bakıyor, kullanıcının admin olduğunu hiçbir yerde doğrulamıyor; bugün
    tek kullanıcı olduğu için etki yok ama koruma tamamen "Supabase'de başka
    kullanıcı yok" varsayımına dayanıyor ve bu varsayım kodda yazılı değil.
    Yapılacak: (a) Dashboard'da self-signup'ı kapat, (b) beklenen admin
    kimliğini kodda doğrula.

12. **(YENİ — 2026-08-20 denetimi.)** Erişilebilirlikte otomatik denetimin
    **(2026-08-21 güncellemesi — TEŞHİS DEĞİŞTİ.)** Bu maddedeki
    "`text-brand` 13px'te 3.56:1" örneği artık geçersiz (o kullanımlar
    2026-08-21'de düzeltilmişti). Yeni denetim AA ihlalini iki BAŞKA
    yerde buldu: `ContactSection`'daki üç iletişim bağlantısı 16px'te
    4.26:1 ve proje filtre butonunun hover hâli 13px'te 3.10:1. Ayrıca
    form/buton KENARLARI (WCAG 1.4.11, eşik 3:1) bu oturumda ayrı bir
    `--color-control` token'ıyla çözüldü. **Yedi erişilebilirlik alt
    maddesi (h1 garantisi, odak dönüşü, odak tuzağı seçicisi, 5 formda
    eksik ref, SSS akordiyonu, main landmark, Toast aria-live) AYNEN
    duruyor.**
    (Lighthouse 100) göremediği açık maddeler: ana sayfada `<h1>` garantisi
    yok (tek `<h1>` Hero'dan geliyor ve Hero, Sayfa Düzeni'nde
    **gizlenebilir** bir satır — Navbar/Footer gibi "Zorunlu" değil; en
    temiz çözüm Hero'yu `RequiredSectionRow`'a almak); modal kapanınca odak
    tetikleyiciye dönmüyor ve `useDialogBehavior`'daki odak tuzağı seçicisi
    `input`/`select`/`textarea`'yı atlıyor (ikisi de aynı hook'ta, birlikte
    düzeltilmeli); 11 formun 5'inde `FormErrorSummary`'ye `ref` bağlanmamış
    (ThemeEditor, SeoEditor, NotificationSettingsEditor, HeroEditor,
    AboutEditor); SSS akordiyonunda kapalı panel erişilebilirlik ağacından
    çıkarılmıyor; `/panel/giris`, 404 ve hata sayfalarında `<main>` landmark
    yok; Toast'lar `aria-live` bölgesi içerikle birlikte DOM'a girdiği için
    duyurulmuyor. Ayrıca `text-brand` koyu temada 13px metinlerde 3.56:1 —
    `presets.ts`'in arayüz yorumu "≥4.5:1 doğrulandı" diyor ama aynı
    dosyadaki preset yorumu gerçek sayıyı (4.26/3.56) dürüstçe yazıyor;
    iki yorum çelişiyor, biri düzeltilmeli.

13. **(YENİ — 2026-08-20 denetimi.)** KVKK paketi somut plana bağlandı
    (`GUVENLIK.md` madde 10'daki açık maddenin uygulanabilir hâli): üç
    politika sayfası (`/kvkk-aydinlatma`, `/gizlilik`, `/cerez-politikasi`) +
    Footer bağlantıları + `sitemap.ts`'e ekleme; iletişim formuna aydınlatma
    bildirimi ve **ön işaretli OLMAYAN** zorunlu onay kutusu
    (`z.literal(true)`) + `contact_messages`'a `consent_at` / `consent_version`
    kolonları; yurt dışına aktarım beyanı (Supabase, Vercel, Resend);
    `contact_messages` ve `login_attempts` için saklama süresi + otomatik
    silme. Metinler koda sabitlenmemeli — firma adı/adres/e-posta
    `site_settings`/`contact_sections`'tan gelmeli (`AI-KURALLARI.md` madde
    5.5). **Sürpriz iyi haber:** gerçek çerez envanteri çıkarıldı — ziyaretçiye
    HİÇBİR çerez yazılmıyor (Supabase auth çerezleri yalnızca panel
    oturumunda, tema tercihi `localStorage`). Yani onay banner'ı GEREKMİYOR,
    bilgilendirme metni yeterli; `KURUMSAL-SITE-STANDARTLARI.md`'deki "çerez
    bildirimi ekle" maddesi bu bulguya atıfla güncellenmeli.

14. **(YENİ — 2026-08-20 denetimi.)** Ürün boşluğu, PRD madde 3.4'te sözü
    **(2026-08-21: KISMEN KAPANDI.)** Panele **kurulum kontrol listesi**
    eklendi: Özet ekranı artık şablondan gelen yer tutucuların
    hangilerinin HÂLÂ yayında olduğunu, hangi varlıkların (logo/favicon/
    OG/SEO açıklaması) eksik kaldığını söylüyor ve her maddeyi ilgili
    ekrana bağlıyor. **Kalanlar aynen duruyor:** İstatistikler ve Eylem
    Çağrısı panelden hâlâ düzenlenemiyor (yalnızca SQL ile), Medya
    Kütüphanesi 6 bucket'tan 1'ini listeliyor ve ekran metni hâlâ yanlış
    bilgi veriyor, silme eylemleri Storage'a dokunmadığı için yetim dosya
    bırakıyor.
    verilmiş ama panelde yok: **İstatistikler** ve **Eylem Çağrısı**
    içerikleri hiçbir ekrandan düzenlenemiyor. Sonuç: müşterinin canlı
    sitesinde kendi firması hakkında şablondan gelen uydurma rakamlar kalıcı
    olarak görünebilir ve bu yalnızca SQL ile değiştirilebilir. Ayrıca
    **Medya Kütüphanesi** 6 bucket'tan yalnızca `projects`'i listeliyor ve
    ekranın kendi metni "diğer içerik türleri için görsel yükleme henüz
    eklenmedi" diyerek kullanıcıya doğrudan yanlış bilgi veriyor (5 bucket
    2026-08-18'de eklenmişti). Buna bağlı: hiçbir silme eylemi Storage'a
    dokunmadığı için silinen kayıtların görselleri yetim kalıyor ve panelden
    hiç görünmüyor.

15. **(YENİ — 2026-08-20 denetimi.)** Mimari borç — bu raporun kök nedeni,
    "temizlik" değil **hata önleme** işi. Sırasıyla: (a) 9 görsel
    yükleme/silme eylem çifti, 8 dosya, 1.398 satır, birebir aynı iskelet →
    `lib/panel/createImageActions.ts` fabrikası (~1.100 satır siliniyor,
    yetim dosya sorunu tek noktada çözülüyor); (b) `BrandImageUploader`
    zaten genelleştirilmiş ve 5 yerde kullanılıyor ama 4 CRUD ekranı onun
    608 satırlık kopyasını taşıyor (~560 satır); (c) 5 CRUD dosyasındaki
    toggle/move/delete blokları, 602 satır, yalnızca tablo adı değişiyor.
    Önce (a), sonra (c) — aynı fabrika deseni ikincisinde ucuzlar. Ayrıca:
    zod hata→alan eşlemesi 13 kez kopyalanmış ve `issue.path[0]` guard'sız
    (yol taşımayan bir `.refine()` hatası kullanıcıya hiç gösterilmeden
    yutulur) → tek bir `toFieldErrors()` yardımcısı, bu bugün yapılabilir.
    `noUncheckedIndexedAccess` açılırsa çıkan hata sayısı ölçüldü: **16**.

16. **(YENİ — 2026-08-20 denetimi.)** Sorgu katmanı tüm hataları yutup
    `[]`/`null` dönüyor; "kayıt yok" ile "DB erişilemiyor" ayırt edilemiyor.
    İki somut sonucu var: düzenleme sayfası geçici hatada gerçek bir 404
    gösterip kullanıcıya kaydın silindiğini düşündürüyor; ve **statik üretim
    sırasında** boş dönen bir sorgu boş sayfayı önbelleğe kalıcı yazıyor,
    bir sonraki `revalidatePath`'e kadar kendi kendine iyileşmiyor. Ziyaretçi
    sorgularında "satır yok" boş dönmeli ama GERÇEK hata fırlatmalı (Next.js
    o zaman sayfayı önbelleğe yazmaz); panel tarafında `null` yerine
    `{ ok: false, reason }` dönülmeli. Tema ve Hero sorgularının catch
    bloklarında `console.error` bile yok.

17. **(YENİ — 2026-08-20 denetimi.)** Doküman-kod sapması, 9 nokta. Öncelik
    **(2026-08-21: BÜYÜK ÖLÇÜDE KAPANDI.)** `MUSTERİ-KILAVUZU.md` ve
    `TESLIM-PAKETI.md` zaten `1ec0744`'te düzeltilmişti. Bu oturumda:
    `KURULUM.md` (6 nokta), `GUVENLIK.md` madde 11, `TASARIM-SISTEMI.md`
    5.1 ("istisnası yok" iddiası yazıldığı anda yanlıştı),
    `VERİ-MODELİ.md` (migration listesi 20'de kalmıştı, 21-28 eklendi;
    `contact_sections.is_published` ve `hero_sections.variant` notları),
    `SEO-PERFORMANS.md` (sitemap içeriği), `README.md` (2 eksik doküman +
    Node sürümü). **Kalan:** `TEMA-MIMARISI.md` hâlâ artık var olmayan
    FOUC mekanizmasını anlatıyor; `MIMARI.md` madde 11 "Kapsam" paragrafı.
    sırası: **`MUSTERİ-KILAVUZU.md`** (4 noktada uyuşmuyor, birinde ürünün
    yaptığının TERSİNİ söylüyor — müşteriye verilen belge) ve
    **`TESLIM-PAKETI.md`** (4 somut sayı/iddia gerçeğin dışında — aynı
    gerekçe). Sonra: `TEMA-MIMARISI.md` (anlattığı FOUC mekanizması artık
    kodda yok, `forceLightScript` dokuzuncu oturumda kaldırıldı);
    `TASARIM-SISTEMI.md` (kendi içinde çelişiyor ve "`components/site/` hâlâ
    boş" diyor — 30'dan fazla bölüm bileşeni var; kontrast tablosu da
    yukarıdaki madde 12'yi yansıtmıyor); `SEO-PERFORMANS.md`
    (`getSiteUrl()` öncelik sırasını yanlış anlatıyor, `VERCEL_URL`'i
    "kendiliğinden düzeltir" diye sunuyor — kod ve `MIMARI.md` tersini
    söylüyor, geçmişte gerçek bir SEO hatasına yol açmış konu);
    `MIMARI.md` madde 11 ("Kapsam" paragrafı iki oturum öncesini anlatıyor);
    `VERİ-MODELİ.md` (`og_image_path` yedeği, var olmayan WhatsApp butonu,
    hiçbir sorguda okunmayan `tenants.is_published`); `DURUM.md` madde 0d
    ("TAMAMLANDI" ama tarif ettiği "görsel yoksa boş kutu" boşluğu
    `AboutSection` ve `HeroVariantB`'de duruyor).

18. **(YENİ — 2026-08-20 denetimi.)** Kalan SEO/performans maddeleri:
    **(2026-08-21: KISMEN KAPANDI.)** `priority` prop'u kaldırıldı — hero
    ve proje detay görseli `preload`, kart ızgaraları `loading="eager"`
    (kartların `<head>`'e preload koyup gerçek LCP ile yarışması bulgusu).
    Sitemap artık proje sayfalarını da bildiriyor. **Kalanlar:** `/api/og`
    önbelleksiz, `latin-ext` preload yok, OG alanları eksik
    (`og:type`/`og:locale`/`og:site_name`/`og:url` — proje detay sayfası
    hariç), proxy matcher tüm trafikte `getUser()`, panelde `loading.tsx`
    yok, `localBusiness.ts` köşeli parantezli yer tutucuları elemiyor
    (ama panel Özet ekranı artık bunları KULLANICIYA bildiriyor).
    `/api/og` sitedeki tek dinamik public rota ve hiç önbelleklenmiyor (her
    istekte 2 Supabase sorgusu + PNG üretimi — kimlik doğrulamasız kaynak
    tüketim kapısı); `priority` prop'u Next.js 16'da kullanımdan kalktı ve
    ekran altındaki 3 proje görselini gerçek LCP ile yarıştırıyor;
    `seed-template.sql`'deki `[Adres — panelden güncelleyin]` yer tutucuları
    schema.org JSON-LD'sinde canlı yayınlanıyor (`localBusiness.ts` köşeli
    parantezle başlayan değerleri elemeli); Footer telif yılı ve sitemap
    `lastModified` build anında donuyor; Geist için `latin-ext` subset'i
    preload edilmiyor (Türkçe ğ/ş/İ harfleri); OG kartında `og:type`,
    `og:locale`, `og:site_name`, `og:url` ve görsel boyutları yok; proxy
    matcher'ı tüm public trafikte gereksiz `getUser()` çağırıyor; panelde
    hiç `loading.tsx` yok.

19. **(YENİ — 2026-08-20 denetimi.)** Kalan test maddeleri, risk sıralı:
    **(2026-08-21: KISMEN KAPANDI.)** Üç yeni test dosyası eklendi —
    `lib/theme/globalsTokens.test.ts` (b maddesinin ruhu: token kontrast
    değişmezleri, `globals.css`'i kaynaktan okuyup eşikleri doğruluyor),
    `lib/panel/setupChecklist.test.ts`, `lib/slug.test.ts`. Birim test 95 →
    120. **Kalanlar:** (a) `requireAdminUser` taraması, (c) iletişim formu
    e2e'sinin DB doğrulaması, (d) admin e2e'sinin `is_published: false`
    yazması, (e) bileşen render testleri.
    (a) 19 dosyadaki 40+ sunucu eyleminde `requireAdminUser()` çağrısını
    doğrulayan hiçbir test yok — bunu bir test değil bir **tarama** ile
    çözmek daha ucuz: `app/panel/**/*actions.ts` dosyalarını okuyup her
    `export async function …Action` gövdesinde `requireAdminUser` geçtiğini
    doğrulayan ~20 satırlık tek bir Vitest testi, yeni eklenenleri de
    otomatik kapsar; (b) `THEME_PRESETS` için kontrast değişmez testi —
    yazılsaydı madde 12'deki `kurumsal-mavi` sorunu anında kırmızı dönerdi,
    araç (`lib/theme/contrast.ts`) zaten mevcut; (c) iletişim formu e2e
    testi mesajın DB'ye yazıldığını hiç doğrulamıyor, yani 2026-08-18'deki
    "sessizce yutulan mesaj" hatası tekrarlansa test yine yeşil geçer;
    (d) admin e2e testi üretim verisine yayınlanmış kayıt yazıyor — kayıt
    `is_published: false` ile oluşturulmalı ki sızsa bile ziyaretçi görmesin;
    (e) jsdom + Testing Library kurulu ama sıfır bileşen testi var —
    `useDialogBehavior` ve `FormErrorSummary`'den başlanmalı, ikisi de bu
    denetimde hata çıkardı.

20. **(YENİ — 2026-08-20, Vercel ortam değişkenleri doğrulandı.)**
    `npx vercel env ls` ile canlı ortam tarandı. `NEXT_PUBLIC_SITE_URL`,
    `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ve
    `NEXT_PUBLIC_SUPABASE_ANON_KEY` tanımlı (Production + Preview). **İki
    değişken EKSİK:**

    - **`RESEND_API_KEY` yok** → iletişim formu e-posta bildirimi canlıda
      HİÇ ÇALIŞMIYOR. `GUVENLIK.md` madde 10'da bu "henüz canlı
      doğrulanmadı" diye duruyordu; artık doğrulandı, gerçekten devre dışı.
      Veri kaybı YOK — mesaj `contact_messages`'a kaydediliyor, panelde
      anlık bildirimle görünüyor; yalnızca e-posta kanalı kapalı.
      **Karar gerekiyor:** ya anahtar eklenip özellik açılmalı, ya da
      "panel yeterli, e-posta kullanılmıyor" diye `GUVENLIK.md`'ye bilinçli
      karar olarak yazılmalı. Şu anki ara durum (kod var, doküman "açık
      madde" diyor, canlıda kapalı) en kötüsü.
    - **`ACTIVE_TENANT_DOMAIN` yok** → site çalışıyor ama
      `lib/supabase/queries.ts`'teki `|| "akmeinsaat.com.tr"` yedeğine, yani
      **kaynak koda gömülü demo değerine** dayanarak. `KURULUM.md` madde 8.2
      bu değişkeni eklemeyi açıkça söylüyor ve sorun giderme tablosu yanlış
      olursa "site tamamen boş açılır" diyor. Değişkenin tüm amacı,
      yorumunda yazdığı gibi, her müşterinin kendi Vercel projesinde kendi
      alan adını ayarlayıp kaynak kodda satır değiştirmemesi.

    ⚠️ `NEXT_PUBLIC_*` değişkenleri build sırasında HTML'e gömülür —
    değiştirdikten sonra **Redeploy** şart (Deployments → "..." → Redeploy).

21. **(YENİ — 2026-08-20.)** Canonical adres yalnızca `getKnownSiteUrl()`
    dolu olduğunda üretiliyor. İlk uygulamada `metadataBase`'e bağlıydı ve
    yerelde `tenants.domain`'e düşüp var olmayan bir adrese işaret ediyordu;
    **yanlış canonical, eksik canonical'dan zararlıdır** (arama motoruna
    "bu sayfa kopya, aslı şu adreste" der ve hedef gerçek değilse sayfa
    dizinden düşer). Bu yüzden yerel build'de ve CI'da canonical HİÇ
    çıkmaz — beklenen davranış, hata değil. Canlıda
    `NEXT_PUBLIC_SITE_URL` dolu olduğu için çıkıyor. Sonraki oturum
    "canonical kaybolmuş" diye paniğe kapılmasın.

## Açık sorular

Şu an aktif açık soru yok. Kullanıcı ürün mantığı hakkında birkaç ek nokta daha
paylaşacağını belirtti (2026-08-06) — gelince buraya ve `KARAR-GUNLUGU.md`'ye
işlenecek.

**Çözüldü:** `docs/RAKIP-ANALIZI.md` eklendi — 8 gerçek inşaat/mimarlık sitesi
incelenerek çıkarılan bölüm karşılaştırma tablosu ve "olması gereken 6 bölüm"
listesi (İletişim, Hakkımızda, Hero, Projeler/Portföy, Blog/Haberler, Hizmetler).
Bu liste bölüm kütüphanesi için referans alındı — **tek istisna: Blog/Haberler
bilinçli olarak kapsam dışı bırakıldı** (2026-08-06, bkz. `KARAR-GUNLUGU.md`).
