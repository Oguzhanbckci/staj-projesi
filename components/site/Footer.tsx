import { Container } from "@/components/ui/Container";
import { getContactSection, getPageSections, getSiteSettings } from "@/lib/supabase/queries";
import { buildSectionNavLinks } from "@/lib/sections/config";

const SOCIAL_LINKS = [
  { key: "facebookUrl", label: "Facebook" },
  { key: "instagramUrl", label: "Instagram" },
  { key: "linkedinUrl", label: "LinkedIn" },
] as const;

// Kendi verisini kendi çeker (diğer bölümlerle aynı ilke) — üç sorgu da
// react cache() ile sarılı (bkz. lib/supabase/queries.ts), bu yüzden aynı
// istekte Navbar/PageSections tarafından zaten çağrılmış olsalar bile
// tekrar ağ isteği yapılmaz. Sabit koyu zemin (StatsSection'daki gibi site
// temasından bağımsız) — telefon/e-posta gerçek tel:/mailto: bağlantısı.
export async function Footer() {
  const [contact, settings, sections] = await Promise.all([
    getContactSection(),
    getSiteSettings(),
    getPageSections(),
  ]);

  const navLinks = buildSectionNavLinks(sections);
  const tenantName = settings?.tenantName ?? "Firma";
  const year = new Date().getFullYear();
  const socialLinks = SOCIAL_LINKS.filter((social) => settings?.[social.key]);

  return (
    <footer className="bg-neutral-900 py-12 text-neutral-100">
      <Container>
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-h6 font-bold text-white">{tenantName}</p>
            {contact && (
              <ul className="mt-3 space-y-1 text-base text-neutral-300">
                {contact.address && <li>{contact.address}</li>}
                {contact.phone && (
                  <li>
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      className="hover:text-white"
                    >
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className="hover:text-white">
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>

          {navLinks.length > 0 && (
            <div>
              <p className="text-caption font-semibold uppercase tracking-wide text-neutral-400">
                Bölümler
              </p>
              <ul className="mt-3 space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-base text-neutral-300 hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div>
              <p className="text-caption font-semibold uppercase tracking-wide text-neutral-400">
                Sosyal Medya
              </p>
              <ul className="mt-3 space-y-1">
                {socialLinks.map((social) => (
                  <li key={social.key}>
                    <a
                      href={settings![social.key]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-neutral-300 hover:text-white"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-10 border-t border-neutral-800 pt-6 text-caption text-neutral-400">
          © {year} {tenantName}. Tüm hakları saklıdır.
        </p>
      </Container>
    </footer>
  );
}
