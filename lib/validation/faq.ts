import { z } from "zod";

// lib/validation/service.ts ile aynı ilke.
export const faqFormSchema = z.object({
  question: z
    .string({ error: "Soru zorunludur." })
    .trim()
    .min(5, { error: "Soru en az 5 karakter olmalıdır." })
    .max(200, { error: "Soru en fazla 200 karakter olabilir." }),

  answer: z
    .string({ error: "Cevap zorunludur." })
    .trim()
    .min(5, { error: "Cevap en az 5 karakter olmalıdır." })
    .max(1000, { error: "Cevap en fazla 1000 karakter olabilir." }),

  isPublished: z.boolean(),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;
