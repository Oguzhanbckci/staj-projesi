import { getThemeSettings } from "@/lib/supabase/panelQueries";
import { ThemeEditor } from "./ThemeEditor";
import { BrandImageUploader } from "./BrandImageUploader";
import { uploadLogoAction, deleteLogoAction, uploadFaviconAction, deleteFaviconAction } from "./imageActions";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";

const TEMA_BREADCRUMB_ITEMS: BreadcrumbItem[] = [{ label: "Özet", href: "/panel" }, { label: "Tema" }];

export default async function TemaPage() {
  const settings = await getThemeSettings();

  if (!settings) {
    return (
      <div>
        <Breadcrumbs items={TEMA_BREADCRUMB_ITEMS} className="mb-2" />
        <h1 className="text-h3 font-bold text-text">Tema</h1>
        <p className="mt-4 text-base text-text-muted">
          Tema ayarları şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs items={TEMA_BREADCRUMB_ITEMS} className="mb-2" />
        <h1 className="text-h3 font-bold text-text">Tema</h1>
        <p className="mt-2 text-base text-text-muted">
          Marka rengi, köşe yarıçapı, font ailesi ve site kimliği bilgilerinizi buradan
          yönetin. Sağdaki önizleme, değişiklikleri kaydetmeden gösterir.
        </p>
      </div>

      <ThemeEditor initialData={settings} />

      <BrandImageUploader
        title="Logo"
        bucket="branding"
        currentPath={settings.logoPath}
        uploadAction={uploadLogoAction}
        deleteAction={deleteLogoAction}
      />
      <BrandImageUploader
        title="Favicon"
        bucket="branding"
        helpText="Kare bir görsel önerilir (ör. 512×512)."
        currentPath={settings.faviconPath}
        uploadAction={uploadFaviconAction}
        deleteAction={deleteFaviconAction}
      />
    </div>
  );
}
