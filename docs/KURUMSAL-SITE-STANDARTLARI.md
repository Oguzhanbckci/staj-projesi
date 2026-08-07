# İyi Bir Kurumsal Web Sitesi İçin Ölçütler

Bu notlar, web araştırması yapılarak derlenmiştir (2026-08-05). Amaç: staj projesinde
web sitesi tasarlarken/geliştirirken referans alınacak bir kriter listesi oluşturmak.
Aşağıdaki maddeler proje ilerledikçe uygulanıp uygulanmadığı `KARAR-GUNLUGU.md`'de
işaretlenecek.

## 1. Performans (Core Web Vitals)

Google ve arama motorları, site hızını doğrudan bir sıralama/kalite sinyali olarak
kullanıyor. Kullanıcıların büyük kısmı 3 saniyeden uzun süren sayfaları terk ediyor.

- **LCP (Largest Contentful Paint)** — sayfadaki en büyük görünür öğenin yüklenme
  süresi. Hedef: "iyi" eşiği.
- **CLS (Cumulative Layout Shift)** — sayfa yüklenirken içeriğin oynaması/kayması.
  Görsel kararlılık için düşük tutulmalı.
- **INP / TBT (etkileşim gecikmesi)** — kullanıcı bir şeye tıkladığında sitenin tepki
  verme hızı.
- Ölçüm: Chrome DevTools içindeki **Lighthouse**, veya `web-vitals` npm paketi ile.
- Kural: sayfa ziyaretlerinin en az %75'i her metrikte "iyi" eşiğini geçmeli.

## 2. Mobil Uyumluluk (Responsive / Mobile-first)

- Site her ekran boyutunda (telefon, tablet, masaüstü) düzgün görünmeli.
- Tasarım önce mobil için düşünülüp sonra büyük ekranlara genişletilmeli
  (mobile-first yaklaşım) — kullanıcıların çoğu siteye telefondan giriyor.

## 3. Erişilebilirlik (Accessibility — WCAG)

- Hedef standart: **WCAG 2.1 Level AA**.
- Tüm görsellerde açıklayıcı `alt` metni olmalı.
- Site sadece klavye ile (fare olmadan) kullanılabilmeli.
- Renk kontrastı, ekran okuyucu uyumluluğu gözetilmeli.
- Test araçları: **WAVE**, **Axe**, **Lighthouse** (erişilebilirlik sekmesi).

## 4. SEO (Arama Motoru Optimizasyonu)

- Arama motorlarının siteyi tarayabilmesi için `robots.txt` ve site haritası
  (sitemap) doğru yapılandırılmalı; yanlışlıkla `noindex` ile önemli sayfalar
  gizlenmemeli.
- Başlık (title), meta açıklama, başlık etiketleri (h1/h2) anlamlı ve düzenli
  kullanılmalı.
- Yapılandırılmış veri (structured data / schema.org) eklenmesi, hem klasik arama
  hem yapay zeka destekli aramalarda görünürlüğü artırıyor.

## 5. Güvenlik ve Yasal Uyumluluk (Türkiye'ye özel: KVKK)

- **SSL sertifikası zorunlu** — tüm sayfalar HTTPS üzerinden şifreli sunulmalı.
- **KVKK Aydınlatma Metni** ve **Gizlilik Politikası** — verinin nasıl toplandığı,
  ne kadar saklandığı ve nasıl korunduğu açıkça belirtilmeli. Bu sadece hukuki bir
  zorunluluk değil, aynı zamanda kullanıcı güvenini artıran bir unsur.
- **Çerez (cookie) politikası** — hangi çerezin ne amaçla ve ne kadar süre
  saklandığını listeleyen bir metin + kullanıcıdan onay alan bir çerez bildirimi.
- Kullanıcı şifreleri gibi hassas veriler asla düz metin tutulmamalı (hashing:
  bcrypt, argon2 vb.) — bu proje için ancak bir giriş sistemi eklenirse gündeme
  gelir, şimdiden not düşülüyor.

## 6. Güven Unsurları (Trust Signals)

- Şirket hakkında net bilgi: İletişim bilgileri, adres, telefon, e-posta kolayca
  bulunabilmeli (genelde "İletişim" ve "Hakkımızda" sayfaları).
- Gerçek referanslar/müşteri yorumları, iş ortağı logoları.
- Güncel ve tutarlı içerik (eski/kırık linkler güven kaybettirir).

## 7. İçerik ve Marka Tutarlılığı

- Tutarlı renk paleti, tipografi ve logo kullanımı — sayfadan sayfaya kopuk
  hissettirmemeli.
- Net bir eylem çağrısı (CTA — "Bize Ulaşın", "Teklif Al" gibi) her sayfada
  kullanıcıyı bir sonraki adıma yönlendirmeli.
- Sade ve anlaşılır gezinme (navigasyon) — kullanıcı 2-3 tıkla aradığını
  bulabilmeli.

## Özet Kontrol Listesi

- [ ] Sayfa hızı (Core Web Vitals) Lighthouse ile test edildi
- [ ] Mobil/tablet/masaüstü görünümleri kontrol edildi
- [ ] WCAG 2.1 AA erişilebilirlik testi yapıldı (WAVE/Axe/Lighthouse)
- [ ] SEO temel ayarları (title, meta, sitemap, robots.txt) yapılandırıldı
- [ ] SSL/HTTPS aktif
- [ ] KVKK Aydınlatma Metni + Gizlilik Politikası eklendi
- [ ] Çerez bildirimi/politikası eklendi
- [ ] İletişim bilgileri ve Hakkımızda sayfası net
- [ ] Marka tutarlılığı (renk/tipografi/logo) sağlandı
- [ ] Net CTA'lar ve sade navigasyon var

