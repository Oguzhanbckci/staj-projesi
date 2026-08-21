import type { MetadataRoute } from "next";
import { getActiveTenantDomain, getPublishedProjectSlugs } from "@/lib/supabase/queries";
import { getSiteUrl } from "@/lib/seo/getSiteUrl";

// Sadece GERÇEK sayfalar — bölüm çapaları (/#hizmetler vb.) ayrı bir
// sayfa değil, sitemap'e girmez (bkz. lib/sections/config.ts). `panel`
// BİLİNÇLİ olarak yok — robots.ts zaten tamamını Disallow ediyor, ayrıca
// sitemap'te listelemek arama motoruna "tara" sinyali verirdi.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [domain, projectSlugs] = await Promise.all([
    getActiveTenantDomain(),
    getPublishedProjectSlugs(),
  ]);
  const baseUrl = getSiteUrl(domain);

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/projeler`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/ekip`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },

    // Yayınlanmış her proje kendi sayfası (2026-08-21). Öncesinde sitemap
    // sitenin TAMAMI için 3 URL bildiriyordu; 25 projesi olan bir
    // müşteride bile aranabilir sayfa sayısı 3'te kalıyordu. Bir inşaat
    // firmasında arama trafiğinin ana kapısı proje adlarıdır.
    //
    // Öncelik 0.8: ana sayfanın altında ama /ekip ve /iletisim'in
    // üstünde — bunlar sitenin gerçek içerik sayfaları.
    ...projectSlugs.map((slug) => ({
      url: `${baseUrl}/projeler/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
