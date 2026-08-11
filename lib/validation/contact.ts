import { z } from "zod";

// Saf bir modül — React'e, Next.js'e ya da herhangi bir istemci/sunucu
// API'sine bağımlı değil. `components/site/contact/ContactForm.tsx`
// (tarayıcı, canlı doğrulama) ve `components/site/contact/actions.ts`
// (Server Action, gerçek sunucu doğrulaması) AYNI şemayı import eder —
// kural iki yerde ayrı ayrı yazılıp birbirinden sapmaz (bkz. KISITLAR).
// İleride app/api/contact/ (veya bu Server Action'ın kendisi)
// contact_messages'a yazarken de aynı şema kullanılmalı.

export const CONTACT_SUBJECTS = [
  "genel-bilgi",
  "proje-teklifi",
  "is-birligi",
  "sikayet-oneri",
  "diger",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const CONTACT_SUBJECT_LABELS: Record<ContactSubject, string> = {
  "genel-bilgi": "Genel Bilgi",
  "proje-teklifi": "Proje Teklifi",
  "is-birligi": "İş Birliği",
  "sikayet-oneri": "Şikayet / Öneri",
  diger: "Diğer",
};

// DB'den gelen `subject` sütunu serbest `text` (bilerek CHECK constraint
// yok, bkz. supabase/migrations/20260814130000_...) — panelde gösterirken
// bilinmeyen/eski bir değer sayfayı çökertmesin diye güvenli bir
// eşleme. `components/panel/mesajlar/` ekranlarında kullanılır.
export function getContactSubjectLabel(subject: string | null): string {
  if (!subject) return "—";
  return subject in CONTACT_SUBJECT_LABELS
    ? CONTACT_SUBJECT_LABELS[subject as ContactSubject]
    : subject;
}

// Telefon opsiyonel — boş string de geçerli sayılır (alan boş
// bırakılabilir), ama bir şey girildiyse sadece rakam/boşluk/+()- kabul
// edilir. Format zorunluluğu yok (ülke kodu, boşluklama serbest) — amaç
// bariz hatalı girdiyi (harf/sembol) yakalamak, katı bir E.164 doğrulaması
// dayatmak değil.
const phoneField = z
  .string()
  .trim()
  .max(20, { error: "Telefon numarası en fazla 20 karakter olabilir." })
  .regex(/^[0-9+()\s-]*$/, {
    error: "Telefon numarası sadece rakam ve + ( ) - boşluk içerebilir.",
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

  phone: phoneField,

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

// Form alanı adı -> ekranda gösterilecek Türkçe etiket. Hata özetinde
// ("Formda şu hatalar var: Ad Soyad: ...") ve <label>'larla tutarlı
// kalması için tek yerde tutuluyor.
export const CONTACT_FIELD_LABELS: Record<keyof ContactFormValues, string> = {
  fullName: "Ad Soyad",
  email: "E-posta",
  phone: "Telefon",
  subject: "Konu",
  message: "Mesaj",
};
