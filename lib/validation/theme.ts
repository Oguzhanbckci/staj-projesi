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

// Native <input type="time"> zaten HH:MM (24 saat) üretir — bu regex
// sadece savunma amaçlı (elle form gönderimi gibi senaryolara karşı).
// JSON-LD openingHoursSpecification için gereken TAM biçim (bkz.
// lib/seo/localBusiness.ts).
const timeField = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Geçerli bir saat girin (ör. 09:00)." })
  .optional()
  .or(z.literal(""));

export const themeSettingsFormSchema = z
  .object({
    // Sitenin açık/koyu VARSAYILANI (ziyaretçi kendi tercihini
    // yapana kadar geçerli olan). `tenants.theme_mode` kolonuna
    // yazılır. 2026-08-21'e kadar bu kolon hiçbir kod yolundan
    // yazılmıyordu: değer yalnızca seed'den geliyordu ve panelde
    // değiştiren bir kontrol yoktu — koyu varsayılan isteyen müşteri
    // için tek çare Supabase Table Editor'dü. "Modern Koyu" ön ayarı
    // da adının çağrıştırdığının aksine siteyi koyu YAPMAZ, sadece
    // marka rengi/köşe yarıçapı/font üçlüsünü değiştirir.
    themeMode: z.enum(["light", "dark"], {
      error: "Lütfen açık veya koyu temayı seçin.",
    }),

    companyName: z
      .string({ error: "Firma adı zorunludur." })
      .trim()
      .min(2, { error: "Firma adı en az 2 karakter olmalıdır." })
      .max(120, { error: "Firma adı en fazla 120 karakter olabilir." }),

    slogan: z
      .string()
      .trim()
      .max(160, { error: "Slogan en fazla 160 karakter olabilir." })
      .optional()
      .or(z.literal("")),

    primaryColor: hexColorField,
    secondaryColor: hexColorField,

    borderRadiusScale: z.enum(BORDER_RADIUS_SCALE_KEYS).optional().or(z.literal("")),
    fontFamilyKey: z.enum(FONT_FAMILY_KEYS).optional().or(z.literal("")),

    address: z
      .string()
      .trim()
      .max(200, { error: "Adres en fazla 200 karakter olabilir." })
      .optional()
      .or(z.literal("")),
    phone: phoneField,
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: "Geçerli bir e-posta adresi girin (ör. ad@ornek.com)." }))
      .optional()
      .or(z.literal("")),
    workingHours: z
      .string()
      .trim()
      .max(200, { error: "Çalışma saatleri en fazla 200 karakter olabilir." })
      .optional()
      .or(z.literal("")),
    weekdayOpens: timeField,
    weekdayCloses: timeField,
    weekendOpens: timeField,
    weekendCloses: timeField,
    serviceAreas: z
      .string()
      .trim()
      .max(300, { error: "Hizmet verilen iller en fazla 300 karakter olabilir." })
      .optional()
      .or(z.literal("")),

    facebookUrl: socialUrlField,
    instagramUrl: socialUrlField,
    linkedinUrl: socialUrlField,
  })
  // Yarım bırakılmış bir saat çifti (ör. açılış girilmiş, kapanış boş)
  // JSON-LD'de kullanılamaz — lib/seo/localBusiness.ts zaten ikisi
  // birden dolu değilse çifti hiç eklemiyor, ama panelde bunu SESSİZCE
  // yapmak yerine kullanıcıyı burada uyarmak daha doğru (KABUL KRİTERİ:
  // "çalışma saatleri doğru formatta olsun").
  .refine((data) => !!data.weekdayOpens === !!data.weekdayCloses, {
    error: "Hafta içi açılış ve kapanış saatlerinin ikisi de girilmeli veya ikisi de boş bırakılmalı.",
    path: ["weekdayCloses"],
  })
  .refine((data) => !!data.weekendOpens === !!data.weekendCloses, {
    error: "Hafta sonu açılış ve kapanış saatlerinin ikisi de girilmeli veya ikisi de boş bırakılmalı.",
    path: ["weekendCloses"],
  });

export type ThemeSettingsFormValues = z.infer<typeof themeSettingsFormSchema>;
