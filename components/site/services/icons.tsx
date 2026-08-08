import {
  Home,
  Building2,
  Hammer,
  PencilRuler,
  Layers,
  ClipboardCheck,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

// services.icon kolonundaki string değerleri (seed verisiyle birebir —
// bkz. supabase/seed.sql) gerçek ikon bileşenine eşler. Yeni bir ikon adı
// eklemek: burada tek satır (bkz. Hero varyant registry'siyle aynı ilke —
// tek yerde, tip güvenli eşleme).
const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  home: Home,
  "building-2": Building2,
  hammer: Hammer,
  "pencil-ruler": PencilRuler,
  layers: Layers,
  "clipboard-check": ClipboardCheck,
};

// Bilinçli olarak elementi burada, düz (bileşen olmayan, küçük harfle
// başlayan) bir fonksiyonda üretiyoruz — çağıran taraf render sırasında
// "const Icon = ...; <Icon/>" yazmıyor, sadece {renderServiceIcon(...)}
// ile gömüyor. Aksi hâlde eslint-plugin-react-hooks'un
// react-hooks/static-components kuralı "render sırasında bileşen
// oluşturuluyor" uyarısı veriyor (state her render'da sıfırlanma riski).
export function renderServiceIcon(name: string | null, className?: string) {
  const IconComponent = (name && ICON_MAP[name]) || Wrench;
  return <IconComponent className={className} aria-hidden="true" />;
}
