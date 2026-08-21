import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProjects } from "@/lib/supabase/queries";
import { GALLERY_VARIANTS } from "./registry";
import type { GalleryVariant } from "./types";

// Ana sayfada gösterilecek en fazla proje sayısı. 6 = ızgarada tam iki
// satır (lg'de 3 sütun), mozaikte de bir "öne çıkan + beş normal" bloğu.
const ANA_SAYFA_LIMITI = 6;

// Veri BURADA, sunucuda çekiliyor. Kayıt yoksa bölüm hiç render edilmez
// (Hizmetler/Hakkımızda'yla aynı ilke).
//
// 2026-08-21 (ikinci aşama): Bu bölüm artık TÜM projeleri değil, ilk
// `ANA_SAYFA_LIMITI` kadarını gösteriyor ve filtre şeridi burada DEĞİL,
// /projeler katalog sayfasında. İki sebep:
//   1. Ölçek: 25 projesi olan bir müşteride ana sayfa 25 adet next/image
//      içeren devasa bir sayfaya dönüşüyordu ve "seçilmiş işler" hissi
//      tamamen kayboluyordu.
//   2. Ana sayfa artık bu bölüm için HİÇ istemci JS'i indirmiyor —
//      ProjectsExplorer bir Client Component'ti, galeri düzenleri ise saf
//      sunucu bileşeni. Filtre gerçekten gerektiği yerde (katalog) kalıyor.
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
  const Gallery = GALLERY_VARIANTS[galleryVariant];

  const gosterilen = projects.slice(0, ANA_SAYFA_LIMITI);
  const dahaVar = projects.length > gosterilen.length;

  return (
    <section id="projeler" className="bg-surface py-16 sm:py-24">
      <Container>
        <SectionHeader title="Projelerimiz" headingLevel="h2" rule />
        <div className="mt-8">
          <Gallery projects={gosterilen} />
        </div>

        {/* Bağlantı yalnızca gösterilenden FAZLA proje varsa çıkar —
            hepsi zaten ekrandayken "tümünü gör" demek boş bir vaat olurdu. */}
        {dahaVar && (
          <div className="mt-10">
            <Link
              href="/projeler"
              className="group inline-flex items-center gap-2 text-base font-semibold text-text underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Tüm projeleri gör ({projects.length})
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
