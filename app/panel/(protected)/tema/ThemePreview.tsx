import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";

export interface ThemePreviewProps {
  /** resolveThemeTokens()'ın ürettiği styleVars — gerçek app/layout.tsx'in
   *  kullandığı AYNI fonksiyon (bkz. ThemeEditor.tsx), burada sadece bu
   *  izole önizleme kutusuna scope'lanıyor, gerçek <html>'e dokunulmuyor. */
  styleVars: Record<string, string>;
}

// "Ayarlar değiştikçe... buton/kart/başlık anında güncellensin, kaydetmeden
// görülebilsin" (İSTEK) — app/globals.css'teki @theme inline mekanizması
// CSS özel değişkenlerinin herhangi bir DOM scope'unda override
// edilebilmesini zaten sağlıyor (aynı mekanizma <html>'de gerçek siteyi
// besliyor, bkz. docs/TEMA-MIMARISI.md), bu yüzden ek kod gerekmiyor —
// sadece bu div'in style'ı yeterli.
export function ThemePreview({ styleVars }: ThemePreviewProps) {
  return (
    <div
      style={styleVars as CSSProperties}
      className="space-y-4 rounded-lg border border-neutral-300 bg-surface p-6"
    >
      <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
        Canlı Önizleme
      </p>
      <h3 className="text-h5 font-bold text-text">Örnek Başlık</h3>
      <div className="rounded-md border border-neutral-300 bg-surface-raised p-4">
        <p className="text-base text-text">
          Bu, seçtiğiniz ayarların gerçek sitede nasıl görüneceğini gösteren örnek bir kart
          metnidir.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="primary">
          Birincil Buton
        </Button>
        <Button type="button" variant="accent">
          İkincil Buton
        </Button>
      </div>
    </div>
  );
}
