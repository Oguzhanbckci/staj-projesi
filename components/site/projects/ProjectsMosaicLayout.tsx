import { ProjectCard } from "./ProjectCard";
import type { ProjectItem } from "./types";

// Gerçek CSS masonry hâlâ tarayıcı desteği sınırlı/deneysel — bunun
// yerine sabit satır yüksekliği (auto-rows) + her 5 projede bir 2x2
// span veren, tüm tarayıcılarda çalışan bir grid tekniğiyle "mozaik"
// hissi veriliyor.
export function ProjectsMosaicLayout({
  projects,
  onSelect,
}: {
  projects: ProjectItem[];
  onSelect: (project: ProjectItem) => void;
}) {
  return (
    <div className="grid auto-rows-[160px] grid-cols-2 gap-4 sm:grid-cols-4">
      {projects.map((project, index) => {
        const isFeatured = index % 5 === 0;
        return (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={onSelect}
            priority={index < 3}
            fill
            className={isFeatured ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}
          />
        );
      })}
    </div>
  );
}
