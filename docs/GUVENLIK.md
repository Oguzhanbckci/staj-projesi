# Güvenlik

Bu dosya, projenin güvenlik duruşunu tek yerde toplar: kimin neye erişebildiği,
sırların nasıl yönetildiği, bunların nasıl test edildiği ve yayına çıkmadan
önce kontrol edilmesi gereken maddeler. Güvenlik, unutulduğunda fark
edilmeyen tek konudur — bu yüzden yazılı ve güncel tutulur. Kararların
kronolojik gerekçesi için `KARAR-GUNLUGU.md`, teknik mimari için `MIMARI.md`,
tablo/kolon tasarımı için `VERİ-MODELİ.md` referans alınır.

**Son güncelleme:** 2026-08-07

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
| `panel` route'u bir tenant'ın kendi domaininden erişilebilir olur | Middleware ile `Host` başlığına göre kısıtlanacak (henüz kodlanmadı — bkz. madde 5, açık madde) |
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

## 5. Yayın Öncesi Güvenlik Kontrol Listesi

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

**Henüz açık/yapılmamış maddeler (bilinçli olarak, sıradaki adımlarda):**
- [ ] Panel auth'u (Supabase Auth) kodlanmadı — `/panel` şu an gerçek bir
      oturum kontrolüne sahip değil, sadece placeholder sayfa var.
- [ ] Middleware ile `panel` route'unun bir tenant'ın kendi domaininde
      tamamen erişilemez olduğu henüz doğrulanmadı (kod henüz yok).
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
