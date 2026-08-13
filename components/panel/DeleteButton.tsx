"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

export interface DeleteActionState {
  success: boolean;
  formError?: string;
}

// initialState.success BİLEREK `false` (önceki sürümde `true` idi) —
// 2026-08-18'de bulunan gerçek bir bug: `true` olunca "henüz hiç
// gönderilmedi" durumuyla "gönderildi ve başarıyla silindi" durumu AYNI
// görünüyordu, dialogOpen'ı (aşağıda) `state.success`'ten türetmek
// imkansızdı. Artık ayırt edilebilir: pristine=false, başarısız=false
// (formError dolu), başarılı=true (SADECE gerçek bir silme sonrası).
const initialState: DeleteActionState = { success: false };

export interface DeleteButtonProps {
  id: string;
  itemName: string;
  entityLabel: string;
  action: (prevState: DeleteActionState, formData: FormData) => Promise<DeleteActionState>;
}

// Hizmetler/Projeler/Referanslar/SSS/Ekip/Mesajlar'ın PAYLAŞTIĞI silme
// düğmesi — geri alınamaz bir işlem olduğu için özel bir onay dialog'u
// açar (bkz. ConfirmDeleteDialog — native window.confirm() DEĞİL).
// Dialog kapalıyken sadece küçük, görsel olarak ayrışan (variant="danger")
// bir tetikleyici buton render eder.
//
// 2026-08-18 DÜZELTMESİ (kullanıcı bulgusu — "Evet, Sil"e basınca pencere
// otomatik kapanmıyor, sayfayı elle yenileyince kayboluyordu): Önceki
// sürüm dialog'u PROGRAMATİK kapatmıyordu, sadece Next.js'in Server
// Action sonrası "route'u yenile" davranışına güveniyordu — ama bu
// davranış (bazı Server Action'larda revalidatePath/revalidateTag hiç
// çağrılmadığında) HER ZAMAN tetiklenmeyebiliyor, kullanıcı bunu tam
// olarak yaşadı. Çözüm bir `useEffect` + senkron `setState` DEĞİL
// (`react-hooks/set-state-in-effect` lint kuralını tetikler, bkz.
// ThemeToggle.tsx'teki aynı dersle) — `dialogOpen`, RENDER SIRASINDA
// `open` (kullanıcının Sil/Vazgeç tıklamaları) ve `state.success`'ten
// (useActionState'in kendi güncellemesi) doğrudan TÜRETİLİYOR: silme
// başarılı olur olmaz (`state.success` `true` olur olmaz) dialog bir
// sonraki render'da otomatik kapanır — ek bir effect/route-yenileme
// varsayımı gerekmez.
export function DeleteButton({ id, itemName, entityLabel, action }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, initialState);
  const dialogOpen = open && !state.success;

  return (
    <>
      <Button type="button" variant="danger" size="sm" onClick={() => setOpen(true)}>
        Sil
      </Button>
      {dialogOpen && (
        <ConfirmDeleteDialog
          id={id}
          itemName={itemName}
          entityLabel={entityLabel}
          action={formAction}
          error={state.formError}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
