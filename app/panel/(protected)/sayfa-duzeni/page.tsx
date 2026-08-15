import { getPanelPageSections } from "@/lib/supabase/panelQueries";
import { SECTION_DISPLAY_LABELS } from "@/lib/sections/config";
import { LinkButton } from "@/components/ui/LinkButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionRow } from "./SectionRow";
import { RequiredSectionRow } from "./RequiredSectionRow";

export default async function SayfaDuzeniPage() {
  const sections = await getPanelPageSections();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[{ label: "Özet", href: "/panel" }, { label: "Sayfa Düzeni" }]}
            className="mb-2"
          />
          <h1 className="text-h3 font-bold text-text">Sayfa Düzeni</h1>
          <p className="mt-2 text-base text-text-muted">
            Bölümlerin sırasını, görünürlüğünü ve görünüm biçimini buradan yönetin. Her
            değişiklik anında kaydedilir.
          </p>
        </div>
        {/* Aynı origin — panel ve ziyaretçi sitesi aynı uygulama, göreli "/" yeterli. */}
        <LinkButton href="/" target="_blank" rel="noopener noreferrer" variant="secondary">
          Siteyi Önizle
        </LinkButton>
      </div>

      {sections.length === 0 ? (
        <p className="text-base text-text-muted">Bölümler şu anda alınamıyor.</p>
      ) : (
        <div className="space-y-3">
          <RequiredSectionRow
            label="Navbar"
            reason="Bu bölüm her sayfanın en üstünde sabittir, kaldırılamaz veya gizlenemez."
          />
          {sections.map((section, index) => (
            <SectionRow
              key={section.id}
              section={section}
              position={index + 1}
              title={SECTION_DISPLAY_LABELS[section.sectionKey]}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
            />
          ))}
          <RequiredSectionRow
            label="Footer"
            reason="Bu bölüm her sayfanın en altında sabittir; iletişim bilgileri ve sosyal medya bağlantılarını içerir, kaldırılamaz veya gizlenemez."
          />
        </div>
      )}
    </div>
  );
}
