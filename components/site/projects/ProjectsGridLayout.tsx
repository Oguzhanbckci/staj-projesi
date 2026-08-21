import { ProjectCard } from "./ProjectCard";
import type { ProjectItem } from "./types";

// İlk satır (masaüstünde ilk 3 kart) `loading="eager"` — hemen yüklenir,
// ama <head>'e preload bağlantısı KOYMAZ. Fark önemli: eskiden burada
// `priority` vardı ve o, ekran altındaki kart görsellerini hero ile
// (sayfanın gerçek LCP öğesi) yarıştıran preload bağlantıları
// üretiyordu — 2026-08-21 denetim bulgusu. Next belgesinin kendi
// önerisi de bu: "In most cases, you should use loading='eager' ...
// instead of preload". Geri kalan kartlar varsayılan tembel yükleme.
export function ProjectsGridLayout({ projects }: { projects: ProjectItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          eager={index < 3}
        />
      ))}
    </div>
  );
}
