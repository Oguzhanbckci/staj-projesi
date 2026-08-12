import type { Metadata } from "next";
import type { ReactNode } from "react";

// `/panel` altındaki HER rotayı (giriş sayfası + korumalı alan, ikisi de
// bu layout'un altında) tek noktadan kapsar. `robots.txt`'teki
// `Disallow: /panel` (bkz. app/robots.ts) sadece uyumlu botların
// TARAMASINI engeller — bir bot elinde zaten bu adrese bir link varsa
// (ör. biri yanlışlıkla paylaşırsa) yine de DİZİNE ekleyebilir, sadece
// içeriğini okuyamaz. Bu meta etiket daha kesin: "bu sayfayı hiçbir
// koşulda dizine ekleme, hiçbir linkini takip etme" der — panelin
// bilerek anonim/gizli kalması gereken tasarım amacına (bkz.
// docs/PRD.md) uygun ikinci, daha güçlü bir katman.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PanelRootLayout({ children }: { children: ReactNode }) {
  return children;
}
