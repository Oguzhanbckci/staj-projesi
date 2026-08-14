"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu as MenuIcon } from "lucide-react";
import { useDialogBehavior } from "@/lib/hooks/useDialogBehavior";
import { SkipLink } from "@/components/ui/SkipLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Tooltip } from "@/components/ui/Tooltip";
import type { SiteThemeSettings } from "@/lib/theme/resolve";
import { NewMessageNotifier } from "./NewMessageNotifier";
import { UserMenu } from "./UserMenu";
import { PANEL_NAV_ITEMS } from "./navItems";

// "/panel" tam eşleşmeli (aksi halde her alt sayfa yanlışlıkla "Özet"ü de
// aktif gösterirdi); diğer öğeler kendi alt rotalarını da kapsar (ör.
// "/panel/mesajlar/123" hâlâ "Mesajlar"ı aktif göstermeli).
function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {PANEL_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(pathname, item.href);
        const showUnreadBadge = item.href === "/panel/mesajlar" && unreadMessagesCount > 0;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                active ? "bg-brand/10 font-semibold text-brand" : "text-text hover:bg-surface"
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-1 left-0 w-1 rounded-full bg-brand"
                />
              )}
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
          2026-08-18) — ayrıca header'daki UserMenu'nün açılır panelinde
          de tekrar görünüyor (kalıcı kimlik burada, hızlı eylemler orada). */}
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

      {/* Mobil/tablet: açılır (drawer/sheet) menü — MobileMenu.tsx'teki
          aynı odak tuzağı/Escape/scroll kilidi deseni (useDialogBehavior).
          Görsel cila: tam ekran yerine sağdan kayan dar bir panel +
          arkasında tıklanabilir/bulanık bir zemin. Zemin `aria-hidden` ve
          klavyeyle hiç erişilmiyor (odak tuzağı yalnızca panelRef'e bağlı
          elemanları kapsıyor) — Escape/X ile kapanış aynen korunuyor,
          zemine tıklamak da (fare/dokunma) yeni bir kapatma yolu ekliyor. */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={closeMobileNav}
            className="animate-fade-in absolute inset-0 cursor-default bg-neutral-900/50 backdrop-blur-sm motion-reduce:animate-none"
          />
          <div
            ref={mobileNavRef}
            role="dialog"
            aria-modal="true"
            aria-label="Panel menüsü"
            className="animate-slide-in-right absolute inset-y-0 right-0 w-72 max-w-[85vw] overflow-y-auto bg-surface-raised p-4 shadow-xl motion-reduce:animate-none"
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
        </div>
      )}

      {/* Mobil çekmece açıkken arka plandaki içerik `aria-modal="true"`'nun
          verdiği sözü (arkasının etkileşimsiz/gizli olması) tutmalı — Tab
          tuzağı (useDialogBehavior) sadece klavye Tab gezinmesini kapsıyor,
          ekran okuyucunun sanal imleç/tarama modunu (ok tuşları vb.)
          kısıtlamıyor. `inert`, çekmece açıkken bu içeriği erişilebilirlik
          ağacından ve klavye/fare etkileşiminden tamamen çıkarır. */}
      <div className="flex min-h-full flex-1 flex-col" inert={mobileNavOpen}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-300 bg-surface-raised/90 px-4 py-3 backdrop-blur-sm sm:px-6">
          <Tooltip label="Menü" side="bottom">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Menüyü aç"
              className="rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
            >
              <MenuIcon size={20} aria-hidden="true" />
            </button>
          </Tooltip>
          {/* ml-auto: masaüstünde hamburger buton (lg:hidden) DOM'dan
              tamamen kalktığında justify-between'in tek kalan bu öğeyi
              sola yaslamasını engeller. "Siteyi Görüntüle" ve "Çıkış Yap"
              artık UserMenu'nün açılır panelinde toplanıyor (görsel
              cila geçişi, bkz. UserMenu.tsx) — tema switch'i tek tıkla
              erişilebilir kalsın diye dışarıda bırakıldı, sık kullanılan
              bir eylem bir menüye gömülmedi. */}
          <div className="ml-auto flex items-center gap-3">
            <Tooltip label="Tema değiştir" side="bottom">
              <ThemeToggle settings={themeSettings} />
            </Tooltip>
            <UserMenu userEmail={userEmail} signOutAction={signOutAction} />
          </div>
        </header>
        <main id="panel-main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
