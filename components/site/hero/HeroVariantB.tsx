import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
      {/* `items-center` DEĞİL `items-start`: AboutSection'da "yamuk
          duruyor" geri bildirimiyle düzeltilen kalıbın aynısı — metin
          sütunu uzun, görsel 3:2 ile kısa; ortalanınca görsel uzun
          sütunun ortasında asılı kalıyor ve hiçbir kenarı hizalanmıyor. */}
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 md:grid-cols-2">
        <div>
          {/* `text-h1` (sabit 61px) DEĞİL `text-display` (clamp): bu token
              tam olarak "dar telefonda uzun Türkçe başlık sıkışıyor"
              gerekçesiyle eklenmişti ama yalnızca HeroVariantA'ya
              işlenmişti. Varyant panelden seçilebildiği için bu ölü kod
              değil; 320px'de başlık kutuyu 31px aşıyordu. */}
          {/* `break-words`: clamp'in alt sınırı 320px'de 40px'te
              duruyor ve "Sürdürülebilirlik" gibi uzun tek bir Türkçe
              kelime 288px'lik kullanılabilir genişliğe sığmıyor —
              boşluk olmadığı için satır kırılamıyor ve kelimenin sağı
              KESİLİYOR. Türkçe'de bileşik/uzun kelime yaygın, başlık
              da panelden 120 karaktere kadar serbest. */}
          <h1 className="text-display font-bold tracking-tight text-balance break-words text-text">
            {title}
          </h1>
          {subtitle && <p className="mt-4 text-base text-text-muted">{subtitle}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            {ctaText && ctaLink && (
              <LinkButton href={ctaLink} size="lg">
                {ctaText}
              </LinkButton>
            )}
            {/* İkincil çağrı BUTON DEĞİL, alt çizgili metin bağlantısı —
                HeroVariantA ile aynı hiyerarşi. Gerekçe araştırmadan
                geliyor: incelenen sitelerin hiçbirinde hero'da yan yana
                iki eşit ağırlıklı buton yoktu (bkz.
                docs/RAKIP-ANALIZI.md). A varyantına 2026-08-21'de
                uygulanmış, B'ye taşınmamıştı. Renkler A'dan farklı:
                orada metin fotoğraf üzerinde (beyaz), burada nötr
                bölüm zemininde. */}
            {secondaryCtaText && secondaryCtaLink && (
              <a
                href={secondaryCtaLink}
                className="group inline-flex items-center gap-2 text-base font-semibold text-text underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {secondaryCtaText}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
              </a>
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
