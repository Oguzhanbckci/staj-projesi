import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/utils";
import { getSiteThemeSettings } from "@/lib/supabase/queries";
import { resolveThemeTokens } from "@/lib/theme/resolve";
import { TextField } from "@/components/ui/TextField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TextScramble } from "@/components/ui/TextScramble";

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
    // Tek, "iç içe" kompozisyon — iki ayrı blok (sol/sağ) yerine tüm sayfa
    // markalı mavi zemin, form kartı bunun İÇİNE (cam/translucent) yerleşiyor.
    // `style` ile --color-text/--color-surface-raised/--color-neutral-300
    // token'ları BU ALT AĞAÇTA yerelde override ediliyor — TextField/
    // PasswordField/Button/ThemeToggle gibi hiçbir paylaşılan bileşene
    // dokunmadan (kod tekrarı yok), sadece CSS custom property'nin doğal
    // cascade'i sayesinde hepsi otomatik "beyaz/camsı" görünüyor. Aynı
    // teknik [data-theme="dark"]'ın globals.css'te yaptığının yerel/küçük
    // ölçekli hâli.
    <div
      className="relative flex min-h-full items-center justify-center overflow-hidden bg-hero px-4 py-12 sm:py-20"
      style={
        {
          "--color-text": "#ffffff",
          "--color-text-muted": "rgba(255,255,255,0.72)",
          "--color-surface-raised": "rgba(255,255,255,0.18)",
          "--color-neutral-300": "rgba(255,255,255,0.28)",
        } as CSSProperties
      }
    >
      <script dangerouslySetInnerHTML={{ __html: forceLightScript }} />

      {/* Hero ile aynı dekoratif doku (degrade + ince ızgara) — ürün
          genelinde tutarlı bir "markalı yüzey" dili kurmak için. */}
      <div aria-hidden="true" className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.14), transparent 45%), radial-gradient(circle at 80% 85%, rgba(255,255,255,0.1), transparent 45%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle settings={themeSettings} forceInitialMode="light" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex animate-fade-in-up flex-col items-center text-center motion-reduce:animate-none">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-caption font-semibold text-white">
            <ShieldCheck size={14} aria-hidden="true" />
            Yönetim Paneli
          </span>
          <TextScramble text="Panel Girişi" className="mt-4 block text-h2 font-bold text-white" />
          <p className="mt-3 max-w-xs text-base text-white/75">
            Sitenizi tek yerden yönetin — bu adresi sadece siz görüyorsunuz.
          </p>
        </div>

        {/* Kart — sayfanın geri kalanıyla AYNI mavi aile, sadece camsı bir
            katman olarak "iç içe" oturuyor (iki kontrast bloğu değil). */}
        <div className="animate-scale-in mt-8 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl motion-reduce:animate-none sm:p-8">
          {hata && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-md border border-error/40 bg-error/20 px-4 py-3 text-base text-white"
            >
              <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-error" />
              {hata}
            </p>
          )}

          <form action={signInAction} className="space-y-4">
            <input type="hidden" name="next" value={next ?? ""} />
            <TextField
              label="E-posta"
              name="email"
              type="email"
              autoComplete="email"
              required
              leadingIcon={<Mail size={16} aria-hidden="true" />}
            />
            <PasswordField label="Şifre" name="password" autoComplete="current-password" required />
            {/* `!` (Tailwind v4 önemli-değiştirici, sonda) BİLEREK kullanıldı
                — Button'un primary varyantı (bg-brand/text-brand-on) ile bu
                sayfaya özel tersine çevrilmiş (beyaz zemin/mavi metin, camsı
                kartta öne çıksın diye) renk aynı CSS özelliğini hedeflediği
                için normal className sırası kazananı garanti etmiyordu. */}
            <Button type="submit" className="w-full bg-white! text-brand!">
              Giriş Yap
            </Button>
          </form>

          <details className="mt-6 rounded-md border border-white/20 bg-white/5 px-4 py-3 text-caption text-white/70">
            <summary className="cursor-pointer font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Giriş yapamıyor musunuz?
            </summary>
            <p className="mt-2">
              Panel hesabı Supabase Dashboard üzerinden oluşturulur, bu
              sayfadan kayıt olunamaz. Şifrenizi unuttuysanız yöneticinizle
              iletişime geçin.
            </p>
          </details>
        </div>

        <p className="mt-6 text-center text-caption text-white/50">
          Tam yönetilen kurumsal web sitesi hizmeti
        </p>
      </div>
    </div>
  );
}
