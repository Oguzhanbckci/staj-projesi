import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// SUNUCU-ÖZEL — next/headers kullanır, bu yüzden SADECE Server Action'dan
// (components/site/contact/actions.ts) import edilir, hiçbir Client
// Component bu dosyayı import ETMEMELİ (next/headers tarayıcıda çalışmaz,
// Next.js build'i reddeder). İstemci-güvenli honeypot mantığı ayrı bir
// dosyada: lib/security/contactHoneypot.ts — gerekçe orada.

// Vercel (ve çoğu proxy/CDN) `x-forwarded-for`'u "istemci, proxy1, proxy2..."
// sırasıyla ekler — ilk değer gerçek istemci IP'si. Yerel `next dev`'de bu
// başlık genelde HİÇ gelmez (önünde bir proxy yok) — bu durumda `null`
// dönülür, çağıran taraf (checkContactRateLimit) bunu "hız sınırını atla"
// olarak yorumlar; geliştiriciyi kendi testinde yanlışlıkla kilitlemez.
export async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return headerList.get("x-real-ip");
}

export const CONTACT_RATE_LIMIT_MAX_SUBMISSIONS = 3;
export const CONTACT_RATE_LIMIT_WINDOW_MINUTES = 15;

export interface RateLimitResult {
  allowed: boolean;
  /** Sadece allowed:false iken dolu — kullanıcıya gösterilecek bekleme süresi. */
  retryAfterMinutes?: number;
}

// KISITLAR: "hız sınırı sunucu tarafında olsun" — bu fonksiyon sadece
// Server Action'dan (actions.ts) çağrılır, hiçbir istemci kodu bu sayacı
// göremez/etkileyemez. Sayaç ayrı bir servis (Redis vb.) DEĞİL,
// contact_messages'ın kendisi sorgulanarak tutuluyor (bkz. migration
// 20260817130000 — service role zaten bu tabloyu tam okuyor/yazıyor,
// yeni bir bağımlılık gerekmedi). Bilinçli tercih: Vercel serverless'te
// instance'lar arası paylaşılmayan bellek-içi bir sayaç güvenilir
// olmazdı (bkz. docs/GUVENLIK.md, "neden bellek-içi değil" gerekçesi).
export async function checkContactRateLimit(
  supabase: SupabaseClient,
  tenantId: string,
  ip: string | null
): Promise<RateLimitResult> {
  // IP okunamadıysa (yerel geliştirme, ya da beklenmeyen bir proxy
  // yapılandırması) hız sınırı UYGULANMAZ — "false positive'te kullanıcının
  // mesajını kaybetme" ilkesiyle aynı gerekçe: IP olmadan kimin kim
  // olduğunu güvenilir şekilde ayırt edemeyiz, o zaman hiç engellemeyiz.
  if (!ip) {
    return { allowed: true };
  }

  const windowStart = new Date(
    Date.now() - CONTACT_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { count, error } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("sender_ip", ip)
    .gte("created_at", windowStart);

  if (error) {
    // Sayım sorgusu başarısız olursa (geçici DB sorunu vb.) formu
    // TAMAMEN kilitlemek yanlış pozitiften daha kötü bir kullanıcı
    // deneyimi olurdu — hatayı sunucuya logla, gönderime izin ver.
    console.error("checkContactRateLimit sayım hatası:", error);
    return { allowed: true };
  }

  if ((count ?? 0) >= CONTACT_RATE_LIMIT_MAX_SUBMISSIONS) {
    return { allowed: false, retryAfterMinutes: CONTACT_RATE_LIMIT_WINDOW_MINUTES };
  }

  return { allowed: true };
}
