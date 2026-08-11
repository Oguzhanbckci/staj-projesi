import type { ReactNode } from "react";
import type { SectionKey } from "@/lib/sections/config";

// Gerçek görsel dosyası/yeni bağımlılık YOK — küçük, dekoratif, inline
// SVG şemalar (KISITLAR: "küçük bir görsel veya şema"). aria-hidden —
// yanındaki etiket (VariantPicker'daki `label`) zaten anlamı taşıyor.
function Box({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 40" className="h-10 w-16 shrink-0" aria-hidden="true">
      {children}
    </svg>
  );
}

const DIAGRAMS: Record<string, ReactNode> = {
  "hero:a": (
    <Box>
      <rect x="2" y="2" width="60" height="36" rx="2" className="fill-neutral-200" />
      <rect x="20" y="16" width="24" height="4" className="fill-neutral-400" />
      <rect x="24" y="24" width="16" height="3" className="fill-neutral-400" />
    </Box>
  ),
  "hero:b": (
    <Box>
      <rect x="2" y="2" width="28" height="36" rx="2" className="fill-neutral-100 stroke-neutral-400" />
      <rect x="34" y="2" width="28" height="36" rx="2" className="fill-neutral-300" />
    </Box>
  ),
  "services:icon": (
    <Box>
      {[2, 24, 46].map((x) => (
        <g key={x}>
          <rect x={x} y="2" width="16" height="16" rx="2" className="fill-neutral-100 stroke-neutral-400" />
          <circle cx={x + 8} cy="10" r="3" className="fill-neutral-400" />
        </g>
      ))}
    </Box>
  ),
  "services:image": (
    <Box>
      {[2, 24, 46].map((x) => (
        <g key={x}>
          <rect x={x} y="2" width="16" height="10" className="fill-neutral-400" />
          <rect x={x} y="14" width="16" height="4" className="fill-neutral-200" />
        </g>
      ))}
    </Box>
  ),
  "projects:grid": (
    <Box>
      {[
        [2, 2],
        [24, 2],
        [46, 2],
        [2, 22],
        [24, 22],
        [46, 22],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="16" height="16" className="fill-neutral-300" />
      ))}
    </Box>
  ),
  "projects:mosaic": (
    <Box>
      <rect x="2" y="2" width="34" height="36" className="fill-neutral-400" />
      <rect x="40" y="2" width="22" height="16" className="fill-neutral-200" />
      <rect x="40" y="22" width="22" height="16" className="fill-neutral-200" />
    </Box>
  ),
  "testimonials:grid": (
    <Box>
      {[2, 24, 46].map((x) => (
        <rect key={x} x={x} y="8" width="16" height="24" rx="2" className="fill-neutral-200 stroke-neutral-400" />
      ))}
    </Box>
  ),
  "testimonials:featured": (
    <Box>
      <rect x="14" y="6" width="36" height="28" rx="2" className="fill-neutral-300" />
      <path d="M4 20 l6 -5 v10 z" className="fill-neutral-400" />
      <path d="M60 20 l-6 -5 v10 z" className="fill-neutral-400" />
    </Box>
  ),
  "faq:single": (
    <Box>
      {[4, 14, 24, 34].map((y) => (
        <rect key={y} x="4" y={y} width="56" height="6" rx="1" className="fill-neutral-200" />
      ))}
    </Box>
  ),
  "faq:two-column": (
    <Box>
      {[4, 14, 24, 34].map((y) => (
        <g key={y}>
          <rect x="4" y={y} width="26" height="6" rx="1" className="fill-neutral-200" />
          <rect x="34" y={y} width="26" height="6" rx="1" className="fill-neutral-200" />
        </g>
      ))}
    </Box>
  ),
};

// Bir kombinasyona ait çizim yoksa (ör. ileride yeni bir varyant eklenip
// şeması unutulursa) sessizce genel bir yer tutucu gösterir — panelin de
// "asla çökmez" ilkesiyle tutarlı.
export function VariantDiagram({
  sectionKey,
  variantKey,
}: {
  sectionKey: SectionKey;
  variantKey: string;
}) {
  return (
    DIAGRAMS[`${sectionKey}:${variantKey}`] ?? (
      <Box>
        <rect x="2" y="2" width="60" height="36" rx="2" className="fill-neutral-100 stroke-neutral-300" />
      </Box>
    )
  );
}
