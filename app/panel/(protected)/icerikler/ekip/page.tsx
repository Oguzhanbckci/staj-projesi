import { getAllTeamMembers } from "@/lib/supabase/panelQueries";
import { AdminListTable } from "@/components/panel/AdminListTable";
import { TeamMemberForm } from "./TeamMemberForm";
import {
  deleteTeamMemberAction,
  moveTeamMemberOrderAction,
  toggleTeamMemberPublishedAction,
} from "./actions";

export default async function EkipPage() {
  const members = await getAllTeamMembers();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-h3 font-bold text-text">Ekip</h1>
        <div className="mt-6">
          <AdminListTable
            rows={members.map((m) => ({
              id: m.id,
              title: m.fullName,
              subtitle: m.role,
              isPublished: m.isPublished,
              orderIndex: m.orderIndex,
            }))}
            emptyMessage="Henüz hiç ekip üyesi eklenmemiş."
            editBasePath="/panel/icerikler/ekip"
            entityLabel="ekip üyesi"
            deleteAction={deleteTeamMemberAction}
            togglePublishedAction={toggleTeamMemberPublishedAction}
            moveOrderAction={moveTeamMemberOrderAction}
          />
        </div>
      </div>

      <div className="max-w-lg border-t border-neutral-300 pt-8">
        <h2 className="text-h5 font-semibold text-text">Yeni Ekip Üyesi Ekle</h2>
        <div className="mt-4">
          <TeamMemberForm />
        </div>
      </div>
    </div>
  );
}
