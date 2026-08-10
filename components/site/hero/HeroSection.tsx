import { getHeroSection } from "@/lib/supabase/queries";
import { Hero } from "./Hero";
import type { HeroVariant } from "./types";

function isHeroVariant(value: string | null | undefined): value is HeroVariant {
  return value === "a" || value === "b";
}

// Diğer bölümlerle (ServicesSection, AboutSection...) aynı desen — kendi
// verisini kendi çeker, kayıt yoksa null döner. `variant`, page_sections'tan
// (bkz. lib/sections/registry.ts) gelen bir override — verilmezse
// hero_sections.variant (DB'deki kayıtlı varyant) kullanılır.
export async function HeroSection({ variant }: { variant?: string | null } = {}) {
  const data = await getHeroSection();
  if (!data) return null;

  return <Hero {...data} variant={isHeroVariant(variant) ? variant : data.variant} />;
}
