// Sayfadaki bölümlerin tip güvenli anahtar listesi — page_sections.section_key
// (bkz. supabase/migrations/20260810120000_...) buradaki değerlerle birebir
// eşleşmeli. Yeni bir bölüm eklemek için 3 adım, bkz.
// components/site/README yerine docs/DURUM.md ("Yeni bölüm ekleme" notu).
export const SECTION_KEYS = [
  "hero",
  "about",
  "services",
  "projects",
  "testimonials",
  "stats",
  "faq",
  "team",
  "cta",
  "contact",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

// DB'den gelen serbest bir string'in gerçekten bilinen bir bölüm anahtarı
// olduğunu doğrular — bilinmeyen bir anahtar (silinmiş bir bölüm türü, elle
// yapılmış bir DB düzenlemesi) burada elenir, sayfa hiç çökmez (bkz.
// lib/supabase/queries.ts getPageSections, components/site/PageSections.tsx).
export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}

// Her bölümün sayfa içi çapa (anchor) kimliği — Navbar/Footer linkleri ve
// bölüm bileşenlerinin kendi <section id="..."> değeri bununla eşleşmeli.
export const SECTION_ANCHOR_IDS: Record<SectionKey, string> = {
  hero: "hero",
  about: "hakkimizda",
  services: "hizmetler",
  projects: "projeler",
  testimonials: "referanslar",
  stats: "istatistikler",
  faq: "sss",
  team: "ekip",
  cta: "cta",
  contact: "iletisim",
};

// Navbar/Footer'da bağımsız bir gezinme hedefi olarak gösterilen bölümler.
// hero (zaten sayfanın en üstü), istatistikler ve Eylem Çağrısı (akış
// içinde karşılaşılır, ayrı bir gezinme hedefi değil) bilinçli olarak dışarıda.
export const SECTION_NAV_LABELS: Partial<Record<SectionKey, string>> = {
  about: "Hakkımızda",
  services: "Hizmetler",
  projects: "Projeler",
  testimonials: "Referanslar",
  faq: "SSS",
  team: "Ekip",
  contact: "İletişim",
};

export interface PageSectionRow {
  id: string;
  sectionKey: SectionKey;
  variant: string | null;
}

export interface SectionNavLink {
  label: string;
  href: string;
}

// Navbar ve Footer aynı listeyi aynı sırayla kullanıyor — tek yerde üretilsin.
export function buildSectionNavLinks(sections: PageSectionRow[]): SectionNavLink[] {
  return sections
    .filter((section) => SECTION_NAV_LABELS[section.sectionKey])
    .map((section) => ({
      label: SECTION_NAV_LABELS[section.sectionKey]!,
      href: `#${SECTION_ANCHOR_IDS[section.sectionKey]}`,
    }));
}
