import { Card } from "@/components/ui/Card";
import { renderServiceIcon } from "./icons";
import type { ServiceItem } from "./types";

// Sade varyant: ikon + başlık + açıklama. line-clamp, çok uzun başlık/
// açıklamanın kart yüksekliğini bozup ızgarayı kaydırmasını engelliyor
// (bkz. sohbet geçmişi, "taşma testi").
export function ServiceCardIcon({ title, description, icon }: ServiceItem) {
  return (
    <Card className="p-6">
      {renderServiceIcon(icon, "h-8 w-8 text-brand")}
      <h3 className="mt-4 line-clamp-2 text-h6 font-semibold text-text">{title}</h3>
      {description && (
        <p className="mt-2 line-clamp-3 text-base text-text-muted">{description}</p>
      )}
    </Card>
  );
}
