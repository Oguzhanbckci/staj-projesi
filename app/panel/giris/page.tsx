import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

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
  const { hata, next } = await searchParams;

  return (
    <div className="flex min-h-full items-center justify-center bg-surface py-16">
      <Container className="max-w-sm">
        <h1 className="text-h3 font-bold text-text">Panel Girişi</h1>

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
