import { headers } from "next/headers";

// SUNUCU-ÖZEL — next/headers kullanır, bu yüzden SADECE Server Action'dan
// import edilir, hiçbir Client Component bu dosyayı import ETMEMELİ
// (next/headers tarayıcıda çalışmaz, Next.js build'i reddeder).
//
// Önceden lib/security/contactRateLimit.ts içindeydi; panel giriş hız
// sınırının (lib/security/loginRateLimit.ts) da AYNI IP tespitine ihtiyacı
// olduğu için buraya, paylaşılan bir dosyaya çıkarıldı (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-18 dokuzuncu oturum — panel girişi hız
// sınırı kararı).

// `x-forwarded-for` zincirine her hop kendi gözlemlediği IP'yi SONA ekler
// ("istemci-iddiası, proxy1-gördüğü, proxy2-gördüğü..."). İlk değer
// istemcinin kendi gönderdiği (dolayısıyla sahtelenebilir) değerdir — bu
// projenin önünde tek güvenilir hop Vercel'in edge ağı olduğu için, ondan
// sonra eklenen SON değer istemcinin değiştiremeyeceği tek halka. Önceki
// sürüm yanlışlıkla ilk değeri kullanıyordu; bir bot her istekte rastgele
// bir x-forwarded-for göndererek hız sınırını sınırsız atlatabiliyordu.
// Ayrı bir saf fonksiyona çıkarıldı ki next/headers mock'lamadan test
// edilebilsin (bkz. getClientIp.test.ts).
export function pickTrustedClientIp(
  forwardedFor: string | null,
  realIp: string | null
): string | null {
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim()).filter(Boolean);
    const lastIp = ips[ips.length - 1];
    if (lastIp) return lastIp;
  }
  return realIp;
}

// Yerel `next dev`'de `x-forwarded-for` genelde HİÇ gelmez (önünde bir proxy
// yok) — bu durumda `null` dönülür, çağıran taraf (checkContactRateLimit,
// checkLoginRateLimit) bunu "hız sınırını atla" olarak yorumlar; geliştiriciyi
// kendi testinde yanlışlıkla kilitlemez.
export async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  return pickTrustedClientIp(
    headerList.get("x-forwarded-for"),
    headerList.get("x-real-ip")
  );
}
