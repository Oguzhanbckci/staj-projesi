"use client";

import { Toast, type ToastData } from "./Toast";

export interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

// Toast yığını — sağ üst köşede sabit, en üstteki bildirim en altta
// birikir (bkz. gap-3). `pointer-events-none` kap üzerinde, her Toast
// kendi `pointer-events-auto`'sunu taşıyor — bu sayede boş alan
// (bildirim olmayan kısım) altındaki sayfa etkileşimini ENGELLEMEZ.
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
