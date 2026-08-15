import { notFound } from "next/navigation";
import { getServiceById } from "@/lib/supabase/panelQueries";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ServiceForm } from "../ServiceForm";
import { ServiceImageUploader } from "../ServiceImageUploader";

// Kayıt bulunamazsa (silinmiş, yanlış id, başka tenant'a ait) 404 —
// ham bir hata sayfası yerine Next.js'in kendi not-found akışı.
export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <Breadcrumbs
        items={[
          { label: "İçerikler", href: "/panel/icerikler" },
          { label: "Hizmetler", href: "/panel/icerikler/hizmetler" },
          { label: service.title },
        ]}
        className="mb-2"
      />
      <h1 className="text-h3 font-bold text-text">Hizmeti Düzenle</h1>
      <div className="mt-6">
        <ServiceForm service={service} />
      </div>
      <ServiceImageUploader service={service} />
    </div>
  );
}
