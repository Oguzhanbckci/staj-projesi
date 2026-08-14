"use client";

import { useEffect, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export interface TextScrambleProps {
  text: string;
  className?: string;
}

// Giriş sayfası başlığı için "çözülme" efekti. Ekran okuyucu animasyonu
// HİÇ görmez: gerçek metin ayrı, gizli bir <span>'de anında mevcut (bkz.
// sr-only deseni, Button.tsx isLoading ile aynı ilke); görünen/animasyonlu
// span aria-hidden. `prefers-reduced-motion` true ise hiç karıştırma
// yapılmaz, metin doğrudan görünür durur (bkz. ThemeToggle.tsx'teki aynı
// ilke).
export function TextScramble({ text, className = "" }: TextScrambleProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplay(text);
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
  }, [text]);

  return (
    <span className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
