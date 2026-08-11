import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUnreadMessagesCount } from "@/lib/supabase/panelQueries";
import { PanelShell } from "@/components/panel/PanelShell";

// Bu ağacın tamamı oturuma bağlı, asla statik üretilemez — bunu açıkça
// belirtmezsek Next.js her derlemede önce statik üretmeyi dener, çerez
// kullanımına takılıp "Dynamic server usage" hatası loglar (zararsız ama
// gürültülü, gerçek bir sorun değil). `force-dynamic`, bu denemeyi hiç
// başlatmayıp gürültüyü kesiyor — tüm alt sayfalara (page.tsx, mesajlar/
// vb.) miras kalır, her birinde ayrı ayrı tekrarlamaya gerek yok.
export const dynamic = "force-dynamic";

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
//
// ÖNEMLİ (KABUL KRİTERİ: "içerik bir an bile görünmesin"): `redirect()`
// burada, `{children}` (gerçek panel sayfası — özet sayıları, mesajlar
// vb.) render edilmeden ÖNCE çağrılıyor ve React ağacının geri kalanının
// hiç render edilmemesine (throw ederek) neden oluyor. Yani sayfanın kendi
// veri sorguları (ör. app/panel/(protected)/page.tsx'teki
// getServicesCount()) oturum yoksa ÇAĞRILMAZ bile — sızacak bir şey
// üretilmeden önce akış durur. Bkz. docs/GUVENLIK.md, "Yetkisiz Erişim
// Test Sonuçları" (gerçek bir curl testiyle doğrulandı).
export default async function ProtectedPanelLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/panel/giris");
  }

  // "Müşteri panele girer girmez görsün" — bu sayım burada, layout
  // seviyesinde çekilip PanelShell'e (kenar menüye) geçiriliyor, sadece
  // özet ekranında (page.tsx) DEĞİL — bu sayede HANGİ panel sayfasında
  // olursa olsun okunmamış sayısı menüde görünür.
  const unreadMessagesCount = await getUnreadMessagesCount();

  return (
    <PanelShell
      userEmail={user.email ?? ""}
      signOutAction={signOutAction}
      unreadMessagesCount={unreadMessagesCount}
    >
      {children}
    </PanelShell>
  );
}
