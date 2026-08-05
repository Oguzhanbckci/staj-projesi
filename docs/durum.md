# Şu An Neredeyiz

Bu klasör (`docs/`), projede alınan kararları ve açıklamalarını tutar — kod içermez.
Yeni bir oturuma başlarken önce bu dosyayı (güncel durum), sonra gerekiyorsa
`karar-gunlugu.md`'yi (tarihli, hiç silinmeyen karar geçmişi) oku.

**Son güncelleme:** 2026-08-05

## Güncel aşama

Proje yeni başladı. `staj-projesi` klasörü ve `docs/` sistemi kuruldu (`durum.md`,
`karar-gunlugu.md`). Henüz kod yok, henüz bir teknoloji/framework kararı yok.

Ayrıca `docs/kurumsal-site-standartlari.md` dosyasında iyi bir kurumsal site için
kriter/kontrol listesi hazırlandı (performans, erişilebilirlik, SEO, KVKK/güvenlik,
güven unsurları vb.) — ileride tasarlanacak site bu listeye göre değerlendirilecek.

Proje GitHub'a bağlandı: `https://github.com/Oguzhanbckci/staj-projesi` (public),
ilk commit push'landı.

**Teknoloji kararı verildi:** Next.js 15 (App Router) + TypeScript + Tailwind CSS +
Supabase. Ürün: inşaat firmalarına satılabilir, "tek müşteri = tek kurulum"
modelinde bir kurumsal web sitesi; içerik/tema admin panelinden yönetilecek.
Detaylar ve gerekçe `karar-gunlugu.md`'de (2026-08-05, "Teknoloji seçildi"), kurallar
`docs/AI-KURALLARI.md`'de.

## Sıradaki adım

1. Next.js projesini `staj-projesi` içinde scaffold et (`create-next-app`, TypeScript
   + Tailwind + App Router seçenekleriyle).
2. Supabase projesini oluştur, `lib/supabase/` istemcilerini kur.
3. Aşağıdaki açık sorular netleşince kararları `karar-gunlugu.md`'ye ekle.
4. Site tasarımı ilerledikçe `kurumsal-site-standartlari.md`'deki kontrol listesini
   madde madde işaretle.

## Açık sorular

- Her müşteri için ayrı Supabase projesi mi, tek altyapı mı (deployment stratejisi)?
- İçerik modeli: sabit şablon + değişken alanlar mı, yoksa serbest page builder mı?

**Çözüldü:** Admin panelde rol/yetki modeli — tek yönetici rolü, kullanıcı adı/şifre
ile Supabase Auth girişi (bkz. `karar-gunlugu.md`, 2026-08-05).

**Yeni:** `docs/rakip-analizi.md` eklendi — 8 gerçek inşaat/mimarlık sitesi
incelenerek çıkarılan bölüm karşılaştırma tablosu ve "olması gereken 6 bölüm"
listesi (İletişim, Hakkımızda, Hero, Projeler/Portföy, Blog/Haberler, Hizmetler).
İçerik modeli kararı verilirken bu dosya referans alınacak.
