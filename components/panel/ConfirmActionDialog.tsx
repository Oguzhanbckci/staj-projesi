"use client";

import { useDialogBehavior } from "@/lib/hooks/useDialogBehavior";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";

export interface ConfirmActionDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  confirmVariant?: ButtonProps["variant"];
  action: (payload: FormData) => void;
  error?: string;
  onClose: () => void;
}

// ConfirmDeleteDialog.tsx'in AYNI iskeleti (useDialogBehavior — odak
// tuzağı/Escape/scroll kilidi, aynı odak-ilk-öğeye-gider davranışı) ama
// yıkıcı/"Sil" diline kilitlenmemiş, genel bir onay dialog'u — tema
// önayarı uygulama ve varsayılana dönme gibi geri alınamaz OLMAYAN ama
// yine de "mevcut ayarları değiştiren" eylemler için (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-16). ConfirmDeleteDialog kasıtlı olarak
// DEĞİŞTİRİLMEDİ — o hâlâ silme için, kendi "id" alanına gizli input
// yazan deseniyle kalıyor; bu bileşen `action`'ı doğrudan çağırıyor
// (FormData'ya ekstra bir alan gerekmiyor, action zaten `.bind()` ile
// hedefini taşıyor).
export function ConfirmActionDialog({
  title,
  description,
  confirmLabel,
  pendingLabel,
  confirmVariant = "primary",
  action,
  error,
  onClose,
}: ConfirmActionDialogProps) {
  const panelRef = useDialogBehavior(true, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-action-title"
        aria-describedby="confirm-action-description"
        className="w-full max-w-sm rounded-lg bg-surface-raised p-6 shadow-lg"
      >
        <h2 id="confirm-action-title" className="text-h6 font-bold text-text">
          {title}
        </h2>
        <p id="confirm-action-description" className="mt-2 text-base text-text-muted">
          {description}
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
            <SubmitButton pendingLabel={pendingLabel} variant={confirmVariant}>
              {confirmLabel}
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
