"use server";

import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validation/contact";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getActiveTenantId } from "@/lib/supabase/queries";
import { isHoneypotFilled } from "@/lib/security/contactHoneypot";
import { getClientIp, checkContactRateLimit } from "@/lib/security/contactRateLimit";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  errors: Partial<Record<keyof ContactFormValues, string>>;
  values: Partial<Record<keyof ContactFormValues, string>>;
  formError?: string;
}

// Aynı şemayı (lib/validation/contact.ts) istemci tarafındaki canlı
// doğrulamayla PAYLAŞIR — burada da GERÇEKTEN çalışıyor (istemci
// doğrulaması atlatılsa/devre dışı bırakılsa bile sunucu asıl hakemdir).
//
// contact_messages'a gerçek kayıt burada, service role client ile
// yapılıyor — anon'un bu tabloya HİÇBİR RLS izni yok (select de insert
// de, bkz. docs/GUVENLIK.md madde 1-2, ziyaretçi PII'si içerdiği için
// bilinçli olarak kilitli), bu yüzden RLS bypass eden service role
// GEREKLİ ve kasıtlı — "anon hiçbir koşulda yazamaz" kuralını bozmuyor,
// service role anon key'den tamamen ayrı bir güven seviyesi (bkz.
// docs/AI-KURALLARI.md madde 6.1/6.5). Panel Server Action'larının
// aksine burada requireAdminUser() YOK — bu eylem BİLEREK herkese açık,
// ziyaretçi giriş yapmadan form gönderebilmeli.
//
// Spam koruması (honeypot + IP hız sınırı) 2026-08-17'de eklendi —
// aşağıdaki iki katmana bakın, detay/gerekçe: docs/GUVENLIK.md madde 14.
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // KATMAN 1 — Gizli tuzak alan (honeypot). Gerçek bir ziyaretçi bu alanı
  // hiç görmez (bkz. ContactForm.tsx), doluysa neredeyse kesin bir bot.
  // Botu "yakalandığını" öğrenip stratejisini değiştirmesin diye BAŞARILI
  // gibi görünen bir yanıt dönülür — ama hiçbir şey DB'ye yazılmaz (bkz.
  // docs/GUVENLIK.md "Spam Koruması", katman 1'in dürüst etkinlik notu).
  if (isHoneypotFilled(formData)) {
    console.warn("submitContactForm: honeypot alanı dolu, gönderim yok sayıldı.");
    return { status: "success", errors: {}, values: {} };
  }

  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const result = contactFormSchema.safeParse(raw);

  if (!result.success) {
    const errors: ContactFormState["errors"] = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ContactFormValues;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
    return { status: "error", errors, values: raw };
  }

  const tenantId = await getActiveTenantId();
  if (!tenantId) {
    return {
      status: "error",
      errors: {},
      values: raw,
      formError: "Mesajınız gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
    };
  }

  const supabase = createServiceRoleClient();

  // KATMAN 2 — Sunucu tarafı IP-bazlı hız sınırı. Honeypot'u atlatan (ör.
  // formu hiç render etmeden doğrudan action'a POST atan) bir bot için
  // ikinci savunma hattı. IP okunamazsa (yerel geliştirme vb.)
  // checkContactRateLimit kendi içinde güvenli varsayılana (izin ver)
  // düşer — bkz. lib/security/contactRateLimit.ts.
  const clientIp = await getClientIp();
  const rateLimit = await checkContactRateLimit(supabase, tenantId, clientIp);
  if (!rateLimit.allowed) {
    // KISITLAR: "yanlış pozitifte kullanıcının mesajını kaybetme" —
    // sahte bir "gönderildi" YERİNE dürüst, aksiyon önerir bir hata;
    // `values: raw` ile kullanıcının yazdıkları form'da kalır, yeniden
    // yazmasına gerek kalmaz.
    return {
      status: "error",
      errors: {},
      values: raw,
      formError: `Kısa süre içinde çok fazla mesaj gönderildi. Lütfen ${rateLimit.retryAfterMinutes} dakika sonra tekrar deneyin, ya da bizi doğrudan arayın.`,
    };
  }

  const { error } = await supabase.from("contact_messages").insert({
    tenant_id: tenantId,
    sender_name: result.data.fullName,
    sender_email: result.data.email,
    sender_phone: result.data.phone || null,
    sender_ip: clientIp,
    subject: result.data.subject,
    message: result.data.message,
  });

  if (error) {
    console.error("submitContactForm insert hatası:", error);
    return {
      status: "error",
      errors: {},
      values: raw,
      formError: "Mesajınız gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
    };
  }

  return { status: "success", errors: {}, values: {} };
}
