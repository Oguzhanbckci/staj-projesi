import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getFaqs } from "@/lib/supabase/queries";
import { FaqList } from "./FaqList";
import type { FaqVariant } from "./types";

export async function FaqsSection({ variant = "single" }: { variant?: FaqVariant }) {
  const faqs = await getFaqs();
  if (faqs.length === 0) return null;

  return (
    <section id="sss" className="bg-surface py-16 sm:py-24">
      <Container>
        <SectionHeader title="Sıkça Sorulan Sorular" headingLevel="h2" />
        <div className="mt-8">
          <FaqList items={faqs} columns={variant === "two-column" ? 2 : 1} />
        </div>
      </Container>
    </section>
  );
}
