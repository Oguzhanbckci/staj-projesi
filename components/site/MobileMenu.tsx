"use client";

import { useDialogBehavior } from "@/lib/hooks/useDialogBehavior";
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

// Odak tuzağı/Escape/scroll kilidi artık ortak bir hook'ta (bkz.
// lib/hooks/useDialogBehavior.ts — ProjectDetailModal'la paylaşılıyor).
// Kapanınca odak Navbar'daki tetikleyici butona döner (bkz. Navbar.tsx,
// onClose) — bu, hook'un sorumluluğu değil, çağıranın.
export function MobileMenu({
  id,
  open,
  onClose,
  links,
  contactHref,
  contactLabel,
}: MobileMenuProps) {
  const panelRef = useDialogBehavior(open, onClose);

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
