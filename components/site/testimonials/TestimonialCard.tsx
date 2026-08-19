import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { TestimonialItem } from "./types";

const MAX_RATING = 5;

// Yıldızlar salt görsel — gerçek bilgi sr-only metinde, çünkü tek tek
// yıldız ikonları ekran okuyucuda anlamsız bir gürültü olurdu.
//
// KESİRLİ PUAN DESTEĞİ (2026-08-19, kullanıcı isteği): her yıldık kendi
// doluluk oranını (0..1) alıyor, yani 4.5 → 4 tam + 1 yarım. Teknik:
// altta soluk bir yıldız, üstünde `overflow-hidden` bir kutu içinde dolu
// yıldız; kutunun GENİŞLİĞİ doluluk oranı kadar. Bu, ikonu kırpar —
// ikonu iki ayrı "yarım yıldız" varlığına bölmeye ya da ekstra bir
// kütüphaneye gerek kalmaz ve 4.3 gibi herhangi bir orana da çalışır.
function renderRating(rating: number) {
  return (
    <p className="flex items-center gap-0.5">
      <span className="sr-only">
        {`${MAX_RATING} üzerinden ${rating.toLocaleString("tr-TR")} puan`}
      </span>
      {Array.from({ length: MAX_RATING }, (_, i) => {
        // i'inci yıldızın doluluk oranı: 4.5 puanda 5. yıldız için 0.5.
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <span key={i} aria-hidden="true" className="relative inline-flex h-4 w-4 shrink-0">
            <Star className="absolute inset-0 h-4 w-4 text-neutral-300" />
            {fill > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="h-4 w-4 shrink-0 fill-warning text-warning" />
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}

// Hem ızgara hem "tek büyük alıntı" varyantında kullanılan TEK kart —
// `large` sadece tipografi/hizalamayı büyütüyor.
//
// 2026-08-19 zenginleştirmesi (bkz. docs/DURUM.md madde 0d):
// - `rating` ARTIK GÖSTERİLİYOR. Kolon 2026-08-07'den beri vardı ve seed
//   verisinde doluydu, ama getTestimonials() onu hiç SEÇMİYORDU — yani
//   veri ziyaretçiye hiç ulaşmıyordu. Projeler'deki `category` ile aynı
//   sınıf kayıp; referans bölümünde puan en güçlü güven unsurlarından biri.
// - Logo yoksa kart "isimsiz" başlıyordu; artık yazarın baş harfi marka
//   renkli yuvarlak bir rozette (avatar yerine geçen, veri gerektirmeyen
//   bir işaret).
// - Dekoratif tırnak ikonu, alıntının bir alıntı olduğunu tipografik
//   tırnaklardan daha güçlü anlatıyor.
export function TestimonialCard({ item, large = false }: { item: TestimonialItem; large?: boolean }) {
  const logoUrl = item.logoPath ? getPublicImageUrl("testimonials", item.logoPath) : null;
  const initial = item.authorName.trim().charAt(0).toLocaleUpperCase("tr-TR");

  return (
    <Card
      className={`relative flex h-full flex-col p-6 ring-1 ring-neutral-300/60 transition duration-300 hover:shadow-lg hover:ring-brand/40 motion-reduce:transition-none ${
        large ? "items-center text-center" : ""
      }`}
    >
      {/* Dekoratif tırnak — metnin arkasında, düşük opaklıkta. */}
      <Quote
        aria-hidden="true"
        className="absolute right-5 top-5 h-8 w-8 text-brand opacity-10"
      />

      {logoUrl && (
        <div className={`relative mb-4 h-8 w-24 ${large ? "" : "self-start"}`}>
          <Image src={logoUrl} alt="" fill sizes="96px" className="object-contain" />
        </div>
      )}

      {item.rating !== null && (
        <div className={`mb-3 ${large ? "" : "self-start"}`}>{renderRating(item.rating)}</div>
      )}

      <p className={`relative flex-1 text-text ${large ? "text-h5" : "text-base"}`}>
        &ldquo;{item.quote}&rdquo;
      </p>

      <div className={`mt-4 flex items-center gap-3 ${large ? "flex-col gap-2" : ""}`}>
        {!logoUrl && (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-h6 font-bold text-brand"
          >
            {initial}
          </span>
        )}
        <div className={large ? "text-center" : ""}>
          <p className="font-semibold text-text">{item.authorName}</p>
          {item.authorTitle && <p className="text-caption text-text-muted">{item.authorTitle}</p>}
        </div>
      </div>
    </Card>
  );
}
