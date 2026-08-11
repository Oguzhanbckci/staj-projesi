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
    <section id="cta" className="bg-brand py-16 text-brand-on sm:py-24">
      <Container className="text-center">
        <h2 className="text-h2 font-bold">{settings.ctaTitle}</h2>
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
