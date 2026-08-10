import { getAllServices } from "@/lib/supabase/panelQueries";
import { AdminListTable } from "@/components/panel/AdminListTable";
import { ServiceForm } from "./ServiceForm";
import { deleteServiceAction } from "./actions";

// Yönetim tablosu (başlık/durum/sıra/işlem) + yeni kayıt formu tek
// sayfada — Server Component olan bu sayfa her istekte fresh veri çeker
// (bkz. üst layout'taki `force-dynamic`), yani yeni eklenen bir hizmet
// forma "Hizmet eklendi" mesajı döndükten sonra sayfa yeniden ziyaret
// edildiğinde (ya da Next'in kendi RSC yenilemesiyle) tabloda görünür.
export default async function HizmetlerPage() {
  const services = await getAllServices();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-h3 font-bold text-text">Hizmetler</h1>
        <div className="mt-6">
          <AdminListTable
            rows={services.map((s) => ({
              id: s.id,
              title: s.title,
              isPublished: s.isPublished,
              orderIndex: s.orderIndex,
            }))}
            emptyMessage="Henüz hiç hizmet eklenmemiş."
            editBasePath="/panel/icerikler/hizmetler"
            deleteAction={deleteServiceAction}
            deleteConfirmMessage="Bu hizmeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
          />
        </div>
      </div>

      <div className="max-w-lg border-t border-neutral-300 pt-8">
        <h2 className="text-h5 font-semibold text-text">Yeni Hizmet Ekle</h2>
        <div className="mt-4">
          <ServiceForm />
        </div>
      </div>
    </div>
  );
}
