import { getSeoSettings, getNotificationSettings } from "@/lib/supabase/panelQueries";
import { SeoEditor } from "./SeoEditor";
import { NotificationSettingsEditor } from "./NotificationSettingsEditor";
import { BrandImageUploader } from "../tema/BrandImageUploader";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { uploadOgImageAction, deleteOgImageAction } from "./imageActions";

const AYARLAR_BREADCRUMB_ITEMS: BreadcrumbItem[] = [{ label: "Özet", href: "/panel" }, { label: "Ayarlar" }];

export default async function AyarlarPage() {
  const settings = await getSeoSettings();
  const notificationSettings = await getNotificationSettings();

  if (!settings) {
    return (
      <div>
        <Breadcrumbs items={AYARLAR_BREADCRUMB_ITEMS} className="mb-2" />
        <h1 className="text-h3 font-bold text-text">Ayarlar</h1>
        <p className="mt-4 text-base text-text-muted">
          Ayarlar şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs items={AYARLAR_BREADCRUMB_ITEMS} className="mb-2" />
        <h1 className="text-h3 font-bold text-text">Ayarlar</h1>
        <p className="mt-2 text-base text-text-muted">
          Sitenizin arama motorlarında ve sosyal medya paylaşımlarında nasıl göründüğünü ve
          yeni mesaj bildirimlerinin nereye gideceğini buradan yönetin.
        </p>
      </div>

      <SeoEditor initialData={settings} />

      <BrandImageUploader
        title="Paylaşım Görseli"
        bucket="branding"
        helpText="Facebook/LinkedIn gibi platformlarda paylaşıldığında gösterilir. Önerilen boyut: 1200×630."
        currentPath={settings.ogImagePath}
        uploadAction={uploadOgImageAction}
        deleteAction={deleteOgImageAction}
      />

      {notificationSettings && <NotificationSettingsEditor initialData={notificationSettings} />}
    </div>
  );
}
