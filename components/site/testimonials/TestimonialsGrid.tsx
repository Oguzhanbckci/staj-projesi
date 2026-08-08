import { TestimonialCard } from "./TestimonialCard";
import type { TestimonialItem } from "./types";

// Mobilde yatay kaydırmalı (scroll-snap), masaüstünde ızgara — tek bir
// CSS düzeni, ek JS gerekmez.
export function TestimonialsGrid({ items }: { items: TestimonialItem[] }) {
  return (
    <div className="flex snap-x gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="w-[85vw] shrink-0 snap-start sm:w-auto">
          <TestimonialCard item={item} />
        </div>
      ))}
    </div>
  );
}
