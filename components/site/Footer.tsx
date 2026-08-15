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
// tekrar ağ isteği yapılmaz. Telefon/e-posta gerçek tel:/mailto: bağlantısı.
//
// 2026-08-18'de sabit koyu zeminden (bg-neutral-900, temadan bağımsız)
// tema-duyarlı token'lara (bg-surface-raised vb.) çevrildi — ziyaretçi
// açık/koyu tema switch'iyle (bkz. ThemeToggle.tsx) koyu moda geçince eski
// sabit koyu footer sayfanın kendi koyu zeminiyle neredeyse aynı tona
// gelip "kayboluyordu" (kullanıcı bulgusu). Artık her iki temada da
// surface-raised, surface'tan bir adım ayrışıyor — StatsSection (bg-brand)
// zaten aynı ilkeyi (temaya göre değişen ama her modda canlı kalan bir
// token) kullanıyordu, buradaki eski "sabit" yorum yanlıştı.
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
    <footer className="bg-surface-raised py-12 text-text">
      <Container>
        {/* KISITLAR (kullanıcı isteği, 2026-08-18): "yazılar çok küçük,
            genişlik de az geldi" — üç değişiklik: (1) asıl okunacak içerik
            (adres/telefon/e-posta, bağlantılar) `text-base`(16px)'ten
            `text-h6`(20px)'ya çıkarıldı — text-h6 SAF bir boyut token'ı
            (bkz. app/globals.css), font-weight taşımıyor, o yüzden burada
            kalın görünmeden sadece büyüyor; (2) sütun kırılması `sm:`
            (640px) yerine `md:` (768px)'e alındı ki dar/orta genişlikte
            sütunlar sıkışıp metin erken sarmasın, tam genişlik tek sütun
            olarak kalsın; (3) ilk sütun (firma bilgisi, genelde en uzun
            içerik) `md:` sonrası diğer ikisinden daha geniş bir pay alıyor
            (1.3fr) ve sütun arası boşluk (gap) büyütüldü. */}
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr] md:gap-12">
          <div>
            <p className="text-h5 font-bold text-text">{tenantName}</p>
            {settings?.slogan && (
              <p className="mt-1 text-base text-text-muted">{settings.slogan}</p>
            )}
            {contact && (
              <ul className="mt-4 space-y-2 text-h6 text-text-muted">
                {contact.address && <li>{contact.address}</li>}
                {contact.phone && (
                  <li>
                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      className="hover:text-brand"
                    >
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`} className="hover:text-brand">
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>

          {navLinks.length > 0 && (
            <div>
              <p className="text-base font-semibold uppercase tracking-wide text-text-muted">
                Bölümler
              </p>
              <ul className="mt-4 space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-h6 text-text-muted hover:text-brand">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div>
              <p className="text-base font-semibold uppercase tracking-wide text-text-muted">
                Sosyal Medya
              </p>
              <ul className="mt-4 space-y-2">
                {socialLinks.map((social) => (
                  <li key={social.key}>
                    <a
                      href={settings![social.key]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-h6 text-text-muted hover:text-brand"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-10 border-t border-neutral-300 pt-6 text-base text-text-muted">
          © {year} {tenantName}. Tüm hakları saklıdır.
        </p>
      </Container>
    </footer>
  );
}
