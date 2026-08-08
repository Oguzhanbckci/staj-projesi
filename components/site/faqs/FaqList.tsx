import { FaqAccordionItem } from "./FaqAccordionItem";
import type { FaqItem } from "./types";

// İki varyant arasındaki fark salt bir CSS düzeni (native `columns`,
// öğeleri JS'le bölmeye gerek yok) — bu yüzden Hero/Hizmetler/Projeler'in
// aksine ayrı bir registry.ts açılmadı; tek dosya + tek prop yeterli
// (bkz. docs/TASARIM-SISTEMI.md madde 9.8, "aşırı soyutlama yapma").
export function FaqList({ items, columns = 1 }: { items: FaqItem[]; columns?: 1 | 2 }) {
  return (
    <div className={columns === 2 ? "columns-1 gap-x-10 md:columns-2" : ""}>
      {items.map((item) => (
        <FaqAccordionItem key={item.id} item={item} />
      ))}
    </div>
  );
}
