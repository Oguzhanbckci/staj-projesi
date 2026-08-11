import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/Card";

// Navbar/Footer page_sections'ta HİÇ satır değil (bkz. docs/PRD.md: "Footer...
// bölüm kütüphanesinin parçası değil, sayfa düzeninin sabit bir parçası
// (chrome), Navbar gibi") — bu yüzden bu bileşen DB'ye bağlı değil, sadece
// KISITLAR'ın "kapatılamasın, butonları devre dışı, nedeni yazılsın"
// isteğini görsel olarak karşılayan statik bir satır. Gerçek sıralanabilir
// listenin (page.tsx'te) DIŞINDA, üstünde/altında sabit — yanlışlıkla
// ortaya taşınamaz çünkü hiç sıra state'i taşımıyor.
export function RequiredSectionRow({ label, reason }: { label: string; reason: string }) {
  return (
    <Card className="border border-dashed border-neutral-300 bg-neutral-100 p-4 shadow-none">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 opacity-40">
          <button type="button" disabled aria-label={`${label} taşınamaz`} className="px-1.5">
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" disabled aria-label={`${label} taşınamaz`} className="px-1.5">
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <span className="flex-1 font-semibold text-text">{label}</span>
        <span className="rounded-full border border-neutral-400 px-2 py-0.5 text-caption font-semibold text-text-muted">
          Zorunlu
        </span>
        <button
          type="button"
          disabled
          aria-label={`${label} gizlenemez`}
          className="rounded-md border border-neutral-300 px-3 py-1 text-caption text-text-muted opacity-40"
        >
          Gizle
        </button>
      </div>
      <p className="mt-2 text-caption text-text-muted">{reason}</p>
    </Card>
  );
}
