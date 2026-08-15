import { notFound } from "next/navigation";
import { getContactMessageById } from "@/lib/supabase/panelQueries";
import { getContactSubjectLabel } from "@/lib/validation/contact";
import { LinkButton } from "@/components/ui/LinkButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { MarkMessageReadOnView } from "../MarkMessageReadOnView";

// getServiceById/[id]/page.tsx ile aynı desen (kayıt yoksa notFound()).
// Açılır açılmaz mesaj otomatik okundu işaretlenir (MarkMessageReadOnView,
// görünmez bir client bileşen) — bu yüzden burada gösterilen `message.isRead`
// sayfa YÜKLENDİĞİ ANDAKİ (henüz işaretlenmeden ÖNCEKİ) değer olabilir,
// bu normaldir.
export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await getContactMessageById(id);

  if (!message) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <MarkMessageReadOnView messageId={message.id} alreadyRead={message.isRead} />

      <Breadcrumbs
        items={[{ label: "Mesajlar", href: "/panel/mesajlar" }, { label: message.senderName }]}
        className="mb-2"
      />
      <h1 className="text-h3 font-bold text-text">{message.senderName}</h1>

      <dl className="mt-4 grid grid-cols-1 gap-4 text-base sm:grid-cols-2">
        {message.senderEmail && (
          <div>
            <dt className="text-caption font-semibold text-text-muted">E-posta</dt>
            <dd>
              <a
                href={`mailto:${message.senderEmail}`}
                className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {message.senderEmail}
              </a>
            </dd>
          </div>
        )}
        {message.senderPhone && (
          <div>
            <dt className="text-caption font-semibold text-text-muted">Telefon</dt>
            <dd>
              <a
                href={`tel:${message.senderPhone.replace(/\s+/g, "")}`}
                className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {message.senderPhone}
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-caption font-semibold text-text-muted">Konu</dt>
          <dd className="text-text">{getContactSubjectLabel(message.subject)}</dd>
        </div>
        <div>
          <dt className="text-caption font-semibold text-text-muted">Tarih</dt>
          <dd className="text-text">
            {new Date(message.createdAt).toLocaleString("tr-TR")}
          </dd>
        </div>
      </dl>

      <div className="mt-6 rounded-md border border-neutral-300 bg-surface-raised p-4">
        <p className="whitespace-pre-line text-base text-text">{message.message}</p>
      </div>

      {message.senderEmail && (
        <div className="mt-6">
          <LinkButton
            href={`mailto:${message.senderEmail}?subject=${encodeURIComponent(
              `Re: ${getContactSubjectLabel(message.subject)}`
            )}`}
          >
            E-posta ile Yanıtla
          </LinkButton>
        </div>
      )}
    </div>
  );
}
