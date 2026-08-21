"use client";

import { useActionState, useEffect, useRef } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { PROJECT_FIELD_LABELS } from "@/lib/validation/projectFields";
import type { ProjectFormValues } from "@/lib/validation/project";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { ProjectDetail } from "@/lib/supabase/panelQueries";
import { createProjectAction, updateProjectAction } from "./actions";

const FIELD_ID_PREFIX = "proje";

const initialState: ActionResult<keyof ProjectFormValues> = {
  success: false,
  fieldErrors: {},
};

// ServiceForm.tsx ile birebir aynı desen (create+edit tek bileşende) —
// bkz. o dosyadaki yorum.
export function ProjectForm({ project }: { project?: ProjectDetail }) {
  const isEdit = !!project;
  const action = isEdit ? updateProjectAction.bind(null, project.id) : createProjectAction;
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
          {isEdit ? "Değişiklikler kaydedildi." : "Proje eklendi."}
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
        fieldLabels={PROJECT_FIELD_LABELS}
        fieldIdPrefix={FIELD_ID_PREFIX}
      />

      <TextField
        id={`${FIELD_ID_PREFIX}-title`}
        label="Başlık"
        name="title"
        required
        defaultValue={project?.title}
        error={fieldErrors.title}
      />
      <TextareaField
        id={`${FIELD_ID_PREFIX}-description`}
        label="Açıklama (opsiyonel)"
        name="description"
        rows={3}
        defaultValue={project?.description ?? undefined}
        error={fieldErrors.description}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id={`${FIELD_ID_PREFIX}-category`}
          label="Kategori (opsiyonel)"
          name="category"
          helpText='Ör. "Konut", "Ticari"'
          defaultValue={project?.category ?? undefined}
          error={fieldErrors.category}
        />
        <TextField
          id={`${FIELD_ID_PREFIX}-location`}
          label="Konum (opsiyonel)"
          name="location"
          defaultValue={project?.location ?? undefined}
          error={fieldErrors.location}
        />
        <TextField
          id={`${FIELD_ID_PREFIX}-year`}
          label="Yıl (opsiyonel)"
          name="year"
          inputMode="numeric"
          defaultValue={project?.year ? String(project.year) : undefined}
          error={fieldErrors.year}
        />
        <TextField
          id={`${FIELD_ID_PREFIX}-liveUrl`}
          label="Canlı Bağlantı (opsiyonel)"
          name="liveUrl"
          type="url"
          defaultValue={project?.liveUrl ?? undefined}
          error={fieldErrors.liveUrl}
        />
      </div>
      <label className="flex items-center gap-2 text-base text-text">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={project?.isPublished ?? false}
          className="h-4 w-4 rounded border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        Hemen yayınla
      </label>

      <SubmitButton pendingLabel={isEdit ? "Kaydediliyor…" : "Ekleniyor…"}>
        {isEdit ? "Değişiklikleri Kaydet" : "Proje Ekle"}
      </SubmitButton>
    </form>
  );
}
