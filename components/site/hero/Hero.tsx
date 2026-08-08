import { HERO_VARIANTS } from "./registry";
import type { HeroSectionData } from "./types";

// Varyant seçimi TEK burada çözülüyor — başka hiçbir yerde tekrar if/else
// yok (bkz. docs/TASARIM-SISTEMI.md madde 9). Veri akışı: hero_sections.
// variant (DB) -> lib/supabase/queries.ts -> bu bileşen -> registry'den
// doğru varyant bileşeni. DB'de beklenmeyen bir değer varsa (constraint'e
// rağmen) "a"ya düşer, sayfa hiç çökmez.
export function Hero(data: HeroSectionData) {
  const VariantComponent = HERO_VARIANTS[data.variant] ?? HERO_VARIANTS.a;
  return <VariantComponent {...data} />;
}
