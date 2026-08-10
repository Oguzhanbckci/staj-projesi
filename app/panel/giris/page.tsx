import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

async function signInAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/panel/giris?hata=${encodeURIComponent("E-posta veya şifre hatalı.")}`);
  }

  redirect("/panel");
}

// Kayıt olma formu YOK (bilinçli — bkz. docs/PRD.md, tek admin kullanıcısı
// panelden değil Supabase Dashboard'dan oluşturulur). Zaten oturumu olan
// bir kullanıcı buraya gelirse proxy.ts onu /panel'e geri yönlendirir.
export default async function PanelGirisPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  const { hata } = await searchParams;

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
