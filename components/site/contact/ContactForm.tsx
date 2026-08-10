"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import {
  CONTACT_FIELD_LABELS,
  CONTACT_SUBJECTS,
  CONTACT_SUBJECT_LABELS,
} from "@/lib/validation/contact";
import { submitContactForm, type ContactFormState } from "./actions";

// "use server" dosyasından (actions.ts) sadece fonksiyon export
// edilebilir — düz bir sabit nesne (initial state) oradan import edilirse
// istemci tarafında undefined'a düşer (bkz. docs/KARAR-GUNLUGU.md,
// 2026-08-11). Bu yüzden burada, Client Component'in kendi dosyasında.
const initialContactFormState: ContactFormState = {
  status: "idle",
  errors: {},
  values: {},
};

// Alan id'leri hata özetindeki linklerin hedefi olsun diye sabit — her
// alana açıkça id={fieldId("x")} veriliyor (TextField vb. kendi useId()
// üretebilir ama o zaman özetten atlanamaz).
function fieldId(name: string) {
  return `iletisim-${name}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} disabled={pending} className="w-full sm:w-auto">
      {pending ? "Gönderiliyor…" : "Gönder"}
    </Button>
  );
}

// KISITLAR: gönderiliyor/başarılı/başarısız durumları, hata özeti + alan
// bazlı hata (aria-describedby, aria-invalid — TextField/TextareaField/
// SelectField'te zaten var), renk tek başına yeterli değil (her hatada
// metin de var). Native tarayıcı doğrulaması yerine kendi Türkçe/
// erişilebilir hata metinlerimiz kullanılsın diye `noValidate`.
export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialContactFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorEntries = Object.entries(state.errors) as [
    keyof typeof CONTACT_FIELD_LABELS,
    string,
  ][];

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    } else if (state.status === "error") {
      summaryRef.current?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="rounded-md border border-success bg-surface-raised px-4 py-4 text-base text-text"
      >
        <span className="font-semibold text-success">Mesajınız için teşekkürler!</span>{" "}
        En kısa sürede size dönüş yapacağız.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-4">
      {errorEntries.length > 0 && (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-error bg-surface-raised px-4 py-3 focus:outline-none"
        >
          <p className="font-semibold text-error">
            Formda düzeltilmesi gereken {errorEntries.length} hata var:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-error">
            {errorEntries.map(([field, message]) => (
              <li key={field}>
                <a href={`#${fieldId(field)}`} className="underline hover:no-underline">
                  {CONTACT_FIELD_LABELS[field]}: {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TextField
        id={fieldId("fullName")}
        label="Ad Soyad"
        name="fullName"
        autoComplete="name"
        required
        defaultValue={state.values.fullName}
        error={state.errors.fullName}
      />
      <TextField
        id={fieldId("email")}
        label="E-posta"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values.email}
        error={state.errors.email}
      />
      <TextField
        id={fieldId("phone")}
        label="Telefon (opsiyonel)"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={state.values.phone}
        error={state.errors.phone}
      />
      <SelectField
        id={fieldId("subject")}
        label="Konu"
        name="subject"
        required
        defaultValue={state.values.subject ?? ""}
        error={state.errors.subject}
      >
        <option value="" disabled>
          Seçiniz
        </option>
        {CONTACT_SUBJECTS.map((key) => (
          <option key={key} value={key}>
            {CONTACT_SUBJECT_LABELS[key]}
          </option>
        ))}
      </SelectField>
      <TextareaField
        id={fieldId("message")}
        label="Mesaj"
        name="message"
        rows={5}
        required
        helpText="En az 20 karakter."
        defaultValue={state.values.message}
        error={state.errors.message}
      />

      <SubmitButton />
    </form>
  );
}
