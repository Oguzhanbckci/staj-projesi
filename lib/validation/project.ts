import { z } from "zod";
import { PROJECT_STATUSES } from "./projectFields";

// Aynı ilke: saf modül, hem panel formunda hem sunucu eyleminde
// kullanılır (bkz. lib/validation/service.ts).
export const projectFormSchema = z.object({
  title: z
    .string({ error: "Başlık zorunludur." })
    .trim()
    .min(2, { error: "Başlık en az 2 karakter olmalıdır." })
    .max(120, { error: "Başlık en fazla 120 karakter olabilir." }),

  description: z
    .string()
    .trim()
    .max(500, { error: "Açıklama en fazla 500 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  category: z
    .string()
    .trim()
    .max(60, { error: "Kategori en fazla 60 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  // Adres parçası. Boş bırakılırsa: yeni kayıtta başlıktan üretilir,
  // düzenlemede MEVCUT adres korunur (yayınlanmış bir adresin başlık
  // değişti diye sessizce kırılması, paylaşılmış her bağlantıyı bozardı).
  // Girilen değer yine de `slugify` ile normalize edilir, yani buradaki
  // doğrulama yalnızca uzunluk için.
  slug: z
    .string()
    .trim()
    .max(80, { error: "Adres parçası en fazla 80 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  // Boş string = "belirtilmemiş" (DB'de NULL). Kolon nullable, çünkü
  // her projenin durumunu girmeye zorlamak hızlı yayına alma akışını
  // bozardı — bkz. migration'daki gerekçe.
  status: z.enum(PROJECT_STATUSES).optional().or(z.literal("")),

  location: z
    .string()
    .trim()
    .max(120, { error: "Konum en fazla 120 karakter olabilir." })
    .optional()
    .or(z.literal("")),

  // 2026-08-20 mentör denetimi (bulgu 09): burada SADECE `^\d{0,4}$` vardı,
  // yani "202", "7", "0000" gibi değerler doğrulamadan geçiyor ama DB'deki
  // `check (year is null or year between 1800 and 2100)` kısıtına takılıyordu
  // (bkz. 20260806120000_create_content_tables.sql:164). Sonuç: kullanıcı
  // alan-bazlı bir hata yerine genel bir "sistem hatası" görüp neyi
  // düzelteceğini bilemiyordu. Aynı kalıp lib/validation/about.ts'teki
  // `foundedYear` alanında ZATEN doğru kurulmuştu — buraya taşınmamıştı.
  year: z
    .string()
    .trim()
    .regex(/^\d{0,4}$/, { error: "Yıl 4 haneli bir sayı olmalıdır." })
    .refine((value) => value === "" || (Number(value) >= 1800 && Number(value) <= 2100), {
      error: "Yıl 1800-2100 arasında olmalıdır.",
    })
    .optional()
    .or(z.literal("")),

  liveUrl: z
    .url({ error: "Geçerli bir adres girin (ör. https://ornek.com)." })
    .optional()
    .or(z.literal("")),

  isPublished: z.boolean(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
