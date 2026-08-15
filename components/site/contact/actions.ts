"use server";

import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validation/contact";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getActiveTenantId, getActiveTenantDomain } from "@/lib/supabase/queries";
import { isHoneypotFilled } from "@/lib/security/contactHoneypot";
import { submitContactMessageIfAllowed } from "@/lib/security/contactRateLimit";
import { getClientIp } from "@/lib/security/getClientIp";
import { getSiteUrl } from "@/lib/seo/getSiteUrl";
import { buildContactNotificationEmail } from "@/lib/email/contactNotification";
import { sendContactNotificationEmail } from "@/lib/email/resend";

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
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
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
  const senderPhone = result.data.phoneNumber || null;

  // KATMAN 2 — Sunucu tarafı IP-bazlı hız sınırı + gerçek kayıt, ATOMIK
  // (sayım + insert TEK Postgres fonksiyonunda, advisory lock ile
  // serileştirilmiş — bkz. lib/security/contactRateLimit.ts'teki 2026-08-18
  // düzeltme notu). Honeypot'u atlatan (ör. formu hiç render etmeden
  // doğrudan action'a POST atan) bir bot için ikinci savunma hattı. IP
  // okunamazsa (yerel geliştirme vb.) hız sınırı kendi içinde güvenli
  // varsayılana (izin ver) düşer.
  const clientIp = await getClientIp();
  const submission = await submitContactMessageIfAllowed(supabase, {
    tenantId,
    ip: clientIp,
    senderName: result.data.fullName,
    senderEmail: result.data.email,
    senderPhone,
    subject: result.data.subject,
    message: result.data.message,
  });

  if (submission.status === "rate_limited") {
    // KISITLAR: "yanlış pozitifte kullanıcının mesajını kaybetme" —
    // sahte bir "gönderildi" YERİNE dürüst, aksiyon önerir bir hata;
    // `values: raw` ile kullanıcının yazdıkları form'da kalır, yeniden
    // yazmasına gerek kalmaz.
    return {
      status: "error",
      errors: {},
      values: raw,
      formError: `Kısa süre içinde çok fazla mesaj gönderildi. Lütfen ${submission.retryAfterMinutes} dakika sonra tekrar deneyin, ya da bizi doğrudan arayın.`,
    };
  }

  if (submission.status === "error") {
    return {
      status: "error",
      errors: {},
      values: raw,
      formError: "Mesajınız gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
    };
  }

  // Bildirim e-postası — DB KAYDI ZATEN BAŞARILI OLDUKTAN SONRA, "en iyi
  // çaba" (best-effort) olarak denenir. Gerçek kaynak her zaman DB kaydı +
  // panel; bu adım başarısız olsa (RESEND_API_KEY eksik, Resend geçici
  // hatası vb.) bile ziyaretçiye dönen sonuç DEĞİŞMEZ — sadece sunucuya
  // loglanır (bkz. docs/KARAR-GUNLUGU.md, 2026-08-18 dokuzuncu oturum).
  try {
    const { data: tenantRow } = await supabase
      .from("tenants")
      .select("name, contact_recipient_email")
      .eq("id", tenantId)
      .maybeSingle();

    const recipientEmail = tenantRow?.contact_recipient_email;
    if (tenantRow && recipientEmail) {
      const tenantDomain = await getActiveTenantDomain();
      const panelMessagesUrl = `${getSiteUrl(tenantDomain)}/panel/mesajlar`;

      const email = buildContactNotificationEmail({
        tenantName: tenantRow.name,
        senderName: result.data.fullName,
        senderEmail: result.data.email,
        senderPhone,
        subject: result.data.subject,
        message: result.data.message,
        panelMessagesUrl,
      });

      const sendResult = await sendContactNotificationEmail(recipientEmail, tenantRow.name, email);
      if (!sendResult.ok) {
        console.error("submitContactForm bildirim e-postası gönderilemedi:", sendResult.reason);
      }
    }
  } catch (notifyError) {
    console.error("submitContactForm bildirim e-postası sırasında beklenmeyen hata:", notifyError);
  }

  return { status: "success", errors: {}, values: {} };
}
