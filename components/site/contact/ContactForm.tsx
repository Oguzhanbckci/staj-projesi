"use client";

import { useActionState, useEffect, useRef } from "react";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SelectField } from "@/components/ui/SelectField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import {
  CONTACT_FIELD_LABELS,
  CONTACT_SUBJECTS,
  CONTACT_SUBJECT_LABELS,
  PHONE_MAX_DIGITS,
} from "@/lib/validation/contact";
import { submitContactForm, type ContactFormState } from "./actions";
import { HONEYPOT_FIELD_NAME } from "@/lib/security/contactHoneypot";

// FormData/uncontrolled input'la (defaultValue) uyumlu, hafif bir "yazarken
// filtrele" deseni — React state gerektirmez, doğrudan DOM değerini
// düzeltir. Rakam olmayan her karakteri siler VE uzunluğu sunucudaki AYNI
// üst sınırla (PHONE_MAX_DIGITS) keser — kullanıcı artık harf ya da
// 50-60 haneli anlamsız bir dizi YAZAMAZ, sunucu doğrulaması bunun
// arkasındaki gerçek/yetkili katman (bkz. lib/validation/contact.ts).
function handlePhoneNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, PHONE_MAX_DIGITS);
}

// "use server" dosyasından (actions.ts) sadece fonksiyon export
// edilebilir — düz bir sabit nesne (initial state) oradan import edilirse
// istemci tarafında undefined'a düşer (bkz. docs/KARAR-GUNLUGU.md,
// 2026-08-11). Bu yüzden burada, Client Component'in kendi dosyasında.
const initialContactFormState: ContactFormState = {
  status: "idle",
  errors: {},
  values: {},
};

const FIELD_ID_PREFIX = "iletisim";

// KISITLAR: gönderiliyor/başarılı/başarısız durumları, hata özeti + alan
// bazlı hata (aria-describedby, aria-invalid — TextField/TextareaField/
// SelectField'te zaten var), renk tek başına yeterli değil (her hatada
// metin de var). Native tarayıcı doğrulaması yerine kendi Türkçe/
// erişilebilir hata metinlerimiz kullanılsın diye `noValidate`.
export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialContactFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

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
      {/* Gizli tuzak alanı (honeypot) — spam koruması katman 1, bkz.
          lib/security/contactHoneypot.ts. Gerçek ziyaretçi bunu ASLA
          görmemeli/odaklanmamalı: `aria-hidden` ekran okuyucudan,
          `tabIndex={-1}` klavye Tab sırasından, ekran-dışı konumlandırma
          (display:none/visibility:hidden DEĞİL — bazı botlar özellikle
          bunları tarayıp atlıyor) görsel olarak gizler.
          `autoComplete="off"` + `data-lpignore`/`data-1p-ignore` +
          nötr isim/etiket (2026-08-18'de "website"den değiştirildi —
          bkz. contactHoneypot.ts'teki yorum, gerçek müşteri mesajları
          tarayıcı otomatik doldurmasıyla sessizce kayboluyordu) —
          Chrome'un/parola yöneticilerinin bunu gerçek bir alan sanıp
          doldurma riskini azaltır. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
        <label htmlFor={`${FIELD_ID_PREFIX}-hp`}>Referans</label>
        <input
          type="text"
          id={`${FIELD_ID_PREFIX}-hp`}
          name={HONEYPOT_FIELD_NAME}
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
        />
      </div>

      {state.formError && (
        <p
          role="alert"
          className="rounded-md border border-error bg-surface-raised px-4 py-3 text-base text-error"
        >
          {state.formError}
        </p>
      )}

      <FormErrorSummary
        ref={summaryRef}
        errors={state.errors}
        fieldLabels={CONTACT_FIELD_LABELS}
        fieldIdPrefix={FIELD_ID_PREFIX}
      />

      <TextField
        id={`${FIELD_ID_PREFIX}-fullName`}
        label="Ad Soyad"
        name="fullName"
        autoComplete="name"
        required
        defaultValue={state.values.fullName}
        error={state.errors.fullName}
      />
      <TextField
        id={`${FIELD_ID_PREFIX}-email`}
        label="E-posta"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values.email}
        error={state.errors.email}
      />
      {/* 2026-08-18: ülke kodu <select>'i kaldırıldı — native <select>
          kapalıyken her zaman seçili seçeneğin TAM metnini gösteriyor,
          sadece bayrağı göstermek özel bir açılır menü bileşeni
          gerektirirdi (kullanıcı geri bildirimiyle bilinçli olarak
          orantısız bulundu, bkz. KARAR-GUNLUGU.md). Sadece rakam/uzunluk
          doğrulaması (asıl istenen düzeltme) korundu. */}
      <TextField
        id={`${FIELD_ID_PREFIX}-phoneNumber`}
        label="Telefon (opsiyonel)"
        name="phoneNumber"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={PHONE_MAX_DIGITS}
        defaultValue={state.values.phoneNumber}
        error={state.errors.phoneNumber}
        onChange={handlePhoneNumberChange}
      />
      <SelectField
        id={`${FIELD_ID_PREFIX}-subject`}
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
        id={`${FIELD_ID_PREFIX}-message`}
        label="Mesaj"
        name="message"
        rows={5}
        required
        helpText="En az 20 karakter."
        defaultValue={state.values.message}
        error={state.errors.message}
      />

      <SubmitButton pendingLabel="Gönderiliyor…" className="w-full sm:w-auto">
        Gönder
      </SubmitButton>
    </form>
  );
}
