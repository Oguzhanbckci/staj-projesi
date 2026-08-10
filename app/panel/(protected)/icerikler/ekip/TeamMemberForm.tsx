"use client";

import { useActionState, useEffect, useRef } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { TEAM_MEMBER_FIELD_LABELS, type TeamMemberFormValues } from "@/lib/validation/teamMember";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { TeamMemberDetail } from "@/lib/supabase/panelQueries";
import { createTeamMemberAction, updateTeamMemberAction } from "./actions";

const FIELD_ID_PREFIX = "ekip";

const initialState: ActionResult<keyof TeamMemberFormValues> = {
  success: false,
  fieldErrors: {},
};

// app/panel/(protected)/icerikler/hizmetler/ServiceForm.tsx ile birebir
// aynı desen.
export function TeamMemberForm({ member }: { member?: TeamMemberDetail }) {
  const isEdit = !!member;
  const action = isEdit ? updateTeamMemberAction.bind(null, member.id) : createTeamMemberAction;
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
          {isEdit ? "Değişiklikler kaydedildi." : "Ekip üyesi eklendi."}
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
        fieldLabels={TEAM_MEMBER_FIELD_LABELS}
        fieldIdPrefix={FIELD_ID_PREFIX}
      />

      <TextField
        id={`${FIELD_ID_PREFIX}-fullName`}
        label="Ad Soyad"
        name="fullName"
        required
        defaultValue={member?.fullName}
        error={fieldErrors.fullName}
      />
      <TextField
        id={`${FIELD_ID_PREFIX}-role`}
        label="Unvan"
        name="role"
        required
        helpText='ör. "Kıdemli Yazılım Mühendisi"'
        defaultValue={member?.role}
        error={fieldErrors.role}
      />
      <TextareaField
        id={`${FIELD_ID_PREFIX}-bio`}
        label="Kısa Biyografi (opsiyonel)"
        name="bio"
        rows={3}
        defaultValue={member?.bio ?? undefined}
        error={fieldErrors.bio}
      />
      <label className="flex items-center gap-2 text-base text-text">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={member?.isPublished ?? false}
          className="h-4 w-4 rounded border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        Hemen yayınla
      </label>

      <SubmitButton pendingLabel={isEdit ? "Kaydediliyor…" : "Ekleniyor…"}>
        {isEdit ? "Değişiklikleri Kaydet" : "Ekip Üyesi Ekle"}
      </SubmitButton>
    </form>
  );
}
