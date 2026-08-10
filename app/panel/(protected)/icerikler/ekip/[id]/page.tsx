import { notFound } from "next/navigation";
import { getTeamMemberById } from "@/lib/supabase/panelQueries";
import { TeamMemberForm } from "../TeamMemberForm";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-h3 font-bold text-text">Ekip Üyesini Düzenle</h1>
      <div className="mt-6">
        <TeamMemberForm member={member} />
      </div>
    </div>
  );
}
