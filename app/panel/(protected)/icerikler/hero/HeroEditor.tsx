"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SelectField } from "@/components/ui/SelectField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { HERO_FIELD_LABELS, type HeroFormValues } from "@/lib/validation/hero";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { HeroSettingsData } from "@/lib/supabase/panelQueries";
import { updateHeroSectionAction } from "./actions";

const FIELD_ID_PREFIX = "hero";

const initialState: ActionResult<keyof HeroFormValues> = {
  success: false,
  fieldErrors: {},
};

const EMPTY_DEFAULTS: HeroSettingsData = {
  variant: "a",
  title: "",
  subtitle: null,
  ctaText: null,
  ctaLink: null,
  secondaryCtaText: null,
  secondaryCtaLink: null,
  backgroundImagePath: null,
};

// SeoEditor/ThemeEditor ile aynı iskelet — hiçbir alan canlı önizleme
// beslemediği için tamamı BİLEREK uncontrolled (defaultValue), SeoEditor'daki
// seoKeywords alanıyla aynı gerekçe. `initialData` null olabilir (satır hiç
// yoksa, bkz. getHeroSettings) — bu durumda boş varsayılanlarla ilk kayıt
// bu formdan oluşturulur (actions.ts upsert kullanıyor).
export function HeroEditor({ initialData }: { initialData: HeroSettingsData | null }) {
  const [state, formAction] = useActionState(updateHeroSectionAction, initialState);
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
          fieldLabels={HERO_FIELD_LABELS}
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
          id={`${FIELD_ID_PREFIX}-subtitle`}
          label="Alt Başlık (opsiyonel)"
          name="subtitle"
          rows={2}
          defaultValue={data.subtitle ?? undefined}
          error={fieldErrors.subtitle}
        />

        <SelectField
          id={`${FIELD_ID_PREFIX}-variant`}
          label="Varsayılan Görünüm"
          name="variant"
          defaultValue={data.variant}
          error={fieldErrors.variant}
          helpText='"Sayfa Düzeni" ekranından bu bölüm için ayrı bir görünüm seçilirse, o öncelikli olur.'
        >
          <option value="a">Görünüm A</option>
          <option value="b">Görünüm B</option>
        </SelectField>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={`${FIELD_ID_PREFIX}-ctaText`}
            label="Buton Metni (opsiyonel)"
            name="ctaText"
            defaultValue={data.ctaText ?? undefined}
            error={fieldErrors.ctaText}
          />
          <TextField
            id={`${FIELD_ID_PREFIX}-ctaLink`}
            label="Buton Bağlantısı (opsiyonel)"
            name="ctaLink"
            defaultValue={data.ctaLink ?? undefined}
            error={fieldErrors.ctaLink}
            helpText='Örn. "#iletisim", "/iletisim" veya tam bir adres.'
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={`${FIELD_ID_PREFIX}-secondaryCtaText`}
            label="İkinci Buton Metni (opsiyonel)"
            name="secondaryCtaText"
            defaultValue={data.secondaryCtaText ?? undefined}
            error={fieldErrors.secondaryCtaText}
          />
          <TextField
            id={`${FIELD_ID_PREFIX}-secondaryCtaLink`}
            label="İkinci Buton Bağlantısı (opsiyonel)"
            name="secondaryCtaLink"
            defaultValue={data.secondaryCtaLink ?? undefined}
            error={fieldErrors.secondaryCtaLink}
          />
        </div>

        <SubmitButton pendingLabel="Kaydediliyor…">Değişiklikleri Kaydet</SubmitButton>
      </form>
    </div>
  );
}
