import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProjects } from "@/lib/supabase/queries";
import { ProjectsExplorer } from "./ProjectsExplorer";
import type { GalleryVariant } from "./types";

// Veri BURADA, sunucuda çekiliyor — ProjectsExplorer (istemci) sadece
// filtre/modal etkileşimini yönetir, kendi veri çekmez (bkz.
// ProjectsExplorer.tsx üstündeki sınır açıklaması). Kategori listesi
// kodda sabit değil, yayınlanmış projelerdeki farklı değerlerden
// türetiliyor. Kayıt yoksa bölüm hiç render edilmez (Hizmetler/
// Hakkımızda'yla aynı ilke).
//
// variant, page_sections'tan gelen bir override — verilmezse "grid"
// varsayılanı kullanılır (bkz. ServicesSection'daki aynı desen).
export async function ProjectsSection({
  variant,
}: {
  variant?: string | null;
} = {}) {
  const projects = await getProjects();

  if (projects.length === 0) {
    return null;
  }

  const galleryVariant: GalleryVariant = variant === "mosaic" ? "mosaic" : "grid";

  const categories = Array.from(
    new Set(projects.map((p) => p.category).filter((c): c is string => Boolean(c)))
  ).sort();

  return (
    <section id="projeler" className="bg-surface py-16 sm:py-24">
      <Container>
        <SectionHeader title="Projelerimiz" headingLevel="h2" rule />
        <ProjectsExplorer
          projects={projects}
          categories={categories}
          galleryVariant={galleryVariant}
        />
      </Container>
    </section>
  );
}
