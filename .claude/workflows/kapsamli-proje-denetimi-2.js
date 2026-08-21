export const meta = {
  name: 'kapsamli-proje-denetimi-2',
  description: 'Projeyi 8 boyutta yeniden denetle: regresyon, mobil, koyu tema, performans, urun boslugu, teslim hazirligi',
  phases: [
    { title: 'Denetim', detail: '8 boyutta paralel inceleme' },
    { title: 'Dogrulama', detail: 'her bulguyu supheci bir ajan curutmeye calisir' },
  ],
}

const ROOT = 'C:/Users/234410084/staj-projesi'

const CONTEXT = `
# PROJE BAGLAMI

Kok dizin: ${ROOT}. Proje Turkce. Next.js 16 App Router + Tailwind v4 + Supabase + Resend.
Urun: insaat firmalarina satilan, "tek musteri = tek kurulum" kurumsal web sitesi hizmeti.
Platform sahibi gizli /panel'den tum icerigi yonetir; musterinin panel erisimi YOK.
Kullanici bu projeyi TESLIM ETMEK uzere — teslim hazirligi onemli bir boyut.

## MUTLAKA OKU
- ${ROOT}/AGENTS.md — "This is NOT the Next.js you know". Next.js API'si hakkinda
  iddiada bulunmadan ONCE ${ROOT}/node_modules/next/dist/docs/ altindaki ilgili
  kilavuzu OKU.
- ${ROOT}/docs/ — projenin beyni. DURUM.md (guncel durum + acik maddeler),
  PRD.md (kapsam ici/disi), TASARIM-SISTEMI.md, RAKIP-ANALIZI.md (93 sitelik
  gorsel tasarim analizi), GUVENLIK.md, TEST-STRATEJISI.md, MIMARI.md,
  KURULUM.md, MUSTERI-KILAVUZU.md, TESLIM-PAKETI.md.
  DURUM.md ve KARAR-GUNLUGU.md cok buyuk — grep/head/tail ile hedefli oku.

## BU OTURUMDA YENI YAPILANLAR — bunlari HATA olarak raporlama, ama REGRESYON acisindan incele
Son 8 commit (c3c5e2a..HEAD) ziyaretci sitesinin gorsel tasarimini degistirdi:
1. Hero: metin ortadan sol-alta, min-h-[85svh], degrade overlay, ikinci CTA
   metin baglantisina indi, dekoratif SVG dalga SILINDI.
2. Bolum zeminleri tek yuzeye indi (bg-surface-raised -> bg-surface, 7 bolum);
   ayrim artik SectionHeader'daki \`rule\` prop'u ile ince cizgi.
3. SectionHeader: eyebrow notr+buyuk harf, baslik font-semibold+tracking-tight.
4. StatsSection: bg-brand bandindan cikti, notr zemin + border-y, rakamlar
   text-h2/sm:text-h1 text-brand, <dl>/<dt>/<dd> yapisi, flex-col-reverse.
5. Fotograf kaplari 3:2'ye esitlendi (5 yer).
6. AboutSection yeniden yapilandirildi: degerler tam genislige cikti,
   items-start, line-clamp'ler kaldirildi, deger maddeleri "Baslik — aciklama"
   biciminde ayristiriliyor (value.split(/\\s+[—–-]\\s+/)).
7. TeamMemberCard unvani text-brand -> text-text-muted uppercase.
8. Panel: Tema>Calisma Saatleri TextField -> TextareaField; Hakkimizda>Degerler
   helpText guncellendi.
Ayrica app/globals.css'e --text-display (clamp) token'i eklendi.

## ZATEN BILINEN VE KAYITLI ACIK MADDELER — YENIDEN KESFETME
docs/DURUM.md "Siradaki adim" madde 11-21 bunlari zaten listeliyor:
- 11: panel giris hiz siniri Supabase Auth uzerinden atlatilabiliyor; requireAdminUser
  sadece oturum kontrolu yapiyor
- 12: erisilebilirlik acik maddeleri (ana sayfa h1 garantisi, modal odak donusu,
  useDialogBehavior odak tuzagi, 5 formda FormErrorSummary ref yok, SSS akordiyon
  hidden, /panel/giris+404+error'da main landmark yok, Toast aria-live)
- 13: KVKK paketi (3 politika sayfasi, form onayi, saklama suresi)
- 14: Istatistikler ve Eylem Cagrisi panelden duzenlenemiyor; Medya kutuphanesi
  6 bucket'tan 1'ini listeliyor; silme Storage'a dokunmuyor (yetim dosyalar)
- 15: mimari borc (9 kopyali imageActions ~1398 satir, 4 kopyali ImageUploader
  ~608 satir, 5 kopyali toggle/move/delete ~602 satir, zod hata eslemesi 13 kopya,
  noUncheckedIndexedAccess kapali)
- 16: sorgu katmani tum hatalari yutup []/null donuyor
- 17: dokuman-kod sapmasi 9 nokta
- 18: /api/og onbelleksiz, priority deprecated, sitemap lastModified build zamani,
  latin-ext preload yok, OG alanlari eksik, proxy matcher tum trafikte getUser
- 19: test bosluklari (requireAdminUser taramasi, THEME_PRESETS kontrast testi,
  e2e DB dogrulamasi, sifir bilesen testi)
- 20: Vercel'de RESEND_API_KEY ve ACTIVE_TENANT_DOMAIN tanimli DEGIL
- 21: canonical yalnizca getKnownSiteUrl() doluyken uretiliyor (bilincli)

**Bu maddeleri TEKRAR bulgu olarak yazma.** Ama: (a) bir maddenin artik
GECERSIZ oldugunu tespit edersen bunu YAZ; (b) bir maddenin dusunulenden
DAHA CIDDI oldugunu kanitlayabilirsen yaz; (c) tamamen YENI bir sey bul.

## BILINCLI KARARLAR — RAPORLAMA
1. Panelin gercek cok-kiraciligi yok (kullanici onceliksizlestirdi).
2. "tofe Insaat" sayfa basligi (kullanici bilincli tuttu).
3. E2E'nin CI'da olmamasi (gerekcesi TEST-STRATEJISI.md madde 15'te yazili).
4. Blog/Haberler, coklu dil, coklu rol, tenant'a login, page-builder — PRD madde 4'te kapsam disi.
5. Referanslar bolumunun sektorde nadir olmasi (RAKIP-ANALIZI'nde kayitli, urun karari).
6. Bolum varyanti kutuphanesini genisletmek — bilincli olarak elendi (DURUM.md'de gerekce var).

## BULGU KALITESI
- Her bulgu GERCEK dosya+satira dayanmali. Dosyayi ac ve oku, tahmin yurutme.
- Somut basarisizlik senaryosu yazamiyorsan RAPORLAMA.
- Turkce yaz. Severity: kritik | yuksek | orta | dusuk. Efor: kucuk | orta | buyuk.
`

const BULGU_SCHEMA = {
  type: 'object',
  properties: {
    bulgular: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          baslik: { type: 'string' },
          tip: { type: 'string', enum: ['hata', 'eksik', 'ozellik'], description: 'hata=bozuk, eksik=yapilmamis, ozellik=eklenebilecek yeni yetenek' },
          severity: { type: 'string', enum: ['kritik', 'yuksek', 'orta', 'dusuk'] },
          efor: { type: 'string', enum: ['kucuk', 'orta', 'buyuk'] },
          dosyalar: { type: 'array', items: { type: 'string' } },
          aciklama: { type: 'string' },
          senaryo: { type: 'string', description: 'Somut basarisizlik/eksiklik senaryosu' },
          oneri: { type: 'string' },
          kanit: { type: 'string', description: 'Okudugun gercek kod satiri/alinti' },
        },
        required: ['baslik', 'tip', 'severity', 'efor', 'dosyalar', 'aciklama', 'senaryo', 'oneri', 'kanit'],
      },
    },
    ozet: { type: 'string', description: 'Bu boyutun genel durumu, 3-5 cumle' },
    guclu_yonler: { type: 'array', items: { type: 'string' } },
  },
  required: ['bulgular', 'ozet', 'guclu_yonler'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          baslik: { type: 'string' },
          gercek: { type: 'boolean' },
          gerekce: { type: 'string' },
          duzeltilmis_severity: { type: 'string', enum: ['kritik', 'yuksek', 'orta', 'dusuk'] },
        },
        required: ['baslik', 'gercek', 'gerekce', 'duzeltilmis_severity'],
      },
    },
  },
  required: ['verdicts'],
}

const BOYUTLAR = [
  {
    key: 'regresyon',
    p: `# GOREVIN: REGRESYON DENETIMI — son 8 commit ne bozdu?

\`git diff c3c5e2a..HEAD\` ile bu oturumdaki TUM degisiklikleri oku (Bash ile).
Sonra degisen her dosyayi ac ve su sorulari sor:

1. **SectionHeader'a eklenen \`rule\` prop'u**: ana sayfa disinda kullanilan
   yerlerde (TeamSection/ContactSection \`rule={headingLevel === "h2"}\`) mantik
   dogru mu? Bir bolum panelden gizlenip sira degisirse ilk gorunen bolumun
   ustunde cizgi kalir mi, tuhaf gorunur mu?
2. **Zeminler tek yuzeye indi**: \`bg-surface-raised\` kullanan BASKA bilesenler
   (Card, Badge, Toast, panel bilesenleri, ProjectsExplorer'daki filtre
   butonlari) artik zeminle ayni renge mi dustu? \`grep -rn "bg-surface-raised"\`
   ile hepsini tara ve her birinin hangi zemin uzerinde durdugunu kontrol et.
3. **StatsSection**: \`<dl>\` icinde \`<div>\` sarmalayici + \`flex-col-reverse\`
   gecerli HTML mi, ekran okuyucu sirasi dogru mu? \`grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]\`
   tek bir istatistik varsa ne yapiyor (tum genisligi kaplar mi)?
4. **AboutSection'daki \`value.split(/\\s+[—–-]\\s+/)\`**: bir deger metninde
   BIRDEN FAZLA tire varsa ne olur? Tire ICEREN bir baslik ("Zemin-etudu — ...")
   yanlis bolunur mu? Bos deger, sadece tire, cok uzun baslik?
5. **--text-display clamp**: \`clamp(2.5rem, 7vw, 4.75rem)\` cok dar ekranda
   (320px) ve cok genis ekranda (2560px) ne veriyor? Hero basligi tasar mi?
6. **HeroVariantA**: overlay artik SADECE \`imageUrl\` varken render ediliyor.
   Fotograf YOKKEN beyaz metin \`bg-hero\` uzerinde — kontrast yeterli mi
   HESAPLA. Ayrica ikincil CTA'nin \`focus-visible:ring-offset-black/50\`
   siniifi gecerli bir Tailwind sinifi mi?
7. Silinen dekoratif dalganin yerine gecen sey var mi, hero ile sonraki bolum
   arasinda gorsel bir kopukluk olustu mu?

Semaya gore dondur.`,
  },
  {
    key: 'mobil',
    p: `# GOREVIN: MOBIL VE RESPONSIVE DENETIMI — bu alana HIC BAKILMADI

Projede simdiye kadarki tum gorsel dogrulama MASAUSTU ekran goruntuleriyle
yapildi. Mobil hic kontrol edilmedi. \`docs/TEST-STRATEJISI.md\` madde 6
responsive destegi sart kosuyor.

Su bilesenleri MOBIL (320-480px) ve TABLET (768px) acisindan tek tek incele:
- ${ROOT}/components/site/hero/HeroVariantA.tsx ve B — \`min-h-[85svh]\`,
  \`pt-32 pb-20\`, \`text-display\` clamp alt siniri 40px: dar ekranda baslik
  kac satira duser, metin ekrandan tasar mi, CTA butonlari sigar mi?
- ${ROOT}/components/site/stats/StatsSection.tsx — \`minmax(9rem,1fr)\` 320px'de
  kac sutun verir? 61px rakam + 13px etiket dar sutunda tasar mi?
- ${ROOT}/components/site/about/AboutSection.tsx — degerler \`grid-cols-1\`e
  duser mi, "Baslik — aciklama" mobilde okunakli mi?
- ${ROOT}/components/site/projects/* — kart izgarasi, MOZAIK varyanti
  (\`auto-rows-[160px] grid-cols-2\`) mobilde ne yapiyor? Filtre butonlari
  cok kategoride satir satir sarar mi?
- ${ROOT}/components/site/testimonials/TestimonialsGrid.tsx — yatay kaydirma
  var, mobilde calisir mi?
- ${ROOT}/components/site/Navbar.tsx + MobileMenu.tsx — mobil menu, tema
  switch'i, "Iletisim" butonu dar ekranda sigar mi?
- ${ROOT}/components/site/Footer.tsx — sutunlar mobilde nasil diziliyor?
- ${ROOT}/components/site/contact/ContactForm.tsx — form alanlari, buton.
- PANEL de dahil: ${ROOT}/components/panel/PanelShell.tsx, AdminListTable.tsx
  (tablo mobilde yatay kayiyor mu yoksa taşiyor mu?), ${ROOT}/app/panel/giris/page.tsx

Tailwind breakpoint'lerini (sm=640, md=768, lg=1024) kodda tek tek dogrula.
"Muhtemelen calisir" yazma — sinif dizisini oku ve dar ekranda ne olacagini
hesapla.

Semaya gore dondur.`,
  },
  {
    key: 'koyu-tema',
    p: `# GOREVIN: KOYU TEMA DENETIMI

Tasarim degisiklikleri agirlikla ACIK temada degerlendirildi. Koyu tema
sistematik olarak kontrol edilmedi.

Once ${ROOT}/app/globals.css'i tam oku: \`:root\` ve \`[data-theme="dark"]\`
bloklarindaki HER token'i karsilastir. Hangi token'lar koyu temada
tanimlanmis, hangileri acik temadaki degerinde kaliyor?

Sonra su hesaplamalari GERCEKTEN YAP (WCAG relative luminance formulu):
1. Yeni/degisen her renk ciftinin kontrast orani. Ozellikle:
   - \`text-brand\` 61px rakamlarda koyu \`bg-surface\` uzerinde (buyuk metin, esik 3:1)
   - \`text-text-muted\` yeni eyebrow'larda ve stats etiketlerinde (kucuk metin, esik 4.5:1)
   - \`border-neutral-300\` ayrac cizgisi koyu temada gorunur mu (UI bileseni, 3:1)
   - AboutSection'daki \`border-t border-neutral-300\` deger maddelerinde
   - StatsSection'in \`border-y\`'si
2. \`ImagePlaceholder\` koyu temada nasil gorunuyor (bg-surface + brand/text overlay)?
3. HeroVariantA fotografsizken: \`bg-hero\` (#183b6b koyu temada) uzerinde beyaz metin.
4. Panel bilesenleri koyu temada hic test edildi mi? \`components/panel/*\` ve
   \`app/panel/**\` altindaki sabit renkleri (\`bg-neutral-100\`, \`border-neutral-300\`,
   \`bg-white\`, \`text-black\` gibi) tara.
5. \`lib/theme/presets.ts\`'teki iki preset'in koyu mod degerleri: kontrast
   oranlarini yeniden hesapla ve dosyanin KENDI yorumundaki iddialarla karsilastir.

Semaya gore dondur.`,
  },
  {
    key: 'performans',
    p: `# GOREVIN: PERFORMANS DENETIMI

Canli Lighthouse skorlari (2026-08-17): performans 97-100, erisilebilirlik 100,
best practices 96, SEO 92. Bu skorlar tasarim degisikliklerinden ONCE alindi.

Incele:
1. ${ROOT}/lib/theme/fonts.ts ve ${ROOT}/app/layout.tsx — 5 font ailesi
   build-time yukleniyor. Her birinin \`preload\`, \`subsets\`, \`weight\`,
   \`display\` ayarlarini oku. Kac \`@font-face\` uretiliyor? \`.next/static/\`
   altindaki gercek CSS/font dosyalarini bul ve BOYUTLARINI ol (Bash ile).
2. Gorseller: \`next/image\` kullanimlari — \`sizes\`, \`priority\`, \`quality\`,
   \`fill\`. LCP gorseli hangisi ve dogru isaretlenmis mi? \`next.config.ts\`'te
   \`images\` yapilandirmasi (formats, deviceSizes, remotePatterns).
3. Client bundle: \`"use client"\` iceren TUM dosyalari listele ve her birinin
   gercekten client olmasi gerekip gerekmedigini sorgula. \`.next/static/chunks/\`
   altindaki JS dosya boyutlarini ol.
4. \`.next/server/app/*.html\` dosyalarinin BOYUTLARINI ol — statik sayfa
   agirligi ne kadar? Inline edilen tema script'i ve JSON-LD ne kadar yer tutuyor?
5. Veri cekme: ayni sorgu birden fazla bolumde tekrarlaniyor mu? \`react cache()\`
   nerede kullanilmis, nerede kullanilmamis? \`lib/supabase/queries.ts\`'i oku.
   Ana sayfa render'inda toplam kac Supabase sorgusu calisiyor — SAY.
6. \`app/api/og/route.tsx\` — dinamik rota, her istekte ne maliyeti var?

Olculebilir sayilar ver, tahmin degil.

Semaya gore dondur.`,
  },
  {
    key: 'urun-ozellik',
    p: `# GOREVIN: URUN BOSLUGU VE YENI OZELLIK ONERILERI

**Bu boyut digerlerinden FARKLI: burada hata degil FIRSAT ariyorsun.**
Kullanici acikca "eklesek iyi olur dediginiz ozellikler" istedi.

Once oku:
- ${ROOT}/docs/PRD.md — ozellikle madde 4 (Istenmeyen/kapsam disi). Oradaki
  hicbir seyi onerme.
- ${ROOT}/docs/RAKIP-ANALIZI.md — 93 gercek sitenin analizi. Sektorde YAYGIN
  olup bizde OLMAYAN neler var?
- ${ROOT}/docs/TESLIM-PAKETI.md — urunun vaadi ne?
- ${ROOT}/components/site/ ve ${ROOT}/app/panel/ — bugun ne var?

Sonra su acilardan ozellik onerisi uret:
1. **Ziyaretci tarafi**: RAKIP-ANALIZI'ndeki "hepsinde var, bizde yok"
   listesinden hangileri PRD'ye aykiri DEGIL ve gercekten deger katar?
   (Ornek: proje DURUM ekseni, proje detay SAYFASI, kapanis davet bolumu,
   basin/odul rozetleri, WhatsApp butonu — PRD madde 3.1'de VAAT EDILMIS ama
   kodda var mi kontrol et!)
2. **Panel tarafi**: platform sahibinin gunluk isini kolaylastiracak neler
   eksik? (Ornek: onizleme, toplu islem, arama, icerik kopyalama, geri alma,
   son degisiklikler gunlugu)
3. **Isletme/satis tarafi**: "tek musteri = tek kurulum" modelini
   kolaylastiracak neler? (Ornek: kurulum sihirbazi, demo icerik import —
   PRD madde 3.2'de VAAT EDILMIS, kodda var mi?)
4. **Guven/donusum**: iletisim formu disinda ziyaretcinin firmayla temas
   kurmasini saglayacak neler var?

HER oneri icin: PRD'de vaat edilmis mi yoksa yeni fikir mi, hangi dosyalara
dokunur, migration gerekir mi, efor ne. PRD'de vaat edilip kodda OLMAYANLARI
"eksik" tipiyle, tamamen yeni fikirleri "ozellik" tipiyle isaretle.

**Asiri muhendislik onerme.** Bu bir staj projesi ve teslim asamasinda.
Her oneride "buna deger mi" degerlendirmesi yap.

Semaya gore dondur.`,
  },
  {
    key: 'teslim',
    p: `# GOREVIN: TESLIM HAZIRLIGI — sifirdan yeni musteri kurulumu

Kullanici bu projeyi TESLIM EDECEK. Yeni bir gelistirici/musteri bu depoyu
alip sifirdan kurulum yapacak gibi dusun ve HER ADIMI kodla dogrula.

1. ${ROOT}/docs/KURULUM.md'yi bastan sona oku ve her adimi gercek kodla
   karsilastir. Adimlar hala dogru mu? Eksik env degiskeni, degismis komut,
   olmayan dosya referansi, yanlis sira var mi?
2. ${ROOT}/supabase/setup/seed-template.sql ve ${ROOT}/scripts/setup-new-customer.sh
   — bunlar bugunku semayla uyumlu mu? Migration'larda eklenen kolonlar
   (stats, cta_*, service_areas, weekday_opens, seo_keywords, og_image_path,
   consent gibi) seed sablonunda var mi? Bir kolon migration'da eklenip
   sablonda unutulmussa yeni kurulumda o alan bos kalir.
3. ${ROOT}/.env.local.example ile kodda GERCEKTEN okunan \`process.env.*\`
   degiskenlerini karsilastir (grep ile hepsini cikar).
4. ${ROOT}/docs/MUSTERI-KILAVUZU.md — panelin BUGUNKU ekranlariyla uyusuyor mu?
   Bu oturumda uc akis degisti: (a) Hakkimizda>Degerler artik "Baslik — aciklama"
   biciminde, (b) Tema>Calisma Saatleri artik cok satirli, (c) Hizmetler
   "Ikonlu Kart" varyantina alindi. Kilavuz bunlari anlatiyor mu?
5. ${ROOT}/docs/TESLIM-PAKETI.md — sayilar ve iddialar hala dogru mu?
   (Bolum sayisi SECTION_KEYS'ten, varyant sayisi variantOptions'tan, test
   sayisi npm run test:unit'ten dogrulanmali.)
6. ${ROOT}/README.md — yeni bir gelistirici icin yeterli mi?
7. Depoda teslime uygun OLMAYAN bir sey kalmis mi? (gecici dosya, test artigi,
   yorum satirinda TODO/FIXME, .env sizintisi, kullanilmayan bagimlilik)
   \`git ls-files\` ile takip edilen dosyalari tara.

Semaya gore dondur.`,
  },
  {
    key: 'veri-butunlugu',
    p: `# GOREVIN: VERI BUTUNLUGU VE PANEL GIDIS-DONUSU

Bu oturumda AYNI DESENDEN iki gercek veri kaybi hatasi bulundu:
1. Kesirli referans puani: kolon numeric(2,1) yapildi ama zod semasi ve form
   integer kaldi -> panelde acilinca deger sessizce siliniyordu. AYRICA
   getTestimonialById PostgREST'in string donen numeric'ini kabul etmiyordu.
2. Calisma saatleri: kolon satir sonlariyla dolduruluyordu ama panel alani
   tek satirlik <input> idi -> HTML'de input satir sonu tasiyamaz, kaydedince
   satir sonlari siliniyordu.

**Ortak desen: panel gidis-donusu veriyi sessizce bozuyor.** Ayni sinifta
BASKA hatalar var mi? Sistematik tara:

Her icerik alani icin su zinciri kontrol et:
  DB kolon tipi/kisiti -> query mapping -> panel form alani tipi ->
  zod semasi -> action donusumu -> DB'ye yazma

Kontrol edilecekler:
- ${ROOT}/supabase/migrations/*.sql — TUM kolon tipleri ve CHECK kisitlari
- ${ROOT}/types/database.types.ts — uretilmis tipler
- ${ROOT}/lib/validation/*.ts — 10 zod semasi
- ${ROOT}/lib/supabase/queries.ts ve panelQueries.ts — okuma donusumleri
- ${ROOT}/app/panel/(protected)/**/*.tsx — form alani TIPLERI (TextField mi
  TextareaField mi SelectField mi? cok satirli veri tek satirlik alanda mi?)
- ${ROOT}/app/panel/(protected)/**/actions.ts — yazma donusumleri

Ozellikle ara:
1. Cok satirli olabilecek metin alanlari tek satirlik TextField'da mi?
   (adres, aciklama, biyografi, calisma saatleri, degerler, service_areas)
2. Sayisal alanlarda zod ile DB CHECK uyumsuzlugu (year, founded_year, rating,
   order_index, stats.value)
3. Dizi/JSON kolonlari (core_values text[], service_areas) form <-> DB
   donusumunde eleman kaybi (bos satir, bosluk, tekrar eden eleman)
4. SelectField'larin secenek listesi DB'deki olasi TUM degerleri kapsiyor mu?
   (rating hatasinin kok nedeni buydu)
5. \`null\` vs bos string karisikligi — bir alan bosaltilinca DB'de null mi
   olur bos string mi, okuma tarafi ikisini de dogru ele aliyor mu?
6. PostgREST'in tip donusleri (numeric->string, bigint->string, date->string)
   okuma tarafinda dogru ele aliniyor mu?

Semaya gore dondur.`,
  },
  {
    key: 'acik-madde-dogrulama',
    p: `# GOREVIN: KAYITLI ACIK MADDELERI YENIDEN DOGRULA

${ROOT}/docs/DURUM.md "Siradaki adim" bolumundeki madde 11-21'i tek tek oku
(grep ile satir numaralarini bul, sonra oku).

Her madde icin GERCEK KODU ACIP su soruyu cevapla:
**"Bu madde bugun hala gecerli mi?"**

Uc olasilik var:
1. **HALA GECERLI** — bulgu olarak YAZMA (zaten kayitli), sadece ozette belirt.
2. **ARTIK GECERSIZ** — yol boyunca farkinda olmadan duzelmis olabilir.
   Bunu bulgu olarak YAZ (tip: "eksik", baslik: "DURUM.md madde X artik
   gecersiz: ..."), cunku yanlis bir acik madde listesi gercek bir sorundur.
3. **DUSUNULENDEN DAHA CIDDI** — madde kayitli ama etkisi hafife alinmis.
   Bunu da YAZ ve neden daha ciddi oldugunu kanitla.

Ozellikle su maddeleri dikkatle dogrula:
- Madde 12'deki erisilebilirlik listesi: tasarim degisiklikleri bazilarini
  duzeltmis ya da BOZMUS olabilir. Her birini ayri ayri kodda kontrol et.
- Madde 14: "Istatistikler ve Eylem Cagrisi panelden duzenlenemiyor" — gercekten
  hicbir ekran yok mu? \`app/panel/\` altini tam tara.
- Madde 16: "sorgu katmani tum hatalari yutuyor" — kac fonksiyonda, hangi
  fonksiyonlarda \`console.error\` bile yok?
- Madde 18: "priority deprecated" — bunu ${ROOT}/node_modules/next/dist/docs/
  altindan DOGRULA, gercekten deprecated mi?
- Madde 20: Vercel degiskenleri — bunu kodla dogrulayamazsin, atla.

Ayrica: bu maddeler arasinda BIRBIRIYLE CELISEN veya AYNI SEYI iki kez
soyleyen var mi?

Semaya gore dondur.`,
  },
]

phase('Denetim')
log(`${BOYUTLAR.length} boyutta denetim basliyor`)

const sonuclar = await pipeline(
  BOYUTLAR,
  (b) => agent(`${CONTEXT}\n\n${b.p}`, { label: `denetim:${b.key}`, phase: 'Denetim', schema: BULGU_SCHEMA, effort: 'xhigh' }),
  (r, b) => {
    if (!r || !(r.bulgular || []).length) {
      return { key: b.key, ozet: r?.ozet ?? '', guclu_yonler: r?.guclu_yonler ?? [], bulgular: [] }
    }
    // Ozellik onerileri "dogru/yanlis" olarak curutulemez — onlari dogrulamaya sokmuyoruz.
    const defects = r.bulgular.filter((x) => x.tip !== 'ozellik')
    const features = r.bulgular.filter((x) => x.tip === 'ozellik')
    if (!defects.length) {
      return { key: b.key, ozet: r.ozet, guclu_yonler: r.guclu_yonler, bulgular: features.map((f) => ({ ...f, dogrulandi: true, final_severity: f.severity })) }
    }
    const liste = defects
      .map((f, i) => `--- BULGU ${i + 1} ---
Baslik: ${f.baslik}
Tip: ${f.tip} | Severity(iddia): ${f.severity}
Dosyalar: ${(f.dosyalar || []).join(', ')}
Aciklama: ${f.aciklama}
Senaryo: ${f.senaryo}
Kanit(iddia): ${f.kanit}`)
      .join('\n\n')
    return agent(
      `${CONTEXT}

# GOREVIN: SUPHECI DOGRULAYICI

Asagida "${b.key}" boyutunda uretilmis ${defects.length} bulgu var. Gorevin
bunlari DOGRULAMAK DEGIL, CURUTMEK. Varsayilanin "bu bulgu yanlis" olsun.

Her bulgu icin:
1. Iddia edilen dosyayi/satiri GERCEKTEN AC VE OKU. Alintilanan kod orada mi?
   Degilse YANLIS.
2. Bulgunun kacirdigi bir koruma var mi (baska katmanda kontrol, RLS, zod,
   TypeScript tipi, ust bilesende yapilan kontrol, Tailwind varsayilani)?
   Varsa YANLIS.
3. Next.js/Tailwind API'si hakkinda iddia varsa node_modules altindan DOGRULA.
4. Yukaridaki "ZATEN BILINEN ACIK MADDELER" listesindeki bir seyi tekrar
   soyluyorsa YANLIS (istisna: maddenin GECERSIZ oldugunu ya da daha ciddi
   oldugunu kanitliyorsa GECERLI).
5. "BILINCLI KARARLAR" listesindeki bir seyi gundeme getiriyorsa YANLIS.
6. Senaryo gercekten mumkun mu? Ulasilamaz kod yolu ya da pratikte imkansiz
   bir durumsa YANLIS.
7. Severity abartilmissa gercek=true birak, duzeltilmis_severity'yi DUSUR.

Emin degilsen gercek=false de.

${liste}

Her bulgu icin bir verdict dondur, basliklari BIREBIR ayni yaz.`,
      { label: `dogrula:${b.key}`, phase: 'Dogrulama', schema: VERDICT_SCHEMA, effort: 'xhigh' },
    ).then((v) => ({
      key: b.key,
      ozet: r.ozet,
      guclu_yonler: r.guclu_yonler,
      bulgular: [
        ...defects.map((f) => {
          const vd = (v?.verdicts || []).find((x) => x.baslik === f.baslik)
          return { ...f, dogrulandi: vd ? vd.gercek : null, dogrulama_gerekcesi: vd?.gerekce ?? 'dogrulanamadi', final_severity: vd && vd.gercek ? vd.duzeltilmis_severity : f.severity }
        }),
        ...features.map((f) => ({ ...f, dogrulandi: true, dogrulama_gerekcesi: 'ozellik onerisi — curutmeye tabi degil', final_severity: f.severity })),
      ],
    }))
  },
)

const temiz = sonuclar.filter(Boolean)
const hepsi = temiz.flatMap((r) => (r.bulgular || []).map((f) => ({ ...f, boyut: r.key })))
const onaylanan = hepsi.filter((f) => f.dogrulandi === true)
const curutulen = hepsi.filter((f) => f.dogrulandi === false)

log(`Toplam ${hepsi.length} bulgu; ${onaylanan.length} gecerli, ${curutulen.length} curutuldu`)

return {
  onaylanan: onaylanan,
  curutulen: curutulen.map((f) => ({ boyut: f.boyut, baslik: f.baslik, gerekce: f.dogrulama_gerekcesi })),
  boyut_ozetleri: temiz.map((r) => ({ boyut: r.key, ozet: r.ozet, guclu_yonler: r.guclu_yonler })),
}
