"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export interface TextScrambleProps {
  text: string;
  className?: string;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// ThemeToggle.tsx'teki AYNI desen (useSyncExternalStore) — matchMedia
// bir DIŞ (React state'i olmayan) kaynak, `useEffect` içinde `setState`
// ile "senkronlamak" `react-hooks/set-state-in-effect` lint kuralını
// tetikliyordu (bkz. docs/KARAR-GUNLUGU.md, ThemeToggle'da yaşanan aynı
// sorun). Sunucuda `getServerSnapshot()` her zaman `false` — reduced
// motion tercihini sunucu bilemez, animasyon istemci tarafında (ilk
// boyamadan ÖNCE, senkron) doğru değere geçer, hydration uyuşmazlığı
// oluşmaz.
function subscribeReducedMotion(callback: () => void): () => void {
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

// Giriş sayfası başlığı için "çözülme" efekti. Ekran okuyucu animasyonu
// HİÇ görmez: gerçek metin ayrı, gizli bir <span>'de anında mevcut (bkz.
// sr-only deseni, Button.tsx isLoading ile aynı ilke); görünen/animasyonlu
// span aria-hidden. `prefersReducedMotion` true ise `display` state'i hiç
// devreye girmez, `text` doğrudan render edilir — karıştırma efekti
// başlamaz.
export function TextScramble({ text, className = "" }: TextScrambleProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let frame = 0;
    const totalFrames = text.length * 3;
    const intervalId = window.setInterval(() => {
      frame += 1;
      const revealCount = Math.floor((frame / totalFrames) * text.length);
      const next = text
        .split("")
        .map((char, index) => {
          if (char === " " || index < revealCount) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");
      setDisplay(next);

      if (frame >= totalFrames) {
        window.clearInterval(intervalId);
        setDisplay(text);
      }
    }, 30);

    return () => window.clearInterval(intervalId);
  }, [text, prefersReducedMotion]);

  return (
    <span className={className}>
      <span aria-hidden="true">{prefersReducedMotion ? text : display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
