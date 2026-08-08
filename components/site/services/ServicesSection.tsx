import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getServices } from "@/lib/supabase/queries";
import { SERVICE_CARD_VARIANTS } from "./registry";
import type { ServiceCardVariant } from "./types";

// Veri burada (Server Component içinde) çekiliyor — istemci bileşeni yok.
// Kayıt yoksa bölüm hiç render edilmez (boş bir alan bırakmak yerine) —
// bilinçli tasarım kararı, bkz. docs/TASARIM-SISTEMI.md.
//
// cardVariant şu an bir prop (Hero'daki gibi DB'den değil) — henüz
// istenmedi, ama aynı registry deseni sayesinde ileride
// site_settings'e benzer bir kolon eklenip buraya bağlanması kolay.
export async function ServicesSection({
  cardVariant = "icon",
}: {
  cardVariant?: ServiceCardVariant;
}) {
  const services = await getServices();

  if (services.length === 0) {
    return null;
  }

  const ServiceCard = SERVICE_CARD_VARIANTS[cardVariant];

  return (
    <section id="hizmetler" className="bg-surface py-16 sm:py-24">
      <Container>
        <SectionHeader title="Hizmetlerimiz" headingLevel="h2" />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
