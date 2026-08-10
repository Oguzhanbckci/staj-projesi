import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

// RLS'i bypass eder — yalnızca sunucu tarafında (Server Component, Route
// Handler) çağrılır. Tarayıcıya asla import edilmemeli. Kullanıcı
// oturumundan bağımsız — herkese açık içerik sorguları (getServices vb.)
// için, panel/auth ile ilgisi yok.
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase ortam değişkenleri eksik — .env.local dosyasını kontrol et (bkz. .env.local.example)."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/**
 * Anon key + oturum çerezi kullanır (RLS'e tabidir, service role DEĞİLDİR).
 * Server Component, Server Action ve Route Handler'da "şu an giriş yapmış
 * kullanıcı kim" sorusunu cevaplamak için — panel auth'un tamamı bu
 * fonksiyon üzerinden akar (bkz. docs/GUVENLIK.md "Kimlik Doğrulama Akışı").
 * Her çağrıda taze bir client döner (cookies() istek bazlı olduğu için
 * önbelleklenmez).
 *
 * `setAll` içindeki try/catch: Server Component'ler çerez YAZAMAZ (Next.js
 * kısıtı) — bu satır sadece Server Action/Route Handler'dan çağrıldığında
 * gerçekten çerez yazar. Server Component'ten gelen çağrılarda sessizce
 * yok sayılır çünkü oturumun tazelenmesi zaten middleware'in işi (bkz.
 * lib/supabase/middleware.ts) — burada tekrar denemeye gerek yok.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component'ten çağrıldı — yok sayılabilir (yukarıdaki not).
          }
        },
      },
    }
  );
}
