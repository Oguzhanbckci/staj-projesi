import { z } from "zod";
import { BORDER_RADIUS_SCALE_KEYS } from "@/lib/theme/radiusScales";
import { FONT_FAMILY_KEYS } from "@/lib/theme/fonts";

// lib/validation/contact.ts'teki phoneField'la BİLEREK aynı kural
// (küçük tekrar — o dosyada export edilmiyor, bkz. docs/TASARIM-SISTEMI.md
// madde 9.8).
const phoneField = z
  .string()
  .trim()
  .max(20, { error: "Telefon numarası en fazla 20 karakter olabilir." })
  .regex(/^[0-9+()\s-]*$/, {
    error: "Telefon numarası sadece rakam ve + ( ) - boşluk içerebilir.",
  })
  .optional()
  .or(z.literal(""));

const hexColorField = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, { error: "Geçerli bir hex renk girin (ör. #2561c1)." })
  .optional()
  .or(z.literal(""));

const socialUrlField = z
  .url({ error: "Geçerli bir bağlantı girin (ör. https://facebook.com/firmaniz)." })
  .optional()
  .or(z.literal(""));

export const themeSettingsFormSchema = z.object({
  companyName: z
    .string({ error: "Firma adı zorunludur." })
    .trim()
    .min(2, { error: "Firma adı en az 2 karakter olmalıdır." })
    .max(120, { error: "Firma adı en fazla 120 karakter olabilir." }),

  slogan: z.string().trim().max(160, { error: "Slogan en fazla 160 karakter olabilir." }).optional().or(z.literal("")),

  primaryColor: hexColorField,
  secondaryColor: hexColorField,

  borderRadiusScale: z.enum(BORDER_RADIUS_SCALE_KEYS).optional().or(z.literal("")),
  fontFamilyKey: z.enum(FONT_FAMILY_KEYS).optional().or(z.literal("")),

  address: z.string().trim().max(200, { error: "Adres en fazla 200 karakter olabilir." }).optional().or(z.literal("")),
  phone: phoneField,
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Geçerli bir e-posta adresi girin (ör. ad@ornek.com)." }))
    .optional()
    .or(z.literal("")),

  facebookUrl: socialUrlField,
  instagramUrl: socialUrlField,
  linkedinUrl: socialUrlField,
});

export type ThemeSettingsFormValues = z.infer<typeof themeSettingsFormSchema>;

export const THEME_FIELD_LABELS: Record<keyof ThemeSettingsFormValues, string> = {
  companyName: "Firma Adı",
  slogan: "Slogan",
  primaryColor: "Marka Rengi",
  secondaryColor: "İkincil Renk",
  borderRadiusScale: "Köşe Yarıçapı",
  fontFamilyKey: "Font Ailesi",
  address: "Adres",
  phone: "Telefon",
  email: "E-posta",
  facebookUrl: "Facebook",
  instagramUrl: "Instagram",
  linkedinUrl: "LinkedIn",
};
