"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu as MenuIcon } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { SiteThemeSettings } from "@/lib/theme/resolve";
import { MobileMenu } from "./MobileMenu";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  logoText: string;
  /** site_settings.logo_path'ten çözülmüş gerçek URL — yoksa (KISITLAR: "düzgün bir yedek görünüm") sadece logoText metni gösterilir, regresyon yok. */
  logoUrl?: string | null;
  links: NavLink[];
  contactHref: string;
  contactLabel?: string;
  /** Açık/koyu tema switch'i için — bkz. components/site/ThemeToggle.tsx. */
  themeSettings: SiteThemeSettings;
}

// Sayfa kaydırıldığında görünüm değişir (şeffaftan dolgulu zemine) —
// bu yüzden Client Component (bkz. docs/TASARIM-SISTEMI.md madde 9.9:
// "use client" sadece gerçek etkileşim gerektiğinde). Bağlantılar
// çoğunlukla sayfa içi çapa ("/#hizmetler" vb. — bkz. lib/sections/
// config.ts, "/" öneki Ekip/İletişim gibi ayrı sayfalardan tıklanınca da
// çalışsın diye), Ekip/İletişim ise artık gerçek sayfa linkleri.
export function Navbar({
  logoText,
  logoUrl,
  links,
  contactHref,
  contactLabel = "İletişim",
  themeSettings,
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
        {/* `min-w-0` + `truncate`: firma adı panelden serbest metin.
            "Yılmaz İnşaat Taahhüt ve Ticaret A.Ş." gibi bir ad 320px'de
            sarıp sticky başlığı 70px'ten 122px'e çıkarıyordu — 568px
            yüksekliğindeki bir telefonda ekranın %21'i, üstelik sayfa
            boyunca kalıcı. Artık ad kesilir, başlık tek satırda kalır. */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-base font-bold text-text sm:text-h6"
        >
          {logoUrl && (
            <span className="relative h-8 w-8 shrink-0">
              {/* alt="" — bitişikteki logoText zaten erişilebilir adı taşıyor, ikisi birden aynı ismi iki kez duyurmasın. */}
              <Image src={logoUrl} alt="" fill sizes="32px" className="object-contain" />
            </span>
          )}
          <span className="truncate">{logoText}</span>
        </Link>
        <ul className="hidden gap-6 lg:flex">
          {menuLinks.map((link) => (
            <li key={link.href}>
              {/* İnce, açılır bir alt çizgi — hover'da 0'dan tam genişliğe
                  büyüyor (bkz. after: sözde öğesi). Salt görsel, JS yok. */}
              <Link
                href={link.href}
                className="relative text-base text-text after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-brand after:transition-all after:duration-200 after:content-[''] hover:text-brand hover:after:w-full motion-reduce:after:transition-none"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          {/* Her zaman görünür (mobilde de) — tema tercihi hamburger menüsü
              açılmadan da erişilebilir olmalı. */}
          <ThemeToggle settings={themeSettings} />
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
            <MenuIcon size={22} aria-hidden="true" />
          </button>
        </div>
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
