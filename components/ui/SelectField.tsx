import { useId, type SelectHTMLAttributes } from "react";

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helpText?: string;
}

// Seçenekler <option> children olarak dışarıdan verilir — kendi "options
// dizisi" API'sini icat etmiyoruz, native <select> davranışı korunuyor.
export function SelectField({
  label,
  error,
  helpText,
  id,
  className = "",
  children,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-caption font-semibold text-text">
        {label}
      </label>
      <select
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
        className={`w-full rounded-md border bg-surface-raised px-3 py-2 text-base text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${error ? "border-error" : "border-control"} ${className}`}
        {...rest}
      >
        {children}
      </select>
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
