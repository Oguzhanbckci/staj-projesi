import { Fragment } from "react";
import { getPageSections } from "@/lib/supabase/queries";
import { renderSection } from "@/lib/sections/registry";

// Sayfanın gövdesini page_sections'a göre dizer. Bilinmeyen bir section_key
// (silinmiş bir bölüm türü, elle yapılmış bir DB düzenlemesi) getPageSections
// içinde isSectionKey ile zaten elenir — bu bileşene hiç ulaşmaz, sayfa
// çökmez (bkz. docs/KARAR-GUNLUGU.md, 2026-08-10). Görünür olmayan bölümler
// de getPageSections tarafından hiç döndürülmediği için, her bölüm kendi
// verisini kendi çektiğinden (bkz. ServicesSection vb.) gizli bir bölümün
// veri sorgusu hiç çalışmaz.
export async function PageSections() {
  const sections = await getPageSections();

  return (
    <>
      {sections.map((section) => (
        <Fragment key={section.id}>
          {renderSection(section.sectionKey, section.variant ?? undefined)}
        </Fragment>
      ))}
    </>
  );
}
