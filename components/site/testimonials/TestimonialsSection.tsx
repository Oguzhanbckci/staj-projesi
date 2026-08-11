import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getTestimonials } from "@/lib/supabase/queries";
import { TESTIMONIALS_VARIANTS } from "./registry";
import type { TestimonialsVariant } from "./types";

// HeroSection.tsx'teki isHeroVariant ile aynı desen — page_sections'tan
// gelen ham string'i JSX'e ulaşmadan önce burada doğruluyoruz. Bu bölümde
// (services/projects/faq'ın aksine) doğrulama bir eşitlik ternary'si değil
// bir REGISTRY LOOKUP (TESTIMONIALS_VARIANTS[variant]) — bilinmeyen bir key
// güvenlik ağı olmadan `undefined` component döner ve render'da çökerdi.
function isTestimonialsVariant(value: string | null | undefined): value is TestimonialsVariant {
  return value === "grid" || value === "featured";
}

export async function TestimonialsSection({
  variant,
}: {
  variant?: string | null;
} = {}) {
  const items = await getTestimonials();
  if (items.length === 0) return null;

  const Variant = TESTIMONIALS_VARIANTS[isTestimonialsVariant(variant) ? variant : "grid"];

  return (
    <section id="referanslar" className="bg-surface-raised py-16 sm:py-24">
      <Container>
        <SectionHeader title="Müşterilerimiz Ne Diyor?" headingLevel="h2" />
        <div className="mt-8">
          <Variant items={items} />
        </div>
      </Container>
    </section>
  );
}
