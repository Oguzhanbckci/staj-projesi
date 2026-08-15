import { getHeroSettings } from "@/lib/supabase/panelQueries";
import { HeroEditor } from "./HeroEditor";
import { BrandImageUploader } from "../../tema/BrandImageUploader";
import { uploadHeroImageAction, deleteHeroImageAction } from "./imageActions";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function HeroPage() {
  const settings = await getHeroSettings();

  return (
    <div className="space-y-10">
      <div>
        <Breadcrumbs
          items={[{ label: "İçerikler", href: "/panel/icerikler" }, { label: "Hero" }]}
          className="mb-2"
        />
        <h1 className="text-h3 font-bold text-text">Hero</h1>
        <p className="mt-2 text-base text-text-muted">
          Ana sayfanın en üstündeki büyük tanıtım bölümünü buradan düzenleyin.
        </p>
      </div>

      <HeroEditor initialData={settings} />

      <BrandImageUploader
        title="Arka Plan Görseli"
        bucket="hero"
        helpText="Görsel yoksa yerine dekoratif bir zemin gösterilir. Geniş, yatay bir fotoğraf önerilir."
        currentPath={settings?.backgroundImagePath ?? null}
        uploadAction={uploadHeroImageAction}
        deleteAction={deleteHeroImageAction}
      />
    </div>
  );
}
