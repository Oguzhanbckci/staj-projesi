// Geliştirmeye özel doğrulama sayfası — ürünle YAYINLANMAYACAK. Gerçek
// platform tenant'ının proje kaydı olmayabileceği için (Hizmetler/
// Hakkımızda'da olduğu gibi) örnek veriyle filtreleme + detay penceresi
// + iki galeri varyantını gösterir. ProjectsSection (gerçek DB akışı)
// ayrıca en altta, gerçek veriyle deneniyor.

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectsExplorer } from "@/components/site/projects/ProjectsExplorer";
import { ProjectsSection } from "@/components/site/projects/ProjectsSection";
import type { ProjectItem } from "@/components/site/projects/types";

const EXAMPLE_PROJECTS: ProjectItem[] = [
  { id: "1", title: "Vadi Konutları", description: "Bahçeli, aile yaşamına uygun konut projesi.", city: "Ankara", year: 2023, category: "Konut", coverPath: null, liveUrl: null },
  { id: "2", title: "Marina Rezidans", description: "Deniz manzaralı, güvenlikli site konsepti.", city: "İzmir", year: 2022, category: "Konut", coverPath: null, liveUrl: null },
  { id: "3", title: "Akme Kule Ofis Binası", description: "A sınıfı ofis standartlarında iş merkezi.", city: "İstanbul", year: 2021, category: "Ticari", coverPath: null, liveUrl: "https://example.com" },
  { id: "4", title: "Merkez İş Merkezi", description: "Çok katlı, çok amaçlı iş merkezi.", city: "Ankara", year: 2020, category: "Ticari", coverPath: null, liveUrl: null },
  { id: "5", title: "Endüstri Parkı Depo Kompleksi", description: "Geniş kapasiteli lojistik kompleksi.", city: "Kocaeli", year: 2019, category: "Altyapı", coverPath: null, liveUrl: null },
];

const EXAMPLE_CATEGORIES = Array.from(new Set(EXAMPLE_PROJECTS.map((p) => p.category!))).sort();

export default function ProjectsPreviewPage() {
  return (
    <div className="min-h-full bg-surface text-text">
      <p className="border-b-2 border-warning bg-surface-raised px-6 py-2 text-center text-caption text-text">
        Geçici doğrulama sayfası — yayınlanmayacak.
      </p>

      <section className="py-16">
        <Container>
          <SectionHeader
            eyebrow="Örnek veri"
            title="Projelerimiz (Izgara)"
            description="Bir kategoriye tıkla, sayfa yeniden yüklenmeden filtrelenir. Bir karta tıkla, detay penceresi açılır."
            headingLevel="h2"
          />
          <ProjectsExplorer
            projects={EXAMPLE_PROJECTS}
            categories={EXAMPLE_CATEGORIES}
            galleryVariant="grid"
          />
        </Container>
      </section>

      <section className="bg-surface-raised py-16">
        <Container>
          <SectionHeader
            eyebrow="Örnek veri"
            title="Projelerimiz (Mozaik)"
            headingLevel="h2"
          />
          <ProjectsExplorer
            projects={EXAMPLE_PROJECTS}
            categories={EXAMPLE_CATEGORIES}
            galleryVariant="mosaic"
          />
        </Container>
      </section>

      {/* Gerçek DB akışı — platform tenant'ının kaydı yoksa (Hizmetler/
          Hakkımızda'daki gibi) bu hiç görünmez, bu normaldir. */}
      <ProjectsSection galleryVariant="grid" />
    </div>
  );
}
