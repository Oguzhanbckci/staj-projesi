"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, X, Menu as MenuIcon } from "lucide-react";
import { useDialogBehavior } from "@/lib/hooks/useDialogBehavior";
import { Button } from "@/components/ui/Button";
import { SkipLink } from "@/components/ui/SkipLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { SiteThemeSettings } from "@/lib/theme/resolve";
import { NewMessageNotifier } from "./NewMessageNotifier";
import { PANEL_NAV_ITEMS } from "./navItems";

// Genel bir "her nav öğesi rozet alabilir" sistemi bilerek KURULMADI
// (tek bir öğe — Mesajlar — için gereksiz soyutlama, bkz.
// docs/KARAR-GUNLUGU.md) — sadece o öğenin href'i eşleştiğinde özel bir
// rozet render edilir. Rozetin görsel dili, eski mesaj listesindeki
// "Yeni" etiketiyle aynı (bg-brand text-brand-on rounded-full).
function NavList({
  onNavigate,
  unreadMessagesCount,
}: {
  onNavigate?: () => void;
  unreadMessagesCount: number;
}) {
  return (
    <ul className="space-y-1">
      {PANEL_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const showUnreadBadge = item.href === "/panel/mesajlar" && unreadMessagesCount > 0;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-base text-text hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Icon size={18} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {showUnreadBadge && (
                <span
                  className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-caption font-semibold text-brand-on"
                  aria-label={`${unreadMessagesCount} okunmamış mesaj`}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// Panelin sayfa iskeleti — ziyaretçi sitesinden (Navbar/Footer, tek
// sütunlu kaydırmalı sayfa) yapısal olarak tamamen ayrı: kalıcı bir kenar
// menüsü + üst başlık + içerik alanı olan bir "uygulama kabuğu" (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-12 — "aynı token'lar, farklı yerleşim").
// Aynı renk/tipografi token'ları (bg-surface, bg-brand, text-text vb.)
// kullanılıyor, hiç yeni bir renk icat edilmedi.
//
// `signOutAction` bir Server Action — Server Component'ten (bkz.
// app/panel/(protected)/layout.tsx) prop olarak buraya, bir Client
// Component'e geçiriliyor; Next.js bunu güvenle destekler (fonksiyon
// referansı, gerçek kodu sunucuda kalır).
export function PanelShell({
  userEmail,
  signOutAction,
  unreadMessagesCount,
  themeSettings,
  tenantId,
  children,
}: {
  userEmail: string;
  signOutAction: () => Promise<void>;
  unreadMessagesCount: number;
  themeSettings: SiteThemeSettings;
  /** NewMessageNotifier'ın Realtime aboneliğini bu tenant'a filtrelemesi için. */
  tenantId: string;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);
  const mobileNavRef = useDialogBehavior(mobileNavOpen, closeMobileNav);

  // Okunmamış sayısı artık CANLI istemci state'i — sunucudan gelen
  // `unreadMessagesCount` (mark-read/delete sonrası revalidatePath'in
  // tetiklediği yeniden render'larda güncellenir) ile Realtime'ın anlık
  // artışını (yeni mesaj geldiğinde, bkz. NewMessageNotifier) TEK bir
  // sayaçta birleştiriyor. `useState(unreadMessagesCount)` TEK BAŞINA
  // yeterli olmazdı — prop sonradan değişince (server yeniden render
  // ettiğinde) lazy initializer bir daha ÇALIŞMAZ, sayaç sunucudaki
  // gerçek değerden kopardı. Bunun yerine React'in kendi önerdiği "prop
  // değişince state'i render SIRASINDA senkronla" deseni kullanılıyor
  // (bir useEffect + setState DEĞİL — aynı ThemeToggle/DeleteButton
  // dersi, `react-hooks/set-state-in-effect`'i tetiklemez).
  const [unreadCount, setUnreadCount] = useState(unreadMessagesCount);
  const [syncedCount, setSyncedCount] = useState(unreadMessagesCount);
  if (unreadMessagesCount !== syncedCount) {
    setSyncedCount(unreadMessagesCount);
    setUnreadCount(unreadMessagesCount);
  }

  return (
    <div className="flex min-h-full bg-surface">
      <NewMessageNotifier tenantId={tenantId} setUnreadCount={setUnreadCount} />
      <SkipLink targetId="panel-main-content" />
      {/* Masaüstü: kalıcı kenar menüsü (bkz. lg: — Navbar'daki aynı
          kırılma noktasıyla tutarlı, bkz. docs/KARAR-GUNLUGU.md 2026-08-11).
          E-posta "Panel" başlığının hemen altında (kullanıcı isteği,
          2026-08-18) — Çıkış Yap/Siteyi Görüntüle artık başlıkta, tema
          switch'inin iki yanında. */}
      <aside className="hidden w-60 shrink-0 border-r border-neutral-300 bg-surface-raised p-4 lg:block">
        <Link
          href="/panel"
          className="rounded-sm px-3 text-h6 font-bold text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Panel
        </Link>
        <p className="truncate px-3 text-caption text-text-muted" title={userEmail}>
          {userEmail}
        </p>
        <nav className="mt-6">
          <NavList unreadMessagesCount={unreadCount} />
        </nav>
      </aside>

      {/* Mobil/tablet: açılır (drawer) menü — MobileMenu.tsx'teki aynı
          odak tuzağı/Escape/scroll kilidi deseni (useDialogBehavior). */}
      {mobileNavOpen && (
        <div
          ref={mobileNavRef}
          role="dialog"
          aria-modal="true"
          aria-label="Panel menüsü"
          className="fixed inset-0 z-50 bg-surface-raised p-4 lg:hidden"
        >
          <div className="flex items-center justify-between px-3">
            <Link
              href="/panel"
              onClick={closeMobileNav}
              className="rounded-sm text-h6 font-bold text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Panel
            </Link>
            <button
              type="button"
              onClick={closeMobileNav}
              className="rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="sr-only">Menüyü kapat</span>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <p className="truncate px-3 text-caption text-text-muted" title={userEmail}>
            {userEmail}
          </p>
          <nav className="mt-6">
            <NavList onNavigate={closeMobileNav} unreadMessagesCount={unreadCount} />
          </nav>
        </div>
      )}

      {/* Mobil çekmece açıkken arka plandaki içerik `aria-modal="true"`'nun
          verdiği sözü (arkasının etkileşimsiz/gizli olması) tutmalı — Tab
          tuzağı (useDialogBehavior) sadece klavye Tab gezinmesini kapsıyor,
          ekran okuyucunun sanal imleç/tarama modunu (ok tuşları vb.)
          kısıtlamıyor. `inert`, çekmece açıkken bu içeriği erişilebilirlik
          ağacından ve klavye/fare etkileşiminden tamamen çıkarır. */}
      <div className="flex min-h-full flex-1 flex-col" inert={mobileNavOpen}>
        <header className="flex items-center justify-between border-b border-neutral-300 bg-surface-raised px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Menüyü aç"
            className="rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
          >
            <MenuIcon size={20} aria-hidden="true" />
          </button>
          {/* ml-auto: masaüstünde hamburger buton (lg:hidden) DOM'dan
              tamamen kalktığında justify-between'in tek kalan bu öğeyi
              sola yaslamasını engeller. Kullanıcı isteği (2026-08-18):
              e-posta sidebar'a taşındı, "Siteyi Görüntüle" switch'in
              SOLUNDA + "Çıkış Yap" switch'in SAĞINDA — dar ekranda
              "Siteyi Görüntüle" metni gizlenip sadece ikon kalıyor
              (aria-label ile erişilebilir kalır), taşmayı önlemek için. */}
          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Siteyi Görüntüle"
              className="flex items-center gap-1.5 text-base text-text-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ExternalLink size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Siteyi Görüntüle</span>
            </a>
            <ThemeToggle settings={themeSettings} />
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Çıkış Yap
              </Button>
            </form>
          </div>
        </header>
        <main id="panel-main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
