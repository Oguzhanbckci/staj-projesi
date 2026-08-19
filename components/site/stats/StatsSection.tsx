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
    <section id="istatistikler" className="relative overflow-hidden bg-brand py-12 text-brand-on">
      {/* Dekoratif ızgara — HeroVariantA ve ImagePlaceholder'daki aynı
          "teknik çizim" dili, düz renk bandını kırıyor. currentColor
          (text-brand-on) kullanıyor, yani marka rengi panelden
          değiştirilse bile kontrast ilişkisi bozulmuyor. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <Container className="relative">
        {/* flex + justify-center — SABİT bir grid-cols(4) DEĞİL: kayıt
            sayısı 4'ten az/çok olabilir (ör. Akme'de 3, bkz. seed.sql) ve
            sabit sütun sayısı, kayıt sayısı sütun sayısına tam bölünmediğinde
            grubu sola kaydırıyordu (kullanıcı bulgusu: "sayfa büyüyünce
            yazılar ilerlemiyor" — boş kalan sütun(lar) yüzünden). flex-wrap,
            öğe sayısından ve ekran genişliğinden BAĞIMSIZ olarak her zaman
            grubu ortalar, dar ekranda satır satır sarar. */}
        <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 text-center sm:gap-x-24 lg:gap-x-32">
          {stats.map((stat) => (
            <div key={stat.id} className="min-w-32">
              <p className="text-h2 font-bold">{formatStat(stat)}</p>
              <p className="mt-2 text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
