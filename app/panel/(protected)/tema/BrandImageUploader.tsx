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
import type { ImageActionState } from "./imageActions";

const initialState: ImageActionState = { success: true };

export interface BrandImageUploaderProps {
  title: string;
  helpText?: string;
  currentPath: string | null;
  bucket: string;
  uploadAction: (prevState: ImageActionState, formData: FormData) => Promise<ImageActionState>;
  deleteAction: (prevState: ImageActionState, formData: FormData) => Promise<ImageActionState>;
}

// ProjectImageUploader.tsx'in (icerikler/projeler/) generic hali — markup
// %100 aynı (seç→önizle→yükle, mevcut görsel + Sil), sadece hangi eyleme
// bağlı olduğu, hangi bucket'ı hedeflediği ve etiket/yardım metni
// dışarıdan geliyor. Logo/favicon/OG görseli (hepsi "branding" bucket'ı)
// için üç kez, Hero/Hakkımızda (2026-08-18, dokuzuncu oturum — "hero"/
// "about" bucket'ları) için birer kez örnekleniyor (bkz. page.tsx'ler) —
// DB-özel/güvenlik-kritik sunucu eylemleri (imageActions.ts) BİLEREK
// ayrı kalıyor, sadece markup paylaşılıyor. `bucket` başlangıçta
// "branding"e sabit kodluydu, genelleştirildi (bkz. docs/KARAR-GUNLUGU.md).
export function BrandImageUploader({
  title,
  helpText,
  currentPath,
  bucket,
  uploadAction,
  deleteAction,
}: BrandImageUploaderProps) {
  const [state, formAction] = useActionState(uploadAction, initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputId = `brand-image-${title.toLowerCase()}`;

  const currentUrl = currentPath ? getPublicImageUrl(bucket, currentPath) : null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
      <h2 className="text-h5 font-semibold text-text">{title}</h2>

      {currentUrl && (
        <div>
          <p className="mb-2 text-caption font-semibold text-text-muted">Mevcut görsel</p>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-100">
              <Image src={currentUrl} alt="" fill sizes="64px" className="object-contain" />
            </div>
            <DeleteButton id={currentPath!} itemName={title} entityLabel="dosya" action={deleteAction} />
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
        <label className="block text-base text-text" htmlFor={inputId}>
          {currentUrl ? `${title} değiştir` : `${title} yükle`}
        </label>
        <input
          id={inputId}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          required
          onChange={handleFileChange}
          className="block w-full text-base text-text file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-brand-on file:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <p className="text-caption text-text-muted">
          JPEG, PNG veya WEBP — en fazla {formatMegabytes(MAX_IMAGE_SIZE_BYTES)}.
          {helpText ? ` ${helpText}` : ""}
        </p>

        {clientError && (
          <p role="alert" className="text-caption text-error">
            {clientError}
          </p>
        )}

        {previewUrl && (
          <div>
            <p className="mb-2 text-caption font-semibold text-text-muted">Seçilen görsel</p>
            <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-100">
              {/* Yerel bir blob: URL'i — next/image uzak/statik kaynaklar için tasarlandı, geçici önizlemeler için düz <img> doğru araç. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Yüklenecek görselin önizlemesi"
                className="h-full w-full object-contain"
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
