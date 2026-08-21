import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/site/BreadcrumbJsonLd";
import { ProjectsExplorer } from "@/components/site/projects/ProjectsExplorer";
import { getProjects, getSiteSettings } from "@/lib/supabase/queries";
import { getKnownSiteUrl } from "@/lib/seo/getSiteUrl";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/validation/projectFields";

const BREADCRUMB_PATH = [
  { label: "Ana Sayfa", path: "/" },
  { label: "Projeler", path: "/projeler" },
];

// Tam proje kataloğu. Ana sayfadaki Projeler bölümü yalnızca ilk 6 projeyi
// gösteriyor (bkz. ProjectsSection); filtreleme burada, çünkü 6 kayıt
// arasında filtrelemek anlamsız, 25 kayıt arasında şart.
//
// Bu sayfa ayrıca /projeler/<slug> detay sayfalarının doğal ebeveyni:
// breadcrumb zinciri Ana Sayfa > Projeler > <proje> olarak tamamlanıyor.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const tenantName = settings?.tenantName ?? "Firma";

  return {
    title: `Projeler | ${tenantName}`,
    description: `${tenantName} tarafından tamamlanan ve devam eden projeler — konut, ticari ve altyapı işleri.`,
    alternates: getKnownSiteUrl() ? { canonical: "/projeler" } : undefined,
  };
}

export default async function ProjelerPage() {
  const projects = await getProjects();

  const categories = Array.from(
    new Set(projects.map((p) => p.category).filter((c): c is string => Boolean(c)))
  ).sort();

  // Kategoriler alfabetik sıralanıyor (serbest metin), durumlar ise
  // PROJECT_STATUSES'taki SABİT sıraya göre: "Devam Ediyor → Tamamlandı →
  // Planlanan" anlamlı bir zaman çizgisi, alfabetik sıra değil.
  const mevcutDurumlar = new Set(projects.map((p) => p.status).filter(Boolean));
  const statuses: ProjectStatus[] = PROJECT_STATUSES.filter((s) => mevcutDurumlar.has(s));

  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMB_PATH} />
      <div className="bg-surface pt-6 sm:pt-8">
        <Container>
          <Breadcrumbs items={[{ label: "Ana Sayfa", href: "/" }, { label: "Projeler" }]} />
        </Container>
      </div>

      <section className="bg-surface py-10 sm:py-16">
        <Container>
          <SectionHeader title="Projelerimiz" headingLevel="h1" />

          {projects.length === 0 ? (
            <p className="mt-10 text-base text-text-muted">
              Henüz yayınlanmış bir proje yok.
            </p>
          ) : (
            <ProjectsExplorer
              projects={projects}
              categories={categories}
              statuses={statuses}
            />
          )}
        </Container>
      </section>
    </>
  );
}
