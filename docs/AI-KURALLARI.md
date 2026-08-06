# AI Kuralları — staj-projesi

Bu dosya, bu projede AI ile nasıl çalışılacağını ve projenin kurallarını tanımlar.
Yeni bir AI oturumuna başlarken önce bu dosya okunur. Kural değişirse dosya
güncellenir ve nedeni `karar-gunlugu.md`'ye eklenir.

## 1. Proje Özeti

İnşaat firmalarına satılabilir, "tek müşteri = tek kurulum" modelinde çalışan,
**tam yönetilen (managed) bir web servis hizmeti** geliştiriliyor. Platform
sahibi kendi tanıtım sitesinin gizli `/panel` rotasından tek kullanıcı olarak
giriş yapar; tüm müşterilerin (tenant) içeriğini, temasını ve aktif bölümlerini
buradan yönetir. Müşterinin kendi sitesinde (kendi domaininde) hiçbir panel/login
yoktur — müşteri ve onun ziyaretçileri sadece herkese açık siteyi görür, içerik
değişikliği talebini platform sahibine iletir. Geliştirmenin büyük kısmı AI ile
yürütülüyor; site kalite kriterleri için `kurumsal-site-standartlari.md`'ye,
mimari gerekçe için `karar-gunlugu.md` (2026-08-06, "Panel mimarisi düzeltildi")
dosyasına bakılır.

## 2. Teknoloji

- Next.js 16 (App Router), TypeScript (strict mode)
- Tailwind CSS
- Supabase (Postgres + Auth + Storage) — içerik, tema ayarları ve admin kullanıcıları
- Paket yöneticisi: npm

Hosting, render stratejisi ve mimari gerekçeler için tek referans:
**`docs/Mimari.md`** (Vercel Hobby plan, statik üretim + panelden tetiklenen
on-demand ISR).

## 3. Klasör Yapısı

```
staj-projesi/
├── app/
│   ├── (site)/       # herkese açık kurumsal site sayfaları (tenant'a göre render)
│   ├── panel/         # tek yönetim paneli — sadece platform sahibi erişir;
│   │                   # tenant oluşturma, demo import, bölüm aç/kapat/sırala,
│   │                   # tüm tenant'ların içerik/tema düzenlemesi
│   ├── api/            # route handler'lar
│   └── layout.tsx
├── components/
│   ├── ui/             # tema/sayfa bağımsız genel UI parçaları
│   └── site/            # hazır bölüm kütüphanesi (hero, hizmetler, projeler...)
├── lib/
│   ├── supabase/         # client/server Supabase istemcileri ve sorgu fonksiyonları
│   └── utils.ts
├── types/                 # paylaşılan TypeScript tipleri
├── supabase/
│   ├── migrations/         # veritabanı şema değişiklikleri
│   └── seed.sql
├── public/                 # statik dosyalar
└── docs/                    # proje beyni (kararlar, kurallar) — kod içermez
```

`(site)` ve `panel` route grupları birbirinden ayrı tutulur; `(site)` hiçbir
zaman `panel`'e ait bir bileşeni import etmez. `panel` rotası yalnızca platform
sahibinin kendi domaininde aktiftir — middleware, isteğin `Host` başlığına göre
bir tenant domaininde `panel`'i tamamen erişilmez kılar. Mimari detay ve gerekçe
için `karar-gunlugu.md` (2026-08-06, "Panel mimarisi düzeltildi: tek panel, tek
kullanıcı, tam yönetilen hizmet").

Bu ağaç yapısı 2026-08-06'da fiilen oluşturuldu (`app/`, `components/`, `lib/`,
`types/`) — her klasörün ne için var olduğunun ayrıntılı gerekçesi için
**`docs/Mimari.md` madde 8**'e bakılır. `api/` ve `supabase/` henüz
oluşturulmadı, ilk gerçek ihtiyaç doğduğunda eklenecek.

## 4. Kod Standartları

1. Tüm dosyalar TypeScript ile yazılır, `any` tipi kullanılmaz.
2. Bileşenler varsayılan olarak Server Component'tir; `"use client"` sadece
   state/etkileşim gerektiğinde eklenir.
3. Stil sadece Tailwind utility class'larıyla yazılır, `globals.css` dışında ayrı
   CSS dosyası açılmaz.
4. 3+ satır tekrar eden JSX veya mantık, ayrı bir bileşen/fonksiyona çıkarılır.
5. Supabase sorguları bileşen içine yazılmaz, `lib/supabase/` altındaki fonksiyonlar
   üzerinden çağrılır.
6. Commit öncesi ESLint ve Prettier hatasız geçmeli.

## 5. Yap / Yapma

**Yap:**
- Yeni bir sayfa/bölüm eklerken `panel`'den yönetilip yönetilmeyeceğine önce
  karar ver.
- Veritabanı şema değişikliklerini `supabase/migrations/` altına dosya olarak ekle.
- Yeni bir ortam değişkeni eklediğinde `.env.local.example`'a adını (değerini değil)
  ekle.
- İçerik/tema verisini component prop'u olarak değil, `panel`'den çekilen veri
  olarak tasarla.
- Büyük bir mimari kararı uygulamadan önce `docs/karar-gunlugu.md`'ye yaz.

**Yapma:**
1. Supabase service role key'ini client tarafında (tarayıcıda çalışan kodda) kullanma.
2. `.env.local` dosyasını commit'leme.
3. RLS (Row Level Security) kapalı bir tabloya production verisi koyma.
4. `panel` route'larını auth kontrolü olmadan public bırakma; bir tenant
   domaininde `panel`'in hiç erişilemez olduğunu doğrulamadan bırakma.
5. Tema/renk/metin gibi içerik değerlerini kod içine sabit (hardcoded) yazma.
6. `main` branch'ine force-push yapma.

## 6. Güvenlik

1. Tüm Supabase tablolarında RLS varsayılan olarak açık tutulur.
2. `panel`'e erişim Supabase Auth ile korunur, oturum kontrolü middleware'de
   yapılır.
3. Platformda tek bir kullanıcı/rol vardır: platform sahibi (kullanıcı
   adı/şifre girişi). Tenant'ların (müşterilerin) kendi login'i, kendi paneli
   veya çoklu yetki seviyesi (editör, görüntüleyici vb.) yoktur — tüm
   içerik/tema güncellemeleri platform sahibi tarafından `panel` üzerinden
   yapılır. `panel`, bir tenant'ın kendi domaininde middleware seviyesinde
   tamamen erişilemez kılınır (sadece platform sahibinin kendi domaininde
   aktiftir).
4. Gizli anahtarlar (service role key, DB bağlantı bilgisi) yalnızca sunucu tarafı
   ortam değişkenlerinde tutulur.
5. Kullanıcıdan alınan formlar (iletişim formu vb.) sunucu tarafında doğrulanır,
   sadece client-side validasyona güvenilmez.
6. Çok kiracılı (multi-tenant) veri modelinde her tabloda tenant_id bulunur ve
   RLS politikaları bir tenant'ın verisinin başka bir tenant tarafından
   okunamayacağını/değiştirilemeyeceğini garanti eder.
7. Genel site kalite/güvenlik kriterleri (SSL, KVKK, çerez politikası) için
   `kurumsal-site-standartlari.md`'ye bakılır.

## 7. Test Stratejisi

Detaylı test yaklaşımı, kalite eşikleri ve "bitti" tanımı için tek referans:
**`docs/test-stratejisi.md`**. Özet: Vitest + React Testing Library (unit —
sürekli, her özellikle birlikte yazılır) + Playwright (e2e — sadece belli
kritik noktalarda, madde/madde listesi `test-stratejisi.md`'de). Test miktarı
bilinçli olarak sınırlı tutulur; tek geliştirici + ~32 iş günlük süre kısıtı
göz önünde bulundurulur.

Test dosyaları, test ettikleri dosyayla aynı dizinde `*.test.ts(x)` (unit/
integration) veya kök dizinde `e2e/` altında `*.spec.ts` (Playwright) olarak
tutulur.

## 8. Commit Kuralları

1. Commit mesajı `tip: kısa açıklama` formatındadır (`feat`, `fix`, `docs`, `chore`,
   `refactor`, `test`).
2. Her commit tek bir mantıksal değişikliği içerir.
3. Migration dosyası ile onu kullanan kod değişikliği aynı commit'te birlikte
   gönderilir.
4. `main`'e push'lamadan önce `npm run build` ve `npm test` hatasız
   tamamlanmalı.

## 9. AI ile Çalışma İlkeleri

1. AI, attığı her adımı kullanıcıya açıklayarak ilerler.
2. Terminal/kurulum komutlarını kullanıcı kendisi çalıştırır; AI komutu açıklar,
   kullanıcı çalıştırır, AI çıktıyı yorumlar.
3. Mimari/teknoloji kararları önce `docs/karar-gunlugu.md`'ye yazılır, sonra
   uygulanır.
4. AI, belirsiz bir karar noktasında (isim, kapsam, teknoloji vb.) varsayım
   yapmadan kullanıcıya sorar.
5. Bu dosya her yeni AI oturumunun başında okunur ve projeyi anlamak için referans
   alınır.
6. Yeni bir özellik önerisi/isteği geldiğinde önce `docs/PRD.md`'deki
   "İstenmeyen" listesine bakılır; orada açıkça yasaklanmış bir şeyse
   uygulanmadan önce kullanıcıya sorulur.
