// components/panel/StatusBadge.tsx ile AYNI görsel dil (rounded-full
// border px-2 py-0.5 text-caption font-semibold, renk HER ZAMAN metinle
// birlikte) — ama `isPublished`'a sıkı bağlı olduğu için o bileşen
// doğrudan kullanılamadı, mesaja özel bu küçük ikizi türetildi.
export function ReadStatusBadge({ isRead }: { isRead: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-caption font-semibold ${
        isRead ? "border-neutral-300 text-text-muted" : "border-brand text-brand"
      }`}
    >
      {isRead ? "Okundu" : "Yeni"}
    </span>
  );
}
