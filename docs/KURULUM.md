# Kurulum Kılavuzu — Yeni Müşteri Kurulumu

Bu kılavuz, ürünü **yeni bir müşteriye** satıp teslim ederken sıfırdan
kurulumu (yeni Supabase projesi → şema → politikalar → demo içerik →
ortam değişkenleri → admin hesabı → Vercel'e ilk yayın) yapacak kişi
içindir — **orta seviye bir geliştirici** hedeflenmiştir (`npm`, `git`,
temel terminal komutları biliniyor varsayılır). Panelin GÜNLÜK
kullanımı için bu dosya değil, `MUSTERİ-KILAVUZU.md` kullanılır — o
dosya teknik bilgi gerektirmez, müşterinin/panel kullanıcısının kendisi
içindir.

**Ekran görüntüleri hakkında:** Bu kılavuzu yazan AI, gerçek bir
Supabase/Vercel hesabına erişemez ve onlara giriş yapamaz — bu yüzden
gerçek ekran görüntüsü ekleyemedi. Bunun yerine her adımda **tam menü
yolu/buton metni kelimesi kelimesine** yazıldı (KABUL KRİTERİ: "hiçbir
adımda 'bunu nereden bulacağım' diye sormasın"). İlk gerçek kurulumu
yapan kişi, geçtiği her ekranın görüntüsünü alıp ilgili adımın altına
eklerse bu kılavuz gerçek görsellerle tamamlanmış olur — bkz. dosya
sonundaki "Bu Kılavuzu Test Etme" notu.

**Toplam tahmini süre: ~28 dakika** (özel alan adı bağlama hariç — DNS
yayılması saatler sürebilir, bu yüzden ayrı/opsiyonel tutuldu). Adım
8'de müşterinin alan adı kurulum ANINDA henüz belli değilse, ~3 dakikalık
bir "2. tur" (env değişkeni ekleyip yeniden yayınlama) gerekir — bkz.
Adım 8.

---

## Ön Koşullar

Kuruluma başlamadan önce bilgisayarınızda hazır olması gerekenler:

- [ ] **Node.js 20+** ve **npm** kurulu (`node -v` ile kontrol edin).
- [ ] **Git** kurulu, bu proje deposu (`staj-projesi`) bilgisayarınıza
      klonlanmış.
- [ ] **Supabase CLI** kurulu — yoksa: `npm install -g supabase` (veya
      [resmi kurulum talimatları](https://supabase.com/docs/guides/cli)).
      Doğrulama: `supabase --version`.
- [ ] **psql** (PostgreSQL komut satırı istemcisi) kurulu — kurulum
      betiğinin demo içerik adımı için gerekli. Yoksa: Windows'ta
      [PostgreSQL yükleyicisi](https://www.postgresql.org/download/windows/)
      ile birlikte gelir; sadece `psql`'i kurmak yeterli, tam bir
      PostgreSQL sunucusu ÇALIŞTIRMANIZ gerekmez.
      **Alternatif (psql kurmak istemiyorsanız):** Adım 4'te betiği
      kullanmak yerine `supabase/setup/seed-template.sql`'i elle
      düzenleyip Supabase SQL Editor'e yapıştırabilirsiniz — kılavuzda
      o adımda ayrıca anlatılıyor.
- [ ] Bir **Supabase hesabı** ([supabase.com](https://supabase.com)) —
      yoksa ücretsiz oluşturulabilir.
- [ ] Bir **Vercel hesabı** ([vercel.com](https://vercel.com)) — GitHub
      hesabınızla giriş yapabilirsiniz.
- [ ] Bu projenin **GitHub deposuna erişim** (Vercel, deploy için
      buradan çeker).

## Müşteriden Alınacak Bilgiler

Kuruluma başlamadan önce müşteriden şunları isteyin — hiçbiri elinizde
yoksa aşağıdaki adımların bir kısmında durup beklemeniz gerekir:

**Zorunlu:**
1. **Firma adı** (ör. "Akme İnşaat") — sitede, sekme başlığında ve
   arama sonuçlarında görünür.
2. **Alan adı tercihi** (ör. `akmeinsaat.com.tr`) — müşteri kendi alan
   adını zaten satın almış olmalı (bu kılavuz alan adı SATIN ALMAYI
   kapsamıyor). Alan adı henüz yoksa, ilk yayın Vercel'in verdiği
   ücretsiz alt alan adıyla (`...vercel.app`) yapılıp özel alan adı
   sonradan bağlanabilir (bkz. Adım 10 sonu).
3. **İletişim formu bildirim e-postası** — ziyaretçi mesajlarının
   panelde görünmesi dışında bir bildirim şu an gönderilmiyor (bkz.
   `GUVENLIK.md` madde 10 açık madde); yine de kayıt olarak bu adres
   tutulur, ileride bildirim eklenirse kullanılacak.
4. **Panel admin hesabı için e-posta adresi** — müşterinin kendisi mi
   yoksa sizin mi panele gireceğine göre değişir, ama bir e-posta
   adresi mutlaka gerekir (kayıt formu yok, hesap Supabase Dashboard'dan
   elle açılır).

**Opsiyonel (yoksa demo/yer tutucu değerlerle başlanır, panelden
sonradan eklenir):**
5. Firma logosu (PNG/JPEG/WEBP, en fazla 5 MB).
6. Marka rengi tercihi (hex kod, ör. `#2561c1`) — yoksa varsayılan
   "Kurumsal Mavi" önayarı kullanılır.
7. Adres, telefon, çalışma saatleri.
8. Sosyal medya hesapları (Facebook/Instagram/LinkedIn).
9. Gerçek hizmet/proje/referans/SSS/ekip içeriği — kurulum sırasında
   jenerik bir DEMO şablonu yüklenir (bkz. Adım 4), müşteri gerçek
   içeriğini panelden kendisi girer/siz girersiniz.

---

## Adım Adım Kurulum

### 1. Yeni Supabase projesi oluşturun *(~3 dk)*

1. [supabase.com/dashboard](https://supabase.com/dashboard)'a girin,
   sağ üstteki **"New project"** butonuna tıklayın.
2. Bir organizasyon seçin (yoksa önce organizasyon oluşturmanız
   istenir — ücretsiz).
3. **Project name**: müşterinin firma adını yazın (ör. "Akme İnşaat").
4. **Database Password**: **"Generate a password"** ile güçlü bir
   şifre üretin ve **hemen bir şifre yöneticisine kaydedin** — bu ekran
   kapanınca şifre bir daha gösterilmez. ⚠️ **Geri alınamaz uyarı:**
   Şifreyi kaydetmeden ileri giderseniz, sonradan Dashboard →
   Project Settings → Database → "Reset database password"'den
   YENİDEN üretmeniz gerekir (eski şifreyi geri getiremezsiniz).
5. **Region**: Türkiye'ye en yakın bölgeyi seçin (ör. "Central EU
   (Frankfurt)") — ziyaretçi gecikmesini azaltır.
6. **"Create new project"**'e tıklayın. Proje hazırlanırken ~1-2 dakika
   bekleme ekranı görürsünüz.

**✅ Doğru yaptığını nasıl anlarsın:** Proje panosu (yeşil "Project is
healthy" veya benzeri bir durum göstergesiyle) açılır, sol menüde
Table Editor/SQL Editor/Authentication gibi sekmeler görünür.

### 2. Supabase CLI'yi bu projeye bağlayın *(~2 dk)*

1. Terminalde proje klasöründeyken: `supabase login` — tarayıcıda
   açılan sayfada Supabase hesabınızla onaylayın.
2. Dashboard'da yeni projenizin **Project Settings → General**
   sayfasına gidin, **"Reference ID"** değerini kopyalayın (ör.
   `abcdefghijklmnop`).
3. Terminalde: `supabase link --project-ref <kopyaladığınız-id>` —
   istenirse 1. adımdaki veritabanı şifresini girin.

⚠️ **Geri alınamaz/riskli adım uyarısı:** Bu adımdan sonra
`supabase db push` çalıştırdığınızda komutlar **bağlı olduğunuz
projeye** uygulanır. Yanlışlıkla ESKİ/BAŞKA bir müşterinin projesine
bağlıyken devam ederseniz, o müşterinin veritabanını değiştirirsiniz.
Devam etmeden önce mutlaka 4. kontrolü yapın.

**✅ Doğru yaptığını nasıl anlarsın:** `supabase projects list`
komutunu çalıştırın — çıktıda yeni projenizin isminin yanında bir
"Linked" (veya benzeri) işareti görünmeli.

### 3. Ortam değişkenlerini hazırlayın *(~2 dk)*

1. `.env.local.example` dosyasını `.env.local` adıyla kopyalayın.
2. Dashboard → **Project Settings → Data API**'den **"Project URL"**'i
   kopyalayıp `NEXT_PUBLIC_SUPABASE_URL`'e yapıştırın.
3. Dashboard → **Project Settings → API Keys**'ten **"service_role"**
   (Reveal'a tıklayıp) ve **"anon"** anahtarlarını kopyalayıp ilgili
   satırlara yapıştırın.
4. `ACTIVE_TENANT_DOMAIN`'e müşterinin gerçek alan adını yazın (ör.
   `akmeinsaat.com.tr`) — **bu değeri bir sonraki adımda AYNEN
   kullanacaksınız, şimdi not edin.**
5. Terminalde: `export DATABASE_URL="..."` — değeri Dashboard →
   **Project Settings → Database → Connection string → URI**'den alın
   (2. adımdaki veritabanı şifresini `[YOUR-PASSWORD]` yerine siz
   yazmanız gerekir, kopyalanan metinde otomatik gelmez).

**✅ Doğru yaptığını nasıl anlarsın:** `.env.local` dosyasında 3
Supabase değişkeni ve `ACTIVE_TENANT_DOMAIN` dolu; terminalde
`echo $DATABASE_URL` gerçek bir bağlantı adresi yazdırıyor (boş değil).

### 4. Kurulum betiğini çalıştırın — şema + RLS politikaları + demo içerik *(~3 dk)*

Bu, `GÖREVLER`'deki "tek akış"ın karşılığı — `scripts/setup-new-customer.sh`
üç şeyi sırayla yapar: (a) `supabase/migrations/`'daki TÜM şema+RLS
dosyalarını sırayla uygular, (b) jenerik bir demo içerik şablonunu
müşterinin adı/alan adıyla doldurur, (c) veritabanına yükler.

```
./scripts/setup-new-customer.sh "Akme İnşaat" "akmeinsaat.com.tr" "info@akmeinsaat.com.tr"
```

(Windows'ta Git Bash içinden çalıştırın; PowerShell'den `bash
scripts/setup-new-customer.sh ...` şeklinde de çağırabilirsiniz.)

**psql kurmadıysanız (alternatif, elle yol):** `supabase db push`'ı
yine de çalıştırın (şema+RLS için), sonra
`supabase/setup/seed-template.sql`'i bir metin editöründe açıp
`__TENANT_NAME__`/`__TENANT_DOMAIN__`/`__CONTACT_EMAIL__` yer
tutucularını gerçek değerlerle değiştirip SQL Editor'e yapıştırıp
çalıştırın.

⚠️ **Tekrar çalıştırma güvenlidir** (KISITLAR) — betik `on conflict do
nothing` kullanır, yanlışlıkla iki kez çalıştırırsanız veri
çoğalmaz. Ama **YANLIŞ bir `ACTIVE_TENANT_DOMAIN`/alan adıyla
çalıştırmak** (3. adımdaki notunuzla uyuşmayan bir değer) siteyi
tamamen boş gösterir (bkz. aşağıda "Sık Yapılan Hatalar") — geri almak
için doğru domain'i bulup betiği o değerle TEKRAR çalıştırmanız yeterli
(veri kaybı olmaz, sadece yanlış/eksik görünür).

**✅ Doğru yaptığını nasıl anlarsın:** Terminalde "✅ Kurulum
tamamlandı" mesajını görürsünüz. Ek doğrulama: Dashboard → **Table
Editor**'de `tenants` tablosuna bakın, müşterinizin satırını görmelisiniz;
`page_sections` tablosunda o tenant için **10 satır** olmalı (bu, en
kolay unutulan/atlanan tablo — 0 satırsa ana sayfa boş görünür).

### 5. Admin (panel) hesabını oluşturun *(~2 dk)*

1. Dashboard → **Authentication → Users**'a gidin.
2. **"Add user"** → **"Create new user"**.
3. Müşteriden alınan/belirlenen e-posta adresini girin, güçlü bir şifre
   belirleyin (veya "Generate password").
4. **"Auto Confirm User"** kutucuğunu MUTLAKA işaretleyin — işaretlemezseniz
   kullanıcı bir onay e-postası bekler ve giriş yapamaz (bu proje kayıt
   akışı sunmuyor, e-posta onaylama akışı da yok).
5. **"Create user"**'a tıklayın.
6. Dashboard → **Authentication → Settings**'e gidin, **"Allow new
   users to sign up"** seçeneğinin **KAPALI** olduğunu doğrulayın
   (varsayılan olarak kapalıdır ama kontrol edin — açık kalırsa herkes
   kendi hesabını oluşturabilir, bu ürün tek-kullanıcılı bir modelde
   çalışır).

**✅ Doğru yaptığını nasıl anlarsın:** Users listesinde yeni hesap
"Confirmed" durumda görünür (yeşil/onaylı işaret, "Waiting for
verification" DEĞİL).

### 6. TypeScript tiplerini bu projeden üretin *(~2 dk)*

1. [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)'tan
   bir Personal Access Token oluşturun (yoksa/elinizde değilse).
2. Terminalde: `$env:SUPABASE_ACCESS_TOKEN = "sbp_..."` (PowerShell)
   veya `export SUPABASE_ACCESS_TOKEN="sbp_..."` (bash).
3. `package.json`'daki `types:generate` script'i **hâlâ eski proje
   ID'sine sabit** (`--project-id vchodvviufmdwomkjrjb`) — yeni müşteri
   için bunu YENİ projenin ID'siyle değiştirip çalıştırmanız, sonra
   isterseniz eski haline geri almanız gerekir. Alternatif (dosyayı
   değiştirmeden): `npx supabase gen types typescript --project-id
   <yeni-proje-id> --schema public > types/database.types.ts`.

**✅ Doğru yaptığını nasıl anlarsın:** `types/database.types.ts`
dosyası yeniden yazıldı (dosyanın değişiklik zamanı güncellendi),
içinde `page_sections` tablosunun tipi var.

### 7. Yerel ortamda doğrulayın *(~3 dk)*

```
npm install
npm run build
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

**✅ Doğru yaptığını nasıl anlarsın:** Müşterinin firma adını içeren
bir ana sayfa görürsünüz — Hero, Hizmetler, Projeler gibi bölümler
demo içerikle dolu (metinler jenerik/yer tutucu olabilir, bu normal —
Adım 4'teki şablon budur). Tamamen BOŞ bir sayfa görüyorsanız bkz. "Sık
Yapılan Hatalar" — muhtemelen `ACTIVE_TENANT_DOMAIN` uyuşmazlığı.
`http://localhost:3000/panel/giris`'ten 5. adımdaki hesapla giriş
yapabildiğinizi de kontrol edin.

### 8. Vercel'e ilk yayın *(~8 dk + gerekirse aşağıdaki 2. tur ~3 dk)*

1. [vercel.com/new](https://vercel.com/new)'a gidin, bu projenin GitHub
   deposunu seçip **"Import"**.
2. **Environment Variables** bölümünde, `.env.local`'inizdeki
   `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ACTIVE_TENANT_DOMAIN`'i tek tek
   ekleyin — **`E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`'ü EKLEMEYİN**,
   bunlar sadece yerel test için.
3. **`NEXT_PUBLIC_SITE_URL`'i de MUTLAKA ekleyin** (bkz.
   `.env.local.example`, `lib/seo/getSiteUrl.ts`) — sitemap/robots.txt/
   paylaşım görseli/arama motoru yapısal verisinin (JSON-LD) DOĞRU
   adresi göstermesi için gerekli. **İki senaryo:**
   - **Müşterinin özel alan adı ŞİMDİDEN belliyse** (Adım'ın en
     başındaki "Müşteriden Alınacak Bilgiler"): değerini o adrese yazın
     (ör. `https://akmeinsaat.com.tr`) — DNS henüz bağlanmamış olsa
     bile şimdiden doğru değeri girmek sorun değil.
   - **Henüz bilinmiyorsa/sadece Vercel'in geçici adresiyle
     başlıyorsanız:** ŞİMDİLİK BOŞ BIRAKIN, "Deploy"a devam edin —
     4. adımda Vercel'in verdiği gerçek `.vercel.app` adresini
     öğrendikten SONRA bu değişkeni ekleyip **yeniden deploy**
     etmeniz gerekecek (aşağıda "2. tur").
4. **"Deploy"**'a tıklayın, ~2-3 dakika bekleyin.
5. Yayın bitince Vercel size `<proje-adı>.vercel.app` biçiminde bir
   adres verir.

**✅ Doğru yaptığını nasıl anlarsın:** Verilen `.vercel.app` adresini
açtığınızda 7. adımdaki AYNI siteyi (gerçek verilerle) görürsünüz.

**2. tur (SADECE 3. adımda `NEXT_PUBLIC_SITE_URL`'i boş bıraktıysanız):**
Vercel'in verdiği gerçek adresi (ör. `https://staj-projesi-olive.
vercel.app`) kopyalayın → Project Settings → Environment Variables →
`NEXT_PUBLIC_SITE_URL` olarak ekleyin → Deployments sekmesinden en son
deploy'un yanındaki "..." menüsünden **"Redeploy"** ile yeniden
yayınlayın. **Bunu atlamayın** — 2026-08-17'de gerçekten yaşandı: bu
değişken boş kalınca sitemap/robots.txt yanlış bir adrese işaret etti,
canlı Lighthouse SEO skoru **92'den 58'e düştü** (bkz.
`docs/KARAR-GUNLUGU.md`).

⚠️ **Önemli bir etkileşim:** `NEXT_PUBLIC_SITE_URL`'i özel alan adına
(henüz DNS bağlanmamışken) ayarladıysanız, site artık Vercel'in
`.vercel.app` adresinden ziyaret edildiğinde OTOMATİK olarak o özel
alan adına yönlendirir (bkz. `docs/GUVENLIK.md` madde 8 "Kanonik
adrese yönlendirme") — DNS henüz hazır değilse bu yönlendirme
ÇALIŞMAYAN bir adrese gider! DNS bağlanana kadar test etmek için ya
`NEXT_PUBLIC_SITE_URL`'i geçici olarak boş bırakın ya da DNS'i önce
bağlayın.

**Özel alan adı bağlama (opsiyonel, süreye dahil değil — DNS yayılması
saatler sürebilir):** Vercel proje ayarları → **Domains** → müşterinin
alan adını girip Vercel'in verdiği DNS kayıtlarını müşterinin alan adı
sağlayıcısında (GoDaddy, Natro vb.) tanımlamanız gerekir — bu adım bu
kılavuzun kapsamı dışında, alan adı sağlayıcısına göre değişir. DNS
bağlandıktan sonra `NEXT_PUBLIC_SITE_URL`'in (yukarıdaki 3. adımda
girdiğiniz) hâlâ doğru/aynı değerde olduğunu teyit edin.

### 9. Yayın sonrası doğrulama *(~3 dk)*

Bkz. aşağıdaki **"Doğrulama Kontrolleri"** bölümü — canlı adrese karşı
tam liste.

---

## Doğrulama Kontrolleri

Kurulum bitince, canlı adrese (Vercel'in verdiği veya özel alan adı)
karşı sırayla:

- [ ] Ana sayfa açılıyor, müşterinin firma adı görünüyor, bölümler
      (Hero/Hizmetler/Projeler vb.) demo içerikle dolu.
- [ ] `/panel/giris`'e gidip 5. adımdaki hesapla giriş yapılabiliyor.
- [ ] Girişsiz (gizli sekmede) `/panel` adresine gidildiğinde
      `/panel/giris`'e yönlendiriliyor (bkz. `GUVENLIK.md` madde 8-9).
- [ ] Panelde bir hizmeti "Taslağa Al" yapıp ana sayfada kaybolduğu,
      tekrar "Yayınla" yapıp geri geldiği doğrulanıyor.
- [ ] `/iletisim` sayfasındaki form dolduruluyor, gönderiliyor,
      teşekkür mesajı görünüyor; panelin **Mesajlar** ekranında bu
      mesaj görünüyor.
- [ ] Panelde **Tema** ekranından marka rengi değiştirilip sitede
      anında (kaydettikten sonra) yansıdığı görülüyor.
- [ ] `curl.exe -I <canlı-adres>` ile güvenlik başlıklarının
      (`Content-Security-Policy`, `Strict-Transport-Security` vb.)
      geldiği doğrulanıyor (bkz. `GUVENLIK.md` madde 15).
- [ ] Vercel proje ayarlarında ortam değişkenlerinin (Adım 8.2) hepsi
      var, `E2E_*` olanlar YOK.

---

## Sık Yapılan Hatalar

Bu proje boyunca gerçekten yaşanmış (veya yaşanma ihtimali yüksek)
hatalar ve çözümleri:

| Hata | Belirti | Çözüm |
|---|---|---|
| **`ACTIVE_TENANT_DOMAIN` ≠ seed'deki alan adı** | Site tamamen boş açılır, hiçbir bölüm/veri görünmez, konsol hatası da vermez | `tenants` tablosundaki `domain` sütununu Table Editor'den kontrol edin, Vercel/`.env.local`'deki `ACTIVE_TENANT_DOMAIN` ile BİREBİR aynı olmalı (büyük/küçük harf dahil) |
| **`page_sections` boş bırakıldı** | Ana sayfa boş — `tenants`/`services` gibi tablolarda veri VAR ama hiçbir bölüm render edilmiyor | Adım 4'teki kurulum betiğinin "Adım 3/3" (demo içerik) kısmının tamamlandığından emin olun; Table Editor'de `page_sections`'ta o tenant için 10 satır olmalı |
| **`npm run build` "does not exist in type" hatası veriyor** | Şemaya yeni bir kolon eklendi ama tipler yenilenmedi | Adım 6'yı (`types:generate`) atlamayın — bu proje geçmişinde defalarca yaşanmış, bilinen bir sıra: migration → tip yenileme → kod derlenir |
| **Yanlış Supabase projesine bağlı çalıştırma** | `supabase db push` BAŞKA bir müşterinin (veya eski demo) veritabanını değiştirir | Her zaman `supabase projects list` ile hangi projeye bağlı olduğunuzu Adım 4'ten ÖNCE kontrol edin |
| **SQL Editor'e yapıştırırken metin kesiliyor** | "syntax error" — genelde bir kelimenin ortasında biter (ör. "val" — "values" kesilmiş) | Sohbet penceresinden elle seçip kopyalamak yerine dosyayı yerel bir editörde açıp Ctrl+A / Ctrl+C ile TAMAMINI kopyalayın |
| **Migration'ı iki kez/yanlış sırada çalıştırma** | "relation already exists" veya "duplicate key" hatası | `supabase db push` kullanıyorsanız bu zaten olmaz (CLI sırayı ve geçmişi kendi takip eder) — elle SQL Editor'den uyguluyorsanız her dosyanın İLK SATIRINI kontrol edip doğru/sıradaki dosya olduğundan emin olun |
| **PowerShell'de `curl -I` çalışmıyor** | "Cannot find drive" gibi anlamsız bir hata | `curl.exe -I <adres>` yazın (sondaki `.exe` PowerShell'in kendi takma adını atlar) |
| **`types:generate` "Unauthorized" hatası verir** | Token eksik/süresi dolmuş | Adım 6.1'deki adımı tekrarlayıp YENİ bir token oluşturun, aynı terminal penceresinde 6.2'yi tekrar çalıştırın |
| **Ekip/İletişim sayfaları menüde eksik görünüyor** | `/ekip`/`/iletisim` boş/404 | Bu proje mimarisinde Ekip ve İletişim ana sayfa bölümü DEĞİL, ayrı sayfadır (`page_sections`'a hiç eklenmez) — bu normal, `Navbar`'da otomatik görünür |
| **Servis/hero/hakkımızda/referans/ekip görseli yüklenemiyor** | Panelden görsel yüklemeye çalışınca hata | Şu an sadece `projects` ve `branding` Storage bucket'ları kurulu (bkz. `GUVENLIK.md` madde 11, bilinen bir açık madde) — diğer 5 içerik türü için görsel yükleme henüz desteklenmiyor, sadece metin girilebilir |

---

## Bakım ve Yedekleme

*(Müşteriye devirde gerekecek bilgi — GÖREVLER'deki ayrı madde.)*

**Yedekleme:** Supabase, Free plan'da **7 günlük** otomatik günlük
yedek tutar (Dashboard → Database → Backups) — geri yükleme için
Supabase desteğiyle iletişime geçmek gerekir (self-servis "tek tık geri
yükleme" Free plan'da yok, Pro plan'da vardır). Kritik bir değişiklik
öncesi (büyük bir toplu veri güncellemesi vb.) manuel bir önlem:
Dashboard → Database → Backups → **"Download"** ile o anki bir dump
alınabilir.

**Anahtar yenileme:** Service role key veya anon key sızdığından
şüpheleniyorsanız: Dashboard → Project Settings → API Keys → ilgili
anahtarın yanındaki **"Roll"** (yenile) seçeneği eski anahtarı GEÇERSİZ
kılıp yenisini üretir. ⚠️ **Geri alınamaz + hemen aksiyon gerektirir:**
Yenileme anında eski anahtarı kullanan HER YERİ (Vercel ortam
değişkenleri, yerel `.env.local`) güncellemezseniz site/panel çalışmayı
durdurur — yenilemeden hemen sonra Vercel'deki değeri de güncelleyip
yeniden deploy edin.

**Güncellemeler:** Bağımlılıklardaki güvenlik açıkları için periyodik
olarak `npm audit` çalıştırılmalı (bkz. `GUVENLIK.md` madde 10). Next.js/
React majör sürüm güncellemeleri (ör. 16 → 17) bu projede test
edilmedi — önce ayrı bir dalda/kopyada denenmesi önerilir.

**Müşteriye devir:** `GUVENLIK.md` madde 7'deki "Admin Hesabı Yönetimi
→ Müşteriye devir" adımlarına bakın — özetle: Dashboard'dan yeni bir
şifre atayın, güvenli bir kanaldan iletin, eski şifreyi bir daha
kullanmayın. Ayrıca Supabase/Vercel proje sahipliğinin (organizasyon
üyeliği) kime ait kalacağına (siz mi işletmeye devam edeceksiniz,
müşteri mi kendi hesabına taşıyacak) baştan karar verilmeli — bu ürün
"tam yönetilen" bir hizmet olarak tasarlandığı için (bkz. `PRD.md`)
varsayılan senaryo projelerin SİZDE kalması.

---

## Bu Kılavuzu Test Etme

**Bu adımı AI (ben) yapamıyorum** — gerçek bir Supabase hesabım yok,
yeni bir proje açıp bu kılavuzu uçtan uca takip edemem. Bu, senin (veya
başka birinin) yapması gereken bir adım:

1. Yukarıdaki adımları, gerçekten **sıfırdan yeni bir Supabase
   projesiyle**, kılavuzu takip ederek uygula.
2. Takıldığın, "burada ne yapacağımı anlamadım" dediğin HER noktayı not
   al (hangi adım, ne bekliyordun, ne oldu).
3. Bulduklarını bana getir — ilgili adımı netleştirip kılavuzu
   güncellerim. Gerçek ekran görüntülerini de bu sırada ilgili
   adımların altına ekleyebilirsin.

Fikir/karar gerektiren bir noktada takılırsan (ör. "bu betiği bash
yerine PowerShell'e çevirelim mi" gibi) bana sorabilirsin, birlikte
karar veririz.
