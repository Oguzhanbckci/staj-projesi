"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { resolveThemeTokens, THEME_STORAGE_KEY, type SiteThemeSettings } from "@/lib/theme/resolve";

// Aynı sekme içindeki bir localStorage yazması tarayıcının "storage"
// olayını TETİKLEMEZ (o sadece BAŞKA sekme/pencerelerde ateşlenir) — bu
// yüzden toggle() kendi özel olayını da dispatch ediyor, subscribe() onu
// da dinliyor.
const THEME_CHANGE_EVENT = "site-theme-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): "light" | "dark" | null {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

function getServerSnapshot(): "light" | "dark" | null {
  return null;
}

export interface ThemeToggleProps {
  /** Çağıran taraftan (site Navbar, panel PanelShell, giriş sayfası) —
   *  app/layout.tsx'teki engelleyici script'in AYNI resolveThemeTokens()
   *  girdisi, iki mod arası geçişte kullanılır. */
  settings: SiteThemeSettings;
  /** Verilirse localStorage'daki saklı tercihi YOK SAYAR, ilk render'ı hep
   *  bu modla başlatır — sadece giriş sayfası kullanır (bkz. o dosyadaki
   *  yorum: her ziyarette sabit açık temayla açılmalı). Switch yine de
   *  normal çalışır, tıklanınca bu oturum için geçerli olacak şekilde
   *  değişir (manualOverride) — bir SONRAKİ tam sayfa yüklemesinde bu
   *  bileşen yeniden mount olur, manualOverride sıfırlanır, tekrar
   *  forceInitialMode'a döner. */
  forceInitialMode?: "light" | "dark";
}

// Ziyaretçinin/panel kullanıcısının gördüğü açık/koyu tema switch'i —
// `components/ui/` altında çünkü hem site (Navbar) hem panel (PanelShell,
// giriş sayfası) tarafından kullanılıyor. Panelden seçilen
// tenants.theme_mode'u (varsayılan) EZMEZ, sadece bu kullanıcının
// tarayıcısında localStorage'a yazılan bir tercih katmanı ekler.
//
// `useSyncExternalStore` — React'in DIŞARIDAKİ (React state'i olmayan,
// burada localStorage) bir kaynakla senkron kalmak için resmi API'si.
// İKİ gerçek soruna aynı anda çözüm: (1) HYDRATION UYUMU — sunucuda
// `getServerSnapshot()` (her zaman `null`) kullanılır, React ilk
// istemci render'ını da BUNUNLA eşleştirir, ardından `getSnapshot()`'ın
// gerçek (localStorage'dan okunan) değerine boyama ÖNCESİ senkron
// geçer — hydration uyuşmazlığı da görünür bir "yanlış temayla an"
// (flash) da oluşmaz. (2) Önceki elle-`useEffect`-içinde-`setState`
// deseni `react-hooks/set-state-in-effect` lint kuralını tetikliyordu —
// bu artık hiç setState/effect gerektirmiyor, React'in kendi iç
// mekanizması senkronizasyonu yönetiyor.
export function ThemeToggle({ settings, forceInitialMode }: ThemeToggleProps) {
  const storedMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Bu OTURUMDA (bu bileşen mount olduğundan beri) kullanıcı tıkladıysa
  // — forceInitialMode'u bile ezer, switch'in "kalsın, çalışsın" isteği
  // budur (bkz. yukarıdaki prop yorumu).
  const [manualOverride, setManualOverride] = useState<"light" | "dark" | null>(null);
  const mode = manualOverride ?? forceInitialMode ?? storedMode ?? settings.themeMode;

  useLayoutEffect(() => {
    const resolved = resolveThemeTokens({ ...settings, themeMode: mode });
    const html = document.documentElement;
    html.setAttribute("data-theme", resolved.dataTheme);
    for (const [key, value] of Object.entries(resolved.styleVars)) {
      html.style.setProperty(key, value);
    }
  }, [mode, settings]);

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    setManualOverride(next);
  }

  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-neutral-300 bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <Sun aria-hidden="true" className="pointer-events-none absolute left-1.5 h-4 w-4 text-warning" />
      <Moon aria-hidden="true" className="pointer-events-none absolute right-1.5 h-4 w-4 text-text-muted" />
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-brand shadow-sm transition-transform motion-reduce:transition-none ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}
