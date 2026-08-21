"use client";

import { useDialogBehavior } from "@/lib/hooks/useDialogBehavior";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";

export interface ConfirmDeleteDialogProps {
  id: string;
  itemName: string;
  /** Yalın hâl — "hizmet", "proje", "referans", "soru", "ekip üyesi" (çekim eki gerekmez, bkz. aşağıdaki cümle kalıbı). */
  entityLabel: string;
  action: (payload: FormData) => void;
  error?: string;
  onClose: () => void;
}

// Silme onayı için özel, erişilebilir bir dialog — native `window.confirm()`
// DEĞİL: onun OK/Cancel butonları stillenemiyor, ama KISITLAR yıkıcı
// butonun görsel olarak ayrışmasını istiyor. Odak tuzağı/Escape/scroll
// kilidi useDialogBehavior'dan (MobileMenu ve diğer diyaloglarla
// paylaşılan, zaten doğrulanmış hook — yeni bir klavye mantığı icat
// edilmedi).
//
// Kazara silmeyi azaltan 2 önlem (KABUL KRİTERİ'nin istediği "en az 2"):
// (1) onay metni kaydın GERÇEK adını gösterir, (2) "Vazgeç" DOM'da
// "Evet, Sil"den önce geldiği için dialog açılır açılmaz varsayılan
// klavye odağı ORAYA gider (useDialogBehavior ilk odaklanabilir öğeyi
// otomatik seçiyor) — reflekssel bir Enter/Space silme değil iptal
// tetikler.
export function ConfirmDeleteDialog({
  id,
  itemName,
  entityLabel,
  action,
  error,
  onClose,
}: ConfirmDeleteDialogProps) {
  const panelRef = useDialogBehavior(true, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
        className="w-full max-w-sm rounded-lg bg-surface-raised p-6 shadow-lg"
      >
        <h2 id="confirm-delete-title" className="text-h6 font-bold text-text">
          Kaydı silmek istediğinize emin misiniz?
        </h2>
        <p id="confirm-delete-description" className="mt-2 text-base text-text-muted">
          &quot;{itemName}&quot; başlıklı {entityLabel} silinecek. Bu işlem geri alınamaz.
        </p>

        {error && (
          <p role="alert" className="mt-3 text-caption text-error">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Vazgeç
          </Button>
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <SubmitButton pendingLabel="Siliniyor…" variant="danger">
              Evet, Sil
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
