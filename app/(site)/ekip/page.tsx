import type { Metadata } from "next";
import { TeamSection } from "@/components/site/team/TeamSection";
import { getSiteSettings } from "@/lib/supabase/queries";

// Ekip artık ana sayfanın bir bölümü değil, ayrı bir sayfa (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-13 — kullanıcı tek sayfanın karmaşık
// hissettirdiğini belirtti). Bileşenin kendisi (TeamSection) değişmedi,
// sadece nerede render edildiği değişti — kendi verisini kendi çekmeye
// devam ediyor.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const tenantName = settings?.tenantName ?? "Firma";
  return { title: `Ekibimiz | ${tenantName}` };
}

export default function EkipPage() {
  return <TeamSection />;
}
