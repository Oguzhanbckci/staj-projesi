import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

function readServiceRoleCredentials() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase ortam değişkenleri eksik — .env.local dosyasını kontrol et (bkz. .env.local.example)."
    );
  }

  return { supabaseUrl, serviceRoleKey };
}

// RLS'i bypass eder — yalnızca sunucu tarafında (Server Component, Route
// Handler) çağrılır. Tarayıcıya asla import edilmemeli.
export function createServiceRoleClient() {
  const { supabaseUrl, serviceRoleKey } = readServiceRoleCredentials();

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// createServiceRoleClient ile aynı, ama Database şemasını uygulamıyor.
// Sadece types/database.types.ts henüz üretilmemiş yeni kolonları (ör.
// hero_sections.variant — bkz. supabase/migrations/
// 20260808140000_add_hero_variant_and_secondary_cta.sql) sorgulayan kod
// için geçici bir kaçış yolu. Migration uygulanıp `npm run types:generate`
// çalıştırılınca o sorgu createServiceRoleClient()'e taşınmalı.
export function createUntypedServiceRoleClient() {
  const { supabaseUrl, serviceRoleKey } = readServiceRoleCredentials();

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
