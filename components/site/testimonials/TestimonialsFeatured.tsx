"use client";

import { useState } from "react";
import { TestimonialCard } from "./TestimonialCard";
import type { TestimonialItem } from "./types";

// "Tek büyük alıntı" — bir seferde tek referans, ok butonlarıyla
// diğerlerine geçilir (veri kaybolmasın diye, sadece ilkini göstermek
// yerine). Ok butonları gerçek <button>, klavye/odak halkası desteği var.
export function TestimonialsFeatured({ items }: { items: TestimonialItem[] }) {
  const [index, setIndex] = useState(0);
  const item = items[index];

  return (
    <div className="mx-auto max-w-2xl">
      <TestimonialCard item={item} large />
      {items.length > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
            aria-label="Önceki referans"
            className="rounded-full border border-neutral-300 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % items.length)}
            aria-label="Sonraki referans"
            className="rounded-full border border-neutral-300 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
