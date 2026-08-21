"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  /** Verilirse tıklanabilir hale gelir (next/link, panel içi gezinme için). */
  href?: string;
}

export interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
  /** ms cinsinden otomatik kapanma süresi. */
  duration?: number;
}

// Genel amaçlı bildirim kartı — `components/ui/` altında çünkü herhangi
// bir panel/site bağlamında tekrar kullanılabilir (bkz. Button/Card ile
// aynı paylaşım ilkesi, kullanıcı isteği: "tasarımı ortak olsun"). Sadece
// tasarım token'ları (bg-surface-raised, text-text, border-control
// vb.) kullanıyor — hardcoded renk yok, bu yüzden açık/koyu tema
// switch'iyle otomatik uyum sağlıyor, ayrı bir "koyu mod" stili yazmaya
// gerek yok (bkz. docs/TASARIM-SISTEMI.md).
export function Toast({ id, title, description, href, onDismiss, duration = 7000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const body = (
    <>
      <p className="text-base font-semibold text-text">{title}</p>
      {description && <p className="mt-0.5 text-caption text-text-muted">{description}</p>}
    </>
  );

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border border-control bg-surface-raised p-4 shadow-lg"
    >
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
      <div className="flex-1">
        {href ? (
          <Link
            href={href}
            className="block rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Bildirimi kapat"
        className="shrink-0 rounded-sm p-1 text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
