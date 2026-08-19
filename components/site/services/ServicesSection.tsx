import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getServices } from "@/lib/supabase/queries";
import { SERVICE_CARD_VARIANTS } from "./registry";
import type { ServiceCardVariant } from "./types";

// Veri burada (Server Component içinde) çekiliyor — istemci bileşeni yok.
// Kayıt yoksa bölüm hiç render edilmez (boş bir alan bırakmak yerine) —
// bilinçli tasarım kararı, bkz. docs/TASARIM-SISTEMI.md.
//
// variant, page_sections'tan (bkz. lib/sections/registry.ts) gelen bir
// override — verilmezse "icon" varsayılanı kullanılır. Diğer bölümlerle
// (Hero, Referanslar, SSS) aynı prop adı — generic composer'ın (PageSections)
// tek tip arayüzle çalışabilmesi için.
export async function ServicesSection({
  variant,
}: {
  variant?: string | null;
} = {}) {
  const services = await getServices();

  if (services.length === 0) {
    return null;
  }

  const cardVariant: ServiceCardVariant = variant === "image" ? "image" : "icon";
  const ServiceCard = SERVICE_CARD_VARIANTS[cardVariant];

  return (
    <section id="hizmetler" className="bg-surface py-16 sm:py-24">
      <Container>
        <SectionHeader title="Hizmetlerimiz" headingLevel="h2" />
        {/* items-stretch (grid varsayılanı) + kartlardaki h-full — açıklama
            uzunlukları farklı olsa bile kartlar aynı yükseklikte kalıyor,
            satır içinde kırık bir taban çizgisi oluşmuyor. */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
