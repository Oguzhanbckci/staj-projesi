import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { Mail, ShieldCheck, TriangleAlert } from "lucide-react";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/utils";
import { getClientIp } from "@/lib/security/getClientIp";
import { checkAndReserveLoginAttempt, releaseLoginAttempt } from "@/lib/security/loginRateLimit";
import { getSiteThemeSettings } from "@/lib/supabase/queries";
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

  // `login_attempts`'e (RLS'te ne anon ne authenticated erişebiliyor, bkz.
  // migration 20260818140000) sadece service role yazabilir/okuyabilir —
  // checkContactRateLimit'in contact_messages'ı sorgulamasıyla AYNI desen.
  // BİLEREK signInWithPassword'dan ÖNCE kontrol ediliyor: kilitliyken
  // doğru şifre girilse bile Supabase Auth'a hiç istek gitmiyor (bkz.
  // docs/KARAR-GUNLUGU.md, 2026-08-18 dokuzuncu oturum — "kilitlesin").
  //
  // checkAndReserveLoginAttempt ATOMIK: sayım + rezervasyon (bu denemenin
  // sayaca yansıması) TEK bir Postgres fonksiyonunda gerçekleşiyor — bir
  // öncekinin "önce say, sonra ayrı INSERT" deseni bu oturumun kendi
  // review'ünde paralel isteklerle atlatılabilir bulundu, bkz.
  // supabase/migrations/20260818150000_add_atomic_rate_limit_functions.sql.
  const ip = await getClientIp();
  const rateLimitClient = createServiceRoleClient();

  const rateLimit = await checkAndReserveLoginAttempt(rateLimitClient, ip);
  if (!rateLimit.allowed) {
    redirect(
      `${LOGIN_PATH}?hata=${encodeURIComponent(`Çok fazla başarısız giriş denemesi. Lütfen ${rateLimit.retryAfterMinutes} dakika sonra tekrar deneyin.`)}${nextQuery}`
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Rezervasyon zaten checkAndReserveLoginAttempt'te oluşturuldu — bu
    // başarısız deneme sayaca çoktan yansımış durumda, ekstra bir kayıt
    // adımına gerek yok.
    redirect(`${LOGIN_PATH}?hata=${encodeURIComponent("E-posta veya şifre hatalı.")}${nextQuery}`);
  }

  // Başarılı giriş — bu denemenin rezervasyonunu kaldır, doğru şifre girmek
  // kalan hakkı tüketmesin.
  await releaseLoginAttempt(rateLimitClient, rateLimit.attemptId);

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
          // 2026-08-21 denetimi: bu listede --color-brand YOKTU ve sayfa
          // ona İKİ yerden bağlıydı. (1) Gönder butonu `text-brand!` ile
          // beyaz zemin üzerine tema marka rengini basıyordu: koyu tema +
          // "modern-koyu" ön ayarında #2bd1c9 / beyaz = 1.90:1, yani
          // pratikte okunamaz; kurumsal-mavi + koyuda 4.06:1 ile AA altı.
          // Yalnızca açık + kurumsal-mavi (6.12:1) geçiyordu — muhtemelen
          // test edilen tek kombinasyon. Buton artık `text-hero!`
          // kullanıyor (aşağıda), marka rengine hiç bağlı değil.
          // (2) TextField/PasswordField'ın `focus-visible:ring-brand`
          // odak halkası bg-hero üzerinde 2.76:1 (koyu) / 1.63:1 (açık)
          // veriyordu — WCAG 2.4.11/1.4.11 eşiği 3:1. Marka rengi burada
          // beyaza sabitlenince halka iki temada da 9.97:1 / 11.19:1.
          "--color-brand": "#ffffff",
          // Form alanı kenarı: --color-control 2026-08-21'de eklendi ve
          // globaldeki değeri (gri #828d9e/#6b7688) bu camsı yüzeyde
          // yabancı durur. Beyaz-saydam karşılığı 0.28'den 0.45'e
          // çıkarıldı: hero zeminine karşı 3.35:1 (açık) / 3.57:1 (koyu),
          // yani kenar artık sayfadan ayrışıyor. Camsı dolgunun kendisine
          // karşı 2.0:1'de kalıyor — tasarım bilinçli olarak yarı saydam,
          // kontrolü çevreleyen sınır baskın komşusu olan zemine karşı
          // eşiği geçiyor.
          "--color-control": "rgba(255,255,255,0.45)",
        } as CSSProperties
      }
    >
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
        {/* KISITLAR: "giriş sayfası her zaman düz açık temayla açılsın" —
            `forceInitialMode="light"` tek başına yeterli: ThemeToggle
            kendi `useLayoutEffect`'inde bunu tenant'ın koyu ayarından/
            localStorage'daki tercihten BAĞIMSIZ olarak zaten uyguluyor
            (bkz. ThemeToggle.tsx, `mode` öncelik sırası). Önceden burada
            AYRICA bir `forceLightScript` (ham <script>) vardı — hydration
            öncesi milisaniyelik bir FOUC'u önlemek için — ama React 19'da
            gövdede render edilen HER <script> için (type ne olursa olsun)
            "Encountered a script tag" dev uyarısı verdiği görüldü; bu
            düşük trafikli/kritik olmayan sayfa için kaldırıldı, kod
            basitleşti (bkz. docs/KARAR-GUNLUGU.md, 2026-08-18 dokuzuncu
            oturum). Switch yine de normal çalışır. */}
        <ThemeToggle settings={themeSettings} forceInitialMode="light" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex animate-fade-in-up flex-col items-center text-center motion-reduce:animate-none">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-caption font-semibold text-white">
            <ShieldCheck size={14} aria-hidden="true" />
            Yönetim Paneli
          </span>
          {/* Gerçek bir <h1> — TextScramble kendisi <span> render ediyor, o
              yüzden burada sarmalanmalı. 2026-08-19'da e2e testi bunun eksik
              olduğunu yakaladı: sayfa görsel olarak başlıklıydı ama semantik
              olarak HİÇ başlık elemanı yoktu (8. oturumun tasarım
              yenilemesinde girmiş). /ekip ve /iletisim'de 2026-08-18'de
              düzeltilen hatanın aynısı — o taramada giriş sayfası kapsam
              dışı kalmıştı. TextScramble tek yerde kullanıldığı için
              bileşene `as` prop'u EKLENMEDİ (bkz. TASARIM-SISTEMI.md 9.8). */}
          <h1 className="mt-4">
            <TextScramble text="Panel Girişi" className="block text-h2 font-bold text-white" />
          </h1>
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
                için normal className sırası kazananı garanti etmiyordu.
                `text-brand!` DEĞİL `text-hero!`: marka rengi panelden
                değiştirilebiliyor ve bazı ön ayarlarda beyaz üzerinde
                okunmuyordu (yukarıdaki token bloğundaki ölçümler).
                --color-hero bu sayfanın kendi zemini, beyaz üzerinde
                9.97:1 / 11.19:1. */}
            <Button type="submit" className="w-full bg-white! text-hero!">
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
