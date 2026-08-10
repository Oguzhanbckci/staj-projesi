import type { ReactNode } from "react";
import type { SectionKey } from "./config";
import { HeroSection } from "@/components/site/hero/HeroSection";
import { AboutSection } from "@/components/site/about/AboutSection";
import { ServicesSection } from "@/components/site/services/ServicesSection";
import { ProjectsSection } from "@/components/site/projects/ProjectsSection";
import { TestimonialsSection } from "@/components/site/testimonials/TestimonialsSection";
import { StatsSection } from "@/components/site/stats/StatsSection";
import { FaqsSection } from "@/components/site/faqs/FaqsSection";
import { TeamSection } from "@/components/site/team/TeamSection";
import { CtaSection } from "@/components/site/cta/CtaSection";
import { ContactSection } from "@/components/site/contact/ContactSection";
import type { TestimonialsVariant } from "@/components/site/testimonials/types";
import type { FaqVariant } from "@/components/site/faqs/types";

// Hero/Hizmetler/Projeler/Referanslar/SSS registry'leriyle aynı ilke, tek
// katman yukarıda: page_sections.section_key -> doğru Section bileşeni.
// Bir switch (Record<SectionKey, ComponentType> değil) tercih edildi çünkü
// bu bölümlerin bazıları kendi (dar) varyant birleşim tipini kullanıyor
// (TestimonialsVariant, FaqVariant) — burada JSX olarak doğrudan
// çağrıldıkları için (bkz. ServicesSection/TestimonialsSection'ın halihazırda
// projede doğrudan JSX etiketi olarak kullanıldığı yerler) React'in async
// Server Component JSX desteğiyle sorunsuz çalışıyor.
//
// Yeni bir bölüm eklemek 3 adım: (1) lib/supabase/queries.ts'e getXSection()
// sorgu fonksiyonunu yaz, (2) components/site/x/ altında kendi verisini
// kendi çeken Section bileşenini yaz, (3) lib/sections/config.ts'teki
// SECTION_KEYS'e VE buradaki switch'e bir case ekle — biri unutulursa
// aşağıdaki exhaustiveness kontrolü derleme zamanında yakalar.
export function renderSection(sectionKey: SectionKey, variant: string | undefined): ReactNode {
  switch (sectionKey) {
    case "hero":
      return <HeroSection variant={variant} />;
    case "about":
      return <AboutSection />;
    case "services":
      return <ServicesSection variant={variant} />;
    case "projects":
      return <ProjectsSection variant={variant} />;
    case "testimonials":
      return <TestimonialsSection variant={variant as TestimonialsVariant | undefined} />;
    case "stats":
      return <StatsSection />;
    case "faq":
      return <FaqsSection variant={variant as FaqVariant | undefined} />;
    case "team":
      return <TeamSection />;
    case "cta":
      return <CtaSection />;
    case "contact":
      return <ContactSection />;
    default: {
      const exhaustiveCheck: never = sectionKey;
      return exhaustiveCheck;
    }
  }
}
