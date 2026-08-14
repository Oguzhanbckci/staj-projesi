"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

// TextField'ın aynı a11y desenini (htmlFor/aria-describedby/role=alert)
// izleyen, göster/gizle butonlu AYRI bir bileşen — TextField'ın kendisini
// "use client" yapmıyoruz (o hâlâ ~15 yerde Server Component olarak
// kullanılıyor). Aynı gerekçe ColorPickerField'da da var: canlı
// istemci-tarafı davranış gerektiren tek bir alan için özel, hedefli bir
// bileşen — TASARIM-SISTEMI.md madde 9.9.
export function PasswordField({ label, error, id, className = "", ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-caption font-semibold text-text">
        {label}
      </label>
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-muted">
          <Lock size={16} />
        </span>
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`w-full rounded-md border bg-surface-raised py-2 pl-10 pr-11 text-base text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${error ? "border-error" : "border-neutral-300"} ${className}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-2 flex items-center rounded-sm px-1.5 text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}
