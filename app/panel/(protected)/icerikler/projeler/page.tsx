import { getAllProjects } from "@/lib/supabase/panelQueries";
import { AdminListTable } from "@/components/panel/AdminListTable";
import { ProjectForm } from "./ProjectForm";
import { deleteProjectAction } from "./actions";

export default async function ProjelerPage() {
  const projects = await getAllProjects();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-h3 font-bold text-text">Projeler</h1>
        <div className="mt-6">
          <AdminListTable
            rows={projects.map((p) => ({
              id: p.id,
              title: p.title,
              subtitle: [p.location, p.year ? String(p.year) : null].filter(Boolean).join(" · ") || null,
              isPublished: p.isPublished,
              orderIndex: p.orderIndex,
            }))}
            emptyMessage="Henüz hiç proje eklenmemiş."
            editBasePath="/panel/icerikler/projeler"
            deleteAction={deleteProjectAction}
            deleteConfirmMessage="Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
          />
        </div>
      </div>

      <div className="max-w-lg border-t border-neutral-300 pt-8">
        <h2 className="text-h5 font-semibold text-text">Yeni Proje Ekle</h2>
        <div className="mt-4">
          <ProjectForm />
        </div>
      </div>
    </div>
  );
}
