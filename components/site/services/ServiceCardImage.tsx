import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ServiceItem } from "./types";

// Görselli büyük varyant — AYNI ServiceItem verisi, sadece düzen farklı
// (bkz. Hero varyant deseniyle aynı ilke). Izgarada, ekranın altında
// (LCP değil) olduğu için Image'da priority YOK — Hero'dan farkı bu.
export function ServiceCardImage({ title, description, imagePath }: ServiceItem) {
  const imageUrl = imagePath ? getPublicImageUrl("services", imagePath) : null;

  return (
    <Card>
      <div className="relative aspect-video bg-neutral-300">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="line-clamp-2 text-h6 font-semibold text-text">{title}</h3>
        {description && (
          <p className="mt-2 line-clamp-3 text-base text-text-muted">{description}</p>
        )}
      </div>
    </Card>
  );
}
