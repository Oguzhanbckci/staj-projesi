import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { SetupIssue } from "@/lib/panel/setupChecklist";

// Kurulum kontrol listesinin GÖRÜNÜMÜ. Kurallar `lib/panel/setupChecklist.ts`
// içinde ve saf — bu dosya yalnızca sonucu basar.
//
// Sıralama bilinçli: "yayinda" olanlar (ziyaretçinin ŞU AN gördüğü yer
// tutucular) üstte, "eksik" olanlar (site çalışır ama eksik) altta.
export function SetupChecklistCard({ issues }: { issues: SetupIssue[] }) {
  if (issues.length === 0) {
    return (
      <Card className="mt-8 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <h2 className="text-h5 font-semibold text-text">Kurulum tamamlanmış görünüyor</h2>
            <p className="mt-1 text-base text-text-muted">
              Şablondan gelen yer tutucu içerik kalmadı; logo, favicon, paylaşım görseli ve arama
              motoru açıklaması dolu.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const yayinda = issues.filter((i) => i.severity === "yayinda");
  const eksik = issues.filter((i) => i.severity === "eksik");

  return (
    <Card className="mt-8 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="min-w-0">
          <h2 className="text-h5 font-semibold text-text">Kurulum Kontrol Listesi</h2>
          <p className="mt-1 text-base text-text-muted">
            {yayinda.length > 0
              ? `${yayinda.length} madde ziyaretçilere ŞU AN görünüyor.`
              : "Sitede eksik kalan alanlar var."}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-4">
        {[...yayinda, ...eksik].map((issue) => (
          <li key={issue.id} className="flex items-start gap-3">
            {issue.severity === "yayinda" ? (
              <AlertTriangle aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-warning" />
            ) : (
              <CircleDashed aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-text-muted" />
            )}
            <div className="min-w-0">
              <p className="text-base font-semibold text-text">{issue.title}</p>
              <p className="mt-0.5 text-base text-text-muted">{issue.detail}</p>
              <Link
                href={issue.href}
                className="mt-1 inline-block text-base font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ring-offset-surface rounded"
              >
                Düzelt →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
