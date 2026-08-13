import { notFound } from "next/navigation";
import { getTestimonialById } from "@/lib/supabase/panelQueries";
import { TestimonialForm } from "../TestimonialForm";
import { TestimonialImageUploader } from "../TestimonialImageUploader";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-h3 font-bold text-text">Referansı Düzenle</h1>
      <div className="mt-6">
        <TestimonialForm testimonial={testimonial} />
      </div>
      <TestimonialImageUploader testimonial={testimonial} />
    </div>
  );
}
