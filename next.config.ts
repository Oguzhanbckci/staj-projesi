import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Varsayılan 1MB — görsel yükleme Server Action'ı (bkz.
      // app/panel/(protected)/icerikler/projeler/imageActions.ts) için
      // yetersiz. Bilerek UYGULAMA sınırından (5MB, bkz.
      // lib/supabase/imageValidation.ts MAX_IMAGE_SIZE_BYTES) çok daha
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
