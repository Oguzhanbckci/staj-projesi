"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";

export interface DeleteActionState {
  success: boolean;
  formError?: string;
}

const initialState: DeleteActionState = { success: true };

export interface DeleteButtonProps {
  id: string;
  action: (prevState: DeleteActionState, formData: FormData) => Promise<DeleteActionState>;
  confirmMessage: string;
}

// Hizmetler ve Projeler'in PAYLAŞTIĞI silme düğmesi — geri alınamaz bir
// işlem olduğu için native `window.confirm()` ile onay istiyor
// (`onSubmit` içinde `preventDefault` — kullanıcı iptal ederse Server
// Action hiç çağrılmaz). Silme başarısız olursa (ör. ağ/DB hatası)
// buton altında kısa bir hata mesajı gösterir, sayfa çökmez.
export function DeleteButton({ id, action, confirmMessage }: DeleteButtonProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {!state.success && state.formError && (
        <p role="alert" className="mb-1 text-caption text-error">
          {state.formError}
        </p>
      )}
      <SubmitButton pendingLabel="Siliniyor…" variant="ghost" size="sm">
        Sil
      </SubmitButton>
    </form>
  );
}
