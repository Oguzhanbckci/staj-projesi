# Test Stratejisi

Bu dosya, projenin test yaklaşımını, kalite eşiklerini ve "bir işin bitti
sayılması" için gereken koşulları tanımlar. `AI-KURALLARI.md` madde 7 buraya
işaret eder; test kararı değişirse önce `KARAR-GUNLUGU.md`'ye kayıt düşülür,
sonra bu dosya güncellenir. Kod içermez.

**Son güncelleme:** 2026-08-17 — Erişilebilirlik denetim kaydı (madde 9):
atlama bağlantısı + gereksiz canlı bölge düzeltmesi

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

## 8. Ziyaretçi Sitesi Manuel Test Kontrol Listesi *(2026-08-11 eklendi)*

Otomatik teste ek olarak — özellikle sayfa düzeni/duyarlı tasarım gibi
"gözle bakılması gereken" konularda — yeni bir bölüm/özellik tamamlandığında
veya yayın öncesi bu liste elle işaretlenir. Üç ekran genişliğinde
gezilerek (~375px mobil, ~768px tablet, ~1280px+ masaüstü — tarayıcı
DevTools'taki cihaz araç çubuğu veya pencereyi elle daraltıp genişletmek
yeterli):

**Düzen / duyarlı tasarım:**
- [ ] Navbar'daki masaüstü menü hiçbir genişlikte taşmıyor/kırılmıyor
      (bkz. aşağıdaki "Son çalıştırma" — bu tam olarak bulunan bir hataydı).
- [ ] Mobil/tablette hamburger menü doğru açılıp kapanıyor, odak tuzağı
      çalışıyor, Escape ile kapanıyor.
- [ ] Tüm bölümler (Hero → İletişim) sırayla gezilip aralarındaki
      boşluk/hizalama tutarlı.
- [ ] Proje detay penceresi (modal) dar ekranda içerik taşırmadan okunabilir.
- [ ] Kart ızgaraları (Hizmetler/Projeler/Referanslar/Ekip) her genişlikte
      makul sayıda sütuna diziliyor, kart içeriği taşmıyor.

**İletişim formu (bkz. `components/site/contact/`):**
- [ ] Her alan görünür bir `<label>`'a sahip, zorunlu alanlar işaretli.
- [ ] Boş/hatalı gönderimde: sayfanın üstünde bir hata ÖZETİ VE her alanın
      kendi altında hata metni görünüyor (ikisi de var, sadece biri değil).
- [ ] Hata olan alanın kenarlığı renkle değişiyor AMA yanında ayrıca metin
      de var — sadece renge bakarak değil, metni okuyarak da hangi alanın
      hatalı olduğu anlaşılabiliyor (renk körü kullanıcı senaryosu).
- [ ] Ekran okuyucu (veya tarayıcının erişilebilirlik denetçisi) hata
      özetini bir `alert`/canlı bölge olarak duyuruyor.
- [ ] Gönder butonuna basınca buton devre dışı kalıyor ve metni
      "Gönderiliyor…" olarak değişiyor.
- [ ] Geçerli veriyle gönderimde form temizleniyor ve bir teşekkür mesajı
      görünüyor.
- [ ] Sadece klavyeyle (fare kullanmadan) tüm alanlar dolduruluyor ve form
      gönderilebiliyor.

**Son çalıştırma (2026-08-11):** Kod seviyesinde (Tailwind breakpoint'leri
okunarak) 3 ekran genişliği gözden geçirildi — tarayıcı tabanlı gerçek bir
görsel test değil, bkz. `KARAR-GUNLUGU.md`'deki gerekçe (bu ortamda
tarayıcı aracı `localhost`'a erişemiyor). Bulunan ve düzeltilen sorunlar:
1. **(Kritik)** `Navbar`'daki masaüstü menü `sm:` (640px) noktasında
   açılıyordu, ama görünür bağlantı sayısı 7'ye kadar çıkabiliyor —
   640-1024px (tablet) aralığında taşma riski vardı. `lg:` (1024px)
   noktasına taşındı (`Navbar.tsx` + `MobileMenu.tsx`, üçü birden tutarlı
   olacak şekilde).
2. **(Orta)** `ProjectDetailModal`'daki konum/yıl/kategori ızgarası sabit
   3 sütundu, dar telefonlarda (~360-400px) metinler sıkışıyordu —
   `grid-cols-1 sm:grid-cols-3` yapıldı.

Bu bulgular gerçek bir tarayıcıda (kullanıcı tarafından) henüz teyit
edilmedi — sıradaki adımda kullanıcının kendi tarayıcısında hızlı bir
görsel kontrol yapması öneriliyor.

## 9. Erişilebilirlik Denetim Kaydı (2026-08-17)

Dışarıdan gelen bir yönergeyle, ziyaretçi sitesi + panel için "otomatik
denetim → klavye turu → ekran okuyucu denemesi → düzelt → yeniden
denetle" akışı istendi. Bu ortamda tarayıcı aracı `localhost`'a
erişemediği için (aynı kısıt: `KARAR-GUNLUGU.md` 2026-08-08/2026-08-14)
otomatik tarama/klavye turu/ekran okuyucu dinlemesi **AI tarafından
gerçek zamanlı yapılamadı** — bunun yerine hedefli bir kod incelemesi
yapıldı. Kapsam bilerek 2026-08-14'teki son kapsamlı panel taramasından
SONRA eklenen, henüz hiç denetlenmemiş yüzeylere daraltıldı: Tema
Ayarları (canlı önizleme/renk seçici), Sayfa Düzeni (varyant seçimi),
SEO Ayarları (karakter sayacı/arama önizlemesi), marka görseli yükleme.
Daha eski yüzeyler (site bölümleri, ilk 19 panel sayfası) zaten
2026-08-08 ve 2026-08-14'te denetlendi, tekrar taranmadı.

**Bulgular:**

| # | Öncelik | Bulgu | Etki | Durum |
|---|---|---|---|---|
| 1 | Kritik | Atlama bağlantısı ("skip link") hiç yoktu — ne sitede ne panelde | Klavye kullanıcısı her sayfada Navbar'ın (site) veya kenar menüsünün (panel, ~8 link) tamamını Tab'layıp geçmeden içeriğe ulaşamıyor — tekrarlayan görevlerde ciddi zaman kaybı | ✅ Düzeltildi |
| 2 | Yüksek | `SeoEditor`'daki karakter sayacı ve `ThemeEditor`'daki kontrast geri bildirimi `role="status"` taşıyordu — her tuş vuruşunda/renk değişiminde tetikleniyor | Ekran okuyucu kullanıcısı ilgili alana yazarken sürekli ek anonsla kesintiye uğruyor, alanı kullanmak ciddi zorlaşıyor | ✅ Düzeltildi |
| 3 | Düşük | `BrandImageUploader`'daki seçili-dosya önizlemesinin `alt` metni jenerik ("Yüklenecek görselin önizlemesi"), dosya adını içermiyor | Ekran okuyucu kullanıcısı önizlemeden hangi dosyayı seçtiğini anlayamıyor | 📝 Not edildi, düzeltilmedi |

**Yanlış pozitif olarak elenen:** `ColorPickerField`'daki native
`<input type="color">` + metin kutusu ikilisi ilk bakışta "aynı değer
için iki kontrol, karışıklık riski" gibi görünebilir; incelemede her
ikisinin de ayrı doğru isimlendirildiği (`aria-label` / `label`+
`htmlFor`) ve tab sırasının mantıklı olduğu görüldü — gerçek bir sorun
değil.

**Düzeltmelerin somut kodu:** yeni `components/ui/SkipLink.tsx`,
`app/(site)/layout.tsx` ve `components/panel/PanelShell.tsx`'e
eklendi (hedef `<main>`'ler `id`+`tabIndex={-1}` aldı);
`role="status"` `SeoEditor.tsx`'teki `CharacterCount` ve
`ThemeEditor.tsx`'teki iki kontrast paragrafından kaldırıldı (form
gönderim sonrası tek seferlik "Değişiklikler kaydedildi" mesajlarına
DOKUNULMADI — onlar doğru kullanım).

**Test yöntemi:**
- *Atlama bağlantısı:* Sayfa yüklenince ilk Tab'da "İçeriğe geç"
  bağlantısının görünür hâle gelmesi; Enter'a basınca odağın
  `<main>`'e atlaması (bir sonraki Tab, içerik alanındaki ilk
  etkileşimli öğeye gitmeli).
- *Canlı bölge düzeltmesi:* Bir ekran okuyucuyla (NVDA/VoiceOver/
  Narrator) SEO Ayarları/Tema sayfasında ilgili alana yazarken artık
  her karakterde ek anons duyulmaması; değerin görsel olarak hâlâ
  anlık güncellendiğinin gözle doğrulanması.

**Kullanıcı tarafından tamamlandı (2026-08-17, aynı gün):** Klavye turu
(site + panel, atlama bağlantısı/proje modalı/SSS akordeonu/iletişim
formu/Tema/Sayfa Düzeni/SEO Ayarları dahil) ve Windows Narrator ile
ekran okuyucu denemesi gerçek tarayıcıda elle yapıldı — **hiçbir yeni
sorun bulunmadı**. Bu, yukarıdaki 2 düzeltmenin (atlama bağlantısı,
canlı bölge) gerçek kullanıcı deneyiminde de işe yaradığını doğruluyor.

**Öncesi/sonrası:** Otomatik bir araçla sayısal bir öncesi/sonrası
karşılaştırması bu oturumda üretilemedi (denetim bir tarama aracı
çıktısı değil, hedefli kod incelemesiydi) — somut sonuç: 2 gerçek
bulgu (1 kritik + 1 yüksek) düzeltildi, 1 düşük öncelikli bulgu not
olarak bırakıldı, 1 aday yanlış pozitif olarak elendi.

## 10. Açık Sorular

Şu an aktif açık soru yok.
