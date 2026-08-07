// RLS politikalarını anon key ve authenticated (test) kullanıcısıyla
// karşılaştırmalı olarak sınayan geçici doğrulama script'i.
// Çalıştırma: node --env-file=.env.local scripts/test-rls.mjs
//
// Gerekli .env.local değişkenleri:
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
//   SUPABASE_SERVICE_ROLE_KEY (mevcut), TEST_AUTH_EMAIL, TEST_AUTH_PASSWORD
//   (geçici — Supabase Auth'ta oluşturulmuş bir test kullanıcısının bilgileri).
//
// Not: anon ve authenticated için AYRI client örnekleri kullanılıyor —
// signInWithPassword() çağrıldığı client'ın oturumunu authenticated'e
// yükseltir, aynı client'ı sonradan "anon" gibi kullanmak yanlış sonuç verir.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testEmail = process.env.TEST_AUTH_EMAIL;
const testPassword = process.env.TEST_AUTH_PASSWORD;

if (!url || !anonKey || !serviceKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY ve SUPABASE_SERVICE_ROLE_KEY .env.local'de olmalı."
  );
}
if (!testEmail || !testPassword) {
  throw new Error(
    "TEST_AUTH_EMAIL ve TEST_AUTH_PASSWORD .env.local'e geçici olarak eklenmeli (Supabase Auth'ta oluşturduğunuz test kullanıcısı)."
  );
}

const anonClient = createClient(url, anonKey, { auth: { persistSession: false } });
const authClient = createClient(url, anonKey, { auth: { persistSession: false } });
const service = createClient(url, serviceKey, { auth: { persistSession: false } });

function section(title) {
  console.log(`\n=== ${title} ===`);
}

const { error: signInErr } = await authClient.auth.signInWithPassword({
  email: testEmail,
  password: testPassword,
});
if (signInErr) {
  throw new Error(`Test kullanıcısıyla giriş başarısız: ${signInErr.message}`);
}

section("READ: anon vs authenticated (services)");

const { data: anonServices, error: anonReadErr } = await anonClient
  .from("services")
  .select("id, title, is_published");
console.log(
  `anon gördü: ${anonServices?.length ?? 0} satır` +
    (anonReadErr ? ` (hata: ${anonReadErr.message})` : "")
);
console.log(
  anonServices?.some((s) => !s.is_published)
    ? "SORUN: anon taslak (is_published=false) bir satır görüyor!"
    : "OK: anon sadece yayınlanmış satırları görüyor."
);

const { data: authServices, error: authReadErr } = await authClient
  .from("services")
  .select("id, title, is_published");
console.log(
  `authenticated gördü: ${authServices?.length ?? 0} satır` +
    (authReadErr ? ` (hata: ${authReadErr.message})` : "")
);
console.log(
  (authServices?.length ?? 0) >= (anonServices?.length ?? 0)
    ? "OK: authenticated, anon'dan en az eşit/daha fazla satır görüyor (taslaklar dahil)."
    : "SORUN: authenticated, anon'dan daha az satır görüyor — beklenmedik."
);

section("READ: anon (contact_messages, tamamen kilitli olmalı)");

const { data: anonMessages, error: anonMsgErr } = await anonClient
  .from("contact_messages")
  .select("id");
console.log(
  `anon gördü: ${anonMessages?.length ?? 0} satır` +
    (anonMsgErr ? ` (hata: ${anonMsgErr.message})` : "")
);
console.log(
  (anonMessages?.length ?? 0) === 0
    ? "OK: anon contact_messages'ta hiçbir satır göremiyor."
    : "SORUN: anon contact_messages okuyabiliyor!"
);

section("READ: authenticated (contact_messages, tamamen görebilmeli)");

const { data: authMessages, error: authMsgErr } = await authClient
  .from("contact_messages")
  .select("id");
console.log(
  `authenticated gördü: ${authMessages?.length ?? 0} satır` +
    (authMsgErr ? ` (hata: ${authMsgErr.message})` : "")
);

section("WRITE: anon insert denemesi (services, reddedilmeli)");

const { data: tenantRow, error: tenantErr } = await service
  .from("tenants")
  .select("id")
  .limit(1)
  .single();
if (tenantErr || !tenantRow) {
  throw new Error(`Test için tenant bulunamadı: ${tenantErr?.message}`);
}

const { error: anonInsertErr } = await anonClient
  .from("services")
  .insert({ tenant_id: tenantRow.id, title: "RLS test - anon insert" });
console.log(
  anonInsertErr
    ? `OK: anon insert reddedildi (${anonInsertErr.message})`
    : "SORUN: anon insert başarılı oldu, olmamalıydı!"
);

section("WRITE: authenticated insert denemesi (services, başarılı olmalı)");

const { data: insertedRow, error: authInsertErr } = await authClient
  .from("services")
  .insert({ tenant_id: tenantRow.id, title: "RLS test - authenticated insert" })
  .select()
  .single();
console.log(
  authInsertErr
    ? `SORUN: authenticated insert başarısız (${authInsertErr.message})`
    : `OK: authenticated insert başarılı (id: ${insertedRow.id})`
);

if (insertedRow) {
  await service.from("services").delete().eq("id", insertedRow.id);
  console.log("(test satırı service role ile temizlendi)");
}

await authClient.auth.signOut();
console.log("\nTest tamamlandı.");
