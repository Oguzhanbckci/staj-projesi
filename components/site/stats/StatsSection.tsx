import { Container } from "@/components/ui/Container";
import { getStats } from "@/lib/supabase/queries";
import type { StatItem } from "./types";

// Sayılar Türkçe biçimde (binlik ayraç ".") — Intl.NumberFormat("tr-TR").
// Etkileşim yok, tamamen Server Component.
function formatStat(stat: StatItem): string {
  return `${new Intl.NumberFormat("tr-TR").format(stat.value)}${stat.suffix ?? ""}`;
}

export async function StatsSection() {
  const stats = await getStats();
  if (stats.length === 0) return null;

  return (
    <section className="bg-brand py-12 text-brand-on">
      <Container>
        <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id}>
              <p className="text-h2 font-bold">{formatStat(stat)}</p>
              <p className="mt-1 text-caption">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
