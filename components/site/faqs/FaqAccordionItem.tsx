"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
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
    // `flex h-full flex-col` — iki sütunlu varyantta bu öğe bir grid
    // hücresi oluyor ve hücre, satırdaki en uzun kardeşinin yüksekliğine
    // uzuyor. Bu sarmalayıcı da o yüksekliği doldurmazsa alt kenarlık
    // içeriğin hemen altında kalır ve sütunlar yine hizasız görünürdü;
    // doldurunca kenarlık hücrenin DİBİNE oturuyor, satır boyunca hizalı.
    // (`break-inside-avoid` kaldırıldı — o bir çok-sütun özelliğiydi,
    // grid'e geçince işlevsiz kaldı, bkz. FaqList.tsx.)
    <div className="flex h-full flex-col border-b border-neutral-300 py-4">
      <Heading className="text-h6 font-semibold">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className="group flex w-full items-center justify-between gap-4 text-left text-text transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
        >
          {item.question}
          {/* 2026-08-19: düz "▾" metin karakteriyken gerçek bir ikona
              çevrildi — karakterin görünümü fonttan fonta değişiyordu ve
              projenin geri kalanı (lucide-react) zaten ikon kullanıyor.
              Marka renkli daire, kapalı durumda da tıklanabilirliği belli
              ediyor. */}
          <span
            aria-hidden="true"
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform duration-200 group-hover:bg-brand/20 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          >
            <ChevronDown className="h-4 w-4" />
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
