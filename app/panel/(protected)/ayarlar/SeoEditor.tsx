"use client";

import { useActionState, useState } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { SearchResultPreview } from "./SearchResultPreview";
import {
  SEO_FIELD_LABELS,
  SEO_TITLE_RECOMMENDED_MAX,
  SEO_DESCRIPTION_RECOMMENDED_MAX,
  type SeoSettingsFormValues,
} from "@/lib/validation/seo";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { SeoSettingsData } from "@/lib/supabase/panelQueries";
import { updateSeoSettingsAction } from "./actions";

const FIELD_ID_PREFIX = "seo";

const initialState: ActionResult<keyof SeoSettingsFormValues> = {
  success: false,
  fieldErrors: {},
};

// KISITLAR: "sınır aşılınca uyar" — SERT bir engelleme değil, sadece
// görsel bir renk değişimi (bkz. lib/validation/seo.ts'teki yorum: zod
// max'ları çok daha yüksek, gerçek SEO pratiğinde uzun bir başlık hata
// değil, sadece arama sonucunda kesilme demek).
// KISITLAR/erişilebilirlik: BİLEREK role="status"/aria-live YOK — bu metin
// her tuş vuruşunda değişiyor, bir canlı bölgeye bağlanırsa ekran okuyucu
// kullanıcısının kendi yazdığı karakterlerin echo'suyla çakışıp alanı
// pratikte kullanılamaz hale getirir (bkz. docs/GUVENLIK.md/TEST-
// STRATEJISI.md erişilebilirlik denetimi, 2026-08-17). Görsel kullanıcı
// için değer zaten anlık güncelleniyor; ekran okuyucu kullanıcısı normal
// okuma komutlarıyla istediğinde bu paragrafa ulaşabilir.
function CharacterCount({ length, max }: { length: number; max: number }) {
  const overLimit = length > max;
  return (
    <p className={`text-caption ${overLimit ? "text-warning" : "text-text-muted"}`}>
      {length} / {max} karakter
      {overLimit && " — bu sınırın üzerindeki metin arama sonucunda kesilebilir."}
    </p>
  );
}

// ThemeEditor.tsx'in küçük ölçekli hâli — seoTitle/seoDescription
// CONTROLLED (canlı karakter sayacı + arama sonucu önizlemesi için
// gerekli), seoKeywords UNCONTROLLED (önizlemeyi beslemiyor).
export function SeoEditor({ initialData }: { initialData: SeoSettingsData }) {
  const [state, formAction] = useActionState(updateSeoSettingsAction, initialState);

  const [seoTitle, setSeoTitle] = useState(initialData.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData.seoDescription ?? "");

  const fieldErrors = state.success ? {} : state.fieldErrors;
  const formError = state.success ? undefined : state.formError;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={formAction} noValidate className="space-y-6">
        {state.success && (
          <p
            role="status"
            className="rounded-md border border-success bg-surface-raised px-4 py-3 text-base text-success"
          >
            Değişiklikler kaydedildi.
          </p>
        )}

        {formError && (
          <p
            role="alert"
            className="rounded-md border border-error bg-surface-raised px-4 py-3 text-base text-error"
          >
            {formError}
          </p>
        )}

        <FormErrorSummary
          errors={fieldErrors}
          fieldLabels={SEO_FIELD_LABELS}
          fieldIdPrefix={FIELD_ID_PREFIX}
        />

        <div>
          <TextField
            id={`${FIELD_ID_PREFIX}-seoTitle`}
            label="Sayfa Başlığı (opsiyonel)"
            name="seoTitle"
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.target.value)}
            error={fieldErrors.seoTitle}
            helpText="Boş bırakırsanız firma adınız kullanılır."
          />
          <div className="mt-1">
            <CharacterCount length={seoTitle.length} max={SEO_TITLE_RECOMMENDED_MAX} />
          </div>
        </div>

        <div>
          <TextareaField
            id={`${FIELD_ID_PREFIX}-seoDescription`}
            label="Açıklama (opsiyonel)"
            name="seoDescription"
            rows={3}
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
            error={fieldErrors.seoDescription}
          />
          <div className="mt-1">
            <CharacterCount length={seoDescription.length} max={SEO_DESCRIPTION_RECOMMENDED_MAX} />
          </div>
        </div>

        <TextField
          id={`${FIELD_ID_PREFIX}-seoKeywords`}
          label="Anahtar Kelimeler (opsiyonel)"
          name="seoKeywords"
          defaultValue={initialData.seoKeywords ?? undefined}
          error={fieldErrors.seoKeywords}
          helpText='Virgülle ayırın (ör. "inşaat, mimarlık, konut projesi"). Not: Modern arama motorlarının çoğu bu alanı artık dikkate almıyor, yine de saklanır.'
        />

        <SubmitButton pendingLabel="Kaydediliyor…">Değişiklikleri Kaydet</SubmitButton>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start space-y-2">
        <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
          Arama Sonucunda Böyle Görünecek
        </p>
        <SearchResultPreview
          domain={initialData.domain}
          title={seoTitle}
          description={seoDescription}
        />
      </div>
    </div>
  );
}
