import { FaqAccordionItem } from "./FaqAccordionItem";
import type { FaqItem } from "./types";

// İki varyant arasındaki fark salt bir CSS düzeni — bu yüzden Hero/
// Hizmetler/Projeler'in aksine ayrı bir registry.ts açılmadı; tek dosya +
// tek prop yeterli (bkz. docs/TASARIM-SISTEMI.md madde 9.8, "aşırı
// soyutlama yapma").
//
// 2026-08-19: `columns-2` (native CSS çok-sütun) yerine `grid-cols-2`.
// Kullanıcı bulgusu: "sütunların başlangıç hizası aynı ama bitiş hizaları
// çok farklı, dengesiz duruyor." Sebep, iki tekniğin farklı çalışması:
//
// - `columns` içeriği gazete gibi SOLDAN AŞAĞI akıtıp sağa sarar ve
//   sütunları yükseklik olarak dengelemeye ÇALIŞIR — ama öğeler
//   bölünemediğinde (break-inside-avoid) bu denge kabaca tutar, tek bir
//   uzun cevap bir sütunu diğerinden belirgin uzun bırakır.
// - `grid` öğeleri SATIR SATIR dizer; aynı satırdaki hücreler varsayılan
//   olarak (align-items: stretch) birbirinin yüksekliğine uzar, böylece
//   alt kenarlıklar hizalanır.
//
// Bilinçli ödünleşim: okuma sırası sütun-boyu (1,2 solda / 3,4 sağda)
// yerine satır-boyu (1,2 / 3,4) oldu. DOM sırası değişmedi, yani klavye
// ve ekran okuyucu sırası aynen korunuyor.
export function FaqList({ items, columns = 1 }: { items: FaqItem[]; columns?: 1 | 2 }) {
  return (
    <div className={columns === 2 ? "grid gap-x-10 md:grid-cols-2" : ""}>
      {items.map((item) => (
        <FaqAccordionItem key={item.id} item={item} />
      ))}
    </div>
  );
}
