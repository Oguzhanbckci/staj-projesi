import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

async function signOutAction() {
  "use server";

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/panel/giris");
}

// `/panel` altındaki (giriş sayfası hariç) her şeyi saran koruma katmanı.
// `proxy.ts` zaten oturumsuz istekleri /panel/giris'e yönlendiriyor — bu,
// BAĞIMSIZ bir ikinci kontrol (Next.js'in kendi önerisi: "Always verify
// authentication ... inside each Server Function rather than relying on
// Proxy alone", bkz. lib/supabase/proxy.ts'teki yorum). `getUser()`
// kullanılıyor (çerezi Supabase sunucusuna karşı doğrular), `getSession()`
// DEĞİL (bkz. docs/GUVENLIK.md).
export default async function ProtectedPanelLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/panel/giris");
  }

  return (
    <div className="min-h-full bg-surface">
      <header className="flex items-center justify-between border-b border-neutral-300 bg-surface-raised px-6 py-4">
        <span className="text-base text-text-muted">{user.email}</span>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Çıkış Yap
          </Button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
