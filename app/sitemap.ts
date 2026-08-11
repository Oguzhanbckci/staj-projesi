import type { MetadataRoute } from "next";
import { getActiveTenantDomain } from "@/lib/supabase/queries";

// Sadece GERÇEK sayfalar — bölüm çapaları (/#hizmetler vb.) ayrı bir
// sayfa değil, sitemap'e girmez (bkz. lib/sections/config.ts). `panel`
// BİLİNÇLİ olarak yok — robots.ts zaten tamamını Disallow ediyor, ayrıca
// sitemap'te listelemek arama motoruna "tara" sinyali verirdi.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = await getActiveTenantDomain();
  const baseUrl = `https://${domain}`;

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/ekip`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];
}
