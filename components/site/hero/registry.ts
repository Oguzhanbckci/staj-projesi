import type { ComponentType } from "react";
import type { HeroSectionData, HeroVariant } from "./types";
import { HeroVariantA } from "./HeroVariantA";
import { HeroVariantB } from "./HeroVariantB";

// Yeni bir varyant eklemek: (1) HeroVariantX.tsx dosyasını yaz, (2) burada
// tek satır ekle, (3) types.ts'teki HeroVariant union'ına ekle. 2. ve 3.
// adımlardan biri unutulursa TypeScript bu Record'un eksik/fazla anahtarı
// olduğunu derleme zamanında yakalar — çalışma zamanı if/else'e gerek yok.
export const HERO_VARIANTS: Record<HeroVariant, ComponentType<HeroSectionData>> = {
  a: HeroVariantA,
  b: HeroVariantB,
};
