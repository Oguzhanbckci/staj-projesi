import { createServerSupabaseClient } from "@/lib/supabase/server";

// Panel sunucu eylemlerinin (Hizmet/Proje ekleme vb.) ortak dönüş şekli —
// KISITLAR: "Dönüş tipi tipli olsun (başarı/hata ayırt edilebilsin)".
// `fieldErrors`, doğrulama şemasının alan adlarıyla birebir eşleşir.
export type ActionResult<TFields extends string> =
  | { success: true }
  | {
      success: false;
      fieldErrors: Partial<Record<TFields, string>>;
      formError?: string;
    };

// Her admin sunucu eyleminin İLK satırı bu olmalı (bkz. docs/MIMARI.md,
// "Sunucu Eylemleri Kuralları"). Sayfa zaten panel auth'un arkasında
// (bkz. app/panel/(protected)/layout.tsx) ama Next.js Server Action'ları
// ayrı, doğrudan çağrılabilir uç noktalar olarak da yayınlar — sayfayı
// hiç açmadan, doğrudan eylemi çağırmaya çalışan biri olursa bu kontrol
// olmadan geçebilirdi. `getUser()` kullanılıyor, `getSession()` değil —
// aynı gerekçe her yerde (bkz. docs/GUVENLIK.md madde 5).
export async function requireAdminUser(): Promise<
  { ok: true } | { ok: false; formError: string }
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, formError: "Bu işlem için giriş yapmanız gerekiyor." };
  }

  return { ok: true };
}
