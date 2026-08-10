import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// Sadece "use client" bileşenlerinden çağrılır (ör. giriş formu, çıkış
// butonu). Anon key kullanır — RLS'e tabidir, tarayıcıya gönderilmesi
// güvenlidir (bkz. docs/GUVENLIK.md madde 3). Oturumu tarayıcıda
// (localStorage + çerez) tutar; sunucu tarafında bu fonksiyon KULLANILMAZ
// (bkz. lib/supabase/server.ts'teki createServerSupabaseClient).
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
