export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Sayfa başlık hiyerarşisi doğru kalsın diye çağıran belirler (varsayılan h2). */
  headingLevel?: "h2" | "h3";
  className?: string;
}

const HEADING_TEXT_CLASS: Record<"h2" | "h3", string> = {
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
