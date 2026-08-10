import { getContactMessages } from "@/lib/supabase/panelQueries";
import { Card } from "@/components/ui/Card";

// İletişim formundan gelen mesajların listesi (gerçek veri —
// contact_messages, bkz. lib/supabase/panelQueries.ts). Okundu/okunmadı
// işaretleme arayüzü henüz yok (sadece listeleme) — bkz. docs/DURUM.md
// "Sıradaki adım".
export default async function MesajlarPage() {
  const messages = await getContactMessages();

  return (
    <div>
      <h1 className="text-h3 font-bold text-text">Mesajlar</h1>

      {messages.length === 0 ? (
        <p className="mt-4 text-base text-text-muted">Henüz mesaj yok.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {messages.map((message) => (
            <li key={message.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-text">{message.senderName}</p>
                  <div className="flex items-center gap-3">
                    {!message.isRead && (
                      <span className="rounded-full bg-brand px-2 py-0.5 text-caption font-semibold text-brand-on">
                        Yeni
                      </span>
                    )}
                    <time className="text-caption text-text-muted">
                      {new Date(message.createdAt).toLocaleDateString("tr-TR")}
                    </time>
                  </div>
                </div>
                {message.senderPhone && (
                  <p className="mt-1 text-caption text-text-muted">{message.senderPhone}</p>
                )}
                <p className="mt-3 text-base text-text">{message.message}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
