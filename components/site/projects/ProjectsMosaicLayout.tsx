import { ProjectCard } from "./ProjectCard";
import type { ProjectItem } from "./types";

// Gerçek CSS masonry hâlâ tarayıcı desteği sınırlı/deneysel — bunun
// yerine sabit satır yüksekliği (auto-rows) + her 5 projede bir 2x2
// span veren, tüm tarayıcılarda çalışan bir grid tekniğiyle "mozaik"
// hissi veriliyor.
export function ProjectsMosaicLayout({ projects }: { projects: ProjectItem[] }) {
  return (
    // Satır yüksekliği dar ekranda DAHA BÜYÜK: kartın metin bloğu
    // (başlık + "şehir · yıl") dar kartta ~105px sabit yer kaplıyor ve
    // görsel `flex-1` ile kalanla yetiniyor — 160px satırda fotoğraf
    // 320px'de 55px'lik bir şeride iniyordu (ölçüm: 136×55). 640px'te
    // `sm:grid-cols-4` karoyu yine 136px'e düşürdüğü için tablet portre
    // de aynı derde düşüyordu; 4 kolona geçiş `lg:`ye alındı.
    <div className="grid auto-rows-[210px] grid-cols-2 gap-4 sm:auto-rows-[180px] lg:auto-rows-[160px] lg:grid-cols-4">
      {projects.map((project, index) => {
        const isFeatured = index % 5 === 0;
        return (
          <ProjectCard
            key={project.id}
            project={project}
            priority={index < 3}
            fill
            className={isFeatured ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}
          />
        );
      })}
    </div>
  );
}
