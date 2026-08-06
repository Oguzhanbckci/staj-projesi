# Şu An Neredeyiz

Bu klasör (`docs/`), projede alınan kararları ve açıklamalarını tutar — kod içermez.
Yeni bir oturuma başlarken önce bu dosyayı (güncel durum), sonra `PRD.md`'yi
(özellik bazlı yapılacak/yapılmayacak referansı), gerekirse `karar-gunlugu.md`'yi
(tarihli, hiç silinmeyen karar geçmişi) oku.

**Son güncelleme:** 2026-08-06

## Güncel aşama

Proje yeni başladı. `staj-projesi` klasörü ve `docs/` sistemi kuruldu (`durum.md`,
`karar-gunlugu.md`). Henüz kod/scaffold yok; teknoloji ve mimari kararları aşağıda.

Ayrıca `docs/kurumsal-site-standartlari.md` dosyasında iyi bir kurumsal site için
kriter/kontrol listesi hazırlandı (performans, erişilebilirlik, SEO, KVKK/güvenlik,
güven unsurları vb.) — ileride tasarlanacak site bu listeye göre değerlendirilecek.

Proje GitHub'a bağlandı: `https://github.com/Oguzhanbckci/staj-projesi` (public),
ilk commit push'landı.

**Teknoloji kararı verildi:** Next.js 15 (App Router) + TypeScript + Tailwind CSS +
Supabase. Detaylar `karar-gunlugu.md`'de (2026-08-05, "Teknoloji seçildi"), kod
kuralları `docs/AI-KURALLARI.md`'de.

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
  bkz. `rakip-analizi.md`; **blog/haberler kavramı kapsam dışı**) sürükle-bırakla
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

Tüm gerekçe ve kronoloji için `karar-gunlugu.md`'deki 2026-08-06 tarihli
kayıtlara bakılabilir (en önemlisi: "Panel mimarisi düzeltildi: tek panel, tek
kullanıcı, tam yönetilen hizmet" — bu, aynı gün ve 2026-08-05'te alınan "iki
panel" / "tenant kendi admin'ine girer" fikirlerini geçersiz kılar). Özellik
bazlı güncel kapsam için tek referans `docs/PRD.md`'dir.

## Sıradaki adım

1. Next.js projesini `staj-projesi` içinde scaffold et (`create-next-app`, TypeScript
   + Tailwind + App Router seçenekleriyle).
2. Supabase projesini oluştur, `lib/supabase/` istemcilerini kur; `tenants` tablosu
   ve tenant_id tabanlı RLS'i tasarla.
3. Hazır bölüm kütüphanesindeki ilk bileşenleri (Hero, İletişim gibi en sık
   görülenlerden başlayarak) kodla; en az bir örnek "demo" (bölüm kombinasyonu +
   örnek içerik) hazırla.
4. Site tasarımı ilerledikçe `kurumsal-site-standartlari.md`'deki kontrol listesini
   madde madde işaretle.

## Açık sorular

Şu an aktif açık soru yok. Kullanıcı ürün mantığı hakkında birkaç ek nokta daha
paylaşacağını belirtti (2026-08-06) — gelince buraya ve `karar-gunlugu.md`'ye
işlenecek.

**Çözüldü:** `docs/rakip-analizi.md` eklendi — 8 gerçek inşaat/mimarlık sitesi
incelenerek çıkarılan bölüm karşılaştırma tablosu ve "olması gereken 6 bölüm"
listesi (İletişim, Hakkımızda, Hero, Projeler/Portföy, Blog/Haberler, Hizmetler).
Bu liste bölüm kütüphanesi için referans alındı — **tek istisna: Blog/Haberler
bilinçli olarak kapsam dışı bırakıldı** (2026-08-06, bkz. `karar-gunlugu.md`).
