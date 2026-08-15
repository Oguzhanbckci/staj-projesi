import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getContactSection } from "@/lib/supabase/queries";
import { ContactForm } from "./ContactForm";

// İki sütun: sol tarafta statik iletişim bilgisi (adres/telefon/e-posta/
// çalışma saatleri + harita linki), sağ tarafta gerçek form. Mobilde tek
// sütuna düşer (bilgi önce, form sonra). Kayıt yoksa/yayında değilse bölüm
// hiç render edilmez (diğer bölümlerle aynı ilke) — form ise DB'deki bir
// kayda bağlı değil, her zaman render edilir; bu yüzden "kayıt yoksa
// render etme" kuralı sadece bilgi bloğuna uygulanıyor.
//
// Harita gömme kararı (kullanıcıya gerekçeyle bildirildi, bkz.
// docs/KARAR-GUNLUGU.md 2026-08-11): Gömülü bir Google Maps iframe'i veya
// Leaflet gibi bir JS kütüphanesi, sayfaya ekstra üçüncü taraf JS/CSS +
// birden fazla ağ isteği (ve Google Maps özelinde üçüncü taraf çerezi,
// KVKK açısından ayrıca değerlendirilmesi gereken bir konu) ekler — bu
// proje Lighthouse Performance ≥90 hedefini bilinçli olarak koruyor (bkz.
// docs/TEST-STRATEJISI.md). Bunun yerine, sıfır ek ağırlıklı bir "Haritada
// Görüntüle" linki kullanılıyor — tıklanınca Google Maps'i yeni sekmede
// açar, sayfanın kendi ağırlığına hiçbir şey eklemez.
// `headingLevel` — TeamSection.tsx'teki AYNI gerekçe: varsayılan "h2" (ana
// sayfada Hero zaten h1'i taşıyor), `/iletisim` bağımsız sayfası Hero'suz
// olduğu için "h1" geçirmeli (bkz. docs/KARAR-GUNLUGU.md, 2026-08-18
// dokuzuncu oturum).
export async function ContactSection({
  headingLevel = "h2",
}: { headingLevel?: "h1" | "h2" } = {}) {
  const contact = await getContactSection();

  return (
    <section id="iletisim" className="bg-surface-raised py-16 sm:py-24">
      <Container>
        <SectionHeader
          title="İletişim"
          description="Projeniz hakkında konuşmak için bize ulaşın."
          headingLevel={headingLevel}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {contact && (
            <div className="space-y-6 text-base text-text">
              {contact.address && (
                <div>
                  <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                    Adres
                  </p>
                  <p className="mt-1">{contact.address}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      contact.address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block font-semibold text-brand hover:underline"
                  >
                    Haritada Görüntüle →
                  </a>
                </div>
              )}
              {contact.phone && (
                <div>
                  <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                    Telefon
                  </p>
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                    className="mt-1 inline-block font-semibold text-brand hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.email && (
                <div>
                  <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                    E-posta
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-1 inline-block font-semibold text-brand hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.workingHours && (
                <div>
                  <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                    Çalışma Saatleri
                  </p>
                  <p className="mt-1 whitespace-pre-line">{contact.workingHours}</p>
                </div>
              )}
            </div>
          )}

          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
