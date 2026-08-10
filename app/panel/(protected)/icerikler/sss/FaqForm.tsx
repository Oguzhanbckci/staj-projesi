"use client";

import { useActionState, useEffect, useRef } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { FAQ_FIELD_LABELS, type FaqFormValues } from "@/lib/validation/faq";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { FaqDetail } from "@/lib/supabase/panelQueries";
import { createFaqAction, updateFaqAction } from "./actions";

const FIELD_ID_PREFIX = "sss";

const initialState: ActionResult<keyof FaqFormValues> = {
  success: false,
  fieldErrors: {},
};

// app/panel/(protected)/icerikler/hizmetler/ServiceForm.tsx ile birebir
// aynı desen.
export function FaqForm({ faq }: { faq?: FaqDetail }) {
  const isEdit = !!faq;
  const action = isEdit ? updateFaqAction.bind(null, faq.id) : createFaqAction;
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
          {isEdit ? "Değişiklikler kaydedildi." : "Soru eklendi."}
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
        fieldLabels={FAQ_FIELD_LABELS}
        fieldIdPrefix={FIELD_ID_PREFIX}
      />

      <TextField
        id={`${FIELD_ID_PREFIX}-question`}
        label="Soru"
        name="question"
        required
        defaultValue={faq?.question}
        error={fieldErrors.question}
      />
      <TextareaField
        id={`${FIELD_ID_PREFIX}-answer`}
        label="Cevap"
        name="answer"
        rows={4}
        required
        defaultValue={faq?.answer}
        error={fieldErrors.answer}
      />
      <label className="flex items-center gap-2 text-base text-text">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={faq?.isPublished ?? false}
          className="h-4 w-4 rounded border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        Hemen yayınla
      </label>

      <SubmitButton pendingLabel={isEdit ? "Kaydediliyor…" : "Ekleniyor…"}>
        {isEdit ? "Değişiklikleri Kaydet" : "Soru Ekle"}
      </SubmitButton>
    </form>
  );
}
