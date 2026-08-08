import { useId, type InputHTMLAttributes } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

// Etiket <label htmlFor> ile alana bağlı; hata/yardım metni aria-describedby
// üzerinden okunur duruma bağlanıyor (bkz. TASARIM-SISTEMI.md "Bileşen API
// Kuralları"). useId Server Component'te de güvenle çalışır, "use client"
// gerekmez.
export function TextField({
  label,
  error,
  helpText,
  id,
  className = "",
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-caption font-semibold text-text">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
        className={`w-full rounded-md border bg-surface-raised px-3 py-2 text-base text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${error ? "border-error" : "border-neutral-300"} ${className}`}
        {...rest}
      />
      {helpText && !error && (
        <p id={helpId} className="text-caption text-text-muted">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}
