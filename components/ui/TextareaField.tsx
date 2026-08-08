import { useId, type TextareaHTMLAttributes } from "react";

export interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function TextareaField({
  label,
  error,
  helpText,
  id,
  rows = 4,
  className = "",
  ...rest
}: TextareaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-caption font-semibold text-text">
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
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
