import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Manrope, Inter, Poppins, Work_Sans } from "next/font/google";
import { getSiteThemeSettings } from "@/lib/supabase/queries";
import { resolveThemeTokens, THEME_STORAGE_KEY } from "@/lib/theme/resolve";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Panelden seçilebilen 5 font ailesinden 4'ü (bkz. lib/theme/fonts.ts,
// Geist Sans yukarıda zaten yüklü) — hangisi seçili olursa olsun HEPSİ
// build zamanında yükleniyor, runtime'da hangisinin kullanılacağına
// --font-sans değişkeni karar veriyor (next/font, font seçimini çalışma
// zamanı verisine göre şartlı yapmaya izin vermiyor). Detay:
// docs/TEMA-MIMARISI.md "Yeni tema nasıl eklenir".
//
// `preload: false` — next/font'un otomatik <link rel="preload"> davranışı
// font fonksiyonunun çağrıldığı dosyaya göre çalışıyor (next/font docs,
// "Preloading"): root layout'ta çağrılan HER font, hangi tenant hangisini
// seçmiş olursa olsun, TÜM rotalarda preload ediliyordu. Aynı anda sadece
// TEK --font-sans kullanıldığı için (lib/theme/resolve.ts) bu fontların
// çoğu boşa indiriliyordu — Geist Sans (varsayılan preset'in fontu,
// kurumsal-mavi) hariç hepsi artık sadece gerçekten --font-sans o fonta
// çözüldüğünde indirilir (bkz. KARAR-GUNLUGU.md, Lighthouse performans
// incelemesi). Geist Mono komple kaldırıldı — kodda `font-mono` class'ı
// hiç kullanılmıyordu, %100 ölü ağırlıktı.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

// Poppins değişken ağırlık desteklemiyor (next/font/google) — sabit bir
// ağırlık dizisi gerekiyor; docs/TASARIM-SISTEMI.md madde 3'ün "en fazla
// 700" kuralına uygun 4 ağırlık seçildi.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  preload: false,
});

// create-next-app'in varsayılan yer tutucu metni yerine genel bir varsayılan
// — (site) route grubu kendi generateMetadata()'sıyla bunu ezer (bkz.
// app/(site)/layout.tsx), bu sadece panel gibi henüz kendi metadata'sı
// olmayan rotalar için bir yedek.
export const metadata: Metadata = {
  title: "Kurumsal Web Sitesi Hizmeti",
  description: "İnşaat firmaları için yönetilen kurumsal web sitesi hizmeti.",
};

// Açık/koyu tema switch'i (ThemeToggle, bkz. components/site/ThemeToggle.tsx)
// için hem açık hem koyu değerleri BURADA (sunucuda) hesaplayıp aşağıdaki
// engelleyici script'e gömüyoruz — next/dist/docs/01-app/02-guides/
// preventing-flash-before-hydration.md#themes'teki resmi "Themes" deseni.
// Script, tarayıcı HTML'i ayrıştırırken (React hydrate olmadan ÖNCE)
// senkron çalışıp localStorage'daki ziyaretçi tercihini <html>'e uygular —
// bu yüzden FOUC (yanlış temayla bir anlık görünüp sonra düzelme) olmaz.
// `suppressHydrationWarning` gerekli çünkü script <html>'i React'in
// hydrate etmeden önce değiştirebilir (bkz. aynı kılavuz, "Understanding
// suppressHydrationWarning"). CSP'de script-src zaten 'unsafe-inline'
// içeriyor (2026-08-17'de hydration hatası için eklenmişti) — nonce'a
// gerek yok.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const themeSettings = await getSiteThemeSettings();
  const light = resolveThemeTokens({ ...themeSettings, themeMode: "light" });
  const dark = resolveThemeTokens({ ...themeSettings, themeMode: "dark" });
  const active = themeSettings.themeMode === "dark" ? dark : light;

  // "</script" gibi bir alt dizinin script'i erken kapatmasını engelleyen
  // standart güvenlik önlemi (değerler zaten hex renk/px/font-var gibi
  // kontrollü veriler, ama ucuz bir ek güvence).
  const themeTokensJson = JSON.stringify({
    light: light.styleVars,
    dark: dark.styleVars,
  }).replace(/</g, "\\u003c");

  const themeScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(s!=="light"&&s!=="dark")return;var d=${themeTokensJson};var t=d[s];if(!t)return;var h=document.documentElement;h.setAttribute("data-theme",s);for(var k in t){h.style.setProperty(k,t[k])}}catch(e){}})();`;

  // `lang="tr"`: site içeriğinin tamamı Türkçe (çoklu dil PRD madde 4'te
  // kapsam dışı). Bu değer create-next-app'ten kalma "en" idi — ekran
  // okuyucular tüm Türkçe metni İngilizce fonetikle okuyor, arama
  // motorlarına da yanlış dil sinyali gidiyordu. `global-error.tsx` aynı
  // projede zaten doğru şekilde `lang="tr"` kullanıyordu; kalıp biliniyordu,
  // kök layout'a uygulanmamıştı (2026-08-20 mentör denetimi, bulgu 14).
  return (
    <html
      lang="tr"
      data-theme={active.dataTheme}
      suppressHydrationWarning
      style={active.styleVars as CSSProperties}
      className={`${geistSans.variable} ${manrope.variable} ${inter.variable} ${poppins.variable} ${workSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
