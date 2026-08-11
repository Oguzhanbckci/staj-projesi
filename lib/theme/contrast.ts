// Saf modül — React'e/Next.js'e bağımlı değil, hem sunucuda
// (lib/theme/resolve.ts, tema kayıt sırasında) hem panelde (ThemeEditor'ün
// canlı kontrast uyarısı) aynı fonksiyonlar kullanılır. WCAG 2.1
// relative-luminance formülü (sRGB → linear → luminance → kontrast oranı) —
// göz kararı/kaba bir sezgi DEĞİL, gerçek iki kontrast oranını hesaplayıp
// karşılaştırma (bkz. docs/TEMA-MIMARISI.md "Kontrast Güvenliği").

function toLinearChannel(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Geçersiz hex renk: "${hex}" — #rrggbb biçiminde olmalı.`);
  }

  const [r, g, b] = [0, 2, 4].map((i) =>
    toLinearChannel(parseInt(clean.slice(i, i + 2), 16) / 255)
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG kontrast oranı formülü: (açık olanın luminance'ı + 0.05) / (koyu
// olanın luminance'ı + 0.05) — sıra önemli değil, fonksiyon kendi sıralar.
export function getContrastRatio(hexA: string, hexB: string): number {
  const [lighter, darker] = [getRelativeLuminance(hexA), getRelativeLuminance(hexB)].sort(
    (a, b) => b - a
  );
  return (lighter + 0.05) / (darker + 0.05);
}

// Siyah/beyazdan HANGİSİ bu arka plan üzerinde gerçekten daha yüksek
// kontrast oranı veriyorsa onu döner — sabit bir luminance eşiği
// (ör. ">0.5 ise siyah") kullanmaz, iki gerçek oranı hesaplayıp karşılaştırır.
export function pickReadableTextColor(backgroundHex: string): "#000000" | "#ffffff" {
  const withBlack = getContrastRatio(backgroundHex, "#000000");
  const withWhite = getContrastRatio(backgroundHex, "#ffffff");
  return withBlack >= withWhite ? "#000000" : "#ffffff";
}

export interface ContrastCheckResult {
  /** WCAG kontrast oranı, ör. 4.52 — arayüzde doğrudan gösterilebilir. */
  ratio: number;
  /** ratio, verilen eşiği (varsayılan 4.5, WCAG AA gövde metni) geçiyor mu. */
  passes: boolean;
  /** foregroundHex verilmediyse bu arka plan için önerilen metin rengi. */
  recommendedTextColor: "#000000" | "#ffffff";
}

// foregroundHex verilmezse: "bu arka plan rengi EN İYİ ihtimalde (siyah
// veya beyaz metinle) okunabilir mi" sorusuna cevap verir. Verilirse: o
// spesifik önplan/arkaplan çiftinin oranını döner (ör. kullanıcı elle bir
// metin rengi seçtiyse).
export function checkContrastWarning(
  backgroundHex: string,
  foregroundHex?: string,
  threshold = 4.5
): ContrastCheckResult {
  const recommendedTextColor = pickReadableTextColor(backgroundHex);
  const ratio = getContrastRatio(backgroundHex, foregroundHex ?? recommendedTextColor);
  return { ratio, passes: ratio >= threshold, recommendedTextColor };
}
