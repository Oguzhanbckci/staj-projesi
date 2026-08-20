import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
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
    // `items-center` -> `items-end`: metin dikey ortada değil, altta.
    // `80vh` -> `85svh`: (a) daha yüksek, ilk ekranı gerçekten dolduruyor;
    // (b) `svh` mobilde `vh`'nin tarayıcı çubuğunu da sayıp içeriği kesme
    // sorununu çözer. Tam 100 değil 85 — bir sonraki bölümün üst kenarı
    // görünsün ve "aşağıda devamı var" sinyali kendiliğinden çıksın diye.
    <section
      id="hero"
      className="relative flex min-h-[85svh] items-end overflow-hidden bg-hero"
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
      {/* Düz `bg-black/40` yerine ALTA DOĞRU KOYULAŞAN degrade (2026-08-20).
          Metin artık sol-altta olduğu için kontrasta asıl orada ihtiyaç var.
          ÜST değer bilerek %45 — yani eski düz %40'tan DAHA KOYU, daha açık
          değil: Navbar hero üzerinde `bg-transparent` duruyor ve metni
          tema rengiyle (`text-text`) yazılıyor, üstü açmak onu okunmaz
          yapardı. Bu haliyle hem başlık hem navbar eskisinden iyi durumda. */}
      {/* SADECE gerçek fotoğraf varken: fotoğrafın parlaklığı öngörülemez,
          metnin okunabilirliğini garanti eden tek şey bu katman. Fotoğraf
          YOKKEN uygulanmıyor — `bg-hero` (#1e4278) zaten kontrollü, koyu bir
          yüzey ve beyaz metinle ~10:1 kontrast veriyor; üstüne %80 siyah
          koymak dekoratif degrade/ızgara desenini gereksiz yere
          çamurlaştırırdı. */}
      {imageUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/45"
        />
      )}

      {/* Metin `Container` içinde — yani sol kenarı sayfadaki DİĞER TÜM
          bölümlerle aynı hizada. Önceden `mx-auto max-w-3xl` ile ORTALANMIŞ
          ve başka bir genişlikteydi; sayfanın geri kalanıyla hiçbir hizası
          yoktu. İncelenen 93 sitede hâkim düzen kenara yaslı kompozisyon. */}
      <Container className="relative z-10 w-full pb-20 pt-32 sm:pb-28">
        <div className="max-w-3xl animate-fade-in-up text-white motion-reduce:animate-none">
          <h1 className="text-display font-semibold tracking-tight text-balance">{title}</h1>
          {subtitle && (
            <p className="mt-6 max-w-xl text-h6 font-normal text-white/85">{subtitle}</p>
          )}

          {(ctaText || secondaryCtaText) && (
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              {ctaText && ctaLink && (
                <LinkButton
                  href={ctaLink}
                  size="lg"
                  className="shadow-lg transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
                >
                  {ctaText}
                </LinkButton>
              )}
              {/* İKİNCİ CTA ARTIK BUTON DEĞİL, ALT ÇİZGİLİ METİN BAĞLANTISI.
                  Derinlemesine incelenen 13 sitenin HİÇBİRİNDE yan yana iki
                  eşit ağırlıklı dolu buton yoktu; CTA sayısı 0 ya da 1'di.
                  İkisini eşit ağırlıkta göstermek ziyaretçiye hangisinin
                  asıl eylem olduğunu söylemiyor. Bağlantı olarak kalması
                  ikincil yolu kaybetmeden birincil eylemi öne çıkarıyor.
                  Odak halkası beyaz — koyu fotoğraf üzerinde marka rengi
                  yeterince ayrışmayabilir. */}
              {secondaryCtaText && secondaryCtaLink && (
                <a
                  href={secondaryCtaLink}
                  className="group inline-flex items-center gap-2 text-base font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                >
                  {secondaryCtaText}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                  />
                </a>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
