"use client";

import { useActionState, useMemo, useState } from "react";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { ColorPickerField } from "@/components/ui/ColorPickerField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormErrorSummary } from "@/components/ui/FormErrorSummary";
import { THEME_FIELD_LABELS, type ThemeSettingsFormValues } from "@/lib/validation/theme";
import type { ActionResult } from "@/lib/panel/actionResult";
import type { ThemeSettingsData } from "@/lib/supabase/panelQueries";
import { resolveThemeTokens } from "@/lib/theme/resolve";
import { DEFAULT_THEME_PRESET } from "@/lib/theme/presets";
import { BORDER_RADIUS_SCALES, isBorderRadiusScaleKey } from "@/lib/theme/radiusScales";
import { FONT_FAMILY_OPTIONS, isFontFamilyKey } from "@/lib/theme/fonts";
import { checkContrastWarning } from "@/lib/theme/contrast";
import { updateThemeSettingsAction } from "./actions";
import { ThemePreview } from "./ThemePreview";

const FIELD_ID_PREFIX = "tema";
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const initialState: ActionResult<keyof ThemeSettingsFormValues> = {
  success: false,
  fieldErrors: {},
};

// Renk/köşe yarıçapı/font — CONTROLLED (canlı önizleme her değişiklikte
// güncellenmeli, bkz. ThemePreview.tsx). Diğer alanlar (firma adı, slogan,
// iletişim, sosyal medya) — UNCONTROLLED (`defaultValue`, ProjectForm.tsx
// deseniyle aynı — önizlemeyi beslemedikleri için re-render gerekmiyor).
export function ThemeEditor({ initialData }: { initialData: ThemeSettingsData }) {
  const [state, formAction] = useActionState(updateThemeSettingsAction, initialState);

  const [primaryColor, setPrimaryColor] = useState(initialData.primaryColor ?? "");
  const [secondaryColor, setSecondaryColor] = useState(initialData.secondaryColor ?? "");
  const [borderRadiusScale, setBorderRadiusScale] = useState(initialData.borderRadiusScale ?? "");
  const [fontFamilyKey, setFontFamilyKey] = useState(initialData.fontFamilyKey ?? "");

  const fieldErrors = state.success ? {} : state.fieldErrors;
  const formError = state.success ? undefined : state.formError;

  // Gerçek app/layout.tsx'in kullandığı AYNI fonksiyon — preset seçimi
  // arayüzü henüz yok (bkz. docs/DURUM.md açık madde), bu yüzden önizleme
  // varsayılan preset'i temel alıyor; bu, şu an HER tenant için doğru
  // (hiçbiri henüz farklı bir preset seçemiyor).
  const styleVars = useMemo(() => {
    return resolveThemeTokens({
      themeMode: "light",
      themePreset: DEFAULT_THEME_PRESET,
      primaryColor: primaryColor || null,
      secondaryColor: secondaryColor || null,
      borderRadiusScale: isBorderRadiusScaleKey(borderRadiusScale) ? borderRadiusScale : null,
      fontFamilyKey: isFontFamilyKey(fontFamilyKey) ? fontFamilyKey : null,
    }).styleVars;
  }, [primaryColor, secondaryColor, borderRadiusScale, fontFamilyKey]);

  const primaryContrast =
    primaryColor && HEX_COLOR_RE.test(primaryColor) ? checkContrastWarning(primaryColor) : null;
  const secondaryContrast =
    secondaryColor && HEX_COLOR_RE.test(secondaryColor)
      ? checkContrastWarning(secondaryColor)
      : null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={formAction} noValidate className="space-y-6">
        {state.success && (
          <p
            role="status"
            className="rounded-md border border-success bg-surface-raised px-4 py-3 text-base text-success"
          >
            Değişiklikler kaydedildi.
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
          errors={fieldErrors}
          fieldLabels={THEME_FIELD_LABELS}
          fieldIdPrefix={FIELD_ID_PREFIX}
        />

        <fieldset className="space-y-4">
          <legend className="text-h6 font-semibold text-text">Marka</legend>

          <div>
            <ColorPickerField
              label="Marka Rengi (opsiyonel)"
              name="primaryColor"
              value={primaryColor}
              onChange={setPrimaryColor}
              error={fieldErrors.primaryColor}
              helpText="Boş bırakırsanız varsayılan tema rengi kullanılır."
            />
            {primaryContrast && (
              <p
                role="status"
                className={`mt-1 text-caption ${primaryContrast.passes ? "text-text-muted" : "text-warning"}`}
              >
                Kontrast oranı: {primaryContrast.ratio.toFixed(2)}:1 (
                {primaryContrast.recommendedTextColor === "#000000" ? "koyu" : "açık"} metin
                önerilir){" "}
                {!primaryContrast.passes &&
                  "— bu renk düşük kontrastlı, üzerindeki metin okunması zor olabilir."}
              </p>
            )}
          </div>

          <div>
            <ColorPickerField
              label="İkincil Renk (opsiyonel)"
              name="secondaryColor"
              value={secondaryColor}
              onChange={setSecondaryColor}
              error={fieldErrors.secondaryColor}
              helpText="Eylem Çağrısı butonunda kullanılır. Boş bırakırsanız nötr bir görünüm kullanılır."
            />
            {secondaryContrast && (
              <p
                role="status"
                className={`mt-1 text-caption ${secondaryContrast.passes ? "text-text-muted" : "text-warning"}`}
              >
                Kontrast oranı: {secondaryContrast.ratio.toFixed(2)}:1 (
                {secondaryContrast.recommendedTextColor === "#000000" ? "koyu" : "açık"} metin
                önerilir){" "}
                {!secondaryContrast.passes &&
                  "— bu renk düşük kontrastlı, üzerindeki metin okunması zor olabilir."}
              </p>
            )}
          </div>

          <SelectField
            label="Köşe Yarıçapı"
            name="borderRadiusScale"
            value={borderRadiusScale}
            onChange={(event) => setBorderRadiusScale(event.target.value)}
            error={fieldErrors.borderRadiusScale}
          >
            <option value="">Varsayılan</option>
            {Object.entries(BORDER_RADIUS_SCALES).map(([key, scale]) => (
              <option key={key} value={key}>
                {scale.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Font Ailesi"
            name="fontFamilyKey"
            value={fontFamilyKey}
            onChange={(event) => setFontFamilyKey(event.target.value)}
            error={fieldErrors.fontFamilyKey}
          >
            <option value="">Varsayılan</option>
            {Object.entries(FONT_FAMILY_OPTIONS).map(([key, option]) => (
              <option key={key} value={key}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-h6 font-semibold text-text">Site Kimliği</legend>

          <TextField
            id={`${FIELD_ID_PREFIX}-companyName`}
            label="Firma Adı"
            name="companyName"
            required
            defaultValue={initialData.companyName}
            error={fieldErrors.companyName}
          />
          <TextField
            id={`${FIELD_ID_PREFIX}-slogan`}
            label="Slogan (opsiyonel)"
            name="slogan"
            defaultValue={initialData.slogan ?? undefined}
            error={fieldErrors.slogan}
            helpText="Footer'da firma adının altında gösterilir."
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-h6 font-semibold text-text">İletişim Bilgileri</legend>

          <TextField
            id={`${FIELD_ID_PREFIX}-address`}
            label="Adres (opsiyonel)"
            name="address"
            defaultValue={initialData.address ?? undefined}
            error={fieldErrors.address}
          />
          <TextField
            id={`${FIELD_ID_PREFIX}-phone`}
            label="Telefon (opsiyonel)"
            name="phone"
            defaultValue={initialData.phone ?? undefined}
            error={fieldErrors.phone}
          />
          <TextField
            id={`${FIELD_ID_PREFIX}-email`}
            label="E-posta (opsiyonel)"
            name="email"
            type="email"
            defaultValue={initialData.email ?? undefined}
            error={fieldErrors.email}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-h6 font-semibold text-text">Sosyal Medya</legend>

          <TextField
            id={`${FIELD_ID_PREFIX}-facebookUrl`}
            label="Facebook (opsiyonel)"
            name="facebookUrl"
            type="url"
            defaultValue={initialData.facebookUrl ?? undefined}
            error={fieldErrors.facebookUrl}
          />
          <TextField
            id={`${FIELD_ID_PREFIX}-instagramUrl`}
            label="Instagram (opsiyonel)"
            name="instagramUrl"
            type="url"
            defaultValue={initialData.instagramUrl ?? undefined}
            error={fieldErrors.instagramUrl}
          />
          <TextField
            id={`${FIELD_ID_PREFIX}-linkedinUrl`}
            label="LinkedIn (opsiyonel)"
            name="linkedinUrl"
            type="url"
            defaultValue={initialData.linkedinUrl ?? undefined}
            error={fieldErrors.linkedinUrl}
          />
        </fieldset>

        <SubmitButton pendingLabel="Kaydediliyor…">Değişiklikleri Kaydet</SubmitButton>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <ThemePreview styleVars={styleVars} />
      </div>
    </div>
  );
}
