import { getAllFaqs } from "@/lib/supabase/panelQueries";
import { AdminListTable } from "@/components/panel/AdminListTable";
import { FaqForm } from "./FaqForm";
import { deleteFaqAction, moveFaqOrderAction, toggleFaqPublishedAction } from "./actions";

export default async function SssPage() {
  const faqs = await getAllFaqs();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-h3 font-bold text-text">SSS</h1>
        <div className="mt-6">
          <AdminListTable
            rows={faqs.map((f) => ({
              id: f.id,
              title: f.question,
              isPublished: f.isPublished,
              orderIndex: f.orderIndex,
            }))}
            emptyMessage="Henüz hiç soru eklenmemiş."
            editBasePath="/panel/icerikler/sss"
            entityLabel="soru"
            deleteAction={deleteFaqAction}
            togglePublishedAction={toggleFaqPublishedAction}
            moveOrderAction={moveFaqOrderAction}
          />
        </div>
      </div>

      <div className="max-w-lg border-t border-neutral-300 pt-8">
        <h2 className="text-h5 font-semibold text-text">Yeni Soru Ekle</h2>
        <div className="mt-4">
          <FaqForm />
        </div>
      </div>
    </div>
  );
}
