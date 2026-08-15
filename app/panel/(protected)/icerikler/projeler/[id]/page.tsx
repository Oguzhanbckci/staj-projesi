import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/supabase/panelQueries";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProjectForm } from "../ProjectForm";
import { ProjectImageUploader } from "../ProjectImageUploader";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <Breadcrumbs
        items={[
          { label: "İçerikler", href: "/panel/icerikler" },
          { label: "Projeler", href: "/panel/icerikler/projeler" },
          { label: project.title },
        ]}
        className="mb-2"
      />
      <h1 className="text-h3 font-bold text-text">Projeyi Düzenle</h1>
      <div className="mt-6">
        <ProjectForm project={project} />
      </div>
      <ProjectImageUploader project={project} />
    </div>
  );
}
