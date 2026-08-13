import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import type { ProjectItem } from "./types";

// Hem ızgara hem mozaik düzeninde kullanılan TEK kart — aynı veri, sadece
// `fill` (görsel alanının sabit oran mı yoksa ebeveyn hücreyi mi
// dolduracağı) ve `className` (mozaikte col/row-span) farklı. Tıklama bir
// modal AÇIYOR (gezinme değil, aksiyon) — bu yüzden gerçek <button>.
export function ProjectCard({
  project,
  onSelect,
  priority = false,
  fill = false,
  className = "",
}: {
  project: ProjectItem;
  onSelect: (project: ProjectItem) => void;
  priority?: boolean;
  fill?: boolean;
  className?: string;
}) {
  const imageUrl = project.coverPath
    ? getPublicImageUrl("projects", project.coverPath)
    : null;

  return (
    <Card className={`flex h-full flex-col ${className}`}>
      <button
        type="button"
        onClick={() => onSelect(project)}
        className="flex h-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className={`relative bg-surface ${fill ? "flex-1" : "aspect-[4/3]"}`}>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={project.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-h6 font-semibold text-text">{project.title}</h3>
          <p className="mt-1 text-caption text-text-muted">
            {[project.city, project.year].filter(Boolean).join(" · ")}
          </p>
        </div>
      </button>
    </Card>
  );
}
