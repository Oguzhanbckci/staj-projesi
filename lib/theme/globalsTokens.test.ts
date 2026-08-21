import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getContrastRatio } from "@/lib/theme/contrast";

// `app/globals.css`'teki tema token'larının WCAG eşiklerini KORUDUĞUNU
// doğrulayan değişmez (invariant) testi. Bir token'ın değeri elle
// değiştirildiğinde kontrast sessizce düşebiliyor — 2026-08-21 denetiminde
// tam olarak bu oldu: 2026-08-18'de `--color-neutral-300` sınır rolüne
// alınırken koyu tema karşılığı hiç hesaplanmamıştı ve projedeki HER form
// alanının kenarı 1.22-1.46:1'e düşmüştü (WCAG 2.2 SC 1.4.11 eşiği 3:1).
//
// Test CSS'i kaynaktan okuyup değerleri kendisi çıkarır; yani token'ı
// değiştiren kişi ayrıca bir yeri güncellemek zorunda değil, sadece
// eşiği bozarsa kırmızı döner.

const CSS = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

/**
 * Bir token'ın açık (`:root`) ve koyu (`[data-theme="dark"]`) değerlerini
 * okur. Aynı token bir blokta birden fazla kez tanımlıysa SONUNCU kazanır
 * (CSS cascade) — `--color-neutral-300` gerçekten böyle: bir kez ham nötr
 * skalada, bir kez de sınır rolünde tanımlanıyor.
 */
function tokenDegerleri(ad: string): { acik: string; koyu: string } {
  // Çapa olarak SEÇİCİNİN TAMAMI aranıyor (sondaki `{` dahil): dosyanın
  // başındaki açıklama bloğu da `[data-theme="dark"]` ifadesini metin
  // olarak geçiriyor ve kısa arama oraya takılıp açık tema bölümünü
  // 7 satıra indiriyordu (bu test yazılırken gerçekten yaşandı).
  const koyuBaslangic = CSS.indexOf('[data-theme="dark"] {');
  expect(koyuBaslangic).toBeGreaterThan(-1);

  const bul = (metin: string) => {
    const eslesmeler = [...metin.matchAll(new RegExp(`--${ad}:\\s*(#[0-9a-fA-F]{6})`, "g"))];
    return eslesmeler.length ? eslesmeler[eslesmeler.length - 1]![1]! : null;
  };

  const acik = bul(CSS.slice(0, koyuBaslangic));
  const koyu = bul(CSS.slice(koyuBaslangic));
  expect(acik, `${ad} açık temada bulunamadı`).toBeTruthy();
  expect(koyu, `${ad} koyu temada bulunamadı`).toBeTruthy();
  return { acik: acik!, koyu: koyu! };
}

describe("globals.css tema token'ları", () => {
  it("kontrol kenarlığı (--color-control) iki temada da her iki yüzeye karşı 3:1'i geçer", () => {
    const kontrol = tokenDegerleri("color-control");
    const surface = tokenDegerleri("color-surface");
    const raised = tokenDegerleri("color-surface-raised");

    // WCAG 2.2 SC 1.4.11 (Non-text Contrast): form alanı/buton sınırı için 3:1.
    // Kenarlık HEM alanın kendi dolgusuna HEM sayfa zeminine karşı ayrışmalı.
    for (const tema of ["acik", "koyu"] as const) {
      expect(
        getContrastRatio(kontrol[tema], raised[tema]),
        `${tema}: --color-control / --color-surface-raised`
      ).toBeGreaterThanOrEqual(3);
      expect(
        getContrastRatio(kontrol[tema], surface[tema]),
        `${tema}: --color-control / --color-surface`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it("gövde metni (--color-text) zemine karşı AA eşiğini (4.5:1) geçer", () => {
    const text = tokenDegerleri("color-text");
    const surface = tokenDegerleri("color-surface");
    const raised = tokenDegerleri("color-surface-raised");

    for (const tema of ["acik", "koyu"] as const) {
      expect(getContrastRatio(text[tema], surface[tema]), `${tema}: metin / surface`).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(text[tema], raised[tema]), `${tema}: metin / surface-raised`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("soluk metin (--color-text-muted) zemine karşı AA eşiğini geçer", () => {
    const muted = tokenDegerleri("color-text-muted");
    const surface = tokenDegerleri("color-surface");

    for (const tema of ["acik", "koyu"] as const) {
      expect(
        getContrastRatio(muted[tema], surface[tema]),
        `${tema}: soluk metin / surface`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("dekoratif ayraç (--color-neutral-300) BİLEREK düşük kontrastlıdır — kontrol kenarlığıyla karıştırılmamalı", () => {
    // Bu bir eşik değil, bir NİYET testi: ayraç çizgilerinin sessiz kalması
    // 2026-08-21 tasarım kararıydı (bkz. SectionHeader `rule` prop'u).
    // Biri bu token'ı "kontrastı düzeltiyorum" diye yükseltirse bölüm
    // ayraçları tasarımın istediğinden baskın hale gelir; o durumda doğru
    // hamle --color-control kullanmaktır, bu token'ı değiştirmek değil.
    const ayrac = tokenDegerleri("color-neutral-300");
    const surface = tokenDegerleri("color-surface");

    for (const tema of ["acik", "koyu"] as const) {
      expect(getContrastRatio(ayrac[tema], surface[tema]), `${tema}: ayraç / surface`).toBeLessThan(3);
    }
  });
});
