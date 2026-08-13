import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/utils";
import { getSiteThemeSettings } from "@/lib/supabase/queries";
import { resolveThemeTokens } from "@/lib/theme/resolve";
import { Container } from "@/components/ui/Container";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const LOGIN_PATH = "/panel/giris";
const DEFAULT_REDIRECT = "/panel";

async function signInAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  // "next" gizli alanı proxy.ts'in eklediği query param'dan geliyor (bkz.
  // lib/supabase/proxy.ts) — kullanıcı /panel/mesajlar gibi belirli bir
  // sayfaya gitmek isterken buraya düştüyse, girişten sonra oraya dönsün.
  const rawNext = String(formData.get("next") ?? "");

  // Hata durumunda da "next"i kaybetmemek için yönlendirme URL'sine tekrar
  // ekleniyor — kullanıcı yanlış şifre girip tekrar denediğinde asıl
  // hedefini kaybetmesin.
  const nextQuery = rawNext ? `&next=${encodeURIComponent(rawNext)}` : "";

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`${LOGIN_PATH}?hata=${encodeURIComponent("E-posta veya şifre hatalı.")}${nextQuery}`);
  }

  // Açık yönlendirme (open redirect) koruması: "next" sadece /panel altında
  // bir yolsa kabul edilir, /panel/giris'in kendisine dönmesi de engellenir
  // (aksi halde anlamsız bir "giriş yaptım, tekrar giriş sayfasındayım"
  // durumu oluşurdu) — bkz. lib/utils.ts, docs/GUVENLIK.md.
  const destination = getSafeRedirectPath(rawNext, {
    prefix: "/panel",
    exclude: [LOGIN_PATH],
    fallback: DEFAULT_REDIRECT,
  });

  redirect(destination);
}

// Kayıt olma formu YOK (bilinçli — bkz. docs/PRD.md, tek admin kullanıcısı
// panelden değil Supabase Dashboard'dan oluşturulur). Zaten oturumu olan
// bir kullanıcı buraya gelirse proxy.ts onu /panel'e geri yönlendirir.
export default async function PanelGirisPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; next?: string }>;
}) {
  const [{ hata, next }, themeSettings] = await Promise.all([searchParams, getSiteThemeSettings()]);

  // KISITLAR: "giriş sayfası her zaman düz açık temayla açılsın" — tenant'ın
  // koyu ayarından/ziyaretçinin daha önce seçtiği koyu tercihinden BAĞIMSIZ.
  // app/layout.tsx'teki kök engelleyici script <html>'i (muhtemelen koyu)
  // uyguladıktan hemen sonra, bu sayfaya özel bir ikinci script AYNI
  // <html>'i koşulsuz açık moda zorluyor — "son yazan kazanır" (Next.js'in
  // preventing-flash-before-hydration kılavuzundaki AYNI teknik, bkz.
  // app/layout.tsx'teki yorum). Switch (aşağıda) yine de normal çalışır;
  // sadece İLK açılış her zaman açık — bir sonraki ziyarette de böyle kalır
  // çünkü bu script localStorage'a hiç bakmıyor.
  const lightTokens = resolveThemeTokens({ ...themeSettings, themeMode: "light" });
  const lightTokensJson = JSON.stringify(lightTokens.styleVars).replace(/</g, "\\u003c");
  const forceLightScript = `(function(){var h=document.documentElement;h.setAttribute("data-theme","light");var t=${lightTokensJson};for(var k in t){h.style.setProperty(k,t[k])}})();`;

  return (
    <div className="flex min-h-full items-center justify-center bg-surface py-16">
      <script dangerouslySetInnerHTML={{ __html: forceLightScript }} />
      <Container className="max-w-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-h3 font-bold text-text">Panel Girişi</h1>
          <ThemeToggle settings={themeSettings} forceInitialMode="light" />
        </div>

        {hata && (
          <p
            role="alert"
            className="mt-6 rounded-md border border-error bg-surface-raised px-4 py-3 text-base text-error"
          >
            {hata}
          </p>
        )}

        <form action={signInAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next ?? ""} />
          <TextField label="E-posta" name="email" type="email" autoComplete="email" required />
          <TextField
            label="Şifre"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="w-full">
            Giriş Yap
          </Button>
        </form>
      </Container>
    </div>
  );
}
