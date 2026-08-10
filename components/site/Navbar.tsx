"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/LinkButton";
import { MobileMenu } from "./MobileMenu";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  logoText: string;
  links: NavLink[];
  contactHref: string;
  contactLabel?: string;
}

// Sayfa kaydırıldığında görünüm değişir (şeffaftan dolgulu zemine) —
// bu yüzden Client Component (bkz. docs/TASARIM-SISTEMI.md madde 9.9:
// "use client" sadece gerçek etkileşim gerektiğinde). Bağlantılar
// çoğunlukla sayfa içi çapa ("/#hizmetler" vb. — bkz. lib/sections/
// config.ts, "/" öneki Ekip/İletişim gibi ayrı sayfalardan tıklanınca da
// çalışsın diye), Ekip/İletişim ise artık gerçek sayfa linkleri.
export function Navbar({
  logoText,
  links,
  contactHref,
  contactLabel = "İletişim",
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // "İletişim" hem sade bir menü linki hem de aşağıdaki dolgulu CTA
  // butonu olarak aynı adrese (contactHref) gidiyordu — görsel tekrar.
  // Sade linki menüden çıkarıyoruz, CTA buton tek "İletişim" olarak kalıyor.
  const menuLinks = links.filter((link) => link.href !== contactHref);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
    toggleButtonRef.current?.focus();
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        scrolled ? "bg-surface-raised shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-h6 font-bold text-text">
          {logoText}
        </Link>
        <ul className="hidden gap-6 lg:flex">
          {menuLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-base text-text hover:text-brand">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden lg:block">
          <LinkButton href={contactHref} size="sm">
            {contactLabel}
          </LinkButton>
        </div>
        <button
          ref={toggleButtonRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
          className="rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
        >
          <span className="sr-only">Menüyü aç</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </nav>
      <MobileMenu
        id="mobile-menu"
        open={menuOpen}
        onClose={closeMenu}
        links={menuLinks}
        contactHref={contactHref}
        contactLabel={contactLabel}
      />
    </header>
  );
}
