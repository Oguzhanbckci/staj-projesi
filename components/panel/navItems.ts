import type { LucideIcon } from "lucide-react";
import { FileText, Image as ImageIcon, LayoutDashboard, Mail, Palette, Settings } from "lucide-react";

export interface PanelNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Panelin kenar menüsü — yönergedeki 5 bölüm (içerikler/medya/tema/
// mesajlar/ayarlar) + özet ekranına dönmek için "Özet". Sayfaların çoğu
// şimdilik placeholder (bkz. app/panel/(protected)/), gerçek içerik
// yönetimi Faz 5'te gelecek (bkz. docs/DURUM.md).
export const PANEL_NAV_ITEMS: PanelNavItem[] = [
  { label: "Özet", href: "/panel", icon: LayoutDashboard },
  { label: "İçerikler", href: "/panel/icerikler", icon: FileText },
  { label: "Medya", href: "/panel/medya", icon: ImageIcon },
  { label: "Tema", href: "/panel/tema", icon: Palette },
  { label: "Mesajlar", href: "/panel/mesajlar", icon: Mail },
  { label: "Ayarlar", href: "/panel/ayarlar", icon: Settings },
];
