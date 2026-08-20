import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { renderServiceIcon } from "./icons";
import type { ServiceItem } from "./types";

// Görselli büyük varyant — AYNI ServiceItem verisi, sadece düzen farklı
// (bkz. Hero varyant deseniyle aynı ilke). Izgarada, ekranın altında
// (LCP değil) olduğu için Image'da priority YOK — Hero'dan farkı bu.
//
// 2026-08-19: Görsel YOKKEN burası tek renk, bomboş bir kutu render
// ediyordu — üstelik canlıda yayındaki 3 hizmetin 2'sinde görsel yok, yani
// ana sayfada iki boş kutu duruyordu. Artık ImagePlaceholder devreye
// giriyor ve hizmetin KENDİ ikonunu gösteriyor: yer tutucu soyut bir desen
// değil, o hizmete ait gerçek bir işaret taşıyor (ikon zaten her hizmette
// dolu, bkz. services.icon).
//
// Hover davranışı saf CSS (`group`/`group-hover`) — bu bir Server
// Component, JS/state gerekmiyor. `motion-reduce:` varyantlarıyla
// prefers-reduced-motion'a saygı gösteriliyor (projedeki mevcut ilke,
// bkz. FaqAccordionItem/HeroVariantA).
export function ServiceCardImage({ title, description, icon, imagePath }: ServiceItem) {
  const imageUrl = imagePath ? getPublicImageUrl("services", imagePath) : null;

  return (
    <Card className="group h-full ring-1 ring-neutral-300/60 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-brand/40 motion-reduce:transform-none motion-reduce:transition-none">
      <div className="relative aspect-[3/2] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          />
        ) : (
          <ImagePlaceholder icon={renderServiceIcon(icon, "h-14 w-14")} />
        )}
      </div>
      <div className="p-6">
        <h3 className="line-clamp-2 text-h6 font-semibold text-text transition-colors group-hover:text-brand motion-reduce:transition-none">
          {title}
        </h3>
        {description && (
          <p className="mt-2 line-clamp-3 text-base text-text-muted">{description}</p>
        )}
      </div>
    </Card>
  );
}
