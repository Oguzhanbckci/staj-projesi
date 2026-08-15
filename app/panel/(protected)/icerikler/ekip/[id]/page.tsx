import { notFound } from "next/navigation";
import { getTeamMemberById } from "@/lib/supabase/panelQueries";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TeamMemberForm } from "../TeamMemberForm";
import { TeamMemberImageUploader } from "../TeamMemberImageUploader";

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
      <Breadcrumbs
        items={[
          { label: "İçerikler", href: "/panel/icerikler" },
          { label: "Ekip", href: "/panel/icerikler/ekip" },
          { label: member.fullName },
        ]}
        className="mb-2"
      />
      <h1 className="text-h3 font-bold text-text">Ekip Üyesini Düzenle</h1>
      <div className="mt-6">
        <TeamMemberForm member={member} />
      </div>
      <TeamMemberImageUploader member={member} />
    </div>
  );
}
