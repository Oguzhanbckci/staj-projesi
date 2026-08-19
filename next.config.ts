import type { NextConfig } from "next";

// Nonce YOK — bilinçli tercih. Next.js'in kendi CSP dokümanı nonce
// kullanan bir sayfanın TAMAMEN dinamik render edilmesini şart koşuyor
// ("all pages must be dynamically rendered", next/dist/docs/.../
// content-security-policy.md) — bu proje statik üretim + panelden
// tetiklenen on-demand ISR üzerine kurulu (bkz. docs/MIMARI.md), nonce'a
// geçmek bu mimariyi tamamen bozardı. Bunun yerine next.config.ts'te
// SABİT bir CSP (dokümandaki "Without Nonces" yöntemi).
//
// `style-src`'te 'unsafe-inline' GEREKLİ ve bilinçli: tenant'ın marka
// rengi/köşe yarıçapı/fontu `app/layout.tsx`'te <html style={...}> olarak
// enjekte ediliyor (bkz. docs/TEMA-MIMARISI.md) — bu, projenin FOUC'suz
// çoklu-tema mimarisinin temeli, nonce olmadan style-src'i sıkılaştırmanın
// yolu yok. `img-src`teki `blob:` panelin görsel yükleme önizlemeleri için
// (bkz. BrandImageUploader.tsx/ProjectImageUploader.tsx, URL.createObjectURL).
// Supabase Storage'daki görseller `img-src`e host olarak eklenmedi çünkü
// tarayıcı onlara HİÇ doğrudan istek atmıyor — next/image, Storage'dan
// SUNUCU tarafında çekip aynı origin'den (`/_next/image?...`) sunuyor
// (bkz. next.config.ts images.remotePatterns).
//
// GERÇEK BİR HATA (2026-08-18, altıncı oturum) — bu yorumun eski hâli
// "createBrowserSupabaseClient hiçbir yerde kullanılmıyor, connect-src
// bu yüzden sadece 'self'" diyordu. Bu iddia `NewMessageNotifier.tsx`
// (panelde anlık mesaj bildirimi — dördüncü oturumda eklendi) YAZILDIĞI
// ANDA yanlış hale geldi ama connect-src GÜNCELLENMEDİ: o bileşen
// `createBrowserSupabaseClient()` ile TARAYICIDAN DOĞRUDAN bir Supabase
// Realtime WebSocket'i açıyor — `connect-src 'self'` bunu sessizce
// engelliyordu (`CHANNEL_ERROR: transport failure`, kullanıcının kendi
// tarayıcısında da doğrulandı — konsolda CSP ihlali olarak görünür).
// Ders: CSP gibi "bir bileşenin ne yaptığına bağlı" güvenlik başlıkları,
// o bileşenin varsayımı (burada: "hiç tarayıcıdan Supabase'e gitmiyoruz")
// değiştiğinde YENİDEN gözden geçirilmeli — tek seferlik bir denetim
// yetmez. Şimdi Supabase projesinin kendi origin'i (REST + Realtime
// WebSocket, ikisi de aynı host) `NEXT_PUBLIC_SUPABASE_URL`'den türetilip
// eklendi.
//
// `script-src`'te de 'unsafe-inline' GEREKLİ (2026-08-17'de canlı ortamda
// bulunan gerçek bir hata ile öğrenildi) — Next.js App Router, hydration'ı
// başlatmak için HTML'e gömülü (inline) <script> etiketleri kullanır;
// nonce'sız bir CSP'de bunlara izin vermenin TEK yolu 'unsafe-inline'.
// Bu olmadan CSP tüm bu script'leri sessizce engelliyor — sayfa görsel
// olarak normal görünüyor (HTML/CSS engellenmiyor) ama HİÇBİR buton/form
// çalışmıyor (React hiç hydrate olmuyor). Next'in kendi "Without Nonces"
// örneği zaten script-src'de de 'unsafe-inline' kullanıyor — ilk yazımda
// bu satır gözden kaçmıştı. Nonce'a geçmemenin gerekçesi (statik render)
// script için de style için olduğu gibi aynen geçerli.
const isDev = process.env.NODE_ENV === "development";
// Supabase'in REST API'si VE Realtime WebSocket'i AYNI host'ta yaşar
// (ör. https://xxx.supabase.co hem /rest/v1 hem /realtime/v1/websocket
// yolu için) — bu yüzden tek bir origin'den hem https hem wss şemasını
// türetmek yeterli. `NewMessageNotifier.tsx`'in tarayıcıdan doğrudan açtığı
// Realtime kanalı buna ihtiyaç duyuyor (bkz. yukarıdaki yorum).
//
// 2026-08-19: Burada `process.env.NEXT_PUBLIC_SUPABASE_URL!` yazıyordu — `!`
// (non-null assertion) "bu kesin dolu" demek, ama DEĞİLDİ: değişken yoksa
// `.replace()` çağrısı `Cannot read properties of undefined` diye anlamsız
// bir TypeError'la TÜM BUILD'i düşürüyordu (ortam değişkeni olmayan temiz
// bir makinede/CI'da ilk karşılaşılan hata bu oluyor ve sebebi hiç belli
// olmuyor). `lib/supabase/queries.ts`'teki `??` hatasıyla aynı sınıf: env
// değişkeninin varlığını varsaymak.
//
// Zarafetle düşmek BURADA GÜVENLİ, çünkü connect-src'den bir origin
// ÇIKARMAK politikayı daha KATI yapar, daha gevşek değil ("fail closed").
// Değişken yoksa uygulama zaten çalışamaz (bkz. lib/supabase/server.ts,
// açık Türkçe hata mesajıyla durur) — build'in ayrıca ve anlaşılmaz bir
// şekilde çökmesine gerek yok.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseWsUrl = supabaseUrl ? supabaseUrl.replace(/^https:/, "wss:") : "";
const supabaseConnectSrc = [supabaseUrl, supabaseWsUrl].filter(Boolean).join(" ");
const CSP_HEADER = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  // Geliştirmede next dev'in HMR (canlı yeniden yükleme) websocket
  // bağlantısı için ws(s)://localhost gerekli — üretimde buna gerek yok,
  // sadece dev modda ekleniyor (bkz. next/dist/docs, "Development vs
  // Production Considerations" — aynı prensip, farklı direktif).
  `connect-src 'self'${supabaseConnectSrc ? ` ${supabaseConnectSrc}` : ""}${isDev ? " ws://localhost:* wss://localhost:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Next.js varsayılan olarak "X-Powered-By: Next.js" gönderir — hangi
  // framework'ün kullanıldığını dışarıya bedavaya söyler (bilgi sızıntısı,
  // saldırı yüzeyi değil ama gereksiz). curl -I ile gerçek bir sunucuya
  // karşı doğrulanırken fark edildi (bkz. docs/GUVENLIK.md madde 15).
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Tüm rotalar — site VE panel, ikisi de aynı CSP yüzeyini
        // paylaşıyor (ThemePreview.tsx de aynı stil-enjeksiyon desenini
        // kullanıyor).
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP_HEADER },
          // CSP'nin frame-ancestors'ı zaten iframe'lemeyi engelliyor —
          // bu, eski tarayıcı desteği için ek bir katman (next/dist/docs:
          // "superseded by CSP's frame-ancestors option").
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // `preload` BİLEREK yok — HSTS preload listesine girmek pratikte
          // geri alınması çok zor bir taahhüt (aylarca sürebilir); bu proje
          // henüz gerçek bir müşteriye/domaine canlıya alınmadığı için
          // (bkz. docs/DURUM.md "Proje bağlamı") şimdiden bu taahhüdü
          // vermek erken olur. max-age yine de 2 yıl — HTTPS zaten
          // kullanıldığında bu başlık zararsız/faydalı.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      // Varsayılan 1MB — görsel yükleme Server Action'ı (bkz.
      // app/panel/(protected)/icerikler/projeler/imageActions.ts) için
      // yetersiz. Bilerek UYGULAMA sınırından (10MB, bkz.
      // lib/supabase/imageValidation.ts MAX_IMAGE_SIZE_BYTES) daha
      // yüksek tutuldu — red kararını HER ZAMAN bizim kodumuz versin
      // (net, Türkçe mesajla), Next.js'in ham gövde limiti değil (o
      // durumda kullanıcı jenerik bir framework hatası görürdü).
      bodySizeLimit: "15mb",
    },
    // AYRI ve KOLAY GÖZDEN KAÇAN bir ikinci limit — kök proxy.ts'in
    // (madde: panel auth koruması, matcher'ı neredeyse TÜM istekleri
    // kapsıyor, bkz. proxy.ts) istek gövdesini belleğe tamponlama
    // sınırı. Varsayılanı 10MB — `serverActions.bodySizeLimit`'ten
    // (15mb) TAMAMEN BAĞIMSIZ çalışıyor, o yüzden onu yükseltmek tek
    // başına yetmiyor. Gerçek bir 10MB'lık test dosyasıyla bu limite
    // takılıp gövdenin (multipart sınırları dahil) kırpıldığı ve
    // "Failed to parse body as FormData" hatasına yol açtığı canlı
    // olarak doğrulandı (bkz. docs/KARAR-GUNLUGU.md, 2026-08-14) —
    // bu yüzden bilerek aynı 15mb değerine çıkarıldı, ikisi TUTARLI
    // kalmalı.
    proxyClientMaxBodySize: "15mb",
  },
  images: {
    // next/image, Supabase Storage'daki görselleri (bkz.
    // lib/supabase/storage.ts) optimize edebilsin diye izinli host —
    // sadece herkese açık storage yoluna kapsam daraltıldı.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vchodvviufmdwomkjrjb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
