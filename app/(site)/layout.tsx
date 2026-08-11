import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getPageSections, getSiteSettings } from "@/lib/supabase/queries";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { buildSectionNavLinks } from "@/lib/sections/config";

// site_settings.seo_title/seo_description'tan — kök layout.tsx'teki
// create-next-app varsayılanının (yer tutucu metin) yerini alıyor.
// favicon_path varsa tenant'ın kendi favicon'u, yoksa Next.js'in statik
// app/favicon.ico'suna düşer (icons hiç set edilmezse Next bunu otomatik
// kullanıyor) — KISITLAR: "logosu/faviconu olmayan kurulumda düzgün bir
// yedek görünüm olsun".
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.seoTitle ?? settings?.tenantName ?? "Kurumsal Web Sitesi",
    description: settings?.seoDescription ?? undefined,
    icons: settings?.faviconPath
      ? { icon: getPublicImageUrl("branding", settings.faviconPath) }
      : undefined,
  };
}

// (site) route grubundaki her sayfada ortak: Navbar + <main> landmark +
// Footer. `panel` bu layout'un dışında (ayrı bir route, bkz.
// docs/AI-KURALLARI.md madde 3) — bu yüzden burada, kök app/layout.tsx'te
// değil. Nav linkleri ve Footer'ın "Bölümler" listesi aynı page_sections
// sorgusundan (react cache() ile dedupe edilir, bkz. lib/supabase/
// queries.ts) türetiliyor — ikisi hep senkron kalır.
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [sections, settings] = await Promise.all([getPageSections(), getSiteSettings()]);
  const navLinks = buildSectionNavLinks(sections);
  const tenantName = settings?.tenantName ?? "Firma";
  const logoUrl = settings?.logoPath ? getPublicImageUrl("branding", settings.logoPath) : null;

  return (
    <>
      <Navbar logoText={tenantName} logoUrl={logoUrl} links={navLinks} contactHref="/iletisim" />
      <main>{children}</main>
      <Footer />
    </>
  );
}
