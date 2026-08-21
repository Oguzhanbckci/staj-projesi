import Link from "next/link";
import { ReadStatusBadge } from "@/components/panel/ReadStatusBadge";
import { DeleteButton } from "@/components/panel/DeleteButton";
import { getContactSubjectLabel } from "@/lib/validation/contactFields";
import type { ContactMessageRow } from "@/lib/supabase/panelQueries";
import { deleteMessageAction } from "./actions";

// components/panel/AdminListTable.tsx ile AYNI tablo/başlık/hücre CSS
// dili (görsel tutarlılık, panel gözden geçirmesi bulgusu) — ama
// zorla yeniden KULLANILMADI: AdminListRow'un id/title/subtitle/
// isPublished/orderIndex şekli mesajların gönderen/konu/tarih/okundu
// kavramlarına semantik olarak uymuyor, zorla sığdırmak (isRead→
// isPublished gibi) yanıltıcı olurdu (bkz. docs/KARAR-GUNLUGU.md).
// Yeni mesajlar zaten üstte (getContactMessages() created_at DESC
// sıralıyor, bkz. lib/supabase/panelQueries.ts).
export function MessageListTable({ messages }: { messages: ContactMessageRow[] }) {
  if (messages.length === 0) {
    return <p className="text-base text-text-muted">Henüz hiç mesaj gelmedi.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-base">
        <thead>
          <tr className="border-b border-neutral-300 text-caption font-semibold uppercase tracking-wide text-text-muted">
            <th className="py-2 pr-4">Gönderen</th>
            <th className="py-2 pr-4">Konu</th>
            <th className="py-2 pr-4">Tarih</th>
            <th className="py-2 pr-4">Durum</th>
            <th className="py-2 pr-4">
              <span className="sr-only">İşlemler</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id} className="border-b border-neutral-100 last:border-0">
              <td className="py-3 pr-4">
                <p className="font-semibold text-text">{message.senderName}</p>
                {message.senderEmail && (
                  <p className="text-caption text-text-muted">{message.senderEmail}</p>
                )}
              </td>
              <td className="py-3 pr-4 text-text-muted">{getContactSubjectLabel(message.subject)}</td>
              <td className="py-3 pr-4 text-text-muted">
                {new Date(message.createdAt).toLocaleDateString("tr-TR")}
              </td>
              <td className="py-3 pr-4">
                <ReadStatusBadge isRead={message.isRead} />
              </td>
              <td className="py-3 pr-4">
                {/* gap-4 (sabit 16px) — AdminListTable'daki Düzenle/Sil
                    aralığıyla tutarlı, bkz. o dosyadaki yorum. */}
                <div className="flex items-center gap-4">
                  <Link
                    href={`/panel/mesajlar/${message.id}`}
                    className="rounded-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Görüntüle
                  </Link>
                  <DeleteButton
                    id={message.id}
                    itemName={`${message.senderName} — ${getContactSubjectLabel(message.subject)}`}
                    entityLabel="mesaj"
                    action={deleteMessageAction}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
