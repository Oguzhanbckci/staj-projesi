import { getAboutSettings } from "@/lib/supabase/panelQueries";
import { AboutEditor } from "./AboutEditor";
import { BrandImageUploader } from "../../tema/BrandImageUploader";
import { uploadAboutImageAction, deleteAboutImageAction } from "./imageActions";

export default async function HakkimizdaPage() {
  const settings = await getAboutSettings();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-h3 font-bold text-text">Hakkımızda</h1>
        <p className="mt-2 text-base text-text-muted">
          Ana sayfadaki firma tanıtım bölümünü buradan düzenleyin.
        </p>
      </div>

      <AboutEditor initialData={settings} />

      <BrandImageUploader
        title="Görsel"
        bucket="about"
        helpText="Firma/ekip/şantiye fotoğrafı gibi bir görsel önerilir."
        currentPath={settings?.imagePath ?? null}
        uploadAction={uploadAboutImageAction}
        deleteAction={deleteAboutImageAction}
      />
    </div>
  );
}
