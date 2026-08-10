"use server";

import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validation/contact";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  errors: Partial<Record<keyof ContactFormValues, string>>;
  values: Partial<Record<keyof ContactFormValues, string>>;
}

// Aynı şemayı (lib/validation/contact.ts) istemci tarafındaki canlı
// doğrulamayla PAYLAŞIR — burada da GERÇEKTEN çalışıyor (istemci
// doğrulaması atlatılsa/devre dışı bırakılsa bile sunucu asıl hakemdir).
//
// BAĞLAM'a göre form verisinin Supabase'e (contact_messages) kaydedilmesi
// "ileride" yapılacak bir iş — bu yüzden burada bilinçli olarak YOK.
// Doğrulama gerçek, kayıt henüz değil. Gerçek kayıt eklendiğinde:
// (1) burada createServiceRoleClient() ile contact_messages'a insert,
// (2) muhtemelen bir e-posta bildirimi (bkz. docs/DURUM.md "Sıradaki adım").
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
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

  return { status: "success", errors: {}, values: {} };
}
