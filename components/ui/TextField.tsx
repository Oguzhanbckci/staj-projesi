import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  /** Opsiyonel — verilmezse alan öncekiyle birebir aynı render olur (bkz.
   *  giriş sayfasındaki e-posta alanı, lucide-react ikonuyla). */
  leadingIcon?: ReactNode;
}

// Etiket <label htmlFor> ile alana bağlı; hata/yardım metni aria-describedby
// üzerinden okunur duruma bağlanıyor (bkz. TASARIM-SISTEMI.md "Bileşen API
// Kuralları"). useId Server Component'te de güvenle çalışır, "use client"
// gerekmez.
export function TextField({
  label,
  error,
  helpText,
  leadingIcon,
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
      <div className="relative">
        {leadingIcon && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-muted">
            {leadingIcon}
          </span>
        )}
        <input
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
          className={`w-full rounded-md border bg-surface-raised py-2 text-base text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${leadingIcon ? "pl-10 pr-3" : "px-3"} ${error ? "border-error" : "border-control"} ${className}`}
          {...rest}
        />
      </div>
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
