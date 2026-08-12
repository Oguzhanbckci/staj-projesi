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
// 1. NEXT_PUBLIC_SITE_URL — elle ayarlanmış, TEK GÜVENİLİR seçenek
//    (bkz. docs/KURULUM.md) — HER ZAMAN bunu ayarlayın, aşağıdaki 2-3
//    sadece "hiç ayarlanmadıysa daha az yanlış olsun diye" bir yedek.
// 2. VERCEL_PROJECT_PRODUCTION_URL — Vercel'in projeye atanmış KALICI
//    üretim alan adı (`docs/vercel.com/docs/environment-variables/
//    system-environment-variables`) — VERCEL_URL'in aksine deploy'a
//    özel bir hash İÇERMEZ.
// 3. VERCEL_URL — ⚠️ GÜVENİLMEZ: Vercel'in HER deploy'a döner (deploy'a
//    ÖZEL, geçici bir hash içerir, ör. `proje-b49qmlaf2-....vercel.app`),
//    kullanıcının gördüğü KALICI adres (ör. `proje.vercel.app`) DEĞİL.
//    2026-08-17'de bu YÜZDEN yanlış bir düzeltme yapılmıştı (bkz.
//    docs/KARAR-GUNLUGU.md) — sadece VERCEL_PROJECT_PRODUCTION_URL da
//    yoksa, en son çare olarak kalıyor.
// 4. tenantDomain (çağıran taraf sağlar) — yerel geliştirme ya da
//    yukarıdakilerin hiçbiri yoksa son çare.
export function getSiteUrl(tenantDomain: string): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
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
