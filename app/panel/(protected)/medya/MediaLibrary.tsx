import Image from "next/image";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { getProjectImageUsageMap, listProjectImages } from "@/lib/supabase/panelQueries";
import { DeleteButton } from "@/components/panel/DeleteButton";
import { deleteProjectImageAction } from "../icerikler/projeler/imageActions";

// Önizleme + dosya adı + "kullanıldığı yer" + Sil. Silme, hem burada hem
// ProjectImageUploader.tsx'te AYNI deleteProjectImageAction'ı kullanıyor
// (bkz. o dosyadaki yorum — path eşleşmesine bakıyor, hangi ekrandan
// çağrıldığı fark etmiyor).
export async function MediaLibrary() {
  const [images, usageMap] = await Promise.all([listProjectImages(), getProjectImageUsageMap()]);

  if (images.length === 0) {
    return <p className="text-base text-text-muted">Henüz hiç görsel yüklenmemiş.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-base">
        <thead>
          <tr className="border-b border-neutral-300 text-caption font-semibold uppercase tracking-wide text-text-muted">
            <th className="py-2 pr-4">Önizleme</th>
            <th className="py-2 pr-4">Dosya Adı</th>
            <th className="py-2 pr-4">Kullanıldığı Yer</th>
            <th className="py-2 pr-4">
              <span className="sr-only">İşlemler</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => {
            const usedByProject = usageMap.get(image.path);
            return (
              <tr key={image.path} className="border-b border-neutral-100 last:border-0">
                <td className="py-3 pr-4">
                  <div className="relative h-16 w-20 overflow-hidden rounded-md bg-neutral-100">
                    <Image
                      src={getPublicImageUrl("projects", image.path)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 pr-4 text-text-muted">{image.name}</td>
                <td className="py-3 pr-4">
                  {usedByProject ? (
                    <span className="text-text">{usedByProject}</span>
                  ) : (
                    <span className="text-text-muted">Kullanılmıyor</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <DeleteButton
                    id={image.path}
                    itemName={image.name}
                    entityLabel="görsel"
                    action={deleteProjectImageAction}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
