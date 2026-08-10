import { notFound } from "next/navigation";
import { getFaqById } from "@/lib/supabase/panelQueries";
import { FaqForm } from "../FaqForm";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = await getFaqById(id);

  if (!faq) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-h3 font-bold text-text">Soruyu Düzenle</h1>
      <div className="mt-6">
        <FaqForm faq={faq} />
      </div>
    </div>
  );
}
