import { ImageResponse } from "next/og";
import { getSiteSettings, getSiteThemeSettings } from "@/lib/supabase/queries";
import { resolveThemeTokens } from "@/lib/theme/resolve";
import { pickReadableTextColor } from "@/lib/theme/contrast";

// KISITLAR: "yoksa site adıyla otomatik bir görsel üret" — panelden bir
// paylaşım görseli yüklenmemişse app/(site)/layout.tsx bu rotayı
// openGraph.images olarak kullanır (bkz. o dosyadaki yorum). Gerçek marka
// rengini kullanıyor (statik bir renk DEĞİL) — mevcut resolveThemeTokens()/
// pickReadableTextColor() (WCAG-doğru, lib/theme/contrast.ts) yeniden
// kullanılıyor, aynı hesap panelin canlı önizlemesinde de geçerli.
export async function GET() {
  const [settings, themeSettings] = await Promise.all([
    getSiteSettings(),
    getSiteThemeSettings(),
  ]);

  const { styleVars } = resolveThemeTokens(themeSettings);
  const brandColor = styleVars["--color-brand"];
  const textColor = pickReadableTextColor(brandColor);
  const siteName = settings?.tenantName ?? "Kurumsal Web Sitesi";
  const slogan = settings?.slogan;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: brandColor,
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: textColor,
            textAlign: "center",
          }}
        >
          {siteName}
        </div>
        {slogan && (
          <div
            style={{
              marginTop: 24,
              fontSize: 32,
              color: textColor,
              textAlign: "center",
              opacity: 0.85,
            }}
          >
            {slogan}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
