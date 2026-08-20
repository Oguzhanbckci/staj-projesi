import type { Metadata } from "next";
import { ContactSection } from "@/components/site/contact/ContactSection";
import { getSiteSettings } from "@/lib/supabase/queries";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/site/BreadcrumbJsonLd";
import { getKnownSiteUrl } from "@/lib/seo/getSiteUrl";

const BREADCRUMB_PATH = [
  { label: "Ana Sayfa", path: "/" },
  { label: "İletişim", path: "/iletisim" },
];

// İletişim artık ana sayfanın bir bölümü değil, ayrı bir sayfa (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-13). Navbar'daki "İletişim" butonu ve
// Eylem Çağrısı'nın buton linki de buraya (/iletisim) işaret edecek
// şekilde güncellendi.
// EkipPage ile aynı gerekçe (2026-08-20 denetimi, bulgu 27) — kendi
// açıklaması ve kanonik adresi.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const tenantName = settings?.tenantName ?? "Firma";
  // EkipPage ile aynı koruma — bkz. app/(site)/layout.tsx'teki gerekçe.
  return {
    title: `İletişim | ${tenantName}`,
    description: `${tenantName} iletişim bilgileri — adres, telefon, e-posta ve çalışma saatleri. Teklif ve sorularınız için iletişim formu.`,
    alternates: getKnownSiteUrl() ? { canonical: "/iletisim" } : undefined,
  };
}

// EkipPage ile AYNI breadcrumb şeridi deseni (bkz. o dosyadaki yorum).
export default function IletisimPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMB_PATH} />
      <div className="bg-surface pt-6 sm:pt-8">
        <Container>
          <Breadcrumbs items={[{ label: "Ana Sayfa", href: "/" }, { label: "İletişim" }]} />
        </Container>
      </div>
      <ContactSection headingLevel="h1" />
    </>
  );
}
