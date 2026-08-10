import { getAllTestimonials } from "@/lib/supabase/panelQueries";
import { AdminListTable } from "@/components/panel/AdminListTable";
import { TestimonialForm } from "./TestimonialForm";
import {
  deleteTestimonialAction,
  moveTestimonialOrderAction,
  toggleTestimonialPublishedAction,
} from "./actions";

export default async function ReferanslarPage() {
  const testimonials = await getAllTestimonials();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-h3 font-bold text-text">Referanslar</h1>
        <div className="mt-6">
          <AdminListTable
            rows={testimonials.map((t) => ({
              id: t.id,
              title: t.authorName,
              subtitle: t.authorTitle,
              isPublished: t.isPublished,
              orderIndex: t.orderIndex,
            }))}
            emptyMessage="Henüz hiç referans eklenmemiş."
            editBasePath="/panel/icerikler/referanslar"
            entityLabel="referans"
            deleteAction={deleteTestimonialAction}
            togglePublishedAction={toggleTestimonialPublishedAction}
            moveOrderAction={moveTestimonialOrderAction}
          />
        </div>
      </div>

      <div className="max-w-lg border-t border-neutral-300 pt-8">
        <h2 className="text-h5 font-semibold text-text">Yeni Referans Ekle</h2>
        <div className="mt-4">
          <TestimonialForm />
        </div>
      </div>
    </div>
  );
}
