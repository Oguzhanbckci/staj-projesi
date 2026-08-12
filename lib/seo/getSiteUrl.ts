// Sitenin GERÇEK yayın adresini döner — mutlak URL üretilen HER yer
// (sitemap, robots.txt'teki sitemap referansı, JSON-LD @id/url, paylaşım
// görseli) burayı kullanmalı. `getActiveTenantDomain()`'den KASITLI
// OLARAK ayrı: o "hangi tenant'ın verisi gösterilsin" sorusuna cevap
// verir (bir iş/kimlik kavramı, veritabanındaki `tenants.domain`
// kolonundan gelir) — bu fonksiyon "site şu an GERÇEKTE hangi adresten
// erişiliyor" sorusuna (bir barındırma/deployment kavramı).
//
// Gerçek bir müşteri kurulumunda (özel alan adı DNS'te Vercel'e
// bağlıysa) ikisi aynı string'e çözülür. Ama bir Vercel önizleme/demo
// deploy'unda (özel alan adı henüz bağlanmamışken, ör. `*.vercel.app`
// adresinde) FARKLI olurlar — bu ayrım yokken sitemap/robots.txt/JSON-LD,
// gerçekte yayında OLUNMAYAN bir adresi (tenant'ın veritabanındaki yer
// tutucu domain'i) mutlak URL olarak üretiyordu. Gerçek bir sonucu vardı:
// canlı Lighthouse SEO skoru 92'den 58'e düştü (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-17).
//
// Öncelik sırası:
// 1. NEXT_PUBLIC_SITE_URL — elle ayarlanmış, kesin doğru (özel bir alan
//    adı bağlandıysa bunu ayarlamak en güvenilir yol, bkz. docs/KURULUM.md).
// 2. VERCEL_URL — Vercel'in HER deploy'da otomatik sağladığı, o
//    deploy'un GERÇEK erişilebilir adresi — elle bir şey ayarlamaya
//    gerek kalmadan (ör. bu demo dağıtımında) doğru sonucu verir.
// 3. tenantDomain (çağıran taraf sağlar) — yerel geliştirme ya da
//    yukarıdakilerin ikisi de yoksa son çare.
export function getSiteUrl(tenantDomain: string): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `https://${tenantDomain}`;
}

/** getSiteUrl'ün şema (https://) OLMADAN, sadece host kısmı — JSON-LD gibi
 * bir "domain" alanı bekleyen yerler için. */
export function getSiteHost(tenantDomain: string): string {
  return getSiteUrl(tenantDomain).replace(/^https?:\/\//, "");
}
