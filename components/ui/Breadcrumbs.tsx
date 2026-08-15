import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  /** Verilmezse (ör. son öğe — "şu an buradasınız") tıklanamaz düz metin olarak render edilir. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Hem ziyaretçi sitesi (Ekip/İletişim gibi ayrı sayfalar) hem panel
// (İçerikler > Hizmetler > <kayıt> gibi çok katmanlı gezinme) için TEK
// paylaşılan bileşen — components/panel/ ve components/site/ birbirini
// asla import ETMEZ (bkz. docs/MIMARI.md), bu yüzden ikisinin de
// kullanabileceği nötr components/ui/ katmanında (bkz. docs/KARAR-GUNLUGU.md,
// 2026-08-18 dokuzuncu oturum). Native `<nav>`/`<ol>` — TASARIM-SISTEMI.md
// "Bileşen API Kuralları" gereği gerçek semantik HTML, kendi "adım" API'si
// icat edilmedi. Son öğe `aria-current="page"` alır ve BİLEREK link değil
// (kullanıcı zaten o sayfada). Uzun bir dinamik başlık (ör. bir SSS sorusu)
// düzeni bozmasın diye son öğe kırpılır (`truncate`).
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Yol izi" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-caption text-text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-x-1.5">
              {index > 0 && (
                <ChevronRight aria-hidden="true" size={14} className="shrink-0 text-text-muted/60" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "max-w-[16rem] truncate font-semibold text-text sm:max-w-xs" : ""}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
