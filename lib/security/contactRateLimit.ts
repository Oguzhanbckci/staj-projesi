import type { SupabaseClient } from "@supabase/supabase-js";

// SUNUCU-ÖZEL — dolaylı olarak next/headers kullanan lib/security/getClientIp.ts'e
// bağımlı, bu yüzden SADECE Server Action'dan (components/site/contact/actions.ts)
// import edilir, hiçbir Client Component bu dosyayı import ETMEMELİ. İstemci-güvenli
// honeypot mantığı ayrı bir dosyada: lib/security/contactHoneypot.ts — gerekçe orada.
//
// IP tespiti (pickTrustedClientIp/getClientIp) 2026-08-18'de (dokuzuncu oturum)
// lib/security/getClientIp.ts'e taşındı — panel giriş hız sınırının
// (lib/security/loginRateLimit.ts) da AYNI mantığa ihtiyacı olduğu için
// paylaşılan bir dosyaya çıkarıldı (bkz. docs/KARAR-GUNLUGU.md).
//
// 2026-08-18 DÜZELTMESİ (dokuzuncu oturumun kendi çok-ajanlı review'ü):
// Önceki sürüm ayrı bir `checkContactRateLimit` (SELECT COUNT) fonksiyonuydu,
// gerçek INSERT ise submitContactForm'da (actions.ts) AYRI bir adımda
// yapılıyordu — bu "check-then-act" deseni ATOMIK DEĞİLDİ: loginRateLimit.ts
// ile AYNI sınıf açık (eşzamanlı istekler hız sınırını atlatabiliyordu).
// Çözüm: sayım + gerçek insert artık TEK bir Postgres fonksiyonunda
// (`submit_contact_message_if_allowed`), (tenant_id, IP) bazlı bir
// `pg_advisory_xact_lock` ile serileştirilmiş olarak atomik çalışıyor (bkz.
// supabase/migrations/20260818150000_add_atomic_rate_limit_functions.sql).
export const CONTACT_RATE_LIMIT_MAX_SUBMISSIONS = 3;
export const CONTACT_RATE_LIMIT_WINDOW_MINUTES = 15;

export interface ContactSubmissionInput {
  tenantId: string;
  ip: string | null;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  subject: string;
  message: string;
}

export type ContactSubmissionResult =
  | { status: "success"; messageId: string }
  | { status: "rate_limited"; retryAfterMinutes: number }
  | { status: "error" };

// KISITLAR: "hız sınırı sunucu tarafında olsun", "yanlış pozitifte
// kullanıcının mesajını kaybetme". Sayaç ayrı bir servis (Redis vb.)
// DEĞİL, contact_messages'ın kendisi sorgulanarak tutuluyor. Bilinçli
// tercih: Vercel serverless'te instance'lar arası paylaşılmayan bellek-içi
// bir sayaç güvenilir olmazdı (bkz. docs/GUVENLIK.md, "neden bellek-içi
// değil" gerekçesi) — ama DB sorgusu bile, check ile write AYRI adımlarda
// olduğunda yeterli değildi, bu yüzden ikisi artık tek bir atomik RPC.
export async function submitContactMessageIfAllowed(
  supabase: SupabaseClient,
  input: ContactSubmissionInput
): Promise<ContactSubmissionResult> {
  const { data, error } = await supabase.rpc("submit_contact_message_if_allowed", {
    p_tenant_id: input.tenantId,
    p_ip: input.ip,
    p_max_per_window: CONTACT_RATE_LIMIT_MAX_SUBMISSIONS,
    p_window_minutes: CONTACT_RATE_LIMIT_WINDOW_MINUTES,
    p_sender_name: input.senderName,
    p_sender_email: input.senderEmail,
    p_sender_phone: input.senderPhone,
    p_subject: input.subject,
    p_message: input.message,
  });

  if (error) {
    console.error("submitContactMessageIfAllowed RPC hatası:", error);
    return { status: "error" };
  }

  const row = data?.[0] as { allowed: boolean; message_id: string | null } | undefined;
  if (!row) {
    console.error("submitContactMessageIfAllowed beklenmeyen boş sonuç döndü");
    return { status: "error" };
  }

  if (!row.allowed) {
    return { status: "rate_limited", retryAfterMinutes: CONTACT_RATE_LIMIT_WINDOW_MINUTES };
  }

  return { status: "success", messageId: row.message_id! };
}
