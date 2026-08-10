import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getContactSection } from "@/lib/supabase/queries";

// Şu an sadece statik gösterim bilgisi (adres/telefon/e-posta) — iletişim
// formu bilinçli olarak burada yok, çünkü onu gerçekten işleyecek
// app/api/contact/ route handler'ı henüz yazılmadı (bkz. docs/DURUM.md
// "Sıradaki adım"); çalışmayan bir form yerine, form gelene kadar
// tıklanabilir iletişim bilgileri gösteriliyor. Kayıt yoksa/yayında
// değilse bölüm hiç render edilmez (diğer bölümlerle aynı ilke).
export async function ContactSection() {
  const contact = await getContactSection();
  if (!contact) return null;

  return (
    <section id="iletisim" className="bg-surface-raised py-16 sm:py-24">
      <Container>
        <SectionHeader
          title="İletişim"
          description="Projeniz hakkında konuşmak için bize ulaşın."
          headingLevel="h2"
        />
        <ul className="mt-8 space-y-3 text-base text-text">
          {contact.address && <li>{contact.address}</li>}
          {contact.phone && (
            <li>
              <a
                href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                className="font-semibold text-brand hover:underline"
              >
                {contact.phone}
              </a>
            </li>
          )}
          {contact.email && (
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="font-semibold text-brand hover:underline"
              >
                {contact.email}
              </a>
            </li>
          )}
        </ul>
      </Container>
    </section>
  );
}
