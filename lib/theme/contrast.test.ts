import { describe, it, expect } from "vitest";
import {
  getRelativeLuminance,
  getContrastRatio,
  pickReadableTextColor,
  checkContrastWarning,
} from "./contrast";

describe("getRelativeLuminance", () => {
  it("saf beyaz için 1'e, saf siyah için 0'a çok yakın değer döner", () => {
    expect(getRelativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(getRelativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("geçersiz hex girdisinde hata fırlatır (uzunluk/karakter hatalı)", () => {
    expect(() => getRelativeLuminance("not-a-color")).toThrow();
    expect(() => getRelativeLuminance("#123")).toThrow();
  });
});

describe("getContrastRatio", () => {
  it("saf siyah/beyaz arasında WCAG'in bilinen maksimum oranı 21:1'i döner", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("argüman sırası sonucu değiştirmez (fonksiyon kendi sıralıyor)", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(
      getContrastRatio("#ffffff", "#000000"),
      10
    );
  });

  it("bir rengin kendisiyle oranı 1'dir", () => {
    expect(getContrastRatio("#2561c1", "#2561c1")).toBeCloseTo(1, 5);
  });
});

describe("pickReadableTextColor", () => {
  it("koyu bir arka plan için beyaz metin önerir", () => {
    expect(pickReadableTextColor("#000000")).toBe("#ffffff");
  });

  it("açık bir arka plan için siyah metin önerir", () => {
    expect(pickReadableTextColor("#ffffff")).toBe("#000000");
  });

  // Regresyon testi: eski (kaldırılmış) `pickReadableOnColor` bu renk için
  // yanlışlıkla beyaz öneriyordu (bkz. docs/KARAR-GUNLUGU.md, 2026-08-15).
  // Gerçek oranlar: siyahla 5.32:1, beyazla 3.95:1 — siyah kazanır.
  it("orta gri (#808080) için siyahı önerir (geçmişte bulunan gerçek hata)", () => {
    expect(pickReadableTextColor("#808080")).toBe("#000000");
  });
});

describe("checkContrastWarning", () => {
  it("WCAG AA eşiğinin (4.5:1) altındaki bir çifti passes:false işaretler", () => {
    const result = checkContrastWarning("#808080", "#767676");
    expect(result.passes).toBe(false);
  });

  it("siyah/beyaz her zaman varsayılan eşiği geçer", () => {
    const result = checkContrastWarning("#000000", "#ffffff");
    expect(result.passes).toBe(true);
    expect(result.ratio).toBeCloseTo(21, 5);
  });

  it("orta gri arka plan için doğru oranı (5.32:1) ve önerilen rengi döner", () => {
    const result = checkContrastWarning("#808080");
    expect(result.recommendedTextColor).toBe("#000000");
    expect(result.ratio).toBeCloseTo(5.32, 1);
  });

  it("foregroundHex verilmezse recommendedTextColor'ı önplan olarak kullanır", () => {
    const result = checkContrastWarning("#ffffff");
    expect(result.recommendedTextColor).toBe("#000000");
  });
});
