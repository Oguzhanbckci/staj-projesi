import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import {
  getActiveTenantDomain,
  getPageSections,
  getSiteSettings,
} from "@/lib/supabase/queries";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { buildSectionNavLinks } from "@/lib/sections/config";
import { LocalBusinessJsonLd } from "@/components/site/LocalBusinessJsonLd";

// site_settings.seo_title/seo_description'tan — kök layout.tsx'teki
// create-next-app varsayılanının (yer tutucu metin) yerini alıyor.
// favicon_path varsa tenant'ın kendi favicon'u, yoksa Next.js'in statik
// app/favicon.ico'suna düşer (icons hiç set edilmezse Next bunu otomatik
// kullanıyor) — KISITLAR: "logosu/faviconu olmayan kurulumda düzgün bir
// yedek görünüm olsun". `keywords`/`openGraph.images` 2026-08-16'da
// eklendi (SEO Ayarları ekranı). `openGraph.images`: panelden bir
// paylaşım görseli yüklenmişse O, yoksa 2026-08-17'de eklenen `/api/og`
// (ImageResponse ile otomatik üretilen, gerçek marka rengini kullanan bir
// görsel, bkz. app/api/og/route.tsx) — KISITLAR: "yoksa site adıyla
// otomatik bir görsel üret", yani `openGraph` artık hiçbir zaman tamamen
// boş kalmıyor.
export async function generateMetadata(): Promise<Metadata> {
  const [settings, domain] = await Promise.all([getSiteSettings(), getActiveTenantDomain()]);
  const ogImageUrl = settings?.ogImagePath
    ? getPublicImageUrl("branding", settings.ogImagePath)
    : `https://${domain}/api/og`;

  return {
    title: settings?.seoTitle ?? settings?.tenantName ?? "Kurumsal Web Sitesi",
    description: settings?.seoDescription ?? undefined,
    keywords: settings?.seoKeywords ?? undefined,
    icons: settings?.faviconPath
      ? { icon: getPublicImageUrl("branding", settings.faviconPath) }
      : undefined,
    openGraph: { images: [ogImageUrl] },
  };
}

// (site) route grubundaki her sayfada ortak: Navbar + <main> landmark +
// Footer + LocalBusiness JSON-LD (2026-08-17 — site-geneli kabul edilir,
// tek sayfaya özel değil, bkz. components/site/LocalBusinessJsonLd.tsx).
// `panel` bu layout'un dışında (ayrı bir route, bkz. docs/AI-KURALLARI.md
// madde 3) — bu yüzden burada, kök app/layout.tsx'te değil. Nav linkleri
// ve Footer'ın "Bölümler" listesi aynı page_sections sorgusundan (react
// cache() ile dedupe edilir, bkz. lib/supabase/queries.ts) türetiliyor —
// ikisi hep senkron kalır.
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [sections, settings] = await Promise.all([getPageSections(), getSiteSettings()]);
  const navLinks = buildSectionNavLinks(sections);
  const tenantName = settings?.tenantName ?? "Firma";
  const logoUrl = settings?.logoPath ? getPublicImageUrl("branding", settings.logoPath) : null;

  return (
    <>
      <LocalBusinessJsonLd />
      <Navbar logoText={tenantName} logoUrl={logoUrl} links={navLinks} contactHref="/iletisim" />
      <main>{children}</main>
      <Footer />
    </>
  );
}
