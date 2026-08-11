import { getLocalBusinessData } from "@/lib/supabase/queries";
import { buildLocalBusinessJsonLd } from "@/lib/seo/localBusiness";

// Site-geneli kabul edilir (tek sayfaya özel değil) — bu yüzden
// app/(site)/layout.tsx'te, her sayfada render ediliyor (Navbar/Footer
// gibi). `dangerouslySetInnerHTML` burada güvenli: içerik kullanıcı
// girdisi değil, panelden (admin, requireAdminUser arkasında) girilmiş
// veri + JSON.stringify — script injection riski yok.
export async function LocalBusinessJsonLd() {
  const data = await getLocalBusinessData();
  if (!data) return null;

  const jsonLd = buildLocalBusinessJsonLd(data);
  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
