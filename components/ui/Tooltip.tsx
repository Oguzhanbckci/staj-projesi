import type { ReactNode } from "react";

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
}

const SIDE_CLASSES: Record<"top" | "bottom", string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
};

// Salt CSS tooltip — group-hover/group-focus-within ile, hiç istemci JS'i
// gerekmiyor, Server Component olarak kalabiliyor. Ekran okuyucu için ayrı
// bir aria-describedby bağı KURULMUYOR (bilinçli): çağıran taraf zaten
// ikon-sadece butonlarda kendi aria-label'ını taşımak zorunda (bkz.
// TASARIM-SISTEMI.md "Bileşen API Kuralları"), bu etiket görsel/fare+
// klavye kullanıcıları için ek bir katman — native `title` özniteliğiyle
// aynı ilke, sadece stillendirilmiş hâli.
export function Tooltip({ label, children, side = "top" }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-20 whitespace-nowrap rounded-md border border-control bg-neutral-900 px-2.5 py-1.5 text-caption font-medium text-neutral-50 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none ${SIDE_CLASSES[side]}`}
      >
        {label}
      </span>
    </span>
  );
}
