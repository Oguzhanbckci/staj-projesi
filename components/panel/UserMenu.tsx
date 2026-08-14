"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LogOut } from "lucide-react";

export interface UserMenuProps {
  userEmail: string;
  signOutAction: () => Promise<void>;
}

// Panel header'ındaki avatar + açılır panel — e-posta, Siteyi Görüntüle ve
// Çıkış Yap'ı tek yerde toplar (bkz. PanelShell.tsx). Tam bir dialog değil
// (odak tuzağı/scroll kilidi gerekmiyor, useDialogBehavior o yüzden
// kullanılmadı) — kendi hafif aç/kapa mantığını taşıyor: dışarı tıklama +
// Escape ile kapanır. `role="menu"` BİLEREK kullanılmadı — içerik bir
// komut listesi değil, bir link + bir form; tam ARIA menü deseni (ok
// tuşlarıyla gezinme) burada karşılığı olmayan bir vaat olurdu. Bunun
// yerine sade aria-expanded/aria-controls ile bir "disclosure" deseni.
export function UserMenu({ userEmail, signOutAction }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const initial = userEmail.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Kullanıcı menüsü — ${userEmail}`}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-caption font-bold text-brand-on"
        >
          {initial}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={`text-text-muted transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="animate-scale-in absolute right-0 top-full z-30 mt-2 w-64 origin-top-right rounded-lg border border-neutral-300 bg-surface-raised p-2 shadow-lg motion-reduce:animate-none"
        >
          <p className="truncate px-3 py-2 text-caption text-text-muted" title={userEmail}>
            {userEmail}
          </p>
          <div className="my-1 border-t border-neutral-300" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-base text-text hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <ExternalLink size={16} aria-hidden="true" />
            Siteyi Görüntüle
          </a>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base text-error hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <LogOut size={16} aria-hidden="true" />
              Çıkış Yap
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
