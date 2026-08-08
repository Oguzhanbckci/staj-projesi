"use client";

import { useId, useState } from "react";
import type { FaqItem } from "./types";

// Klavyeyle tam kullanılabilir (gerçek <button>, Tab/Enter/Space native
// çalışır). aria-expanded açık/kapalı durumu ekran okuyucuya bildirir;
// panel, butonun aria-controls'üyle id üzerinden ilişkilendirilir. Her
// öğe kendi state'ini tutar — "diğerlerini kapat" mantığı yok, birden
// fazla panel aynı anda açık kalabilir. Genişleme animasyonu
// grid-template-rows fr-birimi tekniğiyle (JS yükseklik ölçümü gerekmez);
// motion-reduce: varyantı prefers-reduced-motion'a saygı gösterir. Hazır
// bir kütüphane kullanılmadı, sade React.
export function FaqAccordionItem({
  item,
  headingLevel: Heading = "h3",
}: {
  item: FaqItem;
  headingLevel?: "h2" | "h3" | "h4";
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="break-inside-avoid border-b border-neutral-300 py-4">
      <Heading className="text-h6 font-semibold">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 text-left text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {item.question}
          <span
            aria-hidden="true"
            className={`shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
      </Heading>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="pt-3 text-base text-text-muted">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}
