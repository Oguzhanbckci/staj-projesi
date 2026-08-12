import type { MetadataRoute } from "next";
import { getActiveTenantDomain } from "@/lib/supabase/queries";
import { getSiteUrl } from "@/lib/seo/getSiteUrl";

// KISITLAR: "admin sayfaları taranmaya kapalı olsun" — /panel'in TAMAMI
// (giriş sayfası dahil) Disallow. Panel zaten proxy.ts'te auth arkasında
// (bkz. docs/GUVENLIK.md) — bu EK bir katman, arama motorlarının hiç
// denememesi/dizinlememesi için (yetkisiz erişim koruması değil, o zaten
// var).
export default async function robots(): Promise<MetadataRoute.Robots> {
  const domain = await getActiveTenantDomain();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/panel",
    },
    sitemap: `${getSiteUrl(domain)}/sitemap.xml`,
  };
}
