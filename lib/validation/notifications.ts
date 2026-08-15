import { z } from "zod";

// tenants.contact_recipient_email — iletişim formu mesajlarının bildirim
// e-postasının gideceği adres (bkz. docs/VERİ-MODELİ.md, "operasyonel bir
// alan"). Opsiyonel: boş bırakılırsa e-posta bildirimi sessizce devre dışı
// kalır, mesaj yine de panelde görünür (bkz. lib/email/resend.ts).
export const notificationSettingsFormSchema = z.object({
  recipientEmail: z
    .string()
    .trim()
    .pipe(z.email({ error: "Geçerli bir e-posta adresi girin (ör. bilgi@firmaniz.com)." }))
    .optional()
    .or(z.literal("")),
});

export type NotificationSettingsFormValues = z.infer<typeof notificationSettingsFormSchema>;

export const NOTIFICATION_FIELD_LABELS: Record<keyof NotificationSettingsFormValues, string> = {
  recipientEmail: "Bildirim E-postası",
};
