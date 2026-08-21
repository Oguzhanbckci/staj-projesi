# staj-projesi — Kurumsal Web Sitesi Hizmeti

İnşaat firmaları gibi işletmelere satılabilen, tam yönetilen bir
kurumsal web sitesi ürünü: 10 bölümlü bir ziyaretçi sitesi + tema
düzenleyicili, medya yönetimli, SEO ayarlı bir yönetim paneli.
Mimari/iş modeli detayı için `docs/PRD.md`, satış/teslim odaklı özet
için `docs/TESLIM-PAKETI.md`.

## Proje Nedir

Her müşteri kendi Supabase (veritabanı) + Vercel (barındırma) kurulumunu
alır ("tek müşteri = tek kurulum" modeli, bkz. `docs/PRD.md`). Platform
sahibi, müşterinin sitesini gizli bir `/panel` adresinden yönetir —
içerik ekleme/düzenleme/yayınlama, bölüm sırası/görünürlüğü, marka
rengi/font/logo, SEO ayarları, gelen iletişim mesajları hep buradan.
Müşterinin kendi sitesinde hiçbir panel/login yoktur, sadece herkese
açık site vardır.

## Teknolojiler

| Katman | Teknoloji |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Dil | TypeScript (strict mode, `any` yok) |
| Stil | Tailwind CSS v4 (`@theme`, config dosyası yok) |
| Backend | [Supabase](https://supabase.com) (Postgres + Auth + Storage), Row Level Security ile |
| Barındırma | [Vercel](https://vercel.com) (Hobby plan yeterli — statik üretim + on-demand ISR) |
| Test | [Vitest](https://vitest.dev) (birim) + [Playwright](https://playwright.dev) (uçtan uca) |
| Doğrulama | [zod](https://zod.dev) |
| İkonlar | [lucide-react](https://lucide.dev) |

Mimari kararların tam gerekçesi: `docs/MIMARI.md`. Bu Next.js
kurulumu, standart `create-next-app` çıktısından **farklı** olabilir —
kod yazmadan önce `node_modules/next/dist/docs/` altındaki gerçek
sürüm dokümanlarına bakılmalı (bkz. `AGENTS.md`).

## Hızlı Başlangıç

**Bu proje üzerinde geliştirme yapacaksanız** (yeni bir müşteri
kurulumu için değil — o senaryo için `docs/KURULUM.md`'ye bakın):

**Node.js 20.9+ gerekir** (`package.json` → `engines`; CI 22 kullanıyor).
Alt sürümlerde `npm run types:generate` çalışmaz — Node'un `--env-file`
desteği 20.6 ile geldi.

```bash
npm install
cp .env.local.example .env.local
# .env.local'i gerçek Supabase proje bilgilerinizle doldurun
npm run dev
```

`http://localhost:3000` — ziyaretçi sitesi. `http://localhost:3000/panel/giris`
— yönetim paneli (giriş bilgisi gerekir, Supabase Dashboard →
Authentication → Users'dan oluşturulur).

**Yeni bir müşteri için sıfırdan kurulum** (veritabanı + içerik +
Vercel yayını dahil, ~28 dakika): `docs/KURULUM.md`.

## Dokümantasyon Haritası

Proje kararları/kuralları kod içermeyen, `docs/` klasöründeki dosyalarda
tutulur — yeni bir konuya başlarken önce buraya bakılır:

| Dosya | Ne zaman bakılır |
|---|---|
| `docs/DURUM.md` | Projede şu an ne durumda olduğumuzu, en son ne yapıldığını öğrenmek için — **her yeni oturumda ilk okunacak dosya** |
| `docs/PRD.md` | Bir özelliğin kapsamda olup olmadığına hızlıca karar vermek için |
| `docs/MIMARI.md` | Teknik mimari (framework, backend, hosting, render stratejisi) |
| `docs/VERİ-MODELİ.md` | Supabase tablo/kolon tasarımı ve gerekçeleri |
| `docs/TEST-STRATEJISI.md` | Test yaklaşımı, hangi testin nasıl/ne zaman çalıştırılacağı |
| `docs/GUVENLIK.md` | Tehdit modeli, erişim kuralları, anahtar yönetimi, güvenlik kontrol listesi |
| `docs/TASARIM-SISTEMI.md` | Renk/tipografi/boşluk/bileşen kuralları |
| `docs/TEMA-MIMARISI.md` | Tema değerlerinin veritabanından sayfaya akış mimarisi |
| `docs/SEO-PERFORMANS.md` | Meta veri, site haritası, yapısal veri stratejisi |
| `docs/KARAR-GUNLUGU.md` | Tarihli, hiç silinmeyen karar geçmişi — "bu neden böyle yapıldı" sorusunun cevabı |
| `docs/AI-KURALLARI.md` | Kod standartları, güvenlik kuralları, AI ile çalışma ilkeleri |
| `docs/KURULUM.md` | **Yeni bir müşteri** için sıfırdan kurulum (geliştirici içindir) |
| `docs/MUSTERİ-KILAVUZU.md` | Panelin günlük kullanımı (**teknik olmayan** okuyucu içindir) |
| `docs/TESLIM-PAKETI.md` | Satış/teslim özeti — kapsam, fiyatlandırma önerisi (**müşteri/karar verici** içindir) |
| `docs/RAKIP-ANALIZI.md` | Bir bölüm/tasarım kararının neden böyle olduğunu sektör kanıtıyla görmek için — 8 sitelik bölüm karşılaştırması + 93 sitelik görsel tasarım taraması |
| `docs/KURUMSAL-SITE-STANDARTLARI.md` | İyi bir kurumsal sitenin sağlaması gereken kriterler (performans, erişilebilirlik, SEO, KVKK) — kalite kontrol listesi |

## Testleri Çalıştırma

```bash
npm run test:unit          # Birim testler (Vitest) — hızlı, sunucu gerekmez
npm run test:e2e           # Uçtan uca testler (Playwright) — dev sunucusunu kendisi başlatır
npm test                   # İkisi birden — main'e push'lamadan önce çalıştırılması gereken komut
```

**Sürekli entegrasyon (CI):** `main`'e her push ve her pull request'te
`.github/workflows/ci.yml` otomatik çalışır — lint, `next typegen`,
`tsc --noEmit`, birim testleri ve production build. Hiçbir gizli anahtar
(secret) gerektirmez. **E2E bilinçli olarak CI'da değildir** (gerçek Supabase
veritabanına yazıyor, ayrı bir staging ortamı yok) — yerelde elle
çalıştırılmaya devam eder. Detay: `docs/TEST-STRATEJISI.md` madde 15.

E2E testlerden "admin kritik akışı" (`e2e/admin-service-flow.spec.ts`),
`.env.local`'de `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` tanımlı değilse
otomatik atlanır (skip) — gerçek bir panel hesabı gerektirir. İlk
kurulumda (`npx playwright install chromium`) tarayıcı binary'si
indirilmelidir. Detay ve kapsanan/kapsanmayan alanlar:
`docs/TEST-STRATEJISI.md`.

## Lisans / Sahiplik

Bu, ticari olarak satılan bir üründür — açık kaynak lisansı yoktur.
