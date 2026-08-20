import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { TeamMember } from "./types";

// "Zeynep Aksoy" -> "ZA". Tek kelimelik isimde tek harf döner. Türkçe
// büyük harf kuralı (i -> İ) için locale açıkça veriliyor.
function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");
}

// 2026-08-19 zenginleştirmesi (bkz. docs/DURUM.md madde 0d):
// Fotoğraf yokken burada BOŞ, tek renk bir daire duruyordu. Kişi
// kartlarında ImagePlaceholder'ın soyut ızgara deseni yanlış olurdu
// (bir insanın yerine teknik çizim koymak) — onun yerine baş harfler,
// TestimonialCard'da kurulan aynı desenle. Ekip fotoğrafı hiç yüklenmemiş
// bir kurulumda bile kart "eksik" değil, kasıtlı görünüyor.
export function TeamMemberCard({ fullName, role, bio, photoPath }: TeamMember) {
  const photoUrl = photoPath ? getPublicImageUrl("team", photoPath) : null;

  return (
    <Card className="group h-full p-6 text-center ring-1 ring-neutral-300/60 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-brand/40 motion-reduce:transform-none motion-reduce:transition-none">
      <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-brand/10 ring-2 ring-brand/20 transition-colors duration-300 group-hover:ring-brand/40 motion-reduce:transition-none">
        {photoUrl ? (
          <Image src={photoUrl} alt={fullName} fill sizes="96px" className="object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-h4 font-bold text-brand"
          >
            {getInitials(fullName)}
          </span>
        )}
      </div>
      <p className="mt-4 text-h6 font-bold text-text">{fullName}</p>
      {/* `text-brand` DEĞİL — 2026-08-20 denetimi: marka rengi 13px metinde
          koyu temada `surface-raised` üzerinde 3.56:1'e düşüyor, WCAG AA
          eşiği 4.5:1. Aynı düzeltme SectionHeader'ın eyebrow'unda da
          yapıldı; bu, o değişikliğin kaçırılmış son yeriydi. Marka rengi
          artık yalnızca (a) etkileşimli öğelerde ve (b) İstatistikler'deki
          61px rakamlar gibi WCAG'in "büyük metin" (3:1) eşiğine giren
          yerlerde kullanılıyor — incelenen 93 sitedeki hâkim kullanım da
          bu. Unvan satırı bölüm etiketleriyle aynı dile geçti: küçük,
          büyük harfli, geniş aralıklı, nötr. */}
      <p className="mt-1 text-caption font-semibold uppercase tracking-[0.14em] text-text-muted">
        {role}
      </p>
      {bio && <p className="mt-3 line-clamp-3 text-base text-text-muted">{bio}</p>}
    </Card>
  );
}
