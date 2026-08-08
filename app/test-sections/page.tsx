// Geliştirmeye özel doğrulama sayfası — ürünle YAYINLANMAYACAK (bkz.
// app/test-theme, app/test-components aynı geçici desen). Navbar + Hero'nun
// iki varyantını, seçim mekanizmasını (Hero.tsx resolver) kullanarak
// gösterir. Gerçek hero_sections içeriği henüz girilmediği için (migration
// uygulanmadı + platform tenant'ının hero satırı yok) örnek veriyle
// çalışıyor — getHeroSection() gerçek veri döndürmeye başladığında bu
// sayfa değil, gerçek bölüm kompozisyonu (henüz yazılmadı) onu kullanacak.

import { Navbar } from "@/components/site/Navbar";
import type { HeroSectionData } from "@/components/site/hero/types";
import { getHeroSection } from "@/lib/supabase/queries";
import { HeroVariantToggle } from "./HeroVariantToggle";

const NAV_LINKS = [
  { label: "Hizmetler", href: "#hizmetler" },
  { label: "Projeler", href: "#projeler" },
  { label: "Hakkımızda", href: "#hakkimizda" },
];

const EXAMPLE_DATA: Omit<HeroSectionData, "variant"> = {
  title: "Güvenle İnşa Ediyoruz",
  subtitle: "30 yıllık tecrübeyle zamanında ve bütçe disiplini içinde teslim ediyoruz.",
  backgroundImagePath: null,
  ctaText: "Teklif Al",
  ctaLink: "#iletisim",
  secondaryCtaText: "Projelerimiz",
  secondaryCtaLink: "#projeler",
};

export default async function SectionsPreviewPage() {
  const realHero = await getHeroSection();

  return (
    <div className="min-h-full bg-surface text-text">
      <Navbar logoText="Akme İnşaat" links={NAV_LINKS} contactHref="#iletisim" />

      <p className="bg-warning px-6 py-2 text-center text-caption text-white">
        Geçici doğrulama sayfası — yayınlanmayacak. Gerçek DB verisi:{" "}
        {realHero ? "bulundu ✓" : "yok, örnek veri gösteriliyor"}
      </p>

      <HeroVariantToggle data={realHero ?? EXAMPLE_DATA} />

      {/* Navbar'ın kaydırma davranışını test edebilmek için doldurma içerik */}
      <div className="mx-auto max-w-3xl space-y-4 px-6 py-24 text-text-muted">
        <p id="hizmetler">
          Bu alan, sadece Navbar&apos;ın kaydırınca zemin kazandığını test
          edebilmen için doldurma metin — gerçek Hizmetler bölümü değil.
        </p>
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i}>
            Kaydırma testi için doldurma paragraf {i + 1}. Aşağı kaydırdıkça
            üstteki Navbar&apos;ın zemin kazandığını gözlemleyebilirsin.
          </p>
        ))}
      </div>
    </div>
  );
}
