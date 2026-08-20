"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { ABOUT_FIELD_LABELS, type AboutFormValues } from "@/lib/validation/about";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { AboutSettingsData } from "@/lib/supabase/panelQueries";
import { updateAboutSectionAction } from "./actions";

const FIELD_ID_PREFIX = "about";

const initialState: ActionResult<keyof AboutFormValues> = {
  success: false,
  fieldErrors: {},
};

const EMPTY_DEFAULTS: AboutSettingsData = {
  title: "",
  description: null,
  foundedYear: null,
  coreValues: [],
  imagePath: null,
};

// HeroEditor ile aynı iskelet (bkz. ../hero/HeroEditor.tsx) — tamamı
// uncontrolled. `coreValues` diziyi satır satır bir textarea'ya çevirir
// (join("\n")), sunucu eylemi geri satırlara böler (bkz. actions.ts).
export function AboutEditor({ initialData }: { initialData: AboutSettingsData | null }) {
  const [state, formAction] = useActionState(updateAboutSectionAction, initialState);
  const data = initialData ?? EMPTY_DEFAULTS;

  const fieldErrors = state.success ? {} : state.fieldErrors;
  const formError = state.success ? undefined : state.formError;

  return (
    <div className="max-w-2xl space-y-4">
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
          fieldLabels={ABOUT_FIELD_LABELS}
          fieldIdPrefix={FIELD_ID_PREFIX}
        />

        <TextField
          id={`${FIELD_ID_PREFIX}-title`}
          label="Başlık"
          name="title"
          required
          defaultValue={data.title}
          error={fieldErrors.title}
        />

        <TextareaField
          id={`${FIELD_ID_PREFIX}-description`}
          label="Açıklama (opsiyonel)"
          name="description"
          rows={5}
          defaultValue={data.description ?? undefined}
          error={fieldErrors.description}
        />

        <TextField
          id={`${FIELD_ID_PREFIX}-foundedYear`}
          label="Kuruluş Yılı (opsiyonel)"
          name="foundedYear"
          inputMode="numeric"
          defaultValue={data.foundedYear ?? undefined}
          error={fieldErrors.foundedYear}
        />

        <TextareaField
          id={`${FIELD_ID_PREFIX}-coreValues`}
          label="Değerlerimiz (opsiyonel)"
          name="coreValues"
          rows={6}
          defaultValue={data.coreValues.join("\n")}
          error={fieldErrors.coreValues}
          helpText={
            // Yardım metni 2026-08-20'de değişti. Eski hâli tek kelimelik
            // değerler öneriyordu ("Kalite, Güvenilirlik") — 38 gerçek
            // "Hakkımızda" sayfasının incelenmesinde çıplak sıfat listeleri
            // en zayıf, "Başlık — somut cümle" biçimi en inandırıcı bulundu.
            // Sitede başlık kalın, açıklama altında soluk render ediliyor;
            // tire yazılmazsa madde yalnızca başlıktan ibaret kalır, bozulmaz.
            "Her satıra bir değer yazın. Önerilen biçim: kısa bir başlık, tire, sonra ne yaptığınızı söyleyen tek cümle — ör. “Söz verilen tarih — Teslim tarihini sözleşmeye yazar, sapmayı beklemeden bildiririz.” Sıfat sıralamak (“Kaliteli, güvenilir”) yerine fiil kullanmak daha ikna edici olur. 4-6 madde yeterlidir."
          }
        />

        <SubmitButton pendingLabel="Kaydediliyor…">Değişiklikleri Kaydet</SubmitButton>
      </form>
    </div>
  );
}
