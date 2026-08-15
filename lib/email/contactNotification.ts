import { getContactSubjectLabel } from "@/lib/validation/contact";

// Saf modül — Resend'e/ağa bağımlı değil, sadece girdi verisinden e-posta
// içeriği üretir (bkz. lib/seo/localBusiness.ts'teki AYNI "ham veri çekme
// ile içerik KURMA'yı ayır" ilkesi — biri ağa bağımlı, diğeri saf/test
// edilebilir, docs/KARAR-GUNLUGU.md 2026-08-18 dokuzuncu oturum).
export interface ContactNotificationInput {
  tenantName: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  subject: string | null;
  message: string;
  panelMessagesUrl: string;
}

export interface ContactNotificationEmail {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// KISITLAR: panelden doğrudan yanıt YOK (bkz. docs/MUSTERİ-KILAVUZU.md,
// "Mesaj yanıtlama panelden değil... kendi e-posta programı üzerinden") —
// bu yüzden e-posta bir "yanıtla" formu değil, sadece bildirim + panele
// bağlantı. Mesaj boş/eksik alan durumunda (subject null gibi) SEO-
// PERFORMANS.md'deki "eksik alan uydurulmaz, çıkarılır" ilkesiyle
// tutarlı: subject yoksa satır hiç eklenmez.
export function buildContactNotificationEmail(
  input: ContactNotificationInput
): ContactNotificationEmail {
  const subjectLabel = getContactSubjectLabel(input.subject);
  const emailSubject = `Yeni İletişim Formu Mesajı — ${input.tenantName}`;

  const detailRows: Array<[string, string]> = [
    ["Gönderen", input.senderName],
    ["E-posta", input.senderEmail],
  ];
  if (input.senderPhone) detailRows.push(["Telefon", input.senderPhone]);
  if (input.subject) detailRows.push(["Konu", subjectLabel]);

  const htmlRows = detailRows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#5f6b7a;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:4px 0;color:#172033;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <h1 style="font-size:20px;color:#172033;">Yeni bir iletişim formu mesajı var</h1>
      <table style="border-collapse:collapse;margin:16px 0;font-size:14px;">${htmlRows}</table>
      <p style="font-size:14px;color:#172033;white-space:pre-wrap;border-left:3px solid #2563a8;padding:8px 12px;background:#f7f8fa;">${escapeHtml(input.message)}</p>
      <p style="margin-top:24px;font-size:14px;">
        <a href="${escapeHtml(input.panelMessagesUrl)}" style="color:#2563a8;">Panelden görüntüle ve yanıtla →</a>
      </p>
    </div>
  `.trim();

  const textLines = [
    "Yeni bir iletişim formu mesajı var:",
    "",
    ...detailRows.map(([label, value]) => `${label}: ${value}`),
    "",
    input.message,
    "",
    `Panelden görüntüle: ${input.panelMessagesUrl}`,
  ];

  return { subject: emailSubject, html, text: textLines.join("\n") };
}
