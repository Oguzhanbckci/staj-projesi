# Güvenlik

Bu dosya, projenin güvenlik duruşunu tek yerde toplar: kimin neye erişebildiği,
sırların nasıl yönetildiği, bunların nasıl test edildiği ve yayına çıkmadan
önce kontrol edilmesi gereken maddeler. Güvenlik, unutulduğunda fark
edilmeyen tek konudur — bu yüzden yazılı ve güncel tutulur. Kararların
kronolojik gerekçesi için `KARAR-GUNLUGU.md`, teknik mimari için `MIMARI.md`,
tablo/kolon tasarımı için `VERİ-MODELİ.md` referans alınır.

**Son güncelleme:** 2026-08-17 — Spam koruması (madde 14), güvenlik
başlıkları (madde 15), sır taraması (madde 16), RLS/Storage erişim
denetimi (madde 17) eklendi; yayın öncesi kontrol listesi (madde 10)
güncellendi — **hâlâ tam işaretli değil, canlıya çıkılmamalı**

## 1. Tehdit Modeli

### 1.1 Roller (aktörler)

| Rol | Kim | Erişim seviyesi |
|---|---|---|
| **anon** | Herkese açık siteyi ziyaret eden herkes (tenant sitesi veya platform sahibinin tanıtım sitesi) — kimliği doğrulanmamış | En düşük — sadece yayınlanmış içerik, salt okunur |
| **authenticated** | Platform sahibi (tek kullanıcı, `/panel` girişi) — sistemde başka hiçbir authenticated kullanıcı yok, çünkü herkese açık bir kayıt akışı bulunmuyor | En yüksek (uygulama içi) — tüm tenant'ların tüm içeriği, taslak dahil, tam okuma/yazma |
| **service role** | Sadece sunucu tarafı kodumuz (`lib/supabase/server.ts`) | RLS'i tamamen bypass eder — sınırsız. Anahtarı ele geçiren herkes bu seviyeye çıkar, bu yüzden madde 3'teki kurallar kritik |

Mimari gereği tek kullanıcı modeli var (bkz. `AI-KURALLARI.md` madde 6.3) —
"authenticated" ile "platform sahibi" bu projede eş anlamlı, farklı yetki
seviyeleri (editör, görüntüleyici vb.) yok.

### 1.2 Korunması gereken veriler (assets)

- **Taslak içerik** (`is_published = false` satırlar) — henüz yayına hazır
  olmayan hizmet/proje/referans metinleri; erken sızarsa müşteri için
  mahremiyet/itibar sorunu olabilir.
- **`contact_messages`** — ziyaretçilerin ad, telefon, mesaj gibi kişisel
  verileri (PII). En hassas veri, KVKK kapsamına girer.
- **`tenants.contact_recipient_email`** — operasyonel bilgi (form
  bildiriminin gideceği adres), herkese açık sitede hiç gösterilmez.
- **Sırlar** — service role key, veritabanı şifresi, Supabase Personal
  Access Token (bkz. madde 3).
- **Tenant izolasyonu** — bir tenant'ın verisi başka bir tenant'a asla
  görünmemeli/karışmamalı (çok kiracılı mimari, bkz. `AI-KURALLARI.md`
  madde 6.6).

### 1.3 Ana tehditler ve karşılıkları

| Tehdit | Karşılık |
|---|---|
| Anonim ziyaretçi taslak içeriği görür | RLS: anon sadece `is_published = true` okuyabilir (madde 2) |
| Anonim ziyaretçi `contact_messages`'ı okur (PII sızıntısı) | `contact_messages`'ta anon için hiç select policy yok — tamamen kapalı |
| Anonim ziyaretçi herhangi bir tabloya yazar (spam, tahrifat) | İstisnasız her tabloda insert/update/delete sadece `authenticated`'e açık |
| `tenants.contact_recipient_email` herkese açık sitede sızar | Kolon seviyesinde `REVOKE`/`GRANT` ile anon'dan tamamen gizli |
| Service role key/DB şifresi/access token tarayıcıya veya repoya sızar | Madde 3 — sadece sunucu tarafı, `.gitignore`'lu, chat'e hiç yazılmadı |
| `panel` route'u bir tenant'ın kendi domaininden erişilebilir olur | Proxy ile `Host` başlığına göre kısıtlanacak (henüz kodlanmadı — bkz. madde 8, açık madde) |
| İletişim formuna kötü amaçlı/doğrulanmamış veri gönderilir | Sunucu tarafı doğrulama (zod, `AI-KURALLARI.md` madde 6.5) — bkz. madde 2 |
| İletişim formu bot/spam ile doldurulur | Honeypot + sunucu tarafı IP hız sınırı, bkz. madde 14 |

## 2. RLS Politikaları

Row Level Security, projenin başından itibaren iki aşamada uygulandı:

**Aşama 1 — RLS açma (2026-08-06):** İlk migration'dan itibaren
(`supabase/migrations/20260806120000_create_content_tables.sql` ve
`20260807120000_add_testimonials_faqs_team_tables.sql`) istisnasız **11
tablonun tamamında** `enable row level security` çalıştırıldı. O aşamada
hiç policy yoktu — yani RLS açık + policy yok = **fail-closed**: service
role dışında kimse hiçbir satıra erişemiyordu (güvenli varsayılan, veri
girilmeden önce).

**Aşama 2 — okuma/yazma politikaları (2026-08-07):**
`supabase/migrations/20260807130000_add_rls_policies.sql` ile gerçek
politikalar eklendi. Kurallar:

- **Okuma:** `anon` her tabloda sadece `is_published = true` satırları
  görebilir. `site_settings`'in kendi `is_published` kolonu olmadığı için,
  bağlı olduğu `tenants` satırının yayın durumuna bakan bir `exists (...)`
  alt sorgusu kullanıldı. `authenticated` (platform sahibi) taslak dahil
  her şeyi okuyabilir.
- **Yazma:** İstisnasız her tabloda insert/update/delete sadece
  `authenticated`'e açık. `anon` için hiçbir yazma policy'si yok — policy
  yoksa RLS varsayılan olarak reddeder.
- **İstisna — `contact_messages`:** Ziyaretçi PII'si içerdiği için `anon`'a
  select bile açılmadı, tamamen kilitli. Anonim iletişim formunun
  yazabilmesi RLS/anon key üzerinden DEĞİL — *(2026-08-14, çözüldü)*
  `components/site/contact/actions.ts`'teki `submitContactForm` Server
  Action'ı, doğrulama başarılı olduktan SONRA service role client (RLS'i
  bypass eder) ile insert yapıyor. **Not (2026-08-07'deki ilk plandan
  revize):** ayrı bir `app/api/contact/` Route Handler'ı DEĞİL, mevcut
  Server Action kullanıldı — bu not 2026-08-07'de, proje henüz hiçbir
  yerde Server Action kullanmadan ÖNCE yazılmıştı; 2026-08-11'den beri
  HER form gönderimi (bu dahil) zaten bir Server Action, ayrı bir Route
  Handler eklemek tutarsız olurdu (bkz. `KARAR-GUNLUGU.md`, 2026-08-14).
- **Kolon seviyesinde gizlilik:** RLS satır bazlıdır, kolon gizleyemez.
  `tenants.contact_recipient_email` bu yüzden ayrıca `REVOKE`/`GRANT` ile
  anon'dan tamamen gizlendi; sadece güvenli kolonlar (`id`, `name`,
  `domain`, `theme_mode`, `is_published`, `is_platform_owner`) anon'a açık.

Tam gerekçe ve tablo tablo detay: `KARAR-GUNLUGU.md`, 2026-08-07 ("RLS
okuma/yazma politikaları eklendi").

## 3. Anahtar Yönetimi

| Sır/Anahtar | Nerede tutulur | Kim kullanır | Notlar |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` (commit'siz) + `.env.local.example` (şablon, commit'li) | Sunucu + tarayıcı | Gizli değil, proje adresi |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | Sadece sunucu (`lib/supabase/server.ts`) | RLS'i bypass eder — en kritik sır, tarayıcıya asla gönderilmez, `NEXT_PUBLIC_` öneki yok |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Sunucu + tarayıcı | RLS'e tabidir, tarayıcıya gönderilmesi güvenli |
| Veritabanı şifresi (Postgres) | Hiçbir yerde kalıcı saklanmıyor | Sadece CLI tipi üretimi sırasında geçici olarak connection string içinde | Yalnızca terminalde kullanıldı, dosyaya yazılmadı |
| Supabase Personal Access Token (`sbp_...`) | Hiçbir yerde kalıcı saklanmıyor | Sadece `npm run types:generate` çalıştırılırken geçici `$env:SUPABASE_ACCESS_TOKEN` | Hesap düzeyinde bir sır, proje sırrından farklı — istenirse dashboard'dan iptal edilebilir |
| `TEST_AUTH_EMAIL` / `TEST_AUTH_PASSWORD` | `.env.local` (geçici) | `scripts/test-rls.mjs` | Kalıcı uygulama config'i değil, RLS testi için — kullanıcı isterse silebilir veya panel auth'un gerçek girişi olarak kullanabilir |

**Kurallar (uygulanan, bkz. `AI-KURALLARI.md` madde 6.4):**
1. `.env.local` `.gitignore`'da (`.env*` kuralı, `.env.local.example`
   istisna) — hiçbir zaman commit'lenmedi.
2. `supabase/.temp/` (CLI'nin yerel bağlantı önbelleği) de `.gitignore`'da.
3. Hiçbir sır bu sohbette/chat geçmişinde açık yazılmadı — kullanıcı
   `.env.local`'i her zaman kendisi düzenledi; AI sadece hangi değerin
   nereden alınacağını (dashboard'daki menü yolunu) yönlendirdi.
4. Service role key sadece `lib/supabase/server.ts` içinde, sadece
   sunucu tarafı kodda kullanılıyor — hiçbir Client Component'e import
   edilmedi.

## 4. Test Sonuçları

RLS politikalarının **gerçekten** çalıştığı, sadece migration dosyasının
"doğru görünmesi" ile değil, gerçek `anon` ve `authenticated` rolleriyle
uçtan uca test edildi (`scripts/test-rls.mjs`, 2026-08-07). Sonuç — **6/6
test başarılı**:

| # | Test | Beklenen | Sonuç |
|---|---|---|---|
| 1 | anon → `services` okuma | Sadece `is_published = true` satırlar | ✅ (3/6 satır, hepsi yayında) |
| 2 | authenticated → `services` okuma | Taslak dahil tüm satırlar | ✅ (tüm satırlar döndü) |
| 3 | anon → `contact_messages` okuma | 0 satır (tamamen kapalı) | ✅ (0 satır) |
| 4 | authenticated → `contact_messages` okuma | Tüm satırlar | ✅ |
| 5 | anon → `services`'e insert | Reddedilmeli | ✅ ("new row violates row-level security policy" hatası) |
| 6 | authenticated → `services`'e insert | Başarılı olmalı | ✅ (eklendi, test sonrası service role ile temizlendi) |

Test sürecinde çıkan ve düzeltilen bir hata: script ilk halinde aynı
Supabase client örneğini hem anon hem sign-in sonrası authenticated için
kullanıyordu — `signInWithPassword` çağrıldığı client'ın oturumunu
yükselttiği için ilk çalıştırmada yanlış pozitif sonuçlar alındı (`anon`
etiketli testler aslında authenticated olarak çalışmıştı). İki bağımsız
client (`anonClient`/`authClient`) kullanacak şekilde düzeltildi. Detay:
`KARAR-GUNLUGU.md`, 2026-08-07 ("RLS politikaları gerçek veriyle test
edildi").

`scripts/test-rls.mjs` repoda kalıcı bir doğrulama aracı olarak duruyor —
yeni bir tablo/policy eklendiğinde tekrar çalıştırılabilir.

## 5. Kimlik Doğrulama Akışı *(2026-08-10 eklendi)*

Panel (`/panel`), Supabase Auth'un e-posta/şifre sağlayıcısıyla korunuyor.
**Kayıt olma (sign-up) kapalı** — Supabase Dashboard → Authentication →
Settings'te "Allow new users to sign up" kapatıldı. Tek admin hesabı,
platform sahibi tarafından Dashboard → Authentication → Users → **Add
user**'dan elle oluşturuldu (bkz. madde 7). Uygulama içinde hiçbir kayıt
formu yok ve olmayacak.

### İstemci ayrımı (üç ayrı oluşturma fonksiyonu)

Güncel resmi yaklaşım kullanıldı: `@supabase/auth-helpers-nextjs` (kullanımdan
kaldırıldı) değil, **`@supabase/ssr`**. Üç ayrı dosya, üç ayrı amaç:

| Dosya | Fonksiyon | Nerede kullanılır | Anahtar |
|---|---|---|---|
| `lib/supabase/client.ts` | `createBrowserSupabaseClient()` | Sadece `"use client"` bileşenlerinde | anon key |
| `lib/supabase/server.ts` | `createServerSupabaseClient()` | Server Component, Server Action, Route Handler — oturumu `next/headers` çerezlerinden okur/yazar | anon key |
| `lib/supabase/server.ts` | `createServiceRoleClient()` | Sadece herkese açık içerik sorguları (`getServices()` vb.) — panel/auth'la ilgisi yok, RLS bypass eder | service role key (asla tarayıcıya gitmez) |
| `lib/supabase/proxy.ts` | `updateSession()` | Kök `proxy.ts`'ten çağrılır — her istekte oturum çerezini tazeler + `/panel` korumasını uygular | anon key |

`createServerSupabaseClient()` ve `updateSession()` **aynı anon key'i**
kullanır ama farklı çerez arayüzleriyle (`next/headers` vs. `NextRequest`/
`NextResponse`) — Next.js'in Server Component'lerde çerez YAZAMAMASı
(sadece okuyabilir) yüzünden ikisi ayrı tutuluyor; `createServerSupabaseClient`
Server Action/Route Handler'dan çağrıldığında çerez yazabilir, Server
Component'ten çağrıldığında yazma denemesi sessizce yok sayılır (oturum
tazeleme zaten `proxy.ts`'in işi).

### Rotalar

- **`app/panel/giris/page.tsx`** — herkese açık giriş sayfası. E-posta/şifre
  formu, `TextField`/`Button` (tasarım sistemi bileşenleri), bir Server
  Action (`signInAction`) ile `supabase.auth.signInWithPassword()` çağırır.
  Hata varsa `?hata=...` query param'ıyla aynı sayfaya geri döner (client
  JS gerekmez, tamamen Server Component).
- **`app/panel/(protected)/`** — route group, `/panel`'in geri kalanı
  (URL'e segment eklemez). `layout.tsx` her isteğinde `getUser()` ile
  oturumu kontrol eder, yoksa `/panel/giris`'e yönlendirir; ayrıca giriş
  yapan kullanıcının e-postasını ve bir çıkış formunu (`signOutAction` —
  `supabase.auth.signOut()`) gösterir. `page.tsx` gerçek panel içeriği
  (ileride dolacak).
- **Kök `proxy.ts`** (Next.js 16'da `middleware.ts`'in yeni adı — bkz.
  `docs/KARAR-GUNLUGU.md`) — `/panel` altındaki (giriş sayfası hariç) her
  isteği, sayfa hiç render edilmeden önce kontrol eder.

### Neden iki katmanlı koruma (`proxy.ts` + layout)

Next.js'in kendi belgesi açıkça uyarıyor: *"Proxy should not be used as a
full session management or authorization solution"* ve *"Always verify
authentication ... inside each Server Function rather than relying on
Proxy alone."* Bu yüzden:

1. **`proxy.ts`** — hızlı, "iyimser" (optimistic) bir ön kontrol; sayfa hiç
   render edilmeden yönlendirme yapar, iyi bir kullanıcı deneyimi sağlar.
2. **`app/panel/(protected)/layout.tsx`** — bağımsız, gerçek/kesin kontrol;
   `proxy.ts` bir sebeple atlanırsa (yanlış `matcher`, gelecekte bir
   yapılandırma hatası) bile panel içeriği asla korumasız kalmaz.

İkisi de `getUser()` kullanıyor, **`getSession()` değil** — `getSession()`
sadece yerel çerezi okur, sunucu tarafında Supabase'e karşı doğrulamaz;
sahte/değiştirilmiş bir çerezle atlatılabilir. `getUser()` her seferinde
Supabase Auth sunucusuna sorar, bu yüzden güvenlik kontrolü için doğru
fonksiyon budur (Supabase'in kendi resmi uyarısı).

## 6. Oturum Yönetimi *(2026-08-10 eklendi)*

- Oturum, Supabase Auth'un access/refresh token çiftiyle, **HttpOnly
  çerezlerde** taşınıyor (tarayıcı JS'i çerezi okuyamaz, XSS riskini
  azaltır) — `@supabase/ssr` bu çerezleri otomatik yönetiyor, elle bir
  şey yazılmadı.
- **Oturum süresi dolduğunda ne olur:** Access token varsayılan olarak
  ~1 saat sonra süresi dolar. `proxy.ts`, her istekte `getUser()` çağırarak
  gerekirse refresh token'ı kullanıp access token'ı **sessizce tazeler**
  (kullanıcı hiçbir şey fark etmez, sayfada kalır). Refresh token'ın
  KENDİSİ de süresi dolmuş/iptal edilmişse (ör. çok uzun süre
  kullanılmama, ya da admin Dashboard'dan oturumu elle sonlandırırsa),
  `getUser()` boş döner — bir sonraki `/panel` isteğinde/gezinmesinde
  `proxy.ts` kullanıcıyı otomatik olarak `/panel/giris`'e yönlendirir;
  `app/panel/(protected)/layout.tsx`'teki ikinci kontrol de aynı sonucu
  üretir (bkz. madde 5).
- Çıkış (`signOutAction`), Supabase'e o oturumu geçersiz kılmasını söyler
  ve çerezleri temizler — çıkış yapıldıktan sonra `/panel`'e geri dönmeye
  çalışmak yeniden `/panel/giris`'e yönlendirilir (bkz. Doğrulama testleri,
  `docs/DURUM.md`).

## 7. Admin Hesabı Yönetimi *(2026-08-10 eklendi)*

- **Tek hesap, tek rol** — sistemde başka hiçbir kullanıcı/rol yok
  (bkz. `AI-KURALLARI.md` madde 6.3). Hesap, Supabase Dashboard →
  Authentication → Users → **Add user**'dan, "Auto Confirm User" işaretli
  şekilde elle oluşturuldu — uygulama içinde bir kayıt akışı yok ve
  olmayacak.
- **Şifre sıfırlama:** Aynı Dashboard ekranından (Users → ilgili kullanıcı
  → "Send password recovery" veya doğrudan yeni şifre atama) yapılır,
  uygulama içinde "şifremi unuttum" akışı henüz yok.
- **Müşteriye devir (gelecek):** PRD'ye göre bu ürün "tam yönetilen"
  (platform sahibi tüm içeriği yönetir) bir hizmet, ama admin hesabı
  bilgisi ileride müşteriye devredilebilir senaryosu göz önünde
  bulunduruldu (bkz. kullanıcı talimatı) — devir anında yapılması
  gerekenler: (1) Dashboard'dan yeni bir şifre ata, (2) yeni bilgiyi
  güvenli bir kanaldan ilet, (3) eski şifreyi bir daha kullanma.
- **Şifre hiçbir zaman koda/docs'a/sohbete yazılmaz** — sadece Dashboard
  üzerinden, platform sahibinin kendi güvenli saklama yöntemiyle (şifre
  yöneticisi vb.) tutulur.

## 8. Rota Koruma Katmanları *(2026-08-12 eklendi)*

`/panel` altındaki her şey (giriş sayfası hariç) **iki bağımsız katmanla**
korunuyor — biri diğerinin yerine geçmiyor, ikisi de ayrı ayrı çalışıyor
(katmanlı savunma):

| Katman | Dosya | Ne yapar | Ne zaman çalışır |
|---|---|---|---|
| 1 — Proxy (ön kontrol) | `proxy.ts` (kök) + `lib/supabase/proxy.ts` | `/panel/*` (giriş sayfası hariç) için oturumu kontrol eder, yoksa `/panel/giris`'e yönlendirir | Sayfa hiç render edilmeden önce, her istekte |
| 2 — Layout (kesin kontrol) | `app/panel/(protected)/layout.tsx` | `getUser()` ile BAĞIMSIZ bir kez daha kontrol eder | Proxy'den geçmiş her istekte, gerçek sayfa bileşeni render edilmeden hemen önce |

**Neden iki katman:** Next.js'in kendi belgesi proxy'nin "tam bir oturum
yönetimi/yetkilendirme çözümü" olarak kullanılmamasını, asıl kontrolün her
zaman sunucu tarafı kodun kendisinde (Server Component/Action/Route
Handler) tekrarlanmasını öneriyor (bkz. madde 5). Pratikte: `proxy.ts`
bir sebeple atlanırsa (yanlış `matcher` yapılandırması, ileride bir
yeniden düzenleme) bile, `layout.tsx`'teki bağımsız kontrol panel
verisinin render edilmesini yine de engeller.

### Geri dönüş (`next`) parametresi

Oturumu olmayan bir kullanıcı `/panel/mesajlar` gibi belirli bir sayfaya
gitmeye çalışırsa, `proxy.ts` onu `/panel/giris?next=/panel/mesajlar`'a
yönlendirir; giriş formunda gizli bir alan olarak taşınan bu değer, başarılı
girişten sonra kullanıcıyı asıl gitmek istediği sayfaya geri götürür (bkz.
`app/panel/giris/page.tsx`).

**Açık yönlendirme (open redirect) koruması:** `next` değeri asla
doğrudan `redirect()`'e verilmiyor — `lib/utils.ts`'teki
`getSafeRedirectPath()` fonksiyonu şunları reddedip güvenli varsayılana
(`/panel`) düşürür:
- `/` ile başlamayan her şey (`https://evil.com`, `javascript:...`),
- `//` ile başlayan protokol-göreli URL'ler (`//evil.com` — tarayıcı bunu
  dış siteye gider şekilde yorumlar),
- `/panel` önekiyle başlamayan her yol,
- `/panel/giris`'in kendisi (aksi halde "giriş yaptım, yine giriş
  sayfasındayım" gibi anlamsız bir yönlendirme olurdu).

**Sonsuz döngü riski yok:** `proxy.ts`, `/panel/giris`'in KENDİSİNİ hiç
kontrol etmiyor (`isLoginPage` koşuluyla hariç tutuluyor) — giriş sayfası
kendi kendini asla tekrar giriş sayfasına göndermiyor. `layout.tsx`
sadece `(protected)` route group'unun içini sarıyor, `/panel/giris`
(ayrı bir kardeş route) bu layout'un hiç parçası değil — o da ikinci bir
döngü kaynağı olamaz. Gerçek testlerle doğrulandı (bkz. madde 9).

### Kanonik adrese yönlendirme *(2026-08-17 eklendi)*

`lib/supabase/proxy.ts`'teki `updateSession()`'ın EN BAŞINDA (oturum
mantığından önce) çalışan ayrı bir kontrol: istek, bilinen kanonik
adresten (`NEXT_PUBLIC_SITE_URL`/`VERCEL_PROJECT_PRODUCTION_URL`) farklı
bir host'tan geliyorsa (ör. Vercel'in git-dalı önizleme adresi veya
deploy'a özel adresi — bkz. madde 15/`docs/SEO-PERFORMANS.md`), 308
(kalıcı) ile kanonik adrese yönlendirilir. Bu SADECE SEO için değil —
**panel oturum çerezleri de bu sayede her zaman AYNI origin'de kurulur**,
birden fazla adres arasında dağılıp tutarsız/kaybolan oturum durumuna
düşmez. Sadece kanonik adres KESİN olarak biliniyorsa çalışır (Vercel'in
deploy'a özel `VERCEL_URL`'i gibi güvenilmez bir tahminle YÖNLENDİRME
yapılmaz — SEO madde 15'teki gerekçeyle aynı) ve `localhost`'ta/geliştirme
modunda devre dışıdır.

## 9. Yetkisiz Erişim Test Sonuçları *(2026-08-12 eklendi)*

Kullanıcının isteği üzerine, çıkış yapmış/hiç giriş yapmamış bir durumda
(çerezsiz `curl` istekleri — tarayıcıda "gizli sekme"den daha kesin bir
simülasyon, JS/hydration'ın gizleyebileceği hiçbir şeye izin vermez)
panel adreslerine doğrudan erişim denendi. **4/4 test geçti:**

| # | Test | Beklenen | Sonuç |
|---|---|---|---|
| 1 | Çerezsiz `GET /panel` | 307 yönlendirme, `/panel/giris?next=%2Fpanel`'e | ✅ |
| 2 | Çerezsiz `GET /panel/mesajlar` (gerçek mesaj verisi içeren rota) | 307 yönlendirme, gövdede SIFIR panel verisi | ✅ — yönlendirme gövdesi sadece hedef URL metni (26-42 bayt), `Mehmet Yılmaz`, `Özet`, `okunmamış` gibi hiçbir iz yok |
| 3 | Çerezsiz `GET /panel/giris` (giriş sayfasının kendisi) | 200 OK, YÖNLENDİRME YOK (döngü kontrolü) | ✅ |
| 4 | `GET /panel/giris?next=/panel/mesajlar` | Formun gizli `next` alanı `/panel/mesajlar` değerini taşımalı | ✅ |

**Sonuç:** KABUL KRİTERİ'ndeki "adres çubuğuna doğrudan yazan girişsiz
kullanıcı içeriği bir an bile görmesin" koşulu gerçek bir sunucuya karşı
doğrulandı — bu bir kod incelemesi değil, çalışan `next dev` sunucusuna
atılan gerçek HTTP istekleriydi (2026-08-12).

## 10. Yayın Öncesi Güvenlik Kontrol Listesi (Durum: 2026-08-17)

Bu proje şu an gerçek bir müşteriye canlıya alınmıyor (bkz. `DURUM.md`,
"Proje bağlamı") — ama ileride bu değişirse, veya staj değerlendirmesi için
"bitti" sayılmadan önce, aşağıdaki liste madde madde işaretlenmeli.

**⚠️ SONUÇ: Liste hâlâ tam işaretli DEĞİL — aşağıdaki "Henüz açık" bölümünde
en az bir madde varken gerçek bir müşteriye canlıya ÇIKILMAMALI (KISITLAR'ın
kendi kuralı).** Bugünkü (2026-08-17) oturumda 4 yeni madde kapandı, ama
tenant/domain ayrımı gibi bazı maddeler bilinçli olarak hâlâ açık.

**Tamamlanan maddeler:**
- [x] Tüm tablolarda RLS açık (11/11 tablo, bkz. madde 2).
- [x] Her tabloda anon için en az bir select policy VAR ya da bilinçli
      olarak HİÇ YOK (`contact_messages` istisnası, kasıtlı).
- [x] anon rolü hiçbir tabloda insert/update/delete yapamıyor — gerçek
      testle doğrulandı (madde 4).
- [x] Hassas kolon (`tenants.contact_recipient_email`) anon'dan kolon
      seviyesinde gizlendi.
- [x] `.env.local` commit'lenmedi — `git status`/`.gitignore` ile VE
      2026-08-17'de tüm `git log --all` geçmişi taranarak doğrulandı
      (bkz. madde 16, sır taraması).
- [x] Service role key sadece sunucu tarafı kodda kullanılıyor —
      2026-08-17'de gerçek prod client bundle'ı (`.next/static`) grep
      edilerek, sızmadığı doğrudan doğrulandı (bkz. madde 16).
- [x] Şema tipleri (`types/database.types.ts`) gerçek şemadan üretiliyor —
      yanlış kolon adı yazımı derleme zamanında yakalanır (bkz. `MIMARI.md`
      madde 4.2).

**Tamamlanan maddeler (2026-08-10 eklendi):**
- [x] Panel auth'u (Supabase Auth, e-posta/şifre, kayıt kapalı) kodlandı —
      bkz. madde 5-7.

**Tamamlanan maddeler (2026-08-14 eklendi):**
- [x] İletişim formu → sunucu tarafı doğrulama → `contact_messages`'a
      insert çalışıyor (bkz. madde 2 — Route Handler değil, Server
      Action).

**Tamamlanan maddeler (2026-08-17 eklendi, bugünkü oturum):**
- [x] Kullanıcıdan alınan formlarda (iletişim) rate limiting/spam
      koruması eklendi — honeypot + sunucu tarafı IP hız sınırı, bkz.
      madde 14. **Not:** gerçek bir bot simülasyonuyla henüz canlı
      test edilmedi, sadece kod incelemesiyle doğrulandı (dürüstçe
      belirtilmeli).
- [x] Lighthouse Best Practices skoru ölçüldü: **96/100** (hem mobil hem
      masaüstü) — hedef ≥90'ın üzerinde (bkz. `TEST-STRATEJISI.md`
      madde 4, ölçüm tarihi 2026-08-17).
- [x] Temel güvenlik başlıkları eklendi (CSP, X-Frame-Options,
      X-Content-Type-Options, Referrer-Policy, Permissions-Policy,
      Strict-Transport-Security) VE gerçek sunucuya karşı `curl.exe -I`
      ile canlı doğrulandı, 6/6 doğru geldi — bkz. madde 15.
- [x] Hata sayfaları (`app/not-found.tsx`, `app/error.tsx`,
      `app/global-error.tsx`) kullanıcıya teknik detay (stack trace,
      hata mesajı) göstermiyor, ne yapması gerektiğini söylüyor.
- [x] Sır taraması yapıldı (repo + git geçmişi TÜMÜ + prod client
      bundle) — sızıntı bulunmadı, bkz. madde 16 (detaylı kanıt).
- [x] `npm audit` çalıştırıldı — **0 güvenlik açığı** bulundu. Not: bu,
      bağımlılıkların o AN bilinen açık listesine göre temiz olduğu
      anlamına gelir, gelecekte yeni açıklar bildirilebilir — periyodik
      olarak tekrar çalıştırılmalı.
      **Güncelleme (2026-08-19):** Bu uyarı aynen gerçekleşti. Yeni bir
      makinedeki temiz `npm install` sonrası `npm audit` **1 high** bildirdi
      (`nanoid <3.3.18`, GHSA-2v37-7h3g-55p8) — 2026-08-17'den sonra
      yayınlanmış bir advisory. `npm audit fix` ile kapatıldı (`--force`
      KULLANILMADI; sadece semver-uyumlu yama: `nanoid` 3.3.17 → 3.3.18,
      tek paket değişti, `next`/`postcss`/`tailwindcss` sürümlerine
      dokunulmadı). Sonrası: **0 açık**, `npm run build`/`lint`/`test`
      (54/54 + 3/3) hepsi temiz. `nanoid` yalnızca build zamanında
      (`postcss` üzerinden) kullanılıyor, çalışma zamanı paketinde yok —
      pratik risk düşüktü, yine de periyodik denetim ilkesi gereği
      kapatıldı. Detay: `KARAR-GUNLUGU.md`, 2026-08-19.

**Henüz açık/yapılmamış maddeler (bilinçli olarak, sıradaki adımlarda):**
- [ ] Proxy (`proxy.ts`) ile `panel` route'unun bir tenant'ın kendi
      domaininde tamamen erişilemez olduğu henüz doğrulanmadı — bu, Host
      header'a göre tenant çözümleyen ayrı bir mantık gerektiriyor (bkz.
      `MIMARI.md` madde 7), henüz yazılmadı. Şu anki `proxy.ts` sadece
      oturum kontrolü yapıyor, tenant/domain ayrımı yapmıyor.
- [x] *(2026-08-18 dokuzuncu oturum eklendi)* İletişim formu bildirimi
      artık Resend ile e-posta de gönderiyor (`tenants.contact_recipient_email`
      doluysa, panel → Ayarlar → Bildirimler'den ayarlanır) — DB kaydı her
      zaman gerçek kaynak, e-posta best-effort bir ek kanal (bkz.
      `KARAR-GUNLUGU.md`). `RESEND_API_KEY` ayarlanmadıysa (henüz canlı
      doğrulanmadı) sessizce devre dışı kalır.
- [ ] Spam koruması (madde 14) gerçek bir bot/saldırı simülasyonuyla henüz
      canlı test edilmedi.
- [ ] Gerçek bir müşteriye canlıya alınacaksa: Vercel Hobby → Pro plan
      geçişi (bkz. `MIMARI.md` madde 5) ve KVKK aydınlatma metni/çerez
      politikası (bkz. `KURUMSAL-SITE-STANDARTLARI.md`) eklenmeli — ayrıca
      yeni saklanan `contact_messages.sender_ip` kolonu KVKK aydınlatma
      metnine eklenmeli (bkz. madde 14).

Bu liste, ilgili adımlar tamamlandıkça güncellenmeli — yeni bir madde
"tamamlandı" olarak işaretlenmeden önce madde 4'teki gibi gerçek bir testle
doğrulanmalı, sadece kod yazılmış olması yeterli sayılmamalı.

## 11. Storage Politikaları *(2026-08-14 eklendi)*

Supabase Storage'ın kendi RLS'i vardır — `storage.objects` tablosu
üzerinde, içerik tablolarıyla (madde 2) AYNI mantıkla ama ayrı bir
politika seti gerektirir. Bir bucket'ın `public=true` olması SADECE
kimliksiz (anon) `GET` isteklerinin özel `/storage/v1/object/public/...`
adresinden çalışmasını sağlar — `.upload()`/`.remove()`/`.list()` gibi
SDK çağrıları bucket'ın public/private durumundan BAĞIMSIZ olarak HER
ZAMAN `storage.objects` RLS'inden geçer. Bu yüzden "yazma yalnız giriş
yapmış kullanıcıya" garantisi bucket ayarına değil, RLS policy'lerine
dayanır.

**Kurulu tek bucket: `"projects"`, `public=true`.**
(`supabase/migrations/20260814120000_create_projects_storage_bucket.sql`)
İçerik tablolarındaki yerleşik 5-policy deseniyle (madde 2) birebir aynı,
`bucket_id = 'projects'` filtresiyle:

| Politika | Rol | İşlem |
|---|---|---|
| `projects_bucket_anon_select` | anon | select |
| `projects_bucket_authenticated_select` | authenticated | select |
| `projects_bucket_authenticated_insert` | authenticated | insert |
| `projects_bucket_authenticated_update` | authenticated | update |
| `projects_bucket_authenticated_delete` | authenticated | delete |

**İkinci bucket: `"branding"`, `public=true` (2026-08-15 eklendi).**
(`supabase/migrations/20260815120000_add_theme_settings_and_branding.sql`)
`"projects"` ile BİREBİR aynı 5-policy deseni, `bucket_id = 'branding'`
filtresiyle — panelin Tema ekranındaki logo/favicon yüklemesi için
(`site_settings.logo_path`/`favicon_path`).

**Kalan 5 bucket kısmen tamamlandı (2026-08-18 eklendi).** Mentör
incelemesinde 2026-08-14'teki bulgu tekrar doğrulandı: `services.
image_path`, `hero_sections.background_image_path`, `about_sections.
image_path`, `testimonials.logo_path`, `team_members.photo_path`
kolonları var, görüntüleme bileşenleri zaten `"services"`/`"hero"`/
`"about"`/`"testimonials"`/`"team"` bucket'larını bekliyordu ama HİÇBİRİ
oluşturulmamıştı. Migration
(`supabase/migrations/20260818120000_create_remaining_storage_buckets.sql`)
5 bucket'ın hepsini `"projects"` ile birebir aynı 5-policy desende
ekliyor:

| Bucket | Public | Kullanan tablo/kolon |
|---|---|---|
| `services` | evet | `services.image_path` |
| `hero` | evet | `hero_sections.background_image_path` |
| `about` | evet | `about_sections.image_path` |
| `testimonials` | evet | `testimonials.logo_path` |
| `team` | evet | `team_members.photo_path` |

**Yükleme akışı (panel UI) sadece 3'ü için kuruldu:** Hizmetler,
Referanslar, Ekip — `ProjectImageUploader.tsx`/`imageActions.ts` ile
BİREBİR aynı desende (aynı doğrulama/temizlik/yetkilendirme kuralları),
bkz. `app/panel/(protected)/icerikler/{hizmetler,referanslar,ekip}/`.
**Hero ve Hakkımızda hâlâ kapsam dışı** — bu ikisi için panelde hiçbir
içerik düzenleme ekranı yok (sadece Sayfa Düzeni görünürlük/sıra
yönetiyor), bucket kurulsa da bağlanacak bir form yok; bu, ayrı ve daha
büyük bir görev (bkz. `docs/DURUM.md`, "Sıradaki adım" madde 1).

**Migration Supabase'e uygulandı, kullanıcı 3 akışı (Hizmetler/
Referanslar/Ekip) gerçek tarayıcıda uçtan uca doğruladı (2026-08-18) —
5 bucket'ın hepsi artık gerçekten var, aşağıdaki madde 17'deki "5 bucket
YOK" tespiti bu tarihten SONRA geçersiz (bkz. madde 17'nin sonundaki
güncelleme notu).**

## 12. Dosya Yükleme Kuralları *(2026-08-14 eklendi)*

Panelden görsel yükleme (Projeler —
`app/panel/(protected)/icerikler/projeler/imageActions.ts` — ve
2026-08-15'ten itibaren logo/favicon —
`app/panel/(protected)/tema/imageActions.ts`) şu kuralları İSTİSNASIZ
uygular:

1. **Oturum kontrolü İLK satır** (`requireAdminUser()`, madde 5'teki
   AYNI ilke) — hem uygulama katmanında hem Storage RLS katmanında
   (madde 11) yalnız giriş yapmış kullanıcı.
2. **Tür doğrulaması dosyanın GERÇEK baytlarına (magic number) bakar,
   uzantıya veya tarayıcının bildirdiği MIME'a asla güvenmez**
   (`lib/supabase/imageValidation.ts` — JPEG `FF D8 FF`, PNG `89 50 4E
   47 0D 0A 1A 0A`, WEBP `RIFF....WEBP`). Bu fonksiyon hem istemcide
   (anında geri bildirim) hem sunucuda (yetkili/gerçek doğrulama) AYNI
   şekilde çalışır — istemci tarafı asla güvenlik sınırı değildir.
3. **Boyut sınırı: 10 MB** *(2026-08-18'de 5 MB'dan yükseltildi —
   kaliteli DSLR/drone fotoğrafları 5 MB'ı kolayca aşabiliyordu, `next/
   image` zaten ziyaretçiye giden boyutu otomatik optimize ettiği için
   bu yükseltmenin site performansına bir etkisi yok)*, aşılırsa somut/
   aksiyon öneren bir Türkçe mesaj döner (`lib/supabase/imageValidation.ts`
   `MAX_IMAGE_SIZE_BYTES`).
4. **İki AYRI transport-katmanı sınırı var, ikisi de uygulama
   sınırından (madde 3, 10 MB) yüksek tutulmalı — biri unutulursa
   kullanıcı bizim güzel mesajımızı değil framework'ün ham hatasını
   görür.** `next.config.ts`:
   - `experimental.serverActions.bodySizeLimit: "15mb"` — Server
     Action'ların varsayılan ham gövde limiti 1 MB.
   - `experimental.proxyClientMaxBodySize: "15mb"` — kök `proxy.ts`'in
     (panel auth koruması, matcher'ı NEREDEYSE TÜM istekleri kapsıyor)
     KENDİ, birinciden TAMAMEN BAĞIMSIZ çalışan istek gövdesi tamponlama
     sınırı, varsayılanı **10 MB**. **Gerçek bir 10 MB'lık test
     dosyasıyla canlı olarak yakalanan bir hata** (2026-08-14): ilk
     denemede sadece `serverActions.bodySizeLimit` yükseltilmişti, 10
     MB'lık dosya bu ikinci (unutulan) sınıra takılıp istek gövdesi
     bozuldu — `HTTP 500`, "Failed to parse body as FormData". İkisi de
     aynı değere (15mb) çıkarılınca düzeldi. **Ders:** `proxy.ts`
     kullanan bir projede büyük istek gövdesi (dosya yükleme vb.)
     kabul eden HER YENİ rota için bu iki ayarın TUTARLI olduğu
     kontrol edilmeli — biri yeterli değil.
5. **Benzersiz, kullanıcı girdisinden tamamen bağımsız dosya adı —
   path traversal yapısal olarak imkansız.** `crypto.randomUUID()` +
   madde 2'de doğrulanan türden üretilen uzantı: yol
   `${tenantId}/${uuid}.${uzantı}`. Kullanıcının gönderdiği dosya adının
   TEK BİR KARAKTERİ bile bu yola karışmıyor.
6. **Atomiklik — yarım/yetim kayıt kalmaz.** Sıra: (a) Storage'a yükle,
   (b) başarılıysa DB satırını güncelle. (b) başarısız olursa (a)'da
   yüklenen nesne HEMEN silinir (telafi edici temizlik). Görsel
   değiştiriliyorsa, yeni görsel başarıyla kaydedildikten SONRA eski
   görsel best-effort silinir (başarısız olsa da işlem başarısız
   SAYILMAZ, sadece loglanır).
7. **Silme işlemi de aynı auth/RLS kurallarına tabi** —
   `deleteProjectImageAction`, hem "Kaldır" (proje düzenleme sayfasında)
   hem Medya Kütüphanesi'nin "Sil" butonu tarafından paylaşılıyor;
   silinen görsele işaret eden proje kaydı varsa `image_path` otomatik
   `null`'a çekilir (kırık görsel referansı sitede kalmaz).

**Doğrulama (gerçek, tamamlandı — 2026-08-14):** Bkz. `docs/KARAR-GUNLUGU.md`
— RLS testi (anon reddedildi, authenticated başarılı) + 5 senaryolu
uygulama mantığı testi (geçerli ~2MB görsel, gerçek ~10MB görsel ile
boyut reddi, sahte uzantı/magic-byte uyuşmazlığı, kötü niyetli dosya
adıyla path traversal denemesi, DB yazma hatasında Storage temizliği) —
hepsi gerçek Supabase Storage'a karşı, curl + doğrudan Storage/DB
sorgularıyla teyit edildi. Test sırasında madde 12.4'teki
`proxyClientMaxBodySize` hatası da bu testlerle bulunup düzeltildi.

## 13. Herkese Açık SEO Rotaları: Sitemap, Robots, JSON-LD, OG Görsel *(2026-08-17 eklendi)*

`app/sitemap.ts`, `app/robots.ts`, `app/api/og/route.tsx` ve her sayfada
render edilen `LocalBusinessJsonLd` **kasıtlı olarak tamamen herkese
açık, oturumsuz** — arama motoru botları/paylaşım kartı önizleyicileri
(WhatsApp, LinkedIn vb.) hiçbir zaman giriş yapmaz, bu dosyaların auth
arkasında olması SEO'yu tamamen işlevsiz kılardı. Bu, madde 1-2'deki
"anon sadece `is_published=true` okur" ilkesiyle ÇELİŞMİYOR — hepsi zaten
`createServiceRoleClient()`/sabit domain üzerinden, herkese açık/
yayındaki bilgiyi (firma adı, adres, telefon, çalışma saatleri — zaten
`/iletisim` sayfasında da görünen aynı veri) döndürüyor, hiçbir taslak/
yayınlanmamış içerik ya da iç sistem bilgisi sızdırmıyor.

**`robots.txt`, `/panel`'i Disallow ediyor — bu bir GÜVENLİK sınırı
DEĞİL, ek bir katman.** Panelin gerçek erişim koruması hâlâ ve sadece
`proxy.ts` + `requireAdminUser()` (madde 5-8) — `Disallow` sadece uyumlu
botları paneli TARAMAKTAN/dizinlemekten caydırır, kötü niyetli/uyumsuz
bir istemciyi ENGELLEMEZ (robots.txt bir centilmenlik anlaşmasıdır, erişim
kontrolü değil). Panel zaten dizine hiç eklenmemesi gereken bir alan
olduğu için bu ek katman sadece "arama sonuçlarında yanlışlıkla
görünme" riskini azaltıyor.

**`/api/og` görsel üretimi DB'den okuyor ama yazmıyor, girdi almıyor** —
sorgu parametresi/kullanıcı girdisi kabul etmiyor (sabit, parametresiz
`GET`), bu yüzden görsel enjeksiyonu/parametre kötüye kullanımı yüzeyi
yok. `LocalBusinessJsonLd`'deki `dangerouslySetInnerHTML` madde 12.2'deki
"kullanıcı girdisine asla güvenme" ilkesiyle ÇELİŞMİYOR gibi görünse de
gerekçesi FARKLI: buradaki veri ziyaretçi girdisi değil, panelden
(`requireAdminUser()` arkasında) admin tarafından girilmiş veri +
`JSON.stringify` — script injection yüzeyi yok (bkz. bileşenin kendi
yorum satırı).

**Doğrulama (gerçek, tamamlandı — 2026-08-17):** `npm run dev`'e karşı
gerçek `curl` ile `/robots.txt`/`/sitemap.xml`/`/api/og` doğrulandı;
Google'ın Zengin Sonuçlar Testi'ne (search.google.com/test/rich-results,
"Kod" sekmesi) gerçek üretilen JSON-LD yapıştırılıp **0 hata** ile
doğrulandı. Detay: `docs/SEO-PERFORMANS.md`.

## 14. Spam Koruması *(2026-08-17 eklendi)*

İletişim formu (`components/site/contact/`) kimliği doğrulanmamış her
ziyaretçiye açık ve gelen talepler firmanın en değerli çıktısı —
dışarıdan gelen bir yönergeyle, gerçek kullanıcıyı zorlamayan **2
katmanlı** bir spam koruması eklendi. CAPTCHA bilinçli olarak SON ÇARE
sayıldı (KISITLAR) — aşağıdaki "CAPTCHA'ya ne zaman geçilir" bölümüne
bakın.

### Katman 1 — Gizli tuzak alanı (honeypot)

`lib/security/contactHoneypot.ts` (`isHoneypotFilled`) +
`ContactForm.tsx`'teki gizli alan.

```ts
// lib/security/contactHoneypot.ts
export const HONEYPOT_FIELD_NAME = "iletisim_notu";

export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD_NAME);
  return typeof value === "string" && value.trim().length > 0;
}
```

```tsx
// ContactForm.tsx — gerçek ziyaretçi bunu ASLA görmez/odaklanmaz
<div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
  <label htmlFor="iletisim-hp">Referans</label>
  <input
    type="text"
    id="iletisim-hp"
    name="iletisim_notu"
    tabIndex={-1}
    autoComplete="off"
    data-lpignore="true"
    data-1p-ignore="true"
  />
</div>
```

**Erişilebilirlik (KISITLAR):** `aria-hidden="true"` ekran okuyucudan
tamamen çıkarır, `tabIndex={-1}` klavye Tab sırasından çıkarır,
ekran-dışı konumlandırma (`display:none`/`visibility:hidden` DEĞİL —
bazı botlar özellikle bunları tarayıp atlıyor) görsel olarak gizler.

**GERÇEK BİR OLAY (2026-08-18) — false-positive, gerçek müşteri
mesajları sessizce kayboldu:** Alan adı önceden `"website"`, etiketi
"Web siteniz" idi — bu satırların ALTINDA önceden "autoComplete=off +
'website' adı false-positive riskini azaltır" YAZIYORDU, bu iddia
YANLIŞ çıktı. Kullanıcı panelde yeni gönderilen mesajların hiç
görünmediğini fark etti; sunucu logunda `submitContactForm: honeypot
alanı dolu, gönderim yok sayıldı.` uyarısı bulundu — GERÇEK bir
ziyaretçinin (kullanıcının kendisinin, test ederken) tarayıcısı bu
alanı arka planda otomatik doldurmuştu. Kök sebep: Chrome/parola
yöneticileri (LastPass, 1Password vb.) `autocomplete="off"`'u sıkça
YOK SAYAR, "website"/"web sitesi" gibi tanınır isim+etiket
kombinasyonlarını kendi otomatik-doldurma sezgiselleriyle eşleştirir.
Düzeltme: alan adı `"iletisim_notu"`, etiketi "Referans" — hiçbir
standart otomatik-doldurma kategorisiyle eşleşmeyen nötr bir isim —
+ `data-lpignore="true"`/`data-1p-ignore="true"` (LastPass/1Password'e
özel "yok say" ipuçları) eklendi. **Ders:** bir honeypot alanının adı
SADECE bot davranışı düşünülerek değil, gerçek tarayıcı/eklenti
otomatik-doldurma sezgiselleri de düşünülerek seçilmeli — "website",
"email", "phone", "name" gibi tanınır kelimeler yüksek risk taşıyor.

**Ne kadar etkili / nasıl atlatılır (dürüstçe):** Formu programatik
olarak (headless tarayıcı, script) her alanı dolduran "kaba kuvvet"
botların büyük kısmını yakalar — bu botlar genelde DOM'daki her
`<input>`'u görür görmez doldurur, ARIA/CSS'e bakmaz. **Atlatma yolu
basit:** bir bot yazarı bu SİTEYİ özel olarak inceleyip honeypot
alanını BOŞ bırakacak şekilde script'ini ayarlarsa (ya da genel kural
olarak "görmediğim/adı tanımadığım alanlara dokunma" stratejisi
kullanan bir bot ise) bu katman hiç iş görmez. Yani: **jenerik/otomatik
botlara karşı güçlü, SİTEYE ÖZEL hedeflenmiş bir bota karşı zayıf.**
İsim değişikliği (2026-08-18) bu dengeyi hafifçe etkiledi: artık
"website'e link yazan" DAR bot türüne karşı koruma biraz azaldı (adı
tahmin etmesi gerekiyor), ama bu, gerçek müşteri kaybına karşı kabul
edilebilir bir ödünleşim.

**Yanlış pozitif / mesaj kaybı:** Tetiklenirse istek sessizce yok
sayılır (DB'ye yazılmaz) ama kullanıcıya YİNE DE başarı mesajı
gösterilir — botu "yakalandığını" öğrenip stratejisini değiştirmesin
diye. Gerçek bir ziyaretçinin bu alanı doldurma ihtimali (aria-hidden +
ekran dışı + tabIndex=-1 üçlüsüyle) pratikte sıfıra yakın, bu yüzden bu
katmanda "sessiz reddetme" kabul edilebilir bir risk (KISITLAR'daki
"mesajı kaybetme" endişesi asıl katman 2 için geçerli, aşağıda).

### Katman 2 — Sunucu tarafı IP-bazlı hız sınırı

`lib/security/contactRateLimit.ts` (`checkContactRateLimit`) —
**KISITLAR: "hız sınırı sunucu tarafında olsun"**, bu fonksiyon sadece
`components/site/contact/actions.ts`'teki Server Action'dan çağrılır,
istemci tarafı hiç göremez/etkileyemez.

**Gerçek bir build hatası bulunup düzeltildi (2026-08-17):** Honeypot
(katman 1, istemci-güvenli) ve hız sınırı (katman 2, `next/headers`
kullanır — sunucuya özel) başlangıçta TEK dosyada (`contactSpamGuard.ts`)
yazılmıştı. `ContactForm.tsx` (Client Component) bu dosyadan sadece
`HONEYPOT_FIELD_NAME`'i import etse bile, Next.js/Turbopack dosyanın
TAMAMINI (içindeki `next/headers` importu dahil) tarayıcı paketine dahil
etmeye çalıştı ve `npm run build`'da gerçek bir hatayla durdu ("You're
importing a module that depends on next/headers... in the Pages Router"
— Turbopack'in yanıltıcı ama tanıdık hata mesajı, aslında App Router'da
istemci/sunucu sınırı ihlaliydi). Düzeltme: dosya ikiye bölündü —
`contactHoneypot.ts` (istemci-güvenli, next/headers YOK) ve
`contactRateLimit.ts` (sunucu-özel, next/headers kullanır) — aynı
istemci/sunucu ayrım ilkesi `lib/supabase/client.ts`/`server.ts`
bölünmesiyle tutarlı.

```ts
export const CONTACT_RATE_LIMIT_MAX_SUBMISSIONS = 3;
export const CONTACT_RATE_LIMIT_WINDOW_MINUTES = 15;

export async function checkContactRateLimit(supabase, tenantId, ip) {
  if (!ip) return { allowed: true }; // IP okunamazsa engelleme, güvenli varsayılan
  const windowStart = new Date(Date.now() - CONTACT_RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("sender_ip", ip)
    .gte("created_at", windowStart);
  return (count ?? 0) >= CONTACT_RATE_LIMIT_MAX_SUBMISSIONS
    ? { allowed: false, retryAfterMinutes: CONTACT_RATE_LIMIT_WINDOW_MINUTES }
    : { allowed: true };
}
```

**Mimari karar (kullanıcıya soruldu — gerçek bir gizlilik/mimari
tercihti, tek başıma karar vermedim):**
- **Anahtar: IP adresi**, e-posta değil — e-posta kullanıcı girdisi,
  bir bot her seferinde farklı sahte e-posta ile bunu bedavaya atlatır;
  IP daha zor değiştirilir. **Bedeli:** IP adresi KVKK kapsamında kişisel
  veri — yeni bir `contact_messages.sender_ip` kolonu eklendi (migration
  `20260817130000_add_contact_message_sender_ip.sql`), SADECE service
  role yazıyor/okuyor, `anon`'a hiç açılmadı (`contact_messages` zaten
  anon'a tamamen kapalı, bkz. madde 2), panelde şu an gösterilmiyor
  (sadece spam tespiti amaçlı).
- **Sayaç deposu: Supabase'in kendisi** (ayrı bir Redis/servis DEĞİL) —
  `contact_messages` tablosu sorgulanıyor. Bellek-içi (in-memory) bir
  sayaç BİLİNÇLİ OLARAK reddedildi: Vercel serverless'te her istek
  farklı, izole bir sunucu örneğine gidebilir, bellek paylaşılmaz — bu
  yüzden bellek-içi bir sayaç üretimde güvenilir ÇALIŞMAZDI (sadece
  `next dev`/`next start` gibi tek-süreçli yerel ortamda tam doğru
  olurdu). DB sorgusu her serverless örneğinden aynı gerçeği görür.

**Eşik:** Aynı (tenant, IP) çifti için **15 dakikada en fazla 3 mesaj**.
Gerekçe: bu bir B2B iletişim formu, gerçek bir ziyaretçi aynı oturumda
1-2'den fazla mesaj göndermez (belki bir yazım hatasını düzeltip
yeniden gönderir) — 3 sınırı gerçek kullanıcıyı neredeyse hiç
zorlamazken sürekli/otomatik gönderimi belirgin şekilde yavaşlatır.

**Ne kadar etkili / nasıl atlatılır (dürüstçe):** Tek bir IP'den gelen
sürekli/hızlı gönderimi (en yaygın basit bot deseni) etkili şekilde
yavaşlatır. **Atlatma yolu:** IP rotasyonu (rezidansiyel proxy ağları,
mobil operatör NAT'ı her bağlantıda IP değiştirebilir) veya "yavaş ve
sabırlı" bir bot (eşiğin altında kalacak şekilde ör. 20 dakikada bir
mesaj) bu katmanı anlamlı şekilde zorlamaz — hedefli/kaynaklı bir
saldırgana karşı TEK BAŞINA yeterli değil.

**Gerçek bir güvenlik açığı bulunup düzeltildi (2026-08-18):** Mentör
tarzı bir kod incelemesinde, `getClientIp()`'nin (`lib/security/
contactRateLimit.ts`) `x-forwarded-for` başlığındaki **ilk** değeri
"gerçek istemci IP'si" saydığı görüldü — bu tam tersiydi. Zincire her hop
kendi gözlemlediği IP'yi SONA ekler; ilk değer istemcinin kendi
gönderdiği (dolayısıyla sahtelenebilir) değerdir, bu projenin önünde tek
güvenilir hop olan Vercel'in edge ağının gerçekten gözlemlediği IP ise
SONDAKİ değerdir. Sonuç: formu render etmeden doğrudan Server Action'a
POST atan bir bot (honeypot'un zaten etkisiz olduğu senaryo — bkz.
Katman 1), her istekte rastgele bir `x-forwarded-for` göndererek
15-dakika/3-mesaj limitini **sınırsız** atlatabiliyordu — iki katmanın
birlikte engellemesi gereken tam senaryo. Ayrıştırma mantığı saf bir
fonksiyona (`pickTrustedClientIp`) çıkarılıp SON değeri kullanacak
şekilde düzeltildi, regresyon testi eklendi
(`contactRateLimit.test.ts`). Henüz canlıda gerçek bir sahte-header
denemesiyle doğrulanmadı — kod incelemesi + birim testle doğrulandı.

**Yanlış pozitif / mesaj kaybı (KISITLAR):** Aynı IP'yi paylaşan birden
fazla gerçek kullanıcı (kurumsal NAT, aynı ofis/kafe Wi-Fi'ı) teorik
olarak birbirinin sınırını tüketebilir — bu YANLIŞ POZİTİF gerçek bir
risk, göz ardı edilmiyor. Bu yüzden tetiklenince mesaj **sessizce
kaybedilmiyor**: kullanıcıya "az önce çok fazla mesaj gönderildi, X
dakika sonra tekrar deneyin ya da bizi arayın" gibi DÜRÜST, aksiyon
öneren bir hata gösteriliyor; yazdıkları form'da kalıyor (yeniden
yazmaya gerek yok, `values: raw` ile korunuyor) ve iletişim sayfasındaki
telefon/e-posta gibi alternatif kanallar hâlâ görünür durumda.

### Değerlendirilip ŞİMDİLİK kod olarak eklenmeyen: gönderim süresi kontrolü

KISITLAR'ın bahsettiği üçüncü CAPTCHA'sız yöntem — form açıldıktan
sonra çok kısa sürede (ör. <2-3 saniye) gönderilen bir isteği şüpheli
saymak. **Etkili olduğu senaryo:** formu hiç render etmeden/okumadan
anında dolduran en tembel bot script'leri. **Atlatma yolu:** bot
yazarı bir `sleep()` eklemesi yeterli, trivial bir önlem. Katman 1+2
zaten makul bir kapsama sağladığı için ŞİMDİLİK eklenmedi (gereksiz
karmaşıklık, KISITLAR'daki "gerçek kullanıcıyı zorlama" ilkesiyle de
nötr — ekstra bir zamanlayıcı state'i gerektirir) — katman 1+2 yetersiz
kalırsa (aşağıdaki eşik) eklenecek ilk/en ucuz üçüncü katman budur.

### CAPTCHA'ya ne zaman geçilmeli (KABUL KRİTERİ: net bir eşik)

CAPTCHA, KISITLAR gereği SON ÇARE — gerçek kullanıcıyı ekstra bir
adımla (görsel bulmaca, checkbox bekleme) zorlar. Aşağıdaki
durumlardan **herhangi biri** gerçekleşirse gündeme alınmalı:

1. Katman 1+2'ye rağmen, panelin Mesajlar ekranında elle işaretlenen
   ("bu spam") mesaj sayısı **haftada 10'u** aşarsa.
2. Aynı anda **farklı IP'lerden ama benzer/aynı içerikli** çok sayıda
   mesaj gözlenirse (dağıtık/koordineli bir bot ağı — katman 2 tek
   başına IP-bazlı olduğu için bunu yakalayamaz).
3. Honeypot'un (katman 1) sistematik olarak boş geçildiği, yani bir
   bot'un SİTEYE ÖZEL olarak hedeflendiği tespit edilirse.

**Öneri:** Klasik Google reCAPTCHA yerine **Cloudflare Turnstile**
(veya benzeri "gizli/sürtünmesiz" bir seçenek) — çoğu gerçek kullanıcı
için hiçbir ek adım göstermez (arka planda tarayıcı sinyallerine
bakar), Google'ın takip/gizlilik yüküne (üçüncü taraf script, çerez)
sahip değildir. Sadece iletişim formuna, sadece yukarıdaki eşiklerden
biri tetiklendiğinde eklenmeli — baştan/varsayılan olarak DEĞİL.

### Test / doğrulama durumu (dürüstçe)

Kod incelemesiyle ve migration'ın gerçek şemayla tutarlılığıyla
doğrulandı; **gerçek bir bot/saldırı simülasyonu yapılmadı** (ne
otomatik bir script'le honeypot atlatma denemesi, ne de gerçek bir IP
hız sınırı aşımı canlı olarak tetiklendi) — bu, kullanıcının kendi
ortamında (migration uygulandıktan sonra) elle doğrulaması gereken bir
adım (bkz. sohbet geçmişindeki adım adım talimat).

## 15. Güvenlik Başlıkları *(2026-08-17 eklendi)*

`next.config.ts`'teki `headers()` fonksiyonu, TÜM rotalara (site +
panel) aşağıdaki HTTP yanıt başlıklarını ekliyor:

| Başlık | Değer | Ne işe yarar |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' <supabase-url> <supabase-wss-url>; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests` | Tarayıcının hangi kaynaktan script/stil/görsel/font/bağlantı açabileceğini kısıtlar — XSS'in en etkili tek karşılığı (kötü niyetli bir script enjekte edilse bile çalışamaz/veri dışarı sızamaz). `connect-src`teki iki Supabase origin'i (`NEXT_PUBLIC_SUPABASE_URL`'den türetilir, 2026-08-18'de eklendi) — aşağıya bakın. |
| `X-Frame-Options` | `DENY` | Site başka bir sayfada `<iframe>` içine gömülemez — clickjacking'e karşı (CSP'nin `frame-ancestors`'ı ile aynı işi eski tarayıcılar için de yapan yedek katman). |
| `X-Content-Type-Options` | `nosniff` | Tarayıcının `Content-Type` başlığını yok sayıp dosya içeriğini "tahmin etmesini" engeller — ör. bir görsel gibi yüklenen kötü niyetli bir dosyanın çalıştırılabilir sanılmasını önler. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Bir bağlantıya tıklandığında hedef siteye tam URL yerine sadece kök alan adı gönderilir (ör. `/panel/mesajlar/gizli-id` değil, sadece site adresi) — sayfa içi hassas yol bilgisinin başka sitelere sızmasını azaltır. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | Kamera/mikrofon/konum gibi tarayıcı API'lerini TAMAMEN kapatır — site bunların hiçbirini kullanmıyor, bir XSS senaryosunda bile bunlara erişilemez. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Tarayıcıya "bu siteyi bir daha asla HTTP üzerinden yükleme, hep HTTPS kullan" der (2 yıl boyunca hatırlar) — araya girme (man-in-the-middle) saldırılarına karşı. `preload` BİLİNÇLİ OLARAK yok (aşağıda). |

**Neden nonce tabanlı (strict) bir CSP değil:** Next.js'in kendi
dokümanı nonce kullanıldığında TÜM sayfaların dinamik render edilmesini
şart koşuyor — bu proje statik üretim + on-demand ISR üzerine kurulu
(`docs/MIMARI.md`), nonce'a geçmek bu mimariyi tamamen bozardı. Bunun
yerine sabit bir CSP (`next.config.ts`, "Without Nonces" yöntemi)
seçildi. İki zorunlu gevşetme: `style-src 'unsafe-inline'` — tenant
temasının `<html style={...}>` olarak enjekte edilmesi
(`docs/TEMA-MIMARISI.md`) nonce olmadan başka türlü mümkün değil; ve
`script-src 'unsafe-inline'` — Next.js App Router hydration'ı
başlatmak için HTML'e gömülü `<script>` etiketleri kullanır, nonce'sız
CSP'de bunlara izin vermenin tek yolu bu.

**Gerçek bir hata bulunup düzeltildi (2026-08-17, canlı ortamda ilk
uçtan uca test koşusunda):** İlk yazımda `script-src`'ye
`'unsafe-inline'` EKLENMEMİŞTİ (Next'in kendi "Without Nonces"
örneğinde her ikisi de var, bu satır gözden kaçmıştı). Sonuç: CSP,
Next.js'in hydration script'lerini sessizce engelliyordu — sayfa
görsel olarak tamamen normal görünüyordu (HTML/CSS engellenmedi) ama
**HİÇBİR** buton/form/etkileşim çalışmıyordu (React hiç hydrate
olmuyordu). Yerel `npm run build`/manuel gezinme bunu yakalayamadı
(görsel olarak fark edilmiyor); canlıya karşı çalıştırılan Playwright
testleri (bir tıklamanın gerçek bir durum değişikliği ürettiğini
doğrulayan) bunu hemen yakaladı — bu, "sadece görsel/kod incelemesi
yeterli değil, gerçek etkileşim testi gerekir" ilkesinin somut bir
kanıtı.

**İkinci gerçek bir hata bulunup düzeltildi (2026-08-18, altıncı
oturum) — aynı kategoride, farklı direktif:** `connect-src`, panelde
YENİ eklenen Realtime bildirim özelliğinin (bkz. madde 18) tarayıcıdan
doğrudan açtığı Supabase WebSocket bağlantısını sessizce
ENGELLİYORDU. Kök neden, script-src hatasıyla BİREBİR aynı desende:
`connect-src 'self'` yazılırken projenin o anki gerçeği ("tarayıcıdan
Supabase'e hiç doğrudan istek atılmıyor") doğruydu, ama bu varsayım
DAHA SONRA (`NewMessageNotifier.tsx` eklenince) geçersiz hale geldi ve
CSP o değişiklikle birlikte GÜNCELLENMEDİ. Belirti de script-src
hatasıyla benzer bir sinsilik taşıyordu: sayfa tamamen normal
çalışıyordu (form gönderimi, mesaj listesi, silme — hepsi sunucu
tarafı istekler olduğu için CSP'den etkilenmiyordu), sadece TEK bir
özellik (anlık toast bildirimi) sessizce çalışmıyordu — konsolda `Refused
to connect` CSP ihlali yerine Supabase SDK'sının kendi
`CHANNEL_ERROR: transport failure` mesajı görünüyordu (CSP engeli
`fetch`/`WebSocket` API'sine göre farklı şekillerde yüzeye çıkabiliyor).
Kullanıcının kendi tarayıcısında iki-sekmeli canlı testle doğrulandı.
Düzeltme: Supabase projesinin origin'i (`https://` VE `wss://` şeması,
ikisi de aynı host) `NEXT_PUBLIC_SUPABASE_URL`'den türetilip
`connect-src`e eklendi. **Ders (script-src hatasıyla aynı, ikinci kez
teyit edildi):** CSP gibi "bileşenin ne yaptığına bağlı" güvenlik
başlıkları tek seferlik değil, HER yeni istemci-taraflı ağ isteği
ekleyen özellik değişikliğinde yeniden gözden geçirilmeli.

**Neden `preload` yok (HSTS):** HSTS preload listesine girmek
tarayıcılara GÖMÜLÜR ve geri almak aylar sürebilir — proje henüz
gerçek bir müşteriye/domaine canlıya alınmadığı için (`docs/DURUM.md`)
bu taahhüdü şimdiden vermek erken. Gerçek bir domain'e geçilince
yeniden değerlendirilmeli.

**Doğrulama (gerçek, tamamlandı — 2026-08-17):** Kod incelemesiyle
doğrulandı (next.config.ts, gerçek Next.js 16 dokümanlarına göre
yazıldı — bkz. `node_modules/next/dist/docs/01-app/02-guides/
content-security-policy.md` ve `.../headers.md`). Ayrıca kullanıcı
`npm run dev`'e karşı gerçek `curl.exe -I` ile test etti — 6 başlığın
(CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
Permissions-Policy, Strict-Transport-Security) hepsi doğru değerlerle
geldi. Bu gerçek çıktıda fark edilen bir bulgu: Next.js'in varsayılan
`X-Powered-By: Next.js` başlığı da geliyordu (framework bilgisi
sızıntısı, ciddi değil ama gereksiz) — `next.config.ts`'e
`poweredByHeader: false` eklenerek kapatıldı.

## 16. Sır Taraması *(2026-08-17 eklendi)*

Repo + geçmiş commit'ler + gerçek prod client bundle'ı için gerçek bir
tarama yapıldı (harici bir araç — truffleHog/gitleaks vb. — kurulmadı,
`git log`/`Grep` ile elle/hedefli bir tarama). **Sonuç: sızıntı
bulunmadı.**

| Kontrol | Yöntem | Sonuç |
|---|---|---|
| `.env.local` (gerçek sırlar) hiç commit'lenmiş mi | `git log --all --full-history --oneline -- .env.local` | Boş — hiç commit'lenmemiş |
| `.env*` deseninde başka bir dosya commit'lenmiş mi | `git log --all --full-history --diff-filter=A -- '.env*'` | Sadece `.env.local.example` (değersiz şablon, commit'lenmesi ZATEN amaçlanan dosya) |
| Service role key'in kendisi (`sb_secret_...` öneki) herhangi bir commit'te var mı | `git log --all -p -S'sb_secret_'` (pickaxe — bu string'in eklendiği/silindiği TÜM commit'leri bulur) | 0 sonuç |
| Gerçek bir `SUPABASE_SERVICE_ROLE_KEY=sb...` ataması herhangi bir commit'te var mı | `git log --all -p -S'SUPABASE_SERVICE_ROLE_KEY=sb'` | 0 sonuç |
| Supabase Personal Access Token (`sbp_...`) gerçek bir değer olarak var mı | `git log --all -p -S'sbp_'` + mevcut dosyalarda grep | Sadece `GUVENLIK.md`/`KARAR-GUNLUGU.md`'de FORMAT açıklaması olarak geçiyor (`` `sbp_...` ``, üç nokta ile — gerçek bir token değil) |
| DB bağlantı şifresi (`postgres://user:pass@...`) herhangi bir yerde var mı | `git log --all -p -S'postgres://'` + mevcut dosyalarda grep | 0 sonuç |
| Service role key **tarayıcıya giden gerçek prod paketinde** var mı | `.next/static` (gerçek bir `npm run build` çıktısı, bu oturumdan önceki bir Lighthouse ölçümünden kalma) içinde `SUPABASE_SERVICE_ROLE_KEY`/`sb_secret_`/`service_role` için grep | 0 sonuç — Next.js'in `NEXT_PUBLIC_` önekiyle env inlining kuralı beklendiği gibi çalışıyor |
| `SUPABASE_SERVICE_ROLE_KEY`'i sadece sunucu-only dosyalar mı kullanıyor | `.ts`/`.tsx` genelinde grep | Sadece `lib/supabase/server.ts` (hiç `"use client"` yok), `e2e/helpers/supabaseAdmin.ts` (Node test süreci, tarayıcıya hiç gitmez), `playwright.config.ts` (build/test zamanı, tarayıcıya gitmez) |

**Not (dürüstçe):** Bu bir "profesyonel" secret-scanning aracı (gitleaks,
truffleHog, GitHub secret scanning vb.) taraması DEĞİL — kalıp bazlı,
hedefli bir elle tarama. Gerçek bilinen sır formatlarının (Supabase
`sb_secret_`/`sbp_`, JWT `eyJ...`, Postgres connection string, AWS
`AKIA...`) her biri ayrı ayrı arandı ama listelenmeyen egzotik bir sır
formatı gözden kaçmış olabilir. İleride gerçek bir CI kurulursa
(`TEST-STRATEJISI.md` madde 12 "kapsanmayan") gitleaks/trufflehog gibi
bir aracın pipeline'a eklenmesi önerilir.

## 17. RLS ve Storage Erişim Denetimi — "Anon Ne Yapabilir" *(2026-08-17 eklendi)*

Madde 2 ve 11'deki iddiaları TEKRAR DOĞRULAMAK için tüm migration
dosyaları tek tek okunup gerçek SQL'den (yorumlardan/eski notlardan
DEĞİL) bir "anon ne yapabilir" tablosu çıkarıldı. **Sonuç: madde 2/11'in
mevcut açıklaması doğru, tutarsızlık bulunmadı** — ama görsel bucket
kapsamındaki bir boşluk yeniden teyit edildi (aşağıda).

**11/11 içerik tablosu — kanıt: `supabase/migrations/
20260807130000_add_rls_policies.sql`:**

| Tablo | anon SELECT | anon INSERT/UPDATE/DELETE |
|---|---|---|
| `tenants` | Sadece `is_published=true` VE sadece 7 güvenli kolon (`id`, `created_at`, `is_published`, `name`, `domain`, `is_platform_owner`, `theme_mode`) — `contact_recipient_email` kolon seviyesinde `REVOKE` ile tamamen gizli | ❌ Hiçbir policy yok → reddedilir |
| `site_settings` | Sadece bağlı `tenants` satırı `is_published=true` ise (`exists` alt sorgusu) | ❌ |
| `hero_sections` / `about_sections` / `services` / `projects` / `contact_sections` / `testimonials` / `faqs` / `team_members` (8 tablo, birebir aynı desen) | Sadece `is_published=true` | ❌ |
| `contact_messages` | **Hiç policy yok → anon HİÇBİR SATIRI okuyamaz** (PII içerdiği için kasıtlı) | ❌ (yazma da `authenticated`'e özel — anonim form gönderimi RLS/anon key'i hiç kullanmıyor, service role ile insert ediyor, bkz. madde 2/14) |

**2/2 kurulu Storage bucket'ı — kanıt: `supabase/migrations/
20260814120000_create_projects_storage_bucket.sql` +
`20260815120000_add_theme_settings_and_branding.sql`:**

| Bucket | anon SELECT (okuma) | anon INSERT/UPDATE/DELETE (yazma) |
|---|---|---|
| `projects` (public=true) | ✅ — `bucket_id = 'projects'` filtresiyle | ❌ Hiçbir policy yok → reddedilir (bucket `public=true` olması SADECE anonim `GET`'i etkiler, `.upload()`/`.remove()` YİNE DE `storage.objects` RLS'inden geçer, bkz. madde 11) |
| `branding` (public=true) | ✅ — `bucket_id = 'branding'` filtresiyle | ❌ Aynı desen |

**5 bucket YOK — anon (ve authenticated) için soru anlamsız:**
`services`/`hero`/`about`/`testimonials`/`team` bucket'ları Supabase'de
hiç oluşturulmadı (madde 11'de zaten dokümante edilmiş bir boşluk, bu
denetimde TEKRAR doğrulandı — `supabase/migrations/` içinde bu 5
bucket için `insert into storage.buckets` çağıran HİÇBİR dosya yok).
Sonuç: bu tablolardaki `*_path` kolonlarına bir değer girilse bile
(panelden değil, elle) görsel isteği `404` döner — bir GÜVENLİK açığı
değil, bir FONKSİYONELLİK boşluğu (yanlışlıkla "anon buraya yazabilir"
gibi yorumlanmasın diye burada açıkça ayrılıyor).

**Sonuç:** anon rolü, İSTİSNASIZ her tabloda/bucket'ta SADECE
yayınlanmış/herkese-açık İÇERİĞİ okuyabiliyor, hiçbir tabloya/bucket'a
hiçbir koşulda yazamıyor. `contact_messages` tek gerçek istisna (anon
için okuma da kapalı). Bu denetim madde 2/4/11'deki önceki testlerle
(gerçek `anon`/`authenticated` rolleriyle çalıştırılan `scripts/
test-rls.mjs`, 6/6 geçti) TUTARLI — bugünkü denetim yeni bir SQL
incelemesi, canlı DB'ye karşı yeni bir test çalıştırılmadı (madde 4'teki
script hâlâ güncel/geçerli, yeniden çalıştırmaya gerek görülmedi çünkü
şema/policy'ler o testten beri değişmedi).

**Güncelleme (2026-08-18, aynı gün ikinci oturum) — "5 bucket YOK"
tespiti artık geçersiz:** Yukarıdaki "5 bucket YOK" satırı bu madde
YAZILDIKTAN SONRA (aynı gün, ikinci oturumda) geçersiz kılındı —
`services`/`hero`/`about`/`testimonials`/`team` bucket'larının hepsi
oluşturuldu, Supabase'e uygulandı ve kullanıcı tarafından gerçek
tarayıcıda doğrulandı (bkz. madde 11'in sonu). Erişim deseni
`projects`/`branding` ile BİREBİR AYNI (public=true + 5-policy: anon
sadece select, authenticated tam CRUD) — bu maddenin yukarıdaki genel
sonucunu ("anon sadece okur, hiç yazamaz") DEĞİŞTİRMİYOR, sadece
kurulu bucket sayısını 2'den 7'ye çıkarıyor.

### ⚠️ Bu denetimin KÖR NOKTASI vardı — düzeltildi *(2026-08-20 mentör denetimi)*

**Yukarıdaki "anon İSTİSNASIZ hiçbir tabloya hiçbir koşulda yazamaz"
sonucu, yazıldığı tarihte YANLIŞTI.** Sebep bir hesap hatası değil, bir
**kapsam** hatası: bu denetim yalnızca TABLO ve BUCKET politikalarını
(`create policy`) taradı, **FONKSİYON YETKİLERİNE (`grant execute`) hiç
bakmadı.**

`security definer` bir fonksiyon, çağıranın değil kendisini oluşturan
rolün yetkisiyle çalışır ve **RLS'i tamamen atlar** — yani politika
tablosunun yanından geçen ikinci bir kapıdır. Bu proje 2026-08-18'de
(`20260818150000_add_atomic_rate_limit_functions.sql`) tam olarak böyle
üç fonksiyon ekledi ve her birine yalnızca
`grant execute ... to service_role` verdi, hiç `revoke` yazmadı.

**Grant eklemek, varsayılanı kaldırmaz.** PostgreSQL yeni bir fonksiyona
EXECUTE'u varsayılan olarak PUBLIC'e verir (`anon` PUBLIC'in içindedir) ve
Supabase ayrıca `public` şemasında anon/authenticated için varsayılan
fonksiyon yetkisi tanımlar. Sonuç: anon key'i olan herkes — ki o anahtar
tasarım gereği site JS paketinde herkese açıktır — üç fonksiyonu da
PostgREST üzerinden doğrudan çağırabiliyordu.

**Canlı veritabanında DOĞRULANDI (2026-08-20):** üç fonksiyon için de
`has_function_privilege('anon', p.oid, 'execute')` → `true`.

Somut etki, en ciddiden en zayıfa:

1. `submit_contact_message_if_allowed` doğrudan çağrılarak
   `contact_messages`'a **sınırsız kayıt yazılabiliyordu.** Honeypot
   (madde 14), zod doğrulaması ve "15 dakikada 3 mesaj" sınırı — üçü de
   uygulama katmanında yaşıyor, doğrudan RPC çağrısı hepsini atlıyor.
   İki ayrı atlatma yolu vardı: (a) `p_ip: null` göndermek — fonksiyondaki
   `if p_ip is not null then` bloğu hız sınırı sayımının TAMAMINI sarıyor;
   (b) `p_max_per_window: 999999` göndermek — politika parametreleri
   istemciden geliyordu. Gereken `p_tenant_id` de erişilebilirdi, çünkü
   yukarıdaki tabloya göre anon `tenants`'tan `id` okuyabiliyor.
2. `check_and_reserve_login_attempt` doğrudan çağrılarak seçilen bir IP
   için sayaç doldurulup `/panel/giris` o IP'ye kilitlenebilirdi (pratikte
   zayıf — saldırganın adminin IP'sini bilmesi gerekir).

**Düzeltme:** `20260820120000_revoke_rpc_execute_from_anon.sql` — üç
fonksiyondan da `revoke execute ... from public, anon, authenticated`.
Uygulandı ve **doğrulandı: anon/authenticated artık `false`,
`service_role` `true`.** Uygulama akışları etkilenmedi; düzeltmeden önce
kod okunarak her iki çağrının da service role istemcisiyle yapıldığı
teyit edildi (`app/panel/giris/page.tsx:46`,
`components/site/contact/actions.ts:84`) — bu kritikti, çünkü giriş hız
sınırı kullanıcı henüz giriş yapmamışken ve iletişim formu anonim
ziyaretçiyle çalışıyor; anon istemcisi kullanılsaydı revoke ikisini de
kırardı. Yan fayda: fonksiyonu artık yalnızca sunucu çağırabildiği için
`p_max_per_window`/`p_window_minutes` her zaman koddaki sabitlerden gelir.

**Bu maddenin kendisi için çıkan kural — bir sonraki denetim bunu
atlamasın:** "anon ne yapabilir" sorusu YALNIZCA `pg_policies` taranarak
cevaplanamaz. En az üç yüzey vardır ve üçü de ayrı ayrı denetlenmelidir:
1. **Tablo/bucket politikaları** (`create policy`) — yukarıdaki tablolar.
2. **Kolon yetkileri** (`grant`/`revoke ... (kolon)`) — ör. `tenants`'taki
   `contact_recipient_email` REVOKE'u.
3. **Fonksiyon yetkileri** (`grant/revoke execute`) — özellikle
   `security definer` olanlar. **2026-08-20'ye kadar bu yüzey hiç
   denetlenmemişti.**

Denetim sorgusu (her yeni fonksiyondan sonra çalıştırılmalı):

```sql
select p.proname, p.prosecdef as security_definer,
       has_function_privilege('anon', p.oid, 'execute')          as anon,
       has_function_privilege('authenticated', p.oid, 'execute') as uye,
       has_function_privilege('service_role', p.oid, 'execute')  as service_role
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' order by p.proname;
```

**Kural:** yeni bir `security definer` fonksiyon yazıldığında
`grant ... to service_role` YETMEZ, yanına mutlaka
`revoke execute ... from public, anon, authenticated` yazılmalı. Ayrıca
`create or replace` mevcut yetkileri korur ama `drop` + `create`
varsayılanları geri getirir — o durumda revoke tekrar çalıştırılmalıdır.
`scripts/test-rls.mjs` şu an yalnızca `services` ve `contact_messages`
tablolarını sınıyor, RPC yüzeyini hiç test etmiyor; oraya anon istemcisiyle
bu üç fonksiyonu çağırma testi eklenmeli (açık madde).

## 18. Realtime Erişimi — Panelde Anlık Bildirim *(2026-08-18 eklendi)*

Panel açıkken yeni bir iletişim mesajı geldiğinde sayfa yenilenmeden
toast bildirimi + anlık okunmamış sayaç artışı için Supabase Realtime
(`postgres_changes`, INSERT) eklendi (`components/panel/
NewMessageNotifier.tsx`). Yeni migration: `supabase/migrations/
20260818130000_enable_realtime_contact_messages.sql` — `contact_messages`
tablosunu `supabase_realtime` publication'ına ekliyor.

**Bunun yeni bir erişim genişletmesi OLMADIĞININ gerekçesi:** Supabase
Realtime, bir tablo publication'a eklense bile **o tablonun kendi
RLS'ine tabidir** — bir istemcinin belirli bir `postgres_changes`
olayını GÖREBİLMESİ için, o olaya konu satırı normal bir `SELECT`
sorgusuyla da okuyabiliyor olması gerekir. `contact_messages`'ta anon
rolüne hiç `SELECT` policy'si yok (madde 2, madde 17) — yani **anon-key'li
bir istemci bu Realtime kanalını hiçbir zaman göremez**, ne site
ziyaretçisi ne de kimliksiz bir istemci. Aboneliği sadece giriş yapmış
panel oturumu (`authenticated` rolü — zaten `contact_messages` üzerinde
tam `SELECT` izinli, madde 2) açabiliyor; `NewMessageNotifier`, kanalı
`tenant_id=eq.<aktif tenant>` filtresiyle daraltıyor (yine RLS'in
üstüne, ek bir uygulama-seviyesi filtre — RLS zaten anon'u tamamen
dışarıda bırakıyor).

**Doğrulama durumu:** Migration bu oturumda YAZILDI ama **henüz gerçek
Supabase projesine uygulanmadı** — uygulanana kadar Realtime aboneliği
sessizce hiçbir olay almaz (hata vermez, sadece bildirim gelmez).
İki-sekmeli canlı test de henüz yapılmadı. Bkz. `docs/DURUM.md`,
"Sıradaki adım" madde 0c.

## 19. Panel Girişine Hız Sınırı/Kilitleme *(2026-08-18 eklendi)*

Kullanıcının doğrudan sorusu ("şifre deneme sınırımız var mı?") gerçek bir
boşluk ortaya çıkardı: `signInAction` (`app/panel/giris/page.tsx`) hiçbir
deneme sayacı olmadan doğrudan `supabase.auth.signInWithPassword()`
çağırıyordu — bu madde daha önce (2026-08-18 mentör incelemesi dahil)
hiçbir yerde açık madde olarak bile listelenmemişti.

**Katman — IP bazlı, DB'de kalıcı kilitleme:** İletişim formunun hız
sınırıyla (madde 14) BİREBİR aynı iskelet, yeni `login_attempts` tablosu
(`supabase/migrations/20260818140000_create_login_attempts_table.sql`)
üzerinden. Aynı IP'den **15 dakikada 5 başarısız denemeden sonra** giriş
tamamen kilitlenir — kilitliyken DOĞRU şifre girilse bile
`signInWithPassword` hiç çağrılmaz. Kilit istemci taraflı değil (tarayıcı
kapatılıp açılsa, farklı bir cihazdan girilse bile aynı IP kilitli kalır);
kayan pencere olduğu için 15 dakika sonra eski denemeler kendiliğinden
sayımdan düşer, ayrı bir "kilidi aç" zamanlayıcısına gerek yok.

**KRİTİK DÜZELTME (aynı gün, birkaç saat sonra — kullanıcının "çok
yüzeysel çalışıyorsun" eleştirisi üzerine başlatılan çok-ajanlı adversarial
review'de bulundu):** İlk sürüm ATOMİK DEĞİLDİ — `checkLoginRateLimit`
(SELECT COUNT) ile `recordFailedLoginAttempt` (INSERT) AYRI adımlardı, ve
`signInWithPassword`'un gerçek ağ+bcrypt gecikmesi arada büyük bir pencere
bırakıyordu. Eşzamanlı (paralel) istekler hepsi aynı düşük sayımı görüp
hepsi "izin verildi" alabiliyordu — bir saldırgan 20-50 paralel istekle
"5 deneme/15 dakika" kilidini fiilen anlamsız hale getirebilirdi. **Bu, tek
admin hesabına karşı inşa edilen korumanın kendi amacını boşa çıkaran
YÜKSEK önemde bir açıktı.** Düzeltme: sayım + rezervasyon artık TEK bir
Postgres fonksiyonunda (`check_and_reserve_login_attempt`,
`supabase/migrations/20260818150000_add_atomic_rate_limit_functions.sql`),
IP başına bir `pg_advisory_xact_lock` ile serileştirilmiş — rezervasyon
(satırın eklenmesi) `signInWithPassword` çağrılmadan ÖNCE, AYNI atomik
adımda oluşuyor, aradan başka bir isteğin sıyrılması artık mümkün değil.
Başarılı girişte `delete_login_attempt` ile rezervasyon kaldırılıyor
(doğru şifre kalan hakkı tüketmesin). `checkLoginRateLimit`/
`recordFailedLoginAttempt` kaldırıldı, yerine `checkAndReserveLoginAttempt`/
`releaseLoginAttempt` geldi. **Aynı TOCTOU deseni** iletişim formunun hız
sınırında da (madde 14, `checkContactRateLimit`) vardı — o da aynı gün
`submit_contact_message_if_allowed` atomik fonksiyonuyla düzeltildi.

**`login_attempts` RLS:** Açık, **hiçbir policy yok** — `contact_messages`'ın
anon'a kapalı olmasından bir adım ileri: burada `authenticated`'e de
kapalı, çünkü panelde bu tabloyu gösteren bir ekran yok/planlanmıyor,
sadece sunucu taraflı hız sınırı mantığı (`lib/security/loginRateLimit.ts`)
service role client ile okuyor/yazıyor. Tabloya SADECE başarısız denemeler
yazılır, başarılı girişte hiç satır eklenmez.

**Bilgi sızıntısı önlemi:** Kilitliyken gösterilen mesaj ("Çok fazla
başarısız giriş denemesi. Lütfen N dakika sonra tekrar deneyin.") normal
"E-posta veya şifre hatalı" mesajından KASITLI olarak farklı, ama kalan
deneme SAYISI hiçbir aşamada gösterilmiyor — bir saldırganın "3 hakkım
kaldı" gibi bir geri bildirimle stratejisini kalibre etmesini önlemek
için (honeypot'un botu bilgilendirmeme ilkesiyle aynı yaklaşım, madde 14).

**IP tespiti paylaşıldı:** `pickTrustedClientIp`/`getClientIp`
(`x-forwarded-for` zincirinin SON, sahtelenemez değerini kullanan aynı
fonksiyon, bkz. madde 14) `lib/security/getClientIp.ts`'e taşındı —
hem iletişim formu hem panel girişi AYNI IP tespit mantığını paylaşıyor.

**Bilinçli sınırlar:** E-posta bazlı ayrı bir sayaç yok (panel tek admin
hesaplı, IP yeterli — bkz. `docs/PRD.md`); başarılı girişte sayaç
sıfırlanmıyor (basitlik, kayan pencere zaten yeterli).

**Doğrulama durumu:** İlk (atomik olmayan) sürüm gerçek tarayıcıda
kullanıcı tarafından test edildi ve 5 yanlış denemeden sonra kilitlendiği
DOĞRULANDI — ama o test paralel/eşzamanlı istek senaryosunu kapsamıyordu
(tek tarayıcıdan sırayla deneme), bu yüzden TOCTOU açığını yakalayamadı.
Atomik düzeltme (`20260818150000_add_atomic_rate_limit_functions.sql`)
henüz gerçek Supabase projesine uygulanmadı — sıradaki adım bu migration'ın
çalıştırılması, ardından hem tekli hem (mümkünse) paralel istek
senaryosuyla yeniden doğrulama.
