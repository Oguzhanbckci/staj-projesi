"use client";

import { useId } from "react";

export interface ColorPickerFieldProps {
  label: string;
  name: string;
  /** Boş string = "override yok, preset/varsayılan geçerli" (KISITLAR: sadece metin kutusu bırakılmadı, native renk seçici + hex birlikte). */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helpText?: string;
}

// Canlı önizleme her tuş vuruşunda/renk seçiminde güncellenmesi gerektiği
// için CONTROLLED (bkz. ThemeEditor.tsx) — bu yüzden components/ui/'daki
// ilk client bileşen (madde 9.9'un "gerçek state senkronizasyonu"
// istisnası). Native <input type="color"> HER ZAMAN geçerli bir hex değeri
// taşır (boş olamaz) — bu yüzden form'a giden gerçek değer (name attribute)
// yanındaki metin kutusunda tutuluyor, ikisi aynı state'i paylaşıyor;
// "Sıfırla" boş stringe (= preset varsayılanına dönüş) döndürür.
export function ColorPickerField({
  label,
  name,
  value,
  onChange,
  error,
  helpText,
}: ColorPickerFieldProps) {
  const fieldId = useId();
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const swatchValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#2561c1";

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-caption font-semibold text-text">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} — renk seçici`}
          value={swatchValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-neutral-300 bg-surface-raised p-0.5"
        />
        <input
          id={fieldId}
          type="text"
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#2561c1"
          aria-invalid={!!error}
          aria-describedby={[helpId, errorId].filter(Boolean).join(" ") || undefined}
          className={`w-full rounded-md border bg-surface-raised px-3 py-2 text-base text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${error ? "border-error" : "border-neutral-300"}`}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 text-caption text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Sıfırla
          </button>
        )}
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
