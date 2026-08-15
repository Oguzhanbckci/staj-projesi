import { MediaLibrary } from "./MediaLibrary";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// Şu an sadece "projects" bucket'ı var (bkz. supabase/migrations/
// 20260814120000_create_projects_storage_bucket.sql) — diğer içerik
// türleri (Hizmetler, Referanslar, Ekip vb.) için görsel yükleme henüz
// yok, bu ekran de dolayısıyla sadece Proje görsellerini gösteriyor.
export default function MedyaPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Özet", href: "/panel" }, { label: "Medya" }]} className="mb-2" />
      <h1 className="text-h3 font-bold text-text">Medya</h1>
      <p className="mt-2 text-base text-text-muted">
        Yüklenmiş proje görselleri. Diğer içerik türleri için görsel
        yükleme henüz eklenmedi.
      </p>
      <div className="mt-6">
        <MediaLibrary />
      </div>
    </div>
  );
}
