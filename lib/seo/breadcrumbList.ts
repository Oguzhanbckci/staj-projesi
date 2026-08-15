// Saf modül — lib/seo/localBusiness.ts ile AYNI ilke: "ham veri çekme" (bu
// dosyayı çağıran BreadcrumbJsonLd.tsx) ile "JSON-LD nesnesini KURMA"
// (burası) bilerek ayrı, biri Supabase/ağa bağımlı, diğeri saf/test
// edilebilir (bkz. docs/KARAR-GUNLUGU.md, 2026-08-18 dokuzuncu oturum).
export interface BreadcrumbPathItem {
  label: string;
  /** Göreli yol — ör. "/", "/ekip". */
  path: string;
}

export interface BreadcrumbListJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

// Kök yol ("/") ile siteUrl birleşirken çift slash oluşmasın diye özel
// ele alınıyor — diğer yollar zaten "/" ile başlıyor (bkz. çağıran
// tarafların items listesi).
export function buildBreadcrumbListJsonLd(
  siteUrl: string,
  items: BreadcrumbPathItem[]
): BreadcrumbListJsonLd | null {
  if (items.length === 0) return null;

  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.path === "/" ? normalizedSiteUrl : `${normalizedSiteUrl}${item.path}`,
    })),
  };
}
