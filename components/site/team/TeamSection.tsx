import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getTeamMembers } from "@/lib/supabase/queries";
import { TeamMemberCard } from "./TeamMemberCard";

// Diğer liste bölümleriyle (Hizmetler, Referanslar) aynı ilke: veri burada
// çekiliyor, kayıt yoksa bölüm hiç render edilmez. Tek varyant — ızgara.
//
// `headingLevel` — varsayılan "h2": ana sayfada (page_sections registry
// üzerinden) render edildiğinde Hero zaten kendi <h1>'ini taşıyor. Ama
// `/ekip` (bkz. app/(site)/ekip/page.tsx) bu bölümü Hero OLMADAN, TEK
// BAŞINA bağımsız bir sayfa olarak render ediyor — o zaman çağıran taraf
// "h1" geçirmeli, aksi halde sayfada hiç <h1> olmaz (2026-08-18 dokuzuncu
// oturumda bulunan gerçek bir erişilebilirlik açığıydı, bkz.
// docs/KARAR-GUNLUGU.md).
export async function TeamSection({
  headingLevel = "h2",
}: { headingLevel?: "h1" | "h2" } = {}) {
  const members = await getTeamMembers();
  if (members.length === 0) return null;

  return (
    <section id="ekip" className="bg-surface-raised py-16 sm:py-24">
      <Container>
        <SectionHeader title="Ekibimiz" headingLevel={headingLevel} />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <TeamMemberCard key={member.id} {...member} />
          ))}
        </div>
      </Container>
    </section>
  );
}
