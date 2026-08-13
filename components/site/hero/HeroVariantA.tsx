import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { HeroSectionData } from "./types";

// Varyant A: tam genişlik arka plan görseli + ortalanmış metin/butonlar.
// Görsel salt dekoratif — başlık/alt başlık aynı anlamı zaten taşıyor,
// bu yüzden alt="" (bkz. WCAG, dekoratif görsellerde boş alt doğru kullanım).
//
// text-white/bg-black burada bilinçli bir istisna: bu bölüm her zaman bir
// fotoğraf + koyu overlay üzerinde durur, site temasından (açık/koyu)
// bağımsızdır — token'lı text-text/text-text-muted kullanmak, tema açık
// olduğunda okunmaz hale gelirdi (bkz. TASARIM-SISTEMI.md madde 9.3'ün
// istisnası).
export function HeroVariantA({
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
    <section
      id="hero"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-hero"
    >
      {imageUrl && (
        <Image src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
        <h1 className="text-h1 font-bold">{title}</h1>
        {subtitle && <p className="mt-4 text-h6 font-normal">{subtitle}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
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
    </section>
  );
}
