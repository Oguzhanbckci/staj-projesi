# Test Stratejisi

Bu dosya, projenin test yaklaşımını, kalite eşiklerini ve "bir işin bitti
sayılması" için gereken koşulları tanımlar. `AI-KURALLARI.md` madde 7 buraya
işaret eder; test kararı değişirse önce `KARAR-GUNLUGU.md`'ye kayıt düşülür,
sonra bu dosya güncellenir. Kod içermez.

**Son güncelleme:** 2026-08-06

## 0. Bağlam

Tek geliştirici, toplam ~32 iş günlük süre. Bu yüzden test yaklaşımı **pragmatik
ve hedefli**dir — her satır kod için test yazılmaz, kapsamlı/sürekli bir test
disiplini hedeflenmez. Amaç, kritik akışların bozulmadığından emin olmak;
zamanın büyük kısmını test yazmaya değil ürüne ayırmak.

## 1. Test Yaklaşımı (Felsefe)

- **Birim (unit) test sürekli/rutin bir akıştır** — iş mantığı barındıran her
  fonksiyon/bileşen yazılırken, aynı commit'te, kısa ve hedefli bir unit test
  eklenir (bkz. `AI-KURALLARI.md` madde 8: commit öncesi `npm test`).
- **E2E ve entegrasyon testleri "belli noktalarda" yazılır**, her özellik için
  değil. Bir kritik kullanıcı akışı (aşağıda madde 2) tamamlandığında bir e2e
  testi eklenir; ara adımlarda veya küçük/görsel değişikliklerde e2e test
  yazılmaz.
- Test miktarı bilinçli olarak sınırlı tutulur — "çok test" hedef değildir,
  "doğru yerde yeterli test" hedeftir.

## 2. Test Seviyeleri ve Araçlar

| Seviye | Araç | Ne zaman yazılır |
|---|---|---|
| Birim (unit) | Vitest + React Testing Library | Özelliği yazarken, aynı commit'te — iş mantığı fonksiyonları, form validasyonu, izole bileşen render'ı. |
| Entegrasyon (integration) | Vitest + React Testing Library | Sadece belli noktalarda — birden fazla parçanın birlikte çalışması gereken yerlerde (ör. `panel`'den yapılan bir değişikliğin Supabase'e doğru yazılması + RLS'in doğru izolasyonu). |
| Uçtan uca (e2e) | Playwright | Sadece kritik akışlarda (madde 3) — proje genelinde az sayıda, ama her biri gerçek bir kullanıcı senaryosunu uçtan uca doğrular. |

## 3. E2E ile Kapsanacak Kritik Akışlar

- `panel`'e kullanıcı adı/şifre ile giriş (auth).
- Yeni tenant oluşturma + demo import (one-click).
- Bir tenant'ın içerik/temasını `panel`'den düzenleme ve `(site)` tarafında
  değişikliğin göründüğünü doğrulama.
- Tenant sitesindeki iletişim formunun (ad-soyad, telefon, mesaj) gönderilmesi
  ve WhatsApp butonunun doğru linke gittiğinin doğrulanması.
- Açık/koyu tema geçişi.
- **Güvenlik doğrulaması:** bir tenant domaininde `panel`'in gerçekten
  erişilemez olduğu (proxy seviyesinde engellendiği — henüz kodlanmadı,
  bkz. `GUVENLIK.md` madde 8 açık madde). Panel auth'un kendisi (girişsiz
  erişim engeli, yanlış şifre, doğru giriş/çıkış akışı) 2026-08-10'da elle
  test edildi, bkz. `KARAR-GUNLUGU.md`.

## 4. Kalite Eşikleri — Lighthouse

Dört kategoride de minimum **90/100** hedeflenir:

- Performance ≥ 90
- Accessibility ≥ 90
- Best Practices ≥ 90
- SEO ≥ 90

(bkz. `KURUMSAL-SITE-STANDARTLARI.md`, Core Web Vitals — Lighthouse'ta 90-100
aralığı "iyi/yeşil" kabul edilir.)

**Performans bütçesi (netleşti, 2026-08-06):** İlk içerik (LCP — Largest
Contentful Paint) anlık/0 saniyede yüklenmek zorunda değil; **1.5–2 saniye
arası kabul edilebilir bir yükleme süresi** olarak hedeflenir.

## 5. Erişilebilirlik Kuralları

- Tüm görsellerde açıklayıcı `alt` metni zorunludur.
- Metin ve arka plan renkleri arasında yeterli kontrast sağlanır (WCAG 2.1 AA
  eşiği — bkz. `KURUMSAL-SITE-STANDARTLARI.md`).
- Site sadece klavye ile kullanılabilir olmalıdır (bkz.
  `KURUMSAL-SITE-STANDARTLARI.md`).

## 6. Responsive / Tarayıcı Desteği

- Mobil ve masaüstü tarayıcılarda tam işlevsellik (responsive tasarım) —
  mobile-first yaklaşım.
- Güncel sürümdeki yaygın tarayıcılarda (Chrome, Firefox, Safari, Edge) test
  edilir.

## 7. "Bitti" Tanımı (Definition of Done)

Bir özellik/iş şu dört koşul sağlanmadan **bitti sayılmaz**:

1. **Kod çalışıyor** — manuel veya otomatik olarak doğrulanmış, `npm run
   build` hatasız tamamlanıyor.
2. **Sorun çıkarabilecek durumlar yakalanıp önlenmiş** — ilgili unit/
   entegrasyon testi(leri) eklenmiş ve geçiyor; bilinen edge-case'ler
   düşünülmüş.
3. **Dökümantasyon güncel** — özellik `PRD.md` kapsamını değiştiriyorsa
   `PRD.md`, mimari bir karar içeriyorsa `KARAR-GUNLUGU.md`, genel durumu
   etkiliyorsa `DURUM.md` güncellenmiş.
4. **İlgili e2e "kapısından" geçilmiş** — özellik madde 3'teki kritik
   akışlardan birine giriyorsa, o akışın e2e testi yeşil.

Proje sonunda (staj yönergesi gereği), madde 3'teki tüm kritik akışları
kapsayan e2e test paketi tek seferde çalıştırılır — bu, projenin son teslim
"kapısı"dır.

## 8. Açık Sorular

Şu an aktif açık soru yok.
