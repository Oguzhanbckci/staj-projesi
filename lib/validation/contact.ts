import { z } from "zod";
import { CONTACT_SUBJECTS, PHONE_MIN_DIGITS, PHONE_MAX_DIGITS } from "./contactFields";

// Saf bir modül — React'e, Next.js'e ya da herhangi bir istemci/sunucu
// API'sine bağımlı değil. `components/site/contact/ContactForm.tsx`
// (tarayıcı, canlı doğrulama) ve `components/site/contact/actions.ts`
// (Server Action, gerçek sunucu doğrulaması) AYNI şemayı import eder —
// kural iki yerde ayrı ayrı yazılıp birbirinden sapmaz (bkz. KISITLAR).
// İleride app/api/contact/ (veya bu Server Action'ın kendisi)
// contact_messages'a yazarken de aynı şema kullanılmalı.

// Telefon numarası opsiyonel — boş string geçerli (alan boş bırakılabilir),
// ama bir şey girildiyse SADECE rakam ve gerçekçi bir uzunlukta olmalı.
// Harf/sembol veya 50-60 haneli anlamsız bir dizi artık reddedilir
// (önceki serbest-metin deseninin izin verdiği, kullanıcının bulduğu
// gerçek bir sorun).
const phoneNumberField = z
  .string()
  .trim()
  .regex(/^[0-9]*$/, { error: "Telefon numarası sadece rakam içerebilir." })
  .refine((value) => value === "" || value.length >= PHONE_MIN_DIGITS, {
    error: `Telefon numarası en az ${PHONE_MIN_DIGITS} haneli olmalıdır.`,
  })
  .refine((value) => value.length <= PHONE_MAX_DIGITS, {
    error: `Telefon numarası en fazla ${PHONE_MAX_DIGITS} haneli olabilir.`,
  })
  .optional()
  .or(z.literal(""));

export const contactFormSchema = z.object({
  fullName: z
    .string({ error: "Ad soyad zorunludur." })
    .trim()
    .min(2, { error: "Ad soyad en az 2 karakter olmalıdır." })
    .max(120, { error: "Ad soyad en fazla 120 karakter olabilir." }),

  email: z
    .string({ error: "E-posta zorunludur." })
    .trim()
    .min(1, { error: "E-posta zorunludur." })
    .pipe(z.email({ error: "Geçerli bir e-posta adresi girin (ör. ad@ornek.com)." })),

  phoneNumber: phoneNumberField,

  subject: z.enum(CONTACT_SUBJECTS, {
    error: "Lütfen listeden bir konu seçin.",
  }),

  message: z
    .string({ error: "Mesaj zorunludur." })
    .trim()
    .min(20, { error: "Mesaj en az 20 karakter olmalıdır — biraz daha detay verir misiniz?" })
    .max(2000, { error: "Mesaj en fazla 2000 karakter olabilir." }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
