import { Card } from "@/components/ui/Card";
import { renderServiceIcon } from "./icons";
import type { ServiceItem } from "./types";

// Sade varyant: ikon + başlık + açıklama. line-clamp, çok uzun başlık/
// açıklamanın kart yüksekliğini bozup ızgarayı kaydırmasını engelliyor
// (bkz. sohbet geçmişi, "taşma testi").
//
// 2026-08-19: İkon çıplak duruyordu (kartın sol üstünde tek başına bir
// glif). Artık marka renginin düşük opaklıklı bir zemininde, yuvarlatılmış
// bir kutu içinde — kart bir "yüz" kazanıyor. Hover davranışı
// ServiceCardImage'la BİLEREK aynı (aynı bölümün iki varyantı, ziyaretçi
// için tutarlı hissetmeli). Saf CSS, JS yok.
export function ServiceCardIcon({ title, description, icon }: ServiceItem) {
  return (
    <Card className="group h-full p-6 ring-1 ring-neutral-300/60 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-brand/40 motion-reduce:transform-none motion-reduce:transition-none">
      <span className="inline-flex rounded-lg bg-brand/10 p-3 text-brand transition-colors duration-300 group-hover:bg-brand/20 motion-reduce:transition-none">
        {renderServiceIcon(icon, "h-7 w-7")}
      </span>
      <h3 className="mt-4 line-clamp-2 text-h6 font-semibold text-text transition-colors group-hover:text-brand motion-reduce:transition-none">
        {title}
      </h3>
      {description && (
        <p className="mt-2 line-clamp-3 text-base text-text-muted">{description}</p>
      )}
    </Card>
  );
}
