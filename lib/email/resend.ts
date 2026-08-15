import { Resend } from "resend";
import type { ContactNotificationEmail } from "@/lib/email/contactNotification";

// docs/KARAR-GUNLUGU.md (2026-08-18, dokuzuncu oturum): Resend seçildi —
// domain doğrulaması olmadan `onboarding@resend.dev` gönderen adresiyle
// hemen çalışıyor, ücretsiz plan küçük bir iletişim formu trafiği için
// yeterli. `RESEND_API_KEY` tanımsızsa (yerel geliştirmede henüz
// ayarlanmadıysa, ya da müşteri bilerek bu özelliği kullanmak
// istemiyorsa) client oluşturulmaz — çağıran taraf (sendContactNotificationEmail)
// bunu sessiz bir "gönderilmedi" olarak ele alır, HATA FIRLATMAZ (bkz.
// aşağıdaki fonksiyon — iletişim formunun kendisi bu yüzden asla bozulmaz).
let cachedClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) cachedClient = new Resend(apiKey);
  return cachedClient;
}

const DEFAULT_FROM_EMAIL = "onboarding@resend.dev";

// submitContactForm bu fonksiyonu DB kaydı BAŞARILI olduktan sonra çağırır
// ve dönen sonucu ziyaretçiye hiç yansıtmaz (bkz. docs/KARAR-GUNLUGU.md —
// "e-posta gönderimi BİR bildirim kanalı, gerçek kaynak her zaman DB
// kaydı + panel"). Bu yüzden burada hata fırlatmak yerine her zaman bir
// sonuç nesnesi dönülür, çağıran taraf console.error ile loglar.
export async function sendContactNotificationEmail(
  toEmail: string,
  tenantName: string,
  email: ContactNotificationEmail
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const client = getResendClient();
  if (!client) {
    return { ok: false, reason: "RESEND_API_KEY tanımlı değil, e-posta gönderilmedi." };
  }

  const fromEmail = process.env.CONTACT_NOTIFICATION_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  const { error } = await client.emails.send({
    from: `${tenantName} Bildirim <${fromEmail}>`,
    to: toEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (error) {
    return { ok: false, reason: error.message ?? "Resend bilinmeyen hata döndürdü." };
  }

  return { ok: true };
}
