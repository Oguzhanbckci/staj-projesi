# AI Kuralları — staj-projesi

Bu dosya, bu projede AI ile nasıl çalışılacağını ve projenin kurallarını tanımlar.
Yeni bir AI oturumuna başlarken önce bu dosya okunur. Kural değişirse dosya
güncellenir ve nedeni `karar-gunlugu.md`'ye eklenir.

## 1. Proje Özeti

İnşaat firmalarına satılabilir, "tek müşteri = tek kurulum" modelinde çalışan bir
kurumsal web sitesi ürünü geliştiriliyor. İçerik (metin, görsel, sayfa bölümleri)
ve tema (renk, logo, yazı tipi) kod değişikliği gerektirmeden bir admin panelinden
yönetilecek. Geliştirmenin büyük kısmı AI ile yürütülüyor; site kalite kriterleri
için `kurumsal-site-standartlari.md`'ye bakılır.

## 2. Teknoloji

- Next.js 15 (App Router), TypeScript (strict mode)
- Tailwind CSS
- Supabase (Postgres + Auth + Storage) — içerik, tema ayarları ve admin kullanıcıları
- Paket yöneticisi: npm

## 3. Klasör Yapısı

```
staj-projesi/
├── app/
│   ├── (site)/       # herkese açık kurumsal site sayfaları
│   ├── admin/         # içerik/tema yönetim paneli (auth korumalı)
│   ├── api/            # route handler'lar
│   └── layout.tsx
├── components/
│   ├── ui/             # tema/sayfa bağımsız genel UI parçaları
│   └── site/            # kurumsal site'a özel bölüm bileşenleri (hero, hizmetler...)
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

`(site)` ve `admin` route grupları ayrı tutulur; admin'e ait hiçbir bileşen
`(site)` altında import edilmez.

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
- Yeni bir sayfa/bölüm eklerken admin panelinden yönetilip yönetilmeyeceğine önce
  karar ver.
- Veritabanı şema değişikliklerini `supabase/migrations/` altına dosya olarak ekle.
- Yeni bir ortam değişkeni eklediğinde `.env.local.example`'a adını (değerini değil)
  ekle.
- İçerik/tema verisini component prop'u olarak değil, admin panelinden çekilen veri
  olarak tasarla.
- Büyük bir mimari kararı uygulamadan önce `docs/karar-gunlugu.md`'ye yaz.

**Yapma:**
1. Supabase service role key'ini client tarafında (tarayıcıda çalışan kodda) kullanma.
2. `.env.local` dosyasını commit'leme.
3. RLS (Row Level Security) kapalı bir tabloya production verisi koyma.
4. Admin panel route'larını auth kontrolü olmadan public bırakma.
5. Tema/renk/metin gibi içerik değerlerini kod içine sabit (hardcoded) yazma.
6. `main` branch'ine force-push yapma.

## 6. Güvenlik

1. Tüm Supabase tablolarında RLS varsayılan olarak açık tutulur.
2. Admin paneline erişim Supabase Auth ile korunur, oturum kontrolü middleware'de
   yapılır.
3. Admin panelde tek yönetici rolü vardır (kullanıcı adı/şifre girişi), çoklu
   yetki seviyesi (editör, görüntüleyici vb.) uygulanmaz.
4. Gizli anahtarlar (service role key, DB bağlantı bilgisi) yalnızca sunucu tarafı
   ortam değişkenlerinde tutulur.
5. Kullanıcıdan alınan formlar (iletişim formu vb.) sunucu tarafında doğrulanır,
   sadece client-side validasyona güvenilmez.
6. Genel site kalite/güvenlik kriterleri (SSL, KVKK, çerez politikası) için
   `kurumsal-site-standartlari.md`'ye bakılır.

## 7. Commit Kuralları

1. Commit mesajı `tip: kısa açıklama` formatındadır (`feat`, `fix`, `docs`, `chore`,
   `refactor`).
2. Her commit tek bir mantıksal değişikliği içerir.
3. Migration dosyası ile onu kullanan kod değişikliği aynı commit'te birlikte
   gönderilir.
4. `main`'e push'lamadan önce `npm run build` hatasız tamamlanmalı.

## 8. AI ile Çalışma İlkeleri

1. AI, attığı her adımı kullanıcıya açıklayarak ilerler.
2. Terminal/kurulum komutlarını kullanıcı kendisi çalıştırır; AI komutu açıklar,
   kullanıcı çalıştırır, AI çıktıyı yorumlar.
3. Mimari/teknoloji kararları önce `docs/karar-gunlugu.md`'ye yazılır, sonra
   uygulanır.
4. AI, belirsiz bir karar noktasında (isim, kapsam, teknoloji vb.) varsayım
   yapmadan kullanıcıya sorar.
5. Bu dosya her yeni AI oturumunun başında okunur ve projeyi anlamak için referans
   alınır.
