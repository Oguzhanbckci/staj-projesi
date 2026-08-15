import { buildBreadcrumbListJsonLd, type BreadcrumbPathItem } from "@/lib/seo/breadcrumbList";
import { getSiteUrl } from "@/lib/seo/getSiteUrl";
import { getActiveTenantDomain } from "@/lib/supabase/queries";

// LocalBusinessJsonLd.tsx ile AYNI desen: `dangerouslySetInnerHTML` burada
// güvenli çünkü içerik kullanıcı girdisi değil, sayfanın kendi sabit
// başlık/yol bilgisi + JSON.stringify (script injection riski yok).
// `getSiteUrl` (getActiveTenantDomain DEĞİL) — LocalBusinessJsonLd'deki AYNI
// gerekçe: JSON-LD'nin url alanı sitenin GERÇEK yayın adresini yansıtmalı
// (bkz. lib/seo/getSiteUrl.ts, 2026-08-17'de bulunan gerçek hata).
export async function BreadcrumbJsonLd({ items }: { items: BreadcrumbPathItem[] }) {
  const siteUrl = getSiteUrl(await getActiveTenantDomain());
  const jsonLd = buildBreadcrumbListJsonLd(siteUrl, items);
  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
