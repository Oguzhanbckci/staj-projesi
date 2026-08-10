"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

export interface DeleteActionState {
  success: boolean;
  formError?: string;
}

const initialState: DeleteActionState = { success: true };

export interface DeleteButtonProps {
  id: string;
  itemName: string;
  entityLabel: string;
  action: (prevState: DeleteActionState, formData: FormData) => Promise<DeleteActionState>;
}

// Hizmetler/Projeler/Referanslar/SSS/Ekip'in PAYLAŞTIĞI silme düğmesi —
// geri alınamaz bir işlem olduğu için özel bir onay dialog'u açar (bkz.
// ConfirmDeleteDialog — native window.confirm() DEĞİL). Dialog kapalıyken
// sadece küçük, görsel olarak ayrışan (variant="danger") bir tetikleyici
// buton render eder.
//
// Silme başarılı olunca dialog'u PROGRAMATİK olarak KAPATMIYORUZ (bu bir
// effect içinde senkron setState gerektirirdi — React'in "effect'te
// senkron setState" uyarısını tetikler). Bunun yerine Next.js'in Server
// Action sonrası otomatik route yenilemesine güveniyoruz: silinen satır
// listeden kalkınca DeleteButton'ın kendisi (dialog dahil) unmount olur.
// Bu, KABUL KRİTERİ'nin istediği "net geri bildirim"i (satırın gerçekten
// kaybolması) zaten sağlıyor. Hata durumunda satır/dialog YERİNDE kalır,
// hata mesajı dialog içinde gösterilir.
export function DeleteButton({ id, itemName, entityLabel, action }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <>
      <Button type="button" variant="danger" size="sm" onClick={() => setOpen(true)}>
        Sil
      </Button>
      {open && (
        <ConfirmDeleteDialog
          id={id}
          itemName={itemName}
          entityLabel={entityLabel}
          action={formAction}
          error={!state.success ? state.formError : undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
