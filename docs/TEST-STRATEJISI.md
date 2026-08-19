# Test Stratejisi

Bu dosya, projenin test yaklaşımını, kalite eşiklerini ve "bir işin bitti
sayılması" için gereken koşulları tanımlar. `AI-KURALLARI.md` madde 7 buraya
işaret eder; test kararı değişirse önce `KARAR-GUNLUGU.md`'ye kayıt düşülür,
sonra bu dosya güncellenir. Kod içermez.

**Son güncelleme:** 2026-08-19 — **CI kuruldu** (`.github/workflows/ci.yml`,
madde 15): her push/PR'da lint + tip kontrolü + 54 birim testi + build
otomatik koşuyor, hiçbir gizli anahtar gerektirmiyor. E2E bilinçli olarak
CI dışında (üretim veritabanına yazıyor — gerekçe madde 15'te). Madde 12'deki
"CI kurulmadı" maddesi kapandı.

**Önceki güncelleme:** 2026-08-17 — Vitest + Playwright kuruldu, 3 birim + 3
uçtan uca test yazıldı ve kullanıcı tarafından 3x yeşil doğrulandı
(madde 10-12: kapsam, çalıştırma, kapsanmayan alanlar); ilk canlı yayın
sonrası canlıya karşı e2e + Lighthouse doğrulaması ve bununla bulunan
2 gerçek hata madde 13'e eklendi

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

- ✅ `panel`'e kullanıcı adı/şifre ile giriş (auth) — `e2e/admin-service-flow.spec.ts`.
- Yeni tenant oluşturma + demo import (one-click) — özellik henüz yok (Faz 5).
- ✅ Bir tenant'ın içerik/temasını `panel`'den düzenleme ve `(site)` tarafında
  değişikliğin göründüğünü doğrulama — `e2e/admin-service-flow.spec.ts`
  (Hizmetler örneğiyle; diğer içerik türleri madde 12'de "kapsanmayan").
- ✅ Tenant sitesindeki iletişim formunun (ad-soyad, e-posta, telefon,
  konu, mesaj) gönderilmesi — `e2e/visitor-flow.spec.ts`. WhatsApp
  butonu bu akışa dahil değil (sadece platform sahibinin tanıtım
  sitesinde var, tenant sitelerinde yok — bkz. `PRD.md` madde 3.1/3.3).
- Açık/koyu tema geçişi — henüz otomatikleştirilmedi (madde 12).
- **Güvenlik doğrulaması:** ✅ girişsiz erişimin `/panel/giris`'e
  yönlendirildiği artık otomatik test ediliyor —
  `e2e/unauthorized-access.spec.ts`. Bir tenant domaininde `panel`'in
  proxy seviyesinde tamamen erişilemez olması hâlâ kodlanmadı (bkz.
  `GUVENLIK.md` madde 8 açık madde), o yüzden hâlâ test edilmiyor.

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

## 10. Otomatik Test Kapsamı *(2026-08-17 eklendi)*

Vitest (birim) ve Playwright (uçtan uca) kuruldu — madde 2'deki plan
artık kısmen gerçek koda döküldü. Kapsam:

**Birim testler (Vitest) — 3 dosya, hepsi saf fonksiyon, DOM'a ihtiyaç
duymuyor:**

| Dosya | Test edilen | Ne doğrulanıyor |
|---|---|---|
| `lib/theme/contrast.test.ts` | `lib/theme/contrast.ts` | WCAG kontrast oranı hesabı (siyah/beyaz = 21:1), `pickReadableTextColor` (koyu→beyaz, açık→siyah), geçersiz hex'te hata fırlatma, **#808080 için doğru sonucu döndüğü — 2026-08-15'te bulunan gerçek bir hatanın regresyon testi** (bkz. `KARAR-GUNLUGU.md`). |
| `lib/validation/contact.test.ts` | `lib/validation/contact.ts` | Geçerli veri kabulü, opsiyonel telefon, kısa ad/mesaj reddi, geçersiz e-posta/telefon/konu reddi, üst sınır aşımı. |
| `lib/seo/formatPhone.test.ts` | `lib/seo/formatPhone.ts` | 4 farklı girdi biçiminin (uluslararası, ülke kodlu, yerel `0...`, çıplak 10 hane) hepsinin aynı E.164 çıktısına düştüğü; tanınmayan girdide **yanlış bir tahmin yerine `null`** döndüğü. |

**Uçtan uca testler (Playwright) — 3 kritik akış, `e2e/` altında:**

| Dosya | Akış |
|---|---|
| `e2e/visitor-flow.spec.ts` | Ana sayfa açılır → bölümler görünür → proje galerisi kategoriye göre filtrelenir → iletişim formu gönderilir (kendi oluşturduğu `contact_messages` satırını testten sonra siler). |
| `e2e/admin-service-flow.spec.ts` | Admin girişi → yeni hizmet ekleme + "Hemen yayınla" → ana sayfada göründüğünün doğrulanması → panelden silme → ana sayfada artık görünmediğinin doğrulanması. `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` tanımlı değilse otomatik atlanır. |
| `e2e/unauthorized-access.spec.ts` | Girişsiz `/panel` ve `/panel/mesajlar` erişiminin `/panel/giris`'e yönlendirildiği — 2026-08-12'de `curl` ile elle doğrulanmış aynı senaryonun otomatikleştirilmiş hâli (bkz. `GUVENLIK.md` madde 8-9). |

**Tasarım ilkeleri (KISITLAR, hepsi kodda uygulandı):**
- Seçiciler `getByRole`/`getByLabel` — CSS class'ı veya kırılgan metin
  eşleşmesi yok; bu, kod tabanının zaten sahip olduğu erişilebilirlik
  disiplininin (madde 9) doğal bir sonucu.
- Her test kendi verisini `Date.now()` ile benzersiz üretir (e-posta/
  başlık) ve `test.afterEach`'te service-role client'la siler — başka
  bir teste veya gerçek demo veriye sızmaz. Admin akışında bu temizlik
  bir GÜVENLİK AĞI olarak da çalışır: testin ortasında bir adım
  başarısız olsa bile kayıt arkada kalmaz (KABUL KRİTERİ: "3 kez üst
  üste geçmeli").
- Sabit `sleep`/`waitForTimeout` HİÇ kullanılmadı — Playwright'ın
  web-first `expect(...).toBeVisible()`/`toHaveURL()`/`toHaveCount()`
  gibi koşula dayalı bekleyen assertion'larına güvenildi.
- Admin girişi `process.env.E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`'den
  okunuyor, kodda hiçbir yerde yazılı değil.
- Her akış `test.step(...)` ile adımlara bölündü — bir adım başarısız
  olduğunda Playwright raporu TAM olarak hangi adımda durduğunu gösterir
  (KABUL KRİTERİ).
- `playwright.config.ts`: `retries: 0` BİLİNÇLİ — "3 kez üst üste
  geçmeli" kriteri framework'ün otomatik tekrar denemesiyle
  MASKELENMİYOR, testin kendi idempotency'sinin gerçekten sağlaması
  isteniyor. `timeout: 60_000` (KABUL KRİTERİ).

## 11. Testleri Çalıştırma *(2026-08-17 eklendi)*

**İlk kurulum (bir kere):**
```
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom @playwright/test dotenv
npx playwright install chromium
```

**Birim testler:**
```
npm run test:unit          # tek seferlik
npm run test:unit:watch    # geliştirirken, dosya değişince otomatik tekrar çalışır
```

**Uçtan uca testler:**
```
npm run test:e2e
```
Dev sunucusunu (`npm run dev`) kendisi başlatır — ayrıca elle
başlatmaya gerek yok; zaten açıksa onu kullanır. `E2E_ADMIN_EMAIL`/
`E2E_ADMIN_PASSWORD` `.env.local`'de tanımlı değilse admin akışı
otomatik atlanır (skip), diğer 2 akış yine çalışır.

**Hepsi birden (main'e push'lamadan önce, `AI-KURALLARI.md` madde 8.4):**
```
npm test
```

**Bir test başarısız olursa:** Playwright, hangi `test.step`'te
durduğunu terminale yazar; `playwright-report/` klasöründe (otomatik
üretilir, git'e girmez) ekran görüntüsü + trace bulunur —
`npx playwright show-report` ile açılabilir.

**Doğrulama (gerçek, kullanıcı tarafından, 2026-08-17):** `npm test`
art arda **3 kez** çalıştırıldı, üçünde de tamamı yeşil: 26/26 birim
test, 3/3 e2e test (en uzun tekil test 11.5s — KABUL KRİTERİ'ndeki 60s
sınırının içinde). Yol boyunca gerçek bir yapılandırma hatası bulunup
düzeltildi: `.env.local`'de admin test hesabı zaten `TEST_AUTH_EMAIL`/
`TEST_AUTH_PASSWORD` adıyla duruyordu (ayrı bir eski script,
`scripts/test-rls.mjs`, için) — `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`
adıyla AYRICA eklenmesi gerekti, isimler kasıtlı olarak birleştirilmedi
(`test-rls.mjs` bozulmasın diye). KABUL KRİTERİ'nin tamamı (3x yeşil,
her adımda hata konumu net, 60s altı) karşılandı.

## 12. Kapsanmayan Alanlar *(2026-08-17 eklendi, dürüstçe listelenir)*

- **Bileşen (component) render testi henüz yok** — Vitest jsdom +
  `@testing-library/react` kurulu/hazır ama şu an sadece 3 saf fonksiyon
  modülü test ediliyor, hiçbir `.tsx` bileşeni için `render()` testi
  yazılmadı.
- **Diğer 6 doğrulama şeması test edilmedi** — sadece
  `lib/validation/contact.ts` kapsandı; `service.ts` (kısmen e2e ile
  dolaylı test edildi), `project.ts`/`testimonial.ts`/`faq.ts`/
  `teamMember.ts`/`theme.ts`/`seo.ts` aynı zod deseninde ama ayrı ayrı
  doğrulanmadı.
- **Projeler/Referanslar/SSS/Ekip için ayrı bir admin CRUD e2e'si yok**
  — sadece Hizmetler örnek alındı (KISITLAR'daki akış buydu); diğer 4
  tür `AdminListTable`/`DeleteButton` üzerinden birebir aynı paylaşılan
  bileşenleri kullanıyor, yüksek olasılıkla aynı şekilde çalışıyor ama
  bu iddia edilmiyor, test edilmedi.
- **Açık/koyu tema geçişi** e2e ile doğrulanmadı (madde 3'te hâlâ
  planlanan bir kritik akış).
- **Yeni tenant oluşturma + demo import** — özelliğin kendisi henüz
  yok (Faz 5), test de yok.
- **Görsel yükleme akışı** (proje/marka görseli) e2e kapsamında değil —
  2026-08-14'te ayrı, geçici script'lerle elle doğrulanmıştı (bkz.
  `KARAR-GUNLUGU.md`), kalıcı bir e2e testine dönüştürülmedi.
- **Rate limiting/spam koruması** iletişim formunda hâlâ yok (`GUVENLIK.md`
  madde 10 açık madde) — olsaydı bile test edilecek bir şey olmazdı.
- **Bir tenant domaininde panelin gerçekten erişilemez olması**
  (host-bazlı tenant/panel ayrımı) henüz kodlanmadı (`GUVENLIK.md`
  madde 8 açık madde) — mevcut yetkisiz-erişim testi sadece "girişsiz
  kullanıcı" senaryosunu kapsıyor, "yanlış domain" senaryosunu değil.
- ~~**CI (sürekli entegrasyon) kurulmadı**~~ — **KURULDU (2026-08-19,
  `.github/workflows/ci.yml`)**, bkz. madde 15. `main`'e her push ve her
  pull request'te lint + `tsc --noEmit` + 54 birim testi + production build
  otomatik koşuyor. **E2E hâlâ CI'da değil** (bilinçli — gerekçe madde 15'te).

## 13. Canlıya Karşı Doğrulama (Live Testing) *(2026-08-17 eklendi)*

`playwright.config.ts`, `PLAYWRIGHT_BASE_URL` ortam değişkeni verilirse
`webServer`'ı (yerel `npm run dev` başlatma) atlayıp doğrudan o adrese
karşı çalışır (`workers: 1`'e düşer — canlıya paralel istek atmamak
için). Kullanım: `PLAYWRIGHT_BASE_URL=https://<canlı-adres> npm run
test:e2e`.

**Neden önemli — bu tam olarak teoriyle değil, pratikle kanıtlandı:**
İlk gerçek canlı yayında (2026-08-17, bkz. `KARAR-GUNLUGU.md` "sekizinci
oturum") madde 10'daki 3 e2e testin canlıya karşı çalıştırılması,
**kod incelemesiyle veya yerelde hiç yakalanamayacak** 2 gerçek hata
buldu:

1. CSP'nin `script-src`'sinde eksik `'unsafe-inline'` — Next.js
   hydration'ını tamamen sessizce blokluyordu (sayfa görsel olarak
   normal görünüyordu, hiçbir buton çalışmıyordu).
2. `robots.txt`/sitemap/JSON-LD'nin yanlış domain'e işaret etmesi
   (tenant kimlik domain'i ile gerçek yayın adresinin karıştırılması) —
   canlı Lighthouse SEO skorunu 92'den 58'e düşürüyordu.

İkisi de yerel `npm test` yeşil geçtikten SONRA, sadece canlı ortamda
ortaya çıktı (CSP başlığı ve gerçek Vercel domain'i yerelde mevcut
değil/farklı). **Sonuç:** madde 7'deki "Bitti Tanımı" yerel testi
yeterli sayıyor ama bu, **ilk canlı yayın** için tek başına yeterli
değil — en az bir kez canlıya karşı `npm run test:e2e` + gerçek
Lighthouse ölçümü, yerel testin YERİNE değil YANINDA gerekli. Bu iki
bulgu ve düzeltmeleri: `KARAR-GUNLUGU.md` "sekizinci oturum",
`docs/SEO-PERFORMANS.md`, `docs/GUVENLIK.md` madde 8.

**Doğrulama (gerçek, kullanıcı tarafından):** Düzeltmeler sonrası canlı
adrese karşı 3/3 e2e testi yeşil; canlı Lighthouse mobil/masaüstü
performance 97-100, accessibility 100, best practices 96, **SEO 92**
(bkz. `docs/SEO-PERFORMANS.md`).

## 14. Açık Sorular

Şu an aktif açık soru yok.

## 15. Sürekli Entegrasyon (CI) *(2026-08-19 eklendi)*

Dosya: **`.github/workflows/ci.yml`**. Tetikleyici: `main`'e push ve `main`'e
açılan pull request.

### Neden kuruldu (somut gerekçe)

2026-08-19'daki sıfırdan kurulumda, `npm test`in **e2e yarısının iki oturum
boyunca hiç çalıştırılmadığı** ortaya çıktı. Bu sürede iki gerçek hata fark
edilmeden `main`'e push'landı: panel giriş sayfasında hiç `<h1>` olmaması
(erişilebilirlik) ve kırılgan bir Playwright seçicisi. `AI-KURALLARI.md` madde
8.4 zaten "push öncesi `npm test` temiz olmalı" diyordu — ama bunu hatırlamak
insana kalmıştı ve hatırlanmadı. CI bu kontrolü otomatikleştirir.

### Ne koşuyor

| Adım | Komut |
|---|---|
| 1 | `npm ci` (lock dosyasına birebir uyar, `npm install` DEĞİL) |
| 2 | `npm run lint` |
| 3 | **`npx next typegen`** (aşağıdaki uyarıya bak — atlanamaz) |
| 4 | `npx tsc --noEmit` |
| 5 | `npm run test:unit` (54 test) |
| 6 | `npm run build` |

> ⚠️ **`next typegen` adımı zorunlu.** `LayoutProps`/`PageProps`/`RouteContext`
> Next.js'in OTOMATİK ÜRETTİĞİ global tiplerdir ve `.next/types/routes.d.ts`
> içinde yaşarlar (`app/layout.tsx` `LayoutProps<"/">` kullanıyor). Bu adım
> olmadan `tsc --noEmit` **`Cannot find name 'LayoutProps'`** ile düşer.
> Geliştirme makinesinde `.next` zaten var olduğu için sorun GÖRÜNMEZ —
> yalnızca temiz bir makinede ortaya çıkar. Nitekim **ilk CI koşusu tam
> olarak bu hatayla kırmızı döndü**; yerel simülasyon `.next` silinmeden
> yapıldığı için hatayı kaçırmıştı (bkz. `KARAR-GUNLUGU.md`, 2026-08-19).
> `next typegen`, tam build almadan sadece bu tipleri üretir (Next.js
> 15.5'te geldi).

Ayrı ve **bloklamayan** ikinci bir job: `npm audit --audit-level=high`
(`continue-on-error: true`). Yeni bir advisory yayınlandığında build'i
kırmasın ama görünür olsun diye — 2026-08-19'daki `nanoid` açığı tam olarak
böyle ortaya çıkmıştı.

### CI hiçbir gizli anahtar (secret) GEREKTİRMİYOR

Bu bilinçli olarak sağlandı; kurulum sırasında bulunan iki hata düzeltilerek
mümkün oldu:

1. `lib/supabase/queries.ts` — `ACTIVE_TENANT_DOMAIN` yedeği `??` yerine `||`
   (boş string de varsayılana düşsün).
2. `next.config.ts` — `process.env.NEXT_PUBLIC_SUPABASE_URL!` yoksa artık
   çökmüyor; CSP'nin `connect-src`'inden o origin'i çıkarıyor. Bu **güvenli**,
   çünkü bir origin'i çıkarmak politikayı daha KATI yapar, daha gevşek değil
   ("fail closed").

Supabase sorguları erişim olmadığında hatayı yakalayıp boş dönüyor (mevcut
davranış), sayfa yine üretiliyor. **Doğrulandı:** `.env.local` VE `.next`
birlikte kaldırılıp altı adımın tamamı yerelde, workflow'daki sırayla
koşuldu — hepsi `exit 0`.

**Simülasyon kuralı (ilk koşunun kırmızı dönmesinden çıkan ders):** CI'ı
yerelde taklit ederken `.env.local` kadar **`.next` klasörü de silinmelidir**.
İlk denemede yalnızca `.env.local` kaldırılmıştı; `.next` yerinde kaldığı için
üretilmiş tipler mevcuttu ve `tsc` sorunsuz geçti — CI'da ise geçmedi. Temiz
makine ile geliştirme makinesi arasındaki fark tam olarak buradan doğuyor.

### E2E neden CI'da YOK (dürüst gerekçe)

`e2e/admin-service-flow.spec.ts` gerçek Supabase'e bağlanıp **gerçek bir hizmet
kaydı oluşturup siliyor** (bkz. madde 10). Projede tek bir Supabase projesi
var — ayrı bir test/staging veritabanı yok. Her push'ta üretim verisine yazmak
kabul edilemez; ayrıca admin şifresinin GitHub Secrets'a konması gerekirdi.
E2E, yerelde `npm test` ile elle çalıştırılmaya devam ediyor.

**Bu boşluğun bedeli açıkça kabul ediliyor:** CI, bugün bulunan iki hatanın
(giriş sayfası `<h1>`'i ve şifre alanı seçicisi) türünü YAKALAYAMAZ — ikisini
de yalnızca gerçek tarayıcı koşusu yakalamıştı. Ayrı bir staging Supabase
projesi açılırsa `ci.yml`'e bir `e2e` job'ı eklenmeli.

### Node sürümü

CI **Node 22** kullanıyor; yerel geliştirme şu an Node 26 ile yapılıyor. Fark
bilinçli: CI'ın Vercel'in çalıştırdığı ortamı (bkz. `MIMARI.md` madde 5)
yaklaşık olarak taklit etmesi, geliştirme makinesini taklit etmesinden daha
değerli. Sürüme özgü bir sorun şüphesi olursa `ci.yml`'deki `node-version`
bir matrix'e çevrilebilir.
