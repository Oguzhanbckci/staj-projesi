# Karar Günlüğü

Bu dosya, proje boyunca alınan kararları ve gerekçelerini tarih sırasıyla listeler.
Yeni bir karar alındığında en alta eklenir, önceki kayıtlar değiştirilmez/silinmez.

---

## 2026-08-05 — Proje iskeleti ve docs/ sistemi kuruldu

**Karar:** Staj kapsamındaki çalışmalar için `C:\Users\toffe\Projects\staj-projesi`
adında, mevcut `next-project`'ten bağımsız yeni bir proje klasörü açıldı. İçine,
kod içermeyen, sadece kararları ve açıklamaları tutan bir `docs/` klasörü kuruldu
(`README.md`, `karar-gunlugu.md`, `durum.md`).

**Gerekçe:** Kullanıcı stajda hem terminalden AI kullanmayı hem web sitesi yapım
sürecini öğreniyor ve patronun vereceği görevleri takip edebilmek için, sohbetin
veya terminal oturumunun dışında kalıcı bir "hafıza" istiyor. `docs/` bu hafızayı
taşıyacak; böylece başka bir terminalde veya başka bir AI aracında bile buradaki
dosyalar okunarak kaldığı yerden devam edilebilecek.

**Not:** Henüz proje için bir teknoloji/framework kararı alınmadı (Next.js, statik
HTML, vb.) — bu, patronun ilk görevine göre netleşince buraya yeni bir madde olarak
eklenecek.

---

## 2026-08-05 — README.md kaldırıldı, docs/ 2 dosyaya indirildi

**Karar:** Ayrı bir `README.md` dosyası gereksiz bulundu (sadece diğer dosyaları
anlatan meta bir dosyaydı, kendi başına karar/durum bilgisi taşımıyordu). Kullanıcı
tarafından `rm` ile silindi; içeriğindeki kısa açıklama `durum.md`'nin başına
taşındı.

**Gerekçe:** İki dosyanın (durum + karar günlüğü) amacı zaten birbirinden farklı ve
yeterli; üçüncü bir "meta" dosya gereksiz katman ekliyordu.

---

## 2026-08-05 — "İyi kurumsal site" ölçütleri araştırıldı ve kaydedildi

**Karar:** Web araştırması yapılarak kurumsal web sitesi standartları derlendi ve
`docs/kurumsal-site-standartlari.md` dosyasına kaydedildi. Kapsam: performans (Core
Web Vitals), mobil uyumluluk, erişilebilirlik (WCAG 2.1 AA), SEO, güvenlik/KVKK
uyumluluğu, güven unsurları, marka/içerik tutarlılığı.

**Gerekçe:** Patronun ilk somut görevi henüz netleşmedi, ama proje web sitesi
geliştirmeye dayandığı için önceden genel-geçer bir kalite/kriter referansı
oluşturmak istendi — ileride tasarlanacak sitenin bu listeye göre değerlendirilmesi
planlanıyor.

**Kaynak:** Dosyanın sonunda web.dev, eresmedya.com, VRNSoft ve MCG Dijital gibi
kaynaklara linkler var.
