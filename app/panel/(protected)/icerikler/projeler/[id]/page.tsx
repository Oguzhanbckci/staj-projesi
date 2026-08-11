import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/supabase/panelQueries";
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
      <h1 className="text-h3 font-bold text-text">Projeyi Düzenle</h1>
      <div className="mt-6">
        <ProjectForm project={project} />
      </div>
      <ProjectImageUploader project={project} />
    </div>
  );
}
