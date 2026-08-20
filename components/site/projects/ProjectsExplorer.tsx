"use client";

import { useState } from "react";
import { GALLERY_VARIANTS } from "./registry";
import { ProjectDetailModal } from "./ProjectDetailModal";
import type { ProjectItem, GalleryVariant } from "./types";

const ALL_LABEL = "Tümü";

// SUNUCU/İSTEMCİ SINIRI BURASI: ProjectsSection.tsx (Server Component)
// veriyi zaten çekip `projects`/`categories`'i buraya prop olarak
// geçiyor — bu dosya kendi veri çekmiyor, SADECE filtre ve detay
// penceresi etkileşimini yönetiyor. İlk render yine sunucudan gelir
// (Next.js Client Component'leri de ilk istekte sunucuda render eder);
// `selectedCategory` başlangıç değeri "Tümü" olduğu için ilk HTML zaten
// tüm projeleri gösterir, hydration'dan önce hiçbir şey "yüklenmiyor".
export function ProjectsExplorer({
  projects,
  categories,
  galleryVariant = "grid",
}: {
  projects: ProjectItem[];
  categories: string[];
  galleryVariant?: GalleryVariant;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_LABEL);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filtered =
    selectedCategory === ALL_LABEL
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const Gallery = GALLERY_VARIANTS[galleryVariant];

  return (
    <div>
      <div role="group" aria-label="Kategoriye göre filtrele" className="mt-12 flex flex-wrap gap-2">
        {[ALL_LABEL, ...categories].map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-caption font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none ${
                isSelected
                  ? "bg-brand text-brand-on shadow-sm"
                  : "border border-neutral-300 bg-surface-raised text-text hover:border-brand/40 hover:bg-neutral-100 hover:text-brand"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-base text-text-muted">
          Bu kategoride henüz proje yok.
        </p>
      ) : (
        <div className="mt-8">
          <Gallery projects={filtered} onSelect={setSelectedProject} />
        </div>
      )}

      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}
