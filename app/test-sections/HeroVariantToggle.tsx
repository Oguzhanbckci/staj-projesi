"use client";

// Sadece bu geçici doğrulama sayfasına özel — components/site/hero/ tamamen
// Server Component kalıyor (bkz. Hero.tsx), sadece "hangi varyantı
// görüyorum" demo anahtarı client tarafında. Aynı zamanda seçim
// mekanizmasının (Hero.tsx resolver) çalışma anında da doğru
// çalıştığını kanıtlıyor — variant prop'u değiştikçe registry'den
// farklı bileşen render ediliyor.

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Hero } from "@/components/site/hero/Hero";
import type { HeroSectionData, HeroVariant } from "@/components/site/hero/types";

export function HeroVariantToggle({
  data,
}: {
  data: Omit<HeroSectionData, "variant">;
}) {
  const [variant, setVariant] = useState<HeroVariant>("a");

  return (
    <div>
      <div className="flex justify-center gap-3 border-b border-neutral-300 py-3">
        <Button
          size="sm"
          variant={variant === "a" ? "primary" : "secondary"}
          onClick={() => setVariant("a")}
        >
          Varyant A
        </Button>
        <Button
          size="sm"
          variant={variant === "b" ? "primary" : "secondary"}
          onClick={() => setVariant("b")}
        >
          Varyant B
        </Button>
      </div>
      <Hero variant={variant} {...data} />
    </div>
  );
}
