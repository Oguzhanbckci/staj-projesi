import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { TestimonialItem } from "./types";

// Hem ızgara hem "tek büyük alıntı" varyantında kullanılan TEK kart —
// `large` sadece tipografi/hizalamayı büyütüyor.
export function TestimonialCard({ item, large = false }: { item: TestimonialItem; large?: boolean }) {
  const logoUrl = item.logoPath ? getPublicImageUrl("testimonials", item.logoPath) : null;

  return (
    <Card className={`flex h-full flex-col p-6 ${large ? "items-center text-center" : ""}`}>
      {logoUrl && (
        <div className={`relative mb-4 h-8 w-24 ${large ? "" : "self-start"}`}>
          <Image src={logoUrl} alt="" fill sizes="96px" className="object-contain" />
        </div>
      )}
      <p className={`flex-1 text-text ${large ? "text-h5" : "text-base"}`}>&ldquo;{item.quote}&rdquo;</p>
      <div className="mt-4">
        <p className="font-semibold text-text">{item.authorName}</p>
        {item.authorTitle && <p className="text-caption text-text-muted">{item.authorTitle}</p>}
      </div>
    </Card>
  );
}
