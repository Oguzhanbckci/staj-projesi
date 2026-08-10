# Güvenlik

Bu dosya, projenin güvenlik duruşunu tek yerde toplar: kimin neye erişebildiği,
sırların nasıl yönetildiği, bunların nasıl test edildiği ve yayına çıkmadan
önce kontrol edilmesi gereken maddeler. Güvenlik, unutulduğunda fark
edilmeyen tek konudur — bu yüzden yazılı ve güncel tutulur. Kararların
kronolojik gerekçesi için `KARAR-GUNLUGU.md`, teknik mimari için `MIMARI.md`,
tablo/kolon tasarımı için `VERİ-MODELİ.md` referans alınır.

**Son güncelleme:** 2026-08-12

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
| İletişim formuna kötü amaçlı/doğrulanmamış veri gönderilir | Sunucu tarafı doğrulama gereksinimi (`AI-KURALLARI.md` madde 6.5) — route handler henüz yazılmadı, bkz. madde 5 |

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
  çalışabilmesi RLS/anon key üzerinden değil, henüz yazılmamış bir
  `app/api/contact/` route handler'ı (sunucu tarafı, service role,
  RLS'i bypass eder) üzerinden çözülecek — bkz. madde 5.
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

## 10. Yayın Öncesi Güvenlik Kontrol Listesi

Bu proje şu an gerçek bir müşteriye canlıya alınmıyor (bkz. `DURUM.md`,
"Proje bağlamı") — ama ileride bu değişirse, veya staj değerlendirmesi için
"bitti" sayılmadan önce, aşağıdaki liste madde madde işaretlenmeli.

**Tamamlanan maddeler:**
- [x] Tüm tablolarda RLS açık (11/11 tablo, bkz. madde 2).
- [x] Her tabloda anon için en az bir select policy VAR ya da bilinçli
      olarak HİÇ YOK (`contact_messages` istisnası, kasıtlı).
- [x] anon rolü hiçbir tabloda insert/update/delete yapamıyor — gerçek
      testle doğrulandı (madde 4).
- [x] Hassas kolon (`tenants.contact_recipient_email`) anon'dan kolon
      seviyesinde gizlendi.
- [x] `.env.local` commit'lenmedi (`git status`/`.gitignore` ile
      doğrulandı).
- [x] Service role key sadece sunucu tarafı kodda kullanılıyor.
- [x] Şema tipleri (`types/database.types.ts`) gerçek şemadan üretiliyor —
      yanlış kolon adı yazımı derleme zamanında yakalanır (bkz. `MIMARI.md`
      madde 4.2).

**Tamamlanan maddeler (2026-08-10 eklendi):**
- [x] Panel auth'u (Supabase Auth, e-posta/şifre, kayıt kapalı) kodlandı —
      bkz. madde 5-7.

**Henüz açık/yapılmamış maddeler (bilinçli olarak, sıradaki adımlarda):**
- [ ] Proxy (`proxy.ts`) ile `panel` route'unun bir tenant'ın kendi
      domaininde tamamen erişilemez olduğu henüz doğrulanmadı — bu, Host
      header'a göre tenant çözümleyen ayrı bir mantık gerektiriyor (bkz.
      `MIMARI.md` madde 7), henüz yazılmadı. Şu anki `proxy.ts` sadece
      oturum kontrolü yapıyor, tenant/domain ayrımı yapmıyor.
- [ ] `app/api/contact/` route handler'ı (iletişim formu → sunucu tarafı
      doğrulama → `contact_messages`'a insert + e-posta) henüz yazılmadı.
- [ ] Kullanıcıdan alınan formlarda rate limiting / spam koruması yok.
- [ ] Lighthouse Best Practices skoru (güvenli header'lar, HTTPS zorunluluğu
      vb.) henüz ölçülmedi — hedef ≥90 (bkz. `TEST-STRATEJISI.md`).
- [ ] `npm audit` ile bağımlılıklarda bilinen güvenlik açığı taraması henüz
      yapılmadı.
- [ ] Gerçek bir müşteriye canlıya alınacaksa: Vercel Hobby → Pro plan
      geçişi (bkz. `MIMARI.md` madde 5) ve KVKK aydınlatma metni/çerez
      politikası (bkz. `KURUMSAL-SITE-STANDARTLARI.md`) eklenmeli.

Bu liste, ilgili adımlar tamamlandıkça güncellenmeli — yeni bir madde
"tamamlandı" olarak işaretlenmeden önce madde 4'teki gibi gerçek bir testle
doğrulanmalı, sadece kod yazılmış olması yeterli sayılmamalı.
