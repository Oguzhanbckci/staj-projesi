"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import {
  NOTIFICATION_FIELD_LABELS,
  type NotificationSettingsFormValues,
} from "@/lib/validation/notifications";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { NotificationSettingsData } from "@/lib/supabase/panelQueries";
import { updateNotificationSettingsAction } from "./actions";

const FIELD_ID_PREFIX = "notification";

const initialState: ActionResult<keyof NotificationSettingsFormValues> = {
  success: false,
  fieldErrors: {},
};

// SeoEditor'ün tek-alanlı küçültülmüş hâli — canlı önizleme gerekmediği
// için `recipientEmail` BİLEREK uncontrolled (defaultValue), seoKeywords
// alanıyla aynı gerekçe (bkz. SeoEditor.tsx).
export function NotificationSettingsEditor({
  initialData,
}: {
  initialData: NotificationSettingsData;
}) {
  const [state, formAction] = useActionState(updateNotificationSettingsAction, initialState);

  const fieldErrors = state.success ? {} : state.fieldErrors;
  const formError = state.success ? undefined : state.formError;

  return (
    <div className="max-w-lg space-y-4 border-t border-neutral-300 pt-8">
      <div>
        <h2 className="text-h5 font-semibold text-text">Bildirimler</h2>
        <p className="mt-1 text-base text-text-muted">
          İletişim formuna yeni bir mesaj geldiğinde bu adrese bir bildirim e-postası
          gönderilir. Boş bırakırsanız e-posta gönderilmez — mesajlar yine de{" "}
          <span className="font-medium text-text">Mesajlar</span> ekranında görünür.
        </p>
      </div>

      <form action={formAction} noValidate className="space-y-4">
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
          fieldLabels={NOTIFICATION_FIELD_LABELS}
          fieldIdPrefix={FIELD_ID_PREFIX}
        />

        <TextField
          id={`${FIELD_ID_PREFIX}-recipientEmail`}
          label="Bildirim E-postası (opsiyonel)"
          name="recipientEmail"
          type="email"
          defaultValue={initialData.recipientEmail ?? undefined}
          error={fieldErrors.recipientEmail}
          helpText="Örn. bilgi@firmaniz.com"
        />

        <SubmitButton pendingLabel="Kaydediliyor…">Değişiklikleri Kaydet</SubmitButton>
      </form>
    </div>
  );
}
