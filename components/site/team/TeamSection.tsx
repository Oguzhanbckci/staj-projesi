import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getTeamMembers } from "@/lib/supabase/queries";
import { TeamMemberCard } from "./TeamMemberCard";

// Diğer liste bölümleriyle (Hizmetler, Referanslar) aynı ilke: veri burada
// çekiliyor, kayıt yoksa bölüm hiç render edilmez. Tek varyant — ızgara.
export async function TeamSection() {
  const members = await getTeamMembers();
  if (members.length === 0) return null;

  return (
    <section id="ekip" className="bg-surface-raised py-16 sm:py-24">
      <Container>
        <SectionHeader title="Ekibimiz" headingLevel="h2" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <TeamMemberCard key={member.id} {...member} />
          ))}
        </div>
      </Container>
    </section>
  );
}
