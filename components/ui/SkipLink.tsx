// Klavye kullanıcısının Navbar/panel menüsündeki tüm bağlantıları tek tek
// Tab'lamadan doğrudan ana içeriğe atlamasını sağlar (WCAG 2.4.1 "Bypass
// Blocks"). Varsayılan olarak görsel olarak gizli (sr-only), sadece
// klavyeyle odaklanınca görünür olur — fare/dokunmatik kullanıcıyı hiç
// etkilemez. Hedef (`targetId`) elemanın `tabIndex={-1}` taşıması gerekir,
// aksi halde <a href="#..."> sayfayı kaydırır ama klavye odağını
// taşımaz.
export function SkipLink({ targetId, label = "İçeriğe geç" }: { targetId: string; label?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-on focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ring-offset-surface"
    >
      {label}
    </a>
  );
}
