import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getTestimonials } from "@/lib/supabase/queries";
import { TESTIMONIALS_VARIANTS } from "./registry";
import type { TestimonialsVariant } from "./types";

export async function TestimonialsSection({
  variant = "grid",
}: {
  variant?: TestimonialsVariant;
}) {
  const items = await getTestimonials();
  if (items.length === 0) return null;

  const Variant = TESTIMONIALS_VARIANTS[variant];

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
