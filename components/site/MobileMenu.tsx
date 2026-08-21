"use client";

import Link from "next/link";
import { X } from "lucide-react";
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
// lib/hooks/useDialogBehavior.ts — panel diyaloglarıyla paylaşılıyor).
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
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Bulanık/tıklanabilir zemin — PanelShell.tsx'teki aynı desen (bkz.
          o dosyadaki yorum): aria-hidden + tabIndex=-1 gerçek bir <button>,
          odak tuzağı sadece panelRef'e bağlı elemanları kapsıyor. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 cursor-default bg-neutral-900/50 backdrop-blur-sm motion-reduce:animate-none"
      />
      <div
        id={id}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        className="animate-slide-in-right absolute inset-y-0 right-0 w-72 max-w-[85vw] overflow-y-auto bg-surface p-6 shadow-xl motion-reduce:animate-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="ml-auto block rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="sr-only">Menüyü kapat</span>
          <X size={22} aria-hidden="true" />
        </button>
        <ul className="mt-8 space-y-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="text-h5 font-semibold text-text"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <LinkButton href={contactHref} size="lg" onClick={onClose} className="w-full">
            {contactLabel}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
