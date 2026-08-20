import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SkipLink } from "@/components/ui/SkipLink";
import {
  getActiveTenantDomain,
  getPageSections,
  getSiteSettings,
  getSiteThemeSettings,
} from "@/lib/supabase/queries";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { buildSectionNavLinks } from "@/lib/sections/config";
import { LocalBusinessJsonLd } from "@/components/site/LocalBusinessJsonLd";
import { getKnownSiteUrl, getSiteUrl } from "@/lib/seo/getSiteUrl";

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
    : `${getSiteUrl(domain)}/api/og`;

  const tenantName = settings?.tenantName ?? "Firma";
  const knownSiteUrl = getKnownSiteUrl();

  return {
    metadataBase: new URL(getSiteUrl(domain)),
    title: settings?.seoTitle ?? settings?.tenantName ?? "Kurumsal Web Sitesi",
    // `?? undefined` DEĞİL — 2026-08-20 mentör denetimi (bulgu 26): Next.js
    // metadata'yı sığ birleştiriyor ve alt segmentte VAR OLAN bir anahtar
    // üsttekini değiştiriyor (bkz. node_modules/next/dist/docs/01-app/
    // 03-api-reference/04-functions/generate-metadata.md, "Merging").
    // `description: undefined` bu yüzden kök layout.tsx'teki dolu yedeği
    // siliyordu — build çıktısındaki ÜÇ sayfanın da (index/ekip/iletisim)
    // HTML'inde <meta name="description"> hiç yoktu. Artık burada gerçek
    // bir yedek veriliyor, panelden SEO açıklaması girilmemiş kurulumlarda
    // bile arama sonucunda açıklama satırı çıkıyor.
    description:
      settings?.seoDescription ??
      `${tenantName} — kurumsal web sitesi. Hizmetlerimiz, projelerimiz ve iletişim bilgilerimiz.`,
    keywords: settings?.seoKeywords ?? undefined,
    // Kanonik adres (bulgu 27). Bu olmadan UTM/fbclid gibi parametreli
    // adresler ayrı birer sayfa olarak dizine girebiliyordu.
    //
    // ⚠️ SADECE ADRES KESİN BİLİNİYORSA yayınlanıyor — `getSiteUrl()` değil
    // `getKnownSiteUrl()` kontrol ediliyor. Gerekçe: `getSiteUrl()`'ün son
    // çaresi veritabanındaki `tenants.domain`'dir ve o değerin GERÇEK bir
    // yayın adresine karşılık geleceğinin garantisi yoktur (fonksiyonun
    // kendi yorumu: "gerçek bir adrese hiç karşılık gelmeyebilir, ör. bu
    // demo dağıtımında"). Yanlış bir canonical, eksik canonical'dan çok
    // daha zararlıdır: sitemap'teki yanlış adres sadece taranamaz, ama
    // yanlış canonical arama motoruna "bu sayfa kopya, aslı şu adreste"
    // der ve sayfa dizinden tamamen düşebilir. 2026-08-17'de mutlak URL'in
    // yanlış domain'e işaret etmesi canlı Lighthouse SEO skorunu 92'den
    // 58'e düşürmüştü (bkz. KARAR-GUNLUGU.md) — aynı hata sınıfı.
    //
    // `knownSiteUrl` doluysa `getSiteUrl()` de AYNI değeri döndürür, yani
    // `metadataBase` ona eşittir ve göreli "/" doğru mutlak adrese çözülür.
    // Boşsa hiç canonical üretilmez — güvenli taraf.
    alternates: knownSiteUrl ? { canonical: "/" } : undefined,
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
  const [sections, settings, themeSettings] = await Promise.all([
    getPageSections(),
    getSiteSettings(),
    getSiteThemeSettings(),
  ]);
  const navLinks = buildSectionNavLinks(sections);
  const tenantName = settings?.tenantName ?? "Firma";
  const logoUrl = settings?.logoPath ? getPublicImageUrl("branding", settings.logoPath) : null;

  return (
    <>
      <SkipLink targetId="main-content" />
      <LocalBusinessJsonLd />
      <Navbar
        logoText={tenantName}
        logoUrl={logoUrl}
        links={navLinks}
        contactHref="/iletisim"
        themeSettings={themeSettings}
      />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
