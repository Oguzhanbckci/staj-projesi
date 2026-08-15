export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Sayfa başlık hiyerarşisi doğru kalsın diye çağıran belirler (varsayılan h2).
   *  `h1` SADECE bu bölümün sayfadaki TEK h1'i olduğu bağlamlarda kullanılmalı
   *  (ör. Ekip/İletişim gibi Hero'suz bağımsız sayfalar, bkz. TeamSection/
   *  ContactSection'daki `headingLevel` prop'u) — ana sayfada Hero zaten kendi
   *  h1'ini taşıdığı için oradaki çağrılar varsayılan h2'de kalmalı. */
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
}

const HEADING_TEXT_CLASS: Record<"h1" | "h2" | "h3", string> = {
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  headingLevel = "h2",
  className = "",
}: SectionHeaderProps) {
  const Heading = headingLevel;

  return (
    <div className={`space-y-2 ${className}`}>
      {eyebrow && (
        <p className="text-caption font-semibold uppercase tracking-wide text-brand">
          {eyebrow}
        </p>
      )}
      <Heading className={`${HEADING_TEXT_CLASS[headingLevel]} font-bold text-text`}>
        {title}
      </Heading>
      {description && <p className="text-base text-text-muted">{description}</p>}
    </div>
  );
}
