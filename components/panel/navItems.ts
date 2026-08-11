import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Palette,
  Settings,
} from "lucide-react";

export interface PanelNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Panelin kenar menüsü — özet ekranına dönmek için "Özet" + 6 gerçek bölüm.
// Sadece Ayarlar hâlâ placeholder (bkz. app/panel/(protected)/ayarlar),
// gerçek arayüzü Faz 5'te gelecek (bkz. docs/DURUM.md).
export const PANEL_NAV_ITEMS: PanelNavItem[] = [
  { label: "Özet", href: "/panel", icon: LayoutDashboard },
  { label: "İçerikler", href: "/panel/icerikler", icon: FileText },
  { label: "Sayfa Düzeni", href: "/panel/sayfa-duzeni", icon: LayoutTemplate },
  { label: "Medya", href: "/panel/medya", icon: ImageIcon },
  { label: "Tema", href: "/panel/tema", icon: Palette },
  { label: "Mesajlar", href: "/panel/mesajlar", icon: Mail },
  { label: "Ayarlar", href: "/panel/ayarlar", icon: Settings },
];
