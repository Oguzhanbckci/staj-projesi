"use client";

import { useEffect, useRef } from "react";

// MobileMenu ve ProjectDetailModal arasında paylaşılan odak-tuzağı mantığı.
// Form alanlarındaki basit etiket/hata kalıbının aksine (bilerek
// paylaşılan bir soyutlamaya çıkarılmadı, bkz. TASARIM-SISTEMI.md madde
// 9.8), burada mantık gerçekten karmaşık ve hataya açık (klavye olayları,
// odak döngüsü) — tek, doğrulanmış bir implementasyonda tutmak daha
// güvenli.
//
// Açıkken: odak ilk etkileşimli öğeye taşınır, Tab/Shift+Tab döngüsel
// kalır, Escape `onClose`'u çağırır, body scroll kilitlenir. Odağın
// kapanınca tetikleyici öğeye dönmesi çağıranın sorumluluğunda (ref'e
// erişimi olan taraf farklı olabilir — bkz. Navbar.tsx).
export function useDialogBehavior(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      "a, button, [tabindex]"
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return panelRef;
}
