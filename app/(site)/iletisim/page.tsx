import type { Metadata } from "next";
import { ContactSection } from "@/components/site/contact/ContactSection";
import { getSiteSettings } from "@/lib/supabase/queries";

// İletişim artık ana sayfanın bir bölümü değil, ayrı bir sayfa (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-13). Navbar'daki "İletişim" butonu ve
// Eylem Çağrısı'nın buton linki de buraya (/iletisim) işaret edecek
// şekilde güncellendi.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const tenantName = settings?.tenantName ?? "Firma";
  return { title: `İletişim | ${tenantName}` };
}

export default function IletisimPage() {
  return <ContactSection />;
}
