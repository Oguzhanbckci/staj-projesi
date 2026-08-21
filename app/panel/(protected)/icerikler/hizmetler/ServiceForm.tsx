"use client";

import { useActionState, useEffect, useRef } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { SERVICE_FIELD_LABELS } from "@/lib/validation/serviceFields";
import type { ServiceFormValues } from "@/lib/validation/service";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { ServiceDetail } from "@/lib/supabase/panelQueries";
import { createServiceAction, updateServiceAction } from "./actions";

const FIELD_ID_PREFIX = "hizmet";

const initialState: ActionResult<keyof ServiceFormValues> = {
  success: false,
  fieldErrors: {},
};

// Hem "yeni hizmet ekle" hem "hizmeti düzenle" formu — `service` prop'u
// verilirse düzenleme moduna geçer (mevcut değerlerle doldurulur,
// updateServiceAction'a `id` önceden bağlanmış olarak çağrılır). Doğrulama,
// gösterdiği hata metinleri dahil, sunucudaki action'la (bkz. actions.ts)
// BİREBİR aynı zod şemasından (lib/validation/service.ts) geliyor.
export function ServiceForm({ service }: { service?: ServiceDetail }) {
  const isEdit = !!service;
  const action = isEdit ? updateServiceAction.bind(null, service.id) : createServiceAction;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const fieldErrors = state.success ? {} : state.fieldErrors;
  const formError = state.success ? undefined : state.formError;

  useEffect(() => {
    if (state.success) {
      // Düzenleme modunda formu boşaltmaya gerek yok — kaydedilen
      // değerler zaten ekranda kalmalı. Sadece "ekle" modunda sıfırlanır.
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
          {isEdit ? "Değişiklikler kaydedildi." : "Hizmet eklendi."}
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
        fieldLabels={SERVICE_FIELD_LABELS}
        fieldIdPrefix={FIELD_ID_PREFIX}
      />

      <TextField
        id={`${FIELD_ID_PREFIX}-title`}
        label="Başlık"
        name="title"
        required
        defaultValue={service?.title}
        error={fieldErrors.title}
      />
      <TextareaField
        id={`${FIELD_ID_PREFIX}-description`}
        label="Açıklama (opsiyonel)"
        name="description"
        rows={3}
        defaultValue={service?.description ?? undefined}
        error={fieldErrors.description}
      />
      <TextField
        id={`${FIELD_ID_PREFIX}-icon`}
        label="İkon (opsiyonel)"
        name="icon"
        helpText='Lucide ikon adı, ör. "hammer"'
        defaultValue={service?.icon ?? undefined}
        error={fieldErrors.icon}
      />
      <label className="flex items-center gap-2 text-base text-text">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={service?.isPublished ?? false}
          className="h-4 w-4 rounded border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        Hemen yayınla
      </label>

      <SubmitButton pendingLabel={isEdit ? "Kaydediliyor…" : "Ekleniyor…"}>
        {isEdit ? "Değişiklikleri Kaydet" : "Hizmet Ekle"}
      </SubmitButton>
    </form>
  );
}
