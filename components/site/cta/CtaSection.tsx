import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { getSiteSettings } from "@/lib/supabase/queries";

// Dikkat çekici, tek mesajlı bölüm — içerik ayarlardan (site_settings)
// geliyor (bkz. supabase/migrations/20260810120000_...). Başlık yoksa
// bölüm hiç render edilmez (diğer bölümlerle aynı ilke). Stats'taki gibi
// bilinçli olarak site temasından bağımsız, sabit marka rengi zemin.
export async function CtaSection() {
  const settings = await getSiteSettings();
  if (!settings?.ctaTitle) return null;

  return (
    <section id="cta" className="relative overflow-hidden bg-brand py-16 text-brand-on sm:py-24">
      {/* Dekoratif doku katmanı. NOT (2026-08-21): burada eskiden
          "İstatistikler bölümüyle aynı, ikisi de marka rengi bandı"
          yazıyordu — o artık DOĞRU DEĞİL. İstatistikler 2026-08-21'de
          marka bandından çıkarıldı; sayfadaki TEK marka rengi çapası
          bu bölüm ve bu bilinçli (bkz. StatsSection'daki gerekçe). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, currentColor, transparent 60%)",
        }}
      />
      <Container className="relative text-center">
        {/* SectionHeader ile aynı kademe (bkz. HEADING_TEXT_CLASS): bu
            başlık panelden serbest metin olarak giriliyor, yani taşma
            riski sabit bölüm başlıklarından daha yüksek. */}
        <h2 className="text-h4 font-bold sm:text-h2">{settings.ctaTitle}</h2>
        {settings.ctaDescription && (
          <p className="mx-auto mt-4 max-w-2xl text-base">{settings.ctaDescription}</p>
        )}
        {settings.ctaButtonText && settings.ctaButtonLink && (
          <LinkButton
            href={settings.ctaButtonLink}
            variant="accent"
            size="lg"
            className="mt-8"
          >
            {settings.ctaButtonText}
          </LinkButton>
        )}
      </Container>
    </section>
  );
}
