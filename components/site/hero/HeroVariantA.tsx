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
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-hero"
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
      ) : (
        // Gerçek bir fotoğraf yokken bölümün "boş" görünmemesi için
        // dekoratif degrade + ince ızgara deseni (bir inşaat/plan çizimine
        // hafif gönderme) — backgroundImagePath dolunca bu katman hiç
        // render edilmez, ikisi asla üst üste binmez.
        <div aria-hidden="true" className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.14), transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.1), transparent 45%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-3xl animate-fade-in-up px-6 text-center text-white motion-reduce:animate-none">
        <h1 className="text-h1 font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-4 text-h6 font-normal text-white/85">{subtitle}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {ctaText && ctaLink && (
            <LinkButton
              href={ctaLink}
              size="lg"
              className="shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {ctaText}
            </LinkButton>
          )}
          {secondaryCtaText && secondaryCtaLink && (
            <LinkButton
              href={secondaryCtaLink}
              variant="secondary"
              size="lg"
              className="border-white/30 bg-white/10 text-white transition-transform hover:-translate-y-0.5 hover:bg-white/20"
            >
              {secondaryCtaText}
            </LinkButton>
          )}
        </div>
      </div>

      {/* Alt kenar — düz bir kesim yerine ince bir dalga, AboutSection'ın
          zemin rengine (bg-surface-raised) yumuşak geçiş. Salt dekoratif. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-10 w-full text-surface-raised"
      >
        <path
          d="M0,32 C240,64 480,0 720,16 C960,32 1200,64 1440,32 L1440,60 L0,60 Z"
          fill="currentColor"
        />
      </svg>
    </section>
  );
}
