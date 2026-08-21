import { ProjectCard } from "./ProjectCard";
import type { ProjectItem } from "./types";

// İlk satır (masaüstünde ilk 3 kart) priority — next/image bunları
// erkenden yükler; geri kalanı next/image'ın varsayılan davranışıyla
// (priority verilmezse) tembel yüklenir, ekstra kod gerekmez.
export function ProjectsGridLayout({ projects }: { projects: ProjectItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
