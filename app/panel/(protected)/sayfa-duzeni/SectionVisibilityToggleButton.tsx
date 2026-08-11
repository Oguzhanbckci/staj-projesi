"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { toggleSectionVisibilityAction, type ToggleState } from "./actions";

const initialState: ToggleState = { success: true };

// components/panel/PublishToggleButton.tsx ile AYNI desen ama BİLEREK ayrı
// bir bileşen — semantik farklı ("yayın durumu" değil "görünürlük"; bkz.
// docs/TASARIM-SISTEMI.md madde 9.8, küçük tekrar gereksiz genellemeden
// ucuz). SubmitButton zaten pending sırasında aria-label'ı bastırıp
// içerikten türetiyor (2026-08-15'te düzeltildi) — burada ayrıca bir şey
// yapmaya gerek yok.
export function SectionVisibilityToggleButton({
  id,
  title,
  isVisible,
}: {
  id: string;
  title: string;
  isVisible: boolean;
}) {
  const boundAction = toggleSectionVisibilityAction.bind(null, id);
  const [state, formAction] = useActionState(boundAction, initialState);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-caption font-semibold ${isVisible ? "text-success" : "text-text-muted"}`}
      >
        {isVisible ? "Görünür" : "Gizli"}
      </span>
      <form action={formAction}>
        <SubmitButton
          pendingLabel="…"
          variant="ghost"
          size="sm"
          aria-label={`"${title}" ${isVisible ? "gizlensin" : "gösterilsin"}`}
        >
          {isVisible ? "Gizle" : "Göster"}
        </SubmitButton>
      </form>
      {!state.success && state.formError && (
        <p role="alert" className="text-caption text-error">
          {state.formError}
        </p>
      )}
    </div>
  );
}
