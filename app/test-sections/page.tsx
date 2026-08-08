// Geliştirmeye özel doğrulama sayfası — ürünle YAYINLANMAYACAK (bkz.
// app/test-theme, app/test-components aynı geçici desen). Navbar + Hero +
// gerçek Hizmetler/Hakkımızda bölümlerini (gerçek DB verisiyle) ve bir
// taşma (overflow) testi senaryosunu bir arada gösterir.

import { Navbar } from "@/components/site/Navbar";
import type { HeroSectionData } from "@/components/site/hero/types";
import { getHeroSection } from "@/lib/supabase/queries";
import { HeroVariantToggle } from "./HeroVariantToggle";
import { ServicesSection } from "@/components/site/services/ServicesSection";
import { ServiceCardIcon } from "@/components/site/services/ServiceCardIcon";
import { ServiceCardImage } from "@/components/site/services/ServiceCardImage";
import { AboutSection } from "@/components/site/about/AboutSection";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

const NAV_LINKS = [
  { label: "Hizmetler", href: "#hizmetler" },
  { label: "Hakkımızda", href: "#hakkimizda" },
];

const EXAMPLE_HERO_DATA: Omit<HeroSectionData, "variant"> = {
  title: "Güvenle İnşa Ediyoruz",
  subtitle: "30 yıllık tecrübeyle zamanında ve bütçe disiplini içinde teslim ediyoruz.",
  backgroundImagePath: null,
  ctaText: "Teklif Al",
  ctaLink: "#iletisim",
  secondaryCtaText: "Projelerimiz",
  secondaryCtaLink: "#projeler",
};

// Kasıtlı olarak çok uzun başlık/açıklama — kartların bozulmadığını
// (line-clamp devrede) doğrulamak için, bkz. sohbet geçmişi "taşma testi".
const OVERFLOW_TEST_ITEM = {
  id: "overflow-test",
  title:
    "Bu çok ama çok uzun bir hizmet başlığı — normalde iki satırdan uzun olmaması gerekiyor, üçüncü satıra taşmamalı ve kart yüksekliğini bozmamalı",
  description:
    "Bu açıklama metni de bilerek çok uzun tutuldu — amaç, kartın gerçek dünyada karşılaşabileceği en kötü senaryoyu (kullanıcının panelden aşırı uzun bir metin girmesi) simüle etmek. Üç satırdan sonra kesilip üç nokta ile devam etmeli, kart ızgarada komşu kartlarla aynı hizada kalmalı, hiçbir taşma/kaydırma oluşmamalı.",
  icon: "hammer",
  imagePath: null,
};

export default async function SectionsPreviewPage() {
  const realHero = await getHeroSection();

  return (
    <div className="min-h-full bg-surface text-text">
      <Navbar logoText="Akme İnşaat" links={NAV_LINKS} contactHref="#iletisim" />

      <p className="bg-warning px-6 py-2 text-center text-caption text-white">
        Geçici doğrulama sayfası — yayınlanmayacak. Gerçek Hero verisi:{" "}
        {realHero ? "bulundu ✓" : "yok, örnek veri gösteriliyor"}
      </p>

      <HeroVariantToggle data={realHero ?? EXAMPLE_HERO_DATA} />

      {/* Gerçek bölümler — kendi verilerini kendileri çeker, kayıt yoksa
          kendileri null döner (bkz. ServicesSection/AboutSection). */}
      <ServicesSection cardVariant="icon" />
      <AboutSection />

      <section className="bg-surface-raised py-16">
        <Container>
          <SectionHeader
            eyebrow="Taşma testi"
            title="Çok Uzun Başlık/Açıklama Senaryosu"
            description="Aşağıdaki iki kart, aynı aşırı-uzun veriyle her iki varyantı da gösteriyor — line-clamp sayesinde kart bozulmuyor."
            headingLevel="h3"
          />
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCardIcon {...OVERFLOW_TEST_ITEM} />
            <ServiceCardImage {...OVERFLOW_TEST_ITEM} />
          </div>
        </Container>
      </section>

      {/* Navbar'ın kaydırma davranışını test edebilmek için doldurma içerik */}
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-24 text-text-muted">
        {Array.from({ length: 10 }).map((_, i) => (
          <p key={i}>
            Kaydırma testi için doldurma paragraf {i + 1}. Aşağı kaydırdıkça
            üstteki Navbar&apos;ın zemin kazandığını gözlemleyebilirsin.
          </p>
        ))}
      </div>
    </div>
  );
}
