import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { HeroSectionData } from "./types";

// Varyant B: iki kolonlu düzen (solda metin, sağda görsel) — AYNI
// HeroSectionData, sadece yerleşim değişiyor (bkz. types.ts). Görsel burada
// metnin yanında ayrı bir öğe (salt dekoratif değil), bu yüzden alt=title
// kullanılıyor — özel bir alt-metin kolonu henüz yok, bilinen bir sınırlama.
export function HeroVariantB({
  title,
  subtitle,
  backgroundImagePath,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
}: HeroSectionData) {
  const imageUrl = backgroundImagePath
    ? getPublicImageUrl("hero", backgroundImagePath)
    : null;

  return (
    <section id="hero" className="bg-surface py-16 sm:py-24">
      {/* Kırılma `sm:` değil `md:`: 640px'de iki kolona geçince sol kolon
          276px'e düşüyor ve başlık mobilden DAHA çok taşıyordu. */}
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
        <div>
          {/* `text-h1` (sabit 61px) DEĞİL `text-display` (clamp): bu token
              tam olarak "dar telefonda uzun Türkçe başlık sıkışıyor"
              gerekçesiyle eklenmişti ama yalnızca HeroVariantA'ya
              işlenmişti. Varyant panelden seçilebildiği için bu ölü kod
              değil; 320px'de başlık kutuyu 31px aşıyordu. */}
          <h1 className="text-display font-bold tracking-tight text-balance text-text">
            {title}
          </h1>
          {subtitle && <p className="mt-4 text-base text-text-muted">{subtitle}</p>}
          <div className="mt-8 flex flex-wrap gap-4">
            {ctaText && ctaLink && (
              <LinkButton href={ctaLink} size="lg">
                {ctaText}
              </LinkButton>
            )}
            {secondaryCtaText && secondaryCtaLink && (
              <LinkButton href={secondaryCtaLink} variant="secondary" size="lg">
                {secondaryCtaText}
              </LinkButton>
            )}
          </div>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
      </div>
    </section>
  );
}
