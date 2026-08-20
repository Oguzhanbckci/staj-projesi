import type { Metadata } from "next";
import { TeamSection } from "@/components/site/team/TeamSection";
import { getSiteSettings } from "@/lib/supabase/queries";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/site/BreadcrumbJsonLd";
import { getKnownSiteUrl } from "@/lib/seo/getSiteUrl";

const BREADCRUMB_PATH = [
  { label: "Ana Sayfa", path: "/" },
  { label: "Ekip", path: "/ekip" },
];

// Ekip artık ana sayfanın bir bölümü değil, ayrı bir sayfa (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-13 — kullanıcı tek sayfanın karmaşık
// hissettirdiğini belirtti). Bileşenin kendisi (TeamSection) değişmedi,
// sadece nerede render edildiği değişti — kendi verisini kendi çekmeye
// devam ediyor.
// `description` ve `alternates.canonical` 2026-08-20 mentör denetiminde
// eklendi (bulgu 27): bu sayfa daha önce yalnızca `title` veriyordu, yani
// (site)/layout.tsx'in açıklamasını miras alıyordu — arama sonucunda Ekip
// sayfası ana sayfayla aynı açıklamayla çıkıyordu. Canonical de yoktu.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const tenantName = settings?.tenantName ?? "Firma";
  // Canonical yalnızca yayın adresi KESİN biliniyorsa üretiliyor — gerekçe
  // app/(site)/layout.tsx'te ayrıntılı yazılı (yanlış canonical, eksik
  // canonical'dan zararlıdır).
  return {
    title: `Ekibimiz | ${tenantName}`,
    description: `${tenantName} ekibi — projelerimizi yürüten kişiler, görevleri ve deneyimleri.`,
    alternates: getKnownSiteUrl() ? { canonical: "/ekip" } : undefined,
  };
}

// Breadcrumb şeridi TeamSection'ın KENDİ Container'ıyla aynı genişlikte
// (bkz. Breadcrumbs kullanımı, 2026-08-18 dokuzuncu oturum) ama bölümün
// `bg-surface-raised` zemininin DIŞINDA, sayfanın normal `bg-surface`
// zemininde — TeamSection'a hiç dokunmadan (o hâlâ page_sections
// registry'sinden de çağrılabilir bir paylaşılan bölüm bileşeni).
export default function EkipPage() {
  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMB_PATH} />
      <div className="bg-surface pt-6 sm:pt-8">
        <Container>
          <Breadcrumbs items={[{ label: "Ana Sayfa", href: "/" }, { label: "Ekip" }]} />
        </Container>
      </div>
      <TeamSection headingLevel="h1" />
    </>
  );
}
