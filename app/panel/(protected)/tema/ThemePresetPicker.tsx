"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmActionDialog } from "@/components/panel/ConfirmActionDialog";
import { THEME_PRESETS, DEFAULT_THEME_PRESET, type ThemePresetKey } from "@/lib/theme/presets";
import { applyThemePresetAction, type PresetActionState } from "./actions";

const initialState: PresetActionState = { success: true };

type DialogTarget = ThemePresetKey | "reset" | null;

// "Kurumsal Mavi"/"Modern Koyu" önayarları + "Varsayılana Dön" — üçü de
// AYNI applyThemePresetAction'ı çağırıyor (bkz. actions.ts), sadece hedef
// preset anahtarı ve onay dialog'unun metni/rengi farklı (bkz.
// docs/KARAR-GUNLUGU.md, 2026-08-16).
export function ThemePresetPicker({ currentPreset }: { currentPreset: ThemePresetKey }) {
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);

  return (
    <fieldset className="space-y-4">
      <legend className="text-h6 font-semibold text-text">Tema Önayarları</legend>
      <p className="text-caption text-text-muted">
        Bir önayar uygulamak, mevcut marka rengi, ikincil renk, köşe yarıçapı ve font
        seçimlerinizi siler ve seçilen önayarın varsayılan görünümüne döner.
      </p>

      <div className="flex flex-wrap gap-3">
        {Object.entries(THEME_PRESETS).map(([key, preset]) => {
          const presetKey = key as ThemePresetKey;
          return (
            <div
              key={key}
              className={`flex w-40 flex-col gap-2 rounded-md border p-3 ${
                currentPreset === presetKey
                  ? "border-brand ring-2 ring-brand"
                  : "border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span
                  className="h-4 w-4 rounded-full border border-neutral-300"
                  style={{ backgroundColor: preset.brand.light }}
                />
                <span
                  className="h-4 w-4 rounded-full border border-neutral-300"
                  style={{ backgroundColor: preset.brand.dark }}
                />
              </div>
              <span className="text-caption font-semibold text-text">
                {preset.label}
                {currentPreset === presetKey && " (aktif)"}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDialogTarget(presetKey)}
              >
                Uygula
              </Button>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="danger" size="sm" onClick={() => setDialogTarget("reset")}>
        Varsayılana Dön
      </Button>

      {dialogTarget && (
        <PresetConfirmDialog target={dialogTarget} onClose={() => setDialogTarget(null)} />
      )}
    </fieldset>
  );
}

function PresetConfirmDialog({
  target,
  onClose,
}: {
  target: ThemePresetKey | "reset";
  onClose: () => void;
}) {
  const presetKey = target === "reset" ? DEFAULT_THEME_PRESET : target;
  const preset = THEME_PRESETS[presetKey];
  const boundAction = applyThemePresetAction.bind(null, presetKey);
  const [state, formAction] = useActionState(boundAction, initialState);

  // Server Action, useActionState'in KENDİ dispatch'i (formAction)
  // üzerinden çağrılıyor — react-hooks/set-state-in-effect kuralını
  // TETİKLEMİYOR (bu proje bunu 2026-08-14/15'te iki kez ampirik
  // doğruladı). Tam sayfa yenileme: ThemeEditor.tsx'teki renk/radius/font
  // useState'leri sadece ilk mount'ta initialData'dan okunuyor — bir
  // Server Action + revalidatePath sonrası React yeni prop'u geçse bile
  // bu state'ler KENDİLİĞİNDEN güncellenmez (klasik bir React tuzağı).
  // window.location.reload() bir React state setter DEĞİL, aynı istisna
  // geçerli. Nadir/kasıtlı bir eylem için state-senkronizasyon
  // karmaşıklığından daha ucuz bir çözüm (TASARIM-SISTEMI.md madde 9.8).
  useEffect(() => {
    if (state.success && state !== initialState) {
      window.location.reload();
    }
  }, [state]);

  const title =
    target === "reset" ? "Varsayılana dönülsün mü?" : `"${preset.label}" uygulansın mı?`;
  const description =
    target === "reset"
      ? `Marka rengi, ikincil renk, köşe yarıçapı ve font ailesi için yaptığınız TÜM özelleştirmeler silinip "${preset.label}" (fabrika ayarı) görünümüne dönülecek. Bu işlem geri alınamaz.`
      : `Mevcut marka rengi, ikincil renk, köşe yarıçapı ve font seçimleriniz silinip "${preset.label}" önayarının varsayılan görünümü uygulanacak. Bu işlem geri alınamaz.`;

  return (
    <ConfirmActionDialog
      title={title}
      description={description}
      confirmLabel={target === "reset" ? "Evet, Varsayılana Dön" : "Evet, Uygula"}
      pendingLabel="Uygulanıyor…"
      confirmVariant={target === "reset" ? "danger" : "primary"}
      action={formAction}
      error={!state.success ? state.formError : undefined}
      onClose={onClose}
    />
  );
}
