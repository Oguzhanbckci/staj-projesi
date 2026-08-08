"use client";

import { useEffect, useRef } from "react";
import { LinkButton } from "@/components/ui/LinkButton";
import type { NavLink } from "./Navbar";

export interface MobileMenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  contactHref: string;
  contactLabel: string;
}

// Açıkken: odak menü içine taşınır ve Tab/Shift+Tab menü içinde döner
// (focus trap), Escape kapatır, body scroll kilitlenir. Kapanınca odak
// Navbar'daki tetikleyici butona döner (bkz. Navbar.tsx, onClose).
export function MobileMenu({
  id,
  open,
  onClose,
  links,
  contactHref,
  contactLabel,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>("a, button");
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

  if (!open) return null;

  return (
    <div
      id={id}
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menü"
      className="fixed inset-0 z-50 bg-surface p-6 sm:hidden"
    >
      <button
        type="button"
        onClick={onClose}
        className="ml-auto block rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="sr-only">Menüyü kapat</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <ul className="mt-8 space-y-4">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={onClose}
              className="text-h5 font-semibold text-text"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <LinkButton href={contactHref} size="lg" onClick={onClose} className="w-full">
          {contactLabel}
        </LinkButton>
      </div>
    </div>
  );
}
