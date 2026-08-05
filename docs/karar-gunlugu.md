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

---

## 2026-08-05 — GitHub deposu açıldı ve ilk commit push'landı

**Karar:** `staj-projesi` için GitHub'da public bir depo açıldı
(`https://github.com/Oguzhanbckci/staj-projesi`), yerel klasörde `git init` yapıldı,
`docs/` içeriği ilk commit olarak (`docs: proje beyni ... ekle`) atıldı ve
`origin/main`'e push'landı.

**Gerekçe:** Projeyi versiyon kontrolüne almak ve patronla/uzaktan erişimle
paylaşılabilir hale getirmek için. Depo bilinçli olarak boş açıldı (README/gitignore
eklenmedi) ki yerel geçmişle çakışma olmasın.

---

## 2026-08-05 — AI-KURALLARI.md oluşturuldu

**Karar:** `docs/AI-KURALLARI.md` dosyası eklendi: proje özeti, teknoloji (henüz
belirlenmedi), klasör yapısı, kod standartları, yap/yapma listesi, güvenlik,
commit kuralları ve AI ile çalışma ilkelerini tek bir referans dosyada topluyor.

**Gerekçe:** Bu sohbette baştan beri uygulanan çalışma kurallarını (terminal
komutlarını kullanıcının çalıştırması, her adımın açıklanması, kararların
`karar-gunlugu.md`'ye işlenmesi vb.) yazılı hale getirip projenin kalıcı parçası
yapmak — böylece yeni bir oturumda veya başka bir AI aracında da bu kurallar
görünür ve uygulanabilir olur.

---

## 2026-08-05 — Teknoloji seçildi: Next.js 15 + TypeScript + Tailwind + Supabase

**Karar:** Proje, inşaat firmalarına satılabilir bir kurumsal web sitesi ürünü
olarak konumlandırıldı — "tek müşteri = tek kurulum" modeli. Stack: Next.js 15
(App Router), TypeScript (strict), Tailwind CSS, Supabase (Postgres + Auth +
Storage). İçerik ve tema, kod değişikliği gerektirmeden bir admin panelinden
yönetilecek. `docs/AI-KURALLARI.md` bu karara göre tamamen yeniden yazıldı (proje
özeti, teknoloji, klasör yapısı, kod standartları, yap/yapma, güvenlik, commit
kuralları, AI ile çalışma ilkeleri — her kural tek cümle ve uygulanabilir).

**Gerekçe:** Staj kapsamında yapılacak iş, artık somut bir ürün fikrine
(inşaat firmaları için satılabilir kurumsal site şablonu) dönüştü. Admin panelden
yönetilen içerik/tema modeli, tek bir kod tabanının farklı müşteriler için yeniden
kullanılmasını sağlıyor. Supabase, hem veritabanı hem auth hem dosya depolamayı
tek serviste toplayarak geliştirmeyi hızlandırıyor.

**Açık sorular (henüz karara bağlanmadı):**
- Her müşteri için ayrı bir Supabase projesi mi açılacak, yoksa tek altyapıda mı
  barındırılacak (deployment/çoğaltma stratejisi)?
- İçerik modeli ne kadar esnek olacak — sabit şablon + değişken alanlar mı, yoksa
  serbest sayfa/bölüm oluşturma (page builder) mı?

---

## 2026-08-05 — Admin panel giriş modeli: tek yönetici rolü

**Karar:** Admin paneline tek bir yönetici (müşterinin kendisi) kullanıcı adı ve
şifre ile giriş yapacak. Çoklu rol/yetki seviyesi (ör. editör, görüntüleyici) yok —
tek rol, tam yetki. Giriş Supabase Auth üzerinden yapılır.

**Gerekçe:** Ürün "tek müşteri = tek kurulum" modelinde; her kurulumda tek bir
işletme sahibi/yöneticisi olacağı için karmaşık bir rol sistemine gerek yok, basit
kullanıcı adı/şifre girişi yeterli ve geliştirmeyi hızlandırıyor.

---

## 2026-08-05 — 8 gerçek inşaat/mimarlık sitesi incelendi, rakip analizi çıkarıldı

**Karar:** 8 gerçek firma sitesi (Limak, Rönesans İnşa, Nurol İnşaat, Fabrika
Mimarlık, OSO Mimarlık, Two Plus Architects, FEINE Mimarlık, Tabanlıoğlu
Architects) doğrudan ziyaret edilerek incelendi, bölüm karşılaştırma tablosu ve
"her kurumsal sitede olması gereken 6 bölüm" listesi `docs/rakip-analizi.md`'ye
kaydedildi. Sonuç: İletişim (8/8), Hakkımızda (8/8), Hero (7/8), Projeler/Portföy
(7/8), Blog/Haberler (7/8), Hizmetler (4/8) en sık görülen 6 bölüm.

**Gerekçe:** Ürünün sayfa/bölüm şablonunu (admin panelinden yönetilecek içerik
modeli) varsayımla değil, gerçek pazar örneklerine dayanarak tasarlamak için.
Bu liste, ileride içerik modeli (sabit şablon vs. page builder) kararında referans
olarak kullanılacak.

**Not:** Mimarlık firmalarında Projeler/Portföy neredeyse zorunlu; büyük inşaat
holdinglerinde (Limak, Nurol) Sürdürülebilirlik/Yatırımcı İlişkileri gibi
kurumsal-holding'e özgü bölümler var — bunlar tek-kurulumluk ürün kapsamı dışında
tutulabilir.
