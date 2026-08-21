"use client";

import Image from "next/image";
import { useDialogBehavior } from "@/lib/hooks/useDialogBehavior";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ProjectItem } from "./types";

// Büyük görsel + açıklama + künye (konum/yıl/kategori). Odak tuzağı/
// Escape/scroll kilidi useDialogBehavior'dan (MobileMenu'yle paylaşılan
// hook). project null olduğunda hiç render edilmez.
export function ProjectDetailModal({
  project,
  onClose,
}: {
  project: ProjectItem | null;
  onClose: () => void;
}) {
  const panelRef = useDialogBehavior(!!project, onClose);

  if (!project) return null;

  const imageUrl = project.coverPath
    ? getPublicImageUrl("projects", project.coverPath)
    : null;

  return (
    // `items-start sm:items-center` + dışta `overflow-y-auto`: panel
    // beklenenden yüksek kalırsa kaydırılarak tamamına ulaşılabilsin.
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
        // `vh` DEĞİL `svh`: mobil tarayıcıda `position: fixed` kutu adres
        // çubuğu görünürken KÜÇÜK görünüm alanına oturur, `vh` ise her
        // zaman BÜYÜK alana göre hesaplanır — yani `90vh` dış kabın gerçek
        // yüksekliğini aşabiliyor ve taşan alt kısım ("Kapat" butonu
        // satırı) hiçbir şekilde kaydırılıp getirilemiyordu. Aynı fark
        // HeroVariantA'da 2026-08-21'de zaten `85svh` ile çözülmüştü.
        className="max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-lg bg-surface-raised"
      >
        <div className="relative aspect-[3/2] bg-surface">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={project.title}
              fill
              sizes="(min-width: 768px) 672px, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="p-6">
          <h2 id="project-detail-title" className="text-h4 font-bold text-text">
            {project.title}
          </h2>
          {project.description && (
            <p className="mt-3 text-base text-text-muted">{project.description}</p>
          )}
          <dl className="mt-4 grid grid-cols-1 gap-3 text-base sm:grid-cols-3">
            {project.city && (
              <div>
                <dt className="text-caption font-semibold text-text-muted">Konum</dt>
                <dd className="text-text">{project.city}</dd>
              </div>
            )}
            {project.year && (
              <div>
                <dt className="text-caption font-semibold text-text-muted">Yıl</dt>
                <dd className="text-text">{project.year}</dd>
              </div>
            )}
            {project.category && (
              <div>
                <dt className="text-caption font-semibold text-text-muted">Kategori</dt>
                <dd className="text-text">{project.category}</dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-neutral-300 px-4 py-2 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Canlı Görüntüle
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-brand px-4 py-2 text-brand-on focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ring-offset-surface"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
