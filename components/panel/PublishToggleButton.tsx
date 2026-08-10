"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { StatusBadge } from "./StatusBadge";

export interface ToggleActionState {
  success: boolean;
  formError?: string;
}

const initialState: ToggleActionState = { success: true };

export interface PublishToggleButtonProps {
  id: string;
  title: string;
  isPublished: boolean;
  action: (id: string, prevState: ToggleActionState, formData: FormData) => Promise<ToggleActionState>;
}

// Listeden TEK TIKLA yayın durumu değiştirme. Buton, durumun kendisini
// değil TIKLANINCA NE OLACAĞINI söylüyor ("Yayınla" / "Taslağa Al") —
// teknik olmayan bir kullanıcı için "şu an ne durumda / tıklarsam ne
// olur" belirsizliğini azaltan standart bir kalıp. `StatusBadge` salt
// gösterim olarak kalıyor (başka yerlerde de kullanılabilir, tıklanabilir
// hale getirilmedi).
export function PublishToggleButton({ id, title, isPublished, action }: PublishToggleButtonProps) {
  const boundAction = action.bind(null, id);
  const [state, formAction] = useActionState(boundAction, initialState);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge isPublished={isPublished} />
      <form action={formAction}>
        <SubmitButton
          pendingLabel="…"
          variant="ghost"
          size="sm"
          aria-label={`"${title}" ${isPublished ? "taslağa alınsın" : "yayınlansın"}`}
        >
          {isPublished ? "Taslağa Al" : "Yayınla"}
        </SubmitButton>
      </form>
      {!state.success && state.formError && (
        <p role="alert" className="w-full text-caption text-error">
          {state.formError}
        </p>
      )}
    </div>
  );
}
