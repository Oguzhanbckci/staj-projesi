import { z } from "zod";

// lib/validation/service.ts ile aynı ilke.
export const teamMemberFormSchema = z.object({
  fullName: z
    .string({ error: "Ad Soyad zorunludur." })
    .trim()
    .min(2, { error: "Ad Soyad en az 2 karakter olmalıdır." })
    .max(120, { error: "Ad Soyad en fazla 120 karakter olabilir." }),

  role: z
    .string({ error: "Unvan zorunludur." })
    .trim()
    .min(2, { error: "Unvan en az 2 karakter olmalıdır." })
    .max(120, { error: "Unvan en fazla 120 karakter olabilir." }),

  bio: z
    .string()
    .trim()
    .max(500, { error: "Kısa biyografi en fazla 500 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  isPublished: z.boolean(),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
