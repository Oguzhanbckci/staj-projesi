"use client";

import { useActionState, useEffect, useRef } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SelectField } from "@/components/ui/SelectField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { TESTIMONIAL_FIELD_LABELS, type TestimonialFormValues } from "@/lib/validation/testimonial";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { TestimonialDetail } from "@/lib/supabase/panelQueries";
import { createTestimonialAction, updateTestimonialAction } from "./actions";

const FIELD_ID_PREFIX = "referans";

const initialState: ActionResult<keyof TestimonialFormValues> = {
  success: false,
  fieldErrors: {},
};

// app/panel/(protected)/icerikler/hizmetler/ServiceForm.tsx ile birebir
// aynı desen (hem ekle hem düzenle, aynı zod şeması sunucuyla paylaşılır).
export function TestimonialForm({ testimonial }: { testimonial?: TestimonialDetail }) {
  const isEdit = !!testimonial;
  const action = isEdit
    ? updateTestimonialAction.bind(null, testimonial.id)
    : createTestimonialAction;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const fieldErrors = state.success ? {} : state.fieldErrors;
  const formError = state.success ? undefined : state.formError;

  useEffect(() => {
    if (state.success) {
      if (!isEdit) formRef.current?.reset();
    } else if (Object.keys(fieldErrors).length > 0 || formError) {
      summaryRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-4">
      {state.success && (
        <p
          role="status"
          className="rounded-md border border-success bg-surface-raised px-4 py-3 text-base text-success"
        >
          {isEdit ? "Değişiklikler kaydedildi." : "Referans eklendi."}
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
        ref={summaryRef}
        errors={fieldErrors}
        fieldLabels={TESTIMONIAL_FIELD_LABELS}
        fieldIdPrefix={FIELD_ID_PREFIX}
      />

      <TextField
        id={`${FIELD_ID_PREFIX}-authorName`}
        label="Ad Soyad"
        name="authorName"
        required
        defaultValue={testimonial?.authorName}
        error={fieldErrors.authorName}
      />
      <TextField
        id={`${FIELD_ID_PREFIX}-authorTitle`}
        label="Unvan / Firma (opsiyonel)"
        name="authorTitle"
        helpText='ör. "Kaya Holding, Genel Müdür"'
        defaultValue={testimonial?.authorTitle ?? undefined}
        error={fieldErrors.authorTitle}
      />
      <TextareaField
        id={`${FIELD_ID_PREFIX}-quote`}
        label="Yorum"
        name="quote"
        rows={4}
        required
        defaultValue={testimonial?.quote}
        error={fieldErrors.quote}
      />
      <SelectField
        id={`${FIELD_ID_PREFIX}-rating`}
        label="Puan (opsiyonel)"
        name="rating"
        defaultValue={testimonial?.rating ? String(testimonial.rating) : ""}
        error={fieldErrors.rating}
      >
        <option value="">Belirtilmedi</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </SelectField>
      <label className="flex items-center gap-2 text-base text-text">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={testimonial?.isPublished ?? false}
          className="h-4 w-4 rounded border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        Hemen yayınla
      </label>

      <SubmitButton pendingLabel={isEdit ? "Kaydediliyor…" : "Ekleniyor…"}>
        {isEdit ? "Değişiklikleri Kaydet" : "Referans Ekle"}
      </SubmitButton>
    </form>
  );
}
