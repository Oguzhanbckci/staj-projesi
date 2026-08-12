import { createClient } from "@supabase/supabase-js";

// Playwright testlerinin (Node süreci, tarayıcıya hiç gitmez) kendi
// oluşturduğu veriyi (iletişim mesajı, hizmet) temizlemesi için — RLS'i
// bypass eder. Aynı desen: lib/supabase/server.ts'teki
// createServiceRoleClient(). Testler ayrı bir Node süreci olduğu için o
// dosyayı doğrudan import etmek yerine burada kendi küçük kopyası var
// (Next.js'e özgü hiçbir şeye bağımlı değil).
export function createTestAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY eksik — .env.local dosyasını kontrol et (bkz. .env.local.example)."
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
