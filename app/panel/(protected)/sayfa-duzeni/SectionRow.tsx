import { Card } from "@/components/ui/Card";
import { ReorderButtons } from "@/components/panel/ReorderButtons";
import { SectionVisibilityToggleButton } from "./SectionVisibilityToggleButton";
import { VariantPicker } from "./VariantPicker";
import { getSectionVariantOptions } from "@/lib/sections/variantOptions";
import { moveSectionOrderAction } from "./actions";
import type { PanelPageSectionRow } from "@/lib/supabase/panelQueries";

// AdminListTable'ın <table>'ı BİLEREK kullanılmıyor: o başlık/durum/sıra/
// "Düzenle"/"Sil" sütunlarına göre tasarlı, burada "Düzenle"/"Sil" hiç
// yok ama her satırın altında değişken sayıda varyant kartı var — tablo
// hücresine sığmayan, dikey esnek bir alan gerektiriyor (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-15 — mesajlar ekranındaki
// "AdminListTable zorla yeniden kullanılmadı" kararıyla aynı ilke).
export function SectionRow({
  section,
  position,
  title,
  isFirst,
  isLast,
}: {
  section: PanelPageSectionRow;
  position: number;
  title: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const variantOptions = getSectionVariantOptions(section.sectionKey);

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-6 text-caption font-semibold text-text-muted tabular-nums">
          {position}.
        </span>
        <ReorderButtons
          id={section.id}
          title={title}
          isFirst={isFirst}
          isLast={isLast}
          action={moveSectionOrderAction}
        />
        <span className="flex-1 font-semibold text-text">{title}</span>
        <SectionVisibilityToggleButton
          id={section.id}
          title={title}
          isVisible={section.isVisible}
        />
      </div>

      {variantOptions.length > 0 ? (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <p className="mb-2 text-caption font-semibold text-text-muted">Görünüm</p>
          <VariantPicker
            sectionId={section.id}
            sectionKey={section.sectionKey}
            sectionLabel={title}
            currentVariant={section.variant}
            options={variantOptions}
          />
        </div>
      ) : (
        <p className="mt-3 text-caption text-text-muted">Bu bölümün tek bir görünümü var.</p>
      )}
    </Card>
  );
}
