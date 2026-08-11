"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { VariantDiagram } from "./VariantDiagram";
import { updateSectionVariantAction, type VariantState } from "./actions";
import type { SectionKey } from "@/lib/sections/config";
import type { SectionVariantOption } from "@/lib/sections/variantOptions";

const initialState: VariantState = { success: true };

// Diyagram+etiket+açıklama üç satırlı bir kart — Button/SubmitButton'ın
// sabit yükseklik sınıflarıyla (SIZE_CLASSES) uyuşmuyor, bu yüzden BİLEREK
// paylaşılan bileşen kullanılmıyor (TASARIM-SISTEMI.md madde 9.8). Yine de
// SubmitButton.tsx'teki AYNI erişilebilirlik ilkesi burada da uygulanıyor:
// pending iken aria-label bastırılıp sr-only bir "Kaydediliyor" metniyle
// değiştiriliyor.
function VariantButton({
  option,
  isSelected,
  sectionKey,
  sectionLabel,
}: {
  option: SectionVariantOption;
  isSelected: boolean;
  sectionKey: SectionKey;
  sectionLabel: string;
}) {
  const { pending } = useFormStatus();
  const disabled = isSelected || pending;

  return (
    <button
      type="submit"
      name="variant"
      value={option.key}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={
        pending
          ? undefined
          : `${sectionLabel} için "${option.label}" görünümünü seç${isSelected ? " (şu an seçili)" : ""}`
      }
      className={`flex w-28 flex-col items-center gap-1.5 rounded-md border p-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60 ${
        isSelected
          ? "border-brand bg-surface-raised ring-2 ring-brand"
          : "border-neutral-300 bg-surface-raised hover:bg-neutral-100"
      }`}
    >
      <VariantDiagram sectionKey={sectionKey} variantKey={option.key} />
      <span className="text-caption font-semibold text-text">
        {option.label}
        {isSelected && " ✓"}
      </span>
      <span className="text-caption text-text-muted">{option.description}</span>
      {pending && <span className="sr-only"> — Kaydediliyor</span>}
    </button>
  );
}

// TEK form, İÇİNDE birden fazla submit butonu (name="variant" value="...")
// — native HTML'in "hangi butona tıklanırsa o değer gönderilir" davranışı.
// Bu, N ayrı form/action yerine TEK useActionState/useFormStatus demek:
// `pending` TÜM seçeneklere birden yayılıyor, bu yüzden bir seçime
// tıklandığında başka bir seçenek de ikinci bir isteği BAŞLATAMIYOR
// (hepsi disabled) — KABUL KRİTERİ: "kaydetme sırasında çift tıklama
// sorun çıkarmasın" tam bunun için.
export function VariantPicker({
  sectionId,
  sectionKey,
  sectionLabel,
  currentVariant,
  options,
}: {
  sectionId: string;
  sectionKey: SectionKey;
  sectionLabel: string;
  currentVariant: string | null;
  options: SectionVariantOption[];
}) {
  const boundAction = updateSectionVariantAction.bind(null, sectionId);
  const [state, formAction] = useActionState(boundAction, initialState);

  // variant henüz hiç seçilmemişse (null) ilgili bölümün KENDİ dahili
  // varsayılanı (dizinin ilk elemanı, bkz. lib/sections/variantOptions.ts
  // yorumu) fiilen ne render edildiğini doğru yansıtır.
  const effectiveCurrent = currentVariant ?? options[0]?.key;

  return (
    <form action={formAction}>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <VariantButton
            key={option.key}
            option={option}
            isSelected={option.key === effectiveCurrent}
            sectionKey={sectionKey}
            sectionLabel={sectionLabel}
          />
        ))}
      </div>
      {!state.success && state.formError && (
        <p role="alert" className="mt-2 text-caption text-error">
          {state.formError}
        </p>
      )}
    </form>
  );
}
