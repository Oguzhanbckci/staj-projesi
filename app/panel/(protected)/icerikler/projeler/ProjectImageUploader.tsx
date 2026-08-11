"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DeleteButton } from "@/components/panel/DeleteButton";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import {
  detectImageSignature,
  formatMegabytes,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/supabase/imageValidation";
import type { ProjectDetail } from "@/lib/supabase/panelQueries";
import {
  deleteProjectImageAction,
  uploadProjectImageAction,
  type ImageActionState,
} from "./imageActions";

const initialState: ImageActionState = { success: true };

// Dosya seç → önizle → yükle — sadece düzenleme modunda render edilir
// (bkz. [id]/page.tsx), çünkü bağlanacak bir proje id'si gerekiyor.
// İstemci tarafı doğrulama (tür/boyut) sadece UX içindir — sunucu
// (imageActions.ts) AYNI kontrolleri, AYNI paylaşılan
// lib/supabase/imageValidation.ts fonksiyonlarıyla tekrar yapar
// (bkz. docs/MIMARI.md madde 10: "istemciden gelen veriye asla
// güvenilmez").
export function ProjectImageUploader({ project }: { project: ProjectDetail }) {
  const uploadAction = uploadProjectImageAction.bind(null, project.id);
  const [state, formAction] = useActionState(uploadAction, initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const currentImageUrl = project.imagePath
    ? getPublicImageUrl("projects", project.imagePath)
    : null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Başarılı yüklemeden sonra dosya input'unu sıfırla — ServiceForm.tsx'teki
  // AYNI `formRef.current?.reset()` deseni (bir DOM ref metodu, React
  // setState değil). Yerel önizleme bilerek burada temizlenmiyor —
  // zaten "yeni yüklenen görsel" ile "seçilen dosya önizlemesi" aynı
  // resmi gösteriyor, kullanıcı yeni bir dosya seçtiğinde onChange
  // otomatik olarak değiştirir.
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    setSelectedFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setClientError(
        `Dosya boyutu ${formatMegabytes(file.size)}, izin verilen üst sınır ${formatMegabytes(MAX_IMAGE_SIZE_BYTES)}. Telefonunuzun galeri/paylaşım ekranında "küçük" veya "orta boyut" seçeneğini kullanarak tekrar deneyin.`
      );
      event.target.value = "";
      return;
    }

    const signature = await detectImageSignature(file);
    if (!signature) {
      setClientError("Sadece JPEG, PNG veya WEBP formatında görsel yükleyebilirsiniz.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <div className="max-w-lg space-y-4 border-t border-neutral-300 pt-8">
      <h2 className="text-h5 font-semibold text-text">Proje Görseli</h2>

      {currentImageUrl && (
        <div>
          <p className="mb-2 text-caption font-semibold text-text-muted">Mevcut görsel</p>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-32 overflow-hidden rounded-md bg-neutral-100">
              <Image src={currentImageUrl} alt="" fill sizes="128px" className="object-cover" />
            </div>
            <DeleteButton
              id={project.imagePath!}
              itemName={project.title}
              entityLabel="proje görseli"
              action={deleteProjectImageAction}
            />
          </div>
        </div>
      )}

      {state.success === false && state.formError && (
        <p
          role="alert"
          className="rounded-md border border-error bg-surface-raised px-4 py-3 text-base text-error"
        >
          {state.formError}
        </p>
      )}

      <form ref={formRef} action={formAction} className="space-y-3">
        <label className="block text-base text-text" htmlFor="project-image-input">
          {currentImageUrl ? "Görseli değiştir" : "Görsel yükle"}
        </label>
        <input
          id="project-image-input"
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={handleFileChange}
          className="block w-full text-base text-text file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-brand-on file:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <p className="text-caption text-text-muted">
          JPEG, PNG veya WEBP — en fazla {formatMegabytes(MAX_IMAGE_SIZE_BYTES)}.
        </p>

        {clientError && (
          <p role="alert" className="text-caption text-error">
            {clientError}
          </p>
        )}

        {previewUrl && (
          <div>
            <p className="mb-2 text-caption font-semibold text-text-muted">Seçilen görsel</p>
            <div className="relative h-24 w-32 overflow-hidden rounded-md bg-neutral-100">
              {/* Yerel bir blob: URL'i — next/image uzak/statik kaynaklar için tasarlandı, geçici önizlemeler için düz <img> doğru araç. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Yüklenecek görselin önizlemesi"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        <SubmitButton pendingLabel="Yükleniyor…" disabled={!selectedFile}>
          Yükle
        </SubmitButton>
      </form>
    </div>
  );
}
