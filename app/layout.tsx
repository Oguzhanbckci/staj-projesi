import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Inter, Poppins, Work_Sans } from "next/font/google";
import { getSiteThemeSettings } from "@/lib/supabase/queries";
import { resolveThemeTokens } from "@/lib/theme/resolve";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Panelden seçilebilen 5 font ailesinden 4'ü (bkz. lib/theme/fonts.ts,
// Geist Sans yukarıda zaten yüklü) — hangisi seçili olursa olsun HEPSİ
// build zamanında yükleniyor, runtime'da hangisinin kullanılacağına
// --font-sans değişkeni karar veriyor (next/font, font seçimini çalışma
// zamanı verisine göre şartlı yapmaya izin vermiyor). Detay:
// docs/TEMA-MIMARISI.md "Yeni tema nasıl eklenir".
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Poppins değişken ağırlık desteklemiyor (next/font/google) — sabit bir
// ağırlık dizisi gerekiyor; docs/TASARIM-SISTEMI.md madde 3'ün "en fazla
// 700" kuralına uygun 4 ağırlık seçildi.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

// create-next-app'in varsayılan yer tutucu metni yerine genel bir varsayılan
// — (site) route grubu kendi generateMetadata()'sıyla bunu ezer (bkz.
// app/(site)/layout.tsx), bu sadece panel gibi henüz kendi metadata'sı
// olmayan rotalar için bir yedek.
export const metadata: Metadata = {
  title: "Kurumsal Web Sitesi Hizmeti",
  description: "İnşaat firmaları için yönetilen kurumsal web sitesi hizmeti.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const themeSettings = await getSiteThemeSettings();
  const { dataTheme, styleVars } = resolveThemeTokens(themeSettings);

  return (
    <html
      lang="en"
      data-theme={dataTheme}
      style={styleVars as CSSProperties}
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${inter.variable} ${poppins.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
